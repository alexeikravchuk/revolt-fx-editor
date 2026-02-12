<template>
  <div>
    <el-dialog v-model="visible" title="Load Bundle" width="400px">

      <help text="Add a bundle preset JSON and spritesheet PNG and JSON file">
        <div v-if="!mode || mode=='files'" class="choose-file">
          <span>{{ infoFiles }}</span>
          <input multiple type="file" @change="handleFiles"/>
        </div>
      </help>

      <help text="Add a bundle zip file">
        <div v-if="!mode || mode=='zip'" class="choose-file">
          <span>{{ infoZip }}</span>
          <input type="file" @change="handleZip"/>
        </div>
      </help>

      <div v-if="mode == 'files'" class="spritesheet-preview">
        <img :src="previewSrc"/>
      </div>

      <template #footer>
        <el-button @click="visible = false">Cancel</el-button>
        <el-button :disabled="!loadOk" type="primary" @click="load">Load</el-button>
      </template>

    </el-dialog>

  </div>
</template>

<script setup lang="ts">
import { ref, getCurrentInstance } from 'vue'
import { ElNotification } from 'element-plus'
import { readAsText, readAsDataURL } from 'promise-file-reader'
import Help from './Help.vue'

defineOptions({ name: 'LoadBundle' })

const instance = getCurrentInstance()
const editor = () => instance?.appContext.config.globalProperties.$editor

const visible = ref(false)
const zipFile = ref<File | null>(null)
const infoZip = ref('Click to add bundle ZIP...')
const infoFiles = ref('Click to add bundle files...')
const loadOk = ref(false)
const mode = ref<'zip' | 'files' | null>(null)
const previewSrc = ref('')

let tempImage: string | null = null
let tempJson: any = null
let tempPreset: any = null

function show() {
  visible.value = true
  infoFiles.value = 'Click to add bundle files...'
  infoZip.value = 'Click to add bundle ZIP...'
  zipFile.value = null
  mode.value = null
  loadOk.value = false
  tempImage = null
  tempJson = null
  tempPreset = null
  previewSrc.value = ''
}

async function handleFiles(e: Event) {
  try {
    const files = (e.target as HTMLInputElement).files
    const err = 'Please provide a bundle preset JSON and the according spritesheet PNG and JSON.'

    if (!files || files.length !== 3) {
      showAlert(err)
      return
    }
    const imageFiles = findType(files, 'image/png')
    const jsonFiles = findType(files, 'application/json')

    if (jsonFiles.length !== 2 || imageFiles.length !== 1) {
      showAlert(err)
      return
    }

    const imageFile = imageFiles[0]
    const json0 = JSON.parse(await readAsText(jsonFiles[0]))
    const json1 = JSON.parse(await readAsText(jsonFiles[1]))
    const bundleHash = editor()?.bundleHash

    if (json0.__h && json0.__h === bundleHash) {
      tempPreset = json0
      tempJson = json1
    } else if (json1.__h && json1.__h === bundleHash) {
      tempPreset = json1
      tempJson = json0
    } else {
      showAlert(err)
      return
    }

    mode.value = 'files'
    infoFiles.value = `${imageFile.name}, ${jsonFiles.map((f) => f.name).join(', ')}`
    previewSrc.value = tempImage = await readAsDataURL(imageFile)
    loadOk.value = true
    ;(e.target as HTMLInputElement).value = ''
  } catch (err) {
    showAlert('Something went wrong!')
    console.log(err)
  }
}

function handleZip(e: Event) {
  try {
    const files = (e.target as HTMLInputElement).files
    const err = 'Please provide a ZIP file.'

    if (!files || files.length !== 1) {
      showAlert(err)
      return
    }
    zipFile.value = files[0]
    if (zipFile.value?.type !== 'application/zip') {
      showAlert(err)
      return
    }
    infoZip.value = zipFile.value.name
    mode.value = 'zip'
    ;(e.target as HTMLInputElement).value = ''
    loadOk.value = true
  } catch {
    showAlert('Something went wrong!')
  }
}

async function load() {
  if (mode.value === 'zip' && zipFile.value) {
    editor()?.loadLocalZipBundle(zipFile.value)
  } else if (mode.value === 'files' && tempPreset && tempImage && tempJson) {
    await editor()?.initBundle(tempPreset, tempImage, tempJson)
  }
  visible.value = false
}

function showAlert(message: string) {
  ElNotification.error({ title: 'Error', message })
}

function findType(files: FileList, type: string): File[] {
  const ret: File[] = []
  for (let i = 0; i < files.length; i++) {
    if (files[i].type === type) ret.push(files[i])
  }
  return ret
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
    color: #7f7f7f;
    margin-top: 10px;
    line-height: $height;
    text-align: center;
    font-size: 1.2rem;
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

  .spritesheet-preview img {
    width: 100%;
  }
</style>
