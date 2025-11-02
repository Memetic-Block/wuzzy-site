<template>
  <!-- <div class="flex items-center justify-center gap-2 my-7">
    <Switch
      :value="searchType"
      :class="searchType === 'off-chain' ? 'bg-neutral-400!' : 'bg-green-400! '"
      @update:modelValue="
        onSearchTypeClicked(
          searchType === 'off-chain' ? 'on-chain' : 'off-chain'
        )
      "
    />
    <span class="inline-block">Hyperbeam Search (Experimental)</span>
  </div> -->
  <SearchInput
    :initial-query="initialQuery"
    initial-mode="ARNS"
    :search-type="searchType"
  />
  <br />
  <a class="text-sm pl-1 underline" href="/image-search">Image Search</a>
  <!-- <em>
    Indexing 3,667 <a href="https://arns.app" target="_blank">ARNS</a> Records
  </em> -->
</template>

<style scoped>
.search-button {
  margin-top: 20px;
  float: right;
}
</style>

<script setup lang="ts">
import { ref, computed } from 'vue'
// import { Switch } from '../components/ui/switch'
import SearchInput from '../components/SearchInput.vue'
import { useSeoMeta } from '@unhead/vue'

const searchType = ref<'on-chain' | 'off-chain'>('off-chain')

const initialQuery = computed(() => {
  if (typeof window !== 'undefined') {
    return new URL(window.location.href).searchParams.get('q') || ''
  }
  return ''
})

// const onSearchTypeClicked = (type: 'on-chain' | 'off-chain') => {
//   searchType.value = type
// }

useSeoMeta({
  titleTemplate: ''
})
</script>
