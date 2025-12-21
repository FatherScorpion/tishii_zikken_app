import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig(({ command }) => {
  // 開発環境（serve）では '/'、本番環境（build）では '/tishii_zikken_app/' を使用
  const base = command === 'serve' ? '/' : '/tishii_zikken_app/'
  
  return {
    plugins: [react()],
    base: base,
  }
})

