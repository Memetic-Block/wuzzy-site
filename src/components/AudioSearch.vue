<template>
  <div class="audio-search">
    <div class="search-input-container">
      <input
        v-model="searchQuery"
        @input="handleInput"
        @keydown.enter="handleEnter"
        @keydown.space="handleSpace"
        placeholder="Search audio with 'tags:Content-Type=audio/mpeg first:20' or 'tags:Type=music tags:Genre=jazz'"
        class="search-input"
      />
      <button 
        @click="executeSearch"
        :disabled="loading || !hasValidQuery"
        class="search-button"
      >
        {{ loading ? 'Searching...' : 'Search Audio' }}
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

    <!-- Quick Search Examples -->
    <div class="query-hints">
      <div class="hint-section">
        <h4>Quick Audio Search:</h4>
        <div class="examples">
          <code class="cursor-pointer" @click="setSearchQuery('tags:Content-Type=audio/mpeg first:20')">MP3 Audio</code>
          <code class="cursor-pointer" @click="setSearchQuery('tags:Type=music first:24')">Music</code>
          <code class="cursor-pointer" @click="setSearchQuery('tags:Type=podcast first:15')">Podcasts</code>
          <code class="cursor-pointer" @click="setSearchQuery('tags:Content-Type=audio/wav first:15')">WAV Audio</code>
        </div>
      </div>
    </div>

    <!-- Error Display -->
    <div v-if="error" class="error-message">
      <strong>Error:</strong> {{ error }}
    </div>

    <!-- Results Display -->
    <div v-if="results && audioTransactions.length > 0" class="results-section">
      <div class="results-header">
        <h3>Found {{ audioTransactions.length }} Audio Files</h3>
        <div class="view-controls">
          <button 
            @click="viewMode = 'list'" 
            :class="{ active: viewMode === 'list' }"
            class="view-mode-btn"
            title="List view"
          >
            ☰
          </button>
          <button 
            @click="viewMode = 'grid'" 
            :class="{ active: viewMode === 'grid' }"
            class="view-mode-btn"
            title="Grid view"
          >
            ⊞
          </button>
        </div>
      </div>
      
      <div class="audio-container" :class="viewMode">
        <div 
          v-for="transaction in audioTransactions" 
          :key="transaction.id"
          class="audio-item"
        >
          <!-- Audio Player Section -->
          <div class="audio-player-section">
            <div class="audio-artwork">
              <img 
                v-if="getArtworkUrl(transaction)"
                :src="getArtworkUrl(transaction)"
                :alt="`${getTitle(transaction)} artwork`"
                class="artwork-image"
                @error="handleArtworkError"
              />
              <div v-else class="default-artwork">
                🎵
              </div>
            </div>
            
            <div class="audio-controls">
              <button 
                @click="togglePlayPause(transaction.id)"
                :class="{ playing: isPlaying(transaction.id) }"
                class="play-pause-btn"
              >
                {{ isPlaying(transaction.id) ? '⏸' : '▶' }}
              </button>
              
              <audio 
                :ref="`audio-${transaction.id}`"
                :src="getAudioUrl(transaction.id)"
                @loadedmetadata="handleAudioLoad(transaction.id, $event)"
                @timeupdate="handleTimeUpdate(transaction.id, $event)"
                @ended="handleAudioEnded(transaction.id)"
                @error="handleAudioError"
                preload="metadata"
              ></audio>
              
              <div class="progress-section">
                <input
                  type="range"
                  :value="getProgress(transaction.id)"
                  @input="setProgress(transaction.id, $event)"
                  class="progress-slider"
                  min="0"
                  max="100"
                />
                <div class="time-display">
                  <span>{{ formatTime(getCurrentTime(transaction.id)) }}</span>
                  <span>{{ formatTime(getDuration(transaction.id)) }}</span>
                </div>
              </div>
            </div>
          </div>

          <!-- Audio Information -->
          <div class="audio-info">
            <div class="audio-meta">
              <h4 class="audio-title">{{ getTitle(transaction) }}</h4>
              <p class="audio-artist">{{ getArtist(transaction) }}</p>
              <p class="audio-album">{{ getAlbum(transaction) }}</p>
            </div>
            
            <div class="audio-details">
              <span class="audio-type">{{ getContentType(transaction) }}</span>
              <span class="audio-size">{{ formatFileSize(parseInt(transaction.data.size)) }}</span>
              <span class="transaction-id">{{ transaction.id.substring(0, 8) }}...</span>
            </div>
            
            <div class="audio-tags">
              <span 
                v-for="tag in getRelevantTags(transaction)" 
                :key="tag.name"
                class="tag"
              >
                {{ tag.name }}: {{ tag.value }}
              </span>
            </div>
            
            <div class="audio-actions">
              <button 
                @click="openInNewTab(transaction.id)"
                class="action-btn"
                title="Open in new tab"
              >
                🔗 Open
              </button>
              <button 
                @click="copyAudioUrl(transaction.id)"
                class="action-btn"
                title="Copy audio URL"
              >
                📋 Copy
              </button>
              <button 
                @click="downloadAudio(transaction.id)"
                class="action-btn"
                title="Download audio"
              >
                💾 Download
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- No audio found in results -->
      <div v-if="results && results.edges.length > 0 && audioTransactions.length === 0" class="no-audio-message">
        <p>No audio transactions found in the current results. Try searching with audio-specific filters:</p>
        <div class="suggested-searches">
          <code class="cursor-pointer" @click="setSearchQuery('tags:Content-Type=audio/mpeg first:20')">tags:Content-Type=audio/mpeg first:20</code>
          <code class="cursor-pointer" @click="setSearchQuery('tags:Type=music first:20')">tags:Type=music first:20</code>
        </div>
      </div>

      <!-- Pagination -->
      <div v-if="results.pageInfo.hasNextPage" class="pagination">
        <button 
          @click="loadMore"
          :disabled="loading"
          class="load-more-button"
        >
          {{ loading ? 'Loading More Audio...' : 'Load More Audio' }}
        </button>
      </div>
    </div>

    <!-- No results message -->
    <div v-if="results && results.edges.length === 0" class="no-results-message">
      <p>No transactions found matching your search criteria.</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useGraphQL, type TransactionQueryOptions, type TransactionConnection } from '../composables/gql'

interface SearchChip {
  id: string
  type: string
  label: string
  value: any
}

interface AudioState {
  duration: number
  currentTime: number
  isPlaying: boolean
}

// Component state
const searchQuery = ref('')
const searchChips = ref<SearchChip[]>([])
const parsedOptions = ref<TransactionQueryOptions>({})
const error = ref<string | null>(null)
const failedAudio = ref(new Set<string>())
const viewMode = ref<'list' | 'grid'>('list')
const results = ref<TransactionConnection | null>(null)
const loading = ref(false)
const lastCursor = ref<string | undefined>()
const audioStates = ref(new Map<string, AudioState>())
const currentlyPlaying = ref<string | null>(null)

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

// Search functionality - similar to video/image search
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
    
    if (parts.length === 0 && searchQuery.value.trim().includes(':')) {
      parts.push(searchQuery.value.trim())
    }
    
    for (const part of parts) {
      const [key, ...valueParts] = part.split(':')
      const value = valueParts.join(':').replace(/"/g, '')
      
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
          
        case 'tags':
          if (value.includes('=')) {
            const [tagName, tagValue] = value.split('=', 2)
            if (!options.tags) options.tags = []
            options.tags.push({ name: tagName, values: [tagValue] })
            chips.push({
              id: chipId,
              type: 'tags',
              label: `${tagName}: ${tagValue}`,
              value: { name: tagName, value: tagValue }
            })
          }
          break
          
        case 'first':
        case 'limit':
          const limit = parseInt(value)
          if (!isNaN(limit) && limit > 0) {
            options.first = Math.min(limit, 100)
            chips.push({
              id: chipId,
              type: 'first',
              label: `Limit: ${options.first}`,
              value: options.first
            })
          }
          break
          
        case 'block':
        case 'height':
          if (value.includes('-')) {
            const [min, max] = value.split('-').map(v => parseInt(v.trim()))
            if (!isNaN(min) && !isNaN(max)) {
              options.block = { min, max }
              chips.push({
                id: chipId,
                type: 'block',
                label: `Block: ${min}-${max}`,
                value: { min, max }
              })
            }
          } else {
            const blockHeight = parseInt(value)
            if (!isNaN(blockHeight)) {
              options.block = { min: blockHeight }
              chips.push({
                id: chipId,
                type: 'block',
                label: `Block: ${blockHeight}+`,
                value: { min: blockHeight }
              })
            }
          }
          break
      }
    }
    
    searchChips.value = chips
    parsedOptions.value = options
  } catch (err) {
    error.value = `Failed to parse query: ${err}`
    console.error('Query parsing error:', err)
  }
}

// Event handlers
function handleInput() {
  parseQuery()
}

function handleEnter() {
  if (hasValidQuery.value) {
    executeSearch()
  }
}

function handleSpace() {
  parseQuery()
}

async function executeSearch() {
  if (!hasValidQuery.value) {
    error.value = 'Please enter a search query'
    return
  }
  
  loading.value = true
  error.value = null
  lastCursor.value = undefined
  failedAudio.value.clear()
  audioStates.value.clear()
  stopAllAudio()
  
  try {
    results.value = await getTransactions(parsedOptions.value)
    
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

async function loadMore() {
  if (!hasValidQuery.value || !lastCursor.value || !results.value) return
  
  loading.value = true
  error.value = null
  
  try {
    const moreResults = await getTransactions({
      ...parsedOptions.value,
      after: lastCursor.value
    })
    
    results.value.edges.push(...moreResults.edges)
    results.value.pageInfo = moreResults.pageInfo
    
    if (moreResults.edges.length > 0) {
      lastCursor.value = moreResults.edges[moreResults.edges.length - 1].cursor
    }
  } catch (err) {
    error.value = err instanceof Error ? err.message : String(err)
  } finally {
    loading.value = false
  }
}

function removeChip(chipId: string) {
  searchChips.value = searchChips.value.filter(chip => chip.id !== chipId)
  rebuildQuery()
}

function clearAllChips() {
  searchChips.value = []
  searchQuery.value = ''
  parsedOptions.value = {}
}

function rebuildQuery() {
  const queryParts: string[] = []
  
  searchChips.value.forEach(chip => {
    switch (chip.type) {
      case 'owners':
        queryParts.push(`owner:${chip.value.join(',')}`)
        break
      case 'recipients':
        queryParts.push(`recipient:${chip.value.join(',')}`)
        break
      case 'tags':
        queryParts.push(`tags:${chip.value.name}=${chip.value.value}`)
        break
      case 'first':
        queryParts.push(`first:${chip.value}`)
        break
      case 'block':
        if (chip.value.max) {
          queryParts.push(`block:${chip.value.min}-${chip.value.max}`)
        } else {
          queryParts.push(`block:${chip.value.min}`)
        }
        break
    }
  })
  
  searchQuery.value = queryParts.join(' ')
  parseQuery()
}

// Audio handling
function isAudioTransaction(transaction: any): boolean {
  const contentType = getContentType(transaction)
  return contentType.startsWith('audio/')
}

function getContentType(transaction: any): string {
  const contentTypeTag = transaction.tags.find((tag: any) => 
    tag.name.toLowerCase() === 'content-type'
  )
  return contentTypeTag?.value || 'unknown'
}

function getAudioUrl(transactionId: string): string {
  return `https://arweave.net/${transactionId}`
}

function getTitle(transaction: any): string {
  const titleTag = transaction.tags.find((tag: any) => 
    ['title', 'name', 'track-name'].includes(tag.name.toLowerCase())
  )
  return titleTag?.value || `Audio ${transaction.id.substring(0, 8)}`
}

function getArtist(transaction: any): string {
  const artistTag = transaction.tags.find((tag: any) => 
    ['artist', 'creator', 'author'].includes(tag.name.toLowerCase())
  )
  return artistTag?.value || 'Unknown Artist'
}

function getAlbum(transaction: any): string {
  const albumTag = transaction.tags.find((tag: any) => 
    ['album', 'collection'].includes(tag.name.toLowerCase())
  )
  return albumTag?.value || ''
}

function getArtworkUrl(transaction: any): string {
  const artworkTag = transaction.tags.find((tag: any) => 
    ['artwork', 'cover', 'thumbnail', 'poster'].includes(tag.name.toLowerCase())
  )
  return artworkTag?.value ? `https://arweave.net/${artworkTag.value}` : ''
}

// Audio player controls
function togglePlayPause(transactionId: string) {
  const audioElement = document.querySelector(`audio[src*="${transactionId}"]`) as HTMLAudioElement
  if (!audioElement) return

  if (currentlyPlaying.value && currentlyPlaying.value !== transactionId) {
    stopAllAudio()
  }

  const state = audioStates.value.get(transactionId) || { duration: 0, currentTime: 0, isPlaying: false }
  
  if (state.isPlaying) {
    audioElement.pause()
    state.isPlaying = false
    currentlyPlaying.value = null
  } else {
    audioElement.play()
    state.isPlaying = true
    currentlyPlaying.value = transactionId
  }
  
  audioStates.value.set(transactionId, state)
}

function stopAllAudio() {
  document.querySelectorAll('audio').forEach(audio => {
    audio.pause()
    audio.currentTime = 0
  })
  
  audioStates.value.forEach(state => {
    state.isPlaying = false
    state.currentTime = 0
  })
  
  currentlyPlaying.value = null
}

function isPlaying(transactionId: string): boolean {
  return audioStates.value.get(transactionId)?.isPlaying || false
}

function getProgress(transactionId: string): number {
  const state = audioStates.value.get(transactionId)
  if (!state || state.duration === 0) return 0
  return (state.currentTime / state.duration) * 100
}

function setProgress(transactionId: string, event: Event) {
  const input = event.target as HTMLInputElement
  const audioElement = document.querySelector(`audio[src*="${transactionId}"]`) as HTMLAudioElement
  const state = audioStates.value.get(transactionId)
  
  if (audioElement && state) {
    const newTime = (parseFloat(input.value) / 100) * state.duration
    audioElement.currentTime = newTime
    state.currentTime = newTime
    audioStates.value.set(transactionId, state)
  }
}

function getCurrentTime(transactionId: string): number {
  return audioStates.value.get(transactionId)?.currentTime || 0
}

function getDuration(transactionId: string): number {
  return audioStates.value.get(transactionId)?.duration || 0
}

// Audio event handlers
function handleAudioLoad(transactionId: string, event: Event) {
  const audio = event.target as HTMLAudioElement
  const state = audioStates.value.get(transactionId) || { duration: 0, currentTime: 0, isPlaying: false }
  state.duration = audio.duration
  audioStates.value.set(transactionId, state)
}

function handleTimeUpdate(transactionId: string, event: Event) {
  const audio = event.target as HTMLAudioElement
  const state = audioStates.value.get(transactionId)
  if (state) {
    state.currentTime = audio.currentTime
    audioStates.value.set(transactionId, state)
  }
}

function handleAudioEnded(transactionId: string) {
  const state = audioStates.value.get(transactionId)
  if (state) {
    state.isPlaying = false
    state.currentTime = 0
    audioStates.value.set(transactionId, state)
  }
  currentlyPlaying.value = null
}

function handleAudioError(event: Event) {
  const audio = event.target as HTMLAudioElement
  const transactionId = audio.src.split('/').pop()
  if (transactionId) {
    failedAudio.value.add(transactionId)
  }
}

function handleArtworkError() {
  // Just let the default artwork show
}

// Utility functions
function formatTime(seconds: number): string {
  if (!seconds || isNaN(seconds)) return '0:00'
  const mins = Math.floor(seconds / 60)
  const secs = Math.floor(seconds % 60)
  return `${mins}:${secs.toString().padStart(2, '0')}`
}

function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i]
}

function getRelevantTags(transaction: any) {
  return transaction.tags.filter((tag: any) => 
    ['Genre', 'Year', 'Duration', 'Bitrate', 'App-Name'].includes(tag.name)
  ).slice(0, 3)
}

// Action functions
function openInNewTab(transactionId: string) {
  window.open(getAudioUrl(transactionId), '_blank')
}

function copyAudioUrl(transactionId: string) {
  navigator.clipboard.writeText(getAudioUrl(transactionId))
    .then(() => {
      console.log('Audio URL copied to clipboard')
    })
    .catch(err => {
      console.error('Failed to copy URL:', err)
    })
}

function downloadAudio(transactionId: string) {
  const url = getAudioUrl(transactionId)
  const a = document.createElement('a')
  a.href = url
  a.download = `audio-${transactionId}`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
}

// Expose methods for parent component
function setSearchQuery(query: string) {
  searchQuery.value = query
  parseQuery()
}

defineExpose({
  setSearchQuery
})

// Auto-search for audio on mount
onMounted(() => {
  setSearchQuery('tags:Content-Type=audio/mpeg first:20')
  executeSearch()
})

// Cleanup on unmount
onUnmounted(() => {
  stopAllAudio()
})
</script>

<style scoped>
.audio-search {
  max-width: 1400px;
  margin: 0 auto;
}

.search-input-container {
  display: flex;
  gap: 1rem;
  margin-bottom: 1rem;
}

.search-input {
  flex: 1;
  padding: 0.75rem 1rem;
  border: 1px solid #d1d5db;
  border-radius: 0.5rem;
  font-size: 1rem;
  font-family: inherit;
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

/* Search chips styles (similar to other search pages) */
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
  background: #eff6ff;
  border: 1px solid #bfdbfe;
  border-radius: 1rem;
  padding: 0.25rem 0.75rem;
  font-size: 0.875rem;
}

.chip-label {
  margin-right: 0.5rem;
}

.chip-remove {
  background: none;
  border: none;
  font-size: 1.25rem;
  cursor: pointer;
  color: #6b7280;
  padding: 0;
  width: 1.5rem;
  height: 1.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
}

.clear-all-chips {
  background: #fef2f2;
  border: 1px solid #fecaca;
  border-radius: 0.25rem;
  padding: 0.25rem 0.5rem;
  font-size: 0.875rem;
  color: #dc2626;
  cursor: pointer;
}

.query-hints {
  margin-bottom: 1.5rem;
}

.hint-section h4 {
  font-size: 1rem;
  font-weight: 600;
  margin-bottom: 0.5rem;
  color: #374151;
}

.examples {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.cursor-pointer {
  cursor: pointer;
  padding: 0.25rem 0.5rem;
  border-radius: 0.25rem;
  background: #f3f4f6;
  transition: background-color 0.2s;
  font-size: 0.875rem;
}

.cursor-pointer:hover {
  background: #e5e7eb;
}

.error-message {
  background: #fef2f2;
  border: 1px solid #fecaca;
  border-radius: 0.5rem;
  padding: 1rem;
  margin-bottom: 1rem;
  color: #dc2626;
}

/* Results section */
.results-section {
  margin-top: 2rem;
}

.results-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}

.results-header h3 {
  margin: 0;
  color: #374151;
}

.view-controls {
  display: flex;
  gap: 0.25rem;
  border: 1px solid #d1d5db;
  border-radius: 0.375rem;
  padding: 0.25rem;
}

.view-mode-btn {
  background: none;
  border: none;
  padding: 0.375rem 0.75rem;
  cursor: pointer;
  border-radius: 0.25rem;
  transition: background-color 0.2s;
}

.view-mode-btn:hover {
  background: #f3f4f6;
}

.view-mode-btn.active {
  background: #3b82f6;
  color: white;
}

/* Audio container */
.audio-container.list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.audio-container.grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(400px, 1fr));
  gap: 1rem;
}

.audio-item {
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 0.5rem;
  padding: 1rem;
  box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1);
  transition: transform 0.2s, box-shadow 0.2s;
}

.audio-item:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
}

.audio-player-section {
  display: flex;
  gap: 1rem;
  margin-bottom: 1rem;
}

.audio-artwork {
  width: 64px;
  height: 64px;
  border-radius: 0.5rem;
  overflow: hidden;
  background: #f3f4f6;
  flex-shrink: 0;
}

.artwork-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.default-artwork {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2rem;
  color: #9ca3af;
}

.audio-controls {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.play-pause-btn {
  background: #3b82f6;
  color: white;
  border: none;
  border-radius: 50%;
  width: 3rem;
  height: 3rem;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.2rem;
  cursor: pointer;
  transition: background-color 0.2s, transform 0.1s;
  align-self: flex-start;
}

.play-pause-btn:hover {
  background: #2563eb;
}

.play-pause-btn.playing {
  background: #dc2626;
}

.play-pause-btn.playing:hover {
  background: #b91c1c;
}

.progress-section {
  flex: 1;
}

.progress-slider {
  width: 100%;
  height: 4px;
  border-radius: 2px;
  background: #e5e7eb;
  outline: none;
  cursor: pointer;
  margin-bottom: 0.5rem;
}

.progress-slider::-webkit-slider-thumb {
  appearance: none;
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background: #3b82f6;
  cursor: pointer;
}

.progress-slider::-moz-range-thumb {
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background: #3b82f6;
  cursor: pointer;
  border: none;
}

.time-display {
  display: flex;
  justify-content: space-between;
  font-size: 0.75rem;
  color: #6b7280;
  font-family: monospace;
}

.audio-info {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.audio-meta h4 {
  margin: 0;
  font-size: 1.125rem;
  font-weight: 600;
  color: #1f2937;
}

.audio-meta p {
  margin: 0;
  color: #6b7280;
  font-size: 0.875rem;
}

.audio-artist {
  font-weight: 500;
}

.audio-details {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
}

.audio-type,
.audio-size,
.transaction-id {
  background: #f3f4f6;
  padding: 0.125rem 0.375rem;
  border-radius: 0.25rem;
  font-size: 0.75rem;
  color: #374151;
}

.audio-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 0.25rem;
}

.tag {
  background: #eff6ff;
  border: 1px solid #bfdbfe;
  padding: 0.125rem 0.375rem;
  border-radius: 0.25rem;
  font-size: 0.75rem;
  color: #1e40af;
}

.audio-actions {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.action-btn {
  background: #f3f4f6;
  border: 1px solid #d1d5db;
  border-radius: 0.375rem;
  padding: 0.375rem 0.75rem;
  font-size: 0.875rem;
  cursor: pointer;
  transition: background-color 0.2s;
}

.action-btn:hover {
  background: #e5e7eb;
}

.no-audio-message,
.no-results-message {
  text-align: center;
  padding: 3rem 1rem;
  color: #6b7280;
}

.suggested-searches {
  margin-top: 1rem;
  display: flex;
  gap: 0.5rem;
  justify-content: center;
  flex-wrap: wrap;
}

.pagination {
  display: flex;
  justify-content: center;
  margin-top: 2rem;
}

.load-more-button {
  padding: 0.75rem 1.5rem;
  background: #3b82f6;
  color: white;
  border: none;
  border-radius: 0.5rem;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.2s;
}

.load-more-button:hover:not(:disabled) {
  background: #2563eb;
}

.load-more-button:disabled {
  background: #9ca3af;
  cursor: not-allowed;
}

/* Mobile responsive */
@media (max-width: 768px) {
  .audio-container.grid {
    grid-template-columns: 1fr;
  }
  
  .audio-player-section {
    flex-direction: column;
    gap: 0.75rem;
  }
  
  .audio-artwork {
    width: 48px;
    height: 48px;
    align-self: center;
  }
  
  .results-header {
    flex-direction: column;
    gap: 1rem;
    align-items: stretch;
  }
}
</style>