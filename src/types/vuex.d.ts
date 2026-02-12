declare module 'vuex' {
  import { App } from 'vue'

  export interface Store<S = any> {
    state: S
    commit(type: string, payload?: any): void
    dispatch(type: string, payload?: any): Promise<any>
  }

  export function createStore<S>(options: {
    state: S
    mutations: Record<string, (state: S, payload?: any) => void>
  }): Store<S>

  export function useStore<S = any>(): Store<S>
}
