<template>
  <div>
    <el-tooltip
      :effect="store.state.settings.tt.effect"
      :content="text"
      :placement="store.state.settings.tt.placement"
      :open-delay="store.state.settings.tt.delay"
    >
      <span class="help-trigger">
        <slot></slot>
      </span>
    </el-tooltip>
  </div>
</template>

<script setup lang="ts">
import { useStore } from 'vuex'

defineOptions({ name: 'Help' })
const props = defineProps<{ text: string }>()
const { text } = props
const store = useStore()
</script>

<style scoped>
</style>
