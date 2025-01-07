import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: 'https://video-sharing-app-2n9p.onrender.com',
        changeOrigin: true,
        configure: (proxyServer) => {
          proxyServer.on('proxyReq', (proxyReq, req, res) => {
            console.log('Proxying request URL:', req.url);
            console.log('Headers:', req.headers);
            // Avoid trying to log req.body directly in a proxy
          });

          proxyServer.on('proxyRes', (proxyRes, req, res) => {
            console.log('Received response for:', req.url);
            console.log('Status Code:', proxyRes.statusCode);
          });
        },
        timeout: 120000, // Set timeout for large requests (e.g., 2 minutes)
      },
    },
  },
});
