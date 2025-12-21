import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  // Github Pages用のbaseパス設定
  // 開発環境では '/' を使用し、本番環境では '/tishii_zikken_app/' を使用
  // 開発時は base: '/' に変更してください
  base: '/',
})

