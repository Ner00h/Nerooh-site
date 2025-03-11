import { defineConfig } from 'vite';

export default defineConfig({
  optimizeDeps: {
    include: ['firebase/app', 'firebase/auth', 'firebaseui'],
  },
  resolve: {
    alias: {
      'firebaseui': 'firebaseui/dist/firebaseui.js'
    }
  },
  base: '/',
}); 