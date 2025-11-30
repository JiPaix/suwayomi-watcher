import type { Directive } from 'vue'

declare module 'vue' {
  interface ComponentCustomProperties {
    vLazyReload: Directive<HTMLImageElement, string>
  }
}