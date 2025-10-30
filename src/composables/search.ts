import { ref } from 'vue'
import { type LocationQuery } from 'vue-router'

import config from '../app-config'
import type { SearchResults } from '../types/search-types'
import { convertToWayfinderUrl, convertToHttpsUrl } from '../lib/utils'

export function useSearch() {
  async function search(query: LocationQuery) {
    const pageSize = 20
    const hasSearchError = ref(false)
    const hasMoreResults = ref(false)
    const searchResults = ref<SearchResults | null>(null)

    if (Array.isArray(query.q)) {
      console.warn('Search query should not be an array')
      return
    }

    if (typeof query.q !== 'string') {
      console.warn('Search query should be a string')
      return
    }

    let q = encodeURIComponent(query.q.trim())
    const from = parseInt(query.from as string) || 0
    if (!isNaN(from) && from >= 0) {
      q += `&from=${from}`
    }

    console.log(`Search query: "${q}", from: ${from}`)

    if (q) {
      try {
        const response = await fetch(`${config.searchApiUrl}/search?q=${q}`)
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }
        const _searchResults = (await response.json()) as SearchResults
        for (const hit of _searchResults.hits) {
          hit.wayfinderUrl = convertToWayfinderUrl(hit.url)
          hit.resolvedUrl = await convertToHttpsUrl(hit.wayfinderUrl)
        }
        searchResults.value = _searchResults
        if (searchResults.value.hits.length > 0) {
          hasMoreResults.value =
            searchResults.value.hits.length < searchResults.value.total_results
        } else {
          console.warn('No search results found')
        }
        console.log('Search results:', searchResults.value)
      } catch (error) {
        hasSearchError.value = true
        console.error('Error fetching search results:', error)
      }
    } else {
      console.warn('Search query is empty')
    }

    function currentPage() {
      return Math.floor(from / pageSize) + 1
    }

    function pages() {
      if (!searchResults.value) return []
      const totalResults = searchResults.value.total_results
      const totalPages = Math.ceil(totalResults / pageSize)
      const maxDisplayPages = 10
      const displayPages = Math.min(totalPages, maxDisplayPages)

      let startPage = 1
      const current = currentPage()

      if (totalPages <= maxDisplayPages) {
        // If total pages is 10 or less, show all pages
        startPage = 1
      } else {
        // Calculate sliding window
        const halfWindow = Math.floor(maxDisplayPages / 2)
        startPage = Math.max(1, current - halfWindow)

        // Ensure we don't go past the end
        if (startPage + maxDisplayPages - 1 > totalPages) {
          startPage = totalPages - maxDisplayPages + 1
        }
      }

      return Array.from({ length: displayPages }, (_, i) => i + startPage)
    }

    return {
      hasSearchError,
      hasMoreResults,
      searchResults,
      pages: ref(pages())
    }
  }

  return { search }
}
