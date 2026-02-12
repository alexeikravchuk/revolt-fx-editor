<template>
  <div>
    <el-dialog v-model="visible" title="Show Bundle JSON" width="500px">
      <el-input class="code" type="textarea" :rows="10" readonly v-model="bundle" placeholder="Name"></el-input>
      <el-button-group style="margin-top: 5px">
        <el-button type="primary" size="small" @click="copy">Copy</el-button>
        <el-button type="primary" size="small" @click="save">Save</el-button>
      </el-button-group>
      <template #footer>
        <el-button type="primary" @click="visible = false">OK</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, getCurrentInstance } from 'vue'
import { useStore } from 'vuex'
import { ElMessage } from 'element-plus'

defineOptions({ name: 'ShowBundleJson' })

const store = useStore()
const instance = getCurrentInstance()
const editor = () => instance?.appContext.config.globalProperties.$editor

const visible = ref(false)
const bundle = ref('')

function show() {
  visible.value = true
  bundle.value = JSON.stringify(store.state.bundle)
}

async function copy() {
  try {
    await navigator.clipboard.writeText(bundle.value)
    ElMessage.success('Copied')
  } catch {
    ElMessage.error('Error')
  }
}

function save() {
  const b = store.state.bundle
  editor()?.saveJsonLocal(b.name || 'bundle', b)
}

defineExpose({ show })
</script>

<style lang="scss" scoped>
.code {
  font-family: monospace;
}
</style>
