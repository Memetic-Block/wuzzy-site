/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_HYPERBEAM_ENDPOINT: string
  readonly VITE_GQL_ENDPOINT: string
  readonly VITE_PRIMARY_NEST_ID: string
  readonly VITE_REGISTRY_PROCESS_ID: string
  readonly VITE_RELEASE_TAG: string
  readonly VITE_SEARCH_API_URL: string
  readonly VITE_ANALYTICS_API_URL: string
  readonly VITE_VERSION_SHA: string
  readonly VITE_VERSION_TIMESTAMP: string
  readonly VITE_SITE_HOSTNAME: string
  readonly VITE_ALLOW_INDEXING: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
