/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_GQL_ENDPOINT: string
  readonly VITE_SEARCH_API_URL: string
  readonly VITE_ANALYTICS_API_URL: string
  readonly VITE_HYPERBEAM_ENDPOINT: string
  readonly VITE_GATEWAY_ENDPOINT: string

  /** AO Config */
  readonly VITE_HYPERBEAM_SCHEDULER: string
  readonly VITE_HYPERBEAM_AUTHORITY: string
  readonly VITE_AO_MODULE_ID: string

  // Hackathon Demo
  readonly VITE_PRIMARY_NEST_ID: string
  readonly VITE_REGISTRY_PROCESS_ID: string

  // CI/CD versioning
  readonly VITE_RELEASE_TAG: string
  readonly VITE_VERSION_SHA: string
  readonly VITE_VERSION_TIMESTAMP: string

  // SEO settings
  readonly VITE_SITE_HOSTNAME: string
  readonly VITE_ALLOW_INDEXING: string

  // Feature Flags
  readonly VITE_ENABLE_WUZZY_CONSOLE: string

  // Mainnet Process IDs
  readonly VITE_NEST_REGISTRY_ID: string
  readonly VITE_CRAWL_REQUEST_QUEUE_ID: string

  // Mainnet Process Modules
  readonly VITE_NEST_MODULE_ID: string

  // Mainnet Dynamic View Modules
  readonly VITE_NEST_REGISTRY_VIEW_MODULE_ID: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
