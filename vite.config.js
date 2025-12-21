import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  // Github Pages用のbaseパス設定
  // リポジトリ名がURLに含まれる場合は、baseを設定してください
  // 例: base: '/tishii_zikken_app/'
  // カスタムドメインを使用する場合は base: '/' のままにしてください
  base: '/',
})

