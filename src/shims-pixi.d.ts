// Shim for pixi.js v4.x.x which doesn't have official TypeScript types
declare module 'pixi.js' {
  export = PIXI
  export as namespace PIXI
}

declare namespace PIXI {
  const loader: any
  const utils: any
  const BLEND_MODES: any
  
  namespace particles {
    class ParticleContainer extends Container {}
  }
  
  namespace interaction {
    interface InteractionEvent {
      data: {
        global: { x: number; y: number }
      }
    }
  }

  class DisplayObject {
    x: number
    y: number
    rotation: number
    visible: boolean
    parent: Container
  }

  class Container extends DisplayObject {
    children: DisplayObject[]
    interactive: boolean
    blendMode: number
    addChild<T extends DisplayObject>(child: T): T
    removeChild<T extends DisplayObject>(child: T): T
    on(event: string, fn: Function, context?: any): this
    off(event: string, fn?: Function, context?: any): this
  }

  class Graphics extends Container {
    lineStyle(lineWidth: number, color: number, alpha?: number): Graphics
    beginFill(color: number, alpha?: number): Graphics
    endFill(): Graphics
    drawRect(x: number, y: number, width: number, height: number): Graphics
    drawCircle(x: number, y: number, radius: number): Graphics
    moveTo(x: number, y: number): Graphics
    lineTo(x: number, y: number): Graphics
    arc(cx: number, cy: number, radius: number, startAngle: number, endAngle: number, anticlockwise?: boolean): Graphics
    clear(): Graphics
    tint: number
    width: number
    height: number
  }

  class Text extends DisplayObject {
    constructor(text: string, style?: any)
    text: string
    anchor: { set(x: number, y: number): void }
  }

  class Sprite extends Container {
    constructor(texture?: any)
    static fromFrame(frameId: string): Sprite
    tint: number
  }

  class Texture {
    baseTexture: any
    static from(source: any): Texture
  }

  class Spritesheet {
    constructor(baseTexture: any, data: any)
    parse(callback: () => void): void
  }

  class Application {
    stage: Container
    renderer: any
    ticker: any
  }
}
