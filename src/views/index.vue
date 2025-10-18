<template>
  <div class="flex items-center justify-center gap-2 my-7">
    <Switch
      :value="searchType"
      :class="searchType === 'off-chain' ? 'bg-neutral-400!' : 'bg-green-400!'"
      @update:modelValue="
        onSearchTypeClicked(
          searchType === 'off-chain' ? 'on-chain' : 'off-chain'
        )
      "
    />
    <span class="inline-block">Hyperbeam Search (Experimental)</span>
  </div>
  <div
    class="bg-neutral-100 py-1 px-2 rounded-md flex gap-2 items-center border-input border focus-within:shadow-xs focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]"
  >
    <Input
      class="shadow-none focus-visible:ring-[0px] ml-2 border-0 p-0"
      type="text"
      name="search"
      v-model="searchQuery"
      placeholder="Search the Permaweb..."
      @keyup.enter="onSearchClicked"
      autofocus
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
  <br />
  <a class="text-sm pl-1 underline" href="/registry">Wuzzy Nest Registry</a>
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
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import config from '../app-config'
import Input from '../components/ui/input/Input.vue'
import Button from '../components/ui/button/Button.vue'
import { Switch } from '../components/ui/switch'

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
      path:
        searchType.value === 'on-chain'
          ? `/nest/${config.primaryNestId}/search`
          : '/search',
      query: { q: searchQuery.value }
    })
  } else {
    console.warn('Search query is empty')
  }
}
</script>
