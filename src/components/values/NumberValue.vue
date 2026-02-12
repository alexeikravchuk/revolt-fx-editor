<template>
  <div>
    <b>{{ label }}<br></b>
    <el-tooltip :disabled="tooltip == null" :content="tooltip" :open-delay="1000">
      <el-input-number :min="lowerLimit" :max="upperLimit" :disabled="disabled" :step="step" controls-position="right" size="small" :model-value="modelValue" @update:model-value="emit('update:modelValue', $event)"/>
    </el-tooltip>
  </div>
</template>

<script setup lang="ts">
defineOptions({ name: 'NumberValue' })
defineProps<{
  modelValue?: number
  label?: string
  disabled?: boolean
  step?: number
  tooltip?: string
  lowerLimit?: number
  upperLimit?: number
}>()
const emit = defineEmits<{ 'update:modelValue': [value: number] }>()
</script>

<style scoped>
div { margin-bottom: 5px; }
b { font-size: 14px; }
</style>
