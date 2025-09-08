import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    // This proxy is useful when running with `vercel dev`
    // which starts the serverless functions on a different port.
    proxy: {
      '/api': 'http://localhost:3000' 
    }
  }
})
