<template>
  <div
    class="bg-primary-foreground py-1 px-2 rounded-md flex gap-2 items-center border-input border focus-within:shadow-xs focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]"
  >
    <!-- Mode switcher dropdown (conditionally shown) -->
    <DropdownMenu v-if="showModeSwitch">
      <DropdownMenuTrigger class="flex items-center gap-1 px-2 py-1 text-sm bg-muted hover:bg-muted/80 rounded border border-input transition-colors cursor-pointer">
        {{ searchMode }}
        <svg class="h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
        </svg>
      </DropdownMenuTrigger>
      <DropdownMenuContent class="min-w-[120px]">
        <DropdownMenuItem @click="onSearchModeChange('ARNS')" class="cursor-pointer">
          ARNS
        </DropdownMenuItem>
        <DropdownMenuItem @click="onSearchModeChange('Images')" class="cursor-pointer">
          Images
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
    
    <Input
      class="shadow-none focus-visible:ring-[0px] ml-2 border-0 p-0 dark:bg-transparent autofill:bg-transparent"
      type="text"
      name="search"
      v-model="searchQuery"
      :placeholder="placeholderText"
      @input="handleInput"
      @keydown.enter="handleEnter"
      @keydown.space="handleSpace"
      @keydown.backspace="handleBackspace"
      autofocus
    />
    
    <Button
      :disabled="!searchQuery.trim()"
      size="icon-sm"
      @click="onSearchClicked"
      class="bg-green-300 hover:bg-green-400 active:bg-green-400 dark:bg-green-400 dark:hover:bg-green-500 dark:active:bg-green-500 text-black transition-colors duration-200 cursor-pointer"
    >
      {{ buttonText }}
    </Button>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import config from '../app-config'
import Input from './ui/input/Input.vue'
import Button from './ui/button/Button.vue'
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from './ui/dropdown-menu'

interface Props {
  initialQuery?: string
  initialMode?: 'ARNS' | 'Transactions' | 'Images' | 'Audio' | 'Video'
  searchType?: 'on-chain' | 'off-chain'
  standalone?: boolean // If true, emit search event instead of navigating
  showModeSwitch?: boolean // If false, hide the dropdown (useful for dedicated search pages)
  buttonText?: string // Custom button text (default is "->")
}

const props = withDefaults(defineProps<Props>(), {
  initialQuery: '',
  initialMode: 'ARNS',
  searchType: 'off-chain',
  standalone: false,
  showModeSwitch: true,
  buttonText: '->'
})

const emit = defineEmits<{
  search: [mode: 'ARNS' | 'Transactions' | 'Images' | 'Audio' | 'Video', query: string, parsedOptions?: any]
  modeChanged: [mode: 'ARNS' | 'Transactions' | 'Images' | 'Audio' | 'Video']
}>()

const router = useRouter()
const searchQuery = ref(props.initialQuery)
const searchMode = ref<'ARNS' | 'Transactions' | 'Images' | 'Audio' | 'Video'>(props.initialMode)

const placeholderText = computed(() => {
  if (searchMode.value === 'ARNS') {
    return 'Search the Permaweb...'
  }
  
  switch (searchMode.value) {
    case 'Images':
      return 'Search for images...'
    default:
      return 'Enter search query...'
  }
})

const onSearchModeChange = (mode: 'ARNS' | 'Transactions' | 'Images' | 'Audio' | 'Video') => {
  searchMode.value = mode
  emit('modeChanged', mode)
}

const handleInput = () => {
  // Simple input handling - no parsing needed
}

const handleSpace = () => {
  // No special space handling needed without chips
}

const handleBackspace = () => {
  // No special backspace handling needed without chips
}

const handleEnter = () => {
  onSearchClicked()
}

const onSearchClicked = () => {
  const trimmedQuery = searchQuery.value.trim()
  
  if (!trimmedQuery) {
    console.warn('Search query is empty')
    return
  }
  
  // Emit the search event
  emit('search', searchMode.value, trimmedQuery)
  
  // If not standalone, handle navigation
  if (!props.standalone) {
    if (searchMode.value === 'ARNS') {
      router.push({
        path: props.searchType === 'on-chain'
          ? `/nest/${config.primaryNestId}/search`
          : '/search',
        query: { q: trimmedQuery }
      })
    } else if (searchMode.value === 'Images') {
      router.push({
        path: '/image-search',
        query: { q: trimmedQuery }
      })
    }
  }
}

// Expose methods for external control
defineExpose({
  setQuery: (query: string) => {
    searchQuery.value = query
  },
  setMode: (mode: 'ARNS' | 'Transactions' | 'Images' | 'Audio' | 'Video') => {
    searchMode.value = mode
  }
})
</script>