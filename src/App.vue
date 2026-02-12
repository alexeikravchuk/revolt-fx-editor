<template>
  <div id="app">
    <div class="blocker" v-if="blocker"></div>
    <el-container>
      <el-header>
        <top-menu />
      </el-header>
      <el-container>
        <el-container>
          <el-main>
            <render-canvas />
          </el-main>
        </el-container>
        <el-aside width="560px">
          <side-panel />
        </el-aside>
      </el-container>
    </el-container>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, inject, getCurrentInstance } from 'vue'
import RenderCanvas from './components/RenderCanvas.vue'
import TopMenu from './components/TopMenu.vue'
import SidePanel from './components/SidePanel.vue'
import { Editor } from './editor/editor'

const blocker = ref(true)
const vueApp = inject<any>('vueApp')
const instance = getCurrentInstance()
const eventBus = instance?.appContext.config.globalProperties.$eventBus

onMounted(() => {
  eventBus?.$once('canvasReady', async (app: any) => {
    const editor = new Editor(app, instance?.proxy)
    if (vueApp) {
      vueApp.config.globalProperties.$editor = editor
    }
    await editor.loadDefaultBundle()
    blocker.value = false
  })
})
</script>

<style>
#app {
  width: 100%;
  height: 100%;
}

.blocker {
  position: absolute;
  background-color: white;
  width: 100%;
  height: 100%;
  top: 0;
  left: 0;
  z-index: 10;
}

.el-main {
  height: 100%;
  width: 100%;
  padding: 5px;
  margin: 0;
}
</style>
