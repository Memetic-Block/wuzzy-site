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
        <DropdownMenuItem @click="onSearchModeChange('Transactions')" class="cursor-pointer">
          Transactions
        </DropdownMenuItem>
        <DropdownMenuItem @click="onSearchModeChange('Images')" class="cursor-pointer">
          Images
        </DropdownMenuItem>
        <DropdownMenuItem @click="onSearchModeChange('Audio')" class="cursor-pointer">
          Audio
        </DropdownMenuItem>
        <DropdownMenuItem @click="onSearchModeChange('Video')" class="cursor-pointer">
          Video
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
    
    <!-- Search Chips (only shown in non-ARNS modes) -->
    <div v-if="showChips && searchSyntax.searchChips.value.length > 0" class="flex flex-wrap gap-1.5 max-w-[50%] overflow-hidden">
      <div
        v-for="chip in searchSyntax.searchChips.value"
        :key="chip.id"
        class="flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium shadow-sm transition-all hover:scale-105 hover:shadow-md cursor-pointer bg-blue-500 text-white hover:bg-blue-400"
        :title="chip.label"
      >
        <span class="whitespace-nowrap text-xs">{{ chip.label }}</span>
        <button
          @click="searchSyntax.removeChip(chip.id)"
          class="bg-none border-none text-current text-sm font-bold cursor-pointer p-0 w-3 h-3 flex items-center justify-center rounded-full transition-colors hover:bg-white/30 hover:text-white"
          title="Remove filter"
        >
          ×
        </button>
      </div>
    </div>
    
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
    
    <!-- Clear all chips button (only for chip-based modes) -->
    <button
      v-if="showChips && searchSyntax.searchChips.value.length > 0"
      @click="searchSyntax.clearAllChips"
      class="bg-gray-400 dark:bg-gray-600 text-white border-none w-6 h-6 rounded-full text-sm cursor-pointer transition-all hover:bg-red-500 dark:hover:bg-red-500 hover:scale-110 flex items-center justify-center"
      title="Clear all filters"
    >
      ×
    </button>
    
    <Button
      :disabled="searchMode === 'ARNS' ? !searchQuery.trim() : (searchSyntax.searchChips.value.length === 0 && !searchQuery.trim())"
      size="icon-sm"
      @click="onSearchClicked"
      class="bg-green-300 hover:bg-green-400 active:bg-green-400 dark:bg-green-400 dark:hover:bg-green-500 dark:active:bg-green-500 text-black transition-colors duration-200 cursor-pointer"
    >
      {{ buttonText }}
    </Button>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
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
import { useSearchSyntax } from '../composables/search-syntax'

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
const searchSyntax = useSearchSyntax()

// Determine if chips should be shown (not for ARNS mode)
const showChips = computed(() => searchMode.value !== 'ARNS')

const placeholderText = computed(() => {
  if (searchMode.value === 'ARNS') {
    return 'Search the Permaweb...'
  }
  
  // For all non-ARNS modes
  const hasChips = searchSyntax.searchChips.value.length > 0
  
  switch (searchMode.value) {
    case 'Transactions':
      return hasChips 
        ? 'Add more filters...' 
        : 'Try: tag:Content-Type=audio/* or tag:Type=music tag:Type=audio'
    case 'Images':
      return hasChips 
        ? 'Add more filters...' 
        : 'Try: tag:Content-Type=image/* or tag:Type=image'
    case 'Audio':
      return hasChips 
        ? 'Add more filters...' 
        : 'Try: tag:Content-Type=audio/* or tag:Type=audio'
    case 'Video':
      return hasChips 
        ? 'Add more filters...' 
        : 'Try: tag:Content-Type=video/* or tag:Type=video'
    default:
      return hasChips ? 'Add more filters...' : 'Enter search criteria...'
  }
})

const onSearchModeChange = (mode: 'ARNS' | 'Transactions' | 'Images' | 'Audio' | 'Video') => {
  // Clear chips when switching away from chip-based mode
  if (showChips.value && mode === 'ARNS') {
    searchSyntax.clearAllChips()
  }
  searchMode.value = mode
  emit('modeChanged', mode)
}

const handleInput = () => {
  // Don't auto-parse in handleInput - let user finish typing
  // Parsing will happen on space or enter
}

const handleSpace = (event: KeyboardEvent) => {
  // Check if the current input looks like a complete search term (only for chip-based modes)
  if (showChips.value && searchQuery.value.trim()) {
    const query = searchQuery.value.trim()
    // Only create chip if it looks like a complete term (has : and =, or is a simple tag)
    if ((query.includes(':') && query.includes('=')) || (!query.includes(' ') && query.includes(':'))) {
      event.preventDefault()
      searchSyntax.setChipsFromQuery(query)
      searchQuery.value = '' // Clear input after parsing
    }
  }
}

const handleBackspace = (event: KeyboardEvent) => {
  // Remove last chip if cursor is at the beginning of input (only for chip-based modes)
  if (showChips.value && searchSyntax.searchChips.value.length > 0) {
    const input = event.target as HTMLInputElement
    // Check if cursor is at the very beginning (position 0) and there's no selected text
    if (input.selectionStart === 0 && input.selectionEnd === 0) {
      event.preventDefault()
      const lastChip = searchSyntax.searchChips.value[searchSyntax.searchChips.value.length - 1]
      searchSyntax.removeChip(lastChip.id)
    }
  }
}

const handleEnter = () => {
  // Don't clear input here, let onSearchClicked handle everything
  onSearchClicked()
}

const onSearchClicked = () => {
  if (searchMode.value === 'ARNS') {
    if (!searchQuery.value.trim()) {
      console.warn('Search query is empty')
      return
    }
    
    // Emit the search event (always, for both standalone and navigation modes)
    emit('search', 'ARNS', searchQuery.value)
    
    // If not standalone, handle navigation
    if (!props.standalone) {
      router.push({
        path:
          props.searchType === 'on-chain'
            ? `/nest/${config.primaryNestId}/search`
            : '/search',
        query: { q: searchQuery.value }
      })
    }
  } else {
    // Handle chip-based search modes (Transactions, Images, Audio, Video)
    let queryToSend = ''
    
    // If there's text in the input, we need to separate structured terms from loose text
    if (searchQuery.value.trim()) {
      const parts = searchQuery.value.split(' ')
      const structuredParts: string[] = []
      const looseParts: string[] = []
      
      // Separate structured queries (with :) from loose text
      parts.forEach(part => {
        if (part.includes(':') && part.includes('=')) {
          // This is a structured query like tag:Name=Value
          structuredParts.push(part)
        } else if (part.includes(':') && !part.includes('=')) {
          // This is a structured query like owner:address or first:10
          structuredParts.push(part)
        } else if (part.trim()) {
          // This is loose text
          looseParts.push(part)
        }
      })
      
      // Parse structured parts into chips
      if (structuredParts.length > 0) {
        searchSyntax.setChipsFromQuery(structuredParts.join(' '))
      }
      
      // Build query to send (chips + loose text)
      const reconstructedFromChips = searchSyntax.reconstructQueryFromChips(searchSyntax.searchChips.value)
      const looseText = looseParts.join(' ')
      
      // Combine structured and loose parts
      if (reconstructedFromChips && looseText) {
        queryToSend = `${reconstructedFromChips} ${looseText}`
      } else if (reconstructedFromChips) {
        queryToSend = reconstructedFromChips
      } else if (looseText) {
        queryToSend = looseText
      }
    } else {
      // No text in input, just use chips
      queryToSend = searchSyntax.reconstructQueryFromChips(searchSyntax.searchChips.value)
    }
    
    // Check if we have any query to search with
    if (!queryToSend.trim()) {
      console.warn('No search criteria provided')
      return
    }
    
    console.log('SearchInput: Processing search with query:', queryToSend)
    
    // In standalone mode, emit with parsed options
    if (props.standalone) {
      // Emit with both query string and parsed options
      emit('search', searchMode.value, queryToSend, searchSyntax.parsedOptions.value)
      return
    }
    
    // If not standalone, handle navigation based on mode
    const routePaths: Record<string, string> = {
      'Transactions': '/transaction-search',
      'Images': '/image-search',
      'Audio': '/audio-search',
      'Video': '/video-search'
    }
    
    const targetPath = routePaths[searchMode.value] || '/transaction-search'
    
    console.log('SearchInput: Navigating to', targetPath, 'with query:', queryToSend)
    
    router.push({
      path: targetPath,
      query: { q: queryToSend }
    })
    
    // Also emit the event for any parent component that wants to listen
    emit('search', searchMode.value, queryToSend, searchSyntax.parsedOptions.value)
  }
}

// Expose methods for external control
defineExpose({
  setQuery: (query: string) => {
    searchQuery.value = query
    // Parse the query into chips so internal state matches
    searchSyntax.setChipsFromQuery(query)
  },
  setMode: (mode: 'ARNS' | 'Transactions' | 'Images' | 'Audio' | 'Video') => {
    searchMode.value = mode
  },
  clearChips: () => {
    searchSyntax.clearAllChips()
  },
  getChips: () => searchSyntax.searchChips.value,
  getParsedOptions: () => searchSyntax.parsedOptions.value
})

// Parse initial query into chips on mount (for chip-based modes)
onMounted(() => {
  if (props.initialQuery && showChips.value) {
    // Parse the initial query to separate structured parts from loose text
    const parts = props.initialQuery.split(' ')
    const structuredParts: string[] = []
    const looseParts: string[] = []
    
    parts.forEach(part => {
      if (part.includes(':')) {
        structuredParts.push(part)
      } else if (part.trim()) {
        looseParts.push(part)
      }
    })
    
    // Create chips from structured parts
    if (structuredParts.length > 0) {
      searchSyntax.setChipsFromQuery(structuredParts.join(' '))
    }
    
    // Set loose text in the input field
    searchQuery.value = looseParts.join(' ')
  }
})
</script>