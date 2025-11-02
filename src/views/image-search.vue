<template>
  <div class="max-w-7xl mx-auto px-4 py-8">
    <!-- Simple Search Input -->
    <div class="mb-4">
      <div class="flex gap-4">
        <input 
          type="text" 
          v-model="searchQuery"
          placeholder="Search for images..."
          @keydown.enter="handleSearch"
          class="flex-1 px-4 py-3 border border-gray-300 rounded-lg text-base focus:outline-none focus:border-blue-500 focus:ring-3 focus:ring-blue-500/10"
        />
        <button 
          @click="handleSearch"
          :disabled="!searchQuery.trim()"
          class="px-6 py-3 bg-blue-500 text-white rounded-lg font-semibold cursor-pointer transition-colors hover:bg-blue-600 disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          Search
        </button>
      </div>
    </div>

    <!-- Format Filter Radio Buttons -->
    <div class="flex items-center gap-3 my-4 px-4 py-3 bg-gray-50 border border-gray-200 rounded-md">
      <span class="text-sm font-semibold text-gray-700">Format:</span>
      <label class="flex items-center gap-1.5 cursor-pointer text-sm text-gray-600 px-2 py-1 rounded transition-colors hover:bg-gray-100">
        <input 
          type="radio" 
          name="imageFormat" 
          value="image/*" 
          :checked="selectedFormat === 'image/*'"
          @change="onFormatChange"
          class="cursor-pointer w-3.5 h-3.5 m-0 accent-blue-500"
        />
        <span class="font-medium select-none">All</span>
      </label>
      <label class="flex items-center gap-1.5 cursor-pointer text-sm text-gray-600 px-2 py-1 rounded transition-colors hover:bg-gray-100">
        <input 
          type="radio" 
          name="imageFormat" 
          value="image/png" 
          :checked="selectedFormat === 'image/png'"
          @change="onFormatChange"
          class="cursor-pointer w-3.5 h-3.5 m-0 accent-blue-500"
        />
        <span class="font-medium select-none">PNG</span>
      </label>
      <label class="flex items-center gap-1.5 cursor-pointer text-sm text-gray-600 px-2 py-1 rounded transition-colors hover:bg-gray-100">
        <input 
          type="radio" 
          name="imageFormat" 
          value="image/jpeg" 
          :checked="selectedFormat === 'image/jpeg'"
          @change="onFormatChange"
          class="cursor-pointer w-3.5 h-3.5 m-0 accent-blue-500"
        />
        <span class="font-medium select-none">JPEG</span>
      </label>
      <label class="flex items-center gap-1.5 cursor-pointer text-sm text-gray-600 px-2 py-1 rounded transition-colors hover:bg-gray-100">
        <input 
          type="radio" 
          name="imageFormat" 
          value="image/gif" 
          :checked="selectedFormat === 'image/gif'"
          @change="onFormatChange"
          class="cursor-pointer w-3.5 h-3.5 m-0 accent-blue-500"
        />
        <span class="font-medium select-none">GIF</span>
      </label>
      <label class="flex items-center gap-1.5 cursor-pointer text-sm text-gray-600 px-2 py-1 rounded transition-colors hover:bg-gray-100">
        <input 
          type="radio" 
          name="imageFormat" 
          value="image/svg+xml" 
          :checked="selectedFormat === 'image/svg+xml'"
          @change="onFormatChange"
          class="cursor-pointer w-3.5 h-3.5 m-0 accent-blue-500"
        />
        <span class="font-medium select-none">SVG</span>
      </label>
    </div>

    <!-- Error Display -->
    <div v-if="error" class="bg-red-50 border border-red-200 rounded-lg p-4 mb-4 text-red-600">
      <strong>Error:</strong> {{ error }}
    </div>

    <!-- Results Display -->
    <div v-if="results && imageTransactions.length > 0" class="mt-8">
      <div class="flex justify-between items-center mb-6">
        <h3 class="m-0 text-gray-700">Found {{ imageTransactions.length }}{{ results.pageInfo.hasNextPage ? '+' : '' }} Images</h3>
        <div class="flex gap-1 border border-gray-300 rounded-md p-1">
          <button 
            @click="gridSize = 'small'" 
            :class="gridSize === 'small' ? 'bg-blue-500 text-white' : 'bg-transparent hover:bg-gray-100'"
            class="border-none px-1.5 py-1.5 cursor-pointer rounded transition-colors"
            title="Small grid"
          >
            ▦
          </button>
          <button 
            @click="gridSize = 'medium'" 
            :class="gridSize === 'medium' ? 'bg-blue-500 text-white' : 'bg-transparent hover:bg-gray-100'"
            class="border-none px-1.5 py-1.5 cursor-pointer rounded transition-colors"
            title="Medium grid"
          >
            ⬜
          </button>
          <button 
            @click="gridSize = 'large'" 
            :class="gridSize === 'large' ? 'bg-blue-500 text-white' : 'bg-transparent hover:bg-gray-100'"
            class="border-none px-1.5 py-1.5 cursor-pointer rounded transition-colors"
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
          class="cursor-pointer rounded-lg overflow-hidden bg-white shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md"
          @click="openImageModal(transaction)"
        >
          <div class="image-wrapper group">
            <img 
              :src="getImageUrl(transaction.id)"
              :alt="`Image ${transaction.id}`"
              class="grid-image transition-transform group-hover:scale-105"
              @error="handleImageError"
              @load="handleImageLoad"
              loading="lazy"
            />
              <div class="absolute inset-0 bg-gradient-to-b from-black/70 via-transparent to-black/70 opacity-0 transition-opacity flex flex-col justify-between p-2 group-hover:opacity-100">
                <div class="flex flex-col gap-1">
                  <span class="bg-black/80 text-white px-1.5 py-0.5 rounded text-xs w-fit">{{ getContentType(transaction) }}</span>
                  <span class="bg-black/80 text-white px-1.5 py-0.5 rounded text-xs w-fit">{{ formatFileSize(parseInt(transaction.data.size)) }}</span>
                </div>
                <div class="flex gap-2 self-end">
                  <button 
                    @click.stop="openInNewTab(transaction.id)"
                    class="bg-black/80 text-white border-none rounded px-1.5 py-1.5 cursor-pointer text-sm transition-colors hover:bg-black/90"
                    title="Open in new tab"
                  >
                    🔗
                  </button>
                  <button 
                    @click.stop="copyImageUrl(transaction.id)"
                    class="bg-black/80 text-white border-none rounded px-1.5 py-1.5 cursor-pointer text-sm transition-colors hover:bg-black/90"
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
      <div v-if="results.pageInfo.hasNextPage" class="flex justify-center mt-8">
        <button 
          @click="loadMore"
          :disabled="loading"
          class="px-6 py-3 bg-blue-500 text-white border-none rounded-lg font-semibold cursor-pointer transition-colors hover:bg-blue-600 disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          {{ loading ? 'Loading More Images...' : 'Load More Images' }}
        </button>
      </div>
    </div>

    <!-- No results message -->
    <div v-if="results && results.edges.length === 0" class="text-center py-12 px-4 text-gray-500">
      <p>No transactions found matching your search criteria.</p>
    </div>

    <!-- Image Modal -->
    <div v-if="selectedImage" class="fixed inset-0 bg-black/90 flex items-center justify-center z-[1000] p-4" @click="closeImageModal">
      <div class="bg-white rounded-lg max-w-[90vw] max-h-[90vh] overflow-auto" @click.stop>
        <div class="flex justify-between items-center p-4 border-b border-gray-200">
          <h3 class="m-0">Image Details</h3>
          <button @click="closeImageModal" class="bg-transparent border-none text-2xl cursor-pointer p-1 text-gray-500">×</button>
        </div>
        <div class="p-4 flex flex-col md:flex-row gap-4">
          <img 
            :src="getImageUrl(selectedImage.id)" 
            :alt="`Image ${selectedImage.id}`"
            class="max-w-full max-h-[60vh] md:max-h-[70vh] object-contain rounded"
          />
          <div class="min-w-[300px]">
            <div class="mb-3">
              <strong class="block mb-1 text-gray-700">Transaction ID:</strong>
              <code class="font-mono text-sm bg-gray-100 px-2 py-1 rounded break-all">{{ selectedImage.id }}</code>
            </div>
            <div class="mb-3">
              <strong class="block mb-1 text-gray-700">Size:</strong>
              {{ formatFileSize(parseInt(selectedImage.data.size)) }}
            </div>
            <div class="mb-3">
              <strong class="block mb-1 text-gray-700">Type:</strong>
              {{ getContentType(selectedImage) }}
            </div>
            <div class="mb-3">
              <strong class="block mb-1 text-gray-700">Owner:</strong>
              <code class="font-mono text-sm bg-gray-100 px-2 py-1 rounded break-all">{{ selectedImage.owner.address }}</code>
            </div>
            <div class="mb-3">
              <strong class="block mb-1 text-gray-700">Block:</strong>
              {{ selectedImage.block.height }}
            </div>
            <div v-if="selectedImage.tags.length > 0" class="mb-3">
              <strong class="block mb-1 text-gray-700">Tags:</strong>
              <div class="flex flex-wrap gap-1">
                <span 
                  v-for="tag in selectedImage.tags" 
                  :key="tag.name"
                  class="bg-gray-100 px-2 py-1 rounded text-sm"
                >
                  {{ tag.name }}: {{ tag.value }}
                </span>
              </div>
            </div>
            <div class="flex gap-2 mt-4">
              <a 
                :href="getImageUrl(selectedImage.id)" 
                target="_blank" 
                class="px-4 py-2 rounded-md font-medium cursor-pointer no-underline border-none bg-blue-500 text-white hover:opacity-90"
              >
                View Full Size
              </a>
              <button 
                @click="copyImageUrl(selectedImage.id)" 
                class="px-4 py-2 rounded-md font-medium cursor-pointer border-none bg-gray-100 text-gray-700 hover:opacity-90"
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

.image-wrapper {
  position: relative;
  aspect-ratio: 1;
  overflow: hidden;
}

.grid-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
</style>
