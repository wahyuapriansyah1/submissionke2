import { defineConfig } from 'vite';
import { resolve } from 'path';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  root: resolve(__dirname, 'src'),
  publicDir: resolve(__dirname, 'src', 'public'),
  build: {
    outDir: resolve(__dirname, 'dist'),
    emptyOutDir: true,
  },
  server: {
    port: 9019,
  },
  plugins: [
    VitePWA({
      strategies: 'generateSW',
      registerType: 'autoUpdate',
      manifest: {
        id: '/#/',
        name: 'Kuliner Nusantara, Aplikasi rekomendasi kuliner nusantara',
        short_name: 'Kuliner Nusantara',
        description: 'Aplikasi rekomendasi kuliner nusantara',
        theme_color: '#2c5282',
        background_color: '#FFFFFF',
        display: 'standalone',
        scope: '/',
        start_url: '/#/',
        icons: [
          {
            src: '/images/icons/icon-x144.png',
            sizes: '144x144',
            type: 'image/png',
            purpose: 'any'
          },
          {
            src: '/images/icons/maskable-icon-x48.png',
            sizes: '48x48',
            type: 'image/png',
            purpose: 'maskable'
          },
          {
            src: '/images/icons/maskable-icon-x96.png',
            sizes: '96x96',
            type: 'image/png',
            purpose: 'maskable'
          },
          {
            src: '/images/icons/maskable-icon-x192.png',
            sizes: '192x192',
            type: 'image/png',
            purpose: 'maskable'
          },
          {
            src: '/images/icons/maskable-icon-x384.png',
            sizes: '384x384',
            type: 'image/png',
            purpose: 'maskable'
          },
          {
            src: '/images/icons/maskable-icon-x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable'
          }
        ],
        screenshots: [
          {
            src: 'images/screenshots/MapNotesApp_001.png',
            sizes: '1920x1043',
            type: 'image/png',
            form_factor: 'wide'
          },
          {
            src: 'images/screenshots/MapNotesApp_002.png',
            sizes: '1920x1043',
            type: 'image/png',
            form_factor: 'wide'
          },
          {
            src: 'images/screenshots/MapNotesApp_003.png',
            sizes: '1920x1043',
            type: 'image/png',
            form_factor: 'wide'
          },
          {
            src: 'images/screenshots/MapNotesApp_004.png',
            sizes: '1080x2280',
            type: 'image/png',
            form_factor: 'narrow'
          },
          {
            src: 'images/screenshots/MapNotesApp_005.png',
            sizes: '1080x2280',
            type: 'image/png',
            form_factor: 'narrow'
          },
          {
            src: 'images/screenshots/MapNotesApp_006.png',
            sizes: '1080x2280',
            type: 'image/png',
            form_factor: 'narrow'
          }
        ]
      },
      workbox: {
        clientsClaim: true,
        skipWaiting: true,
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/mapnotes-api\.dicoding\.dev\//,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'cache-api-mapnotes',
              expiration: {
                maxEntries: 50,
                maxAgeSeconds: 60 * 60 * 24, // 24 jam
              },
            },
          },
          {
            urlPattern: /\.(?:png|jpg|jpeg|svg|gif)$/,
            handler: 'CacheFirst',
            options: {
              cacheName: 'cache-gambar',
              expiration: {
                maxEntries: 60,
                maxAgeSeconds: 60 * 60 * 24 * 30, // 30 hari
              },
            },
          },
        ],
      },
    }),
  ],
});
