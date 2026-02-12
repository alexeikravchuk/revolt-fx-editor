<template>
  <div>
    <div>Sequence</div>
    <div class="head">{{data.name}}</div>

    <value-group label="Base">
      <help text="Initial delay">
        <number-value :lower-limit="0" :step="0.1" label="Delay" v-model="data.delay"/>
      </help>
      <help text="Scale modifier applied to all effects">
        <min-max-number-value label="Scale" :lower-limit="0" :step="0.01" v-model:min="data.scaleMin" v-model:max="data.scaleMax"/>
      </help>

      <help text="Delay time-sorted effect list">
        <value-element label="Effects">
          <list
            ref="effectList"
            :cloneButton="false"
            :renameButton="false"
            :elements="data.effects"
            :useDefaultNamePrompt="false"
            :nameCallback="getName"
            :iconCallback="getIcon"
            :prefixCallback="getDelay"
            :alwaysSelect="false"
            @select="onSelect"
            @add="onAdd"
            @remove="onRemove"
          />
        </value-element>
      </help>
    </value-group>

    <value-group v-if="effect" label="Effect">
      <p>{{getName(effect)}}</p>

      <number-value :lower-limit="0" :step="0.1" label="Delay" v-model="effect.delay"/>

      <div v-if="effect.componentType==0">
        <number-value :lower-limit="0" :step="0.1" label="Duration" v-model="effect.duration"/>
        <value-element label="Component">
          <better-image-select v-model="effect.componentId" :textures="spriteTextures"/>
        </value-element>
        <min-max-number-value label="Anchor" :lower-limit="0" :upper-limit="1" :step="0.1" min-label="X" max-label="Y" v-model:min="effect.componentParams.anchorX"
                              v-model:max="effect.componentParams.anchorY"/>
        <min-max-number-value label="Alpha" :lower-limit="0" :upper-limit="1" :step="0.01" v-model:min="effect.alphaMin" v-model:max="effect.alphaMax"/>
        <min-max-number-angle-degrees-value  label="Rotation" :step="1" v-model:min="effect.rotationMin" v-model:max="effect.rotationMax"/>
        <select-value label="Blend Mode" v-model="effect.blendMode" :options="blendModes"/>
        <color-value label="Tint" v-model="effect.tint"/>
      </div>

      <div v-if="effect.componentType==1">
        <number-value :lower-limit="0" :step="0.1" label="Duration" v-model="effect.duration"/>
        <value-element label="Component">
          <better-image-select v-model="effect.componentId" :textures="movieClipTextures"/>
        </value-element>
        <value-element>
          <el-checkbox v-model="effect.componentParams.loop">Loop</el-checkbox>
        </value-element>
        <min-max-number-value label="Anchor" :lower-limit="0" :upper-limit="1" :step="0.1" min-label="X" max-label="Y" v-model:min="effect.componentParams.anchorX"
                              v-model:max="effect.componentParams.anchorY"/>
        <min-max-number-value label="Animation Speed" :lower-limit="0" :step="0.01" v-model:min="effect.componentParams.animationSpeedMin" v-model:max="effect.componentParams.animationSpeedMax"/>
        <min-max-number-value label="Alpha" :lower-limit="0" :upper-limit="1" :step="0.01" v-model:min="effect.alphaMin" v-model:max="effect.alphaMax"/>
        <min-max-number-angle-degrees-value label="Rotation" :step="1" v-model:min="effect.rotationMin" v-model:max="effect.rotationMax"/>
        <select-value label="Blend Mode" v-model="effect.blendMode" :options="blendModes"/>
        <color-value label="Tint" v-model="effect.tint"/>
      </div>

      <div v-if="effect.componentType==2">
        <value-element label="Emitter">
          <el-select v-model="effect.componentId" size="small" placeholder="Select Emitter">
            <el-option
              v-for="item in emitters" :key="item.id"
              :value="item.id"
              :label="item.name"
            />
          </el-select>
        </value-element>
      </div>

      <div v-if="effect.componentType==3">
        <value-element label="Trigger Value">
          <el-input v-model="effect.triggerValue" placeholder="Value"></el-input>
        </value-element>
      </div>

      <div v-if="effect.componentType != 3">
        <min-max-number-value label="Scale" :lower-limit="0" :step="0.01" v-model:min="effect.scaleMin" v-model:max="effect.scaleMax"/>
        <value-element label="Container ID">
          <el-input v-model="effect.containerId" placeholder="Id"></el-input>
        </value-element>
      </div>

    </value-group>

    <el-dialog v-model="modalVisible" title="Add Component" width="400px">
      <value-group>
        <p v-if="emitters.length > 0">
          <el-button type="primary" class="button" plain @click="onAddEffect($event, 2)">Particle Emitter</el-button>
        </p>
        <p v-if="spriteImagesList.length > 0">
          <el-button type="primary" class="button" plain @click="onAddEffect($event, 0)">Sprite</el-button>
        </p>
        <p v-if="moveClipImagesList.length > 0">
          <el-button type="primary" class="button" plain @click="onAddEffect($event, 1)">Movieclip</el-button>
        </p>
        <p>
          <el-button type="primary" class="button" plain @click="onAddEffect($event, 3)">Trigger</el-button>
        </p>
      </value-group>
      <template #footer>
        <el-button type="primary" @click="modalVisible=false">Cancel</el-button>
      </template>
    </el-dialog>

  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, getCurrentInstance } from 'vue'
import { useStore } from 'vuex'
import ValueGroup from './values/ValueGroup.vue'
import NumberValue from './values/NumberValue.vue'
import ValueElement from './values/ValueElement.vue'
import List from './list/List.vue'
import BetterImageSelect from './imageselect/BetterImageSelect.vue'
import MinMaxNumberValue from './values/MinMaxNumberValue.vue'
import SelectValue from './values/SelectValue.vue'
import ColorValue from './values/ColorValue.vue'
import Help from './Help.vue'
import MinMaxNumberAngleDegreesValue from './values/MinMaxNumberAngleDegreesValue.vue'
import * as _ from 'lodash'

defineOptions({ name: 'SequenceValues' })
const props = defineProps<{ data: any }>()

const store = useStore()
const instance = getCurrentInstance()
const editor = () => instance?.appContext.config.globalProperties.$editor
const fx = () => instance?.appContext.config.globalProperties.$fx

const effect = ref<any>(null)
const modalVisible = ref(false)
const scale = ref(1)

const emitters = computed(() => _.sortBy(store.state.bundle.emitters.slice(), 'name'))
const blendModes = computed(() => editor()?.blendModes ?? [])
const spriteTextures = computed(() => editor()?.spritesheetImagesMap ?? {})
const movieClipTextures = computed(() => editor()?.moveClipImagesMap ?? {})
const spriteImagesList = computed(() => editor()?.spritesheetImagesList ?? [])
const moveClipImagesList = computed(() => editor()?.moveClipImagesList ?? [])

watch(() => effect.value?.delay, () => sortEffects())

function getName(eff: any) {
  if (!eff) return ''
  switch (eff.componentType) {
    case 2:
      return `Emitter '${(fx()?.getParticleEmitterById(eff.componentId) as any)?.name ?? ''}'`
    case 0:
      return 'Sprite'
    case 1:
      return 'Movieclip'
    case 3:
      return `Trigger '${eff.triggerValue}'`
    default:
      return ''
  }
}

function getIcon(eff: any) {
  if (!eff) return null
  switch (eff.componentType) {
    case 0:
      return editor()?.spritesheetImagesMap[eff.componentId]?.image?.src ?? null
    case 1:
      return editor()?.moveClipImagesMap[eff.componentId]?.image?.src ?? null
    default:
      return null
  }
}

function getDelay(eff: any) {
  return eff ? `${Number(eff.delay).toFixed(2)}s` : ''
}

function onSelect(entry: any) {
  effect.value = entry.data
}

function onAddEffect(_e: Event, value: number) {
  modalVisible.value = false
  const ed = editor()
  if (!ed || !props.data) return

  const data: any = {
    id: props.data.__cid++,
    componentId: null,
    componentType: value,
    delay: 0,
    componentParams: {
      animationSpeedMin: 1,
      animationSpeedMax: 1,
      anchorX: 0.5,
      anchorY: 0.5,
      loop: false,
    },
    scaleMin: 1,
    scaleMax: 1,
    alphaMin: 1,
    alphaMax: 1,
    rotationMin: 0,
    rotationMax: 0,
    blendMode: 1,
    duration: 0.1,
    tint: 0xffffff,
    containerId: '',
    triggerValue: '',
  }

  if (value === 0 && ed.spritesheetImagesList?.length) data.componentId = ed.spritesheetImagesList[0].name
  else if (value === 1 && ed.moveClipImagesList?.length) data.componentId = ed.moveClipImagesList[0].name
  else if (value === 2 && emitters.value.length) data.componentId = emitters.value[0].id

  props.data.effects.push(data)
  sortEffects()
}

function onAdd() {
  modalVisible.value = true
  scale.value = 1
}

function onRemove(entry: any) {
  const index = props.data.effects.indexOf(entry.data)
  if (index > -1) props.data.effects.splice(index, 1)
}

function sortEffects() {
  if (props.data?.effects) props.data.effects.sort((a: any, b: any) => a.delay - b.delay)
}
</script>

<style lang="scss" scoped>

  .head {
    color: #409eff;
    font-size: 1.3rem;
    font-weight: 400;
  }

  .button {
    width: 100%;
  }

  p {
    margin-top: 5px;
    margin-bottom: 5px;
  }
</style>
