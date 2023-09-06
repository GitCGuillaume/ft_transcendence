import { defineConfig, loadEnv } from 'vite'
import { readFileSync } from 'fs';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
// https://vitejs.dev/guide/api-javascript.html#loadenv
// global, package randomstring need it
export default defineConfig(({mode}) => {
  process.env = Object.assign(process.env, loadEnv(mode, process.cwd()))
  return ({
    plugins: [react()],
    define: {
      global: {}
    },
    server: {
      watch: {
        usePolling: true
      },
      https: {
        key: readFileSync(process.env.VITE_HTTPS_KEY),
        cert: readFileSync(process.env.VITE_HTTPS_CERT),
      },
      host: true,
      port: 5173,
      hmr: {
        path: '/hmr/',
        clientPort: 4000,
        protocol: 'wss'
      }
    }
  });
})