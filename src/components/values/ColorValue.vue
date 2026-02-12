<template>
  <div>
    <b>{{ label }}<br></b>
    <el-color-picker :model-value="colorStr" @update:model-value="onChange"/>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

defineOptions({ name: 'ColorValue' })
const props = defineProps<{ modelValue?: number; label?: string; disabled?: boolean }>()
const emit = defineEmits<{ 'update:modelValue': [v: number] }>()

const colorStr = computed(() => {
  const v = props.modelValue
  return v != null ? '#' + (typeof v === 'number' ? v : parseInt(String(v), 16)).toString(16).padStart(6, '0') : '#ffffff'
})

function onChange(val: string) {
  emit('update:modelValue', val ? parseInt(val.replace('#', ''), 16) : 0xffffff)
}
</script>

<style scoped>
div { margin-bottom: 5px; }
b { font-size: 14px; }
</style>
