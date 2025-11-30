// plugins/lazy-reload.ts
import type { Directive } from 'vue'

const lazyReload: Directive<HTMLImageElement, string> = {
  mounted(el, binding) {
    if (!(el instanceof HTMLImageElement)) {
      console.error('lazy-reload directive can only be used with <img>')
      return
    }

    const originalSrc = binding.value

    const observer = new IntersectionObserver(([entry]) => {
      if (!entry) return

      if (entry.isIntersecting) {
        el.classList.add('opacity-100')
        el.classList.remove('opacity-0')
        el.src = originalSrc
        el.srcset = `${originalSrc} 1x, ${originalSrc} 2x`
      } else {
        el.classList.add('opacity-0')
        el.classList.remove('opacity-100')
        el.srcset = ''
        el.src = ''
      }
    }, {
      rootMargin: '0px',
      threshold: 0
    })

    observer.observe(el)
  }
}

export default defineNuxtPlugin((nuxtApp) => {
  nuxtApp.vueApp.directive('lazy-reload', lazyReload)
})
