// tailwind.config.ts
import lineClamp from '@tailwindcss/line-clamp'

export default {
  content: [
    './components/**/*.{vue,js,ts}',
    './layouts/**/*.vue',
    './pages/**/*.vue',
    './app.vue',
    './plugins/**/*.{js,ts}',
  ],
  plugins: [lineClamp]
}
