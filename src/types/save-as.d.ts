declare module 'save-as' {
  function saveAs(data: Blob | File, filename?: string, options?: { autoBom?: boolean }): void
  export default saveAs
}
