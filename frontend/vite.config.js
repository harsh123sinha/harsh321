import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const apiBase = (env.VITE_API_BASE_URL || 'http://127.0.0.1:5000/api').trim();
  const backendOrigin =
    apiBase.replace(/\/api\/?$/i, '').replace(/\/+$/, '') || 'http://127.0.0.1:5000';

  return {
    plugins: [react()],
    server: {
      port: 5173,
      open: true,
      proxy: {
        // Same-origin /images/* in dev (see `getImageUrl` in api.js).
        '/images': {
          target: backendOrigin,
          changeOrigin: true,
        },
      },
    },
  };
});
