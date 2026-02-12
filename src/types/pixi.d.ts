declare module 'pixi.js' {
  export class DisplayObject {
    x: number
    y: number
    rotation: number
    visible: boolean
    parent: Container
  }

  export class Container extends DisplayObject {
    children: DisplayObject[]
    interactive: boolean
    blendMode: number
    addChild<T extends DisplayObject>(child: T): T
    removeChild<T extends DisplayObject>(child: T): T
    on(event: string, fn: Function, context?: any): this
    off(event: string, fn?: Function, context?: any): this
  }

  export class Graphics extends Container {
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
  }

  export class Text extends DisplayObject {
    constructor(text: string, style?: any)
    text: string
    anchor: { set(x: number, y: number): void }
  }

  export class Sprite extends Container {
    constructor(texture?: Texture)
    static fromFrame(frameId: string): Sprite
    tint: number
  }

  export class Texture {
    baseTexture: BaseTexture
    static from(source: string | HTMLImageElement | HTMLCanvasElement): Texture
  }

  export class BaseTexture {
    // Base texture implementation
  }

  export class Spritesheet {
    constructor(baseTexture: BaseTexture, data: any)
    parse(callback: () => void): void
  }

  export namespace particles {
    export class ParticleContainer extends Container {}
  }

  export namespace interaction {
    export interface InteractionEvent {
      data: {
        global: { x: number; y: number }
      }
    }
  }

  export enum BLEND_MODES {
    NORMAL = 0,
    ADD = 1,
    MULTIPLY = 2,
    SCREEN = 3,
  }

  export interface Loader {
    add(name: string, url: string): Loader
    load(callback: (loader: Loader, resources: any) => void): Loader
    reset(): void
  }

  export interface LoaderResource {
    url: string
    data: any
    texture: Texture
    spritesheet: Spritesheet
  }

  export const loader: Loader

  export namespace utils {
    export function clearTextureCache(): void
    export function destroyTextureCache(): void
  }

  export class Application {
    stage: Container
    renderer: {
      plugins: {
        extract: {
          base64(target: DisplayObject, format?: string, quality?: number): string
          image(target: DisplayObject, format?: string, quality?: number): HTMLImageElement
        }
      }
    }
    ticker: {
      add(fn: () => void): void
    }
  }
}

declare global {
  interface Window {
    PIXI?: any
  }
}

export {}
