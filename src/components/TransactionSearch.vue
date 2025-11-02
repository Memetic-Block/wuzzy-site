<template>
  <div class="max-w-7xl mx-auto p-4 w-full overflow-hidden">
    <!-- Search Input Component -->
    <div class="mb-4">
      <SearchInput
        :initial-query="props.initialQuery"
        initial-mode="Transactions"
        :standalone="true"
        :show-mode-switch="true"
        @search="handleSearch"
      />
    </div>

    <!-- Help button and Debug button -->
    <div class="flex gap-2 mb-4">
      <button
        @click="showHelp = !showHelp"
        class="bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md text-gray-500 dark:text-gray-400 cursor-pointer font-semibold px-3 py-2 transition-all hover:bg-gray-200 dark:hover:bg-gray-600 hover:text-gray-700 dark:hover:text-gray-300 min-w-10 flex items-center justify-center"
        title="Show search help"
      >
        ?
      </button>
      
      <!-- Debug Query Button (only show when there's a query) -->
      <button
        v-if="searchChips.length > 0 || (parsedOptions && Object.keys(parsedOptions).length > 0)"
        @click="showParsedQuery = !showParsedQuery"
        class="bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md text-gray-500 dark:text-gray-400 cursor-pointer text-xs px-3 py-2 transition-all hover:bg-gray-200 dark:hover:bg-gray-600 hover:text-gray-700 dark:hover:text-gray-300 flex items-center gap-1"
        :class="{ 'bg-gray-200 dark:bg-gray-600': showParsedQuery }"
        title="Show parsed query (debug)"
      >
        <span class="transition-transform" :class="{ 'rotate-90': showParsedQuery }">▶</span>
        <span>Debug</span>
      </button>
    </div>
    
    <!-- Parsed Query Display (moved here, below buttons) -->
    <div v-if="showParsedQuery && parsedOptions && Object.keys(parsedOptions).length > 0" class="mb-4 p-4 bg-slate-100 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg animate-in slide-in-from-top-2 duration-200">
      <h4 class="m-0 mb-2 text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide">Parsed Query Options</h4>
      <pre class="m-0 text-xs font-mono whitespace-pre-wrap text-gray-800 dark:text-gray-200 overflow-x-auto">{{ JSON.stringify(parsedOptions, null, 2) }}</pre>
    </div>

    <!-- Help Section -->
    <div v-if="showHelp" class="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-4 mb-4">
      <h3 class="m-0 mb-3 text-slate-800 dark:text-slate-200 text-base">🎯 Smart Transaction Search Syntax</h3>
      
      <div class="flex flex-col gap-3">
        <div class="flex flex-col gap-1">
          <strong class="text-gray-700 dark:text-gray-300 text-sm">🌟 Wildcard (*):</strong>
          <code class="bg-slate-800 dark:bg-slate-900 text-slate-200 dark:text-slate-300 px-2 py-1 rounded font-mono text-xs w-fit">tag:Content-Type=application/*</code>
          <span class="text-slate-600 dark:text-slate-400 text-sm">Find all application content types</span>
        </div>
        <div class="flex flex-col gap-1">
          <strong class="text-gray-700 dark:text-gray-300 text-sm">🎯 Exact Match (""):</strong>
          <code class="bg-slate-800 dark:bg-slate-900 text-slate-200 dark:text-slate-300 px-2 py-1 rounded font-mono text-xs w-fit">tag:App-Name="Art By City"</code>
          <span class="text-slate-600 dark:text-slate-400 text-sm">Find exact app name matches</span>
        </div>
        <div class="flex flex-col gap-1">
          <strong class="text-gray-700 dark:text-gray-300 text-sm">🔀 Fuzzy OR (,):</strong>
          <code class="bg-slate-800 dark:bg-slate-900 text-slate-200 dark:text-slate-300 px-2 py-1 rounded font-mono text-xs w-fit">tag:Type=music,audio</code>
          <span class="text-slate-600 dark:text-slate-400 text-sm">Find music OR audio content</span>
        </div>
        <div class="flex flex-col gap-1">
          <strong class="text-gray-700 dark:text-gray-300 text-sm">🤝 Fuzzy AND (separate):</strong>
          <code class="bg-slate-800 dark:bg-slate-900 text-slate-200 dark:text-slate-300 px-2 py-1 rounded font-mono text-xs w-fit">tag:Type=data tag:Type=json</code>
          <span class="text-slate-600 dark:text-slate-400 text-sm">Find data AND json content</span>
        </div>
        <div class="flex flex-col gap-1">
          <strong class="text-gray-700 dark:text-gray-300 text-sm">🎯 Value-only:</strong>
          <code class="bg-slate-800 dark:bg-slate-900 text-slate-200 dark:text-slate-300 px-2 py-1 rounded font-mono text-xs w-fit">tag:=MirrorXYZ</code>
          <span class="text-slate-600 dark:text-slate-400 text-sm">Search across all tag values without specifying names</span>
        </div>
        <div class="flex flex-col gap-1">
          <strong class="text-gray-700 dark:text-gray-300 text-sm">🔧 Advanced Examples:</strong>
          <div class="flex flex-col gap-1 ml-2">
            <code class="bg-slate-800 dark:bg-slate-900 text-slate-200 dark:text-slate-300 px-2 py-1 rounded font-mono text-xs w-fit cursor-pointer hover:bg-slate-700 dark:hover:bg-slate-800" @click="setSearchQuery('tag:Content-Type=audio/* tag:Artist=*Beatles*')">tag:Content-Type=audio/* tag:Artist=*Beatles*</code>
            <code class="bg-slate-800 dark:bg-slate-900 text-slate-200 dark:text-slate-300 px-2 py-1 rounded font-mono text-xs w-fit cursor-pointer hover:bg-slate-700 dark:hover:bg-slate-800" @click="setSearchQuery('tag:Genre=jazz,blues tag:Year=196*')">tag:Genre=jazz,blues tag:Year=196*</code>
            <code class="bg-slate-800 dark:bg-slate-900 text-slate-200 dark:text-slate-300 px-2 py-1 rounded font-mono text-xs w-fit cursor-pointer hover:bg-slate-700 dark:hover:bg-slate-800" @click="setSearchQuery('tag:Title=&quot;Dark Side of the Moon&quot; first:10')">tag:Title="Dark Side of the Moon" first:10</code>
          </div>
          <span class="text-slate-600 dark:text-slate-400 text-sm">Click examples to try them out</span>
        </div>
      </div>
    </div>

    <!-- Query Hints -->
    <div class="mb-4 p-4 bg-slate-50 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700">
      <div>
        <h4 class="m-0 mb-2 font-semibold text-gray-700 dark:text-gray-300">Query Format Examples:</h4>
        <div class="flex flex-col sm:flex-row flex-wrap gap-2">
          <!-- <code class="cursor-pointer px-2 py-1 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded text-sm font-mono hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors" @click="setSearchQuery('owner:your-wallet-address')">owner:your-wallet-address</code> -->
          <code class="cursor-pointer px-2 py-1 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded text-sm font-mono hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors" @click="setSearchQuery('tag:Content-Type=application/json')">tag:Content-Type=application/json</code>
          <code class="cursor-pointer px-2 py-1 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded text-sm font-mono hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors" @click="setSearchQuery('tag:Content-Type=image/png')">tag:Content-Type=image/png</code>
          <code class="cursor-pointer px-2 py-1 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded text-sm font-mono hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors" @click="setSearchQuery('tag:App-Name=ArtByCity')">tag:App-Name=ArtByCity</code>
          <!-- <code class="cursor-pointer px-2 py-1 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded text-sm font-mono hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors" @click="setSearchQuery('first:20')">first:20</code> -->
          <!-- <code class="cursor-pointer px-2 py-1 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded text-sm font-mono hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors" @click="setSearchQuery('recipient:target-address')">recipient:target-address</code> -->
          <code class="cursor-pointer px-2 py-1 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded text-sm font-mono hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors" @click="setSearchQuery('block:1000000-1100000')">block:1000000-1100000</code>
        </div>
      </div>
    </div>

    <!-- Error Display -->
    <div v-if="error" class="mb-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-700 dark:text-red-400">
      <strong>Error:</strong> {{ error }}
    </div>

    <!-- Results Display -->
    <div v-if="results">
      <h3 class="mb-4 text-xl font-semibold text-gray-900 dark:text-gray-100">Search Results ({{ results.edges.length }}{{ results.pageInfo.hasNextPage ? '+' : '' }} transactions)</h3>

      <div class="flex flex-col gap-4 mb-8 w-full">
        <div
          v-for="edge in results.edges"
          :key="edge.node.id"
          class="p-4 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 w-full overflow-hidden"
        >
          <div class="flex flex-col gap-2 mb-3 pb-2 border-b border-slate-100 dark:border-slate-700">
            <div class="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
              <h4 class="m-0 text-sm font-mono text-blue-500 dark:text-blue-400 break-all overflow-hidden">{{ edge.node.id }}</h4>
              <span class="text-xs text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded flex-shrink-0 w-fit">{{ edge.node.data.size }} bytes</span>
            </div>
          </div>

          <div class="flex flex-col gap-2 w-full min-w-0">
            <div class="flex flex-col gap-1 text-sm">
              <strong class="text-gray-900 dark:text-gray-100">Owner:</strong>
              <code class="font-mono bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 px-2 py-1 rounded text-xs break-all overflow-hidden w-full block">{{ edge.node.owner.address }}</code>
            </div>

            <div v-if="edge.node.recipient" class="flex flex-col gap-1 text-sm">
              <strong class="text-gray-900 dark:text-gray-100">Recipient:</strong>
              <code class="font-mono bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 px-2 py-1 rounded text-xs break-all overflow-hidden w-full block">{{ edge.node.recipient }}</code>
            </div>

            <div v-if="edge.node.block" class="flex flex-col gap-1 text-sm">
              <div class="flex items-center gap-2 flex-wrap">
                <strong class="text-gray-900 dark:text-gray-100">Block:</strong>
                <span class="text-gray-900 dark:text-gray-100">{{ edge.node.block.height }}</span>
              </div>
              <span class="text-xs text-gray-500 dark:text-gray-400">({{ formatTimestamp(edge.node.block.timestamp) }})</span>
            </div>

            <div v-if="edge.node.tags.length > 0" class="mt-2 w-full min-w-0">
              <strong class="text-sm text-gray-900 dark:text-gray-100">Tags:</strong>
              <div class="flex flex-wrap gap-1 mt-1 w-full">
                <span
                  v-for="tag in edge.node.tags"
                  :key="`${tag.name}-${tag.value}`"
                  class="text-xs px-1.5 py-0.5 rounded font-mono cursor-pointer transition-all border border-transparent break-all max-w-full overflow-hidden"
                  :class="isTagMatching(tag) ?
                    'bg-emerald-500 text-white border-emerald-600 font-semibold shadow-sm animate-pulse hover:bg-emerald-600 hover:-translate-y-0.5 hover:shadow-md' :
                    'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200 hover:bg-blue-500 dark:hover:bg-blue-600 hover:text-white hover:-translate-y-0.5 hover:shadow-sm border-blue-200 dark:border-blue-700'"
                  @click="searchByTag(tag)"
                  :title="isTagMatching(tag) ?
                    'This tag matches your search! Click to search for tags:' + tag.name + '=' + tag.value :
                    'Click to search for tags:' + tag.name + '=' + tag.value"
                >
                  <span v-if="isTagMatching(tag)" class="text-xs mr-1 opacity-90">✓</span>
                  {{ tag.name }}: {{ tag.value }}
                </span>
              </div>
            </div>
          </div>


        </div>
      </div>

      <!-- Pagination -->
      <div v-if="results.pageInfo.hasNextPage" class="text-center">
        <button
          @click="loadMore"
          :disabled="loading"
          class="px-6 py-3 bg-gray-500 text-white border-none rounded-lg font-semibold cursor-pointer transition-colors hover:bg-gray-600 disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          {{ loading ? 'Loading...' : 'Load More' }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useGraphQL, type TransactionConnection } from '../composables/gql'
import { useSearchSyntax } from '../composables/search-syntax'
import SearchInput from './SearchInput.vue'

// Define props
interface Props {
  initialQuery?: string
}

const props = withDefaults(defineProps<Props>(), {
  initialQuery: ''
})

const { getTransactions } = useGraphQL()
const searchSyntax = useSearchSyntax()

// Destructure what we need from search syntax
const {
  searchChips,
  parsedOptions,
  hasValidQuery
} = searchSyntax

// Define emits for parent component communication
const emit = defineEmits<{
  searchExecuted: [query: string]
  chipsChanged: [chips: Array<{id: string, type: string, label: string, value: any}>]
}>()

// Component-specific reactive state
const results = ref<TransactionConnection | null>(null)
const loading = ref(false)
const error = ref<string | null>(null)
const showHelp = ref(false)
const lastCursor = ref<string | undefined>(undefined)
const showParsedQuery = ref(false)
const currentLooseText = ref('')
const currentQuery = ref('')

// Handle search from SearchInput component
function handleSearch(mode: string, query: string, options?: any) {
  console.log('TransactionSearch handleSearch:', { mode, query, options })
  
  // Parse the query to separate structured from loose text
  const parts = query.split(' ')
  const looseParts: string[] = []
  
  parts.forEach(part => {
    if (!part.includes(':') && part.trim()) {
      looseParts.push(part)
    }
  })
  
  // Store loose text for adding to GraphQL query
  currentLooseText.value = looseParts.join(' ')
  
  // Store the full query for URL updates
  currentQuery.value = query
  
  // Execute search with the provided options
  executeSearch()
  
  // Emit for URL updates with the full query string
  emit('searchExecuted', query)
  emitChipsChanged()
}

// Execute the search
async function executeSearch() {
  console.log('executeSearch called, hasValidQuery:', hasValidQuery.value)
  console.log('executeSearch parsedOptions:', parsedOptions.value)
  console.log('executeSearch searchChips:', searchChips.value)
  console.log('executeSearch loose text:', currentLooseText.value)
  
  // Check if we have either chips or loose text to search
  const hasLooseText = currentLooseText.value.trim().length > 0
  if (!hasValidQuery.value && !hasLooseText) {
    console.warn('executeSearch aborted: no valid query or loose text')
    return
  }

  loading.value = true
  error.value = null
  lastCursor.value = undefined

  try {
    // Build query options, adding loose text as value-only tag if present
    let queryOptions = { ...parsedOptions.value }
    
    if (hasLooseText) {
      console.log('executeSearch adding loose text as value-only tag:', currentLooseText.value)
      // Add loose text as value-only tag (searches across all tag values)
      const looseTextTag = {
        values: [currentLooseText.value],
        match: 'FUZZY_AND' as const
      }
      
      queryOptions = {
        ...queryOptions,
        tags: [...(queryOptions.tags || []), looseTextTag]
      }
    }
    
    console.log('executeSearch calling getTransactions with:', queryOptions)
    results.value = await getTransactions(queryOptions)

    // Store cursor for pagination
    if (results.value.edges.length > 0) {
      lastCursor.value = results.value.edges[results.value.edges.length - 1].cursor
    }

    // Emit search executed event with stored full query
    // (Use currentQuery if available, otherwise reconstruct from chips)
    const queryString = currentQuery.value || reconstructQueryFromChips()
    emit('searchExecuted', queryString)

  } catch (err) {
    error.value = err instanceof Error ? err.message : String(err)
    results.value = null
  } finally {
    loading.value = false
  }
}

// Function to reconstruct query string from chips for URL updating
function reconstructQueryFromChips(): string {
  return searchSyntax.reconstructQueryFromChips(searchChips.value)
}

// Function to emit chips changed event
function emitChipsChanged() {
  emit('chipsChanged', [...searchChips.value])
}

// Load more results (pagination)
async function loadMore() {
  if (!hasValidQuery.value || !lastCursor.value || !results.value) return

  loading.value = true
  error.value = null

  try {
    const moreResults = await getTransactions({
      ...parsedOptions.value,
      after: lastCursor.value
    })

    // Append new results
    results.value.edges.push(...moreResults.edges)
    results.value.pageInfo = moreResults.pageInfo

    // Update cursor
    if (moreResults.edges.length > 0) {
      lastCursor.value = moreResults.edges[moreResults.edges.length - 1].cursor
    }
  } catch (err) {
    error.value = err instanceof Error ? err.message : String(err)
  } finally {
    loading.value = false
  }
}

// Format timestamp for display
function formatTimestamp(timestamp: number): string {
  return new Date(timestamp * 1000).toLocaleString()
}



// Helper function to check if a tag matches current search criteria
function isTagMatching(tag: { name: string; value: string }): boolean {
  if (!parsedOptions.value.tags || parsedOptions.value.tags.length === 0) {
    return false
  }

  return parsedOptions.value.tags.some(searchTag => {
    // Check if tag name matches (handle Goldsky optional name)
    if (searchTag.name && searchTag.name.toLowerCase() !== tag.name.toLowerCase()) {
      return false
    }

    // Check if tag value matches any of the search values (handle Goldsky optional values)
    return searchTag.values?.some(searchValue => {
      // Handle wildcard matches (when searching for tag existence only)
      if (searchValue === '*') {
        return true
      }
      // Case-insensitive exact match
      return tag.value.toLowerCase() === searchValue.toLowerCase()
    })
  })
}

// Function to search by clicking a tag
function searchByTag(tag: { name: string; value: string }) {
  const chipId = `tags-${tag.name}-${tag.value}-${Date.now()}`

  // Check if this tag chip already exists
  const existingChip = searchChips.value.find(chip =>
    chip.type === 'tags' &&
    chip.value.name === tag.name &&
    chip.value.value === tag.value
  )

  if (!existingChip) {
    searchChips.value.push({
      id: chipId,
      type: 'tags',
      label: `${tag.name}: ${tag.value}`,
      value: { name: tag.name, value: tag.value }
    })
    searchSyntax.updateParsedOptions()
    emitChipsChanged()
    executeSearch()
  }
}

// Function to set search query externally (used by clickable examples)
function setSearchQuery(query: string) {
  if (!query.trim()) return
  
  console.log('TransactionSearch setSearchQuery called with:', query)
  
  // Use handleSearch to process the query
  handleSearch('Transactions', query)
}

// Expose methods for parent components
defineExpose({
  setSearchQuery,
  executeSearch
})

// Initialize from props on mount
onMounted(() => {
  if (props.initialQuery && props.initialQuery.trim()) {
    console.log('TransactionSearch: Initializing with query:', props.initialQuery)
    handleSearch('Transactions', props.initialQuery)
  }
})
</script>
