<template>
  <div>
    <value-element label="Component">
      <div v-if="type===0">
        <better-image-select v-model="spriteValue" :textures="spriteTextures" @update:modelValue="onSelect"/>
      </div>
      <div v-if="type===1">
        <better-image-select v-model="movieClipValue" :textures="movieClipTextures" @update:modelValue="onSelect"/>
      </div>
    </value-element>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, getCurrentInstance } from 'vue'
import BetterImageSelect from '../imageselect/BetterImageSelect.vue'
import ValueElement from './ValueElement.vue'

defineOptions({ name: 'ParticleComponentValue' })
const props = defineProps<{ modelValue?: string; type?: number }>()
const emit = defineEmits<{ 'update:modelValue': [v: string] }>()

const instance = getCurrentInstance()
const editor = () => instance?.appContext.config.globalProperties.$editor

const spriteValue = ref<string | null>(null)
const movieClipValue = ref<string | null>(null)

const spriteTextures = computed(() => editor()?.spritesheetImagesMap ?? {})
const movieClipTextures = computed(() => editor()?.moveClipImagesMap ?? {})

function setRightValue(type: number, value: string) {
  const ed = editor()
  if (!ed) return

  if (type === 0) {
    if (ed.spritesheetImagesMap[value] == null) {
      const fallback = ed.defaultSprite?.name ?? ed.spritesheetImagesList?.[0]?.name ?? ''
      spriteValue.value = fallback
      emit('update:modelValue', spriteValue.value)
    } else {
      spriteValue.value = value
    }
  } else if (type === 1) {
    if (ed.moveClipImagesMap[value] == null) {
      const fallback = ed.defaultMovieClip?.name ?? ed.moveClipImagesList?.[0]?.name ?? ''
      movieClipValue.value = fallback
      emit('update:modelValue', movieClipValue.value)
    } else {
      movieClipValue.value = value
    }
  }
}

function onSelect() {
  const value = props.type === 0 ? spriteValue.value : movieClipValue.value
  if (value != null) emit('update:modelValue', value)
}

onMounted(() => setRightValue(props.type ?? 0, props.modelValue ?? ''))

watch(() => props.type, (newVal) => setRightValue(newVal ?? 0, props.modelValue ?? ''))

watch(() => props.modelValue, (newVal) => setRightValue(props.type ?? 0, newVal ?? ''))
</script>

<style scoped>

</style>
