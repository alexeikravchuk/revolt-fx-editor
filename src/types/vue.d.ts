import { FX } from 'revolt-fx'
import { EventBus } from '../eventBus'
import { Editor } from '../editor/editor'

declare module '@vue/runtime-core' {
  interface ComponentCustomProperties {
    $eventBus: EventBus
    $fx: FX
    $editor: Editor
    $loading: (options: any) => any
    $notify: {
      error: (options: { title: string; message: string }) => void
    }
    $confirm: (message: string, title: string, options: any) => Promise<void>
  }
}

export {}
