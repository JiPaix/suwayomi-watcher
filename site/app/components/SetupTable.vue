<script setup lang="ts">
import type { FormError, FormSubmitEvent } from '@nuxt/ui';
import { resolveComponent } from 'vue';
import type { Table } from '../../../src/lib';
import { main } from '../../../src/lib';

const emit = defineEmits<{
    (ev: 'data', payload: Table<true>): void
}>()

const UButton = resolveComponent('UButton')
const toast = useToast();
const { $t } = useI18n();

const defaultState = {
    hostname: 'localhost',
    protocol: 'http://',
    port: 4567,
    path: '/',
    username: '',
    password: '',
    sheetId: "1vxvAHxmLLgAEEq-jWbDw5fxHMdz1N_PNWe3OPXtrin0",
    sheetGid: 0,
    protocols: ['http://', 'https://'],
    loading: false,
    mangadexOnly: true,
};

const reactiveState = reactive({ ...defaultState });

const credentialsRequired = computed(() => !!reactiveState.username || !!reactiveState.password);

const fullURL = computed(() => {
    if (!reactiveState.hostname || !reactiveState.protocol || !reactiveState.port) return false;
    if (reactiveState.username && !reactiveState.password) return false;
    if (!reactiveState.username && reactiveState.password) return false;
    const auth = reactiveState.username && reactiveState.password
        ? `${reactiveState.username}:${reactiveState.password}@`
        : '';
    return `${reactiveState.protocol}${auth}${reactiveState.hostname}:${reactiveState.port}${reactiveState.path}`;
});

const canReset = computed(() => {
  const ignored = ['loading', 'protocols']
  return Object.entries(defaultState).some(([key, val]) => {
    if (ignored.includes(key)) return false
    return reactiveState[key as keyof typeof defaultState] !== val
  })
})

const reset = () => {
    Object.assign(reactiveState, structuredClone(defaultState));
}

const validate = (s: typeof defaultState): FormError[] => {
    const errors = [];
    if (!s.hostname) errors.push({ name: 'hostname', message: $t.value['hostname.error.required'] });
    if (s.hostname.includes('/')) errors.push({ name: 'hostname', message: $t.value['hostname.error.path'] });
    if (s.password && !s.username) errors.push({ name: 'username', message: $t.value['credentials.error.missing_username'] });
    if (s.username && !s.password) errors.push({ name: 'password', message: $t.value['credentials.error.missing_password'] });
    if (s.sheetGid == null) errors.push({ name: 'gid', message: $t.value['gid.error.required'] });
    if (!s.sheetId) errors.push({ name: 'sheetId', message: $t.value['sheetId.error.required'] });
    return errors;
};

const results = ref<Table<true>>([]);

async function onSubmit(_: FormSubmitEvent<typeof reactiveState>) {
    reactiveState.loading = true

    if (typeof fullURL.value !== 'string') {
        toast.add({ title: $t.value["toast.error.title"], description: $t.value["error.incomplete_url"] });
        reactiveState.loading = false;
        return;
    }
    const { sheetId, sheetGid, mangadexOnly } = reactiveState;
    if (!sheetId || sheetGid == null) {
        toast.add({ title: $t.value["toast.error.title"], description: $t.value["error.invalid_sheet"] });
        reactiveState.loading = false;
        return;
    }
    try {
        const pull = await main({ fullURL: fullURL.value, sheetGid, sheetId, mangadexOnly });
        if (!pull.success) {
            let err = pull.error
            if(pull.originalError) {
                err = `${err}: ${pull.originalError}`;
            }
            toast.add({ title: $t.value["toast.error.title"], description: err, color: 'error' });
            reactiveState.loading = false;
            return;
        }

        emit('data', pull.data.map(d => ({
            ...d,
            "Missing chaps (%)": Number(((d['Detection type'] === "DMCA" ? 1 : d['Missing chaps (%)']) * 100).toFixed(2))
        })));
        reactiveState.loading = false;
    } catch (e) {
        let err = $t.value['error.unknown'];
        if (e instanceof Error) err = e.message
        if (typeof e === 'string') err = e;
        toast.add({ title: $t.value['toast.error.title'], description: err, color: 'error' });
        reactiveState.loading = false;
    }
}


</script>

<template>
    <UForm class="w-full border mx-auto mt-6 sm:mt-10 rounded-xl shadow-xl bg-background border-muted"
        :state="reactiveState" :validate="validate" @submit="onSubmit">
        <!-- Section: Connection -->
        <div class="rounded-t-xl">
            <div class="flex flex-col bg-muted p-2 rounded-t-xl">
                <span class="text-lg font-semibold text-foreground">
                    {{ $t['url.label'] }}
                </span>
                <span class="text-muted-foreground text-xs">
                    {{ $t['url.hint'] }}
                </span>
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-2 space-y-4 p-5">
                <UFormField class="lg:col-span-1" :label="$t['protocol.label']" name="protocol" required>
                    <USelectMenu v-model="reactiveState.protocol" :items="defaultState.protocols" class="w-full" />
                </UFormField>
                <UFormField class="lg:col-span-2" :label="$t['hostname.label']" name="hostname" required>
                    <UInput v-model="reactiveState.hostname" class="w-full" />
                </UFormField>
                <UFormField class="lg:col-span-1" :label="$t['port.label']" name="port" required>
                    <UInputNumber v-model="reactiveState.port" class="w-full sm:w-32" :min="80" :max="65535"
                        :format-options="{ useGrouping: false }" />
                </UFormField>
                <UFormField class="lg:col-span-2" name="path">
                    <template #label>
                        {{ $t['path.label'] }} <sup class="text-muted-foreground">{{
                            $t['path.optional'] }}</sup>
                    </template>
                    <UInput v-model="reactiveState.path" class="w-full" placeholder="/custompath" />
                </UFormField>
            </div>
        </div>

        <!-- Section: Auth -->
        <div class="border-t">
            <div class="flex flex-col bg-muted p-2">
                <span class="text-lg font-semibold text-foreground">
                    {{ $t['auth.label'] }}
                </span>
                <span class="text-muted-foreground text-xs">
                    {{ $t['auth.hint'] }}
                </span>
            </div>
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 space-y-4 p-5">
                <UFormField name="username" :required="credentialsRequired">
                    <template #label>
                        {{ $t['username.label'] }} <sup v-if="!credentialsRequired" class="text-muted-foreground">{{
                            $t['path.optional'] }}</sup>
                    </template>
                    <UInput v-model="reactiveState.username" class="w-full" />
                </UFormField>

                <UFormField name="password" :required="credentialsRequired">
                    <template #label>
                        {{ $t['password.label'] }} <sup v-if="!credentialsRequired" class="text-muted-foreground">{{
                            $t['path.optional'] }}</sup>
                    </template>
                    <UInput v-model="reactiveState.password" class="w-full" type="password" />
                </UFormField>
            </div>
        </div>

        <!-- Section: Sheet -->
        <div class="border-t">
            <div class="flex flex-col bg-muted p-2">
                <span class="text-lg font-semibold text-foreground">
                    {{ $t['config.label'] }}
                </span>
                <span class="text-muted-foreground text-xs">
                    {{ $t['config.hint'] }}
                </span>
            </div>
            <div class="grid grid-cols-1 sm:grid-cols-3 gap-4 p-5 space-y-4">
                <UFormField class="sm:col-span-2" :label="$t['sheetId.label']" name="sheetId" required>
                    <UInput v-model="reactiveState.sheetId" class="w-full" :placeholder="$t['sheetId.placeholder']" />
                </UFormField>
                <UFormField class="sm:col-span-1" :label="$t['gid.label']" name="gid" required>
                    <UInputNumber v-model="reactiveState.sheetGid" class="w-full sm:w-1/2" :min="0"
                        :format-options="{ useGrouping: false }" />
                </UFormField>
            </div>
        </div>
<div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-t bg-muted/50 p-5 rounded-b-xl">
  <!-- Left side -->
  <USwitch
    :disabled="reactiveState.loading"
    v-model="reactiveState.mangadexOnly"
    :label="$t['switch.label']"
    :ui="{
        icon: 'cursor-pointer'
    }"
  />

  <!-- Right side -->
  <div class="flex flex-col sm:flex-row gap-3">
    <UButton
      :disabled="!canReset || reactiveState.loading"
      variant="ghost"
      color="neutral"
      icon="i-lucide-rotate-ccw"
      class="cursor-pointer"
      @click="reset"
    >
      {{ $t['button.reset'] }}
    </UButton>

    <UButton
      type="submit"
      icon="i-lucide-check"
      class="cursor-pointer"
      :loading="reactiveState.loading"
      :disabled="validate(reactiveState).length > 0 || reactiveState.loading"
    >
      {{ $t['button.submit'] }}
    </UButton>
  </div>
</div>


    </UForm>
</template>