<template>
<div class="flex flex-col mt-16">
  <div class="w-1/3">
    <h2 class="inline-block mt-0! mb-0! text-xl! border-current border-2 p-4">Permaweb Console</h2>
  </div>
  <div class="flex flex-row">
    <div class="basis-1/3 h-8 border-current border-dotted border-b-2 border-l-2"></div>
    <div class="basis-1/3 h-8 border-current border-dotted border-b-2"></div>
    <div class="basis-1/3 h-8"></div>
  </div>
  <div class="flex flex-row">
    <div class="basis-1/3 h-8 border-current border-dotted border-l-2"></div>
    <div class="basis-1/3 h-8 border-current border-dotted border-l-2"></div>
    <div class="basis-1/3 h-8 border-current border-dotted border-l-2"></div>
  </div>
  <div class="flex flex-row">
    <div class="basis-1/3 flex flex-col pr-8">
      <h2 class="self-start mt-0! mb-0! text-xl! border-current border-2 p-4">ArNS</h2>
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
          <div>Loading...</div>
        </div>
        <div v-else class="border-current border-2 p-4">
          <div>
            You have no ArNS names yet.  Why not
            <a
              class="underline"
              href="https://arns.app"
              target="_blank"
              rel="noopener"
            >get one</a>?
          </div>
        </div>
        <div v-if="isArnsRecordsError" class="border-current border-2 p-4">
          Error ! {{ arnsRecordsError?.message }}
        </div>
      </div>
      <div class="h-4 border-current border-r-2 border-dotted"></div>
      <router-link
        class="self-end border-current border-2 p-4"
        to="/console/arns"
      >Go to ArNS Console</router-link>
    </div>
    <div class="basis-1/3 flex flex-col pr-8">
      <h2 class="self-start mt-0! mb-0! text-xl! border-current border-2 p-4">Nests</h2>
      <div class="h-4 border-current border-l-2 border-dotted"></div>
      <div>
        <template v-if="nests && nests.length > 0">
          <div
            v-for="nest in nests" :key="nest.id"
            class="border-current border-2 p-4"
          >
            {{ nest.id.slice(0, 6) + '...' + nest.id.slice(-6) }}
          </div>
        </template>
        <div v-else-if="isNestsPending" class="border-current border-2 p-4">
          <div>Loading...</div>
        </div>
        <div v-else class="border-current border-2 p-4">
          <div>
            You have no Nests yet.
          </div>
        </div>
        <div v-if="isNestsError" class="border-current border-2 p-4">
          Error ! {{ nestsError?.message }}
        </div>
      </div>
      <div class="h-4 border-current border-r-2 border-dotted"></div>
      <router-link
        class="self-end border-current border-2 p-4"
        to="/console/nests"
      >Go to Nest Console</router-link>
    </div>
    <div class="basis-1/3 flex flex-col pr-8">
      <h2 class="self-start mt-0! mb-0! text-xl! border-current border-2 p-4">Crawlers</h2>
      <div class="h-4 border-current border-l-2 border-dotted"></div>
      <div class="border-current border-2 p-4">You have no crawlers yet.</div>
      <div class="h-4 border-current border-r-2 border-dotted"></div>
      <router-link
        class="self-end border-current border-2 p-4"
        to="/console/crawlers"
      >Go to Crawler Console</router-link>
    </div>
  </div>
</div>
</template>

<script setup lang="ts">
import { useQuery } from '@tanstack/vue-query'
import { useSeoMeta } from '@unhead/vue'
import { useArNS } from '@/composables/arns'
import { useWallet } from '@/composables/wallet'
import { useNestRegistry } from '@/composables/nest-registry'

useSeoMeta({ title: 'Permaweb Console: Home' })

const { address, isConnected } = useWallet()
const { getArNSRecordsForAddress } = useArNS()
const { listNestsByAddress } = useNestRegistry()
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