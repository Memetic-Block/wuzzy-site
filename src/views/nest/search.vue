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
      class="bg-green-300 hover:bg-green-400 active:bg-green-500 text-black transition-colors duration-200 cursor-pointer"
    >
      ->
    </Button>
  </div>
  <div v-if="isSearchPending">
    <Skeleton class="h-5 w-full rounded-xs" />
    <Skeleton class="h-5 my-2 w-full rounded-xs" />
    <Skeleton v-for="n in 10" :key="n" class="h-20 w-full rounded-sm my-6" />
  </div>
  <div v-if="searchResults">
    <div>
      {{ searchResults.total_hits }} results for "{{
        currentResultsSearchQuery
      }}" in Nest
      <a :href="`/nest/${route.params.nestId}`">{{ route.params.nestId }}</a>
    </div>
    <hr class="compact-hr" />
    <div v-for="hit in hits" :key="hit.id" class="my-6">
      <div class="hit-link-group">
        <a class="hit-title" :href="hit.url">{{ fallbackTitle(hit) }}</a>
        <br />
        <a class="hit-url" :href="hit.url">
          {{ formatUrlForWayfinder(hit.url) }}
        </a>
      </div>
      <p v-if="hit.content" class="hit-body" v-html="hit.content"></p>
    </div>
    <br />
    <template v-for="page in pages()" :key="page">
      <a
        v-if="searchResults.total_hits > 0 && currentPage() !== page"
        :href="`?q=${searchQuery}&from=${(page - 1) * pageSize}`"
        class="underline page-link"
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
import { onMounted, ref } from 'vue'
import { useRoute } from 'vue-router'
import {
  type WuzzyNestSearchHit,
  type WuzzyNestSearchResults
} from '../../types/wuzzy-nest'
import config from '../../app-config'
import Input from '../../components/ui/input/Input.vue'
import Button from '../../components/ui/button/Button.vue'
import Skeleton from '@/components/ui/skeleton/Skeleton.vue'

const nestViewModuleId = 'NWtLbRjMo6JHX1dH04PsnhbaDq8NmNT9L1HAPo_mtvc'
const route = useRoute()
const searchQuery = ref(
  new URL(window.location.href).searchParams.get('q') || ''
)
const currentResultsSearchQuery = ref('')
const pageSize = ref(10)
const searchResults = ref<WuzzyNestSearchResults | null>(null)
const hits = ref<Array<WuzzyNestSearchHit>>([])
const hasSearchError = ref(false)
const isSearchPending = ref(false)

function formatUrlForWayfinder(url: string) {
  return url
    .substring(0, url.length)
    .replace('https://', 'arns://')
    .replace('.arweave.net', '')
    .replace(/\/+$/, '')
}

function fallbackTitle(hit: WuzzyNestSearchHit) {
  return hit.title || formatUrlForWayfinder(hit.id)
}

const onSearchClicked = async () => {
  searchResults.value = null
  hasSearchError.value = false

  let query = searchQuery.value.trim()
  if (!query) {
    console.log('No search query provided')
    return
  }

  isSearchPending.value = true

  const from = parseInt(route.query.from as string) || 0
  if (!isNaN(from) && from >= 0) {
    query += `&from=${from}`
  }

  try {
    const response = await fetch(
      `${config.hyperbeamEndpoint}/${route.params.nestId}/now/~lua@5.3a&module=${nestViewModuleId}/search_bm25/serialize~json@1.0?query=${query}`
    )
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    searchResults.value = await response.json()
    console.log('got search results', searchResults.value)

    if (searchResults.value) {
      hits.value = []
      const total = searchResults.value.result_count
      for (let i = 1; i <= total; i++) {
        hits.value.push({
          id: searchResults.value[`${i}_docid`],
          url: searchResults.value[`${i}_docid`],
          title: searchResults.value[`${i}_title`],
          description: searchResults.value[`${i}_description`],
          content: searchResults.value[`${i}_content`],
          count: searchResults.value[`${i}_count`],
          score: searchResults.value[`${i}_score`]
        })
      }
      currentResultsSearchQuery.value = searchQuery.value
    }
  } catch (e) {
    hasSearchError.value = true
    console.error('Error fetching search results:', e)
  }

  isSearchPending.value = false
}

onMounted(async () => {
  if (searchQuery.value) {
    await onSearchClicked()
  }
})

function pages() {
  if (!searchResults.value) return []
  const totalResults = searchResults.value.total_hits
  const totalPages = Math.ceil(totalResults / pageSize.value)
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
  return Math.floor(from / pageSize.value) + 1
}
</script>
