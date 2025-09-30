<template>
  <input
    type="text"
    name="search"
    v-model="searchQuery"
    :placeholder="`Search Nest ${route.params.nestId}...`"
    @keyup.enter="onSearchClicked"
  />
  <button @click="onSearchClicked">Search</button>
  <h2>Search Nest Id: <code>{{ route.params.nestId }}</code></h2>
  <div v-if="searchResults">
    <div>
      {{ searchResults.total_hits }} results
      for "{{ searchQuery }}"
      in Nest <a :href="`/nest/${route.params.nestId}`">{{ route.params.nestId }}</a>
    </div>
    <hr class="compact-hr" />
    <div v-for="hit in hits" :key="hit.id">
      <a class="hit-title" :href="hit.url">{{ fallbackTitle(hit) }}</a>
      <br />
      <a class="hit-url" :href="hit.url">
        {{ hit.url }}
      </a>
      <p v-if="hit.content" class="hit-body" v-html="hit.content"></p>
    </div>
    <br />
    <template v-for="page in pages()" :key="page">
      <a
        v-if="
          searchResults.total_hits > 0 &&
            currentPage() !== page
        "
        :href="`?q=${searchQuery}&from=${(page - 1) * pageSize}`"
        class="page-link"
      >
        {{ page }}
      </a>
      <span class="page-link" v-else>{{ page }}</span>
    </template>
  </div>
</template>

<style scoped>
h2 {
  text-transform: none;
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
import { onMounted, ref } from 'vue'
import { useRoute } from 'vue-router'
import {
  type WuzzyNestSearchHit,
  type WuzzyNestSearchResults
} from '../../types/wuzzy-nest'
import config from '../../app-config'

const nestViewModuleId = 'NWtLbRjMo6JHX1dH04PsnhbaDq8NmNT9L1HAPo_mtvc'
const route = useRoute()
const searchQuery = ref(
  new URL(window.location.href).searchParams.get('q') || ''
)
const pageSize = ref(10)
const searchResults = ref<WuzzyNestSearchResults | null>(null)
const hits = ref<Array<WuzzyNestSearchHit>>([])
function fallbackTitle(hit: WuzzyNestSearchHit) {
  return hit.title || hit.id
    .replace('https://', '')
    .replace('http://', '')
    .replace('arns://', '')
    .replace('ar://', '')
}

const onSearchClicked = async () => {
  searchResults.value = null

  let query = searchQuery.value.trim()
  if (!query) {
    console.log('No search query provided')
    return
  }

  const from = parseInt(route.query.from as string) || 0
  if (!isNaN(from) && from >= 0) {
    query += `&from=${from}`
  }

  try {
    const response = await fetch(
      `${config.hyperbeamEndpoint}/${route.params.nestId}/now/~lua@5.3a&module=${nestViewModuleId}/search_bm25/serialize~json@1.0?query=${query}`
    )
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
    }
  } catch (e) {
    console.error('Error fetching search results:', e)
  }
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
  return Array.from({ length: totalPages }, (_, i) => i + 1)
}

function currentPage() {
  const from = parseInt(route.query.from as string) || 0
  return Math.floor(from / pageSize.value) + 1
}
</script>
