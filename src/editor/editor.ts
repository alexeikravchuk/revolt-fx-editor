import * as PIXI from 'pixi.js'
import { Layers } from './layers.ts'
import {
  EVENT_EMITTER_AUTO_ROTATION_CHANGED,
  EVENT_EMITTER_CHILDS_CHANGED,
  EVENT_EMITTER_CORE_CHANGED,
  EVENT_EMITTER_CORE_PARAMS_CHANGED,
  EVENT_EMITTER_DURATION_CHANGED,
  EVENT_EMITTER_INFINITE_CHANGED,
  EVENT_EMITTER_PRESET_REMOVED,
  EVENT_EMITTER_PRESET_SELECTED,
  EVENT_EMITTER_ROTATION_CHANGED,
  EVENT_RESET,
  EVENT_SEQUENCE_PRESET_SELECTED,
} from '../events.ts'
import { Gizmos, CircleGizmo, RingGizmo, BoxGizmo } from './gizmos.ts'
import JSZip from 'jszip'
import saveAs from 'save-as'
import { SET_BUNDLE } from '../store.ts'
import md5 from 'js-md5'
import { readAsText, readAsDataURL } from 'promise-file-reader'
import { FX, BundleDefinition, EmitterPreset, SequencePreset, ParticleEmitter, EffectSequence } from 'revolt-fx'

interface ImageDef {
  name: string
  image: HTMLImageElement
}

interface BlendMode {
  value: number
  name: string
}

export class Editor {
  static fx: FX
  static instance: Editor

  app: PIXI.Application
  vue: any
  layers: Layers
  width: number
  height: number
  spritesCount: number
  movieClipsCount: number
  emitterPreset: EmitterPreset | null
  sequencePreset: SequencePreset | null
  emitter: ParticleEmitter | null
  sequence: EffectSequence | null
  emitterGizmo: CircleGizmo | RingGizmo | BoxGizmo | null
  bundleHash: string
  instructionText: PIXI.Text
  blendModes: BlendMode[]
  spritesheetImagesList: ImageDef[]
  spritesheetImagesMap: Record<string, ImageDef>
  moveClipImagesList: ImageDef[]
  moveClipImagesMap: Record<string, ImageDef>
  defaultMovieClip: ImageDef | null
  defaultSprite: ImageDef | null

  private _lastPointerX: number
  private _lastPointerY: number

  constructor(app: PIXI.Application, vue: any) {
    Editor.instance = this

    this.app = app
    this.vue = vue
    this.layers = new Layers()

    this.width = 0
    this.height = 0

    this.spritesCount = 0
    this.movieClipsCount = 0

    this.emitterPreset = null
    this.sequencePreset = null

    this.emitter = null
    this.sequence = null

    this.emitterGizmo = null

    this.spritesheetImagesList = []
    this.spritesheetImagesMap = {}
    this.moveClipImagesList = []
    this.moveClipImagesMap = {}
    this.defaultMovieClip = null
    this.defaultSprite = null

    app.stage.addChild(this.layers as any)

    this.bundleHash = md5('revolt-fx-bundle')

    this._lastPointerX = -10000
    this._lastPointerY = -10000

    const g = new PIXI.Graphics()
    this.layers.addChild(g)

    this.vue.$fx.$debug = g

    this.blendModes = [
      { value: 0, name: 'Normal' },
      { value: 1, name: 'Add' },
      { value: 2, name: 'Multiply' },
      { value: 3, name: 'Screen' },
    ]

    const infoText = new PIXI.Text('', {
      fontFamily: 'Helvetica Neue',
      fontWeight: '200',
      fontSize: 13,
      fill: 0x999999,
    })
    this.instructionText = new PIXI.Text('', {
      fontFamily: 'Helvetica Neue',
      fontWeight: '200',
      fontSize: 18,
      fill: 0x999999,
    })
    this.instructionText.anchor.set(1, 0)

    infoText.x = infoText.y = 10
    this.instructionText.y = 10

    this.layers.infoLayer.addChild(infoText)
    this.layers.infoLayer.addChild(this.instructionText)

    this.layers.backgroundLayer.on('pointerdown', (e: PIXI.interaction.InteractionEvent) => {
      g.clear()

      const x = e.data.global.x
      const y = e.data.global.y

      if (this.emitterPreset) {
        let emitter: ParticleEmitter
        if (this.emitterPreset.infinite) {
          if (!this.emitter) {
            this.emitter = this.createEmitter()
          }
          this.layers.backgroundLayer.on('pointermove', pointerMove)
          emitter = this.emitter
        } else {
          emitter = this.createEmitter()
        }
        this._lastPointerX = this.emitterGizmo!.x = emitter.x = x
        this._lastPointerY = this.emitterGizmo!.y = emitter.y = y
      } else if (this.sequencePreset) {
        const sequence = (this.sequence = this.createSequence())
        this._lastPointerX = sequence.x = x
        this._lastPointerY = sequence.y = y
      }
      this.layers.clickGizmo.x = x
      this.layers.clickGizmo.y = y
      this.layers.clickGizmo.show()
    })

    this.layers.backgroundLayer.on('pointerup', () => {
      this.layers.backgroundLayer.off('pointermove', pointerMove)
    })

    const pointerMove = (e: PIXI.interaction.InteractionEvent) => {
      this._lastPointerX = this.emitterGizmo!.x = this.emitter!.x = e.data.global.x
      this._lastPointerY = this.emitterGizmo!.y = this.emitter!.y = e.data.global.y
    }

    const eventBus = vue.$eventBus

    eventBus.$on(EVENT_EMITTER_PRESET_SELECTED, (preset: EmitterPreset) => this.onEmitterPresetChanged(preset))
    eventBus.$on(EVENT_EMITTER_PRESET_REMOVED, (preset: EmitterPreset) => this.onEmitterPresetRemoved(preset))
    eventBus.$on(EVENT_EMITTER_DURATION_CHANGED, () => this.onEmitterDurationChanged())
    eventBus.$on(EVENT_EMITTER_INFINITE_CHANGED, (value: boolean) => this.onEmitterInfiniteValueChanged(value))
    eventBus.$on(EVENT_EMITTER_CORE_CHANGED, (value: string) => this.onEmitterCoreChanged(value))
    eventBus.$on(EVENT_EMITTER_CORE_PARAMS_CHANGED, () => this.onEmitterCoreParamsChanged())
    eventBus.$on(EVENT_EMITTER_ROTATION_CHANGED, (value: number) => this.onEmitterRotationChanged(value))
    eventBus.$on(EVENT_EMITTER_AUTO_ROTATION_CHANGED, (value: number) => this.onEmitterAutoRotationChanged(value))
    eventBus.$on(EVENT_EMITTER_CHILDS_CHANGED, () => this.onEmitterChildsChanged())

    eventBus.$on(EVENT_SEQUENCE_PRESET_SELECTED, (value: SequencePreset) => this.onSequencePresetChanged(value))

    eventBus.$on(EVENT_RESET, () => this.onReset())

    const fx = this.vue.$fx
    app.ticker.add(() => {
      fx.update()
      if (this.emitterGizmo && this.emitter) {
        this.emitterGizmo.rotation = this.emitter.rotation
      }
      let txt = `Active: Particles(${fx.particleCount}) Emitter(${fx.emitterCount}) Sequences(${fx.effectSequenceCount})\n`
      txt += `Cache: Particles(${fx._cache.particles.length}) Emitters(${fx._cache.emitters.length}) Sequences(${fx._cache.effectSequences.length})`
      infoText.text = txt
    })
  }

  createSequence(): EffectSequence {
    const sequence = this.vue.$fx.getEffectSequenceById(this.sequencePreset!.id, true)
    sequence.init(this.layers.contentLayer1, 0)
    return sequence
  }

  createEmitter(): ParticleEmitter {
    const emitter = this.vue.$fx.getParticleEmitterById(this.emitterPreset!.id, true)
    emitter.init(this.layers.contentLayer1, true)
    return emitter
  }

  createEmitterGizmo(): CircleGizmo | RingGizmo | BoxGizmo {
    if (this.emitterGizmo) {
      this.emitterGizmo.parent.removeChild(this.emitterGizmo)
    }
    let gizmo: CircleGizmo | RingGizmo | BoxGizmo
    const d = this.emitterPreset!.core
    switch (d.type) {
      case 'circle':
        gizmo = Gizmos.getCircleGizmo()
        break

      case 'ring':
        gizmo = Gizmos.getRingGizmo()
        break

      case 'box':
        gizmo = Gizmos.getBoxGizmo()
        break

      default:
        gizmo = Gizmos.getCircleGizmo()
    }
    gizmo.rotation = this.emitterPreset!.rotation
    this.layers.gizmoLayer.addChild(gizmo as any)
    return gizmo
  }

  async initBundle(bundleDef: BundleDefinition, spritesheetImageData: string, spritesheetDef: any): Promise<void> {
    this.vue.$eventBus.$emit(EVENT_RESET)

    PIXI.loader.reset()
    PIXI.utils.clearTextureCache()

    this.vue.$fx.dispose()
    this.vue.$fx.initBundle(bundleDef)

    await this.createSpritesheet(spritesheetImageData, spritesheetDef, bundleDef.spritesheetFilter)

    this.vue.$store.commit(SET_BUNDLE, bundleDef)

    this.vue.$eventBus.$emit(EVENT_EMITTER_PRESET_SELECTED, null)
  }

  loadLocalZipBundle(file: File): void {
    const loader = this.vue.$loading({ fullscreen: true, background: 'white', text: 'RevoltFX' })
    const zip = new JSZip()

    const list: any[] = []
    let count = 0
    let spritesheetImageData: string
    let bundleDef: BundleDefinition
    let spritesheetDef: any

    const done = async () => {
      await this.initBundle(bundleDef, spritesheetImageData, spritesheetDef)
      loader.close()
    }

    const loadImage = (entry: any) => {
      entry
        .async('base64')
        .then(
          (base64: string) => {
            spritesheetImageData = `data:image/png;base64,${base64}`
            this.vue.$store.state.spritesheet.imageName = entry.name
            if (--count === 0) {
              done()
            }
          },
          () => {
            this.showError('Invalid PNG.')
            loader.close()
          }
        )
    }

    const loadJson = (entry: any) => {
      entry
        .async('string')
        .then(
          (s: string) => {
            try {
              const def = JSON.parse(s)
              if (def.__h) {
                bundleDef = def
                if (def.__h !== this.bundleHash) {
                  throw new Error()
                }
              } else {
                spritesheetDef = def
                this.vue.$store.state.spritesheet.jsonName = entry.name
              }
              if (--count === 0) {
                done()
              }
            } catch (e) {
              this.showError('Invalid JSON.')
              loader.close()
            }
          },
          () => {
            this.showError('Invalid JSON.')
            loader.close()
          }
        )
    }

    zip.loadAsync(file).then(
      (zip) => {
        zip.forEach((_path, entry) => {
          list.push(entry)
          count++
        })

        if (count !== 3) {
          this.showError('Invalid content in ZIP file.')
          loader.close()
          return
        }

        for (const n in list) {
          const entry = list[n]

          if (entry.name.indexOf('.png') !== -1) {
            loadImage(entry)
          } else if (entry.name.indexOf('.json') !== -1) {
            loadJson(entry)
          }
        }
      },
      (err) => {
        this.showError('Something went wrong!')
        console.log(err)
      }
    )
  }

  showError(message: string): void {
    this.vue.$notify.error({
      title: 'Oops',
      message: message,
    })
  }

  saveBundleLocal(name: string, includeSpritesheet: boolean): void {
    if (name === '') {
      name = 'New Bundle'
    }

    const state = this.vue.$store.state
    const bundle = JSON.parse(JSON.stringify(state.bundle))
    bundle.name = name

    if (includeSpritesheet) {
      const loader = this.vue.$loading({ fullscreen: true, background: 'white', text: 'RevoltFX' })

      const zip = new JSZip()
      zip.file(`${name}.json`, JSON.stringify(bundle))

      zip.file(state.spritesheet.jsonName, JSON.stringify(state.spritesheet.json))

      const sprite = new PIXI.Sprite(state.spritesheet.image)
      const base64Data = this.app.renderer.plugins.extract
        .base64(sprite)
        .replace(/^data:image\/(png|jpg);base64,/, '')
      zip.file(state.spritesheet.imageName, base64Data, { base64: true })

      zip
        .generateAsync({
          type: 'blob',
          compression: 'DEFLATE',
          compressionOptions: {
            level: 6,
          },
        })
        .then((content: Blob) => {
          saveAs(content, `${name}.zip`)
          loader.close()
        })
        .catch(() => {
          this.showError('Something went wrong!')
        })
    } else {
      this.saveJsonLocal(name, bundle)
    }
  }

  saveJsonLocal(name: string, obj: any): void {
    saveAs(new Blob([JSON.stringify(obj)], { type: 'application/json' }), `${name}.json`)
  }

  loadDefaultBundle(): Promise<void> {
    return new Promise(async (resolve, _reject) => {
      await this.loadSpriteSheetRemote('/revoltfx-spritesheet.json', 'fx-')

      PIXI.loader.reset()
      PIXI.loader.add('def', '/default-bundle.json').load((_l: any, resources: any) => {
        this.vue.$store.commit(SET_BUNDLE, resources.def.data)
        this.vue.$fx.initBundle(resources.def.data, true)
        resolve()
      })
    })
  }

  loadSpriteSheetRemote(url: string, spritesheetFilter: string): Promise<void> {
    return new Promise((resolve, _reject) => {
      const loader = this.vue.$loading({ fullscreen: true, background: 'white', text: 'RevoltFX' })

      PIXI.loader.reset()
      PIXI.utils.clearTextureCache()

      this.vue.$fx.dispose()

      PIXI.loader.add('sheet', url).load((_l: any, resources: any) => {
        loader.close()

        this.vue.$store.state.spritesheet.jsonName = resources.sheet.url.split('/').pop()
        this.vue.$store.state.spritesheet.json = resources.sheet.data
        this.vue.$store.state.spritesheet.imageName = resources.sheet_image.url.split('/').pop()
        this.vue.$store.state.spritesheet.image = resources.sheet_image.texture

        this.createSpriteSheetImagesMap(resources.sheet.spritesheet, spritesheetFilter)
        resolve()
      })
    })
  }

  async loadSpritesheetLocal(jsonFile: File, imageFile: File): Promise<{ json: any; image: string }> {
    return new Promise(async (resolve, _reject) => {
      PIXI.loader.reset()
      PIXI.utils.clearTextureCache()
      this.vue.$fx.dispose()

      try {
        const def = JSON.parse(await readAsText(jsonFile))
        const src = await readAsDataURL(imageFile)
        resolve({ json: def, image: src })
      } catch (e) {
        _reject(e)
      }
    })
  }

  createSpritesheet(image: string, def: any, spritesheetFilter: string): Promise<void> {
    return new Promise((resolve, _reject) => {
      PIXI.utils.destroyTextureCache()

      const texture = PIXI.Texture.from(image)
      const spriteSheet = new PIXI.Spritesheet(texture.baseTexture, def)

      this.vue.$store.state.spritesheet.json = def
      this.vue.$store.state.spritesheet.image = texture

      spriteSheet.parse(() => {
        setTimeout(() => {
          this.createSpriteSheetImagesMap(spriteSheet, spritesheetFilter)
          resolve()
        }, 0)
      })
    })
  }

  createSpriteSheetImagesMap(sheet: PIXI.Spritesheet, spritesheetFilter: string): void {
    const result = this.vue.$fx.parseSpriteSheet(sheet, spritesheetFilter)

    this.spritesheetImagesList = []
    this.spritesheetImagesMap = {}
    this.moveClipImagesList = []
    this.moveClipImagesMap = {}

    this.defaultMovieClip = null
    this.defaultSprite = null

    const sprites = result.sprites
    for (const f in sprites) {
      const spriteName = sprites[f]

      const spr = PIXI.Sprite.fromFrame(spriteName) as any
      if (!spr?.texture?.baseTexture?.source) {
        console.warn('Skipping sprite with invalid texture:', spriteName)
        continue
      }

      const frame = spr.texture.frame
      const source = spr.texture.baseTexture.source
      if (!frame || !source) continue

      const canvas = document.createElement('canvas')
      canvas.width = frame.width
      canvas.height = frame.height
      const ctx = canvas.getContext('2d')
      if (!ctx) continue

      try {
        ctx.drawImage(
          source as CanvasImageSource,
          frame.x, frame.y, frame.width, frame.height,
          0, 0, frame.width, frame.height
        )
      } catch (err) {
        console.warn('Failed to draw sprite frame:', spriteName, err)
        continue
      }

      const img = new Image()
      img.src = canvas.toDataURL('image/png')

      const def: ImageDef = { name: spriteName, image: img }
      if (this.defaultSprite === null) this.defaultSprite = def
      this.spritesheetImagesList.push(def)
      this.spritesheetImagesMap[def.name] = def
    }

    const mcs = this.vue.$fx.getMovieClips()
    for (const i in mcs) {
      const mc = mcs[i]
      const textureKey = mc.textures[Math.floor(mc.textures.length * 0.5)]
      const sprite = this.spritesheetImagesMap[textureKey]
      if (!sprite) continue
      const def: ImageDef = { name: i, image: sprite.image }
      if (this.defaultMovieClip === null) this.defaultMovieClip = def
      this.moveClipImagesList.push(def)
      this.moveClipImagesMap[def.name] = def
    }

    if (this.defaultSprite === null && this.spritesheetImagesList.length > 0) {
      this.defaultSprite = this.spritesheetImagesList[0]
    }
    if (this.defaultMovieClip === null && this.moveClipImagesList.length > 0) {
      this.defaultMovieClip = this.moveClipImagesList[0]
    }

    this.movieClipsCount = result.movieClips.length
    this.spritesCount = result.sprites.length
  }

  createEmitterSettings(bundleDef: BundleDefinition): void {
    for (const n in bundleDef.emitters) {
      const preset = bundleDef.emitters[n]
      this.vue.$fx.addParticleEmitter(preset.id, preset)
    }
  }

  getSpriteImageDef(name: string): ImageDef | null {
    const def = this.spritesheetImagesMap[name]
    if (def) {
      return def
    }
    return null
  }

  getMovieclipImageDef(name: string): ImageDef | null {
    const def = this.moveClipImagesMap[name]
    if (def) {
      return def
    }
    return null
  }

  setContainer(type: number, blendMode: number): void {
    this.vue.$eventBus.$emit(EVENT_EMITTER_PRESET_SELECTED, null)
    this.vue.$eventBus.$emit(EVENT_RESET)
    this.layers.setContentLayer(type, blendMode)
  }

  resize(w: number, h: number): void {
    this.width = w
    this.height = h
    this.layers.resize(w, h)
    this.instructionText.x = w - 10
  }

  removeEmitter(): void {
    if (this.emitter) {
      this.emitter.stop()
      this.emitter = null
    }
  }

  removeEmitterGizmo(): void {
    if (this.emitterGizmo) {
      this.emitterGizmo.parent.removeChild(this.emitterGizmo)
      this.emitterGizmo = null
    }
  }

  removeSequence(): void {
    if (this.sequence) {
      this.sequence.stop()
      this.sequence = null
    }
  }

  getEmitterById(id: number): EmitterPreset | null {
    const list = this.vue.$store.state.bundle.emitters
    for (const n in list) {
      const e = list[n]
      if (e.id === id) return e
    }
    return null
  }

  getSequenceById(id: number): SequencePreset | null {
    const list = this.vue.$store.state.bundle.sequences
    for (const n in list) {
      const e = list[n]
      if (e.id === id) return e
    }
    return null
  }

  getEmittersUsingComponent(componentPreset: EmitterPreset | SequencePreset): EmitterPreset[] {
    const ret: EmitterPreset[] = []
    const myId = componentPreset.id
    const type = componentPreset.type
    let emitter: EmitterPreset

    const checkList = (list: any[]) => {
      for (const i in list) {
        const spawn = list[i]
        if (spawn.id === myId && spawn.type === type) {
          if (ret.indexOf(emitter) === -1) ret.push(emitter)
        }
      }
    }

    const emitters = this.vue.$store.state.bundle.emitters
    for (const n in emitters) {
      emitter = emitters[n]
      checkList(emitter.childs)
      checkList(emitter.particleSettings.spawn.onComplete)
      checkList(emitter.particleSettings.spawn.onBounce)
      checkList(emitter.particleSettings.spawn.onStart)
      checkList(emitter.particleSettings.childs)
    }
    return ret
  }

  deleteComponentFromEmitters(
    componentPreset: EmitterPreset | SequencePreset,
    emitters?: EmitterPreset[]
  ): void {
    emitters = emitters || this.getEmittersUsingComponent(componentPreset)
    const myId = componentPreset.id
    const type = componentPreset.type
    let emitter: EmitterPreset

    const removeEmitter = (list: any[]) => {
      for (let i = 0; i < list.length; i++) {
        const spawn = list[i]
        if (spawn.id === myId && spawn.type === type) {
          list.splice(i, 1)
        }
      }
    }

    for (const n in emitters) {
      emitter = emitters[n]
      removeEmitter(emitter.childs)
      removeEmitter(emitter.particleSettings.spawn.onComplete)
      removeEmitter(emitter.particleSettings.spawn.onBounce)
      removeEmitter(emitter.particleSettings.spawn.onStart)
      removeEmitter(emitter.particleSettings.childs)
    }
  }

  // Events
  onEmitterDurationChanged(): void {
    if (!this.emitter || !this.emitterGizmo) return
    const x = this.emitter.x
    const y = this.emitter.y
    const rotation = this.emitter.rotation
    this.removeEmitter()
    this.emitter = this.createEmitter()
    this.emitter.x = x
    this.emitter.y = y
    this.emitter.rotation = rotation
  }

  onEmitterInfiniteValueChanged(_value: boolean): void {
    if (this.emitter) {
      this.removeEmitter()
    }
    return

    // Commented out - unreachable code after return
    // if (value) {
    //   this.emitter = this.createEmitter()
    //   this.emitter.x = this.emitterGizmo!.x
    //   this.emitter.y = this.emitterGizmo!.y
    //   this.emitter.rotation = this.emitterGizmo!.rotation
    // }
  }

  onEmitterChildsChanged(): void {
    if (this.emitter) {
      this.removeEmitter()
    }
    return

    // Commented out - unreachable code after return
    // this.emitter = this.createEmitter()
    // this.emitter.x = this.emitterGizmo!.x
    // this.emitter.y = this.emitterGizmo!.y
    // this.emitter.rotation = this.emitterGizmo!.rotation
  }

  onEmitterCoreChanged(coreType: string): void {
    if (this.emitter) {
      this.emitter.__setCore(coreType)
    }
    if (this.emitterGizmo) {
      this.emitterGizmo = this.createEmitterGizmo()
      this.emitterGizmo.redraw(this.emitterPreset!.core.params as any)
      this.emitterGizmo.x = this._lastPointerX
      this.emitterGizmo.y = this._lastPointerY
    }
  }

  onEmitterRotationChanged(value: number): void {
    if (this.emitter) {
      this.emitter.rotation = value
    }
    if (this.emitterGizmo) {
      this.emitterGizmo.rotation = value
    }
  }

  onEmitterAutoRotationChanged(value: number): void {
    if (value === 0) {
      if (this.emitter) {
        this.emitter.rotation = this.emitterPreset!.rotation
      }
      if (this.emitterGizmo) {
        this.emitterGizmo.rotation = this.emitterPreset!.rotation
      }
    }
  }

  onEmitterCoreParamsChanged(): void {
    if (this.emitterPreset && this.emitterGizmo) {
      const params = this.emitterPreset.core.params
      const gizmo = this.emitterGizmo
      gizmo.redraw(params as any)
    }
  }

  onEmitterPresetChanged(preset: EmitterPreset | null): void {
    this.removeSequence()

    this.emitterPreset = preset

    if (preset) {
      this.removeEmitter()

      this.emitterGizmo = this.createEmitterGizmo()
      this.emitterGizmo.x = -1000
      this.emitterGizmo.y = -1000
      this.emitterGizmo.redraw(preset.core.params as any)

      this.layers.floorGizmo.visible = preset.useFloor && preset.useGravity && preset.floorY > 0
      this.layers.floorGizmo.y = preset.floorY

      this.instructionText.text = preset.infinite ? 'Click and drag' : 'Click to add emitter'
    } else {
      this.removeEmitter()
      this.removeEmitterGizmo()
      this.instructionText.text = ''
    }
  }

  onEmitterPresetRemoved(preset: EmitterPreset): void {
    if (this.emitterPreset === preset) {
      this.removeEmitter()
      this.removeEmitterGizmo()
      this.emitterPreset = null
    }
  }

  onSequencePresetChanged(preset: SequencePreset | null): void {
    this.removeEmitter()
    this.removeEmitterGizmo()
    this.removeSequence()

    this.sequencePreset = preset

    this.instructionText.text = preset ? 'Click to add sequence' : ''
  }

  onReset(): void {
    this.removeEmitter()
    this.removeEmitterGizmo()
    this.emitterPreset = null

    this.removeSequence()
    this.sequencePreset = null
  }
}
