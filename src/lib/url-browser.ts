/**
 * Browser shim for Node's url module (url.resolve).
 * Used by pixi.js loader for resolving resource paths.
 */
function resolve(from: string, to: string): string {
  if (!from) return to
  try {
    return new URL(to, from).href
  } catch {
    return to
  }
}

export default { resolve }
