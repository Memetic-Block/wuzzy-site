<template>
<div class="flex flex-col mt-16">
  <div class="flex flex-col">
    <h2 class="self-start mt-0! mb-0! text-xl! border-current border-2 p-4">Permaweb Console // Nests</h2>
    <div class="h-4 border-current border-l-2 border-dotted"></div>
    <div>
      <template v-if="nests && nests.length > 0">
        <div
          v-for="nest in nests" :key="nest.id"
          class="border-current border-2 flex flex-row justify-between"
        >
          <div class="p-4">{{ nest.id }}</div>
          <router-link
            class="self-end border-current border-l-2 p-4"
            :to="`/console/nest/${nest.id}`"
          >View</router-link>
        </div>
      </template>
      <div v-else-if="isNestsPending" class="border-current border-2 p-4">
        Loading...
      </div>
      <div v-else class="border-current border-2 p-4">
        You have no Nests yet.
      </div>
      <div v-if="isNestsError" class="border-current border-2 p-4">
        Error ! {{ nestsError?.message }}
      </div>
    </div>

    <div class="h-4 border-current border-l-2 border-r-2 border-dotted"></div>
    <div class="flex flex-row justify-between">
      <router-link
        class="cursor-pointer border-current border-2 p-4"
        to="/console/nests/new"
      >Spawn new Nest</router-link>
      <router-link
        class="self-end border-current border-2 p-4"
        to="/console/home"
      >Go back to Console Home</router-link>
    </div>
  </div>
</div>
</template>

<script setup lang="ts">
import { useQuery } from '@tanstack/vue-query'
import { useSeoMeta } from '@unhead/vue'
import { useNestRegistry } from '@/composables/nest-registry'
import { useWallet } from '@/composables/wallet'

useSeoMeta({ title: 'Permaweb Console: Nests' })
const { address, isConnected } = useWallet()
const { listNestsByAddress } = useNestRegistry()
const {
  data: nests,
  isPending: isNestsPending,
  isError: isNestsError,
  error: nestsError
} = useQuery({
  queryKey: ['my-nests'],
  queryFn: () => listNestsByAddress(address.value),
  enabled: () => isConnected.value && !!address.value
})
</script>