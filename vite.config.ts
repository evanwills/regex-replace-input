import { defineConfig } from 'vite'

// https://vitejs.dev/config/
export default defineConfig({
  build: {
    lib: {
      entry: 'src/regex-replace.ts',
      formats: ['es']
    },
    rollupOptions: {
      // external: /^lit/
      external: ''
    }
  }
})
