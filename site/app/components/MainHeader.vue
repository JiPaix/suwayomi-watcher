<script lang="ts" setup>

const { currentLocale, setLocale, $t, languages } = useI18n()
const openModal = ref(false)
const route = useRoute()
const items = computed(() => languages.map(l => {
  return {
    label: l.text.name.toLocaleUpperCase() ?? l.code.toUpperCase(),
    icon: l.icon,
    active: route.query.lang ? route.query.lang === l.code : true,
    onSelect: () => {
      setLocale(true, l.code);
      openModal.value = false;
    }
  }
}))

defineShortcuts({
  meta_k: () => openModal.value = !openModal.value,
  escape: () => openModal.value = false,
  shift_q: () => window.scrollTo(0, 0)
})
</script>
<template>
    <header class="min-h-16 w-full flex items-center border-b-1 border-b-slate-600 p-4">
      <nav class="w-full flex items-center justify-between sm:px-10">
        <div class="flex h-14 items-center gap-2 w-1/2">
          <NuxtImg class="h-14 w-auto" src="/faviconlogo.png" alt="Logo" />
          <div class="flex flex-col items-start h-14 overflow-hidden">
            <p class="text-2xl hidden sm:block">SUWAYOMI CHECKER</p>
            <p class="hidden sm:block overflow-hidden">
              {{ $t['main.title'] }}
            </p>
          </div>
        </div>
        <div class="flex gap-0">
          <UColorModeButton class="cursor-pointer" size="xl" />
          <div @click="() => openModal = true"
            class="flex cursor-pointer rounded-md font-medium inline-flex items-center disabled:cursor-not-allowed aria-disabled:cursor-not-allowed disabled:opacity-75 aria-disabled:opacity-75 transition-colors text-base px-2 text-default hover:bg-elevated active:bg-elevated focus:outline-none focus-visible:bg-elevated hover:disabled:bg-transparent dark:hover:disabled:bg-transparent hover:aria-disabled:bg-transparent dark:hover:aria-disabled:bg-transparent cursor-pointer">
            <UIcon class="flex h-14 size-6" color="neutral" variant="ghost" name="i-material-symbols-translate" />
            <span class="self-start mt-1 text-muted text-primary uppercase text-xs font-light superscript"
              variant="subtle">{{ currentLocale }}</span>
          </div>
          <UModal :fullscreen="true" v-model:open="openModal" :scrollable="true" :dismissible="false">
            <template #content>
              <div class="h-screen">
              <div class="flex justify-end items-center p-1 w-full">
                <UButton @click="openModal = false" size="xl" class="cursor-pointer" color="neutral" variant="ghost"
                  icon="i-material-symbols:close-rounded" />
              </div>
              <div class="flex flex-col p-10 gap-2 justify-center">
                <div v-for="item in items" class="cursor-pointer flex items-center gap-2">
                  <UButton class="cursor-pointer" size="xl" variant="link" :icon="item.icon"
                    :color="item.active ? 'primary' : 'neutral'" :active="item.active" @click="item.onSelect">
                    {{ item.label }}
                  </UButton>
                </div>
              </div>
              </div>
            </template>
          </UModal>
        </div>
      </nav>
    </header>
</template>