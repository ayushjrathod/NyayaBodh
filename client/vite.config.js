import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    cors: true,
    proxy: {
      "/api": {
        target: "http://localhost:8000",
        changeOrigin: true,
        secure: false,
      },
    },
  },
  build: {
    // Enable code splitting
    rollupOptions: {
      output: {
        manualChunks: {
          // Vendor chunks
          vendor: ['react', 'react-dom'],
          ui: ['@nextui-org/react'],
          router: ['react-router-dom'],
          forms: ['react-hook-form', '@hookform/resolvers'],
          pdf: ['@react-pdf-viewer/core', '@react-pdf-viewer/default-layout'],
          // Feature-based chunks
          auth: ['@react-oauth/google'],
          charts: ['framer-motion'],
          utils: ['axios', 'clsx', 'tailwind-merge']
        }
      }
    },
    // Optimize chunk size
    chunkSizeWarningLimit: 1000,
    // Enable source maps for production debugging (optional)
    sourcemap: false,
    // Minify for production
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true, // Remove console.logs in production
        drop_debugger: true
      }
    }
  },
  // Optimize dependencies
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      '@nextui-org/react',
      'react-router-dom',
      'react-hook-form',
      '@hookform/resolvers',
      'axios',
      'framer-motion'
    ]
  }
});