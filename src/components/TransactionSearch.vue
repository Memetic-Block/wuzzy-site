<template>
  <div class="transaction-search">
    <div class="search-input-container">
      <input
        v-model="searchQuery"
        @input="handleInput"
        @keydown.enter="handleEnter"
        @keydown.space="handleSpace"
        placeholder="Type search terms like 'owner:address' or 'tags:Content-Type=json' and press space or enter"
        class="search-input"
      />
      <button 
        @click="executeSearch"
        :disabled="loading || !hasValidQuery"
        class="search-button"
      >
        {{ loading ? 'Searching...' : 'Search' }}
      </button>
    </div>

    <!-- Search Chips -->
    <div v-if="searchChips.length > 0" class="search-chips-container">
      <div class="search-chips">
        <div
          v-for="chip in searchChips"
          :key="chip.id"
          class="search-chip"
        >
          <span class="chip-label">{{ chip.label }}</span>
          <button 
            @click="removeChip(chip.id)"
            class="chip-remove"
            title="Remove filter"
          >
            ×
          </button>
        </div>
      </div>
      <button 
        @click="clearAllChips"
        class="clear-all-chips"
        title="Clear all filters"
      >
        Clear All
      </button>
    </div>

    <!-- Query Hints -->
    <div class="query-hints">
      <div class="hint-section">
        <h4>Query Format Examples:</h4>
        <div class="examples">
          <!-- <code class="cursor-pointer" @click="setSearchQuery('owner:your-wallet-address')">owner:your-wallet-address</code> -->
          <code class="cursor-pointer" @click="setSearchQuery('tags:Content-Type=application/json')">tags:Content-Type=application/json</code>
          <code class="cursor-pointer" @click="setSearchQuery('tags:Content-Type=image/png')">tags:Content-Type=image/png</code>
          <code class="cursor-pointer" @click="setSearchQuery('tags:App-Name=ArtByCity')">tags:App-Name=ArtByCity</code>
          <!-- <code class="cursor-pointer" @click="setSearchQuery('first:20')">first:20</code> -->
          <!-- <code class="cursor-pointer" @click="setSearchQuery('recipient:target-address')">recipient:target-address</code> -->
          <code class="cursor-pointer" @click="setSearchQuery('block:1000000-1100000')">block:1000000-1100000</code>
        </div>
      </div>
    </div>

    <!-- Parsed Query Display -->
    <div v-if="parsedOptions && Object.keys(parsedOptions).length > 0" class="parsed-query-container">
      <button 
        @click="showParsedQuery = !showParsedQuery"
        class="parsed-query-toggle"
        :class="{ 'expanded': showParsedQuery }"
      >
        <span class="toggle-icon">{{ showParsedQuery ? '▼' : '▶' }}</span>
        <span>Show Parsed Query (Debug)</span>
      </button>
      
      <div v-if="showParsedQuery" class="parsed-query">
        <pre>{{ JSON.stringify(parsedOptions, null, 2) }}</pre>
      </div>
    </div>

    <!-- Error Display -->
    <div v-if="error" class="error-message">
      <strong>Error:</strong> {{ error }}
    </div>

    <!-- Results Display -->
    <div v-if="results" class="results-section">
      <h3>Search Results ({{ results.edges.filter(edge => shouldShowTransaction(edge.node)).length }} transactions{{ failedImages.size > 0 ? `, ${failedImages.size} images hidden due to loading errors` : '' }})</h3>
      
      <div class="results-grid">
        <div 
          v-for="edge in results.edges.filter(edge => shouldShowTransaction(edge.node))" 
          :key="edge.node.id"
          class="transaction-card"
        >
          <div class="transaction-header">
            <h4 class="transaction-id">{{ edge.node.id }}</h4>
            <span class="transaction-size">{{ edge.node.data.size }} bytes</span>
          </div>
          
          <div class="transaction-details">
            <div class="detail-row">
              <strong>Owner:</strong> 
              <code class="address">{{ edge.node.owner.address }}</code>
            </div>
            
            <div v-if="edge.node.recipient" class="detail-row">
              <strong>Recipient:</strong>
              <code class="address">{{ edge.node.recipient }}</code>
            </div>
            
            <div v-if="edge.node.block" class="detail-row">
              <strong>Block:</strong> {{ edge.node.block.height }}
              <span class="timestamp">({{ formatTimestamp(edge.node.block.timestamp) }})</span>
            </div>
            
            <div v-if="edge.node.tags.length > 0" class="tags-section">
              <strong>Tags:</strong>
              <div class="tags-list">
                <span 
                  v-for="tag in edge.node.tags" 
                  :key="`${tag.name}-${tag.value}`"
                  class="tag-item clickable-tag"
                  :class="{ 'tag-matched': isTagMatching(tag) }"
                  @click="searchByTag(tag)"
                  :title="isTagMatching(tag) ? 
                    'This tag matches your search! Click to search for tags:' + tag.name + '=' + tag.value :
                    'Click to search for tags:' + tag.name + '=' + tag.value"
                >
                  <span v-if="isTagMatching(tag)" class="match-indicator">✓</span>
                  {{ tag.name }}: {{ tag.value }}
                </span>
              </div>
            </div>
          </div>

          <!-- Image Preview for browser-compatible images -->
          <div v-if="isImageTransaction(edge.node)" class="image-preview-section">
            <div class="image-container">
              <img 
                :src="getImageUrl(edge.node.id)"
                :alt="`Transaction ${edge.node.id} image`"
                class="transaction-image"
                @error="handleImageError"
                @load="handleImageLoad"
              />
              <div class="image-overlay">
                <div class="image-info">
                  <span class="image-type">{{ getContentType(edge.node) }}</span>
                  <span class="image-size">{{ formatFileSize(parseInt(edge.node.data.size)) }}</span>
                  <span class="image-dimensions">{{ getImageDimensions(edge.node.id) }}</span>
                </div>
                <a 
                  :href="getImageUrl(edge.node.id)" 
                  target="_blank" 
                  class="view-full-button"
                  title="View full size"
                >
                  🔍 View Full
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Pagination -->
      <div v-if="results.pageInfo.hasNextPage" class="pagination">
        <button 
          @click="loadMore"
          :disabled="loading"
          class="load-more-button"
        >
          {{ loading ? 'Loading...' : 'Load More' }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, defineExpose, readonly } from 'vue'
import { useGraphQL, type TransactionQueryOptions, type TransactionConnection } from '../composables/gql'

const { getTransactions, createTagFilter, createRangeFilter } = useGraphQL()

// Reactive state
const searchQuery = ref('')
const parsedOptions = ref<TransactionQueryOptions>({})
const searchChips = ref<Array<{id: string, type: string, label: string, value: any}>>([])
const results = ref<TransactionConnection | null>(null)
const loading = ref(false)
const error = ref<string | null>(null)
const lastCursor = ref<string | undefined>(undefined)
const showParsedQuery = ref(false)
const failedImages = ref<Set<string>>(new Set())
const imageDimensions = ref<Map<string, {width: number, height: number}>>(new Map())

// Computed
const hasValidQuery = computed(() => {
  return searchChips.value.length > 0 || Object.keys(parsedOptions.value).length > 0
})

// Parse the search query into chips and TransactionQueryOptions
function parseQuery() {
  error.value = null
  
  if (!searchQuery.value.trim()) {
    searchChips.value = []
    parsedOptions.value = {}
    return
  }

  try {
    const options: TransactionQueryOptions = {}
    const chips: Array<{id: string, type: string, label: string, value: any}> = []
    
    // Handle quoted strings and space-separated terms more carefully
    const parts: string[] = []
    let current = ''
    let inQuotes = false
    let i = 0
    console.log('search query 1', searchQuery.value)
    while (i < searchQuery.value.length) {
      const char = searchQuery.value[i]
      
      if (char === '"') {
        inQuotes = !inQuotes
        current += char
      } else if (char === ' ' && !inQuotes) {
        if (current.trim()) {
          parts.push(current.trim())
          current = ''
        }
      } else {
        current += char
      }
      i++
    }
    
    if (current.trim()) {
      parts.push(current.trim())
    }
    
    // If no parts found, treat the entire input as a single search term
    if (parts.length === 0 && searchQuery.value.trim().includes(':')) {
      parts.push(searchQuery.value.trim())
    }
    console.log('search query', searchQuery.value, 'parts', parts)
    for (const part of parts) {
      const [key, ...valueParts] = part.split(':')
      const value = valueParts.join(':').replace(/"/g, '') // Remove quotes
      
      if (!key || !value) continue
      
      const chipId = `${key}-${value}-${Date.now()}-${Math.random()}`
      
      switch (key.toLowerCase()) {
        case 'owner':
        case 'owners':
          const owners = value.split(',').map(v => v.trim())
          options.owners = owners
          chips.push({
            id: chipId,
            type: 'owners',
            label: `Owner: ${owners.join(', ')}`,
            value: owners
          })
          break
          
        case 'recipient':
        case 'recipients':
          const recipients = value.split(',').map(v => v.trim())
          options.recipients = recipients
          chips.push({
            id: chipId,
            type: 'recipients',
            label: `Recipient: ${recipients.join(', ')}`,
            value: recipients
          })
          break
          
        case 'id':
        case 'ids':
          const ids = value.split(',').map(v => v.trim())
          options.ids = ids
          chips.push({
            id: chipId,
            type: 'ids',
            label: `ID: ${ids.join(', ')}`,
            value: ids
          })
          break
          
        case 'bundled':
        case 'bundledin':
          const bundledIn = value.split(',').map(v => v.trim())
          options.bundledIn = bundledIn
          chips.push({
            id: chipId,
            type: 'bundledIn',
            label: `Bundled In: ${bundledIn.join(', ')}`,
            value: bundledIn
          })
          break
          
        case 'first':
        case 'limit':
          const firstValue = parseInt(value)
          if (!isNaN(firstValue) && firstValue > 0) {
            options.first = Math.min(firstValue, 100) // Cap at 100
            chips.push({
              id: chipId,
              type: 'first',
              label: `Limit: ${options.first}`,
              value: options.first
            })
          }
          break
          
        case 'after':
        case 'cursor':
          options.after = value
          chips.push({
            id: chipId,
            type: 'after',
            label: `After: ${value.substring(0, 10)}...`,
            value: value
          })
          break
          
        case 'block':
        case 'height':
          console.log('Parsing block filter:', value)
          if (value.includes('-')) {
            const [min, max] = value.split('-').map(v => parseInt(v.trim()))
            if (!isNaN(min) || !isNaN(max)) {
              options.block = createRangeFilter(
                isNaN(min) ? undefined : min,
                isNaN(max) ? undefined : max
              )
              chips.push({
                id: chipId,
                type: 'block',
                label: `Block: ${min || '*'}-${max || '*'}`,
                value: { min, max }
              })
            } else {
              console.warn('block range parse error:', value)
            }
          } else {
            const blockHeight = parseInt(value)
            if (!isNaN(blockHeight)) {
              options.block = createRangeFilter(blockHeight)
              chips.push({
                id: chipId,
                type: 'block',
                label: `Block: ${blockHeight}`,
                value: blockHeight
              })
            } else {
              console.warn('block height parse error:', value)
            }
          }
          break
          
        case 'tag':
        case 'tags':
          if (!options.tags) options.tags = []
          
          if (value.includes('=')) {
            // Format: tags:Content-Type=application/json or tags:App-Name=Art By City
            // Use indexOf to find first = and split there to preserve spaces in tag values
            const equalIndex = value.indexOf('=')
            const tagName = value.substring(0, equalIndex)
            const tagValue = value.substring(equalIndex + 1)
            if (tagName && tagValue) {
              options.tags.push(createTagFilter(tagName.trim(), [tagValue.trim()]))
              chips.push({
                id: chipId,
                type: 'tags',
                label: `${tagName.trim()}: ${tagValue.trim()}`,
                value: { name: tagName.trim(), value: tagValue.trim() }
              })
            }
          } else {
            // Format: tags:Content-Type (just check for existence)
            options.tags.push(createTagFilter(value.trim(), ['*']))
            chips.push({
              id: chipId,
              type: 'tags',
              label: `Tag: ${value.trim()}`,
              value: { name: value.trim(), value: '*' }
            })
          }
          break
          
        case 'sort':
          if (value.toLowerCase() === 'asc' || value.toLowerCase() === 'height_asc') {
            options.sort = 'HEIGHT_ASC'
            chips.push({
              id: chipId,
              type: 'sort',
              label: 'Sort: Height ASC',
              value: 'HEIGHT_ASC'
            })
          } else if (value.toLowerCase() === 'desc' || value.toLowerCase() === 'height_desc') {
            options.sort = 'HEIGHT_DESC'
            chips.push({
              id: chipId,
              type: 'sort',
              label: 'Sort: Height DESC',
              value: 'HEIGHT_DESC'
            })
          }
          break
      }
    }
    
    // Only add chips if we have valid ones and update existing chips
    if (chips.length > 0) {
      // Replace existing chips with new ones (user might be editing)
      searchChips.value = chips
      parsedOptions.value = options
      
      // Clear the search input after creating chips
      searchQuery.value = ''
    }
    
  } catch (err) {
    error.value = `Failed to parse query: ${err instanceof Error ? err.message : String(err)}`
    searchChips.value = []
    parsedOptions.value = {}
  }
}

// Execute the search
async function executeSearch() {
  if (!hasValidQuery.value) return
  
  loading.value = true
  error.value = null
  lastCursor.value = undefined
  failedImages.value.clear() // Clear failed images for new search
  imageDimensions.value.clear() // Clear image dimensions for new search
  
  try {
    results.value = await getTransactions(parsedOptions.value)
    
    // Store cursor for pagination
    if (results.value.edges.length > 0) {
      lastCursor.value = results.value.edges[results.value.edges.length - 1].cursor
    }
  } catch (err) {
    error.value = err instanceof Error ? err.message : String(err)
    results.value = null
  } finally {
    loading.value = false
  }
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

// Helper function to check if transaction contains a browser-compatible image
function isImageTransaction(transaction: any): boolean {
  const contentType = getContentType(transaction)
  const supportedImageTypes = [
    'image/jpeg',
    'image/jpg', 
    'image/png',
    'image/gif',
    'image/webp',
    'image/svg+xml',
    'image/bmp'
  ]
  return supportedImageTypes.includes(contentType.toLowerCase())
}

// Helper function to get content type from transaction tags
function getContentType(transaction: any): string {
  const contentTypeTag = transaction.tags?.find((tag: any) => 
    tag.name.toLowerCase() === 'content-type'
  )
  return contentTypeTag?.value || ''
}

// Helper function to check if a tag matches current search criteria
function isTagMatching(tag: { name: string; value: string }): boolean {
  if (!parsedOptions.value.tags || parsedOptions.value.tags.length === 0) {
    return false
  }
  
  return parsedOptions.value.tags.some(searchTag => {
    // Check if tag name matches
    if (searchTag.name.toLowerCase() !== tag.name.toLowerCase()) {
      return false
    }
    
    // Check if tag value matches any of the search values
    return searchTag.values.some(searchValue => {
      // Handle wildcard matches (when searching for tag existence only)
      if (searchValue === '*') {
        return true
      }
      // Case-insensitive exact match
      return tag.value.toLowerCase() === searchValue.toLowerCase()
    })
  })
}

// Helper function to check if transaction should be displayed
function shouldShowTransaction(transaction: any): boolean {
  // If it's an image transaction, check if it failed to load
  if (isImageTransaction(transaction)) {
    return !failedImages.value.has(transaction.id)
  }
  // Always show non-image transactions
  return true
}

// Helper function to construct image URL for Arweave transaction
function getImageUrl(transactionId: string): string {
  // Use arweave.net as the gateway for images
  return `https://arweave.net/${transactionId}`
}

// Helper function to format file size
function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes'
  
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

// Helper function to get image dimensions
function getImageDimensions(transactionId: string): string {
  const dimensions = imageDimensions.value.get(transactionId)
  return dimensions ? `${dimensions.width}×${dimensions.height}` : 'Loading...'
}

// Handle image loading error
function handleImageError(event: Event) {
  const img = event.target as HTMLImageElement
  // Extract transaction ID from the image src
  const transactionId = img.src.split('/').pop()
  if (transactionId) {
    failedImages.value.add(transactionId)
  }
  img.style.display = 'none'
  console.warn('Failed to load image:', img.src, 'Transaction ID:', transactionId)
}

// Handle successful image load
function handleImageLoad(event: Event) {
  const img = event.target as HTMLImageElement
  // Extract transaction ID from the image src
  const transactionId = img.src.split('/').pop()
  if (transactionId) {
    imageDimensions.value.set(transactionId, {
      width: img.naturalWidth,
      height: img.naturalHeight
    })
  }
  console.log('Image loaded successfully:', img.src, `${img.naturalWidth}x${img.naturalHeight}`)
}

// Input handlers
function handleInput() {
  // Don't auto-convert on input, just let user type
}

function handleSpace(event: KeyboardEvent) {
  // Check if the current input looks like a complete search term
  if (searchQuery.value.trim() && searchQuery.value.includes(':')) {
    event.preventDefault()
    parseQueryToChips()
  }
}

function handleEnter() {
  if (searchQuery.value.trim() && searchQuery.value.includes(':')) {
    // Convert current input to chip
    parseQueryToChips()
  } else if (hasValidQuery.value) {
    // Execute search if we have valid query from chips
    executeSearch()
  }
}

function parseQueryToChips() {
  if (!searchQuery.value.trim()) return
  
  const newChipId = `chip-${Date.now()}-${Math.random()}`
  const query = searchQuery.value.trim()
  
  // Try to parse the current input as a search term
  const [key, ...valueParts] = query.split(':')
  const value = valueParts.join(':').replace(/^"|"$/g, '') // Remove surrounding quotes only
  
  if (!key || !value) return
  
  let chip: {id: string, type: string, label: string, value: any} | null = null
  
  switch (key.toLowerCase()) {
    case 'owner':
    case 'owners':
      chip = {
        id: newChipId,
        type: 'owners',
        label: `Owner: ${value}`,
        value: [value.trim()]
      }
      break
    case 'recipient':
    case 'recipients':
      chip = {
        id: newChipId,
        type: 'recipients',
        label: `Recipient: ${value}`,
        value: [value.trim()]
      }
      break
    case 'tags':
    case 'tag':
      if (value.includes('=')) {
        const equalIndex = value.indexOf('=')
        const tagName = value.substring(0, equalIndex)
        const tagValue = value.substring(equalIndex + 1)
        chip = {
          id: newChipId,
          type: 'tags',
          label: `${tagName.trim()}: ${tagValue.trim()}`,
          value: { name: tagName.trim(), value: tagValue.trim() }
        }
      }
      break
    case 'first':
    case 'limit':
      const firstValue = parseInt(value)
      if (!isNaN(firstValue) && firstValue > 0) {
        chip = {
          id: newChipId,
          type: 'first',
          label: `Limit: ${Math.min(firstValue, 100)}`,
          value: Math.min(firstValue, 100)
        }
      }
      break
    case 'block':
    case 'height':
      if (value.includes('-')) {
        const [min, max] = value.split('-').map(v => parseInt(v.trim()))
        if (!isNaN(min) || !isNaN(max)) {
          chip = {
            id: newChipId,
            type: 'block',
            label: `Block: ${min || '*'}-${max || '*'}`,
            value: { min: isNaN(min) ? undefined : min, max: isNaN(max) ? undefined : max }
          }
        }
      } else {
        const blockHeight = parseInt(value)
        if (!isNaN(blockHeight)) {
          chip = {
            id: newChipId,
            type: 'block',
            label: `Block: ${blockHeight}`,
            value: blockHeight
          }
        }
      }
      break
  }
  
  if (chip) {
    // Add chip if it doesn't already exist
    const exists = searchChips.value.some(existing => 
      existing.type === chip!.type && 
      JSON.stringify(existing.value) === JSON.stringify(chip!.value)
    )
    
    if (!exists) {
      searchChips.value.push(chip)
      rebuildOptionsFromChips()
    }
    
    // Clear the input
    searchQuery.value = ''
  }
}

// Chip management functions
function removeChip(chipId: string) {
  searchChips.value = searchChips.value.filter(chip => chip.id !== chipId)
  rebuildOptionsFromChips()
}

function clearAllChips() {
  searchChips.value = []
  parsedOptions.value = {}
}

function rebuildOptionsFromChips() {
  const options: TransactionQueryOptions = {
    sort: 'HEIGHT_DESC' // Default sort
  }
  
  for (const chip of searchChips.value) {
    switch (chip.type) {
      case 'owners':
        options.owners = chip.value
        break
      case 'recipients':
        options.recipients = chip.value
        break
      case 'ids':
        options.ids = chip.value
        break
      case 'bundledIn':
        options.bundledIn = chip.value
        break
      case 'first':
        options.first = chip.value
        break
      case 'after':
        options.after = chip.value
        break
      case 'block':
        if (typeof chip.value === 'object' && chip.value.min !== undefined && chip.value.max !== undefined) {
          options.block = createRangeFilter(chip.value.min, chip.value.max)
        } else if (typeof chip.value === 'number') {
          options.block = createRangeFilter(chip.value)
        }
        break
      case 'tags':
        // Tags will be handled after the loop to combine same tag names
        break
      case 'sort':
        options.sort = chip.value
        break
    }
  }
  
  // Handle tags separately to combine chips with the same tag name
  const tagGroups = new Map<string, string[]>()
  
  // Group tag chips by tag name
  for (const chip of searchChips.value) {
    if (chip.type === 'tags') {
      const tagName = chip.value.name
      const tagValue = chip.value.value
      
      if (!tagGroups.has(tagName)) {
        tagGroups.set(tagName, [])
      }
      tagGroups.get(tagName)!.push(tagValue)
    }
  }
  
  // Create tag filters with combined values for each tag name
  if (tagGroups.size > 0) {
    options.tags = []
    for (const [tagName, tagValues] of tagGroups) {
      options.tags.push(createTagFilter(tagName, tagValues))
    }
  }
  
  parsedOptions.value = options
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
    rebuildOptionsFromChips()
    executeSearch()
  }
}

// Function to set search query externally
function setSearchQuery(query: string) {
  searchQuery.value = query
  
  // If the query looks like a single search term, convert it to a chip
  if (query.trim().includes(':')) {
    parseQueryToChips()
  } else {
    // Otherwise use the old parsing method
    parseQuery()
  }
  
  // Auto-execute the search
  if (query.trim()) {
    executeSearch()
  }
}

// Expose methods for parent components
defineExpose({
  setSearchQuery,
  executeSearch,
  searchQuery: readonly(searchQuery)
})

// Auto-parse on mount if there's already a query
parseQuery()
</script>

<style scoped>
.transaction-search {
  max-width: 1200px;
  margin: 0 auto;
  padding: 1rem;
}

.search-input-container {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 1rem;
}

.search-input {
  flex: 1;
  padding: 0.75rem;
  border: 2px solid #e2e8f0;
  border-radius: 0.5rem;
  font-size: 1rem;
  font-family: 'Courier New', monospace;
}

.search-input:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.search-button {
  padding: 0.75rem 1.5rem;
  background: #3b82f6;
  color: white;
  border: none;
  border-radius: 0.5rem;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.2s;
}

.search-button:hover:not(:disabled) {
  background: #2563eb;
}

.search-button:disabled {
  background: #9ca3af;
  cursor: not-allowed;
}

.query-hints {
  margin-bottom: 1rem;
  padding: 1rem;
  background: #f8fafc;
  border-radius: 0.5rem;
  border: 1px solid #e2e8f0;
}

.hint-section h4 {
  margin: 0 0 0.5rem 0;
  font-weight: 600;
  color: #374151;
}

.examples {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.examples code {
  padding: 0.25rem 0.5rem;
  background: #e5e7eb;
  border-radius: 0.25rem;
  font-size: 0.875rem;
  font-family: 'Courier New', monospace;
}

.parsed-query-container {
  margin-bottom: 1rem;
}

.parsed-query-toggle {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  width: 100%;
  padding: 0.75rem;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 0.5rem;
  font-size: 0.875rem;
  font-weight: 500;
  color: #374151;
  cursor: pointer;
  transition: all 0.2s ease;
  text-align: left;
}

.parsed-query-toggle:hover {
  background: #f1f5f9;
  border-color: #cbd5e1;
}

.parsed-query-toggle.expanded {
  border-bottom-left-radius: 0;
  border-bottom-right-radius: 0;
  border-bottom-color: transparent;
}

.toggle-icon {
  font-size: 0.75rem;
  color: #6b7280;
  transition: transform 0.2s ease;
}

.parsed-query {
  padding: 1rem;
  background: #f1f5f9;
  border: 1px solid #cbd5e1;
  border-top: none;
  border-radius: 0 0 0.5rem 0.5rem;
  animation: slideDown 0.2s ease-out;
}

@keyframes slideDown {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.parsed-query pre {
  margin: 0;
  font-size: 0.875rem;
  font-family: 'Courier New', monospace;
  white-space: pre-wrap;
  color: #1f2937;
}

.error-message {
  margin-bottom: 1rem;
  padding: 1rem;
  background: #fef2f2;
  border: 1px solid #fecaca;
  border-radius: 0.5rem;
  color: #dc2626;
}

.results-section h3 {
  margin-bottom: 1rem;
  font-size: 1.25rem;
  font-weight: 600;
}

.results-grid {
  display: grid;
  gap: 1rem;
  margin-bottom: 2rem;
}

.transaction-card {
  padding: 1rem;
  border: 1px solid #e2e8f0;
  border-radius: 0.5rem;
  background: white;
}

.transaction-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.75rem;
  padding-bottom: 0.5rem;
  border-bottom: 1px solid #f1f5f9;
}

.transaction-id {
  margin: 0;
  font-size: 0.875rem;
  font-family: 'Courier New', monospace;
  color: #3b82f6;
  word-break: break-all;
}

.transaction-size {
  font-size: 0.75rem;
  color: #6b7280;
  background: #f3f4f6;
  padding: 0.25rem 0.5rem;
  border-radius: 0.25rem;
}

.transaction-details {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.detail-row {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.875rem;
}

.address {
  font-family: 'Courier New', monospace;
  background: #f3f4f6;
  padding: 0.125rem 0.25rem;
  border-radius: 0.125rem;
  word-break: break-all;
}

.timestamp {
  font-size: 0.75rem;
  color: #6b7280;
  margin-left: 0.5rem;
}

.tags-section {
  margin-top: 0.5rem;
}

.tags-list {
  display: flex;
  flex-wrap: wrap;
  gap: 0.25rem;
  margin-top: 0.25rem;
}

.tag-item {
  font-size: 0.75rem;
  background: #dbeafe;
  color: #1e40af;
  padding: 0.125rem 0.375rem;
  border-radius: 0.25rem;
  font-family: 'Courier New', monospace;
}

.clickable-tag {
  cursor: pointer;
  transition: all 0.2s ease;
  border: 1px solid transparent;
}

.clickable-tag:hover {
  background: #3b82f6;
  color: white;
  transform: translateY(-1px);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  border-color: #2563eb;
}

.tag-matched {
  background: #10b981 !important;
  color: white !important;
  border: 1px solid #059669;
  font-weight: 600;
  box-shadow: 0 1px 3px rgba(16, 185, 129, 0.2);
  animation: highlightPulse 2s ease-in-out;
}

.tag-matched:hover {
  background: #059669 !important;
  border-color: #047857 !important;
  transform: translateY(-1px);
  box-shadow: 0 2px 6px rgba(16, 185, 129, 0.3);
}

.match-indicator {
  font-size: 0.6rem;
  margin-right: 0.25rem;
  opacity: 0.9;
}

@keyframes highlightPulse {
  0%, 100% {
    box-shadow: 0 1px 3px rgba(16, 185, 129, 0.2);
  }
  50% {
    box-shadow: 0 2px 8px rgba(16, 185, 129, 0.4);
  }
}

/* Search Chips Styles */
.search-chips-container {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-top: 0.75rem;
  padding: 0.75rem;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 0.5rem;
}

.search-chips {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  flex: 1;
}

.search-chip {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: #3b82f6;
  color: white;
  padding: 0.375rem 0.75rem;
  border-radius: 1.5rem;
  font-size: 0.875rem;
  font-weight: 500;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
  transition: all 0.2s ease;
}

.search-chip:hover {
  background: #2563eb;
  transform: translateY(-1px);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.15);
}

.chip-label {
  white-space: nowrap;
}

.chip-remove {
  background: none;
  border: none;
  color: white;
  font-size: 1.25rem;
  font-weight: bold;
  cursor: pointer;
  padding: 0;
  width: 20px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  transition: background-color 0.2s;
}

.chip-remove:hover {
  background: rgba(255, 255, 255, 0.2);
}

.clear-all-chips {
  background: #ef4444;
  color: white;
  border: none;
  padding: 0.375rem 0.75rem;
  border-radius: 0.375rem;
  font-size: 0.875rem;
  cursor: pointer;
  transition: background-color 0.2s;
  white-space: nowrap;
}

.clear-all-chips:hover {
  background: #dc2626;
}

/* Image Preview Styles */
.image-preview-section {
  margin-top: 1rem;
  border-top: 1px solid #f1f5f9;
  padding-top: 1rem;
}

.image-container {
  position: relative;
  display: inline-block;
  max-width: 100%;
  border-radius: 0.5rem;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  background: #f8fafc;
}

.transaction-image {
  max-width: 100%;
  max-height: 300px;
  width: auto;
  height: auto;
  display: block;
  border-radius: 0.5rem;
  transition: transform 0.2s ease;
}

.transaction-image:hover {
  transform: scale(1.02);
}

.image-overlay {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  background: linear-gradient(transparent, rgba(0, 0, 0, 0.7));
  color: white;
  padding: 0.75rem;
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  opacity: 0;
  transition: opacity 0.2s ease;
}

.image-container:hover .image-overlay {
  opacity: 1;
}

.image-info {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.image-type {
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.image-size {
  font-size: 0.625rem;
  opacity: 0.9;
}

.image-dimensions {
  font-size: 0.625rem;
  opacity: 0.9;
  font-weight: 500;
}

.view-full-button {
  padding: 0.375rem 0.75rem;
  background: rgba(255, 255, 255, 0.2);
  border: 1px solid rgba(255, 255, 255, 0.3);
  border-radius: 0.25rem;
  color: white;
  text-decoration: none;
  font-size: 0.75rem;
  font-weight: 500;
  transition: all 0.2s ease;
  backdrop-filter: blur(8px);
}

.view-full-button:hover {
  background: rgba(255, 255, 255, 0.3);
  border-color: rgba(255, 255, 255, 0.5);
  transform: translateY(-1px);
}

.pagination {
  text-align: center;
}

.load-more-button {
  padding: 0.75rem 1.5rem;
  background: #6b7280;
  color: white;
  border: none;
  border-radius: 0.5rem;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.2s;
}

.load-more-button:hover:not(:disabled) {
  background: #4b5563;
}

.load-more-button:disabled {
  background: #9ca3af;
  cursor: not-allowed;
}

@media (max-width: 768px) {
  .search-input-container {
    flex-direction: column;
  }
  
  .transaction-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.5rem;
  }
  
  .examples {
    flex-direction: column;
  }
  
  .transaction-image {
    max-height: 200px;
  }
  
  .image-overlay {
    padding: 0.5rem;
  }
  
  .view-full-button {
    padding: 0.25rem 0.5rem;
    font-size: 0.625rem;
  }
}
</style>