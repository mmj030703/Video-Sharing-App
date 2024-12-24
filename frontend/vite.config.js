import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: 'https://video-sharing-app-2n9p.onrender.com',
        changeOrigin: true,
      },
    },
  },
});

