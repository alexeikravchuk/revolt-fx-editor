<template>
  <div class="container" layout="row left-top">
    <el-card class="box-card values" shadow="always">
      <emitter-values v-if="emitterPreset != null" :data="emitterPreset" />
      <sequence-values v-if="sequencePreset != null" :data="sequencePreset" />
    </el-card>

    <div>
      <el-card class="engine">
        <engine-values v-if="bundleSettings != null" :data="bundleSettings" />
      </el-card>
      <el-card class="tabs">
        <el-tabs type="" @tab-click="handleTabClick">
          <el-tab-pane label="Emitters">
            <emitter-list />
          </el-tab-pane>
          <el-tab-pane label="Sequences">
            <sequence-list />
          </el-tab-pane>
        </el-tabs>
      </el-card>
    </div>
  </div>
</template>

<script setup lang="ts">
defineOptions({ name: 'SidePanel' })
import { ref, computed, onMounted, onUnmounted, getCurrentInstance } from 'vue'
import { useStore } from 'vuex'
import EmitterList from './EmitterList.vue'
import EmitterValues from './EmitterValues.vue'
import EngineValues from './EngineValues.vue'
import SequenceList from './SequenceList.vue'
import SequenceValues from './SequenceValues.vue'
import {
  EVENT_EMITTER_PRESET_REMOVED,
  EVENT_EMITTER_PRESET_SELECTED,
  EVENT_RESET,
  EVENT_SEQUENCE_PRESET_SELECTED,
} from '../events'

const store = useStore()
const instance = getCurrentInstance()
const eventBus = instance?.appContext.config.globalProperties.$eventBus
const editor = () => instance?.appContext.config.globalProperties.$editor
const fx = () => instance?.appContext.config.globalProperties.$fx

const emitterPreset = ref<any>(null)
const sequencePreset = ref<any>(null)

const bundleSettings = computed(() => store.state.bundle)

function onEmitterSelected(preset: any) {
  emitterPreset.value = preset
  sequencePreset.value = null
  const ed = editor()
  if (ed?.layers?.floorGizmoLayer) ed.layers.floorGizmoLayer.visible = true
}

function onEmitterRemoved(preset: any) {
  if (emitterPreset.value === preset) {
    emitterPreset.value = null
  }
}

function onSequenceSelected(preset: any) {
  emitterPreset.value = null
  sequencePreset.value = preset
  const ed = editor()
  if (ed?.layers?.floorGizmoLayer) ed.layers.floorGizmoLayer.visible = false
}

function onSequenceRemoved(preset: any) {
  if (sequencePreset.value === preset) {
    sequencePreset.value = null
  }
}

function handleTabClick() {
  eventBus?.$emit(EVENT_EMITTER_PRESET_SELECTED, null)
  eventBus?.$emit(EVENT_SEQUENCE_PRESET_SELECTED, null)
  eventBus?.$emit(EVENT_RESET)
  const fxInstance = fx()
  if (fxInstance) fxInstance.stopAllEffects()
}

onMounted(() => {
  eventBus?.$on(EVENT_EMITTER_PRESET_SELECTED, onEmitterSelected)
  eventBus?.$on(EVENT_EMITTER_PRESET_REMOVED, onEmitterRemoved)
  eventBus?.$on(EVENT_SEQUENCE_PRESET_SELECTED, onSequenceSelected)
  eventBus?.$on(EVENT_EMITTER_PRESET_REMOVED, onSequenceRemoved)
})

onUnmounted(() => {
  eventBus?.$off(EVENT_EMITTER_PRESET_SELECTED, onEmitterSelected)
  eventBus?.$off(EVENT_EMITTER_PRESET_REMOVED, onEmitterRemoved)
  eventBus?.$off(EVENT_SEQUENCE_PRESET_SELECTED, onSequenceSelected)
  eventBus?.$off(EVENT_EMITTER_PRESET_REMOVED, onSequenceRemoved)
})
</script>

<style scoped>
.container {
  padding: 5px;
}

.engine {
  height: 180px;
}

.tabs {
  height: calc(100vh - 250px);
  min-height: 200px;
  width: 250px;
}

.values {
  height: calc(100vh - 70px);
  overflow-y: auto;
  width: 300px;
  margin-right: 5px;
}
</style>
