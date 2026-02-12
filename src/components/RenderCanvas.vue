<template>
  <div class="wh100" style="border-radius: 12px; position: relative;">
    <canvas ref="canvas"></canvas>
    <canvas-options class="options"/>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, getCurrentInstance } from 'vue'
import * as PIXI from 'pixi.js'
import CanvasOptions from './CanvasOptions.vue'

const canvas = ref<HTMLCanvasElement | null>(null)
const app = ref<any>(null)
const instance = getCurrentInstance()
const eventBus = instance?.appContext.config.globalProperties.$eventBus

const resize = () => {
  if (!canvas.value || !app.value) return
  const w = canvas.value.offsetWidth
  const h = canvas.value.offsetHeight
  app.value.renderer.resize(w, h)
  const editor = instance?.appContext.config.globalProperties.$editor
  if (editor) editor.resize(w, h)
}

onMounted(() => {
  if (!canvas.value) return

  const w = canvas.value.offsetWidth
  const h = canvas.value.offsetHeight
  app.value = new (PIXI.Application as any)(w, h, {
    view: canvas.value,
    backgroundColor: 0x333333,
    roundPixels: true,
  })

  window.addEventListener('resize', () => {
    resize()
  })

  setTimeout(() => {
    eventBus?.$emit('canvasReady', app.value)
    resize()
  }, 200)
})
</script>

<style scoped>
  canvas {
    width: 100%;
    height: calc(100vh - 70px);
    background-color: white;
    padding: 0;
    margin: 0;
    border-radius: 5px;
  }

  .options {
    position: absolute;
    left: 5px;
    bottom: 5px;
  }

</style>
