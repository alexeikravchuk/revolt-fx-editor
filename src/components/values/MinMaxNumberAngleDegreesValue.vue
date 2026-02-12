<template>
  <div style="margin-bottom: 10px">
    <b>{{ label }}<br></b>
    <el-row type="flex" style="margin-top: -4px">
      <el-col>
        <div class="label">Min</div>
        <angle-degree-value class="input" :lower-limit="lowerLimit" :upper-limit="upperLimit" :step="step" :model-value="minValue" @update:model-value="onMinChange"/>
      </el-col>
      <el-col>
        <div class="label">Max</div>
        <angle-degree-value class="input" :lower-limit="lowerLimit" :upper-limit="upperLimit" :step="step" :model-value="maxValue" @update:model-value="onMaxChange"/>
      </el-col>
    </el-row>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import AngleDegreeValue from './AngleDegreeValue.vue'

defineOptions({ name: 'MinMaxNumberAngleDegreesValue' })
const props = defineProps<{
  min?: number
  max?: number
  label?: string
  step?: number
  lowerLimit?: number
  upperLimit?: number
}>()
const emit = defineEmits<{ 'update:min': [v: number]; 'update:max': [v: number] }>()

const minValue = ref(props.min ?? 0)
const maxValue = ref(props.max ?? 0)

watch(() => props.min, (v) => { minValue.value = v ?? 0 })
watch(() => props.max, (v) => { maxValue.value = v ?? 0 })

function onMinChange(v: number) {
  minValue.value = v
  emit('update:min', v)
}
function onMaxChange(v: number) {
  maxValue.value = v
  emit('update:max', v)
}
</script>

<style scoped>
  .label {
    font-size: 0.8rem;
    margin-bottom: -2px;
  }

  .input {
    width: 100px;
  }

  b {
    font-size: 14px;
  }
</style>
