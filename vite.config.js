import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true,
        // Remove the rewrite rule - we want to keep /api in the path
      },
      '/chat': {
        target: 'http://localhost:3001',
        changeOrigin: true,
      },
    
      '/health': {
        target: 'http://localhost:3001',
        changeOrigin: true,
      },
      '/test': {
        target: 'http://localhost:3001',
        changeOrigin: true,
      }
    }
  }
})