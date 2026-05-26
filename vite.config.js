import react from '@vitejs/plugin-react'
import { defineConfig, loadEnv } from 'vite'
import path from 'path'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')

  return {
    // Relative base so the packaged Electron app loads assets from file://
    base: mode === 'production' ? './' : '/',
    plugins: [react()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
    },
    server: {
      proxy: {
        '/api/azure': {
          target: env.VITE_AZURE_OPENAI_ENDPOINT,
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api\/azure/, ''),
        },
      },
    },
  }
})
