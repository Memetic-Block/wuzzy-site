<template>
  <div class="max-w-7xl mx-auto px-4 py-8">
    <div class="image-search">
      <!-- Simple Search Input -->
      <div class="search-input-wrapper">
        <div class="search-input-container">
          <input 
            type="text" 
            v-model="searchQuery"
            placeholder="Search for images..."
            @keydown.enter="handleSearch"
            class="search-input"
          />
          <button 
            @click="handleSearch"
            :disabled="!searchQuery.trim()"
            class="search-button"
          >
            Search
          </button>
        </div>
      </div>

      <!-- Format Filter Radio Buttons -->
      <div class="format-filter">
        <span class="filter-label">Format:</span>
        <label class="radio-option">
          <input 
            type="radio" 
            name="imageFormat" 
            value="image/*" 
            :checked="selectedFormat === 'image/*'"
            @change="onFormatChange"
          />
          <span>All</span>
        </label>
        <label class="radio-option">
          <input 
            type="radio" 
            name="imageFormat" 
            value="image/png" 
            :checked="selectedFormat === 'image/png'"
            @change="onFormatChange"
          />
          <span>PNG</span>
        </label>
        <label class="radio-option">
          <input 
            type="radio" 
            name="imageFormat" 
            value="image/jpeg" 
            :checked="selectedFormat === 'image/jpeg'"
            @change="onFormatChange"
          />
          <span>JPEG</span>
        </label>
        <label class="radio-option">
          <input 
            type="radio" 
            name="imageFormat" 
            value="image/gif" 
            :checked="selectedFormat === 'image/gif'"
            @change="onFormatChange"
          />
          <span>GIF</span>
        </label>
        <label class="radio-option">
          <input 
            type="radio" 
            name="imageFormat" 
            value="image/svg+xml" 
            :checked="selectedFormat === 'image/svg+xml'"
            @change="onFormatChange"
          />
          <span>SVG</span>
        </label>
      </div>

      <!-- Error Display -->
      <div v-if="error" class="error-message">
        <strong>Error:</strong> {{ error }}
      </div>

      <!-- Results Display -->
      <div v-if="results && imageTransactions.length > 0" class="results-section">
        <div class="results-header">
          <h3>Found {{ imageTransactions.length }}{{ results.pageInfo.hasNextPage ? '+' : '' }} Images</h3>
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
        
        <div class="image-grid" :class="`grid-${gridSize}`">
          <div 
            v-for="transaction in imageTransactions" 
            :key="transaction.id"
            class="image-item"
            @click="openImageModal(transaction)"
          >
            <div class="image-wrapper">
              <img 
                :src="getImageUrl(transaction.id)"
                :alt="`Image ${transaction.id}`"
                class="grid-image"
                @error="handleImageError"
                @load="handleImageLoad"
                loading="lazy"
              />
              <div class="image-overlay">
                <div class="image-info">
                  <span class="image-type">{{ getContentType(transaction) }}</span>
                  <span class="image-size">{{ formatFileSize(parseInt(transaction.data.size)) }}</span>
                </div>
                <div class="image-actions">
                  <button 
                    @click.stop="openInNewTab(transaction.id)"
                    class="action-btn"
                    title="Open in new tab"
                  >
                    🔗
                  </button>
                  <button 
                    @click.stop="copyImageUrl(transaction.id)"
                    class="action-btn"
                    title="Copy image URL"
                  >
                    📋
                  </button>
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
            {{ loading ? 'Loading More Images...' : 'Load More Images' }}
          </button>
        </div>
      </div>

      <!-- No results message -->
      <div v-if="results && results.edges.length === 0" class="no-results-message">
        <p>No transactions found matching your search criteria.</p>
      </div>

      <!-- Image Modal -->
      <div v-if="selectedImage" class="image-modal" @click="closeImageModal">
        <div class="modal-content" @click.stop>
          <div class="modal-header">
            <h3>Image Details</h3>
            <button @click="closeImageModal" class="close-btn">×</button>
          </div>
          <div class="modal-body">
            <img 
              :src="getImageUrl(selectedImage.id)" 
              :alt="`Image ${selectedImage.id}`"
              class="modal-image"
            />
            <div class="modal-details">
              <div class="detail-row">
                <strong>Transaction ID:</strong>
                <code class="transaction-id-full">{{ selectedImage.id }}</code>
              </div>
              <div class="detail-row">
                <strong>Size:</strong>
                {{ formatFileSize(parseInt(selectedImage.data.size)) }}
              </div>
              <div class="detail-row">
                <strong>Type:</strong>
                {{ getContentType(selectedImage) }}
              </div>
              <div class="detail-row">
                <strong>Owner:</strong>
                <code>{{ selectedImage.owner.address }}</code>
              </div>
              <div class="detail-row">
                <strong>Block:</strong>
                {{ selectedImage.block.height }}
              </div>
              <div v-if="selectedImage.tags.length > 0" class="detail-row">
                <strong>Tags:</strong>
                <div class="modal-tags">
                  <span 
                    v-for="tag in selectedImage.tags" 
                    :key="tag.name"
                    class="modal-tag"
                  >
                    {{ tag.name }}: {{ tag.value }}
                  </span>
                </div>
              </div>
              <div class="modal-actions">
                <a 
                  :href="getImageUrl(selectedImage.id)" 
                  target="_blank" 
                  class="modal-action-btn primary"
                >
                  View Full Size
                </a>
                <button 
                  @click="copyImageUrl(selectedImage.id)" 
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
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useGraphQL, type TransactionConnection } from '../composables/gql'

const route = useRoute()
const router = useRouter()

// Component state
const searchQuery = ref<string>((route.query.q as string) || '')
const error = ref<string | null>(null)
const failedImages = ref(new Set<string>())
const gridSize = ref<'small' | 'medium' | 'large'>('medium')
const selectedImage = ref<any>(null)
const results = ref<TransactionConnection | null>(null)
const loading = ref(false)
const lastCursor = ref<string | undefined>()
const selectedFormat = ref<string>((route.query.format as string) || 'image/*')

// GraphQL composable
const { getTransactions } = useGraphQL()

// Handle format change
function onFormatChange(event: Event) {
  const target = event.target as HTMLInputElement
  selectedFormat.value = target.value
  
  // Update URL with format parameter
  router.replace({ 
    query: { 
      q: searchQuery.value,
      format: target.value 
    } 
  })
  
  // Re-run search with new format
  if (searchQuery.value.trim()) {
    executeSearch()
  }
}

// Handle search
function handleSearch() {
  if (!searchQuery.value.trim()) {
    console.warn('Search query is empty')
    return
  }
  
  // Update URL query with both query and format
  router.replace({ 
    query: { 
      q: searchQuery.value,
      format: selectedFormat.value
    } 
  })
  
  // Execute search
  executeSearch()
}

// Watch route query changes
watch(
  () => [route.query.q, route.query.format],
  ([newQuery, newFormat]) => {
    const query = (newQuery as string) || ''
    const format = (newFormat as string) || 'image/*'
    
    searchQuery.value = query
    selectedFormat.value = format
    
    if (!query.trim()) {
      // Clear results if query is empty
      results.value = null
      return
    }
    
    // Execute search
    executeSearch()
  },
  { immediate: true }
)

const imageTransactions = computed(() => {
  if (!results.value) return []
  
  return results.value.edges
    .map((edge: any) => edge.node)
    .filter((transaction: any) => isImageTransaction(transaction) && !failedImages.value.has(transaction.id))
})

// Search functionality
async function executeSearch() {
  const query = searchQuery.value.trim()
  
  if (!query) {
    error.value = 'Please enter a search query'
    return
  }
  
  loading.value = true
  error.value = null
  lastCursor.value = undefined
  failedImages.value.clear()
  
  try {
    // Build query options
    const queryOptions: any = {
      tags: []
    }
    
    // Add Content-Type filter based on selected format
    if (selectedFormat.value === 'image/*') {
      queryOptions.tags.push({
        name: 'Content-Type',
        values: ['image/*'],
        match: 'WILDCARD'
      })
    } else if (selectedFormat.value === 'image/jpeg') {
      // JPEG needs both variants
      queryOptions.tags.push({
        name: 'Content-Type',
        values: ['image/jpg', 'image/jpeg']
      })
    } else if (selectedFormat.value === 'image/svg+xml') {
      // SVG - exact match
      queryOptions.tags.push({
        name: 'Content-Type',
        values: ['image/svg+xml']
      })
    } else {
      // PNG or GIF - exact match
      queryOptions.tags.push({
        name: 'Content-Type',
        values: [selectedFormat.value]
      })
    }
    
    // Add user query as a single value-only tag with fuzzy match
    const words = query.split(/\s+/).filter(word => word.trim())
    if (words.length > 0) {
      queryOptions.tags.push({
        values: words,
        match: 'FUZZY_AND'
      })
    }
    
    console.log('ImageSearch executeSearch:', { query, selectedFormat: selectedFormat.value, queryOptions })
    
    results.value = await getTransactions(queryOptions)
    
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
  const query = searchQuery.value.trim()
  
  if (!query || !lastCursor.value || !results.value) return
  
  loading.value = true
  error.value = null
  
  try {
    // Build query options (same as executeSearch)
    const queryOptions: any = {
      tags: [],
      after: lastCursor.value
    }
    
    // Add Content-Type filter based on selected format
    if (selectedFormat.value === 'image/*') {
      queryOptions.tags.push({
        name: 'Content-Type',
        values: ['image/*'],
        match: 'WILDCARD'
      })
    } else if (selectedFormat.value === 'image/jpeg') {
      // JPEG needs both variants
      queryOptions.tags.push({
        name: 'Content-Type',
        values: ['image/jpg', 'image/jpeg']
      })
    } else if (selectedFormat.value === 'image/svg+xml') {
      // SVG - exact match
      queryOptions.tags.push({
        name: 'Content-Type',
        values: ['image/svg+xml']
      })
    } else {
      // PNG or GIF - exact match
      queryOptions.tags.push({
        name: 'Content-Type',
        values: [selectedFormat.value]
      })
    }
    
    // Add user query as a single value-only tag with fuzzy match
    const words = query.split(/\s+/).filter(word => word.trim())
    if (words.length > 0) {
      queryOptions.tags.push({
        values: words,
        match: 'FUZZY_AND'
      })
    }
    
    const moreResults = await getTransactions(queryOptions)
    
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

// Image handling
function isImageTransaction(transaction: any): boolean {
  const contentType = getContentType(transaction)
  return contentType.startsWith('image/')
}

function getContentType(transaction: any): string {
  const contentTypeTag = transaction.tags.find((tag: any) => 
    tag.name.toLowerCase() === 'content-type'
  )
  return contentTypeTag?.value || 'unknown'
}

function getImageUrl(transactionId: string): string {
  return `https://arweave.net/${transactionId}`
}

function handleImageError(event: Event) {
  const img = event.target as HTMLImageElement
  const transactionId = img.src.split('/').pop()
  if (transactionId) {
    failedImages.value.add(transactionId)
  }
}

function handleImageLoad(event: Event) {
  const img = event.target as HTMLImageElement
  console.log('Image loaded:', img.src)
}

function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i]
}

// Modal functions
function openImageModal(transaction: any) {
  selectedImage.value = transaction
}

function closeImageModal() {
  selectedImage.value = null
}

function openInNewTab(transactionId: string) {
  window.open(getImageUrl(transactionId), '_blank')
}

function copyImageUrl(transactionId: string) {
  navigator.clipboard.writeText(getImageUrl(transactionId))
    .then(() => {
      console.log('Image URL copied to clipboard')
    })
    .catch(err => {
      console.error('Failed to copy URL:', err)
    })
}
</script>

<style scoped>
.image-search {
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

.format-filter {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin: 1rem 0;
  padding: 0.75rem 1rem;
  background: #f9fafb;
  border: 1px solid #e5e7eb;
  border-radius: 0.375rem;
}

.filter-label {
  font-size: 0.875rem;
  font-weight: 600;
  color: #374151;
}

.radio-option {
  display: flex;
  align-items: center;
  gap: 0.375rem;
  cursor: pointer;
  font-size: 0.875rem;
  color: #4b5563;
  padding: 0.25rem 0.5rem;
  border-radius: 0.25rem;
  transition: background-color 0.15s;
}

.radio-option:hover {
  background: #f3f4f6;
}

.radio-option input[type="radio"] {
  cursor: pointer;
  width: 0.875rem;
  height: 0.875rem;
  margin: 0;
  accent-color: #3b82f6;
}

.radio-option span {
  font-weight: 500;
  user-select: none;
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

.image-grid {
  display: grid;
  gap: 1rem;
}

.grid-small {
  grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
}

.grid-medium {
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
}

.grid-large {
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
}

.image-item {
  cursor: pointer;
  border-radius: 0.5rem;
  overflow: hidden;
  background: white;
  box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1);
  transition: transform 0.2s, box-shadow 0.2s;
}

.image-item:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
}

.image-wrapper {
  position: relative;
  aspect-ratio: 1;
  overflow: hidden;
}

.grid-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s;
}

.image-item:hover .grid-image {
  transform: scale(1.05);
}

.image-overlay {
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
  padding: 0.5rem;
}

.image-item:hover .image-overlay {
  opacity: 1;
}

.image-info {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.image-type,
.image-size {
  background: rgba(0, 0, 0, 0.8);
  color: white;
  padding: 0.125rem 0.375rem;
  border-radius: 0.25rem;
  font-size: 0.75rem;
  width: fit-content;
}

.image-actions {
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

.no-results-message {
  text-align: center;
  padding: 3rem 1rem;
  color: #6b7280;
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

/* Image Modal Styles */
.image-modal {
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

.modal-image {
  max-width: 100%;
  max-height: 60vh;
  object-fit: contain;
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
  
  .modal-image {
    max-height: 70vh;
  }
}
</style>
