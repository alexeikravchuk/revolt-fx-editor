if (typeof window !== 'undefined') {
  const origGetContext = HTMLCanvasElement.prototype.getContext
  HTMLCanvasElement.prototype.getContext = function (type, attributes) {
    if (type === '2d') {
      attributes = Object.assign({}, attributes, { willReadFrequently: true })
    }
    return origGetContext.call(this, type, attributes)
  }
}
