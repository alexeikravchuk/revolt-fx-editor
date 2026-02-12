<template>
  <div style="margin-bottom: 10px">
    <b>{{ label }}<br></b>
    <el-row type="flex" style="margin-top: -4px">
      <el-col>
        <div class="label">{{ minLabel || 'Min' }}</div>
        <el-input-number class="input" :min="lowerLimit" :max="upperLimit" controls-position="right" size="small" v-model="minValue" :step="step" @change="emit('update:min', minValue)"/>
      </el-col>
      <el-col>
        <div class="label">{{ maxLabel || 'Max' }}</div>
        <el-input-number class="input" :min="lowerLimit" :max="upperLimit" controls-position="right" size="small" v-model="maxValue" :step="step" @change="emit('update:max', maxValue)"/>
      </el-col>
    </el-row>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'

defineOptions({ name: 'MinMaxNumberValue' })
const props = defineProps<{
  min?: number
  max?: number
  label?: string
  step?: number
  lowerLimit?: number
  upperLimit?: number
  minLabel?: string
  maxLabel?: string
}>()
const emit = defineEmits<{ 'update:min': [v: number]; 'update:max': [v: number] }>()

const minValue = ref(props.min ?? 0)
const maxValue = ref(props.max ?? 0)

watch(() => props.min, (v) => { minValue.value = v ?? 0 })
watch(() => props.max, (v) => { maxValue.value = v ?? 0 })
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
