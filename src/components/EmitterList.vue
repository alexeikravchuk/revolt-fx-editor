<template>
  <div id="container">
    <list class="list"
          :checkNameCallback="checkName"
          :elements="elements"
          sub-entry-filter="-sub"
          @select="onSelected"
          @remove="onRemove"
          @add="onAdd"
          @clone="onClone"
          @rename="onRename"
    />
  </div>

</template>

<script setup lang="ts">
import { computed, getCurrentInstance } from 'vue'
import { useStore } from 'vuex'
import { ElMessageBox } from 'element-plus'
import List from './list/List.vue'
import { ADD_EMITTER_PRESET, CLONE_EMITTER_PRESET, DELETE_EMITTER_PRESET, RENAME_EMITTER_PRESET } from '../store'
import { EVENT_EMITTER_PRESET_REMOVED, EVENT_EMITTER_PRESET_SELECTED } from '../events'
import * as _ from 'lodash'

const store = useStore()
const instance = getCurrentInstance()
const eventBus = instance?.appContext.config.globalProperties.$eventBus
const editor = () => instance?.appContext.config.globalProperties.$editor

const elements = computed(() => {
  return _.sortBy(store.state.bundle.emitters.slice(), 'name')
})

const checkName = (name: string) => {
  const list = store.state.bundle.emitters
  for (const i in list) {
    if (list[i].name === name) return false
  }
  return true
}

const onSelected = (element: any) => {
  eventBus?.$emit(EVENT_EMITTER_PRESET_SELECTED, element.data)
}

const onClone = (element: any, name: string) => {
  store.commit(CLONE_EMITTER_PRESET, { preset: element.data, name: name })
}

const onAdd = (name: string) => {
  store.commit(ADD_EMITTER_PRESET, name)
}

const onRemove = (element: any) => {
  const list = editor()?.getEmittersUsingComponent(element.data)

  const remove = () => {
    eventBus?.$emit(EVENT_EMITTER_PRESET_REMOVED, element.data)
    store.commit(DELETE_EMITTER_PRESET, element.data)
  }

  if (list && list.length > 0) {
    let names = ''
    for (const n in list) {
      names += `<br><strong>${list[n].name}</strong>`
    }

    ElMessageBox.confirm(
      `The selected emitter is used by the following emitters: ${names}<br>Deleting it will also remove it from the listed emitters.`,
      'Warning',
      {
        confirmButtonText: 'OK',
        cancelButtonText: 'Cancel',
        type: 'warning',
        dangerouslyUseHTMLString: true,
      }
    )
      .then(() => {
        editor()?.deleteComponentFromEmitters(element.data, list)
        remove()
      })
      .catch(() => {
        // Cancelled
      })
  } else {
    remove()
  }
}

const onRename = (element: any, name: string) => {
  store.commit(RENAME_EMITTER_PRESET, { preset: element.data, name: name })
}
</script>

<style lang="scss" scoped>


  #container {
    height: calc(100vh - 155px);

  }

</style>
