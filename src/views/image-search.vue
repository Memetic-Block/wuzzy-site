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

  <!-- Loading Skeleton -->
  <div v-if="isSearching">
    <div class="flex justify-between items-center mb-6">
      <h3 class="m-0 mt-1 text-foreground flex items-center gap-2">
        Found ... Images
      </h3>
      <Skeleton class="h-10 w-32 rounded-md" />
    </div>
    <div class="image-grid" :class="`grid-${gridSize}`">
      <Skeleton v-for="n in 20" :key="n" class="skeleton-image" />
    </div>
  </div>

  <!-- Results Display -->
  <div v-if="results && imageTransactions.length > 0 && !isSearching">
    <div class="flex justify-between items-center">
      <h3 class="m-0 mt-1 text-foreground">
        <span v-if="totalCount">Found {{ parseInt(totalCount).toLocaleString() }} Images</span>
        <span v-else>Found {{ allResults.length }}+ Images</span>
        (Page {{ currentPage }} of {{ totalPages }}{{ results.pageInfo.hasNextPage ? '+' : '' }})
      </h3>
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

    <!-- Pagination Controls -->
    <div v-if="totalPages > 0" class="flex justify-center items-center gap-2 mt-8 flex-wrap">
      <button 
        @click="goToPrevPage"
        :disabled="!canGoPrev"
        class="px-4 py-2 bg-primary text-primary-foreground border-none rounded-lg font-medium cursor-pointer transition-colors hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        ← Previous
      </button>
      
      <!-- Page Numbers -->
      <div class="flex gap-1">
        <button
          v-for="pageNum in pageNumbers"
          :key="pageNum"
          @click="goToPage(pageNum)"
          :class="[
            'px-3 py-2 border-none rounded-lg font-medium cursor-pointer transition-colors',
            pageNum === currentPage
              ? 'bg-primary text-primary-foreground'
              : 'bg-muted text-foreground hover:bg-accent hover:text-accent-foreground'
          ]"
        >
          {{ pageNum }}
        </button>
        <span v-if="results?.pageInfo.hasNextPage && pageNumbers[pageNumbers.length - 1] === totalPages" class="px-3 py-2 text-muted-foreground">
          ...
        </span>
      </div>
      
      <button 
        @click="goToNextPage"
        :disabled="!canGoNext || loading"
        class="px-4 py-2 bg-primary text-primary-foreground border-none rounded-lg font-medium cursor-pointer transition-colors hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {{ loading ? 'Loading...' : 'Next →' }}
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
import Skeleton from '@/components/ui/skeleton/Skeleton.vue'

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
const isSearching = ref(false)
const lastCursor = ref<string | undefined>()
const selectedFormat = ref<string>((route.query.format as string) || 'image/*')
const totalCount = ref<string | null>(null) // Separate state for count

// Pagination state
const allResults = ref<any[]>([]) // All fetched transactions
const currentPage = ref(parseInt(route.query.page as string) || 1)
const resultsPerPage = 20

// Computed pagination properties
const paginatedResults = computed(() => {
  const start = (currentPage.value - 1) * resultsPerPage
  const end = start + resultsPerPage
  return allResults.value.slice(start, end)
})

const totalPages = computed(() => {
  // If we have a count from the async query, use that for total pages calculation
  if (totalCount.value) {
    return Math.ceil(parseInt(totalCount.value) / resultsPerPage)
  }
  // Otherwise use cached results length, but add 1 if there's more data available
  const cachedPages = Math.ceil(allResults.value.length / resultsPerPage)
  if (results.value?.pageInfo.hasNextPage) {
    return cachedPages + 1 // Show one more page to indicate there's more
  }
  return cachedPages
})

const canGoNext = computed(() => {
  const cachedPages = Math.ceil(allResults.value.length / resultsPerPage)
  // Can go next if we have cached data OR if API says there's more
  return currentPage.value < cachedPages || results.value?.pageInfo.hasNextPage
})

const canGoPrev = computed(() => currentPage.value > 1)

// Generate page numbers to display (show current +/- 2 pages)
const pageNumbers = computed(() => {
  const pages: number[] = []
  const maxPagesToShow = 5
  const halfRange = Math.floor(maxPagesToShow / 2)
  
  // Show page numbers up to totalPages (which includes the +1 if hasNextPage)
  let startPage = Math.max(1, currentPage.value - halfRange)
  let endPage = Math.min(totalPages.value, currentPage.value + halfRange)
  
  // Adjust if we're near the beginning
  if (currentPage.value <= halfRange) {
    endPage = Math.min(totalPages.value, maxPagesToShow)
  } 
  
  for (let i = startPage; i <= endPage; i++) {
    pages.push(i)
  }
  
  return pages
})

// GraphQL composable
const { getTransactions, getTransactionCount } = useGraphQL()

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
  () => [route.query.q, route.query.format, route.query.page],
  ([newQuery, newFormat, newPage], oldValues) => {
    const query = (newQuery as string) || ''
    const format = (newFormat as string) || 'image/*'
    const page = parseInt(newPage as string) || 1
    
    if (!query.trim()) {
      // Clear results if query is empty
      results.value = null
      allResults.value = []
      currentPage.value = 1
      searchQuery.value = ''
      return
    }
    
    // Check if query or format changed (requires new search)
    const oldQuery = oldValues ? (oldValues[0] as string) || '' : ''
    const oldFormat = oldValues ? (oldValues[1] as string) || 'image/*' : 'image/*'
    const queryChanged = query !== oldQuery
    const formatChanged = format !== oldFormat
    const isInitialLoad = !oldValues
    
    searchQuery.value = query
    selectedFormat.value = format
    
    if (queryChanged || formatChanged) {
      // Execute new search
      if (isInitialLoad) {
        // On initial load, honor the page from URL
        currentPage.value = page
        executeSearch()
      } else {
        // On query/format change, reset to page 1
        currentPage.value = 1
        executeSearch()
        // Update URL to page 1 if needed
        if (page !== 1) {
          router.replace({
            query: {
              q: query,
              format: format,
              page: '1'
            }
          })
        }
      }
    } else {
      // Only page changed
      const neededResults = page * resultsPerPage
      const hasEnoughCached = allResults.value.length >= neededResults
      
      if (hasEnoughCached || page === 1) {
        // Just update currentPage and scroll (data already cached or going to page 1)
        currentPage.value = page
        window.scrollTo({ top: 0, behavior: 'smooth' })
      } else if (results.value?.pageInfo.hasNextPage) {
        // Need to load more data - fetch it then navigate
        console.log(`Loading more data for page ${page}...`)
        loadMore().then(() => {
          // Check again if we have enough data now
          const hasEnoughNow = allResults.value.length >= neededResults
          if (hasEnoughNow) {
            currentPage.value = page
            window.scrollTo({ top: 0, behavior: 'smooth' })
          } else {
            console.warn(`Still not enough data for page ${page} after loading more`)
          }
        })
      } else {
        // No more data available
        console.warn(`Not enough cached data for page ${page} and no more pages available`)
      }
    }
  },
  { immediate: true }
)

const imageTransactions = computed(() => {
  return paginatedResults.value
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
  isSearching.value = true
  error.value = null
  lastCursor.value = undefined
  failedImages.value.clear()
  totalCount.value = null // Reset count
  
  try {
    // Build query options
    const queryOptions: any = {
      tags: [],
      first: 100 // Request max results per page
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
    
    // Fetch results (priority)
    results.value = await getTransactions(queryOptions)
    
    // Populate allResults with the fetched transactions
    allResults.value = results.value.edges.map(edge => edge.node)
    // Don't reset currentPage here - let the route watcher handle it
    
    // Store cursor for pagination
    if (results.value.edges.length > 0) {
      lastCursor.value = results.value.edges[results.value.edges.length - 1].cursor
    }
    
    // Fetch count asynchronously (non-blocking)
    // Build count query options (same filters, but no pagination)
    const countOptions = {
      ids: queryOptions.ids,
      owners: queryOptions.owners,
      recipients: queryOptions.recipients,
      tags: queryOptions.tags,
      bundledIn: queryOptions.bundledIn,
      block: queryOptions.block
    }
    getTransactionCount(countOptions).then(count => {
      totalCount.value = count
    }).catch(err => {
      console.error('Failed to fetch count:', err)
      // Don't set error - count is optional
    })
  } catch (err) {
    error.value = err instanceof Error ? err.message : String(err)
    results.value = null
  } finally {
    loading.value = false
    isSearching.value = false
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
      first: 100, // Request max results per page
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
    
    // Append new results to allResults array
    allResults.value.push(...moreResults.edges.map(edge => edge.node))
    
    // Update results metadata
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

// Page navigation functions
async function goToNextPage() {
  const cachedPages = Math.ceil(allResults.value.length / resultsPerPage)
  const nextPage = currentPage.value + 1
  
  // Check if we need to fetch more data
  if (nextPage > cachedPages && results.value?.pageInfo.hasNextPage) {
    // Need to fetch more results first
    await loadMore()
  }
  
  // Navigate to next page
  router.push({
    query: {
      q: searchQuery.value,
      format: selectedFormat.value,
      page: nextPage.toString()
    }
  })
}

function goToPrevPage() {
  if (currentPage.value > 1) {
    router.push({
      query: {
        q: searchQuery.value,
        format: selectedFormat.value,
        page: (currentPage.value - 1).toString()
      }
    })
  }
}

function goToPage(page: number) {
  if (page >= 1 && page <= totalPages.value) {
    router.push({
      query: {
        q: searchQuery.value,
        format: selectedFormat.value,
        page: page.toString()
      }
    })
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

.skeleton-image {
  aspect-ratio: 1;
  border-radius: 0.5rem;
}
</style>
