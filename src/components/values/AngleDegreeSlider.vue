<template>
  <div>
    <b>{{ label }}<br></b>
    <el-slider size="small" :model-value="degree" :min="0" :max="360" :step="1" @update:model-value="emit('update:modelValue', $event * Math.PI / 180)"/>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

defineOptions({ name: 'AngleDegreeSlider' })
const props = defineProps<{ modelValue?: number; label?: string }>()
const emit = defineEmits<{ 'update:modelValue': [v: number] }>()

const degree = computed(() => Math.round((props.modelValue ?? 0) * 180 / Math.PI))
</script>

<style scoped>
div { margin-bottom: 5px; }
b { font-size: 14px; }
</style>
