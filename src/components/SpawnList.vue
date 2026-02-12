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
      <el-radio-group v-model="type">
        <el-radio-button :value="0">Particle Emitter</el-radio-button>
        <el-radio-button :value="1">Sequence</el-radio-button>
      </el-radio-group>

      <p>
        <el-select v-if="type==0" v-model="emitterId">
          <el-option
            v-for="item in emitterOptions"
            :key="item.id"
            :value="item.id"
            :label="getEmitterName(item)"
          />
        </el-select>

        <el-select v-if="type==1" v-model="sequenceId">
          <el-option
            v-for="item in sequenceOptions"
            :key="item.id"
            :value="item.id"
            :label="getSequenceName(item)"
          />
        </el-select>
      </p>

      <help text="Scale modificator">
        <p>
          Scale<br>
          <el-input-number v-model="scale" controls-position="right"/>
        </p>
      </help>
      <value-element>
        <el-checkbox v-model="adoptRotation">Adopt parent rotation</el-checkbox>
      </value-element>
      <p v-if="type==0">

        <help text="ID of a registered container to attach the component to">
          <el-input v-model="containerId" placeholder="Container Id"></el-input>
        </help>
      </p>

      <template #footer>
        <el-button type="primary" @click="modalVisible=false">Cancel</el-button>
        <el-button type="primary" :disabled="isDisabled" @click="ok">OK</el-button>
      </template>
    </el-dialog>

    <el-dialog v-model="editModalVisible" title="Edit" width="400px">
      <b>{{getName(editData)}}</b>
      <p>
        Scale<br>
        <el-input-number v-model="scale" controls-position="right"/>
      </p>
      <value-element>
        <el-checkbox v-model="adoptRotation">Adopt parent rotation </el-checkbox>
      </value-element>
      <p v-if="type==0">
        <el-input v-model="containerId" placeholder="Container Id"></el-input>
      </p>
      <template #footer>
        <el-button type="primary" @click="editModalVisible=false">Cancel</el-button>
        <el-button type="primary" @click="applyChanges">OK</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
defineOptions({ name: 'SpawnList' })

import { ref, computed, getCurrentInstance } from 'vue'
import { useStore } from 'vuex'
import List from './list/List.vue'
import Help from './Help.vue'
import ValueElement from './values/ValueElement.vue'
import * as _ from 'lodash'

const props = defineProps<{
  elements: any[]
  exclude?: any
}>()

const emit = defineEmits<{
  add: [data: any]
  remove: [data: any]
}>()

const store = useStore()
const instance = getCurrentInstance()
const editor = () => instance?.appContext.config.globalProperties.$editor

const modalVisible = ref(false)
const editModalVisible = ref(false)
const type = ref(0)
const scale = ref(1)
const adoptRotation = ref(true)
const emitterId = ref<number | null>(null)
const sequenceId = ref<number | null>(null)
const containerId = ref('')
const editData = ref<any>(null)

const emitters = computed(() => {
  return _.sortBy(store.state.bundle.emitters.slice(), 'name')
})

const sequences = computed(() => {
  return _.sortBy(store.state.bundle.sequences.slice(), 'name')
})

const emitterOptions = computed(() => {
  const ex = props.exclude
  return emitters.value.filter((item: any) => item.type === 0 && (!ex || item.id !== ex.id))
})

const sequenceOptions = computed(() => {
  const ex = props.exclude
  return sequences.value.filter((item: any) => item.type === 1 && (!ex || item.id !== ex.id))
})

const isDisabled = computed(() => {
  return (type.value === 0 && emitterId.value == null) || (type.value === 1 && sequenceId.value == null)
})

function getName(data: any) {
  if (data == null) return ''
  if (data.type === 0) return getEmitterName(data)
  return getSequenceName(data)
}

function getEmitterName(obj: any) {
  const d = editor()?.getEmitterById(obj.id)
  if (!d) return ''
  return `[E] ${d.name}`
}

function getSequenceName(obj: any) {
  const d = editor()?.getSequenceById(obj.id)
  if (!d) return ''
  return `[S] ${d.name}`
}

function onAdd() {
  modalVisible.value = true
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
  const ed = editor()
  if (!ed) return

  let data: any
  if (type.value === 0) {
    const e = ed.getEmitterById(emitterId.value!)
    if (!e) return
    data = {
      type: 0,
      id: e.id,
      scale: scale.value,
      adoptRotation: adoptRotation.value,
      containerId: containerId.value,
    }
  } else {
    const s = ed.getSequenceById(sequenceId.value!)
    if (!s) return
    data = {
      type: 1,
      id: s.id,
      adoptRotation: adoptRotation.value,
      scale: scale.value,
    }
  }
  emit('add', data)
}
</script>

<style scoped>
  b {
    font-size: 1.2rem;
  }

</style>
