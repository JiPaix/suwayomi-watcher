<script lang="ts" setup>
import { resolveComponent } from 'vue'
import type { Table } from '../../../src/lib' // Keep your type import
import type { NuxtImg } from '#components';
import type { ComponentPublicInstance } from 'vue';

// --- Props & Emits ---
const props = defineProps<{
    results: Table<true>
}>()

const emit = defineEmits<{
    (ev: 'reset'): void
}>()

// --- Setup ---
const images = ref<ComponentPublicInstance<typeof NuxtImg>[]>([]);
const sources = ref<string[]>([]);

const { $t } = useI18n()
const UButton = resolveComponent('UButton')
const isSorted = reactive<Record<string, 'asc' | 'desc' | false>>({
    title: 'asc',
    missing: false
});

const titleIcon = computed(() => {
    if (isSorted.title === 'asc') return 'i-mdi-sort-alphabetical-ascending';
    if (isSorted.title === 'desc') return 'i-mdi-sort-alphabetical-descending';
    return 'i-mdi-sort-alphabetical';
});

const missingIcon = computed(() => {
    if (isSorted.missing === 'asc') return 'i-mdi-sort-numeric-ascending';
    if (isSorted.missing === 'desc') return 'i-mdi-sort-numeric-descending';
    return 'i-mdi-sort-numeric';
});
const sortedResults = computed(() => {
    const copy = [...props.results]; // avoid mutating props

    if (isSorted.title) {
        copy.sort((a, b) => {
            const dir = isSorted.title === 'asc' ? 1 : -1;
            return a.Title.localeCompare(b.Title) * dir;
        });
    } else if (isSorted.missing) {
        copy.sort((a, b) => {
            const dir = isSorted.missing === 'asc' ? 1 : -1;
            return (a["Missing chaps (%)"] - b["Missing chaps (%)"]) * dir;
        });
    }

    return copy;
});

// --- Helper Functions ---
const open = (url: string) => {
    window.open(url, '_blank')
}




const getStatusColor = (status: string) => {
    // "error" | "primary" | "secondary" | "success" | "info" | "warning" | "neutral" | undefined
    const s = status?.toLowerCase() || ''
    if (s.includes('ongoing')) return 'success'
    if (s.includes('complete') || s.includes('finish')) return 'info'
    if (s.includes('hiatus') || s.includes('cancel')) return 'warning'
    if (s.includes('error')) return 'error'
    return 'neutral'
}
const getMissingColor = (percent: number) => {
  // "error" | "primary" | "secondary" | "success" | "info" | "warning" | "neutral" | undefined
  if (percent >= 5) return "error";
  if (percent >= 0.2)  return "warning";
  if (percent >= 0.1 && percent < 0.2) return "info";
  return "neutral"; // everything else
};



function toggleSort(col: keyof typeof isSorted) {
    if (isSorted[col] === false) {
        // Column not activated → reset others and set to asc
        for (const key in isSorted) {
            if (key !== col) {
                isSorted[key] = false;
            }
        }
        isSorted[col] = 'asc';
    } else if (isSorted[col] === 'asc') {
        // Column is asc → switch to desc
        isSorted[col] = 'desc';
    } else {
        // Column is desc → switch back to asc
        isSorted[col] = 'asc';
    }
}

function thumbnailUrl(partial: Table<true>[number]) {
    const url = new URL(partial.URL)
    url.pathname = partial.Thumbnail
    return url.toString()
}

</script>
<template>
    <UCard class="w-full border mx-auto mt-6 sm:mt-10 rounded-xl shadow-xl bg-background border-muted" :ui="{
        header: 'p-0 sm:px-0',
        body: 'w-full flex flex-col gap-5'
    }">

        <template #header>
            <div class="w-full flex items-center gap-2 bg-muted/50 p-4">
                <div class="text-2xl">{{ sortedResults.length }} {{ $t['table.results'] }}</div>
                <div class="ml-auto">
                    <UButton class="cursor-pointer uppercase" variant="link" color="neutral" icon="i-material-symbols-close"
                        size="xl" @click="emit('reset')">
                    </UButton>
                </div>
            </div>
            <div class="w-full flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-10">
                <UButton size="xl" :label="$t['table.title']" :icon="titleIcon" variant="ghost"
                    class="font-bold cursor-pointer truncate" @click="() => toggleSort('title')" />
                <UButton size="xl" :label="$t['table.missing']" :icon="missingIcon" variant="ghost"
                    class="font-bold cursor-pointer truncate" @click="() => toggleSort('missing')" />
            </div>
        </template>
        <template #default>
            <div v-for="(row, i) in sortedResults" :class="i < sortedResults.length - 1 ? 'border-b-1' : ''" class="flex flex-col md:flex-row items-start md:items-center min-w-0 
                    border-b-muted/50 
                    pb-3 sm:pb-4 md:pb-5 lg:pb-6 
                    hover:bg-muted/50 
                    p-2 sm:p-3 md:p-4 lg:p-6 
                    rounded-t-xl cursor-pointer h-full" @click="open(row.URL)">
                <!-- Image: portrait aspect ratio for manga covers -->
                <div class="relative mx-auto md:mx-0 w-32 sm:w-36 md:w-40 lg:w-44 xl:w-48 aspect-[2/3] rounded">
                    <NuxtImg
                        v-lazy-reload="thumbnailUrl(row)"
                        loading="lazy"
                        :alt="'cover of ' + row.Title"
                        fit="cover"
                        class="absolute inset-0 w-full h-full object-cover dark:blur-xs blur-md rounded transition-opacity duration-300"
                    />
                    <NuxtImg
                        v-lazy-reload="thumbnailUrl(row)"
                        loading="lazy"
                        :alt="'cover of ' + row.Title"
                        fit="cover"
                        class="relative w-full h-full object-cover rounded transition-opacity duration-500"
                    />
                </div>

                <!-- Content: stacked below image on xs, beside on md+ -->
                <div class="flex flex-col items-start justify-between 
                        w-full md:flex-1 
                        mt-2 md:mt-0 md:ml-3 lg:ml-4 
                        h-auto">
                    <!-- Title -->
                    <div class="block text-sm sm:text-base md:text-lg lg:text-xl xl:text-2xl 
                        font-bold text-gray-900 dark:text-white
                        line-clamp-2 leading-tight break-words min-w-0 overflow-hidden text-center md:text-left">
                        {{ row.Title }}
                    </div>

                    <!-- Badges -->
                    <div
                        class="flex flex-wrap items-center justify-center md:justify-start gap-2 sm:gap-3 md:gap-4 mt-1 sm:mt-2 md:mt-3">
                        <UBadge size="lg" color="neutral" variant="subtle">
                            {{ row['Detection type'] }}
                        </UBadge>
                        <UBadge size="lg" :color="getStatusColor(row['Reading status'])" variant="subtle">
                            {{ row['Reading status'] }}
                        </UBadge>

                        <UBadge size="lg" :color="getMissingColor(row['Missing chaps (%)'])" variant="subtle">
                            {{ row['Missing chaps (%)'] }}%
                        </UBadge>
                    </div>

                    <!-- Metadata -->
                    <div class="flex flex-col flex-wrap items-start justify-center md:justify-start
                            gap-x-2 sm:gap-x-3 md:gap-x-4 
                            gap-y-0.5 sm:gap-y-1 md:gap-y-2 
                            text-[10px] sm:text-xs md:text-sm lg:text-base 
                            text-gray-500 mt-0.5 sm:mt-1 md:mt-2">
                        <div class="flex items-center gap-1 sm:gap-2 font-medium text-gray-600 dark:text-gray-400">
                            <UIcon name="i-lucide-globe" class="w-3 h-3 sm:w-4 sm:h-4 md:w-5 md:h-5" />
                            {{ row.Source }}
                        </div>

                        <div class="flex gap-1 sm:gap-2 items-center">
                            <span v-for="(cat, i) in (row.Categories || []).slice(0, 3)" :key="i" class="bg-gray-100 dark:bg-gray-800 
                            px-1 sm:px-1.5 md:px-2 
                            rounded text-[9px] sm:text-[10px] md:text-xs lg:text-sm 
                            uppercase tracking-wide">
                                {{ cat }}
                            </span>
                            <span v-if="(row.Categories || []).length > 3"
                                class="text-[9px] sm:text-[10px] md:text-xs lg:text-sm opacity-70">
                                +{{ (row.Categories || []).length - 3 }}
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </template>
    </UCard>
</template>