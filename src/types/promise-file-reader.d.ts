declare module 'promise-file-reader' {
  export function readAsText(file: File | Blob): Promise<string>
  export function readAsDataURL(file: File | Blob): Promise<string>
  export function readAsArrayBuffer(file: File | Blob): Promise<ArrayBuffer>
  export function readAsBinaryString(file: File | Blob): Promise<string>
}
