import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'

import type { MediaSearchOptions } from '../types/search-types'
import type { ApplicationType } from '../types/analytics'
import { useGraphQL, type TransactionConnection } from './gql'
import { useAnalytics } from './analytics'
import { analyticsQueue } from './analytics-queue'
import { useWallet } from './wallet'
import { useAchievements } from './achievements'

/**
 * Media Search Composable
 * Consolidates search logic for image/video/audio searches
 */
export function useMediaSearch(options: MediaSearchOptions) {
  const router = useRouter()
  const { getTransactions, getTransactionCount } = useGraphQL()
  const analytics = useAnalytics()
  const { address } = useWallet()
  const { refreshAchievements } = useAchievements(address)

  const resultsPerPage = options.resultsPerPage || 20

  // Analytics state
  const currentQueryId = ref<string | null>(null)

  // Application type mapping
  const applicationType = computed<ApplicationType>(() => {
    switch (options.mediaType) {
      case 'image':
        return 'graphql-images'
      case 'audio':
        return 'graphql-audio'
      case 'video':
        return 'graphql-video'
      default:
        return 'graphql-images'
    }
  })

  // Get default wildcard format based on media type
  const getWildcardFormat = () => {
    switch (options.mediaType) {
      case 'image':
        return 'image/*'
      case 'video':
        return 'video/*'
      case 'audio':
        return 'audio/*'
    }
  }

  // State
  const searchQuery = ref<string>('')
  const selectedFormats = ref<string[]>(options.defaultFormats)
  const currentPage = ref(1)
  const loading = ref(false)
  const isSearching = ref(false)
  const error = ref<string | null>(null)
  const info = ref<string | null>(null)
  const results = ref<TransactionConnection | null>(null)
  const allResults = ref<any[]>([])
  const lastCursor = ref<string | undefined>()
  const totalCount = ref<string | null>(null)

  // Helper: Parse search terms to handle quoted phrases
  function parseSearchTerms(query: string): string[] {
    const terms: string[] = []
    let current = ''
    let inQuotes = false

    for (let i = 0; i < query.length; i++) {
      const char = query[i]

      if (char === '"') {
        inQuotes = !inQuotes
      } else if (char === ' ' && !inQuotes) {
        if (current.trim()) {
          terms.push(current.trim())
          current = ''
        }
      } else {
        current += char
      }
    }

    if (current.trim()) {
      terms.push(current.trim())
    }

    return terms
  }

  // Computed: Paginated results (current page slice)
  const paginatedResults = computed(() => {
    const start = (currentPage.value - 1) * resultsPerPage
    const end = start + resultsPerPage
    return allResults.value.slice(start, end)
  })

  // Computed: Total pages
  const totalPages = computed(() => {
    if (totalCount.value) {
      return Math.ceil(parseInt(totalCount.value) / resultsPerPage)
    }
    const cachedPages = Math.ceil(allResults.value.length / resultsPerPage)
    if (
      results.value?.pageInfo.hasNextPage &&
      allResults.value.length >= cachedPages * resultsPerPage
    ) {
      return cachedPages + 1
    }
    return cachedPages
  })

  // Computed: Can go to next page
  const canGoNext = computed(() => {
    if (totalCount.value) {
      const maxPages = Math.ceil(parseInt(totalCount.value) / resultsPerPage)
      return currentPage.value < maxPages
    }
    const cachedPages = Math.ceil(allResults.value.length / resultsPerPage)
    return currentPage.value < cachedPages || results.value?.pageInfo.hasNextPage
  })

  // Computed: Can go to previous page
  const canGoPrev = computed(() => currentPage.value > 1)

  // Computed: Page numbers to display
  const pageNumbers = computed(() => {
    const pages: number[] = []
    const maxPagesToShow = 5
    const halfRange = Math.floor(maxPagesToShow / 2)

    let startPage = Math.max(1, currentPage.value - halfRange)
    let endPage = Math.min(totalPages.value, currentPage.value + halfRange)

    if (currentPage.value <= halfRange) {
      endPage = Math.min(totalPages.value, maxPagesToShow)
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(i)
    }

    return pages
  })

  // Execute search
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
    totalCount.value = null

    try {
      const queryOptions: any = {
        tags: [],
        first: 100
      }

      const formatValues: string[] = []
      const wildcardFormat = getWildcardFormat()

      for (const format of selectedFormats.value) {
        if (format === wildcardFormat) {
          queryOptions.tags.push({
            name: 'Content-Type',
            values: [wildcardFormat],
            match: 'WILDCARD'
          })
        } else if (options.mediaType === 'image' && format === 'image/jpeg') {
          // Special handling for JPEG (both jpg and jpeg)
          formatValues.push('image/jpg', 'image/jpeg')
        } else {
          formatValues.push(format)
        }
      }

      if (formatValues.length > 0) {
        queryOptions.tags.push({
          name: 'Content-Type',
          values: formatValues
        })
      }

      const words = parseSearchTerms(query)
      if (words.length > 0) {
        queryOptions.tags.push({
          values: words,
          match: 'FUZZY_AND'
        })
      }

      results.value = await getTransactions(queryOptions)
      allResults.value = results.value.edges.map((edge) => edge.node)

      // Track search query with analytics
      try {
        const queryId = await analytics.submitQuery(
          applicationType.value,
          query,
          allResults.value.map((node) => node.id),
          {
            selected_formats: selectedFormats.value.join(','),
            result_count: allResults.value.length.toString(),
            graphql_query: JSON.stringify(queryOptions)
          }
        )
        currentQueryId.value = queryId

        // Flush queue for immediate delivery
        analyticsQueue.flush()
      } catch (analyticsError) {
        console.error('Analytics tracking failed:', analyticsError)
        // Don't block search on analytics failure
      }

      if (results.value.edges.length > 0) {
        lastCursor.value = results.value.edges[results.value.edges.length - 1].cursor
      }

      // Fetch count asynchronously
      const countOptions = {
        ids: queryOptions.ids,
        owners: queryOptions.owners,
        recipients: queryOptions.recipients,
        tags: queryOptions.tags,
        bundledIn: queryOptions.bundledIn,
        block: queryOptions.block
      }
      getTransactionCount(countOptions)
        .then((count) => {
          totalCount.value = count
        })
        .catch((err) => {
          console.error('Failed to fetch count:', err)
        })
    } catch (err) {
      error.value = err instanceof Error ? err.message : String(err)
      results.value = null
    } finally {
      loading.value = false
      isSearching.value = false
      refreshAchievements()
    }
  }

  // Load more results (for pagination beyond cached data)
  async function loadMore() {
    const query = searchQuery.value.trim()

    if (!query || !lastCursor.value || !results.value) return

    loading.value = true
    error.value = null

    try {
      const queryOptions: any = {
        tags: [],
        first: 100,
        after: lastCursor.value
      }

      const formatValues: string[] = []
      const wildcardFormat = getWildcardFormat()

      for (const format of selectedFormats.value) {
        if (format === wildcardFormat) {
          queryOptions.tags.push({
            name: 'Content-Type',
            values: [wildcardFormat],
            match: 'WILDCARD'
          })
        } else if (options.mediaType === 'image' && format === 'image/jpeg') {
          formatValues.push('image/jpg', 'image/jpeg')
        } else {
          formatValues.push(format)
        }
      }

      if (formatValues.length > 0) {
        queryOptions.tags.push({
          name: 'Content-Type',
          values: formatValues
        })
      }

      const words = parseSearchTerms(query)
      if (words.length > 0) {
        queryOptions.tags.push({
          values: words,
          match: 'FUZZY_AND'
        })
      }

      const moreResults = await getTransactions(queryOptions)

      allResults.value.push(...moreResults.edges.map((edge) => edge.node))
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

  // Handle format change
  function onFormatChange(event: Event) {
    const target = event.target as HTMLInputElement
    const value = target.value
    const wildcardFormat = getWildcardFormat()

    if (value === wildcardFormat) {
      if (target.checked) {
        selectedFormats.value = [wildcardFormat]
      } else {
        if (
          selectedFormats.value.length === 1 &&
          selectedFormats.value[0] === wildcardFormat
        ) {
          target.checked = true
          return
        }
      }
    } else {
      if (target.checked) {
        selectedFormats.value = selectedFormats.value.filter((f) => f !== wildcardFormat)
        selectedFormats.value.push(value)
      } else {
        selectedFormats.value = selectedFormats.value.filter((f) => f !== value)
        if (selectedFormats.value.length === 0) {
          selectedFormats.value = [wildcardFormat]
        }
      }
    }

    router.replace({
      query: {
        q: searchQuery.value,
        format: selectedFormats.value.join(',')
      }
    })

    if (searchQuery.value.trim()) {
      executeSearch()
    }
  }

  // Pagination controls
  async function goToNextPage() {
    const cachedPages = Math.ceil(allResults.value.length / resultsPerPage)
    const nextPage = currentPage.value + 1

    if (nextPage > cachedPages && results.value?.pageInfo.hasNextPage) {
      await loadMore()
    }

    router.push({
      query: {
        q: searchQuery.value,
        format: selectedFormats.value.join(','),
        page: nextPage.toString()
      }
    })
  }

  function goToPrevPage() {
    if (currentPage.value > 1) {
      router.push({
        query: {
          q: searchQuery.value,
          format: selectedFormats.value.join(','),
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
          format: selectedFormats.value.join(','),
          page: page.toString()
        }
      })
    }
  }

  return {
    // State
    searchQuery,
    selectedFormats,
    currentPage,
    loading,
    isSearching,
    error,
    info,
    results,
    totalCount,
    currentQueryId,
    
    // Data (expose both for flexibility)
    allResults,
    paginatedResults,
    
    // Computed
    totalPages,
    canGoNext,
    canGoPrev,
    pageNumbers,
    
    // Methods
    executeSearch,
    loadMore,
    onFormatChange,
    goToNextPage,
    goToPrevPage,
    goToPage
  }
}

