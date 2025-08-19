import { defineConfig } from 'vite'

export default defineConfig({
  // Development server configuration
  server: {
    port: 5173,
    proxy: {
      // Proxy API requests to the Express server
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
        secure: false
      }
    }
  },
  
  // Build configuration
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: true
  },
  
  // Environment variables
  define: {
    // Make sure env variables are available
  }
})
