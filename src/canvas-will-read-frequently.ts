if (typeof window !== 'undefined') {
  const origGetContext = HTMLCanvasElement.prototype.getContext as any
  const newGetContext = function (this: HTMLCanvasElement, type: string, attributes?: any) {
    if (type === '2d') {
      attributes = Object.assign({}, attributes, { willReadFrequently: true })
    }
    return origGetContext.call(this, type, attributes)
  }
  HTMLCanvasElement.prototype.getContext = newGetContext as any
}
