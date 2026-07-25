import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  // Nginx serves /var/www/fairchain/frontend/build, so keep CRA's output path
  // rather than Vite's default dist/.
  build: {
    outDir: 'build',
  },
  server: {
    host: '127.0.0.1',
    port: 15410,
  },
  preview: {
    host: '127.0.0.1',
    port: 15411,
  },
});
