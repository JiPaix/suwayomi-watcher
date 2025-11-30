import { resolve } from 'path';
// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  modules: ['@nuxt/image', '@nuxt/ui', '@vueuse/nuxt'],
  css: ['~/assets/css/main.css'],
  
  app: {
    
  },
  ssr: false,
  nitro: {
    output: {
      dir: '../docs',
      publicDir: '../docs'
    },
    preset: 'github-pages',
    prerender: {
      routes: [
        '/_ipx/_/faviconlogo.png',
      ],
    },
  },
  vite: {
    resolve: {
      alias: {
        '#dmca': resolve(__dirname, '../src')
      }
    }
  }
})