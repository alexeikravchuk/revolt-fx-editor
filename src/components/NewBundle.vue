<template>
  <div>
    <el-dialog v-model="visible" title="New Bundle" width="400px">
      <el-input v-model="name" placeholder="Name"></el-input>

      <help text="Add a spritesheet PNG and JSON file">
        <div class="choose-file">
          <span>{{ infoText }}</span>
          <input type="file" multiple @change="handleFiles"/>
        </div>
      </help>

      <template #footer>
        <el-button @click="visible = false">Cancel</el-button>
        <el-button :disabled="!createOk" type="primary" @click="create">Create</el-button>
      </template>
      <img :src="previewSrc" ref="previewRef" class="spritesheet-preview"/>
      <help text="Add only textures containing this string in their names as FX assets">
        <el-input v-model="spritesheetFilter" placeholder="Texture Filter" style="width:50%;" @change="checkFilter"></el-input>
      </help>
      <div v-if="filterError" class="filter-error">Invalid Filter</div>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, getCurrentInstance } from 'vue'
import { useStore } from 'vuex'
import { ElNotification } from 'element-plus'
import { INIT_BUNDLE } from '../store'
import { EVENT_EMITTER_PRESET_SELECTED, EVENT_RESET } from '../events'
import Help from './Help.vue'

defineOptions({ name: 'NewBundle' })

const store = useStore()
const instance = getCurrentInstance()
const eventBus = instance?.appContext.config.globalProperties.$eventBus
const editor = () => instance?.appContext.config.globalProperties.$editor
const loading = () => instance?.appContext.config.globalProperties.$loading

const visible = ref(false)
const name = ref('')
const infoText = ref('Click to add spritesheet assets...')
const spritesheetFilter = ref('')
const filterError = ref(false)
const tempImage = ref<string | null>(null)
const tempJson = ref<any>(null)
const previewSrc = ref('/foo.png')

let jsonFile: File | null = null
let imageFile: File | null = null

const createOk = computed(() => !filterError.value && tempJson.value && tempImage.value)

function show() {
  visible.value = true
  name.value = ''
  spritesheetFilter.value = ''
  infoText.value = 'Click to add spritesheet assets...'
  filterError.value = false
  tempImage.value = null
  tempJson.value = null
  jsonFile = null
  imageFile = null
  previewSrc.value = '/foo.png'
}

async function handleFiles(e: Event) {
  try {
    const files = (e.target as HTMLInputElement).files
    const err = 'Please provide a spritesheet PNG image and a JSON file.'

    if (!files || files.length !== 2) {
      showAlert(err)
      return
    }
    imageFile = findType(files, 'image/png')
    jsonFile = findType(files, 'application/json')

    if (jsonFile == null || imageFile == null) {
      showAlert(err)
      return
    }

    eventBus?.$emit(EVENT_RESET)

    const data = await editor()?.loadSpritesheetLocal(jsonFile, imageFile)
    if (!data || !data.json.frames) {
      showAlert('Please provide a valid spritesheet JSON file.')
      return
    }

    tempJson.value = data.json
    tempImage.value = data.image
    previewSrc.value = data.image
    checkFilter()
    infoText.value = `${imageFile.name}, ${jsonFile.name}`
    ;(e.target as HTMLInputElement).value = ''
  } catch (err) {
    showAlert('Something went wrong!')
    console.log(err)
  }
}

async function create() {
  checkFilter()
  if (filterError.value || !tempJson.value || !tempImage.value) return

  const loader = loading()?.({ fullscreen: true, background: 'white', text: 'RevoltFX' })
  store.commit(INIT_BUNDLE, { name: name.value || 'New Bundle', spritesheetFilter: spritesheetFilter.value })
  eventBus?.$emit(EVENT_RESET)

  await editor()?.createSpritesheet(tempImage.value, tempJson.value, spritesheetFilter.value)

  if (imageFile && jsonFile) {
    store.state.spritesheet.imageName = imageFile.name
    store.state.spritesheet.jsonName = jsonFile.name
  }
  visible.value = false
  eventBus?.$emit(EVENT_EMITTER_PRESET_SELECTED, null)
  loader?.close()
}

function findType(files: FileList, type: string): File | null {
  for (let i = 0; i < files.length; i++) {
    if (files[i].type === type) return files[i]
  }
  return null
}

function showAlert(message: string) {
  ElNotification.error({ title: 'Oops', message })
}

function checkFilter() {
  if (tempJson.value != null && spritesheetFilter.value !== '') {
    let ok = false
    for (const i in tempJson.value.frames) {
      if (i.indexOf(spritesheetFilter.value) !== -1) {
        ok = true
        break
      }
    }
    filterError.value = !ok
  } else {
    filterError.value = false
  }
}

defineExpose({ show })
</script>

<style lang="scss" scoped>
  $height: 60px;
  .choose-file {
    position: relative;
    display: inline-block;
    border-radius: 5px;
    border: #dddddd dashed 2px;
    width: 100%;
    height: $height;
    color: #7f7f7f;
    margin-top: 10px;
    line-height: $height;
    text-align: center;
    font-size: 1.2rem;
  }

  .filter-error {
    color: red;
    font-weight: 500;
  }

  .choose-file input[type="file"] {
    position: absolute;
    width: 100%;
    height: $height;
    top: 0;
    left: 0;
    opacity: 0;
  }

  .spritesheet-preview {
    $size: 360px;
    width: $size;
    height: $size;
    background-color: #dddddd;
    margin-top: 10px;
  }
</style>
