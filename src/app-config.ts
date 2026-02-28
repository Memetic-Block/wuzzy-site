export default {
  /** Metadata */
  releaseTag: (import.meta as any).env.VITE_RELEASE_TAG,
  versionSha: (import.meta as any).env.VITE_VERSION_SHA,
  versionTimestamp: (import.meta as any).env.VITE_VERSION_TIMESTAMP,
  siteHostname: (import.meta as any).env.VITE_SITE_HOSTNAME,

  /** API Endpoints */
  hyperbeamEndpoint: (import.meta as any).env.VITE_HYPERBEAM_ENDPOINT,
  gatewayEndpoint: (import.meta as any).env.VITE_GATEWAY_ENDPOINT,
  gqlEndpoint: (import.meta as any).env.VITE_GQL_ENDPOINT,
  searchApiUrl: (import.meta as any).env.VITE_SEARCH_API_URL,
  analyticsApiUrl: (import.meta as any).env.VITE_ANALYTICS_API_URL,

  /** AO Config */
  scheduler: (import.meta as any).env.VITE_HYPERBEAM_SCHEDULER,
  authority: (import.meta as any).env.VITE_HYPERBEAM_AUTHORITY,
  aoModuleId: (import.meta as any).env.VITE_AO_MODULE_ID,

  /** Feature Flags */
  enableWuzzyConsole: (import.meta as any).env.VITE_ENABLE_WUZZY_CONSOLE === 'true',

  /** Mainnet Process IDs */
  nestRegistryId: (import.meta as any).env.VITE_NEST_REGISTRY_ID,
  crawlRequestQueueId: (import.meta as any).env.VITE_CRAWL_REQUEST_QUEUE_ID,

  /** Mainnet Process Modules */
  nestModuleId: (import.meta as any).env.VITE_NEST_MODULE_ID,

  /** Mainnet Dynamic View Modules */
  nestRegistryViewModuleId: (import.meta as any).env.VITE_NEST_REGISTRY_VIEW_MODULE_ID,

  /** Legacy */
  primaryNestId: (import.meta as any).env.VITE_PRIMARY_NEST_ID,
  registryProcessId: (import.meta as any).env.VITE_REGISTRY_PROCESS_ID,
  achievementsProcessId: (import.meta as any).env.VITE_ACHIEVEMENTS_PROCESS_ID
    || 'sDQbE8v-k7hLxys85n256Xwk9AUI1-p1GbSSox652ks',
}
