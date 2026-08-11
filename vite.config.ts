import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  base: './',
  plugins: [react(), tailwindcss()],
  build: {
    target: 'es2022',
    // The three/r3f chunk is large by nature and is lazy-loaded behind a
    // Suspense boundary, so it never blocks first paint. The default warning
    // would flag it on every build for no action.
    chunkSizeWarningLimit: 1400,
    rollupOptions: {
      output: {
        // Keep the 3D payload out of the initial parse. The canvas module is
        // lazy-loaded, so three/drei land in their own chunk.
        manualChunks(id) {
          if (id.includes('node_modules/three')) return 'three'
          if (id.includes('@react-three') || id.includes('node_modules/postprocessing')) return 'r3f'
        },
      },
    },
  },
})
