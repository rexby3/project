import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

// During `vite dev` the web app runs on :5173 and proxies /api to the
// backend on :8080. In production the backend serves the built files,
// so requests are same-origin and no proxy is needed.
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api': 'http://localhost:8080',
    },
  },
  build: {
    outDir: 'dist',
    emptyOutDir: true,
  },
});
