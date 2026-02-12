<template>
  <div>
    <b v-if="label">{{ label }}<br></b>
    <el-input-number style="width:100%; max-width: 130px;" size="small" :model-value="degree" :min="lowerLimit" :max="upperLimit" :step="step" controls-position="right" @update:model-value="emit('update:modelValue', $event * Math.PI / 180)"/>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

defineOptions({ name: 'AngleDegreeValue' })
const props = defineProps<{ modelValue?: number; label?: string; step?: number; lowerLimit?: number; upperLimit?: number }>()
const emit = defineEmits<{ 'update:modelValue': [v: number] }>()

const degree = computed(() => Number(((props.modelValue ?? 0) * 180 / Math.PI).toFixed(1)))
</script>

<style scoped>
div { margin-bottom: 5px; }
b { font-size: 14px; }
</style>
