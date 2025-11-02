<template>
  <div class="audio-search">
    <div class="search-input-container">
      <input
        v-model="searchQuery"
        @input="handleInput"
        @keydown.enter="handleEnter"
        @keydown.space="handleSpace"
        placeholder="Try: tag:Content-Type=audio/* | tag:Genre=jazz,blues | tag:Type=rock tag:Type=pop | tag:=MirrorXYZ"
        class="search-input"
      />
      <button 
        @click="executeSearch"
        :disabled="loading || !hasValidQuery"
        class="search-button"
      >
        {{ loading ? 'Searching...' : 'Search Audio' }}
      </button>
      <button 
        @click="showHelp = !showHelp"
        class="help-button"
        title="Show search help"
      >
        ?
      </button>
    </div>

    <!-- Search Chips -->
    <div v-if="searchChips.length > 0" class="search-chips-container">
      <div class="search-chips">
        <div
          v-for="chip in searchChips"
          :key="chip.id"
          class="search-chip"
          :data-match="chip.type === 'tag' && chip.value?.match ? chip.value.match.toLowerCase() : 'exact'"
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

    <!-- Help Section -->
    <div v-if="showHelp" class="help-section">
      <h3>🎯 New Smart Search Syntax</h3>
      <div class="help-examples">
        <div class="help-item">
          <strong>🌟 Wildcard (*):</strong> <code>tag:Content-Type=audio/*</code>
          <span>Find all audio files (mp3, wav, flac, etc.)</span>
        </div>
        <div class="help-item">
          <strong>🎯 Exact Match (""):</strong> <code>tags:Title="Dark Side of the Moon"</code>
          <span>Find exact phrase matches only</span>
        </div>
        <div class="help-item">
          <strong>🔀 Fuzzy OR (,):</strong> <code>tags:Genre=jazz,blues</code>
          <span>Find content with jazz-like OR blues-like terms</span>
        </div>
        <div class="help-item">
          <strong>🤝 Fuzzy AND (separate):</strong> <code>tags:Type=music tags:Type=audio</code>
          <span>Find content with music-like AND audio-like terms</span>
        </div>
        <div class="help-item">
          <strong>🎯 Value-only search:</strong> <code>tag:=MirrorXYZ</code>
          <span>Find any tag containing "MirrorXYZ" value</span>
        </div>
        <div class="help-item">
          <strong>🔧 Combined:</strong> <code>tags:Genre=rock,metal tags:Year=1990 first:20</code>
          <span>Mix different search types and add limits</span>
        </div>
      </div>
    </div>

    <!-- View Mode Toggle -->
    <div v-if="audioTransactions.length > 0" class="view-controls">
      <div class="view-mode-toggle">
        <button 
          @click="viewMode = 'list'"
          :class="{ active: viewMode === 'list' }"
          class="view-mode-btn"
          title="List view"
        >
          📋
        </button>
        <button 
          @click="viewMode = 'grid'"
          :class="{ active: viewMode === 'grid' }"
          class="view-mode-btn"
          title="Grid view"
        >
          🎵
        </button>
      </div>
      <div class="results-count">
        {{ audioTransactions.length }}{{ results?.pageInfo.hasNextPage ? '+' : '' }} audio files
      </div>
    </div>

    <!-- Audio Results -->
    <div v-if="audioTransactions.length > 0" class="audio-results">
      <div :class="['audio-grid', `view-${viewMode}`]">
        <div
          v-for="transaction in audioTransactions"
          :key="transaction.id"
          class="audio-card"
        >
          <!-- Audio Artwork -->
          <div class="audio-artwork">
            <img 
              v-if="getAudioMetadata(transaction).artwork"
              :src="getAudioMetadata(transaction).artwork"
              :alt="`${getAudioMetadata(transaction).title} artwork`"
              class="artwork-image"
              @error="handleArtworkError"
            />
            <div v-else class="default-artwork">
              🎵
            </div>
            
            <!-- Play Button Overlay -->
            <div class="play-overlay">
              <button 
                class="play-button" 
                :class="{ playing: isCurrentTrack(transaction.id) }"
                @click="playAudio(transaction)"
                :title="isCurrentTrack(transaction.id) && isGlobalPlayerPlaying() ? 'Pause' : 'Play'"
              >
                {{ isCurrentTrack(transaction.id) && isGlobalPlayerPlaying() ? '⏸' : '▶' }}
              </button>
            </div>
          </div>

          <!-- Audio Info -->
          <div class="audio-info">
            <h3 class="audio-title">{{ getDisplayTitle(transaction) }}</h3>
            <p class="audio-artist">{{ getAudioMetadata(transaction).artist }}</p>
            <p v-if="getAudioMetadata(transaction).album" class="audio-album">{{ getAudioMetadata(transaction).album }}</p>
            
            <!-- File Name (if different from title) -->
            <p v-if="getFileName(transaction) && getFileName(transaction) !== getDisplayTitle(transaction)" class="audio-filename">
              📄 {{ getFileName(transaction) }}
            </p>
            
            <!-- Transaction Owner -->
            <div class="owner-info">
              <span class="owner-label">Owner:</span>
              <button 
                @click.stop="copyOwnerAddress(transaction.owner.address)"
                class="owner-address"
                :title="`Click to copy: ${transaction.owner.address}`"
              >
                {{ formatOwnerAddress(transaction.owner.address) }}
                <span class="copy-icon">📋</span>
              </button>
            </div>
            
            <!-- Audio Details -->
            <div class="audio-details">
              <span class="audio-type">{{ getContentType(transaction) }}</span>
              <span v-if="getAudioMetadata(transaction).duration" class="audio-duration">
                {{ formatDuration(getAudioMetadata(transaction).duration) }}
              </span>
              <span class="audio-size">{{ formatFileSize(transaction.data?.size) }}</span>
            </div>

            <!-- Transaction ID -->
            <div class="transaction-info">
              <div class="transaction-id-container">
                <span class="transaction-label">Transaction ID:</span>
                <button 
                  @click.stop="copyTransactionId(transaction.id)"
                  class="transaction-id"
                  :title="`Click to copy: ${transaction.id}`"
                >
                  {{ transaction.id }}
                  <span class="copy-icon">📋</span>
                </button>
              </div>
              <div class="transaction-links">
                <a 
                  :href="`https://arweave.net/${transaction.id}`" 
                  target="_blank" 
                  class="transaction-link"
                  @click.stop
                  title="View on Arweave"
                >
                  📁 File
                </a>
                <a 
                  :href="`https://viewblock.io/arweave/tx/${transaction.id}`" 
                  target="_blank" 
                  class="transaction-link"
                  @click.stop
                  title="View on ViewBlock"
                >
                  🔍 Explorer
                </a>
              </div>
            </div>

            <!-- Metadata Tags -->
            <div class="audio-tags">
              <span v-for="tag in getRelevantTags(transaction)" :key="tag.name" class="tag">
                {{ tag.name }}: {{ tag.value }}
              </span>
            </div>

            <!-- Additional Tags (expandable) -->
            <div class="additional-tags-section">
              <button 
                @click="toggleTagExpansion(transaction.id)"
                class="expand-tags-btn"
                v-if="getAdditionalTags(transaction).length > 0"
              >
                {{ expandedTags.has(transaction.id) ? 'Hide' : 'Show' }} Additional Tags 
                ({{ getAdditionalTags(transaction).length }})
                <span class="expand-icon">{{ expandedTags.has(transaction.id) ? '▼' : '▶' }}</span>
              </button>
              
              <div v-if="expandedTags.has(transaction.id)" class="expanded-tags">
                <div v-for="tag in getAdditionalTags(transaction)" :key="tag.name" class="expanded-tag">
                  <span class="tag-name">{{ tag.name }}:</span>
                  <span class="tag-value">{{ tag.value }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Load More Button -->
      <div v-if="results && results.pageInfo.hasNextPage" class="load-more-container">
        <button 
          @click="loadMore"
          :disabled="loading"
          class="load-more-button"
        >
          {{ loading ? 'Loading...' : 'Load More Audio' }}
        </button>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="loading && audioTransactions.length === 0" class="loading-message">
      <div class="loading-spinner"></div>
      <p>Searching for audio files...</p>
    </div>

    <!-- Error Message -->
    <div v-if="error" class="error-message">
      <p>{{ error }}</p>
    </div>

    <!-- No Results -->
    <div v-if="results && results.edges.length === 0 && !loading" class="no-results-message">
      <p>No audio files found matching your search criteria.</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, inject } from 'vue'
import { useGraphQL, type TransactionQueryOptions, type TransactionConnection } from '../composables/gql'
import type GlobalAudioPlayer from './GlobalAudioPlayer.vue'

interface SearchChip {
  id: string
  type: string
  label: string
  value: any
}

// Inject the global audio player
const globalPlayer = inject<{ value: InstanceType<typeof GlobalAudioPlayer> | undefined }>('audioPlayer')

// Component state
const searchQuery = ref('')
const searchChips = ref<SearchChip[]>([])
const parsedOptions = ref<TransactionQueryOptions>({})
const error = ref<string | null>(null)
const showHelp = ref(false)
const failedAudio = ref(new Set<string>())
const viewMode = ref<'list' | 'grid'>('list')
const results = ref<TransactionConnection | null>(null)
const loading = ref(false)
const lastCursor = ref<string | undefined>()
const expandedTags = ref(new Set<string>())

// GraphQL composable
const { getTransactions } = useGraphQL()

// Computed properties
const hasValidQuery = computed(() => {
  return searchChips.value.length > 0 || Object.keys(parsedOptions.value).length > 0
})

const audioTransactions = computed(() => {
  if (!results.value) return []
  
  return results.value.edges
    .map((edge: any) => edge.node)
    .filter((transaction: any) => isAudioTransaction(transaction) && !failedAudio.value.has(transaction.id))
})

// Audio Helper Functions
function isAudioTransaction(transaction: any): boolean {
  const contentType = transaction.tags?.find((tag: any) => tag.name === 'Content-Type')?.value
  return contentType?.startsWith('audio/') || false
}

function getContentType(transaction: any): string {
  return transaction.tags?.find((tag: any) => tag.name === 'Content-Type')?.value || 'Unknown'
}

function getAudioMetadata(transaction: any) {
  const tags = transaction.tags || []
  const tagMap = new Map(tags.map((tag: any) => [tag.name, tag.value]))
  
  return {
    title: String(tagMap.get('Title') || tagMap.get('title') || `Audio ${transaction.id.slice(0, 8)}`),
    artist: String(tagMap.get('Artist') || tagMap.get('artist') || tagMap.get('Creator') || 'Unknown Artist'),
    album: String(tagMap.get('Album') || tagMap.get('album') || ''),
    genre: String(tagMap.get('Genre') || tagMap.get('genre') || ''),
    duration: String(tagMap.get('Duration') || tagMap.get('duration') || ''),
    artwork: String(tagMap.get('Artwork') || tagMap.get('artwork') || '')
  }
}

function getRelevantTags(transaction: any) {
  const relevantTagNames = [
    'Type', 'Genre', 'Bitrate', 'Sample-Rate', 'App-Name', 'Protocol', 
    'Format', 'Quality', 'Encoding', 'License', 'Language', 'Category'
  ]
  return transaction.tags?.filter((tag: any) => 
    relevantTagNames.includes(tag.name) && tag.value !== '' && tag.value !== undefined
  ) || []
}

function getAdditionalTags(transaction: any) {
  // Tags that are commonly used but not shown in the main display
  const excludedTagNames = [
    'Content-Type', 'Title', 'title', 'Artist', 'artist', 'Creator', 'Album', 'album',
    'Genre', 'genre', 'Duration', 'duration', 'Artwork', 'artwork', 'Type', 'Bitrate', 
    'Sample-Rate', 'App-Name', 'Protocol', 'File-Name'
  ]
  
  return transaction.tags?.filter((tag: any) => 
    !excludedTagNames.includes(tag.name) && 
    tag.value !== '' && 
    tag.value !== undefined &&
    tag.value !== null
  ) || []
}

function toggleTagExpansion(transactionId: string) {
  if (expandedTags.value.has(transactionId)) {
    expandedTags.value.delete(transactionId)
  } else {
    expandedTags.value.add(transactionId)
  }
}

function formatDuration(duration: string | number): string {
  const seconds = typeof duration === 'string' ? parseFloat(duration) : duration
  if (isNaN(seconds)) return ''
  
  const mins = Math.floor(seconds / 60)
  const secs = Math.floor(seconds % 60)
  return `${mins}:${secs.toString().padStart(2, '0')}`
}

function formatFileSize(size: string | number | undefined): string {
  if (!size) return ''
  const bytes = typeof size === 'string' ? parseInt(size) : size
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

function isCurrentTrack(transactionId: string): boolean {
  return globalPlayer?.value?.currentTrack?.id === transactionId
}

function isGlobalPlayerPlaying(): boolean {
  return (globalPlayer?.value as any)?.isPlaying || false
}

// Audio Playback Functions
function playAudio(transaction: any) {
  if (!globalPlayer?.value) return
  
  // If this track is already playing, toggle play/pause
  if (isCurrentTrack(transaction.id)) {
    globalPlayer.value.togglePlayPause()
    return
  }
  
  const metadata = getAudioMetadata(transaction)
  const audioUrl = `https://arweave.net/${transaction.id}`
  
  const track = {
    id: transaction.id,
    title: getDisplayTitle(transaction),
    artist: metadata.artist,
    album: metadata.album,
    artwork: metadata.artwork,
    url: audioUrl,
    duration: metadata.duration ? parseFloat(metadata.duration) : undefined
  }
  
  // Create playlist from current search results
  const playlist = audioTransactions.value.map((tx: any) => {
    const meta = getAudioMetadata(tx)
    return {
      id: tx.id,
      title: getDisplayTitle(tx),
      artist: meta.artist,
      album: meta.album,
      artwork: meta.artwork,
      url: `https://arweave.net/${tx.id}`,
      duration: meta.duration ? parseFloat(meta.duration) : undefined
    }
  })
  
  globalPlayer.value.playTrack(track, playlist)
}

function handleArtworkError(event: Event) {
  // Hide broken artwork images
  const img = event.target as HTMLImageElement
  img.style.display = 'none'
}

function copyTransactionId(transactionId: string) {
  navigator.clipboard.writeText(transactionId).then(() => {
    // Could show a toast notification here
    console.log('Transaction ID copied to clipboard:', transactionId)
  }).catch(err => {
    console.error('Failed to copy transaction ID:', err)
    // Fallback for older browsers
    const textArea = document.createElement('textarea')
    textArea.value = transactionId
    document.body.appendChild(textArea)
    textArea.select()
    document.execCommand('copy')
    document.body.removeChild(textArea)
  })
}

function copyOwnerAddress(address: string) {
  navigator.clipboard.writeText(address).then(() => {
    console.log('Owner address copied to clipboard:', address)
  }).catch(err => {
    console.error('Failed to copy owner address:', err)
    // Fallback for older browsers
    const textArea = document.createElement('textarea')
    textArea.value = address
    document.body.appendChild(textArea)
    textArea.select()
    document.execCommand('copy')
    document.body.removeChild(textArea)
  })
}

function getFileName(transaction: any): string {
  const tags = transaction.tags || []
  const fileName = tags.find((tag: any) => tag.name === 'File-Name')?.value
  return fileName || ''
}

function getDisplayTitle(transaction: any): string {
  const metadata = getAudioMetadata(transaction)
  const fileName = getFileName(transaction)
  
  // Priority: Title tag > File-Name tag > Generated title
  if (metadata.title && metadata.title !== `Audio ${transaction.id.slice(0, 8)}`) {
    return metadata.title
  }
  
  if (fileName) {
    // Clean up file extension for display
    return fileName.replace(/\.[^/.]+$/, '')
  }
  
  return metadata.title // Fallback to generated title
}

function formatOwnerAddress(address: string): string {
  if (!address) return 'Unknown'
  return `${address.slice(0, 8)}...${address.slice(-8)}`
}

// Search functionality (same as existing components)
function parseQuery() {
  error.value = null
  
  if (!searchQuery.value.trim()) {
    searchChips.value = []
    parsedOptions.value = {}
    return
  }

  try {
    const options: TransactionQueryOptions = {}
    const chips: SearchChip[] = []
    
    // Parse space-separated terms with quoted string support
    const parts: string[] = []
    let current = ''
    let inQuotes = false
    let i = 0
    
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
    
    // Process each part
    for (const part of parts) {
      if (part.startsWith('owner:')) {
        const address = part.slice(6)
        options.owners = [address]
        chips.push({
          id: `owner-${address}`,
          type: 'owner',
          label: `Owner: ${address.slice(0, 8)}...`,
          value: address
        })
      } else if (part.startsWith('tags:')) {
        const tagString = part.slice(5)
        if (!options.tags) options.tags = []
        
        const [name, rawValue] = tagString.split('=', 2)
        // Allow blank tag name for value-only search
        if (rawValue !== undefined) {
          let value = rawValue
          let match: 'EXACT' | 'WILDCARD' | 'FUZZY_AND' | 'FUZZY_OR' = 'EXACT'
          
          // 1. Check for wildcard (*)
          if (value.includes('*')) {
            match = 'WILDCARD'
            // Keep the * in the value for wildcard matching
          }
          // 2. Check for exact match (wrapped in double quotes)
          else if (value.startsWith('"') && value.endsWith('"')) {
            match = 'EXACT'
            value = value.slice(1, -1) // Remove quotes
          }
          // 3. Check for comma-separated values (fuzzy_or) 
          else if (value.includes(',')) {
            match = 'FUZZY_OR'
          }
          // 4. Default single value gets fuzzy_and when combined with other same-name tags
          else {
            // Check if we already have a tag with this name (only if name is not empty)
            const existingTagIndex = name ? options.tags.findIndex(tag => tag.name === name) : -1
            if (existingTagIndex >= 0) {
              // Combine with existing tag and use fuzzy_and
              const existingTag = options.tags[existingTagIndex]
              existingTag.values = [...(existingTag.values || []), value]
              existingTag.match = 'FUZZY_AND'
              
              // Update existing chip
              const existingChipIndex = chips.findIndex(chip => 
                chip.type === 'tag' && chip.value?.name === name
              )
              if (existingChipIndex >= 0) {
                const chip = chips[existingChipIndex]
                chip.value.values = existingTag.values
                chip.value.match = 'FUZZY_AND'
                chip.label = `${name}: ${existingTag.values.join(', ')} (fuzzy_and)`
                chip.id = `tag-${name}-${existingTag.values.join('-')}-FUZZY_AND`
              }
              continue // Skip creating new tag/chip
            }
            // Single value, first occurrence - default to exact for now
            match = 'EXACT'
          }
          
          // Parse values (comma-separated or single)
          const values = match === 'FUZZY_OR' 
            ? value.split(',').map(v => v.trim()).filter(v => v)
            : [value]
          
          const tagFilter: any = { values }
          if (name) {
            tagFilter.name = name
          }
          if (match !== 'EXACT') {
            tagFilter.match = match
          }
          
          options.tags.push(tagFilter)
          
          // Create chip with match indicator
          const matchSuffix = match !== 'EXACT' ? ` (${match.toLowerCase()})` : ''
          const displayName = name || '*'
          chips.push({
            id: `tag-${displayName}-${values.join('-')}-${match}`,
            type: 'tag',
            label: `${displayName}: ${values.join(', ')}${matchSuffix}`,
            value: { name: name || undefined, values, match }
          })
        }
      } else if (part.startsWith('first:')) {
        const count = parseInt(part.slice(6))
        if (!isNaN(count) && count > 0) {
          options.first = Math.min(count, 100)
          chips.push({
            id: 'first',
            type: 'first',
            label: `Limit: ${options.first}`,
            value: options.first
          })
        }
      } else if (part.startsWith('block:')) {
        const blockRange = part.slice(6)
        const [min, max] = blockRange.split('-').map(s => parseInt(s.trim()))
        
        if (!isNaN(min)) {
          if (!options.block) options.block = {}
          options.block.min = min
          
          if (!isNaN(max)) {
            options.block.max = max
            chips.push({
              id: 'block-range',
              type: 'block',
              label: `Blocks: ${min}-${max}`,
              value: { min, max }
            })
          } else {
            chips.push({
              id: 'block-min',
              type: 'block',
              label: `Block >= ${min}`,
              value: { min }
            })
          }
        }
      }
    }
    
    searchChips.value = chips
    parsedOptions.value = options
    
  } catch (err) {
    error.value = 'Invalid search query format'
    console.error('Parse error:', err)
  }
}

async function executeSearch() {
  if (!hasValidQuery.value || loading.value) return
  
  loading.value = true
  error.value = null
  lastCursor.value = undefined
  
  try {
    const searchResults = await getTransactions(parsedOptions.value)
    results.value = searchResults
    
    // Store cursor for pagination
    if (searchResults.edges.length > 0) {
      lastCursor.value = searchResults.edges[searchResults.edges.length - 1].cursor
    }
    
    if (searchResults.edges.length === 0) {
      error.value = null // Let the "no results" message show instead
    }
  } catch (err) {
    error.value = 'Search failed. Please try again.'
    console.error('Search error:', err)
  } finally {
    loading.value = false
  }
}

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
    
    // Update cursor for next pagination
    if (moreResults.edges.length > 0) {
      lastCursor.value = moreResults.edges[moreResults.edges.length - 1].cursor
    }
  } catch (err) {
    error.value = 'Failed to load more results'
    console.error('Load more error:', err)
  } finally {
    loading.value = false
  }
}

function removeChip(chipId: string) {
  searchChips.value = searchChips.value.filter(chip => chip.id !== chipId)
  
  // Rebuild options from remaining chips
  const options: TransactionQueryOptions = {}
  
  for (const chip of searchChips.value) {
    if (chip.type === 'owner') {
      options.owners = [chip.value]
    } else if (chip.type === 'tag') {
      if (!options.tags) options.tags = []
      options.tags.push({ name: chip.value.name, values: [chip.value.value] })
    } else if (chip.type === 'first') {
      options.first = chip.value
    } else if (chip.type === 'block') {
      options.block = chip.value
    }
  }
  
  parsedOptions.value = options
  
  // Update search query
  const queryParts: string[] = []
  for (const chip of searchChips.value) {
    if (chip.type === 'owner') {
      queryParts.push(`owner:${chip.value}`)
    } else if (chip.type === 'tag') {
      queryParts.push(`tags:${chip.value.name}=${chip.value.value}`)
    } else if (chip.type === 'first') {
      queryParts.push(`first:${chip.value}`)
    } else if (chip.type === 'block') {
      if (chip.value.max) {
        queryParts.push(`block:${chip.value.min}-${chip.value.max}`)
      } else {
        queryParts.push(`block:${chip.value.min}`)
      }
    }
  }
  searchQuery.value = queryParts.join(' ')
}

function clearAllChips() {
  searchChips.value = []
  parsedOptions.value = {}
  searchQuery.value = ''
  results.value = null
  error.value = null
}

// Input handlers
function handleInput() {
  parseQuery()
}

function handleEnter() {
  if (hasValidQuery.value && !loading.value) {
    executeSearch()
  }
}

function handleSpace(_event: KeyboardEvent) {
  // Allow space in search input
}

// Expose method for parent component
function setSearchQuery(query: string) {
  searchQuery.value = query
  parseQuery()
  if (hasValidQuery.value) {
    executeSearch()
  }
}

defineExpose({
  setSearchQuery
})
</script>

<style scoped>
.audio-search {
  max-width: 1200px;
  margin: 0 auto;
  padding: 1rem;
}

/* Search Input */
.search-input-container {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 1rem;
}

.search-input {
  flex: 1;
  padding: 0.75rem 1rem;
  border: 1px solid #d1d5db;
  border-radius: 0.5rem;
  font-size: 1rem;
  background: white;
}

.search-input:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.help-button {
  background: #f3f4f6;
  border: 1px solid #d1d5db;
  border-radius: 0.375rem;
  color: #6b7280;
  cursor: pointer;
  font-size: 1rem;
  font-weight: 600;
  padding: 0.75rem;
  transition: all 0.2s ease;
  min-width: 2.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
}

.help-button:hover {
  background: #e5e7eb;
  color: #374151;
}

.search-button {
  padding: 0.75rem 1.5rem;
  background: #3b82f6;
  color: white;
  border: none;
  border-radius: 0.5rem;
  font-size: 1rem;
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

/* Search Chips */
.search-chips-container {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1rem;
  flex-wrap: wrap;
}

.search-chips {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.search-chip {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: #eff6ff;
  border: 1px solid #bfdbfe;
  border-radius: 1rem;
  padding: 0.25rem 0.75rem;
  font-size: 0.875rem;
}

/* Match type specific styling */
.search-chip[data-match="wildcard"] {
  background: #fef3c7;
  border-color: #fbbf24;
}

.search-chip[data-match="wildcard"] .chip-label {
  color: #92400e;
}

.search-chip[data-match="fuzzy_or"] {
  background: #ecfdf5;
  border-color: #10b981;
}

.search-chip[data-match="fuzzy_or"] .chip-label {
  color: #047857;
}

.search-chip[data-match="fuzzy_and"] {
  background: #fce7f3;
  border-color: #ec4899;
}

.search-chip[data-match="fuzzy_and"] .chip-label {
  color: #be185d;
}

.search-chip[data-match="exact"] {
  background: #dbeafe;
  border-color: #3b82f6;
}

.search-chip[data-match="exact"] .chip-label {
  color: #1d4ed8;
}

.help-section {
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 0.5rem;
  padding: 1rem;
  margin-bottom: 1rem;
}

.help-section h3 {
  margin: 0 0 0.75rem 0;
  color: #1e293b;
  font-size: 1rem;
}

.help-examples {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.help-item {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.help-item strong {
  color: #374151;
  font-size: 0.875rem;
}

.help-item code {
  background: #1e293b;
  color: #e2e8f0;
  padding: 0.25rem 0.5rem;
  border-radius: 0.25rem;
  font-family: 'JetBrains Mono', 'Monaco', 'Consolas', monospace;
  font-size: 0.8rem;
  width: fit-content;
}

.help-item span {
  color: #64748b;
  font-size: 0.875rem;
}

.chip-label {
  color: #1e40af;
}

.chip-remove {
  background: none;
  border: none;
  color: #6b7280;
  cursor: pointer;
  font-size: 1rem;
  line-height: 1;
  padding: 0;
}

.chip-remove:hover {
  color: #ef4444;
}

.clear-all-chips {
  background: none;
  border: 1px solid #d1d5db;
  border-radius: 0.375rem;
  padding: 0.25rem 0.5rem;
  font-size: 0.875rem;
  color: #6b7280;
  cursor: pointer;
}

.clear-all-chips:hover {
  background: #f9fafb;
  border-color: #9ca3af;
}

/* View Controls */
.view-controls {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
  padding: 0.75rem;
  background: #f9fafb;
  border-radius: 0.5rem;
}

.view-mode-toggle {
  display: flex;
  gap: 0.25rem;
  background: white;
  border-radius: 0.375rem;
  padding: 0.25rem;
}

.view-mode-btn {
  background: none;
  border: none;
  padding: 0.5rem;
  border-radius: 0.25rem;
  cursor: pointer;
  font-size: 1rem;
  opacity: 0.6;
  transition: all 0.2s;
}

.view-mode-btn.active {
  background: #3b82f6;
  opacity: 1;
}

.view-mode-btn:hover {
  opacity: 1;
}

.results-count {
  font-size: 0.875rem;
  color: #6b7280;
}

/* Audio Grid */
.audio-results {
  margin-bottom: 2rem;
}

.audio-grid.view-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.audio-grid.view-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 1rem;
}

/* Audio Cards */
.audio-card {
  display: flex;
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 0.75rem;
  overflow: hidden;
  transition: all 0.2s;
  position: relative;
}

.view-list .audio-card {
  flex-direction: row;
}

.view-grid .audio-card {
  flex-direction: column;
}

.audio-card:hover {
  border-color: #d1d5db;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

/* Audio Artwork */
.audio-artwork {
  position: relative;
  background: #f3f4f6;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}

.view-list .audio-artwork {
  width: 80px;
  height: 80px;
  flex-shrink: 0;
}

.view-grid .audio-artwork {
  width: 100%;
  aspect-ratio: 1;
}

.artwork-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.default-artwork {
  font-size: 2rem;
  color: #9ca3af;
}

.play-overlay {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.2);
  opacity: 0;
  transition: opacity 0.2s;
}

.audio-card:hover .play-overlay {
  opacity: 1;
}

/* Always show play overlay when track is currently playing */
.audio-card:has(.play-button.playing) .play-overlay {
  opacity: 1;
  background: rgba(0, 0, 0, 0.4);
}

.play-button {
  background: rgba(255, 255, 255, 0.95);
  border: none;
  border-radius: 50%;
  width: 3.5rem;
  height: 3.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.4rem;
  cursor: pointer;
  transition: all 0.2s;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
}

.play-button:hover {
  background: white;
  transform: scale(1.1);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
}

.play-button.playing {
  background: #3b82f6;
  color: white;
  animation: pulse-play 2s infinite;
}

@keyframes pulse-play {
  0% { box-shadow: 0 0 0 0 rgba(59, 130, 246, 0.4); }
  70% { box-shadow: 0 0 0 10px rgba(59, 130, 246, 0); }
  100% { box-shadow: 0 0 0 0 rgba(59, 130, 246, 0); }
}

/* Audio Info */
.audio-info {
  padding: 1rem;
  flex: 1;
  min-width: 0;
}

.view-grid .audio-info {
  text-align: center;
}

.audio-title {
  font-size: 1rem;
  font-weight: 600;
  margin: 0 0 0.25rem 0;
  color: #111827;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.audio-artist {
  font-size: 0.875rem;
  color: #6b7280;
  margin: 0 0 0.25rem 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.audio-album {
  font-size: 0.75rem;
  color: #9ca3af;
  margin: 0 0 0.5rem 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.audio-filename {
  font-size: 0.75rem;
  color: #6b7280;
  margin: 0 0 0.5rem 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-style: italic;
}

.owner-info {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0.5rem;
  flex-wrap: wrap;
}

.owner-label {
  font-size: 0.75rem;
  font-weight: 500;
  color: #6b7280;
  flex-shrink: 0;
}

.owner-address {
  background: #f9fafb;
  border: 1px solid #e5e7eb;
  border-radius: 0.375rem;
  padding: 0.25rem 0.5rem;
  font-family: 'Courier New', monospace;
  font-size: 0.75rem;
  color: #374151;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  gap: 0.25rem;
}

.owner-address:hover {
  background: #f3f4f6;
  border-color: #d1d5db;
}

.owner-address .copy-icon {
  flex-shrink: 0;
  opacity: 0.6;
  font-size: 0.625rem;
}

.owner-address:hover .copy-icon {
  opacity: 1;
}

.audio-details {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 0.5rem;
  font-size: 0.75rem;
  color: #6b7280;
  flex-wrap: wrap;
}

.view-grid .audio-details {
  justify-content: center;
}

.view-grid .owner-info {
  justify-content: center;
}

.view-grid .owner-address {
  font-size: 0.625rem;
}

.audio-type,
.audio-duration,
.audio-size {
  background: #f3f4f6;
  padding: 0.125rem 0.375rem;
  border-radius: 0.25rem;
}

.audio-tags {
  display: flex;
  gap: 0.25rem;
  flex-wrap: wrap;
}

.view-grid .audio-tags {
  justify-content: center;
}

.tag {
  background: #eff6ff;
  color: #1d4ed8;
  padding: 0.125rem 0.375rem;
  border-radius: 0.25rem;
  font-size: 0.625rem;
}

/* Additional Tags Section */
.additional-tags-section {
  margin-top: 0.75rem;
  border-top: 1px solid #f3f4f6;
  padding-top: 0.5rem;
}

.expand-tags-btn {
  background: none;
  border: none;
  color: #6b7280;
  font-size: 0.75rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.25rem;
  padding: 0.25rem 0;
  transition: color 0.2s;
}

.expand-tags-btn:hover {
  color: #374151;
}

.expand-icon {
  font-size: 0.625rem;
  transition: transform 0.2s;
}

.expanded-tags {
  margin-top: 0.5rem;
  padding: 0.5rem;
  background: #f9fafb;
  border-radius: 0.375rem;
  border: 1px solid #e5e7eb;
}

.expanded-tag {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  padding: 0.25rem 0;
  border-bottom: 1px solid #e5e7eb;
  gap: 0.75rem;
}

.expanded-tag:last-child {
  border-bottom: none;
}

.tag-name {
  font-weight: 500;
  color: #374151;
  font-size: 0.75rem;
  min-width: 0;
  flex-shrink: 0;
  word-break: break-word;
}

.tag-value {
  color: #6b7280;
  font-size: 0.75rem;
  font-family: 'Courier New', monospace;
  word-break: break-all;
  text-align: right;
  min-width: 0;
  flex: 1;
}

.view-grid .additional-tags-section {
  text-align: left;
}

.view-grid .expand-tags-btn {
  justify-content: center;
}

.view-grid .expanded-tag {
  flex-direction: column;
  align-items: stretch;
  gap: 0.25rem;
}

.view-grid .tag-value {
  text-align: left;
}

/* Transaction Info */
.transaction-info {
  margin-top: 0.75rem;
  padding-top: 0.75rem;
  border-top: 1px solid #e5e7eb;
}

.transaction-id-container {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0.5rem;
  flex-wrap: wrap;
}

.transaction-label {
  font-size: 0.75rem;
  font-weight: 500;
  color: #6b7280;
  flex-shrink: 0;
}

.transaction-id {
  background: #f3f4f6;
  border: 1px solid #d1d5db;
  border-radius: 0.375rem;
  padding: 0.25rem 0.5rem;
  font-family: 'Courier New', monospace;
  font-size: 0.75rem;
  color: #374151;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  gap: 0.25rem;
  min-width: 0;
  flex: 1;
  word-break: break-all;
}

.transaction-id:hover {
  background: #e5e7eb;
  border-color: #9ca3af;
}

.copy-icon {
  flex-shrink: 0;
  opacity: 0.6;
  font-size: 0.75rem;
}

.transaction-id:hover .copy-icon {
  opacity: 1;
}

.transaction-links {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.transaction-link {
  background: #eff6ff;
  color: #2563eb;
  border: 1px solid #bfdbfe;
  border-radius: 0.375rem;
  padding: 0.25rem 0.5rem;
  font-size: 0.75rem;
  text-decoration: none;
  display: flex;
  align-items: center;
  gap: 0.25rem;
  transition: all 0.2s;
}

.transaction-link:hover {
  background: #dbeafe;
  border-color: #93c5fd;
  text-decoration: none;
}

/* Grid view adjustments for transaction info */
.view-grid .transaction-info {
  text-align: left;
}

.view-grid .transaction-id-container {
  flex-direction: column;
  align-items: stretch;
  gap: 0.25rem;
}

.view-grid .transaction-id {
  justify-content: center;
  text-align: center;
}

.view-grid .transaction-links {
  justify-content: center;
}

/* Mobile responsiveness for transaction ID */
@media (max-width: 768px) {
  .transaction-id-container {
    flex-direction: column;
    align-items: stretch;
    gap: 0.25rem;
  }
  
  .transaction-id {
    justify-content: space-between;
    text-align: left;
  }
  
  .transaction-links {
    justify-content: center;
  }
}

/* Load More */
.load-more-container {
  text-align: center;
  margin-top: 2rem;
}

.load-more-button {
  background: #f3f4f6;
  color: #374151;
  border: 1px solid #d1d5db;
  border-radius: 0.5rem;
  padding: 0.75rem 1.5rem;
  cursor: pointer;
  transition: all 0.2s;
}

.load-more-button:hover:not(:disabled) {
  background: #e5e7eb;
  border-color: #9ca3af;
}

.load-more-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* Loading, Error, No Results */
.loading-message {
  text-align: center;
  padding: 3rem 1rem;
  color: #6b7280;
}

.loading-spinner {
  width: 2rem;
  height: 2rem;
  border: 2px solid #e5e7eb;
  border-top-color: #3b82f6;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 1rem;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.error-message {
  text-align: center;
  padding: 2rem;
  color: #ef4444;
  background: #fef2f2;
  border: 1px solid #fecaca;
  border-radius: 0.5rem;
  margin-bottom: 1rem;
}

.no-results-message {
  text-align: center;
  padding: 3rem 1rem;
  color: #6b7280;
}

/* Responsive */
@media (max-width: 768px) {
  .audio-search {
    padding: 0.5rem;
  }
  
  .view-controls {
    flex-direction: column;
    gap: 0.75rem;
    align-items: flex-start;
  }
  
  .audio-grid.view-grid {
    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  }
  
  .search-input-container {
    flex-direction: column;
  }
}
</style>