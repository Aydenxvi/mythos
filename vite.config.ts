import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Relative asset URLs work both at the domain root and on GitHub Pages
// (https://username.github.io/repository/). No router/server rewrite needed.
export default defineConfig({
  base: './',
  plugins: [react()],
  build: {
    target: 'es2020',
    cssCodeSplit: true,
  },
})
