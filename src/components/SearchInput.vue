<template>
  <div
    class="bg-primary-foreground mt-3 mb-4 py-1 px-2 rounded-md flex gap-2 items-center border-input border focus-within:shadow-xs focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]"
  >
    <!-- Mode switcher dropdown (custom, no portal) -->
    <div class="relative">
      <button
        @click="dropdownOpen = !dropdownOpen"
        @blur="onDropdownBlur"
        class="flex items-center gap-1 px-2 py-1 text-sm bg-muted hover:bg-muted/80 rounded border border-input transition-colors cursor-pointer whitespace-nowrap"
      >
        {{ searchModeDisplay }}
        <svg
          class="h-4 w-4"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>

      <!-- Custom dropdown menu -->
      <div
        v-if="dropdownOpen"
        class="absolute top-full left-0 mt-1 min-w-[120px] bg-popover text-popover-foreground rounded-md border border-border shadow-md z-50 py-1"
      >
        <div
          @mousedown.prevent="onSearchModeChange('ARNS')"
          class="px-2 py-1.5 text-sm cursor-pointer hover:bg-accent hover:text-accent-foreground rounded-sm mx-1 whitespace-nowrap"
        >
          ARNS
        </div>
        <div
          @mousedown.prevent="onSearchModeChange('Images')"
          class="px-2 py-1.5 text-sm cursor-pointer hover:bg-accent hover:text-accent-foreground rounded-sm mx-1 whitespace-nowrap"
        >
          Images
        </div>
        <div
          @mousedown.prevent="onSearchModeChange('Video')"
          class="px-2 py-1.5 text-sm cursor-pointer hover:bg-accent hover:text-accent-foreground rounded-sm mx-1 whitespace-nowrap"
        >
          Videos
        </div>
        <div
          @mousedown.prevent="onSearchModeChange('Audio')"
          class="px-2 py-1.5 text-sm cursor-pointer hover:bg-accent hover:text-accent-foreground rounded-sm mx-1 whitespace-nowrap"
        >
          Audio
        </div>
        <div
          @mousedown.prevent="onSearchModeChange('Hyperbeam')"
          class="px-2 py-1.5 text-sm cursor-pointer hover:bg-accent hover:text-accent-foreground rounded-sm mx-1 whitespace-nowrap"
        >
          HyperBEAM (Demo)
        </div>
      </div>
    </div>

    <Input
      class="shadow-none focus-visible:ring-[0px] ml-2 border-0 p-0 dark:bg-transparent rounded-none"
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

interface Props {
  initialQuery?: string
  initialMode?:
    | 'ARNS'
    | 'Hyperbeam'
    | 'Transactions'
    | 'Images'
    | 'Audio'
    | 'Video'
  buttonText?: string // Custom button text (default is "->")
}

const props = withDefaults(defineProps<Props>(), {
  initialQuery: '',
  initialMode: 'ARNS',
  buttonText: '->'
})

const emit = defineEmits<{
  modeChanged: [
    mode: 'ARNS' | 'Hyperbeam' | 'Transactions' | 'Images' | 'Audio' | 'Video'
  ]
}>()

const router = useRouter()
const searchQuery = ref(props.initialQuery)
const searchMode = ref<
  'ARNS' | 'Hyperbeam' | 'Transactions' | 'Images' | 'Audio' | 'Video'
>(props.initialMode)
const dropdownOpen = ref(false)

const searchModeDisplay = computed(() => {
  if (searchMode.value === 'Hyperbeam') {
    return 'HyperBEAM (Demo)'
  }
  if (searchMode.value === 'Video') {
    return 'Videos'
  }
  return searchMode.value
})

const placeholderText = computed(() => {
  switch (searchMode.value) {
    case 'Images':
      return 'Search the Permaweb for images...'
    case 'Video':
      return 'Search the Permaweb for videos...'
    case 'Audio':
      return 'Search the Permaweb for audio...'
    default:
      return 'Search the Permaweb...'
  }
})

const onDropdownBlur = () => {
  // Close dropdown when focus leaves the button
  setTimeout(() => {
    dropdownOpen.value = false
  }, 150) // Small delay to allow click events to fire
}

const onSearchModeChange = (
  mode: 'ARNS' | 'Hyperbeam' | 'Transactions' | 'Images' | 'Audio' | 'Video'
) => {
  searchMode.value = mode
  dropdownOpen.value = false
  emit('modeChanged', mode)

  if (searchQuery.value.trim()) {
    navigateToSearch(mode, searchQuery.value.trim(), true)
  }
}

// Helper function to navigate to search with mode-specific paths and query preservation
function navigateToSearch(
  mode: 'ARNS' | 'Hyperbeam' | 'Transactions' | 'Images' | 'Audio' | 'Video',
  query: string,
  preserveFormat = false
) {
  const currentQuery = router.currentRoute.value.query
  const currentPath = router.currentRoute.value.path

  switch (mode) {
    case 'ARNS':
      router.push({
        path: '/search',
        query: { q: query }
      })
      break

    case 'Hyperbeam':
      router.push({
        path: `/nest/${config.primaryNestId}/search`,
        query: { q: query }
      })
      break

    case 'Images': {
      const isOnImages = currentPath === '/images'
      router.push({
        path: '/images',
        query: {
          q: query,
          ...(preserveFormat && isOnImages && currentQuery.format
            ? { format: currentQuery.format }
            : {})
        }
      })
      break
    }

    case 'Video': {
      const isOnVideos = currentPath === '/videos'
      router.push({
        path: '/videos',
        query: {
          q: query,
          ...(preserveFormat && isOnVideos && currentQuery.format
            ? { format: currentQuery.format }
            : {})
        }
      })
      break
    }

    case 'Audio': {
      const isOnAudio = currentPath === '/audio'
      router.push({
        path: '/audio',
        query: {
          q: query,
          ...(preserveFormat && isOnAudio && currentQuery.format
            ? { format: currentQuery.format }
            : {})
        }
      })
      break
    }
  }
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

  navigateToSearch(searchMode.value, trimmedQuery, true)
}

// Expose methods for external control
defineExpose({
  setQuery: (query: string) => {
    searchQuery.value = query
  },
  setMode: (
    mode: 'ARNS' | 'Hyperbeam' | 'Transactions' | 'Images' | 'Audio' | 'Video'
  ) => {
    searchMode.value = mode
  }
})
</script>
