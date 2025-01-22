import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [
    react(),
    mode === 'development' &&
    componentTagger(),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      "@tanstack/react-table": path.resolve(__dirname, "node_modules/@tanstack/react-table")
    }
  },
  optimizeDeps: {
    include: ['@tanstack/react-table']
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'react-table': ['@tanstack/react-table']
        }
      }
    },
    cssCodeSplit: true,
    cssMinify: true,
  }
}));