// vite.config.js
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [
    react({
      include: '**/*.{js,jsx,ts,tsx}',  // ← treat .js as JSX too
    }),
  ],
  server: { port: 3000 },
})