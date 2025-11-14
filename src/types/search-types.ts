export interface IndexedDocument {
  id: string
  last_crawled_at: string
  title: string
  body: string
  meta_description: string
  links: string[]
  headings: string[]
  url: string
  url_scheme: string
  url_host: string
  url_port: number
  url_path: string
  url_path_dir1: string
  url_path_dir2: string

  wayfinderUrl: `ar://${string}`
  resolvedUrl: string
}

export interface SearchResults {
  took: number
  total_results: number
  hits: IndexedDocument[]
}

// Media Search Types
export type MediaType = 'image' | 'video' | 'audio'

export interface MediaSearchOptions {
  mediaType: MediaType
  defaultFormats: string[]
  resultsPerPage?: number
}

export interface MediaSearchState {
  searchQuery: string
  selectedFormats: string[]
  currentPage: number
  loading: boolean
  isSearching: boolean
  error: string | null
  info: string | null
  lastCursor?: string
  totalCount: string | null
}

export interface PaginationControls {
  goToNextPage: () => Promise<void>
  goToPrevPage: () => void
  goToPage: (page: number) => void
  loadMore: () => Promise<void>
}
