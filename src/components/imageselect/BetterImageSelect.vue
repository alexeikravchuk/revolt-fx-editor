<template>
  <div style="position: relative;">
    <div class="current-thumb">
      <image-select-thumb :src="thumbSrc" @select="onShowSelection"/>
    </div>
    <div class="pane" v-show="paneVisible">

      <!--@select="onImageSelected"/>-->

      <image-select-thumb
        v-for="image in textures"
        :key="image.name"
        width="80px"
        height="80px"
        :data="image"
        :src="image.image.src"
        :name="image.name"
        @select="onImageSelected"
      />

    </div>


  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import ImageSelectThumb from './ImageSelectThumb.vue'

defineOptions({ name: 'BetterImageSelect' })
const props = defineProps<{ modelValue?: string; textures?: Record<string, { name: string; image: HTMLImageElement }> }>()
const emit = defineEmits<{ 'update:modelValue': [v: string] }>()

const paneVisible = ref(false)

const thumbSrc = computed(() => {
  if (props.modelValue && props.textures) {
    const imageDef = props.textures[props.modelValue]
    if (!imageDef?.image) return null
    return imageDef.image.src ?? null
  }
  return null
})

function onShowSelection() {
  paneVisible.value = true
  document.addEventListener('click', onDocumentClicked)
}

function onImageSelected(image: any) {
  emit('update:modelValue', image.data.name)
  closePane()
}

function onDocumentClicked() {
  closePane()
}

function closePane() {
  paneVisible.value = false
  document.removeEventListener('click', onDocumentClicked)
}
</script>

<style lang="scss" scoped>


  $thumbSize: 80px;

  .current-thumb {
    border-radius: 4px;
    border: 1px solid #dcdfe6;
    padding: 5px;
    width: $thumbSize;
    height: $thumbSize;

  }

  .pane {
    position: absolute;
    background-color: white;
    width: $thumbSize * 3 + 12;
    height: $thumbSize * 4 + 12;
    overflow-x: hidden;
    overflow-y: auto;
    margin-top: 5px;
    border-radius: 4px;
    box-shadow: 0 2px 12px 0 rgba(0,0,0,.3);
    border: 1px solid #dcdfe6;
    padding: 2px;
    z-index: 5;
  }

  .thumb {
    float: left;
  }


</style>
