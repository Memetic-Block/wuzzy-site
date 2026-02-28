<template>
<div class="flex flex-col mt-16">
  <div class="flex flex-col">
    <h2 class="self-start mt-0! mb-0! text-xl! border-current border-2 p-4">
      Permaweb Console // Nests // Spawn new Nest
    </h2>
    <div class="h-4 border-current border-l-2 border-dotted"></div>
    <template v-if="registry">
      <div class="border-current border-2 flex flex-row">
        <div class="basis-1/3 p-4 border-current border-r-2 whitespace-nowrap">Nest Name</div>
        <input type="text" class="p-4 border-current border-r-2 w-full" />
      </div>
      <div
        v-if="registry.registration_code_required"
        class="border-current border-2 flex flex-row"
      >
        <div class="basis-1/3 p-4 border-current border-r-2 whitespace-nowrap">Registration Code</div>
        <input type="text" class="p-4 border-current border-r-2 w-full" />
      </div>
    </template>
    <div v-else-if="isRegistryPending" class="border-current border-2 p-4">
      Loading...
    </div>
    <div v-else-if="isRegistryError" class="border-current border-2 p-4">
      Error ! {{ registryError?.message }}
    </div>
    <div v-else class="border-current border-2 p-4">
      Unable to load nest registry.  Cannot spawn new nest.
    </div>
    <div class="h-4 border-current border-l-2 border-r-2 border-dotted"></div>
    <div class="flex flex-row justify-between">
      <router-link
        v-if="registry"
        class="cursor-pointer border-current border-2 p-4 bg-blue-900"
        to="/console/nests/new"
      >Spawn new Nest</router-link>
      <router-link
        class="self-end border-current border-2 p-4"
        to="/console/nests"
      >Go back to Nests</router-link>
    </div>
  </div>
</div>
</template>

<script setup lang="ts">
import { useQuery } from '@tanstack/vue-query'
import { useSeoMeta } from '@unhead/vue'
import { useWallet } from '@/composables/wallet'
// import { useLegacynetNests } from '@/composables/nest'
import { useNestRegistry } from '@/composables/nest-registry'

useSeoMeta({ title: 'Permaweb Console: Spawn new Nest' })
const { address, isConnected } = useWallet()
// const { getNestById } = useLegacynetNests()
const { getNestRegistryState } = useNestRegistry()
const {
  data: registry,
  isPending: isRegistryPending,
  isError: isRegistryError,
  error: registryError
} = useQuery({
  queryKey: ['registry'],
  queryFn: () => getNestRegistryState(),
  enabled: () => isConnected.value && !!address.value
})
</script>