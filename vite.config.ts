import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    proxy: {
      '/TAP/sync': {
        target: 'https://exoplanetarchive.ipac.caltech.edu',
        changeOrigin: true,
        secure: false,
      }
    }
  }
})
