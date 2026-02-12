<template>
  <div :class="{entry:true, selected, master:!isSubEntry, 'sub-entry':isSubEntry}" layout="row center-left" @click="select">
    <span v-if="prefix != null" class="prefix">{{ prefix }}</span>
    <div class="thumb" v-if="icon">
      <img :src="icon"/>
    </div>
    <span :class="{sub:isSubEntry}">{{ name }}</span>
    <el-icon class="delete-icon" @click.stop="remove"><Delete /></el-icon>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { Delete } from '@element-plus/icons-vue'

const props = defineProps<{
  data: any
  selectedElement: any
  nameCallback?: (data: any) => string
  prefixCallback?: (data: any) => string | null
  iconCallback?: (data: any) => string | null
  subEntryFilter?: string
}>()

const emit = defineEmits<{ select: [entry: any]; remove: [entry: any] }>()

const name = computed(() => (props.nameCallback ? props.nameCallback(props.data) : (props.data?.name ?? '')))

const prefix = computed(() => (props.prefixCallback ? props.prefixCallback(props.data) : null))

const selected = computed(() => props.selectedElement?.data === props.data)

const icon = computed(() => (props.iconCallback ? props.iconCallback(props.data) : null))

const isSubEntry = computed(() => (props.subEntryFilter ? name.value.indexOf(props.subEntryFilter) > -1 : false))

function select() {
  emit('select', { data: props.data })
}

function remove() {
  emit('remove', { data: props.data })
}
</script>

<style lang="scss" scoped>
  .thumb {
    position: relative;
    padding: 2px;
    margin: 0;
    cursor: pointer;
    background-color: #409eff;
    margin: 1px;
    border-radius: 4px;
    overflow: hidden;
    width: 25px;
    height: 25px;
    margin-right: 7px;
  }

  .thumb img {
    max-width: 100%;
    height: auto;
  }

  .prefix {
    width: 40px;
    margin-right: 5px;
    background-color: #909399;
    color: white;
    font-size: 0.75rem;
    border-radius: 4px;
    text-align: center;
  }

  .delete-icon {
    cursor: pointer;
    margin-left: auto;
  }

  .entry {
    height: 28px;
    /*margin-bottom: 0.05rem;*/
    padding-left: 10px;
    padding-right: 15px;
    width: 100%;
    font-size: 1rem;
    cursor: pointer;
  }

  .sub-entry {
    height:22px;
  }

  .selected {
    color: #409eff;
    background-color: #ecf5ff;
    font-weight: 400;
  }

  .master {
    font-weight: 400;
  }

  .sub {
    margin-left:12px;
    font-size: 0.9rem;
    margin-top: -0rem;
  }

  span {
    white-space: nowrap;
    max-width: calc(100% - 25px);
    overflow: hidden;
  }

</style>
