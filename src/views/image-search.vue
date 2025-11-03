<template>
  <!-- Search Input -->
  <div class="mb-4">
    <SearchInput
      :initial-query="searchQuery"
      initial-mode="Images"
    />
  </div>

  <!-- Format Filter Radio Buttons -->
  <div class="format-picker">
    <label>
      <input type="radio" name="imageFormat" value="image/*" :checked="selectedFormat === 'image/*'" @change="onFormatChange" />
      <span>All</span>
    </label>
    <label>
      <input type="radio" name="imageFormat" value="image/png" :checked="selectedFormat === 'image/png'" @change="onFormatChange" />
      <span>PNG</span>
    </label>
    <label>
      <input type="radio" name="imageFormat" value="image/jpeg" :checked="selectedFormat === 'image/jpeg'" @change="onFormatChange" />
      <span>JPEG</span>
    </label>
    <label>
      <input type="radio" name="imageFormat" value="image/gif" :checked="selectedFormat === 'image/gif'" @change="onFormatChange" />
      <span>GIF</span>
    </label>
    <label>
      <input type="radio" name="imageFormat" value="image/svg+xml" :checked="selectedFormat === 'image/svg+xml'" @change="onFormatChange" />
      <span>SVG</span>
    </label>
  </div>


  <!-- Error Display -->
  <div v-if="error" class="bg-destructive/10 border border-destructive/30 rounded-lg p-4 mb-4 text-destructive">
    <strong>Error:</strong> {{ error }}
  </div>

  <!-- Results Display -->
  <div v-if="results && imageTransactions.length > 0">
    <div class="flex justify-between items-center">
      <h3 class="m-0 mt-1 text-foreground">Found {{ imageTransactions.length }}{{ results.pageInfo.hasNextPage ? '+' : '' }} Images</h3>
      <div class="flex gap-1 border border-border rounded-md p-1 bg-background">
        <button 
          @click="gridSize = 'small'" 
          :class="gridSize === 'small' ? 'bg-primary text-primary-foreground' : 'bg-transparent hover:bg-accent hover:text-accent-foreground'"
          class="border-none px-1.5 py-1.5 cursor-pointer rounded transition-colors"
          title="Small grid"
        >
          ▦
        </button>
        <button 
          @click="gridSize = 'medium'" 
          :class="gridSize === 'medium' ? 'bg-primary text-primary-foreground' : 'bg-transparent hover:bg-accent hover:text-accent-foreground'"
          class="border-none px-1.5 py-1.5 cursor-pointer rounded transition-colors"
          title="Medium grid"
        >
          ⬜
        </button>
        <button 
          @click="gridSize = 'large'" 
          :class="gridSize === 'large' ? 'bg-primary text-primary-foreground' : 'bg-transparent hover:bg-accent hover:text-accent-foreground'"
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
        class="px-6 py-3 bg-primary text-primary-foreground border-none rounded-lg font-semibold cursor-pointer transition-colors hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {{ loading ? 'Loading More Images...' : 'Load More Images' }}
      </button>
    </div>
  </div>

  <!-- No results message -->
  <div v-if="results && results.edges.length === 0" class="text-center py-12 px-4 text-muted-foreground">
    <p>No transactions found matching your search criteria.</p>
  </div>

  <!-- Image Modal -->
  <div v-if="selectedImage" class="fixed inset-0 bg-black/90 flex items-center justify-center z-[1000] p-4" @click="closeImageModal">
    <div class="bg-background rounded-lg max-w-[90vw] max-h-[90vh] overflow-auto border border-border" @click.stop>
      <div class="flex justify-between items-center p-4 border-b border-border">
        <h3 class="m-0 text-foreground">Image Details</h3>
        <button @click="closeImageModal" class="bg-transparent border-none text-2xl cursor-pointer p-1 text-muted-foreground hover:text-foreground">×</button>
      </div>
      <div class="p-4 flex flex-col md:flex-row gap-4">
        <img 
          :src="getImageUrl(selectedImage.id)" 
          :alt="`Image ${selectedImage.id}`"
          class="max-w-full max-h-[60vh] md:max-h-[70vh] object-contain rounded"
        />
        <div class="min-w-[300px]">
          <div class="mb-3">
            <strong class="block mb-1 text-foreground">Transaction ID:</strong>
            <code class="font-mono text-sm bg-muted px-2 py-1 rounded break-all text-muted-foreground">{{ selectedImage.id }}</code>
          </div>
          <div class="mb-3">
            <strong class="block mb-1 text-foreground">Size:</strong>
            <span class="text-muted-foreground">{{ formatFileSize(parseInt(selectedImage.data.size)) }}</span>
          </div>
          <div class="mb-3">
            <strong class="block mb-1 text-foreground">Type:</strong>
            <span class="text-muted-foreground">{{ getContentType(selectedImage) }}</span>
          </div>
          <div class="mb-3">
            <strong class="block mb-1 text-foreground">Owner:</strong>
            <code class="font-mono text-sm bg-muted px-2 py-1 rounded break-all text-muted-foreground">{{ selectedImage.owner.address }}</code>
          </div>
          <div class="mb-3">
            <strong class="block mb-1 text-foreground">Block:</strong>
            <span class="text-muted-foreground">{{ selectedImage.block.height }}</span>
          </div>
          <div v-if="selectedImage.tags.length > 0" class="mb-3">
            <strong class="block mb-1 text-foreground">Tags:</strong>
            <div class="flex flex-wrap gap-1">
              <span 
                v-for="tag in selectedImage.tags" 
                :key="tag.name"
                class="bg-muted px-2 py-1 rounded text-sm text-muted-foreground"
              >
                {{ tag.name }}: {{ tag.value }}
              </span>
            </div>
          </div>
          <div class="flex gap-2 mt-4">
            <a 
              :href="getImageUrl(selectedImage.id)" 
              target="_blank" 
              class="px-4 py-2 rounded-md font-medium cursor-pointer no-underline border-none bg-primary text-primary-foreground hover:opacity-90"
            >
              View Full Size
            </a>
            <button 
              @click="copyImageUrl(selectedImage.id)" 
              class="px-4 py-2 rounded-md font-medium cursor-pointer border-none bg-muted text-foreground hover:bg-accent hover:text-accent-foreground"
            >
              Copy URL
            </button>
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
import SearchInput from '../components/SearchInput.vue'

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
.format-picker {
  display: inline-flex;
  align-items: center;
  gap: 0.75rem;
  margin: 0rem 0;
  padding: 0.5rem 0.75rem;
  background-color: var(--color-muted);
  border: 1px solid var(--color-border);
  border-radius: 0.375rem;
  font-size: 0.75rem;
}

.format-picker label {
  display: flex;
  align-items: center;
  gap: 0.375rem;
  cursor: pointer;
}

.format-picker label:hover {
  color: var(--color-accent-foreground);
}

.format-picker input[type="radio"] {
  width: 12px;
  height: 12px;
  margin: 0;
  vertical-align: middle;
}

.format-picker span {
  line-height: 1;
  vertical-align: middle;
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
