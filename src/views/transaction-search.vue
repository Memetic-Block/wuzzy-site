<template>
  <div class="max-w-7xl mx-auto p-8 sm:p-4">
    <!-- <div class="text-center mb-8">
      <h1 class="text-4xl md:text-5xl font-bold mb-2 text-gray-900 dark:text-gray-100">Transaction Search</h1>
      <p class="text-lg text-gray-600 dark:text-gray-400 mb-0">
        Search Arweave transactions using a simple query syntax.
        Enter search criteria in <code class="bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 px-1 py-0.5 rounded font-mono text-sm">name:value</code> format.
      </p>
    </div> -->

    <TransactionSearch
      ref="transactionSearchRef"
      :initial-query="urlQuery"
      @search-executed="handleSearchExecuted"
      @chips-changed="handleChipsChanged"
    />

    <div class="mt-12">
      <details class="border border-gray-200 dark:border-gray-600 rounded-lg p-4 bg-gray-50 dark:bg-gray-800">
        <summary class="font-semibold text-lg cursor-pointer p-2 -m-2 rounded transition-colors hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200">Query Syntax Documentation</summary>

        <div class="mt-4 pt-4 border-t border-gray-200 dark:border-gray-600">
          <div class="bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 border border-blue-300 dark:border-blue-600 rounded-lg p-4 mb-6">
            <p class="m-0 text-blue-800 dark:text-blue-200 text-sm">💡 <strong>Pro tip:</strong> All code examples below are clickable! Click any example to automatically fill the search bar and try it out.</p>
          </div>

          <h3 class="text-xl font-semibold mb-4 text-gray-700 dark:text-gray-200">Supported Query Parameters</h3>

          <div class="mb-6 p-4 bg-white dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600">
            <h4 class="text-base font-semibold mb-2 text-gray-900 dark:text-gray-100">
              <code class="bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200 px-2 py-1 rounded font-mono">owner</code> /
              <code class="bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200 px-2 py-1 rounded font-mono">owners</code>
            </h4>
            <p class="mb-3 text-gray-600 dark:text-gray-300">Find transactions by owner wallet address(es)</p>
            <div class="flex flex-col gap-1">
              <code @click="setExampleQuery('owner:4Tb6AwCp8c_bi-wsAKI3MM_fe5oJFEOA2Qvs2JGg6_g')" class="cursor-pointer transition-all hover:-translate-y-0.5 hover:shadow-md bg-gray-100 dark:bg-gray-600 hover:bg-blue-100 dark:hover:bg-blue-800 border border-gray-200 dark:border-gray-500 hover:border-blue-400 dark:hover:border-blue-500 text-gray-700 dark:text-gray-200 hover:text-blue-800 dark:hover:text-blue-200 p-2 rounded font-mono text-sm">owner:4Tb6AwCp8c_bi-wsAKI3MM_fe5oJFEOA2Qvs2JGg6_g</code>
              <code @click="setExampleQuery('owners:addr1,addr2,addr3')" class="cursor-pointer transition-all hover:-translate-y-0.5 hover:shadow-md bg-gray-100 dark:bg-gray-600 hover:bg-blue-100 dark:hover:bg-blue-800 border border-gray-200 dark:border-gray-500 hover:border-blue-400 dark:hover:border-blue-500 text-gray-700 dark:text-gray-200 hover:text-blue-800 dark:hover:text-blue-200 p-2 rounded font-mono text-sm">owners:addr1,addr2,addr3</code>
            </div>
          </div>

          <div class="mb-6 p-4 bg-white dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600">
            <h4 class="text-base font-semibold mb-2 text-gray-900 dark:text-gray-100">
              <code class="bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200 px-2 py-1 rounded font-mono">recipient</code> /
              <code class="bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200 px-2 py-1 rounded font-mono">recipients</code>
            </h4>
            <p class="mb-3 text-gray-600 dark:text-gray-300">Find transactions by recipient address(es)</p>
            <div class="flex flex-col gap-1">
              <code @click="setExampleQuery('recipient:target-wallet-address')" class="cursor-pointer transition-all hover:-translate-y-0.5 hover:shadow-md bg-gray-100 dark:bg-gray-600 hover:bg-blue-100 dark:hover:bg-blue-800 border border-gray-200 dark:border-gray-500 hover:border-blue-400 dark:hover:border-blue-500 text-gray-700 dark:text-gray-200 hover:text-blue-800 dark:hover:text-blue-200 p-2 rounded font-mono text-sm">recipient:target-wallet-address</code>
              <code @click="setExampleQuery('recipients:addr1,addr2')" class="cursor-pointer transition-all hover:-translate-y-0.5 hover:shadow-md bg-gray-100 dark:bg-gray-600 hover:bg-blue-100 dark:hover:bg-blue-800 border border-gray-200 dark:border-gray-500 hover:border-blue-400 dark:hover:border-blue-500 text-gray-700 dark:text-gray-200 hover:text-blue-800 dark:hover:text-blue-200 p-2 rounded font-mono text-sm">recipients:addr1,addr2</code>
            </div>
          </div>

          <div class="mb-6 p-4 bg-white dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600">
            <h4 class="text-base font-semibold mb-2 text-gray-900 dark:text-gray-100">
              <code class="bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200 px-2 py-1 rounded font-mono">tags</code>
            </h4>
            <p class="mb-3 text-gray-600 dark:text-gray-300">Find transactions by tag name and value. Special syntax for tag filtering.</p>
            <div class="flex flex-col gap-1">
              <code @click="setExampleQuery('tag:Content-Type=application/json')" class="cursor-pointer transition-all hover:-translate-y-0.5 hover:shadow-md bg-gray-100 dark:bg-gray-600 hover:bg-blue-100 dark:hover:bg-blue-800 border border-gray-200 dark:border-gray-500 hover:border-blue-400 dark:hover:border-blue-500 text-gray-700 dark:text-gray-200 hover:text-blue-800 dark:hover:text-blue-200 p-2 rounded font-mono text-sm">tag:Content-Type=application/json</code>
              <code @click="setExampleQuery('tag:Content-Type=image/png first:5')" class="cursor-pointer transition-all hover:-translate-y-0.5 hover:shadow-md bg-gray-100 dark:bg-gray-600 hover:bg-blue-100 dark:hover:bg-blue-800 border border-gray-200 dark:border-gray-500 hover:border-blue-400 dark:hover:border-blue-500 text-gray-700 dark:text-gray-200 hover:text-blue-800 dark:hover:text-blue-200 p-2 rounded font-mono text-sm">tag:Content-Type=image/png</code>
              <code @click="setExampleQuery('tag:App-Name=MyApp')" class="cursor-pointer transition-all hover:-translate-y-0.5 hover:shadow-md bg-gray-100 dark:bg-gray-600 hover:bg-blue-100 dark:hover:bg-blue-800 border border-gray-200 dark:border-gray-500 hover:border-blue-400 dark:hover:border-blue-500 text-gray-700 dark:text-gray-200 hover:text-blue-800 dark:hover:text-blue-200 p-2 rounded font-mono text-sm">tag:App-Name=MyApp</code>
              <code @click="setExampleQuery('tag:Type=Process')" class="cursor-pointer transition-all hover:-translate-y-0.5 hover:shadow-md bg-gray-100 dark:bg-gray-600 hover:bg-blue-100 dark:hover:bg-blue-800 border border-gray-200 dark:border-gray-500 hover:border-blue-400 dark:hover:border-blue-500 text-gray-700 dark:text-gray-200 hover:text-blue-800 dark:hover:text-blue-200 p-2 rounded font-mono text-sm">tag:Type=Process</code>
              <code @click="setExampleQuery('tag:Protocol=AO')" class="cursor-pointer transition-all hover:-translate-y-0.5 hover:shadow-md bg-gray-100 dark:bg-gray-600 hover:bg-blue-100 dark:hover:bg-blue-800 border border-gray-200 dark:border-gray-500 hover:border-blue-400 dark:hover:border-blue-500 text-gray-700 dark:text-gray-200 hover:text-blue-800 dark:hover:text-blue-200 p-2 rounded font-mono text-sm">tag:Protocol=AO</code>
            </div>
          </div>

          <div class="mb-6 p-4 bg-white dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600">
            <h4 class="text-base font-semibold mb-2 text-gray-900 dark:text-gray-100">
              <code class="bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200 px-2 py-1 rounded font-mono">id</code> /
              <code class="bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200 px-2 py-1 rounded font-mono">ids</code>
            </h4>
            <p class="mb-3 text-gray-600 dark:text-gray-300">Find specific transaction(s) by ID</p>
            <div class="flex flex-col gap-1">
              <code @click="setExampleQuery('id:specific-transaction-id')" class="cursor-pointer transition-all hover:-translate-y-0.5 hover:shadow-md bg-gray-100 dark:bg-gray-600 hover:bg-blue-100 dark:hover:bg-blue-800 border border-gray-200 dark:border-gray-500 hover:border-blue-400 dark:hover:border-blue-500 text-gray-700 dark:text-gray-200 hover:text-blue-800 dark:hover:text-blue-200 p-2 rounded font-mono text-sm">id:specific-transaction-id</code>
              <code @click="setExampleQuery('ids:tx1,tx2,tx3')" class="cursor-pointer transition-all hover:-translate-y-0.5 hover:shadow-md bg-gray-100 dark:bg-gray-600 hover:bg-blue-100 dark:hover:bg-blue-800 border border-gray-200 dark:border-gray-500 hover:border-blue-400 dark:hover:border-blue-500 text-gray-700 dark:text-gray-200 hover:text-blue-800 dark:hover:text-blue-200 p-2 rounded font-mono text-sm">ids:tx1,tx2,tx3</code>
            </div>
          </div>

          <div class="mb-6 p-4 bg-white dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600">
            <h4 class="text-base font-semibold mb-2 text-gray-900 dark:text-gray-100">
              <code class="bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200 px-2 py-1 rounded font-mono">block</code> /
              <code class="bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200 px-2 py-1 rounded font-mono">height</code>
            </h4>
            <p class="mb-3 text-gray-600 dark:text-gray-300">Find transactions within block height range</p>
            <div class="flex flex-col gap-1">
              <code @click="setExampleQuery('block:1000000 first:10')" class="cursor-pointer transition-all hover:-translate-y-0.5 hover:shadow-md bg-gray-100 dark:bg-gray-600 hover:bg-blue-100 dark:hover:bg-blue-800 border border-gray-200 dark:border-gray-500 hover:border-blue-400 dark:hover:border-blue-500 text-gray-700 dark:text-gray-200 hover:text-blue-800 dark:hover:text-blue-200 p-2 rounded font-mono text-sm">block:1000000</code> <span class="text-gray-500 dark:text-gray-400 text-sm">(from block 1000000 onwards)</span>
              <code @click="setExampleQuery('block:1000000-1100000 first:10')" class="cursor-pointer transition-all hover:-translate-y-0.5 hover:shadow-md bg-gray-100 dark:bg-gray-600 hover:bg-blue-100 dark:hover:bg-blue-800 border border-gray-200 dark:border-gray-500 hover:border-blue-400 dark:hover:border-blue-500 text-gray-700 dark:text-gray-200 hover:text-blue-800 dark:hover:text-blue-200 p-2 rounded font-mono text-sm">block:1000000-1100000</code> <span class="text-gray-500 dark:text-gray-400 text-sm">(between blocks)</span>
              <code @click="setExampleQuery('height:900000-1000000 first:10')" class="cursor-pointer transition-all hover:-translate-y-0.5 hover:shadow-md bg-gray-100 dark:bg-gray-600 hover:bg-blue-100 dark:hover:bg-blue-800 border border-gray-200 dark:border-gray-500 hover:border-blue-400 dark:hover:border-blue-500 text-gray-700 dark:text-gray-200 hover:text-blue-800 dark:hover:text-blue-200 p-2 rounded font-mono text-sm">height:900000-1000000</code>
            </div>
          </div>

          <div class="mb-6 p-4 bg-white dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600">
            <h4 class="text-base font-semibold mb-2 text-gray-900 dark:text-gray-100">
              <code class="bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200 px-2 py-1 rounded font-mono">first</code> /
              <code class="bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200 px-2 py-1 rounded font-mono">limit</code>
            </h4>
            <p class="mb-3 text-gray-600 dark:text-gray-300">Limit number of results (max 100)</p>
            <div class="flex flex-col gap-1">
              <code @click="setExampleQuery('first:20')" class="cursor-pointer transition-all hover:-translate-y-0.5 hover:shadow-md bg-gray-100 dark:bg-gray-600 hover:bg-blue-100 dark:hover:bg-blue-800 border border-gray-200 dark:border-gray-500 hover:border-blue-400 dark:hover:border-blue-500 text-gray-700 dark:text-gray-200 hover:text-blue-800 dark:hover:text-blue-200 p-2 rounded font-mono text-sm">first:20</code>
              <code @click="setExampleQuery('limit:50')" class="cursor-pointer transition-all hover:-translate-y-0.5 hover:shadow-md bg-gray-100 dark:bg-gray-600 hover:bg-blue-100 dark:hover:bg-blue-800 border border-gray-200 dark:border-gray-500 hover:border-blue-400 dark:hover:border-blue-500 text-gray-700 dark:text-gray-200 hover:text-blue-800 dark:hover:text-blue-200 p-2 rounded font-mono text-sm">limit:50</code>
            </div>
          </div>

          <div class="mb-6 p-4 bg-white dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600">
            <h4 class="text-base font-semibold mb-2 text-gray-900 dark:text-gray-100">
              <code class="bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200 px-2 py-1 rounded font-mono">bundled</code> /
              <code class="bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200 px-2 py-1 rounded font-mono">bundledin</code>
            </h4>
            <p class="mb-3 text-gray-600 dark:text-gray-300">Find data items within specific bundles</p>
            <div class="flex flex-col gap-1">
              <code @click="setExampleQuery('bundled:bundle-transaction-id')" class="cursor-pointer transition-all hover:-translate-y-0.5 hover:shadow-md bg-gray-100 dark:bg-gray-600 hover:bg-blue-100 dark:hover:bg-blue-800 border border-gray-200 dark:border-gray-500 hover:border-blue-400 dark:hover:border-blue-500 text-gray-700 dark:text-gray-200 hover:text-blue-800 dark:hover:text-blue-200 p-2 rounded font-mono text-sm">bundled:bundle-transaction-id</code>
              <code @click="setExampleQuery('bundledin:bundle1,bundle2')" class="cursor-pointer transition-all hover:-translate-y-0.5 hover:shadow-md bg-gray-100 dark:bg-gray-600 hover:bg-blue-100 dark:hover:bg-blue-800 border border-gray-200 dark:border-gray-500 hover:border-blue-400 dark:hover:border-blue-500 text-gray-700 dark:text-gray-200 hover:text-blue-800 dark:hover:text-blue-200 p-2 rounded font-mono text-sm">bundledin:bundle1,bundle2</code>
            </div>
          </div>

          <h3 class="text-xl font-semibold mb-4 text-gray-700 dark:text-gray-200">Complex Query Examples</h3>

          <div class="grid gap-4 mb-8">
            <div class="p-4 bg-white dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600">
              <h4 class="text-base font-semibold mb-2 text-gray-900 dark:text-gray-100">AO Process Messages</h4>
              <code @click="setExampleQuery('tag:Type=Message tag:Data-Protocol=ao')" class="block cursor-pointer transition-all hover:-translate-y-0.5 hover:shadow-lg bg-gray-50 dark:bg-gray-600 hover:bg-blue-50 dark:hover:bg-blue-900/30 border border-gray-200 dark:border-gray-500 hover:border-blue-400 dark:hover:border-blue-500 text-gray-700 dark:text-gray-200 hover:text-blue-800 dark:hover:text-blue-200 p-3 rounded font-mono text-sm break-all">tag:Type=Message tag:Data-Protocol=ao</code>
            </div>

            <div class="p-4 bg-white dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600">
              <h4 class="text-base font-semibold mb-2 text-gray-900 dark:text-gray-100">Recent JSON Data</h4>
              <code @click="setExampleQuery('tag:Content-Type=application/json')" class="block cursor-pointer transition-all hover:-translate-y-0.5 hover:shadow-lg bg-gray-50 dark:bg-gray-600 hover:bg-blue-50 dark:hover:bg-blue-900/30 border border-gray-200 dark:border-gray-500 hover:border-blue-400 dark:hover:border-blue-500 text-gray-700 dark:text-gray-200 hover:text-blue-800 dark:hover:text-blue-200 p-3 rounded font-mono text-sm break-all">tag:Content-Type=application/json</code>
            </div>

            <div class="p-4 bg-white dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600">
              <h4 class="text-base font-semibold mb-2 text-gray-900 dark:text-gray-100">Browse Images (with preview)</h4>
              <code @click="setExampleQuery('tag:Content-Type=image/jpeg')" class="block cursor-pointer transition-all hover:-translate-y-0.5 hover:shadow-lg bg-gray-50 dark:bg-gray-600 hover:bg-blue-50 dark:hover:bg-blue-900/30 border border-gray-200 dark:border-gray-500 hover:border-blue-400 dark:hover:border-blue-500 text-gray-700 dark:text-gray-200 hover:text-blue-800 dark:hover:text-blue-200 p-3 rounded font-mono text-sm break-all">tag:Content-Type=image/jpeg</code>
            </div>

            <div class="p-4 bg-white dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600">
              <h4 class="text-base font-semibold mb-2 text-gray-900 dark:text-gray-100">Specific User's Images</h4>
              <code @click="setExampleQuery('owner:wallet-address tag:Content-Type=image/png')" class="block cursor-pointer transition-all hover:-translate-y-0.5 hover:shadow-lg bg-gray-50 dark:bg-gray-600 hover:bg-blue-50 dark:hover:bg-blue-900/30 border border-gray-200 dark:border-gray-500 hover:border-blue-400 dark:hover:border-blue-500 text-gray-700 dark:text-gray-200 hover:text-blue-800 dark:hover:text-blue-200 p-3 rounded font-mono text-sm break-all">owner:wallet-address tag:Content-Type=image/png</code>
            </div>

            <div class="p-4 bg-white dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600">
              <h4 class="text-base font-semibold mb-2 text-gray-900 dark:text-gray-100">App-specific Data</h4>
              <code @click="setExampleQuery('tags:App-Name=MyApp tags:Version=1.0')" class="block cursor-pointer transition-all hover:-translate-y-0.5 hover:shadow-lg bg-gray-50 dark:bg-gray-600 hover:bg-blue-50 dark:hover:bg-blue-900/30 border border-gray-200 dark:border-gray-500 hover:border-blue-400 dark:hover:border-blue-500 text-gray-700 dark:text-gray-200 hover:text-blue-800 dark:hover:text-blue-200 p-3 rounded font-mono text-sm break-all">tags:App-Name=MyApp tags:Version=1.0</code>
            </div>
          </div>

          <h3 class="text-xl font-semibold mb-4 text-gray-700 dark:text-gray-200">Tips</h3>
          <ul class="bg-white dark:bg-gray-700 p-6 rounded-lg border border-gray-200 dark:border-gray-600 space-y-2">
            <li class="text-gray-600 dark:text-gray-300">Use quotes for values with spaces: <code @click="setExampleQuery('tags:Title=&quot;My File Name&quot; first:5')" class="cursor-pointer transition-all hover:-translate-y-0.5 bg-gray-100 dark:bg-gray-600 hover:bg-blue-100 dark:hover:bg-blue-800 border border-gray-200 dark:border-gray-500 hover:border-blue-400 dark:hover:border-blue-500 text-gray-700 dark:text-gray-200 hover:text-blue-800 dark:hover:text-blue-200 px-1 py-0.5 rounded font-mono text-sm">tags:Title="My File Name"</code></li>
            <li class="text-gray-600 dark:text-gray-300">Combine multiple criteria with spaces: <code @click="setExampleQuery('owner:address tags:Type=Image first:10')" class="cursor-pointer transition-all hover:-translate-y-0.5 bg-gray-100 dark:bg-gray-600 hover:bg-blue-100 dark:hover:bg-blue-800 border border-gray-200 dark:border-gray-500 hover:border-blue-400 dark:hover:border-blue-500 text-gray-700 dark:text-gray-200 hover:text-blue-800 dark:hover:text-blue-200 px-1 py-0.5 rounded font-mono text-sm">owner:address tags:Type=Image first:10</code></li>
            <li class="text-gray-600 dark:text-gray-300">Block ranges use dash notation: <code @click="setExampleQuery('block:1000-2000 first:10')" class="cursor-pointer transition-all hover:-translate-y-0.5 bg-gray-100 dark:bg-gray-600 hover:bg-blue-100 dark:hover:bg-blue-800 border border-gray-200 dark:border-gray-500 hover:border-blue-400 dark:hover:border-blue-500 text-gray-700 dark:text-gray-200 hover:text-blue-800 dark:hover:text-blue-200 px-1 py-0.5 rounded font-mono text-sm">block:1000-2000</code></li>
            <li class="text-gray-600 dark:text-gray-300">Tag filters support exact matching with the <code class="bg-gray-100 dark:bg-gray-600 text-gray-700 dark:text-gray-200 px-1 py-0.5 rounded font-mono text-sm">=</code> operator</li>
            <li class="text-gray-600 dark:text-gray-300">Results are paginated - use "Load More" for additional results</li>
            <li class="text-gray-600 dark:text-gray-300">Maximum 100 results per request (use <code class="bg-gray-100 dark:bg-gray-600 text-gray-700 dark:text-gray-200 px-1 py-0.5 rounded font-mono text-sm">first:100</code>)</li>
          </ul>
        </div>
      </details>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRoute } from 'vue-router'
import TransactionSearch from '../components/TransactionSearch.vue'

const route = useRoute()
const transactionSearchRef = ref<InstanceType<typeof TransactionSearch>>()

// Get URL query parameter
const urlQuery = computed(() => {
  return (route.query.q as string) || ''
})

// Function to set example query
function setExampleQuery(query: string) {
  transactionSearchRef.value?.setSearchQuery(query)
  // Update URL to reflect the new query
  updateURLWithQuery(query)
  // Scroll to search component
  document.querySelector('.transaction-search')?.scrollIntoView({
    behavior: 'smooth',
    block: 'start'
  })
}

// Function to update URL with current search state
function updateURLWithQuery(query: string, addToHistory = false) {
  if (typeof window === 'undefined') return // Skip during SSR

  const url = new URL(window.location.href)

  // Clear existing query parameters to avoid conflicts
  url.searchParams.delete('q')
  url.searchParams.delete('query')
  url.searchParams.delete('owner')
  url.searchParams.delete('owners')
  url.searchParams.delete('recipient')
  url.searchParams.delete('recipients')
  url.searchParams.delete('tags')
  url.searchParams.delete('id')
  url.searchParams.delete('ids')
  url.searchParams.delete('block')
  url.searchParams.delete('height')
  url.searchParams.delete('first')
  url.searchParams.delete('limit')
  url.searchParams.delete('bundled')
  url.searchParams.delete('bundledin')
  url.searchParams.delete('sort')

  // Remove any tag parameters (tag1, tag2, etc.)
  const keysToDelete: string[] = []
  url.searchParams.forEach((_, key) => {
    if (key.startsWith('tag') && key !== 'tags') {
      keysToDelete.push(key)
    }
  })
  keysToDelete.forEach(key => url.searchParams.delete(key))

  if (query.trim()) {
    // For simple queries, we could parse and set individual parameters
    // For now, we'll use the generic 'q' parameter for full query strings
    url.searchParams.set('q', query.trim())
  }

  // Update URL with or without adding to browser history
  if (addToHistory) {
    window.history.pushState({}, '', url.toString())
  } else {
    window.history.replaceState({}, '', url.toString())
  }
}

// Handle search execution events from TransactionSearch component
function handleSearchExecuted(query: string) {
  console.log('Search executed with query:', query)
  updateURLWithQuery(query, true) // Add to browser history for search executions
}

// Handle search chip changes from TransactionSearch component
function handleChipsChanged(chips: any[]) {
  // Convert chips back to query string for URL
  const queryParts: string[] = []

  chips.forEach(chip => {
    switch (chip.type) {
      case 'owners':
        if (Array.isArray(chip.value) && chip.value.length === 1) {
          queryParts.push(`owner:${chip.value[0]}`)
        } else if (Array.isArray(chip.value)) {
          queryParts.push(`owners:${chip.value.join(',')}`)
        }
        break
      case 'recipients':
        if (Array.isArray(chip.value) && chip.value.length === 1) {
          queryParts.push(`recipient:${chip.value[0]}`)
        } else if (Array.isArray(chip.value)) {
          queryParts.push(`recipients:${chip.value.join(',')}`)
        }
        break
      case 'ids':
        if (Array.isArray(chip.value) && chip.value.length === 1) {
          queryParts.push(`id:${chip.value[0]}`)
        } else if (Array.isArray(chip.value)) {
          queryParts.push(`ids:${chip.value.join(',')}`)
        }
        break
      case 'tags':
        if (chip.value && chip.value.name && chip.value.value) {
          queryParts.push(`tags:${chip.value.name}=${chip.value.value}`)
        } else if (chip.value && chip.value.values) {
          const tagName = chip.value.name || ''
          const tagValues = Array.isArray(chip.value.values) ? chip.value.values.join(',') : chip.value.values
          queryParts.push(`tags:${tagName}=${tagValues}`)
        }
        break
      case 'first':
        queryParts.push(`first:${chip.value}`)
        break
      case 'block':
        if (typeof chip.value === 'object' && chip.value.min !== undefined && chip.value.max !== undefined) {
          queryParts.push(`block:${chip.value.min}-${chip.value.max}`)
        } else {
          queryParts.push(`block:${chip.value}`)
        }
        break
      case 'bundledIn':
        if (Array.isArray(chip.value)) {
          queryParts.push(`bundled:${chip.value.join(',')}`)
        } else {
          queryParts.push(`bundled:${chip.value}`)
        }
        break
      case 'sort':
        queryParts.push(`sort:${chip.value}`)
        break
    }
  })

  const query = queryParts.join(' ')
  console.log('Chips changed, updating URL with query:', query)
  updateURLWithQuery(query, false) // Don't add to history for chip changes, just update current state
}

// Handle browser back/forward button navigation
function handlePopState() {
  if (typeof window === 'undefined') return
  // URL has changed via browser navigation - component will re-render with new urlQuery
  console.log('Browser navigation detected')
}

// Listen for browser back/forward button events
onMounted(() => {
  if (typeof window !== 'undefined') {
    window.addEventListener('popstate', handlePopState)
  }
})

// Cleanup event listener on unmount
onUnmounted(() => {
  if (typeof window !== 'undefined') {
    window.removeEventListener('popstate', handlePopState)
  }
})

// Expose functions for external use
defineExpose({
  updateURLWithQuery,
  setExampleQuery
})
</script>
