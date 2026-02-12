declare module 'revolt-fx' {
  import * as PIXI from 'pixi.js'

  export interface BundleDefinition {
    name: string
    id: string
    maxParticles: number
    useBlendModes: boolean
    emitters: EmitterPreset[]
    sequences: SequencePreset[]
    spritesheetFilter: string
    __eid: number
    __sid: number
    __h: string
    __v: number
  }

  export interface EmitterPreset {
    id: number
    name: string
    type: number
    core: {
      type: string
      params: Record<string, any>
    }
    spawnFrequencyMin: number
    spawnFrequencyMax: number
    maxParticles: number
    spawnCountMin: number
    spawnCountMax: number
    duration: number
    infinite: boolean
    useGravity: boolean
    gravity: number
    useFloor: boolean
    floorY: number
    rotation: number
    autoRotation: number
    particleSettings: ParticleSettings
    childs: any[]
  }

  export interface ParticleSettings {
    componentType: number
    componentId: string
    componentParams: Record<string, any>
    durationMin: number
    durationMax: number
    distanceMin: number
    distanceMax: number
    distanceEase: string
    moveSpeedMin: number
    moveSpeedMax: number
    bounceFacMin: number
    bounceFacMax: number
    frictionMin: number
    frictionMax: number
    useMotion: boolean
    useRotation: boolean
    useAlpha: boolean
    useScale: boolean
    useTint: boolean
    useChilds: boolean
    useSpawns: boolean
    stopOnBounce: boolean
    align: boolean
    blendMode: number
    addOnTop: boolean
    rotationSpeedMin: number
    rotationSpeedMax: number
    randomRotationDirection: boolean
    randomStartRotation: boolean
    fadeIn: boolean
    fadeInDurationFac: number
    fadeInEase: string
    alphaStartMin: number
    alphaStartMax: number
    alphaEndMin: number
    alphaEndMax: number
    alphaEase: string
    tintStart: number
    tintEnd: number
    tintEase: string
    scaleIn: boolean
    scaleInDurationFac: number
    scaleInEase: string
    uniformScale: boolean
    scaleXStartMin: number
    scaleXStartMax: number
    scaleXEndMin: number
    scaleXEndMax: number
    scaleXEase: string
    scaleYStartMin: number
    scaleYStartMax: number
    scaleYEndMin: number
    scaleYEndMax: number
    scaleYEase: string
    scaleStartMin: number
    scaleStartMax: number
    scaleEndMin: number
    scaleEndMax: number
    scaleEase: string
    childs: any[]
    spawn: {
      onComplete: any[]
      onBounce: any[]
      onStart: any[]
      onHalfway: any[]
    }
  }

  export interface SequencePreset {
    id: number
    name: string
    type: number
    delay: number
    scaleMin: number
    scaleMax: number
    effects: any[]
    __cid: number
  }

  export class FX {
    static settingsVersion: number
    particleCount: number
    emitterCount: number
    effectSequenceCount: number
    maxParticles: number
    useBlendModes: boolean
    _cache: {
      particles: any[]
      emitters: any[]
      effectSequences: any[]
    }
    $debug?: PIXI.Graphics

    constructor()
    initBundle(bundleDef: BundleDefinition, clone?: boolean): void
    addParticleEmitter(id: number, preset: EmitterPreset): void
    addEffectSequence(id: number, preset: SequencePreset): void
    getParticleEmitterById(id: number, cache?: boolean): ParticleEmitter
    getEffectSequenceById(id: number, cache?: boolean): EffectSequence
    parseSpriteSheet(sheet: PIXI.Spritesheet, filter: string): { sprites: string[]; movieClips: any[] }
    getMovieClips(): Record<string, any>
    update(): void
    dispose(): void
    stopAllEffects(): void
    setFloorY(y: number): void
  }

  export class ParticleEmitter extends PIXI.Container {
    x: number
    y: number
    rotation: number
    name?: string
    init(container: PIXI.Container, recycle?: boolean): void
    stop(): void
    __setCore(coreType: string): void
  }

  export class EffectSequence extends PIXI.Container {
    x: number
    y: number
    init(container: PIXI.Container, recycle: number): void
    stop(): void
  }
}
