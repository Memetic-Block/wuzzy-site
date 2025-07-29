<template>
  <div v-if="searchResults">
    <div>{{ searchResults.total_results }} results for "{{ route.query.q }}"</div>
    <hr class="compact-hr" />
    <div v-for="hit in searchResults.hits" :key="hit.id">
      <a class="hit-title" :href="hit.url">{{ hit.title }}</a>
      <br />
      <a class="hit-url" :href="hit.url">
        {{ formatUrlForWayfinder(hit.url) }}
      </a>
      <p class="hit-body">{{ hit.body }}</p>
    </div>
  </div>
</template>

<style scoped>
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
  font-size: smaller;
}
.compact-hr {
  margin: 0.5em 0;
}
</style>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { useRoute, type LocationQueryValue } from 'vue-router'
import type { SearchResults } from '../types/search-types'

const route = useRoute()
const searchResults = ref<SearchResults | null>(null)

watch(() => route.query.q, search, { immediate: true })

function formatUrlForWayfinder(url: string) {
  return url.replace('https://', 'arns://').replace('.arweave.net', '')
}

async function search(query: LocationQueryValue | LocationQueryValue[]) {
  if (Array.isArray(query)) {
    console.warn('Search query should not be an array')
    return
  }
  if (typeof query !== 'string') {
    console.warn('Search query should be a string')
    return
  }
  query = query.trim()
  if (query) {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_SEARCH_API_URL}/search?q=${encodeURIComponent(query)}`
      )
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      searchResults.value = await response.json() as SearchResults
      console.log('Search results:', searchResults.value)
    } catch (error) {
      console.error('Error fetching search results:', error)
    }
  } else {
    console.warn('Search query is empty')
  }
}
</script>
