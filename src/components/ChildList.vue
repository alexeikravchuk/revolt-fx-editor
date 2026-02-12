<template>
  <div>
    <list
      :cloneButton="false"
      :renameButton="false"
      :elements="elements"
      :useDefaultNamePrompt="false"
      :nameCallback="getName"
      :alwaysSelect="true"
      @select="onSelect"
      @add="onAdd"
      @remove="onRemove"
    />

    <el-dialog v-model="modalVisible" title="Select Component" width="400px">
      <p>
        Particle Emitter<br>
        <el-select v-model="emitterId">
          <el-option
            v-for="item in emitterOptions"
            :key="item.id"
            :value="item.id"
            :label="getName(item)"
          />
        </el-select>
      </p>
      <help text="Scale modificator">
        <p>
          Scale<br>
          <el-input-number v-model="scale" controls-position="right"/>
        </p>
      </help>

      <help text="Component adopts rotation of parent">
        <value-element>
          <el-checkbox v-model="adoptRotation">Adopt parent rotation</el-checkbox>
        </value-element>
      </help>

      <help text="ID of a registered container to attach the emitter to">
        <p>
          <el-input v-model="containerId" placeholder="Container Id"></el-input>
        </p>
      </help>

      <template #footer>
        <el-button type="primary" @click="modalVisible=false">Cancel</el-button>
        <el-button type="primary" :disabled="isDisabled" @click="ok">OK</el-button>
      </template>
    </el-dialog>

    <el-dialog v-model="editModalVisible" title="Edit" width="400px">

      <help text="Scale modificator">
        <p>
          Scale<br>
          <el-input-number v-model="scale" controls-position="right"/>
        </p>
      </help>
      <help text="Component adopts rotation of parent">
        <value-element>
          <el-checkbox v-model="adoptRotation">Adopt parent rotation</el-checkbox>
        </value-element>
      </help>
      <help text="ID of a registered container to attach the emitter to">
        <p>
          <el-input v-model="containerId" placeholder="Container Id"></el-input>
        </p>
      </help>
      <template #footer>
        <el-button type="primary" @click="editModalVisible=false">Cancel</el-button>
        <el-button type="primary" @click="applyChanges">OK</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
defineOptions({ name: 'ChildList' })

import { ref, computed, getCurrentInstance } from 'vue'
import { useStore } from 'vuex'
import List from './list/List.vue'
import Help from './Help.vue'
import ValueElement from './values/ValueElement.vue'
import * as _ from 'lodash'

const props = defineProps<{ elements?: any[]; exclude?: any }>()
const emit = defineEmits<{ add: [data: any]; remove: [data: any] }>()

const store = useStore()
const instance = getCurrentInstance()
const editor = () => instance?.appContext.config.globalProperties.$editor

const modalVisible = ref(false)
const editModalVisible = ref(false)
const scale = ref(1)
const emitterId = ref<number | null>(null)
const containerId = ref('')
const editData = ref<any>(null)
const adoptRotation = ref(true)

const emitters = computed(() => _.sortBy(store.state.bundle.emitters.slice(), 'name'))

const emitterOptions = computed(() => {
  const ex = props.exclude
  return emitters.value.filter((item: any) => !ex || item.id !== ex.id)
})

const isDisabled = computed(() => emitterId.value == null)

function getName(obj: any) {
  const d = editor()?.getEmitterById(obj.id)
  return d ? `[E] ${d.name}` : ''
}

function onAdd() {
  modalVisible.value = true
  containerId.value = ''
  scale.value = 1
  adoptRotation.value = true
}

function onRemove(data: any) {
  emit('remove', data.data)
}

function onSelect(entry: any) {
  scale.value = entry.data.scale
  containerId.value = entry.data.containerId
  editData.value = entry.data
  editModalVisible.value = true
  adoptRotation.value = entry.data.adoptRotation
}

function applyChanges() {
  if (!editData.value) return
  editData.value.scale = scale.value
  editData.value.containerId = containerId.value
  editData.value.adoptRotation = adoptRotation.value
  editModalVisible.value = false
}

function ok() {
  modalVisible.value = false
  const e = editor()?.getEmitterById(emitterId.value!)
  if (!e) return
  emit('add', {
    type: 0,
    id: e.id,
    scale: scale.value,
    containerId: containerId.value,
    adoptRotation: adoptRotation.value,
  })
}
</script>

<style scoped>

</style>
