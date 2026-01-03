import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, '.', '');
  return {
    server: {
      host: '0.0.0.0',
    },
    plugins: [react()],
    define: {
      'process.env.API_KEY': JSON.stringify(env.GEMINI_API_KEY),
      'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY)
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      }
    },
<<<<<<< HEAD

=======
    optimizeDeps: {
      include: ['react', 'react-dom', 'lucide-react', 'recharts', '@google/genai']
    }
>>>>>>> db1bc07f917dd7fccf1952c84c95a6d6fd32bac8
  };
});
