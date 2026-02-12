# Vue 2 style → Vue 3 style in this project

The app already runs on Vue 3 but many components are written in **Vue 2 style** (Options API + old patterns). Below is how the same things look in **Vue 3 style**.

---

## 1. `.sync` → `v-model:prop`

**Vue 2 (current):**
```vue
<min-max-number-value :min.sync="data.scaleMin" :max.sync="data.scaleMax"/>
```

**Vue 3:** Same meaning, different syntax (child still emits `update:min` / `update:max`):
```vue
<min-max-number-value v-model:min="data.scaleMin" v-model:max="data.scaleMax"/>
```

No change needed in `MinMaxNumberValue.vue` — it already uses `$emit('update:min', ...)`.

---

## 2. Options API → Composition API (`<script setup>`)

| Vue 2 style | Vue 3 style |
|-------------|-------------|
| `data() { return { x: 0 } }` | `const x = ref(0)` |
| `computed: { y() { return ... } }` | `const y = computed(() => ...)` |
| `methods: { fn() { } }` | `function fn() { }` |
| `created()` / `mounted()` | `onMounted(() => { })` |
| `this.$store` | `const store = useStore()` |
| `this.$eventBus` | `const eventBus = inject('eventBus')` or global |
| `this.$editor` / `this.$fx` | `inject('editor')` / `inject('fx')` or global |
| `props: ['data']` | `defineProps<{ data: Object }>()` or `defineProps(['data'])` |
| `ref="effectList"` + `this.$refs.effectList` | `const effectList = ref(null)` |

---

## 3. Event bus

**Vue 2 style:** `this.$eventBus.$on(...)` / `$emit` (via `globalProperties`).

**Vue 3 style options:**
- Keep current approach (mitt + `globalProperties`) — works.
- Or `provide('eventBus', eventBus)` in `main.js` and `const eventBus = inject('eventBus')` in components.

---

## 4. Global properties ($editor, $fx)

**Vue 2 style:** `this.$editor`, `this.$fx` (set on `app.config.globalProperties`).

**Vue 3 style:** In Composition API / `<script setup>` either:
- `const { proxy } = getCurrentInstance(); proxy.$editor`, or
- `inject('editor')` / `inject('fx')` and `provide('editor', editor)` in `App.vue` when editor is ready.

---

## 5. Watchers

**Vue 2:**
```js
watch: {
  'data': { immediate: true, handler(newVal) { } },
  'effect.delay': { handler() { this.sortEffects(); } }
}
```

**Vue 3:**
```js
watch(() => props.data, (newVal) => { }, { immediate: true })
watch(() => effect.value?.delay, () => sortEffects())
```

---

## 6. Template

- `v-model` on components: same in Vue 3 (component uses `modelValue` + `update:modelValue`).
- `#footer` for slots: same as Vue 2 `slot="footer"` (already used in project).
- No filters in Vue 3 — use a method or `computed` instead.

---

## Example: SidePanel in Vue 3 style

See `SidePanel.vue.composition-api.example` or the refactored file if present.
