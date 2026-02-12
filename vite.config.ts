import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { fileURLToPath, URL } from 'node:url'

export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
      url: fileURLToPath(new URL('./src/lib/url-browser.ts', import.meta.url)),
      path: 'path-browserify',
    },
  },
  base: './',
  publicDir: 'static',
  server: {
    port: 8080,
  },
  build: {
    chunkSizeWarningLimit: 1000,
    rollupOptions: {
      onwarn(warning, warn) {
        if (warning.code === 'EVAL' && warning.id?.includes('js-md5')) return
        warn(warning)
      },
      output: {
        manualChunks: {
          'vendor-pixi': ['pixi.js'],
          'vendor-element': ['element-plus'],
          'vendor-revolt': ['revolt-fx'],
        },
      },
    },
  },
})
