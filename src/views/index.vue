<template>
  <input
    type="text"
    name="search"
    v-model="searchQuery"
    placeholder="Search the Permaweb..."
    @keyup.enter="onSearchClicked"
  />
  <br />
  <button @click="onSearchClicked">Search</button>
  <br />
  <br />
  <a href="/registry">Wuzzy Nest Registry</a>
  <!-- <em>
    Indexing 3,667 <a href="https://arns.app" target="_blank">ARNS</a> Records
  </em> -->
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import config from '../app-config'

const router = useRouter()
const searchQuery = ref(
  new URL(window.location.href).searchParams.get('q') || ''
)

const onSearchClicked = () => {
  if (searchQuery.value.trim()) {
    router.push({
      path: `/nest/${config.primaryNestId}/search`,
      query: { q: searchQuery.value }
    })
  } else {
    console.warn('Search query is empty')
  }
}
</script>
