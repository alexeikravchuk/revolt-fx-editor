import * as PIXI from 'pixi.js'
import { ClickGizmo, Gizmos } from './gizmos.ts'

export class Layers extends (PIXI.Container as any) {
  gizmoLayer: PIXI.Container
  backgroundLayer: PIXI.Container
  contentLayer0: PIXI.Container
  standardContainer: PIXI.Container
  particleContainer: PIXI.particles.ParticleContainer
  contentLayer1: PIXI.Container
  contentLayer2: PIXI.Container
  originLayer: PIXI.Container
  infoLayer: PIXI.Container
  clickGizmo: ClickGizmo
  floorGizmoLayer: PIXI.Container
  floorGizmo: PIXI.Graphics
  backgroundSolid: PIXI.Graphics

  constructor() {
    super()

    this.gizmoLayer = new PIXI.Container()
    this.backgroundLayer = new PIXI.Container()
    this.contentLayer0 = new PIXI.Container()

    this.standardContainer = new PIXI.Container()
    this.particleContainer = new PIXI.particles.ParticleContainer()

    this.contentLayer1 = this.standardContainer
    this.contentLayer1.blendMode = PIXI.BLEND_MODES.NORMAL

    this.contentLayer2 = new PIXI.Container()
    this.originLayer = new PIXI.Container()
    this.infoLayer = new PIXI.Container()

    this.clickGizmo = new ClickGizmo()

    this.addChild(this.backgroundLayer)
    this.addChild(this.infoLayer)
    this.addChild(this.originLayer)
    this.addChild(this.contentLayer0)
    this.addChild(this.standardContainer)
    this.addChild(this.particleContainer)
    this.addChild(this.contentLayer2)
    this.addChild(this.gizmoLayer)

    this.floorGizmoLayer = new PIXI.Container()
    this.floorGizmo = Gizmos.getFloorGizmo() as any

    this.floorGizmoLayer.addChild(this.floorGizmo)
    this.gizmoLayer.addChild(this.floorGizmoLayer)

    this.floorGizmo.visible = false

    this.backgroundLayer.interactive = true
    this.gizmoLayer.addChild(this.clickGizmo as any)

    const g = this.backgroundSolid = new PIXI.Graphics()
    g.beginFill(0xffffff, 1).drawRect(0, 0, 100, 100).endFill()

    this.backgroundLayer.addChild(g)

    this.setBackgroundColor(0x333333)
  }

  setContentLayer(type: number, blendMode: number): void {
    switch (type) {
      case 0:
        this.contentLayer1 = this.standardContainer
        break
      case 1:
        this.contentLayer1 = this.particleContainer
        break
    }
    this.contentLayer1.blendMode = blendMode
  }

  setBackgroundColor(color: number): void {
    this.backgroundSolid.tint = color
  }

  resize(width: number, height: number): void {
    console.log('resize', width, height)
    this.backgroundSolid.width = width
    this.backgroundSolid.height = height
  }
}
