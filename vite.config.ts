import { defineConfig, loadEnv, Plugin } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { createAiMiddleware } from './server/aiMiddleware.js';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // Load environment variables from .env and .env.local into process.env on server
  const env = loadEnv(mode, process.cwd(), '');
  for (const key of Object.keys(env)) {
    if (!process.env[key]) {
      process.env[key] = env[key];
    }
  }

  const bharatCodePlugin: Plugin = {
    name: 'bharatcode-ai-proxy',
    configureServer(server) {
      server.middlewares.use(createAiMiddleware());
    },
    configurePreviewServer(server) {
      server.middlewares.use(createAiMiddleware());
    },
  };

  return {
    plugins: [react(), bharatCodePlugin],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
    },
    server: {
      port: 5173,
      host: true,
    },
    build: {
      chunkSizeWarningLimit: 1000,
      rollupOptions: {
        output: {
          manualChunks: {
            map: ['leaflet'],
            charts: ['recharts'],
            icons: ['lucide-react'],
          },
        },
      },
    },
  };
});
