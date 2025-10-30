import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],

  // ✅ make sure public/ files (manifest.json, service-worker.js, icons etc.) are copied correctly
  publicDir: 'public',

  // ✅ ensure index.html fallback for React Router
  server: {
    historyApiFallback: true,
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:5000',
        changeOrigin: true,
        secure: false,
      },
    },
  },

  // ✅ ensure Rollup picks up index.html and doesn't ignore public files
  build: {
    rollupOptions: {
      input: {
        main: './index.html',
      },
    },
  },
})
