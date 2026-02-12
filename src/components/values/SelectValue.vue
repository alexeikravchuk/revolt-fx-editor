<template>
  <div>
    <b>{{ label }}</b><br>
    <el-select :disabled="disabled" size="small" :model-value="modelValue" @update:model-value="onChange">
      <el-option
        v-for="item in options"
        :key="item.value"
        :value="item.value"
        :label="getLabel(item)"
      />
    </el-select>
  </div>
</template>

<script setup lang="ts">
import _ from 'lodash'

defineOptions({ name: 'SelectValue' })
defineProps<{
  modelValue?: string | number
  label?: string
  options?: { value: string | number; name?: string }[]
  disabled?: boolean
}>()
const emit = defineEmits<{ 'update:modelValue': [v: any]; change: [v: any] }>()

function getLabel(option: { value: string | number; name?: string }) {
  const v = String(option.value)
  return option.name == null || option.name === '' ? _.startCase(v.replace('ease', '')) : option.name
}
function onChange(v: any) {
  emit('update:modelValue', v)
  emit('change', v)
}
</script>

<style scoped>
  div {
    margin-bottom: 5px;
  }
  b {
    font-size: 14px;
  }
</style>
