<script lang="ts" setup>
import type { Table } from 'suwayomi-watcher';

const {localeModule, currentLocale } = useI18n();

useHead({
  title: "Suwayomi DMCA checker",
  htmlAttrs: {
    lang: currentLocale,
    dir: 'auto',
  }
})

const results = ref<Table<true>>([]);
function populate(table: Table<true>) {
  results.value = table
}

function reset() {
  results.value = []
}
</script>
<template>
  <UApp :locale="localeModule" :toaster="{position: 'top-center'}">
      <MainHeader />
      <UContainer class="flex mt-4">
        <SetupTable v-if="!results.length" @data="populate"/>
        <ResultTable v-else :results="results" @reset="reset" />
      </UContainer>

  </UApp>
</template>
<style lang="css">
button[data-reka-collection-item] {
  cursor: pointer
}
</style>