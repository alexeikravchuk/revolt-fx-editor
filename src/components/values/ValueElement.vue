<template>
  <div>
    <b v-if="label">{{label}}<br></b>
    <slot></slot>
  </div>
</template>

<script setup lang="ts">
defineOptions({ name: 'ValueElement' })
defineProps<{ label?: string }>()
</script>

<style scoped>
  b {
    font-size: 14px;
  }
  div {
    margin-bottom: 10px;
  }
</style>
