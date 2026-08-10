import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

const __dirname = dirname(fileURLToPath(import.meta.url));

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, '.', '');
  const apiProxyTarget = env.VITE_API_PROXY_TARGET || 'http://localhost:3001';

  return {
    base: '/',
    server: {
      port: 3000,
      host: '0.0.0.0',
      proxy: {
        '/api': {
          target: apiProxyTarget,
          changeOrigin: true,
          secure: false,
        },
      },
    },
    plugins: [react()],
    define: {
      'process.env.REACT_APP_USE_REAL_AI': JSON.stringify(env.VITE_USE_REAL_AI || 'true'),
      'process.env.REACT_APP_USE_REAL_DATA': JSON.stringify(env.VITE_USE_REAL_DATA || 'true'),
      'process.env.REACT_APP_USE_REAL_BACKEND': JSON.stringify(env.VITE_USE_REAL_BACKEND || 'true'),
      'process.env.REACT_APP_SHOW_DEMO_INDICATORS': JSON.stringify(env.VITE_SHOW_DEMO_INDICATORS || 'false'),
      'process.env.REACT_APP_ENABLE_ANALYTICS': JSON.stringify(env.VITE_ENABLE_ANALYTICS || 'false'),
      'process.env.REACT_APP_ENABLE_AUTH': JSON.stringify(env.VITE_ENABLE_AUTH || 'false'),
      'process.env.REACT_APP_API_BASE_URL': JSON.stringify('/api'),
      'process.env.NODE_ENV': JSON.stringify('development'),
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
  };
});
