import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')

  return {
    plugins: [react()],
    server: {
      host: true,
      port: 5173,
      proxy: {
        "/api": {
          target: env.VITE_BACKEND_URL,
          changeOrigin: true,
          secure: false,
          rewrite: (path) => path.replace(/^\/api/, "")
        },
        '/auth': {
          target: env.VITE_BACKEND_URL,
          changeOrigin: true,
          secure: false,
        },
      }
    },
    build: {
      outDir: 'dist',
      sourcemap: mode !== 'production',
      minify: 'esbuild',
    },
    base: '/'
  }
})