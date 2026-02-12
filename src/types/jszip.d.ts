declare module 'jszip' {
  export default class JSZip {
    constructor()
    file(path: string): JSZipObject | null
    file(path: string, data: string | Blob | ArrayBuffer, options?: { base64?: boolean }): JSZip
    forEach(callback: (relativePath: string, file: JSZipObject) => void): void
    loadAsync(data: Blob | ArrayBuffer | string | any): Promise<JSZip>
    generateAsync(options: { type: string; compression?: string; compressionOptions?: { level: number } }): Promise<Blob>
  }

  export interface JSZipObject {
    name: string
    dir: boolean
    async(type: 'string'): Promise<string>
    async(type: 'base64'): Promise<string>
    async(type: 'arraybuffer'): Promise<ArrayBuffer>
    async(type: 'blob'): Promise<Blob>
  }
}
