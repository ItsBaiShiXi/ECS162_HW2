import { defineConfig } from 'vite'
import { svelte } from '@sveltejs/vite-plugin-svelte'

// https://vite.dev/config/
export default defineConfig(({ mode }) => ({
  plugins: [svelte()],
  server: mode === 'development' ? {
    proxy: {
      '/api': {
        target: 'http://backend:8000',
        changeOrigin: true,
        secure: false,
        configure: (proxy, options) => {
          proxy.on('proxyReq', (proxyReq, req, res) => {
            console.log('Proxying request:', req.url)
          })
        }
      },
    },
  } : undefined,

  // Vitest config for testing
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/tests/setup.ts'],
    globals: true,
  },
  // Tell Vitest to use the "browser" entry points in "package.json" files
  resolve: process.env.VITEST
    ? {
      conditions: ['browser'],
    }
    : undefined
}))
