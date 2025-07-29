<template>
  <h1><a class="wuzzy-search-logo" href="/">Wuzzy Search</a></h1>
  <input
    type="text"
    v-model="searchQuery"
    placeholder="Search..."
    @keyup.enter="onSearchClicked"
  />
  <br />
  <button @click="onSearchClicked">Search</button>
  <main>
    <RouterView />
  </main>
</template>

<style scoped>
.wuzzy-search-logo {
  text-decoration: none;
  color: var(--text-color);
  font-weight: var(--font-weight-bold);
}
</style>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const searchQuery = ref(
  new URL(window.location.href).searchParams.get('q') || ''
)

const onSearchClicked = () => {
  if (searchQuery.value.trim()) {
    router.push({
      path: `/search`,
      query: { q: searchQuery.value }
    })
  } else {
    console.warn('Search query is empty')
  }
}
</script>
