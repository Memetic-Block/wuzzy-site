<template>
  <!-- Search Input -->
  <div class="mb-4">
    <SearchInput :initial-query="searchQuery" initial-mode="Video" />
  </div>

  <!-- Format Filter Checkboxes -->
  <div class="format-picker">
    <label>
      <input
        type="checkbox"
        value="video/*"
        :checked="selectedFormats.includes('video/*')"
        @change="onFormatChange"
      />
      <span>All</span>
    </label>
    <label>
      <input
        type="checkbox"
        value="video/mp4"
        :checked="selectedFormats.includes('video/mp4')"
        @change="onFormatChange"
      />
      <span>MP4</span>
    </label>
    <label>
      <input
        type="checkbox"
        value="video/webm"
        :checked="selectedFormats.includes('video/webm')"
        @change="onFormatChange"
      />
      <span>WebM</span>
    </label>
    <label>
      <input
        type="checkbox"
        value="video/ogg"
        :checked="selectedFormats.includes('video/ogg')"
        @change="onFormatChange"
      />
      <span>OGG</span>
    </label>
    <label>
      <input
        type="checkbox"
        value="video/quicktime"
        :checked="selectedFormats.includes('video/quicktime')"
        @change="onFormatChange"
      />
      <span>MOV</span>
    </label>
  </div>

  <!-- Info Display -->
  <div
    v-if="info"
    class="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-4 text-blue-800 dark:text-blue-200 flex justify-between items-start gap-4"
  >
    <div><strong>Info:</strong> {{ info }}</div>
    <button
      @click="info = null"
      class="bg-transparent border-none text-blue-800 dark:text-blue-200 cursor-pointer text-xl leading-none hover:opacity-70 flex-shrink-0"
      aria-label="Close"
    >
      ×
    </button>
  </div>

  <!-- Error Display -->
  <div
    v-if="error"
    class="bg-destructive/10 border border-destructive/30 rounded-lg p-4 mb-4 text-destructive"
  >
    <strong>Error:</strong> {{ error }}
  </div>

  <!-- Loading Skeleton -->
  <div v-if="isSearching">
    <div class="flex justify-between items-center mb-6">
      <h3 class="m-0 mt-1 text-foreground flex items-center gap-2">
        Found ... Videos
      </h3>
      <Skeleton class="h-10 w-32 rounded-md" />
    </div>
    <div class="image-grid" :class="`grid-${gridSize}`">
      <Skeleton v-for="n in 20" :key="n" class="skeleton-image" />
    </div>
  </div>

  <!-- Results Display -->
  <div v-if="results && videoTransactions.length > 0 && !isSearching">
    <div class="flex justify-between items-center">
      <h3 class="m-0 mt-1 text-foreground">
        <span v-if="totalCount"
          >Found {{ displayCount.toLocaleString() }} Videos</span
        >
        <span v-else>Found {{ displayCount }}+ Videos</span>
        (Page {{ currentPage }} of {{ totalPages
        }}{{ results.pageInfo.hasNextPage ? '+' : '' }})
      </h3>
      <div class="flex gap-1 border border-border rounded-md p-1 bg-background">
        <button
          @click="gridSize = 'small'"
          :class="
            gridSize === 'small'
              ? 'bg-primary text-primary-foreground'
              : 'bg-transparent hover:bg-accent hover:text-accent-foreground'
          "
          class="border-none px-1.5 py-1.5 cursor-pointer rounded transition-colors"
          title="Small grid"
        >
          <Grid3X3Icon />
        </button>
        <button
          @click="gridSize = 'medium'"
          :class="
            gridSize === 'medium'
              ? 'bg-primary text-primary-foreground'
              : 'bg-transparent hover:bg-accent hover:text-accent-foreground'
          "
          class="border-none px-1.5 py-1.5 cursor-pointer rounded transition-colors"
          title="Medium grid"
        >
          <Grid2x2Icon />
        </button>
        <button
          @click="gridSize = 'large'"
          :class="
            gridSize === 'large'
              ? 'bg-primary text-primary-foreground'
              : 'bg-transparent hover:bg-accent hover:text-accent-foreground'
          "
          class="border-none px-1.5 py-1.5 cursor-pointer rounded transition-colors"
          title="Large grid"
        >
          <Grid2x2PlusIcon />
        </button>
      </div>
    </div>

    <div class="image-grid" :class="`grid-${gridSize}`">
      <div
        v-for="transaction in videoTransactions"
        :key="transaction.id"
        class="cursor-pointer rounded-lg overflow-hidden bg-white shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md"
        @click="openVideoModal(transaction)"
      >
        <div class="image-wrapper group">
          <video
            :src="getVideoUrl(transaction.id)"
            class="grid-image transition-transform group-hover:scale-105"
            @error="handleVideoError"
            muted
            loop
            playsinline
            @mouseenter="(e) => (e.target as HTMLVideoElement).play()"
            @mouseleave="(e) => (e.target as HTMLVideoElement).pause()"
          />
          <div
            class="absolute inset-0 bg-gradient-to-b from-black/70 via-transparent to-black/70 opacity-0 transition-opacity flex flex-col justify-between p-2 group-hover:opacity-100"
          >
            <div class="flex flex-col gap-1">
              <span
                class="bg-black/80 text-white px-1.5 py-0.5 rounded text-xs w-fit"
                >{{ getContentType(transaction) }}</span
              >
              <span
                class="bg-black/80 text-white px-1.5 py-0.5 rounded text-xs w-fit"
                >{{ formatFileSize(parseInt(transaction.data.size)) }}</span
              >
            </div>
            <div class="flex gap-2 self-end">
              <Button
                @click.stop="openInNewTab(transaction.id)"
                class="bg-black/80 text-white border-none cursor-pointer text-xs [&_svg]:size-1 transition-colors hover:bg-black/90"
                title="Open in new tab"
                size="icon"
              >
                <ExternalLinkIcon />
              </Button>
              <Button
                @click.stop="copyVideoUrl(transaction.id)"
                :class="[
                  ' text-white border-none cursor-pointer text-xs',
                  videoCopied && videoCopied[transaction.id]
                    ? 'bg-green-400 hover:bg-green-400'
                    : 'bg-black/80 hover:bg-black/90'
                ]"
                class=""
                title="Copy image URL"
                size="icon"
              >
                <CheckIcon v-if="videoCopied && videoCopied[transaction.id]" />
                <CopyIcon v-else />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Pagination Controls -->
    <div
      v-if="totalPages > 0"
      class="flex justify-center items-center gap-2 mt-8 flex-wrap"
    >
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
        <span
          v-if="
            results?.pageInfo.hasNextPage &&
            pageNumbers[pageNumbers.length - 1] === totalPages
          "
          class="px-3 py-2 text-muted-foreground"
        >
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
  <div
    v-if="results && results.edges.length === 0"
    class="text-center py-12 px-4 text-muted-foreground"
  >
    <p>No transactions found matching your search criteria.</p>
  </div>

  <!-- Video Modal -->
  <div
    v-if="selectedVideo"
    class="fixed inset-0 bg-black/90 flex items-center justify-center z-[1000] p-4"
    @click="closeVideoModal"
  >
    <div
      class="bg-background rounded-lg max-w-[90vw] max-h-[90vh] overflow-auto border border-border"
      @click.stop
    >
      <div class="flex justify-between items-center p-4 border-b border-border">
        <h3 class="text-foreground" style="margin: 0">Video Details</h3>
        <button
          @click="closeVideoModal"
          class="bg-transparent border-none text-2xl cursor-pointer p-1 text-muted-foreground hover:text-foreground"
        >
          ×
        </button>
      </div>
      <div class="p-4 flex flex-col md:grid md:grid-cols-2 gap-4">
        <video
          :src="getVideoUrl(selectedVideo.id)"
          controls
          class="max-w-full max-h-[60vh] md:max-h-[70vh] rounded"
        />
        <div class="min-w-[300px]">
          <div class="mb-3">
            <strong class="block mb-1 text-foreground">Transaction ID:</strong>
            <code
              class="font-mono text-sm bg-muted px-2 py-1 rounded break-all text-muted-foreground"
              >{{ selectedVideo.id }}</code
            >
          </div>
          <div class="mb-3">
            <strong class="block mb-1 text-foreground">Size:</strong>
            <span class="text-muted-foreground">{{
              formatFileSize(parseInt(selectedVideo.data.size))
            }}</span>
          </div>
          <div class="mb-3">
            <strong class="block mb-1 text-foreground">Type:</strong>
            <span class="text-muted-foreground">{{
              getContentType(selectedVideo)
            }}</span>
          </div>
          <div class="mb-3">
            <strong class="block mb-1 text-foreground">Owner:</strong>
            <code
              class="font-mono text-sm bg-muted px-2 py-1 rounded break-all text-muted-foreground"
              >{{ selectedVideo.owner.address }}</code
            >
          </div>
          <div class="mb-3">
            <strong class="block mb-1 text-foreground">Block:</strong>
            <span class="text-muted-foreground">{{
              selectedVideo.block.height
            }}</span>
          </div>
          <div v-if="selectedVideo.tags.length > 0" class="mb-3">
            <strong class="block mb-1 text-foreground">Tags:</strong>
            <div class="flex flex-wrap gap-1">
              <span
                v-for="tag in selectedVideo.tags"
                :key="tag.name"
                class="bg-muted px-2 py-1 rounded text-sm text-muted-foreground"
              >
                {{ tag.name }}: {{ tag.value }}
              </span>
            </div>
          </div>
          <div class="flex gap-2 mt-4">
            <a
              :href="getVideoUrl(selectedVideo.id)"
              target="_blank"
              class="px-4 py-2 rounded-md font-medium cursor-pointer no-underline border-none bg-primary text-primary-foreground hover:opacity-90"
            >
              View Full Size
            </a>
            <button
              @click="copyVideoUrl(selectedVideo.id)"
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
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useMediaSearch } from '../composables/search'
import SearchInput from '../components/SearchInput.vue'
import Skeleton from '@/components/ui/skeleton/Skeleton.vue'
import {
  CheckIcon,
  CopyIcon,
  ExternalLinkIcon,
  Grid2x2Icon,
  Grid2x2PlusIcon,
  Grid3X3Icon
} from 'lucide-vue-next'
import Button from '@/components/ui/button/Button.vue'
import { convertToHttpsUrl, convertToWayfinderUrl } from '../lib/utils'

const route = useRoute()
const router = useRouter()

// Use media search composable
const mediaSearch = useMediaSearch({
  mediaType: 'video',
  defaultFormats: route.query.format
    ? (route.query.format as string).split(',')
    : ['video/*']
})

// Destructure composable state and methods
const {
  searchQuery,
  selectedFormats,
  currentPage,
  loading,
  isSearching,
  error,
  info,
  results,
  totalCount,
  allResults,
  paginatedResults,
  totalPages,
  canGoNext,
  canGoPrev,
  pageNumbers,
  executeSearch,
  loadMore,
  onFormatChange,
  goToNextPage,
  goToPrevPage,
  goToPage
} = mediaSearch

// View-specific state (failed videos tracking stays in view)
const failedVideos = ref(new Set<string>())
const failedVideosCount = ref(0)
const gridSize = ref<'small' | 'medium' | 'large'>('medium')
const selectedVideo = ref<any>(null)
const videoCopied = ref<{ [key: string]: boolean }>()
const resultsPerPage = 20

// Watch route query changes
watch(
  () => [route.query.q, route.query.format, route.query.page],
  ([newQuery, newFormat, newPage], oldValues) => {
    const query = (newQuery as string) || ''
    const format = (newFormat as string) || 'video/*'
    const page = parseInt(newPage as string) || 1

    if (!query.trim()) {
      results.value = null
      allResults.value = []
      currentPage.value = 1
      searchQuery.value = ''
      failedVideos.value.clear()
      failedVideosCount.value = 0
      return
    }

    const oldQuery = oldValues ? (oldValues[0] as string) || '' : ''
    const oldFormat = oldValues
      ? (oldValues[1] as string) || 'video/*'
      : 'video/*'
    const queryChanged = query !== oldQuery
    const formatChanged = format !== oldFormat
    const isInitialLoad = !oldValues

    searchQuery.value = query
    selectedFormats.value = format.split(',')

    if (queryChanged || formatChanged) {
      failedVideos.value.clear()
      failedVideosCount.value = 0

      if (isInitialLoad) {
        if (page > 5) {
          info.value = `Page ${page} is not available on initial load. Starting from page 1 - use navigation controls to reach page ${page}.`
          currentPage.value = 1
          router.replace({
            query: {
              q: query,
              format: format,
              page: '1'
            }
          })
          executeSearch()
        } else {
          currentPage.value = page
          executeSearch()
        }
      } else {
        currentPage.value = 1
        executeSearch()
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
      const startIndex = (page - 1) * resultsPerPage
      const hasEnoughCached = allResults.value.length > startIndex

      if (totalCount.value) {
        const maxPages = Math.ceil(parseInt(totalCount.value) / resultsPerPage)
        if (page > maxPages) {
          console.warn(`Page ${page} exceeds total pages ${maxPages}`)
          return
        }
      }

      if (hasEnoughCached || page === 1) {
        currentPage.value = page
        window.scrollTo({ top: 0, behavior: 'smooth' })
      } else if (results.value?.pageInfo.hasNextPage) {
        console.log(`Loading more data for page ${page}...`)
        loadMore().then(() => {
          const hasEnoughNow = allResults.value.length > startIndex
          if (hasEnoughNow) {
            currentPage.value = page
            window.scrollTo({ top: 0, behavior: 'smooth' })
          } else {
            console.warn(
              `Still not enough data for page ${page} after loading more`
            )
          }
        })
      } else {
        console.warn(
          `Not enough cached data for page ${page} and no more pages available`
        )
      }
    }
  },
  { immediate: true }
)

// Computed: Filter video transactions (excluding failed ones)
const videoTransactions = computed(() => {
  return paginatedResults.value.filter(
    (transaction: any) =>
      isVideoTransaction(transaction) && !failedVideos.value.has(transaction.id)
  )
})

const displayResultsCount = computed(() => {
  return allResults.value.filter(
    (transaction: any) =>
      isVideoTransaction(transaction) && !failedVideos.value.has(transaction.id)
  ).length
})

const displayCount = computed(() => {
  if (totalCount.value && allResults.value.length >= 100) {
    const cachedTotal = allResults.value.length
    const cachedValid = displayResultsCount.value
    const validRatio = cachedValid / cachedTotal
    const estimatedTotal = Math.round(parseInt(totalCount.value) * validRatio)
    return estimatedTotal
  }
  return displayResultsCount.value
})

// Video handling
function isVideoTransaction(transaction: any): boolean {
  const contentType = getContentType(transaction)
  return contentType.startsWith('video/')
}

function getContentType(transaction: any): string {
  const contentTypeTag = transaction.tags.find(
    (tag: any) => tag.name.toLowerCase() === 'content-type'
  )
  return contentTypeTag?.value || 'unknown'
}

function getVideoUrl(transactionId: string): string {
  return convertToHttpsUrl(
    convertToWayfinderUrl(`https://arweave.net/${transactionId}`)
  )
}

function handleVideoError(event: Event) {
  const video = event.target as HTMLVideoElement
  const transactionId = video.src.split('/').pop()
  if (transactionId && !failedVideos.value.has(transactionId)) {
    console.warn(`Video failed to load: ${transactionId}`)
    failedVideos.value.add(transactionId)
    failedVideosCount.value++
  }
}

function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i]
}

// Modal functions
function openVideoModal(transaction: any) {
  selectedVideo.value = transaction
  window.history.pushState({ modal: true }, '', '')
}

function closeVideoModal() {
  const currentState = window.history.state
  selectedVideo.value = null

  if (currentState && currentState.modal) {
    window.history.back()
  }
}

function handlePopState() {
  if (selectedVideo.value) {
    selectedVideo.value = null
  }
}

onMounted(() => {
  window.addEventListener('popstate', handlePopState)
})

onUnmounted(() => {
  window.removeEventListener('popstate', handlePopState)
})

function openInNewTab(transactionId: string) {
  window.open(getVideoUrl(transactionId), '_blank')
}

function copyVideoUrl(transactionId: string) {
  navigator.clipboard
    .writeText(getVideoUrl(transactionId))
    .then(() => {
      videoCopied.value = {
        ...videoCopied.value,
        [transactionId]: true
      }
      console.log('Video URL copied to clipboard')
      setTimeout(() => {
        videoCopied.value = {
          ...videoCopied.value,
          [transactionId]: false
        }
      }, 2000)
    })
    .catch((err) => {
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

.format-picker input[type='radio'] {
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
