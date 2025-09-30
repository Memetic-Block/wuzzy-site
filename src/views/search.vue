<template>
  <div v-if="searchResults">
    <div>{{ searchResults.total_results }} results for "{{ route.query.q }}"</div>
    <hr class="compact-hr" />
    <div v-for="hit in searchResults.hits" :key="hit.id">
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
        v-if="
          searchResults.hits.length > 0 &&
            currentPage() !== page
        "
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
    <img src="/wuzzy-red.png" alt="Wuzzy" />
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
.hit-url {
  font-size: x-small;
  margin-top: 0;
  text-decoration: none;
}
.hit-body {
  margin-top: 0.25em;
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
import {
  useRoute,
  type LocationQuery
} from 'vue-router'
import type { SearchResults } from '../types/search-types'
import config from '../app-config'

const route = useRoute()
const searchResults = ref<SearchResults | null>(null)
const isSearchPending = ref(false)
const hasSearchError = ref(false)
const hasMoreResults = ref(false)
const pageSize = 20

watch(() => route.query, search, { immediate: true })

function formatUrlForWayfinder(url: string) {
  return url
    .substring(0, url.length - 1)
    .replace('https://', 'arns://')
    .replace('.arweave.net', '')
}

function fallbackTitle(hit: { title: string, url: string }) {
  return hit.title || formatUrlForWayfinder(hit.url)
}

function pages() {
  if (!searchResults.value) return []
  const totalResults = searchResults.value.total_results
  const totalPages = Math.ceil(totalResults / pageSize)
  return Array.from({ length: totalPages }, (_, i) => i + 1)
}

function currentPage() {
  const from = parseInt(route.query.from as string) || 0
  return Math.floor(from / pageSize) + 1
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
      searchResults.value = await response.json() as SearchResults
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
