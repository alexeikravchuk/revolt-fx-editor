<template>
  <div>
    <value-group label="Global">
      <div style="padding-top: 5px; padding-bottom: 5px;">
        <help text="Maximum number of particles to render">
          <number-value :lower-limit="1" label="Max Particles" v-model="data.maxParticles"/>
        </help>
        <help text="Enable blendmodes for all effects">
          <el-checkbox v-model="data.useBlendModes">Use Blend Modes</el-checkbox>
        </help>
      </div>
    </value-group>
  </div>
</template>

<script setup lang="ts">
import { watch, getCurrentInstance } from 'vue'
import ValueGroup from './values/ValueGroup.vue'
import NumberValue from './values/NumberValue.vue'
import Help from './Help.vue'

defineOptions({ name: 'EngineValues' })
const props = defineProps<{ data: any }>()

const instance = getCurrentInstance()
const fx = () => instance?.appContext.config.globalProperties.$fx

watch(() => props.data?.maxParticles, (newVal) => {
  if (fx() && newVal != null) fx().maxParticles = newVal
})

watch(() => props.data?.useBlendModes, (newVal) => {
  if (fx() && newVal != null) fx().useBlendModes = newVal
})
</script>

<style scoped>

</style>
