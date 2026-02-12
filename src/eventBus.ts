import mitt, { Emitter, EventType } from 'mitt'

type Events = Record<EventType, any>

const emitter: Emitter<Events> = mitt<Events>()

export interface EventBus {
  $on: <T = any>(event: EventType, handler: (arg: T) => void) => void
  $off: <T = any>(event: EventType, handler: (arg: T) => void) => void
  $emit: <T = any>(event: EventType, ...args: T[]) => void
  $once: <T = any>(event: EventType, handler: (...args: T[]) => void) => void
}

export const eventBus: EventBus = {
  $on: (event, handler) => emitter.on(event, handler),
  $off: (event, handler) => emitter.off(event, handler),
  $emit: (event, arg) => emitter.emit(event, arg),
  $once: (event, handler) => {
    const wrapper = (...args: any[]) => {
      emitter.off(event, wrapper)
      handler(...args)
    }
    emitter.on(event, wrapper)
  },
}
