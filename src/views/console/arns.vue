<template>
<div class="flex flex-col mt-16">
  <div class="flex flex-col">
    <h2 class="self-start mt-0! mb-0! text-xl! border-current border-2 p-4">Permaweb Console // ArNS</h2>
    <div class="h-4 border-current border-l-2 border-dotted"></div>
    <div>
      <template v-if="arnsRecords && arnsRecords.items.length > 0">
        <div
          v-for="record in arnsRecords.items" :key="record.processId"
          class="border-current border-2 p-4"
        >
          {{ record.name }}
        </div>
      </template>
      <div v-else-if="isArnsRecordsPending" class="border-current border-2 p-4">
        Loading...
      </div>
      <div v-else class="border-current border-2 p-4">
        You have no ArNS names yet.  Why not
        <a
          class="underline"
          href="https://arns.app"
          target="_blank"
          rel="noopener"
        >get one</a>?
      </div>
      <div v-if="isArnsRecordsError" class="border-current border-2 p-4">
        Error ! {{ arnsRecordsError?.message }}
      </div>
    </div>

    <div class="h-4 border-current border-r-2 border-dotted"></div>
    <router-link
      class="self-end border-current border-2 p-4"
      to="/console/home"
    >Go back to Console Home</router-link>
  </div>
</div>
</template>

<script setup lang="ts">
import { useQuery } from '@tanstack/vue-query'
import { useSeoMeta } from '@unhead/vue'
import { useArNS } from '@/composables/arns'
import { useWallet } from '@/composables/wallet'

useSeoMeta({ title: 'Permaweb Console: ArNS' })
const { address, isConnected } = useWallet()
const { getArNSRecordsForAddress } = useArNS()
const {
  data: arnsRecords,
  isPending: isArnsRecordsPending,
  isError: isArnsRecordsError,
  error: arnsRecordsError
} = useQuery({
  queryKey: ['my-arns'],
  queryFn: () => getArNSRecordsForAddress(address.value),
  enabled: () => isConnected.value && !!address.value
})
</script>