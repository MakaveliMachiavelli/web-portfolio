import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    host: true,
    watch: {
      ignored: [
        '**/dist/**',
        '**/node_modules/**',
        '**/.git/**',
        '**/ai video generation/**',
        '**/GLB/**',
        '**/public/frames/**',
        '**/public/*.mp4',
        '**/*.mp4',
        '**/*.mp3',
        '**/*.glb'
      ]
    }
  },
  build: {
    chunkSizeWarningLimit: 1000,
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor-animation': ['gsap', 'lenis'],
          'vendor-framer': ['framer-motion'],
          'vendor-icons': ['lucide-react'],
          'vendor-react': ['react', 'react-dom']
        }
      }
    }
  }
});
