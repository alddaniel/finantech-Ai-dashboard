import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  define: {
    'process.env.API_KEY': JSON.stringify(process.env.VITE_GEMINI_API_KEY)
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            if (id.includes('recharts')) {
              return 'vendor_recharts';
            }
            if (id.includes('react')) {
                return 'vendor_react';
            }
            if (id.includes('html2canvas') || id.includes('jspdf') || id.includes('qrcode')) {
                return 'vendor_gfx';
            }
            return 'vendor'; // all other node_modules
          }
        }
      }
    }
  }
})