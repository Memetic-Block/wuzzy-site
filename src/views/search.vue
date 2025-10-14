<template>
  <div
    class="mb-4 bg-neutral-100 mt-3 py-1 px-2 rounded-md flex gap-2 items-center border-input border focus-within:shadow-xs focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]"
  >
    <Input
      class="shadow-none focus-visible:ring-[0px] ml-2 border-0 p-0"
      type="text"
      name="search"
      v-model="searchQuery"
      :placeholder="`Search Nest ${route.params.nestId}...`"
      @keyup.enter="onSearchClicked"
    />
    <Button
      :disabled="!searchQuery.trim()"
      size="icon-sm"
      @click="onSearchClicked"
      class="bg-green-300 hover:bg-green-400 active:bg-green-500 text-black transition-colors duration-200"
    >
      ->
    </Button>
  </div>
  <div v-if="searchResults">
    <div>
      {{ searchResults.total_results }} results for "{{
        newSearchQuery || route.query.q
      }}"
    </div>
    <hr class="compact-hr" />
    <div v-for="hit in searchResults.hits" :key="hit.id" class="my-6">
      <a class="hit-title" :href="hit.url">{{ fallbackTitle(hit) }}</a>
      <br />
      <a class="hit-url" :href="hit.url">
        {{ formatUrlForWayfinder(hit.url) }}
      </a>
      <p v-if="hit.body" class="hit-body" v-html="hit.body"></p>
    </div>
    <br />
    <template v-for="page in pages()" :key="page">
      <a
        v-if="searchResults.hits.length > 0 && currentPage() !== page"
        :href="`?q=${route.query.q}&from=${(page - 1) * pageSize}`"
        class="page-link"
      >
        {{ page }}
      </a>
      <span class="page-link" v-else>{{ page }}</span>
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
.hit-title {
  text-decoration: none;
  font-size: larger;
}
.hit-title:link {
  color: blue;
}
.hit-title:visited {
  color: purple;
}
.hit-title:hover {
  text-decoration: underline;
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
}
.compact-hr {
  margin: 0.5em 0;
}
.page-link {
  margin-right: 0.5em;
}
.page-link:link {
  color: blue;
}
.page-link:visited {
  color: purple;
}
</style>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { useRoute, type LocationQuery } from 'vue-router'
import type { SearchResults } from '../types/search-types'
import config from '../app-config'
import Input from '../components/ui/input/Input.vue'
import Button from '../components/ui/button/Button.vue'

const route = useRoute()
const searchResults = ref<SearchResults | null>(null)
const isSearchPending = ref(false)
const hasSearchError = ref(false)
const hasMoreResults = ref(false)
const pageSize = 20

watch(() => route.query, search, { immediate: true })

const newSearchQuery = ref('')

function formatUrlForWayfinder(url: string) {
  return url
    .substring(0, url.length - 1)
    .replace('https://', 'arns://')
    .replace('.arweave.net', '')
}

function fallbackTitle(hit: { title: string; url: string }) {
  return hit.title || formatUrlForWayfinder(hit.url)
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

const onSearchClicked = async () => {
  if (searchQuery.value.trim()) {
    newSearchQuery.value = searchQuery.value
    const query: LocationQuery = { q: searchQuery.value }
    search(query)
  } else {
    console.warn('Search query is empty')
  }
}

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

  console.log(`Search query: "${q}", from: ${from}`)
  if (q) {
    try {
      const response = await fetch(`${config.searchApiUrl}/search?q=${q}`)
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      searchResults.value = (await response.json()) as SearchResults
      if (searchResults.value.hits.length > 0) {
        hasMoreResults.value =
          searchResults.value.hits.length < searchResults.value.total_results
      } else {
        console.warn('No search results found')
      }
      console.log('Search results:', searchResults.value)
    } catch (error) {
      hasSearchError.value = true
      console.error('Error fetching search results:', error)
    }
  } else {
    console.warn('Search query is empty')
  }

  isSearchPending.value = false
}
</script>
