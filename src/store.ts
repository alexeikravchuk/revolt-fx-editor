import { createStore } from 'vuex'
import { FX, BundleDefinition, EmitterPreset, SequencePreset } from 'revolt-fx'
import { Editor } from './editor/editor.ts'
import _ from 'lodash'

export const INIT_BUNDLE = 'INIT_BUNDLE'
export const SET_BUNDLE = 'SET_BUNDLE'
export const SET_BUNDLE_NAME = 'SET_BUNDLE_NAME'

export const ADD_EMITTER_PRESET = 'ADD_EMITTER_PRESET'
export const DELETE_EMITTER_PRESET = 'DELETE_EMITTER_PRESET'
export const CLONE_EMITTER_PRESET = 'CLONE_EMITTER_PRESET'
export const RENAME_EMITTER_PRESET = 'RENAME_EMITTER_PRESET'

export const ADD_SEQUENCE_PRESET = 'ADD_SEQUENCE_PRESET'
export const DELETE_SEQUENCE_PRESET = 'DELETE_SEQUENCE_PRESET'
export const CLONE_SEQUENCE_PRESET = 'CLONE_SEQUENCE_PRESET'
export const RENAME_SEQUENCE_PRESET = 'RENAME_SEQUENCE_PRESET'

interface State {
  bundle: BundleDefinition
  settings: {
    tt: {
      delay: number
      effect: string
      placement: string
    }
  }
  spritesheet: {
    imageName: string
    jsonName: string
    json: any
    image: any
  }
}

// Generate unique ID (unused but kept for potential future use)
// const getId = (): string => {
//   return (([1e7] as any) + -1e3 + -4e3 + -8e3 + -1e11).replace(/[018]/g, (a: number) =>
//     (a ^ ((Math.random() * 16) >> (a / 4))).toString(16)
//   )
// }

const state: State = {
  bundle: {
    name: '',
    id: '',
    maxParticles: 5000,
    useBlendModes: true,
    emitters: [],
    sequences: [],
    spritesheetFilter: '',
    __eid: 0,
    __sid: 0,
    __h: '80c6df7fb0d3d898f34ce0031c037fef',
    __v: 0,
  },
  settings: {
    tt: {
      delay: 1500,
      effect: 'dark',
      placement: 'left',
    },
  },
  spritesheet: {
    imageName: '',
    jsonName: '',
    json: null,
    image: null,
  },
}

const mutations = {
  [INIT_BUNDLE](state: State, p: { name: string; spritesheetFilter: string }): void {
    state.bundle.name = p.name
    state.bundle.id = ''
    state.bundle.emitters = []
    state.bundle.sequences = []
    state.bundle.spritesheetFilter = p.spritesheetFilter
    state.bundle.__eid = 0
    state.bundle.__sid = 0
    state.bundle.__v = FX.settingsVersion
  },

  [SET_BUNDLE](state: State, bundle: BundleDefinition): void {
    state.bundle = bundle
    sort(state.bundle.emitters)
    sort(state.bundle.sequences)
  },

  [SET_BUNDLE_NAME](state: State, name: string): void {
    state.bundle.name = name
  },

  // Effect Sequence
  [ADD_SEQUENCE_PRESET](state: State, name: string): void {
    const preset = createSequencePreset(state, name)
    state.bundle.sequences.push(preset)
    Editor.fx.addEffectSequence(preset.id, preset)
  },

  [DELETE_SEQUENCE_PRESET](state: State, preset: SequencePreset): void {
    const index = state.bundle.sequences.indexOf(preset)
    if (index !== -1) {
      state.bundle.sequences.splice(index, 1)
      sort(state.bundle.sequences)
    }
  },

  [CLONE_SEQUENCE_PRESET](state: State, payload: { preset: SequencePreset; name: string }): void {
    const clone = JSON.parse(JSON.stringify(payload.preset))
    clone.id = state.bundle.__sid++
    clone.name = payload.name
    state.bundle.sequences.push(clone)
    Editor.fx.addEffectSequence(clone.id, clone)
  },

  [RENAME_SEQUENCE_PRESET](_state: State, payload: { preset: SequencePreset; name: string }): void {
    payload.preset.name = payload.name
  },

  // Particle Emitter
  [ADD_EMITTER_PRESET](state: State, name: string): void {
    const preset = createEmitterPreset(state, name)
    state.bundle.emitters.push(preset)
    sort(state.bundle.emitters)
    Editor.fx.addParticleEmitter(preset.id, preset)
  },

  [DELETE_EMITTER_PRESET](state: State, preset: EmitterPreset): void {
    const index = state.bundle.emitters.indexOf(preset)
    if (index !== -1) {
      state.bundle.emitters.splice(index, 1)
    }
  },

  [CLONE_EMITTER_PRESET](state: State, payload: { preset: EmitterPreset; name: string }): void {
    const clone = JSON.parse(JSON.stringify(payload.preset))
    clone.id = state.bundle.__eid++
    clone.name = payload.name
    state.bundle.emitters.push(clone)
    Editor.fx.addParticleEmitter(clone.id, clone)
  },

  [RENAME_EMITTER_PRESET](_state: State, payload: { preset: EmitterPreset; name: string }): void {
    payload.preset.name = payload.name
  },
}

const sort = (_list: any[]): void => {
  // Note: _.sortBy returns a new array, doesn't mutate in place
  // If sorting is needed, use: list.sort((a, b) => a.name.localeCompare(b.name))
}

const store = createStore({ state, mutations })

const createSequencePreset = (state: State, name: string): SequencePreset => {
  return {
    id: state.bundle.__sid++,
    name: name,
    type: 1,
    delay: 0,
    scaleMin: 1,
    scaleMax: 1,
    effects: [],
    __cid: 0,
  }
}

const createEmitterPreset = (state: State, name: string): EmitterPreset => {
  const list = Editor.instance.spritesheetImagesList
  const spriteId = list[0].name

  return {
    id: state.bundle.__eid++,
    name: name,
    type: 0,

    core: {
      type: 'circle',
      params: {
        radius: 100,
        radial: true,
        angle: 6.28318530718,
        uniform: false,
        width: 100,
        height: 100,
      },
    },
    spawnFrequencyMin: 0.1,
    spawnFrequencyMax: 0.1,
    maxParticles: 1000,
    spawnCountMin: 1,
    spawnCountMax: 1,
    duration: 0,
    infinite: true,
    useGravity: false,
    gravity: 0,
    useFloor: false,
    floorY: 0,
    rotation: 0,
    autoRotation: 0,

    particleSettings: {
      componentType: 0,
      componentId: spriteId,
      componentParams: {
        animationSpeedMin: 0.1,
        animationSpeedMax: 0.5,
        anchorX: 0.5,
        anchorY: 0.5,
        loop: false,
      },
      durationMin: 1,
      durationMax: 2,
      distanceMin: 0,
      distanceMax: 0,
      distanceEase: 'linear',

      moveSpeedMin: 0,
      moveSpeedMax: 0,
      bounceFacMin: 0,
      bounceFacMax: 0,
      frictionMin: 0,
      frictionMax: 0,

      useMotion: false,
      useRotation: false,
      useAlpha: false,
      useScale: false,
      useTint: false,
      useChilds: false,
      useSpawns: false,

      stopOnBounce: false,

      align: false,

      blendMode: 1,

      addOnTop: true,

      rotationSpeedMin: 0,
      rotationSpeedMax: 0,
      randomRotationDirection: false,
      randomStartRotation: false,

      fadeIn: true,
      fadeInDurationFac: 0.2,
      fadeInEase: 'linear',

      alphaStartMin: 1,
      alphaStartMax: 1,
      alphaEndMin: 0,
      alphaEndMax: 0,
      alphaEase: 'linear',

      tintStart: 0xffffff,
      tintEnd: 0xffffff,
      tintEase: 'linear',

      scaleIn: false,
      scaleInDurationFac: 0.2,
      scaleInEase: 'linear',

      uniformScale: true,

      scaleXStartMin: 1,
      scaleXStartMax: 1,
      scaleXEndMin: 1,
      scaleXEndMax: 1,
      scaleXEase: 'linear',

      scaleYStartMin: 1,
      scaleYStartMax: 1,
      scaleYEndMin: 1,
      scaleYEndMax: 1,
      scaleYEase: 'linear',

      scaleStartMin: 1,
      scaleStartMax: 1,
      scaleEndMin: 1,
      scaleEndMax: 1,
      scaleEase: 'linear',

      childs: [],
      spawn: {
        onComplete: [],
        onBounce: [],
        onStart: [],
        onHalfway: [],
      },
    },
    childs: [],
  }
}

export default store
