declare module 'vue-router' {
  import { Component } from 'vue'

  export interface RouteRecordRaw {
    path: string
    name?: string
    component?: Component
    children?: RouteRecordRaw[]
  }

  export interface RouterHistory {
    // Router history interface
  }

  export function createRouter(options: { history: RouterHistory; routes: RouteRecordRaw[] }): any
  export function createWebHistory(base?: string): RouterHistory
}
