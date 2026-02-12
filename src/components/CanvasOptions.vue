<template>
  <div layout="row center-left" style="margin-bottom: 5px;">


    <el-popover
      placement="top"
      :width="320"
      v-model:visible="popupContainerVisible"
      @show="onShowPopupContainer"
    >
      <p>
        <el-radio-group size="small" class="spacing" v-model="tempContainer">
          <el-radio-button :value="0">Standard Container</el-radio-button>
          <el-radio-button :value="1">Particle Container</el-radio-button>
        </el-radio-group>
      </p>
      <select-value :disabled="tempContainer==0" label="Blend Mode" v-model="tempBlendMode" :options="blendModes" self="left"/>
      <div style="text-align: right;">
        <el-button size="small" type="primary" @click="onApplyContainer">Apply</el-button>
      </div>
      <template #reference>
        <el-button type="info" size="small" class="spacing">Container</el-button>
      </template>
    </el-popover>

    <el-color-picker size="small" v-model="color" @change="onColor" class="spacing"/>
    <el-checkbox class="spacing" v-model="gizmos" @change="onGizmo">Gizmos</el-checkbox>
    <el-button size="small" type="info" self="right" style="margin-right:10px" @click="onReset()">Clear</el-button>

  </div>
</template>

<script setup lang="ts">
import { ref, getCurrentInstance } from 'vue'
import SelectValue from './values/SelectValue.vue'
import { EVENT_SEQUENCE_PRESET_SELECTED, EVENT_EMITTER_PRESET_SELECTED } from '../events'

defineOptions({ name: 'CanvasOptions' })

const instance = getCurrentInstance()
const editor = () => instance?.appContext.config.globalProperties.$editor
const eventBus = instance?.appContext.config.globalProperties.$eventBus
const fx = () => instance?.appContext.config.globalProperties.$fx

const color = ref('#333333')
const gizmos = ref(true)
const container = ref(0)
const popupContainerVisible = ref(false)
const blendMode = ref(0)
const tempBlendMode = ref(0)
const tempContainer = ref(0)
const blendModes = [
  { value: 0, name: 'Normal' },
  { value: 1, name: 'Add' },
  { value: 2, name: 'Multiply' },
  { value: 3, name: 'Screen' },
]

function onShowPopupContainer() {
  tempContainer.value = container.value
  tempBlendMode.value = blendMode.value
}

function onApplyContainer() {
  container.value = tempContainer.value
  blendMode.value = tempBlendMode.value
  editor()?.setContainer(container.value, container.value === 0 ? 0 : blendMode.value)
  popupContainerVisible.value = false
}

function onGizmo(value: boolean) {
  if (editor()?.layers?.gizmoLayer) editor().layers.gizmoLayer.visible = value
}

function onColor(c: string) {
  editor()?.layers?.setBackgroundColor(parseInt(c.replace('#', ''), 16))
}

function onReset() {
  fx()?.stopAllEffects()
  eventBus?.$emit(EVENT_EMITTER_PRESET_SELECTED, null)
  eventBus?.$emit(EVENT_SEQUENCE_PRESET_SELECTED, null)
}
</script>

<style scoped>
  .spacing {
    margin-right: 15px;
  }
</style>
