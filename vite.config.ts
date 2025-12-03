import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import runtimeErrorOverlay from "@replit/vite-plugin-runtime-error-modal";
import federation from "@originjs/vite-plugin-federation";

const isProduction = process.env.NODE_ENV === "production";
const isReplit = process.env.REPL_ID !== undefined;
const isVercel = process.env.VERCEL === "1";

export default defineConfig({
  plugins: [
    react(),
    // Runtime error overlay только в dev на Replit
    ...(!isProduction && isReplit ? [runtimeErrorOverlay()] : []),
    // Module Federation только если не на Vercel (чтобы избежать проблем при сборке)
    ...(!isVercel ? [
      federation({
        name: 'smartTasbih',
        filename: 'remoteEntry.js',
        exposes: {
          './App': './client/src/App.tsx',
          './components': './client/src/components/index.ts',
        },
        shared: {
          react: {
            singleton: true,
            requiredVersion: '^18.3.1',
          },
          'react-dom': {
            singleton: true,
            requiredVersion: '^18.3.1',
          },
          'react-router-dom': {
            singleton: true,
          },
        },
      })
    ] : []),
  ],
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "client", "src"),
      "@shared": path.resolve(import.meta.dirname, "shared"),
      "@assets": path.resolve(import.meta.dirname, "attached_assets"),
    },
  },
  root: path.resolve(import.meta.dirname, "client"),
  build: {
    outDir: path.resolve(import.meta.dirname, "dist/public"),
    emptyOutDir: true,
    target: 'esnext',
    minify: isProduction,
    cssCodeSplit: false,
    rollupOptions: {
      output: {
        manualChunks: undefined,
      },
    },
  },
  server: {
    fs: {
      strict: true,
      deny: ["**/.*"],
    },
  },
});
