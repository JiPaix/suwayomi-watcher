import type { Locale, Messages } from "@nuxt/ui";
import * as locales from '@nuxt/ui/locale';
import text from '~/assets/locale.json';

const languages = [
  // 🌍 Global
  { code: 'en', icon: 'flag:us-4x3', module: () => Promise.resolve(locales.en), text: text.en },
  { code: 'sp', icon: 'flag:es-4x3', module: () => Promise.resolve(locales.es), text: text.es },
  { code: 'pt', icon: 'flag:br-4x3', module: () => Promise.resolve(locales.pt_br), text: text.pt_br },
  { code: 'fr', icon: 'flag:fr-4x3', module: () => Promise.resolve(locales.fr), text: text.fr },
  { code: 'de', icon: 'flag:de-4x3', module: () => Promise.resolve(locales.de), text: text.de },
  { code: 'it', icon: 'flag:it-4x3', module: () => Promise.resolve(locales.it), text: text.it },
  { code: 'uk', icon: 'flag:ua-4x3', module: () => Promise.resolve(locales.uk), text: text.uk },
  { code: 'pl', icon: 'flag:pl-4x3', module: () => Promise.resolve(locales.pl), text: text.pl },
  { code: 'tr', icon: 'flag:tr-4x3', module: () => Promise.resolve(locales.tr), text: text.tr },
  { code: 'ru', icon: 'flag:ru-4x3', module: () => Promise.resolve(locales.ru), text: text.ru },

  // 🌏 Asia
  { code: 'hi', icon: 'flag:in-4x3', module: () => Promise.resolve(locales.hi), text: text.hi },
  { code: 'id', icon: 'flag:id-4x3', module: () => Promise.resolve(locales.id), text: text.id },
  { code: 'vi', icon: 'flag:vn-4x3', module: () => Promise.resolve(locales.vi), text: text.vi },
  { code: 'zh', icon: 'flag:cn-4x3', module: () => Promise.resolve(locales.zh_cn), text: text.zh_cn },
  { code: 'ja', icon: 'flag:jp-4x3', module: () => Promise.resolve(locales.ja), text: text.ja },
  { code: 'ko', icon: 'flag:kr-4x3', module: () => Promise.resolve(locales.ko), text: text.ko },

  // 🌍 Middle East / Africa
  { code: 'fa', icon: 'flag:ir-4x3', module: () => Promise.resolve(locales.fa_ir), text: text.fa },
  { code: 'ar', icon: 'flag:arab-4x3', module: () => Promise.resolve(locales.ar), text: text.ar },
] as const

export type LangMap = typeof languages
export type LangCode = LangMap[number]['code']

export function useI18n() {
  const route = useRoute()
  const router = useRouter()

  function defaultLocale() {
    const nav = route.query.lang ?? navigator.language.substring(0, 2)
    if(isLang(nav)) return nav
    else return 'en'
  }

  const currentLocale = ref<LangCode>( defaultLocale())

  function isLang(res: unknown): res is LangCode {
    return languages.some(l => l.code === res)
  }

  function setLocale(redirect?: boolean, code?: LangCode | string) {
    if (isLang(code)) {
      currentLocale.value = code
    } else {
      currentLocale.value = defaultLocale();
    }
    if (redirect) {
      router.push({
        path: '/',
        query: { lang: currentLocale.value },
      })
    }
  }

const $t = computed(() => {
  return (languages.find(l => l.code === currentLocale.value) ?? languages[0]).text
})


  const localeModule = ref<Locale<Messages>>()

  watch(currentLocale, async (lang) => {
    const entry = languages.find(l => l.code === lang)
    if (!entry) return
    localeModule.value = await entry.module()
  }, { immediate: true })

  watch(route, (q) => {
    q.query
    if(isLang(q.query.lang) && q.query.lang !== currentLocale.value) setLocale(true, q.query.lang)
  }, {deep: true})

  return {
    languages,
    currentLocale,
    localeModule,
    setLocale,
    $t
  }
}