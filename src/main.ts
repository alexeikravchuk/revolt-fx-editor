import 'es6-promise/auto'
import './canvas-will-read-frequently.ts'
import './pixi-global.ts'
import { createApp } from 'vue'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import 'normalize.css'
import 'flex-layout-attribute'
import '@/css/main.scss'

import App from './App.vue'
import store from './store.ts'
import { eventBus } from './eventBus.ts'
import { Editor } from './editor/editor.ts'
import { FX } from 'revolt-fx'

function init(): void {
  const fx = new FX()
  Editor.fx = fx

  const app = createApp(App)
  app.use(store as any)
  app.use(ElementPlus)
  app.config.globalProperties.$eventBus = eventBus
  app.config.globalProperties.$fx = fx
  app.provide('vueApp', app)
  app.mount('#app')
}

init()
