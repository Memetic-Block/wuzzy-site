<template>
  <div class="video-search">
    <div class="search-input-container">
      <input
        v-model="searchQuery"
        @input="handleInput"
        @keydown.enter="handleEnter"
        @keydown.space="handleSpace"
        placeholder="Search videos with 'tags:Content-Type=video/mp4 first:20' or 'owner:address tags:Content-Type=video/webm'"
        class="search-input"
      />
      <button 
        @click="executeSearch"
        :disabled="loading || !hasValidQuery"
        class="search-button"
      >
        {{ loading ? 'Searching...' : 'Search Videos' }}
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
        <h4>Quick Video Search:</h4>
        <div class="examples">
          <code class="cursor-pointer" @click="setSearchQuery('tags:Content-Type=video/mp4 first:20')">MP4 Videos</code>
          <code class="cursor-pointer" @click="setSearchQuery('tags:Content-Type=video/webm first:15')">WebM Videos</code>
          <code class="cursor-pointer" @click="setSearchQuery('tags:Type=video first:24')">All Videos</code>
          <code class="cursor-pointer" @click="setSearchQuery('tags:Category=entertainment first:20')">Entertainment</code>
        </div>
      </div>
    </div>

    <!-- Error Display -->
    <div v-if="error" class="error-message">
      <strong>Error:</strong> {{ error }}
    </div>

    <!-- Results Display -->
    <div v-if="results && videoTransactions.length > 0" class="results-section">
      <div class="results-header">
        <h3>Found {{ videoTransactions.length }} Videos</h3>
        <div class="view-controls">
          <button 
            @click="gridSize = 'small'" 
            :class="{ active: gridSize === 'small' }"
            class="grid-size-btn"
            title="Small grid"
          >
            ▦
          </button>
          <button 
            @click="gridSize = 'medium'" 
            :class="{ active: gridSize === 'medium' }"
            class="grid-size-btn"
            title="Medium grid"
          >
            ⬜
          </button>
          <button 
            @click="gridSize = 'large'" 
            :class="{ active: gridSize === 'large' }"
            class="grid-size-btn"
            title="Large grid"
          >
            ⬛
          </button>
        </div>
      </div>
      
      <div class="video-grid" :class="`grid-${gridSize}`">
        <div 
          v-for="transaction in videoTransactions" 
          :key="transaction.id"
          class="video-item"
          @click="openVideoModal(transaction)"
        >
          <div class="video-wrapper">
            <video 
              :src="getVideoUrl(transaction.id)"
              :poster="getVideoPoster(transaction)"
              class="grid-video"
              @error="handleVideoError"
              @loadedmetadata="handleVideoLoad"
              preload="metadata"
              muted
            >
              Your browser does not support the video tag.
            </video>
            <div class="video-overlay">
              <div class="play-button" @click.stop="playVideo(transaction.id)">
                ▶
              </div>
              <div class="video-info">
                <span class="video-type">{{ getContentType(transaction) }}</span>
                <span class="video-size">{{ formatFileSize(parseInt(transaction.data.size)) }}</span>
                <span class="video-duration">{{ getVideoDuration(transaction.id) }}</span>
              </div>
              <div class="video-actions">
                <button 
                  @click.stop="openInNewTab(transaction.id)"
                  class="action-btn"
                  title="Open in new tab"
                >
                  🔗
                </button>
                <button 
                  @click.stop="copyVideoUrl(transaction.id)"
                  class="action-btn"
                  title="Copy video URL"
                >
                  📋
                </button>
              </div>
            </div>
          </div>
          <div class="video-meta">
            <div class="transaction-id-full">
              <span class="transaction-label">ID:</span>
              <button 
                @click.stop="copyTransactionId(transaction.id)"
                class="transaction-id-btn"
                :title="`Click to copy: ${transaction.id}`"
              >
                {{ transaction.id }}
                <span class="copy-icon">📋</span>
              </button>
            </div>
            <div class="video-tags">
              <span 
                v-for="tag in getRelevantTags(transaction)" 
                :key="tag.name"
                class="tag"
              >
                {{ tag.name }}: {{ tag.value }}
              </span>
            </div>
          </div>
        </div>
      </div>

      <!-- No videos found in results -->
      <div v-if="results && results.edges.length > 0 && videoTransactions.length === 0" class="no-videos-message">
        <p>No video transactions found in the current results. Try searching with video-specific filters:</p>
        <div class="suggested-searches">
          <code class="cursor-pointer" @click="setSearchQuery('tags:Content-Type=video/mp4 first:20')">tags:Content-Type=video/mp4 first:20</code>
          <code class="cursor-pointer" @click="setSearchQuery('tags:Content-Type=video/webm first:15')">tags:Content-Type=video/webm first:15</code>
        </div>
      </div>

      <!-- Pagination -->
      <div v-if="results.pageInfo.hasNextPage" class="pagination">
        <button 
          @click="loadMore"
          :disabled="loading"
          class="load-more-button"
        >
          {{ loading ? 'Loading More Videos...' : 'Load More Videos' }}
        </button>
      </div>
    </div>

    <!-- No results message -->
    <div v-if="results && results.edges.length === 0" class="no-results-message">
      <p>No transactions found matching your search criteria.</p>
    </div>

    <!-- Video Modal -->
    <div v-if="selectedVideo" class="video-modal" @click="closeVideoModal">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h3>Video Details</h3>
          <button @click="closeVideoModal" class="close-btn">×</button>
        </div>
        <div class="modal-body">
          <video 
            :src="getVideoUrl(selectedVideo.id)" 
            class="modal-video"
            controls
            autoplay
          >
            Your browser does not support the video tag.
          </video>
          <div class="modal-details">
            <div class="detail-row">
              <strong>Transaction ID:</strong>
              <code class="transaction-id-full">{{ selectedVideo.id }}</code>
            </div>
            <div class="detail-row">
              <strong>Size:</strong>
              {{ formatFileSize(parseInt(selectedVideo.data.size)) }}
            </div>
            <div class="detail-row">
              <strong>Type:</strong>
              {{ getContentType(selectedVideo) }}
            </div>
            <div class="detail-row">
              <strong>Owner:</strong>
              <code>{{ selectedVideo.owner.address }}</code>
            </div>
            <div class="detail-row">
              <strong>Block:</strong>
              {{ selectedVideo.block.height }}
            </div>
            <div v-if="selectedVideo.tags.length > 0" class="detail-row">
              <strong>Tags:</strong>
              <div class="modal-tags">
                <span 
                  v-for="tag in selectedVideo.tags" 
                  :key="tag.name"
                  class="modal-tag"
                >
                  {{ tag.name }}: {{ tag.value }}
                </span>
              </div>
            </div>
            <div class="modal-actions">
              <a 
                :href="getVideoUrl(selectedVideo.id)" 
                target="_blank" 
                class="modal-action-btn primary"
              >
                Open Video
              </a>
              <button 
                @click="copyVideoUrl(selectedVideo.id)" 
                class="modal-action-btn secondary"
              >
                Copy URL
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useGraphQL, type TransactionQueryOptions, type TransactionConnection } from '../composables/gql'

interface SearchChip {
  id: string
  type: string
  label: string
  value: any
}

// Component state
const searchQuery = ref('')
const searchChips = ref<SearchChip[]>([])
const parsedOptions = ref<TransactionQueryOptions>({})
const error = ref<string | null>(null)
const failedVideos = ref(new Set<string>())
const gridSize = ref<'small' | 'medium' | 'large'>('medium')
const selectedVideo = ref<any>(null)
const results = ref<TransactionConnection | null>(null)
const loading = ref(false)
const lastCursor = ref<string | undefined>()
const videoDurations = ref(new Map<string, string>())

// GraphQL composable
const { getTransactions } = useGraphQL()

// Computed properties
const hasValidQuery = computed(() => {
  return searchChips.value.length > 0 || Object.keys(parsedOptions.value).length > 0
})

const videoTransactions = computed(() => {
  if (!results.value) return []
  
  return results.value.edges
    .map((edge: any) => edge.node)
    .filter((transaction: any) => isVideoTransaction(transaction) && !failedVideos.value.has(transaction.id))
})

// Search functionality
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
  failedVideos.value.clear()
  
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

// Video handling
function isVideoTransaction(transaction: any): boolean {
  const contentType = getContentType(transaction)
  return contentType.startsWith('video/')
}

function getContentType(transaction: any): string {
  const contentTypeTag = transaction.tags.find((tag: any) => 
    tag.name.toLowerCase() === 'content-type'
  )
  return contentTypeTag?.value || 'unknown'
}

function getVideoUrl(transactionId: string): string {
  return `https://arweave.net/${transactionId}`
}

function getVideoPoster(transaction: any): string {
  // Try to find a poster/thumbnail tag
  const posterTag = transaction.tags.find((tag: any) => 
    tag.name.toLowerCase() === 'poster' || tag.name.toLowerCase() === 'thumbnail'
  )
  return posterTag?.value ? `https://arweave.net/${posterTag.value}` : ''
}

function handleVideoError(event: Event) {
  const video = event.target as HTMLVideoElement
  const transactionId = video.src.split('/').pop()
  if (transactionId) {
    failedVideos.value.add(transactionId)
  }
}

function handleVideoLoad(event: Event) {
  const video = event.target as HTMLVideoElement
  const transactionId = video.src.split('/').pop()
  if (transactionId && video.duration) {
    const duration = formatDuration(video.duration)
    videoDurations.value.set(transactionId, duration)
  }
}

function formatDuration(seconds: number): string {
  const mins = Math.floor(seconds / 60)
  const secs = Math.floor(seconds % 60)
  return `${mins}:${secs.toString().padStart(2, '0')}`
}

function getVideoDuration(transactionId: string): string {
  return videoDurations.value.get(transactionId) || ''
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
    ['App-Name', 'Type', 'Title', 'Description', 'Category'].includes(tag.name)
  ).slice(0, 2)
}

// Video controls
function playVideo(transactionId: string) {
  const videoElement = document.querySelector(`video[src*="${transactionId}"]`) as HTMLVideoElement
  if (videoElement) {
    if (videoElement.paused) {
      videoElement.play()
    } else {
      videoElement.pause()
    }
  }
}

// Modal functions
function openVideoModal(transaction: any) {
  selectedVideo.value = transaction
}

function closeVideoModal() {
  selectedVideo.value = null
}

function openInNewTab(transactionId: string) {
  window.open(getVideoUrl(transactionId), '_blank')
}

function copyVideoUrl(transactionId: string) {
  navigator.clipboard.writeText(getVideoUrl(transactionId))
    .then(() => {
      console.log('Video URL copied to clipboard')
    })
    .catch(err => {
      console.error('Failed to copy URL:', err)
    })
}

function copyTransactionId(transactionId: string) {
  navigator.clipboard.writeText(transactionId).then(() => {
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

// Expose methods for parent component
function setSearchQuery(query: string) {
  searchQuery.value = query
  parseQuery()
}

defineExpose({
  setSearchQuery
})

// Auto-search for videos on mount
onMounted(() => {
  // Set default search for recent videos
  setSearchQuery('tags:Content-Type=video/mp4 first:20')
  executeSearch()
})
</script>

<style scoped>
.video-search {
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

.grid-size-btn {
  background: none;
  border: none;
  padding: 0.375rem;
  cursor: pointer;
  border-radius: 0.25rem;
  transition: background-color 0.2s;
}

.grid-size-btn:hover {
  background: #f3f4f6;
}

.grid-size-btn.active {
  background: #3b82f6;
  color: white;
}

.video-grid {
  display: grid;
  gap: 1rem;
}

.grid-small {
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
}

.grid-medium {
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
}

.grid-large {
  grid-template-columns: repeat(auto-fill, minmax(360px, 1fr));
}

.video-item {
  cursor: pointer;
  border-radius: 0.5rem;
  overflow: hidden;
  background: white;
  box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1);
  transition: transform 0.2s, box-shadow 0.2s;
}

.video-item:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
}

.video-wrapper {
  position: relative;
  aspect-ratio: 16/9;
  overflow: hidden;
  background: #000;
}

.grid-video {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.video-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(to bottom, rgba(0,0,0,0.7) 0%, transparent 30%, transparent 70%, rgba(0,0,0,0.7) 100%);
  opacity: 0;
  transition: opacity 0.3s;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  align-items: center;
  padding: 0.5rem;
}

.video-item:hover .video-overlay {
  opacity: 1;
}

.play-button {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background: rgba(0, 0, 0, 0.8);
  color: white;
  border-radius: 50%;
  width: 3rem;
  height: 3rem;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.2rem;
  cursor: pointer;
  transition: transform 0.2s;
}

.play-button:hover {
  transform: translate(-50%, -50%) scale(1.1);
}

.video-info {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  align-self: flex-start;
}

.video-type,
.video-size,
.video-duration {
  background: rgba(0, 0, 0, 0.8);
  color: white;
  padding: 0.125rem 0.375rem;
  border-radius: 0.25rem;
  font-size: 0.75rem;
  width: fit-content;
}

.video-actions {
  display: flex;
  gap: 0.5rem;
  align-self: flex-end;
}

.action-btn {
  background: rgba(0, 0, 0, 0.8);
  color: white;
  border: none;
  border-radius: 0.25rem;
  padding: 0.375rem;
  cursor: pointer;
  font-size: 0.875rem;
  transition: background-color 0.2s;
}

.action-btn:hover {
  background: rgba(0, 0, 0, 0.9);
}

.video-meta {
  padding: 0.75rem;
}

.transaction-id {
  font-family: monospace;
  font-size: 0.75rem;
  color: #6b7280;
  margin-bottom: 0.25rem;
}

.transaction-id-full {
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

.transaction-id-btn {
  background: #f3f4f6;
  border: 1px solid #d1d5db;
  border-radius: 0.375rem;
  padding: 0.25rem 0.5rem;
  font-family: 'Courier New', monospace;
  font-size: 0.625rem;
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

.transaction-id-btn:hover {
  background: #e5e7eb;
  border-color: #9ca3af;
}

.copy-icon {
  flex-shrink: 0;
  opacity: 0.6;
  font-size: 0.625rem;
}

.transaction-id-btn:hover .copy-icon {
  opacity: 1;
}

.video-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 0.25rem;
}

.tag {
  background: #f3f4f6;
  padding: 0.125rem 0.375rem;
  border-radius: 0.25rem;
  font-size: 0.75rem;
  color: #374151;
}

.no-videos-message,
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

/* Video Modal Styles */
.video-modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.9);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 1rem;
}

.modal-content {
  background: white;
  border-radius: 0.5rem;
  max-width: 90vw;
  max-height: 90vh;
  overflow: auto;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  border-bottom: 1px solid #e5e7eb;
}

.modal-header h3 {
  margin: 0;
}

.close-btn {
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  padding: 0.25rem;
  color: #6b7280;
}

.modal-body {
  padding: 1rem;
  display: flex;
  gap: 1rem;
  flex-direction: column;
}

.modal-video {
  max-width: 100%;
  max-height: 60vh;
  border-radius: 0.25rem;
}

.modal-details {
  min-width: 300px;
}

.detail-row {
  margin-bottom: 0.75rem;
}

.detail-row strong {
  display: block;
  margin-bottom: 0.25rem;
  color: #374151;
}

.transaction-id-full {
  font-family: monospace;
  font-size: 0.875rem;
  background: #f3f4f6;
  padding: 0.25rem 0.5rem;
  border-radius: 0.25rem;
  word-break: break-all;
}

.modal-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 0.25rem;
}

.modal-tag {
  background: #f3f4f6;
  padding: 0.25rem 0.5rem;
  border-radius: 0.25rem;
  font-size: 0.875rem;
}

.modal-actions {
  display: flex;
  gap: 0.5rem;
  margin-top: 1rem;
}

.modal-action-btn {
  padding: 0.5rem 1rem;
  border-radius: 0.375rem;
  font-weight: 500;
  cursor: pointer;
  text-decoration: none;
  border: none;
}

.modal-action-btn.primary {
  background: #3b82f6;
  color: white;
}

.modal-action-btn.secondary {
  background: #f3f4f6;
  color: #374151;
}

.modal-action-btn:hover {
  opacity: 0.9;
}

/* Responsive adjustments */
@media (min-width: 768px) {
  .modal-body {
    flex-direction: row;
  }
  
  .modal-video {
    max-height: 70vh;
  }
}
</style>