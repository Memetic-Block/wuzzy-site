<template>
  <h1><a class="wuzzy-search-logo" href="/">Wuzzy Permaweb Search</a></h1>
  <input
    type="text"
    v-model="searchQuery"
    placeholder="Search the Permaweb..."
    @keyup.enter="onSearchClicked"
  />
  <br />
  <button @click="onSearchClicked">Search</button>
  <main class="main-router-view-container">
    <RouterView />
  </main>
  <footer>
    Built &amp; Operated by <a href="https://memeticblock.com" target="_blank">
      Memetic Block
    </a>
  </footer>
</template>

<style scoped>
.wuzzy-search-logo {
  text-decoration: none;
  color: var(--text-color);
  font-weight: var(--font-weight-bold);
}
.main-router-view-container {
  padding-bottom: 2rem;
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
