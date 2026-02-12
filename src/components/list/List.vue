<template>
  <div style="height:100%">
    <div class="container">
      <list-entry v-for="e in elements" :key="e.id"
                  :selectedElement="selectedElement"
                  :data="e"
                  :prefix-callback="prefixCallback"
                  :name-callback="nameCallback"
                  :icon-callback="iconCallback"
                  :sub-entry-filter="subEntryFilter"
                  @select="onSelected"
                  @remove="onRemove"
      />

    </div>
    <div layout="row top-left">
      <el-button-group>
        <el-button type="primary" size="small" @click="onAdd">Add</el-button>
        <el-button :disabled="selectedElement == null" v-if="cloneButton" type="primary" size="small" @click="onClone">Clone</el-button>
        <el-button :disabled="selectedElement == null" v-if="renameButton" type="primary" size="small" @click="onRename">Rename</el-button>
      </el-button-group>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, getCurrentInstance } from 'vue'
import { ElMessageBox } from 'element-plus'
import ListEntry from './ListEntry.vue'
import { EVENT_RESET } from '../../events'

const props = withDefaults(
  defineProps<{
    elements?: any[]
    cloneButton?: boolean
    renameButton?: boolean
    useDefaultNamePrompt?: boolean
    nameCallback?: (data: any) => string
    prefixCallback?: (data: any) => string | null
    iconCallback?: (data: any) => string | null
    checkNameCallback?: (name: string) => boolean
    alwaysSelect?: boolean
    subEntryFilter?: string | null
  }>(),
  { cloneButton: true, renameButton: true, useDefaultNamePrompt: true, alwaysSelect: false, subEntryFilter: null }
)

const emit = defineEmits<{ select: [el: any]; remove: [el: any]; rename: [el: any, name: string]; clone: [el: any, name: string]; add: [name?: string] }>()

const instance = getCurrentInstance()
const eventBus = instance?.appContext.config.globalProperties.$eventBus

const selectedElement = ref<any>(null)

function namePrompt(inputValue?: string) {
  return ElMessageBox.prompt('Please enter a name.', 'Enter Name', {
    confirmButtonText: 'OK',
    cancelButtonText: 'Cancel',
    inputValue: inputValue ?? '',
  })
}

function onSelected(element: any) {
  if (selectedElement.value === element && !props.alwaysSelect) return
  selectedElement.value = element
  emit('select', element)
}

async function onRemove(element: any) {
  try {
    await ElMessageBox.confirm('This will delete the selection.', 'Warning', {
      confirmButtonText: 'OK',
      cancelButtonText: 'Cancel',
      type: 'warning',
    })
    emit('remove', element)
    selectedElement.value = null
  } catch {
    // cancelled
  }
}

async function onRename() {
  try {
    const name = await enterName(selectedElement.value?.data?.name)
    emit('rename', selectedElement.value, name)
  } catch {
    // cancelled
  }
}

async function onClone() {
  try {
    const name = await enterName(selectedElement.value?.data?.name)
    emit('clone', selectedElement.value, name)
  } catch {
    // cancelled
  }
}

async function onAdd() {
  if (props.useDefaultNamePrompt) {
    try {
      const name = await enterName()
      emit('add', name)
    } catch {
      // cancelled
    }
  } else {
    emit('add')
  }
}

function enterName(inputValue?: string): Promise<string> {
  return new Promise((resolve, reject) => {
    namePrompt(inputValue)
      .then((result: any) => {
        const val = result?.value ?? ''
        if (props.checkNameCallback && !props.checkNameCallback(val)) {
          ElMessageBox.alert(`Name '${val}' already exists!`, 'Oh no!', { type: 'error' })
          reject(new Error('duplicate'))
          return
        }
        resolve(val)
      })
      .catch(reject)
  })
}

onMounted(() => {
  eventBus?.$on(EVENT_RESET, () => {
    selectedElement.value = null
  })
})
</script>

<style lang="scss" scoped>


  .container {
    height: calc(100% - 215px);
    min-height: 33px;
    overflow-y: scroll;
    overflow-x: hidden;
    margin-bottom: 5px;
    border: 1px solid #dcdfe6;
    border-radius: 4px;
  }


</style>
