import { defineConfig } from 'vite'
import path from 'path'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:4000',
        changeOrigin: true,
      },
      // provinces.open-api.vn — địa giới hành chính VN (tỉnh → quận/huyện → phường/xã)
      '/vn-address': {
        target: 'https://provinces.open-api.vn',
        changeOrigin: true,
        secure: true,
        rewrite: (path) => path.replace(/^\/vn-address/, '/api'),
      },
    },
  },
  plugins: [
    // The React and Tailwind plugins are both required for Make, even if
    // Tailwind is not being actively used – do not remove them
    react(),
    tailwindcss(),
  ],
  resolve: {
    alias: {
      // Alias @ to the src directory
      '@': path.resolve(__dirname, './src'),
    },
  },

  // File types to support raw imports. Never add .css, .tsx, or .ts files to this.
  assetsInclude: ['**/*.svg', '**/*.csv'],

  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (!id.includes('node_modules')) return;
          if (
            id.includes('react-dom') ||
            id.includes('react-router') ||
            id.includes('scheduler') ||
            id.includes('/node_modules/react/')
          ) {
            return 'react-vendor';
          }
          if (id.includes('recharts')) {
            return 'charts';
          }
          if (id.includes('@mui')) {
            return 'mui';
          }
          if (id.includes('@radix-ui')) {
            return 'radix';
          }
          if (id.includes('lucide-react')) {
            return 'icons';
          }
          if (id.includes('motion') || id.includes('framer-motion')) {
            return 'motion';
          }
          return 'vendor';
        },
      },
    },
    chunkSizeWarningLimit: 900,
  },
})
