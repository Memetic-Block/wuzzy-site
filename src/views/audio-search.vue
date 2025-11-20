<template>
  <!-- Search Input -->
  <div class="mb-4">
    <SearchInput :initial-query="searchQuery" initial-mode="Audio" />
  </div>

  <!-- Format Filter Checkboxes -->
  <div class="format-picker">
    <label>
      <input
        type="checkbox"
        value="audio/*"
        :checked="selectedFormats.includes('audio/*')"
        @change="onFormatChange"
      />
      <span>All</span>
    </label>
    <label>
      <input
        type="checkbox"
        value="audio/mpeg"
        :checked="selectedFormats.includes('audio/mpeg')"
        @change="onFormatChange"
      />
      <span>MP3</span>
    </label>
    <label>
      <input
        type="checkbox"
        value="audio/wav"
        :checked="selectedFormats.includes('audio/wav')"
        @change="onFormatChange"
      />
      <span>WAV</span>
    </label>
    <label>
      <input
        type="checkbox"
        value="audio/ogg"
        :checked="selectedFormats.includes('audio/ogg')"
        @change="onFormatChange"
      />
      <span>OGG</span>
    </label>
    <label>
      <input
        type="checkbox"
        value="audio/flac"
        :checked="selectedFormats.includes('audio/flac')"
        @change="onFormatChange"
      />
      <span>FLAC</span>
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
        Found ... Audio Files
      </h3>
      <Skeleton class="h-10 w-32 rounded-md" />
    </div>
    <div class="flex flex-col gap-2">
      <Skeleton v-for="n in 20" :key="n" class="h-16 w-full rounded-md" />
    </div>
  </div>

  <!-- Results Display -->
  <div v-if="results && audioTransactions.length > 0 && !isSearching">
    <div class="flex justify-between items-center mb-4">
      <h3 class="m-0 mt-1 text-foreground">
        <span v-if="totalCount"
          >Found {{ displayCount.toLocaleString() }} Audio Files</span
        >
        <span v-else>Found {{ displayCount }}+ Audio Files</span>
        (Page {{ currentPage }} of {{ totalPages
        }}{{ results.pageInfo.hasNextPage ? '+' : '' }})
      </h3>
    </div>

    <!-- Audio List -->
    <div class="flex flex-col gap-3">
      <div
        v-for="transaction in audioTransactions"
        :key="transaction.id"
        class="bg-card border border-border rounded-lg p-4 transition-all hover:shadow-md"
      >
        <div class="flex flex-col gap-3">
          <!-- Audio Player -->
          <AudioPlayer
            :file="getAudioUrl(transaction.id)"
            :title="getAudioTitle(transaction)"
            :details="getAudioDetails(transaction)"
            show-skip
            show-track
          />

          <!-- Audio Info -->
          <div
            class="flex flex-wrap items-center gap-4 text-sm text-muted-foreground"
          >
            <span class="bg-muted px-2 py-1 rounded">
              {{ getContentType(transaction) }}
            </span>
            <span class="bg-muted px-2 py-1 rounded">
              {{ formatFileSize(parseInt(transaction.data.size)) }}
            </span>
            <span
              class="bg-muted px-2 py-1 rounded truncate max-w-xs"
              :title="transaction.id"
            >
              ID: {{ transaction.id.substring(0, 12) }}...
            </span>
          </div>

          <!-- Actions -->
          <div class="flex gap-2">
            <Button
              @click="openAudioModal(transaction)"
              variant="outline"
              size="sm"
            >
              View Details
            </Button>
            <Button
              @click="openInNewTab(transaction.id)"
              variant="outline"
              size="sm"
            >
              <ExternalLinkIcon class="h-4 w-4 mr-1" />
              Open
            </Button>
            <Button
              @click="copyAudioUrl(transaction.id)"
              :variant="
                audioCopied && audioCopied[transaction.id]
                  ? 'default'
                  : 'outline'
              "
              size="sm"
            >
              <CheckIcon
                v-if="audioCopied && audioCopied[transaction.id]"
                class="h-4 w-4 mr-1"
              />
              <CopyIcon v-else class="h-4 w-4 mr-1" />
              {{
                audioCopied && audioCopied[transaction.id]
                  ? 'Copied!'
                  : 'Copy URL'
              }}
            </Button>
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

  <!-- Audio Modal -->
  <div
    v-if="selectedAudio"
    class="fixed inset-0 bg-black/90 flex items-center justify-center z-[1000] p-4"
    @click="closeAudioModal"
  >
    <div
      class="bg-background rounded-lg max-w-[90vw] max-h-[90vh] overflow-auto border border-border flex flex-col relative"
      @click.stop
    >
      <div class="flex justify-between items-center p-4 border-b border-border">
        <h3 class="text-foreground" style="margin: 0">Audio Details</h3>
        <button
          @click="closeAudioModal"
          class="bg-transparent border-none text-2xl cursor-pointer p-1 text-muted-foreground hover:text-foreground"
        >
          ×
        </button>
      </div>
      <div
        class="p-4 flex flex-col gap-4 max-w-2xl flex-1 overflow-y-auto pb-24"
      >
        <AudioPlayer
          :file="getAudioUrl(selectedAudio.id)"
          :title="getAudioTitle(selectedAudio)"
          :details="getAudioDetails(selectedAudio)"
          show-skip
          show-track
        />
        <div>
          <div class="mb-3">
            <strong class="block mb-1 text-foreground">Transaction ID:</strong>
            <code
              class="font-mono text-sm bg-muted px-2 py-1 rounded break-all text-muted-foreground"
              >{{ selectedAudio.id }}</code
            >
          </div>
          <div class="mb-3">
            <strong class="block mb-1 text-foreground">Size:</strong>
            <span class="text-muted-foreground">{{
              formatFileSize(parseInt(selectedAudio.data.size))
            }}</span>
          </div>
          <div class="mb-3">
            <strong class="block mb-1 text-foreground">Type:</strong>
            <span class="text-muted-foreground">{{
              getContentType(selectedAudio)
            }}</span>
          </div>
          <div class="mb-3">
            <strong class="block mb-1 text-foreground">Owner:</strong>
            <code
              class="font-mono text-sm bg-muted px-2 py-1 rounded break-all text-muted-foreground"
              >{{ selectedAudio.owner.address }}</code
            >
          </div>
          <div class="mb-3">
            <strong class="block mb-1 text-foreground">Block:</strong>
            <span class="text-muted-foreground">{{
              selectedAudio.block.height
            }}</span>
          </div>
          <div v-if="selectedAudio.tags.length > 0" class="mb-3">
            <strong class="block mb-1 text-foreground">Tags:</strong>
            <div class="flex flex-wrap gap-1">
              <span
                v-for="tag in selectedAudio.tags"
                :key="tag.name"
                class="bg-muted px-2 py-1 rounded text-sm text-muted-foreground"
              >
                {{ tag.name }}: {{ tag.value }}
              </span>
            </div>
          </div>
        </div>
      </div>
      <div
        class="absolute w-full bottom-0 bg-background border-t border-muted px-4 py-4 flex gap-2 justify-end"
      >
        <a
          :href="getAudioUrl(selectedAudio.id)"
          target="_blank"
          class="px-4 py-2 rounded-md font-medium cursor-pointer no-underline border-none bg-primary text-primary-foreground hover:opacity-90"
        >
          Open Full Audio
        </a>
        <Button
          @click="copyAudioUrl(selectedAudio.id)"
          :variant="
            audioCopied && audioCopied[selectedAudio.id] ? 'default' : 'outline'
          "
        >
          <CheckIcon
            v-if="audioCopied && audioCopied[selectedAudio.id]"
            class="h-4 w-4 mr-1"
          />
          <CopyIcon v-else class="h-4 w-4 mr-1" />
          {{
            audioCopied && audioCopied[selectedAudio.id]
              ? 'Copied!'
              : 'Copy URL'
          }}
        </Button>
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
import { CheckIcon, CopyIcon, ExternalLinkIcon } from 'lucide-vue-next'
import Button from '@/components/ui/button/Button.vue'
import AudioPlayer from '@/components/AudioPlayer.vue'
import { convertToHttpsUrl, convertToWayfinderUrl } from '../lib/utils'

const route = useRoute()
const router = useRouter()

// Use media search composable
const mediaSearch = useMediaSearch({
  mediaType: 'audio',
  defaultFormats: route.query.format
    ? (route.query.format as string).split(',')
    : ['audio/*']
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

// View-specific state (failed audios tracking stays in view)
const failedAudios = ref(new Set<string>())
const failedAudiosCount = ref(0)
const selectedAudio = ref<any>(null)
const audioCopied = ref<{ [key: string]: boolean }>({})
const resultsPerPage = 20

// Watch route query changes
watch(
  () => [route.query.q, route.query.format, route.query.page],
  ([newQuery, newFormat, newPage], oldValues) => {
    const query = (newQuery as string) || ''
    const format = (newFormat as string) || 'audio/*'
    const page = parseInt(newPage as string) || 1

    if (!query.trim()) {
      results.value = null
      allResults.value = []
      currentPage.value = 1
      searchQuery.value = ''
      failedAudios.value.clear()
      failedAudiosCount.value = 0
      return
    }

    const oldQuery = oldValues ? (oldValues[0] as string) || '' : ''
    const oldFormat = oldValues
      ? (oldValues[1] as string) || 'audio/*'
      : 'audio/*'
    const queryChanged = query !== oldQuery
    const formatChanged = format !== oldFormat
    const isInitialLoad = !oldValues

    searchQuery.value = query
    selectedFormats.value = format.split(',')

    if (queryChanged || formatChanged) {
      failedAudios.value.clear()
      failedAudiosCount.value = 0

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
        loadMore().then(() => {
          const hasEnoughNow = allResults.value.length > startIndex
          if (hasEnoughNow) {
            currentPage.value = page
            window.scrollTo({ top: 0, behavior: 'smooth' })
          }
        })
      }
    }
  },
  { immediate: true }
)

// Computed: Filter audio transactions (excluding failed ones)
const audioTransactions = computed(() => {
  return paginatedResults.value.filter(
    (transaction: any) =>
      isAudioTransaction(transaction) && !failedAudios.value.has(transaction.id)
  )
})

const displayResultsCount = computed(() => {
  return allResults.value.filter(
    (transaction: any) =>
      isAudioTransaction(transaction) && !failedAudios.value.has(transaction.id)
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

// Audio handling
function isAudioTransaction(transaction: any): boolean {
  const contentType = getContentType(transaction)
  return contentType.startsWith('audio/')
}

function getContentType(transaction: any): string {
  const contentTypeTag = transaction.tags.find(
    (tag: any) => tag.name.toLowerCase() === 'content-type'
  )
  return contentTypeTag?.value || 'unknown'
}

function getAudioTitle(transaction: any): string {
  // First priority: "Title" tag
  const titleTag = transaction.tags.find(
    (tag: any) => tag.name.toLowerCase() === 'title'
  )
  if (titleTag?.value) {
    return titleTag.value
  }

  // Second priority: "File-Name" tag
  const fileNameTag = transaction.tags.find(
    (tag: any) => tag.name.toLowerCase() === 'file-name'
  )
  if (fileNameTag?.value) {
    return fileNameTag.value
  }

  // Fallback: Content-Type
  return getContentType(transaction)
}

function getAudioDetails(transaction: any): string {
  // First priority: "Artist" or "Artist-Name" tag
  const artistTag = transaction.tags.find(
    (tag: any) =>
      tag.name.toLowerCase() === 'artist' ||
      tag.name.toLowerCase() === 'artist-name'
  )
  if (artistTag?.value) {
    const artist = artistTag.value
    return artist.length > 30 ? artist.substring(0, 27) + '...' : artist
  }

  // Fallback: Owner address truncated
  const owner = transaction.owner.address
  return owner.length > 30 ? owner.substring(0, 27) + '...' : owner
}

function getAudioUrl(transactionId: string): string {
  return convertToHttpsUrl(
    convertToWayfinderUrl(`https://arweave.net/${transactionId}`)
  )
}

// function handleAudioError(event: Event) {
//   const audio = event.target as HTMLAudioElement
//   const transactionId = audio.src.split('/').pop()
//   if (transactionId && !failedAudios.value.has(transactionId)) {
//     console.warn(`Audio failed to load: ${transactionId}`)
//     failedAudios.value.add(transactionId)
//     failedAudiosCount.value++
//   }
// }

function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i]
}

function openAudioModal(transaction: any) {
  selectedAudio.value = transaction
  window.history.pushState({ modal: true }, '', '')
}

function closeAudioModal() {
  selectedAudio.value = null
  if (window.history.state?.modal) {
    window.history.back()
  }
}

function handlePopState() {
  if (selectedAudio.value) {
    selectedAudio.value = null
  }
}

function openInNewTab(transactionId: string) {
  window.open(getAudioUrl(transactionId), '_blank')
}

function copyAudioUrl(transactionId: string) {
  const url = getAudioUrl(transactionId)
  navigator.clipboard.writeText(url).then(() => {
    if (!audioCopied.value) {
      audioCopied.value = {}
    }
    audioCopied.value[transactionId] = true
    setTimeout(() => {
      if (audioCopied.value) {
        audioCopied.value[transactionId] = false
      }
    }, 2000)
  })
}

onMounted(() => {
  window.addEventListener('popstate', handlePopState)
})

onUnmounted(() => {
  window.removeEventListener('popstate', handlePopState)
})
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
</style>
