import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import path from 'path'
import tailwindcss from '@tailwindcss/vite'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    proxy: {
      // Same-origin proxy so browser debug logs reach the local ingest server (avoids CORS).
      '/ingest/fb9c849e-37ad-4a71-b70c-257ccd07e08d': {
        target: 'http://127.0.0.1:7881',
        changeOrigin: true,
      },
    },
  },
  /** Recharts imports `react-is`; ensure it’s pre-bundled so dev server resolves it. */
  optimizeDeps: {
    include: ['react-is', 'recharts'],
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
})
