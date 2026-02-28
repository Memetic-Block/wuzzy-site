<template>
<div class="flex flex-col mt-16">
  <div class="flex flex-col">
    <h2 class="self-start mt-0! mb-0! text-xl! border-current border-2 p-4">
      Permaweb Console // Nests // <span class="normal-case">{{ route.params.nestId }}</span>
    </h2>
    <div class="h-4 border-current border-l-2 border-dotted"></div>
    <div>
      <template v-if="nest">
        <div class="border-current border-2 p-4 flex flex-row justify-between">
          <div>{{ nest.id }}</div>
          <div class="border-current border-l-2">
            <button class="cursor-pointer color-error">Unregister</button>
          </div>
        </div>
      </template>
      <div v-else-if="isNestPending" class="border-current border-2 p-4">
        Loading...
      </div>
      <div v-else-if="isNestError" class="border-current border-2 p-4">
        Error ! {{ nestError?.message }}
      </div>
      <div v-else class="border-current border-2 p-4">
        Nest not found.
      </div>
    </div>
    <div class="h-4 border-current border-r-2 border-dotted"></div>
    <router-link
      class="self-end border-current border-2 p-4"
      to="/console/nests"
    >Go back to Nests</router-link>
  </div>
</div>
</template>

<script setup lang="ts">
import { useQuery } from '@tanstack/vue-query'
import { useSeoMeta } from '@unhead/vue'
import { useWallet } from '@/composables/wallet'
import { useNests } from '@/composables/nest'
import { useRoute } from 'vue-router'

useSeoMeta({ title: 'Permaweb Console: Nests' })
const route = useRoute()
const { address, isConnected } = useWallet()
const { getNestById } = useNests()
const {
  data: nest,
  isPending: isNestPending,
  isError: isNestError,
  error: nestError
} = useQuery({
  queryKey: ['my-nest', route.params.nestId],
  queryFn: () => getNestById(route.params.nestId as string),
  enabled: () => isConnected.value && !!address.value
})
</script>