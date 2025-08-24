import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, '.', '');

  return {
    plugins: [react()],
    define: {
      'process.env.API_KEY': JSON.stringify(env.GEMINI_API_KEY),
      'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY),
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    preview: {
      host: true, // bind to 0.0.0.0 so Render can detect the port
      port: Number(process.env.PORT) || 4173,
      allowedHosts: ['cfml-formatter-pro-1.onrender.com'],
    },
    server: {
      host: true, // optional for local dev on 0.0.0.0
    },
  };
});
