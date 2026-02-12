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
import { ref, watch } from 'vue'
import ImageSelectThumb from './ImageSelectThumb.vue'

defineOptions({ name: 'ImageSelect' })
const props = defineProps<{ value?: string; textures?: any }>()
const emit = defineEmits<{ selected: [data: any] }>()

const thumbSrc = ref(props.value ?? '')
const paneVisible = ref(false)

watch(() => props.value, (v) => { thumbSrc.value = v ?? '' })

function onShowSelection() {
  paneVisible.value = true
  document.addEventListener('click', onDocumentClicked)
}

function onImageSelected(image: any) {
  emit('selected', image.data)
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
