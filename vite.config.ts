import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, '.', '');
  return {
    plugins: [
      react(),
      tailwindcss(),
      VitePWA({
        registerType: 'autoUpdate',
        includeAssets: ['favicon.svg', 'icons/*.svg', 'icons/*.png'],
        manifest: {
          name: 'NutriGuide - Healthy Meal Discovery',
          short_name: 'NutriGuide',
          description: 'Discover healthy meals, plan with family, and track your nutrition journey',
          theme_color: '#059669',
          background_color: '#F8F7F4',
          display: 'standalone',
          orientation: 'portrait-primary',
          start_url: '/',
          scope: '/',
          icons: [
            {
              src: '/icons/icon-192x192.svg',
              sizes: '192x192',
              type: 'image/svg+xml',
              purpose: 'any',
            },
            {
              src: '/icons/icon-512x512.svg',
              sizes: '512x512',
              type: 'image/svg+xml',
              purpose: 'any',
            },
            {
              src: '/favicon.svg',
              sizes: 'any',
              type: 'image/svg+xml',
              purpose: 'maskable',
            },
          ],
          categories: ['food', 'health', 'lifestyle'],
          shortcuts: [
            {
              name: 'Browse Recipes',
              url: '/',
              icons: [{ src: '/favicon.svg', sizes: '96x96' }],
            },
            {
              name: 'My Favorites',
              url: '/favorites',
              icons: [{ src: '/favicon.svg', sizes: '96x96' }],
            },
          ],
        },
        workbox: {
          globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'],
          navigateFallback: '/index.html',
          navigateFallbackDenylist: [/^\/api/],
          runtimeCaching: [
            {
              urlPattern: /^https:\/\/.*\/api\/.*/i,
              handler: 'NetworkFirst',
              options: {
                cacheName: 'api-cache',
                expiration: {
                  maxEntries: 100,
                  maxAgeSeconds: 60 * 60 * 24,
                },
                cacheableResponse: {
                  statuses: [0, 200],
                },
              },
            },
            {
              urlPattern: /^https:\/\/images\.unsplash\.com\/.*/i,
              handler: 'CacheFirst',
              options: {
                cacheName: 'image-cache',
                expiration: {
                  maxEntries: 50,
                  maxAgeSeconds: 60 * 60 * 24 * 7,
                },
                cacheableResponse: {
                  statuses: [0, 200],
                },
              },
            },
            {
              urlPattern: /^https:\/\/www\.themealdb\.com\/.*/i,
              handler: 'CacheFirst',
              options: {
                cacheName: 'mealdb-cache',
                expiration: {
                  maxEntries: 100,
                  maxAgeSeconds: 60 * 60 * 24,
                },
                cacheableResponse: {
                  statuses: [0, 200],
                },
              },
            },
          ],
        },
        devOptions: {
          enabled: false, // Disable PWA in dev to reduce console noise
          type: 'module',
          navigateFallback: 'index.html',
        },
        injectRegister: 'auto',
      }),
    ],
    define: {
      'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY),
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
    },
    server: {
      port: 3000,
      proxy: {
        '/api': {
          target: env.VITE_API_URL || 'http://localhost:3001',
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api/, '/api'),
        },
        '/ws': {
          target: env.VITE_WS_URL || 'ws://localhost:3001',
          ws: true,
        },
      },
      hmr: process.env.DISABLE_HMR !== 'true',
    },
    build: {
      sourcemap: true,
      rollupOptions: {
        output: {
          manualChunks: {
            vendor: ['react', 'react-dom', 'react-router-dom'],
            ui: ['lucide-react', 'motion'],
          },
        },
      },
    },
  };
});
