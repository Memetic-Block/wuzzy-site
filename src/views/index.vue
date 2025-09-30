<template>
  <input
    type="text"
    name="search"
    v-model="searchQuery"
    placeholder="Search the Permaweb..."
    @keyup.enter="onSearchClicked"
  />
  <br />
  <button class="search-type-radio-container" @click="onSearchTypeClicked('off-chain')">
    <input type="radio" name="off-chain-search" v-model="searchType" value="off-chain" />
    Off-Chain Search
  </button>
  <button class="search-type-radio-container" @click="onSearchTypeClicked('on-chain')">
    <input type="radio" v-model="searchType" value="on-chain" />
    Hyperbeam Search (Experimental)
  </button>
  <button class="search-button" @click="onSearchClicked">Search</button>
  <br />
  <br />
  <a href="/registry">Wuzzy Nest Registry</a>
  <!-- <em>
    Indexing 3,667 <a href="https://arns.app" target="_blank">ARNS</a> Records
  </em> -->
</template>

<style scoped>
.search-type-radio-container {
  display: inline-block;
  border: var(--border-thickness) solid var(--text-color);
  padding: calc(var(--line-height) / 2 - var(--border-thickness)) calc(1ch - var(--border-thickness));
  margin: 0;
  font: inherit;
  font-weight: inherit;
  height: calc(var(--line-height) * 2);
  width: auto;
  overflow: visible;
  background: var(--background-color);
  color: var(--text-color);
  line-height: normal;
  -webkit-font-smoothing: inherit;
  -moz-osx-font-smoothing: inherit;
  -webkit-appearance: none;
}

.search-button {
  float: right;
}
</style>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import config from '../app-config'

const router = useRouter()
const searchQuery = ref(
  new URL(window.location.href).searchParams.get('q') || ''
)
const searchType = ref('off-chain')
const onSearchTypeClicked = (type: string) => {
  searchType.value = type
}
const onSearchClicked = () => {
  if (searchQuery.value.trim()) {
    router.push({
      path: searchType.value === 'on-chain'
        ? `/nest/${config.primaryNestId}/search`
        : '/search',
      query: { q: searchQuery.value }
    })
  } else {
    console.warn('Search query is empty')
  }
}
</script>
