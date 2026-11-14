import react from '@vitejs/plugin-react'
import { defineConfig, loadEnv } from 'vite'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  return {
    plugins: [react()],
    server: {
      // 로컬 개발: /api 요청을 백엔드로 넘긴다. 주소는 .env.local의 VITE_API_PROXY_TARGET (기본 8080)
      proxy: {
        '/api': env.VITE_API_PROXY_TARGET || 'http://localhost:8080',
      },
    },
  }
})
