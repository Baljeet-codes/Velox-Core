import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

const backendPort = process.env.BACKEND_PORT || "8001";
const frontendPort = parseInt(process.env.VITE_PORT || "5175", 10);

export default defineConfig({
  plugins: [react()],
  server: {
    port: frontendPort,
    strictPort: false,
    proxy: {
      '/static': {
        target: `http://localhost:${backendPort}`,
        changeOrigin: true,
      },
    },
  },
})