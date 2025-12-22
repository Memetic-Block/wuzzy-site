<template>
  <SearchInput
    :initial-query="searchQuery"
    initial-mode="ARNS"
    button-text="->"
  />
  <div v-if="isSearchPending">
    <Skeleton class="h-5 w-full rounded-xs" />
    <Skeleton class="h-5 my-2 w-full rounded-xs" />
    <Skeleton v-for="n in 10" :key="n" class="h-20 w-full rounded-sm my-6" />
  </div>
  <div v-if="searchResults">
    <div>
      {{ searchResults.total_results }} results for "{{
        newSearchQuery || route.query.q
      }}"
    </div>
    <hr class="compact-hr" />
    <div v-for="hit in searchResults.hits" :key="hit.id" class="my-6">
      <div class="hit-link-group">
        <a
          class="hit-title text-blue-700 dark:text-blue-400"
          :href="hit.resolvedUrl"
          >{{ fallbackTitle(hit) }}</a
        >
        <br />
        <a class="hit-url" :href="hit.resolvedUrl">
          {{ hit.wayfinderUrl }}
        </a>
      </div>
      <p v-if="hit.body" class="hit-body" v-html="hit.body"></p>
    </div>
    <br />
    <template v-for="page in pages()" :key="page">
      <a
        v-if="searchResults.hits.length > 0 && currentPage() !== page"
        :href="`?q=${route.query.q}&from=${(page - 1) * pageSize}`"
        class="hover:underline page-link cursor-pointer select-none text-blue-700 dark:text-blue-400"
      >
        {{ page }}
      </a>
      <span class="page-link text-foreground select-none" v-else>{{
        page
      }}</span>
    </template>
  </div>
  <div v-if="hasSearchError">
    <p>There was an error fetching search results. Please try again later.</p>
    <div class="mt-40">
      <img
        class="w-full h-full max-h-12 object-contain"
        src="/wuzzy-red.png"
        alt="Wuzzy"
      />
    </div>
  </div>
</template>

<style scoped>
.hit-link-group {
  width: max-content;
}
.hit-link-group:hover .hit-title {
  text-decoration: underline;
}

.hit-title {
  text-decoration: none;
  font-size: larger;
}

.hit-url {
  font-size: x-small;
  margin-top: 0;
  text-decoration: none;
}
.hit-body {
  margin-top: 0.25em;
  margin-bottom: 0;
  font-size: smaller;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
.compact-hr {
  margin: 0.5em 0;
}
.page-link {
  padding: 0 0.25em;
}
</style>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useRoute, type LocationQuery } from 'vue-router'
import type { SearchResults } from '../types/search-types'
import config from '../app-config'
import SearchInput from '../components/SearchInput.vue'
import Skeleton from '@/components/ui/skeleton/Skeleton.vue'
import { convertToWayfinderUrl, convertToHttpsUrl } from '../lib/utils'
import { useSeoMeta } from '@unhead/vue'
import { useWallet } from '../composables/wallet'
import { useWalletAnalytics } from '../composables/wallet-analytics'
import { useAchievements } from '../composables/achievements'

const route = useRoute()
const { address } = useWallet()
const walletAnalytics = useWalletAnalytics()
const { refreshAchievements } = useAchievements(address)
const searchResults = ref<SearchResults | null>(null)
const isSearchPending = ref(false)
const hasSearchError = ref(false)
const hasMoreResults = ref(false)
const pageSize = 20

watch(() => route.query, search, { immediate: true })

const newSearchQuery = ref('')

function fallbackTitle(hit: { title: string; wayfinderUrl: string }) {
  return hit.title || hit.wayfinderUrl
}

function pages() {
  if (!searchResults.value) return []
  const totalResults = searchResults.value.total_results
  const totalPages = Math.ceil(totalResults / pageSize)
  const maxDisplayPages = 10
  const displayPages = Math.min(totalPages, maxDisplayPages)

  let startPage = 1
  const current = currentPage()

  if (totalPages <= maxDisplayPages) {
    // If total pages is 10 or less, show all pages
    startPage = 1
  } else {
    // Calculate sliding window
    const halfWindow = Math.floor(maxDisplayPages / 2)
    startPage = Math.max(1, current - halfWindow)

    // Ensure we don't go past the end
    if (startPage + maxDisplayPages - 1 > totalPages) {
      startPage = totalPages - maxDisplayPages + 1
    }
  }

  return Array.from({ length: displayPages }, (_, i) => i + startPage)
}

function currentPage() {
  const from = parseInt(route.query.from as string) || 0
  return Math.floor(from / pageSize) + 1
}

const searchQuery = ref(
  new URL(window.location.href).searchParams.get('q') || ''
)

useSeoMeta({
  title: computed(() => searchQuery.value || 'Search The Permaweb')
})

async function search(query: LocationQuery) {
  isSearchPending.value = true
  hasSearchError.value = false
  searchResults.value = null

  if (Array.isArray(query.q)) {
    console.warn('Search query should not be an array')
    return
  }
  if (typeof query.q !== 'string') {
    console.warn('Search query should be a string')
    return
  }

  let q = encodeURIComponent(query.q.trim())
  const from = parseInt(query.from as string) || 0
  if (!isNaN(from) && from >= 0) {
    q += `&from=${from}`
  }

  if (q) {
    try {
      // Build headers with optional wallet address
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      }

      // Include wallet address if user has consented to wallet analytics
      if (address.value && walletAnalytics.hasWalletConsent(address.value)) {
        headers['X-Wallet-Address'] = address.value
      }

      const response = await fetch(`${config.searchApiUrl}/search?q=${q}`, {
        headers
      })
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      const _searchResults = (await response.json()) as SearchResults
      for (const hit of _searchResults.hits) {
        hit.wayfinderUrl = convertToWayfinderUrl(hit.url)
        hit.resolvedUrl = convertToHttpsUrl(hit.wayfinderUrl)
      }
      searchResults.value = _searchResults
      if (searchResults.value.hits.length > 0) {
        hasMoreResults.value =
          searchResults.value.hits.length < searchResults.value.total_results
      }
    } catch (error) {
      hasSearchError.value = true
      console.error('Error fetching search results:', error)
    }
  }

  isSearchPending.value = false
  refreshAchievements()
}
</script>
