export default {
  hyperbeamEndpoint: (import.meta as any).env.VITE_HYPERBEAM_ENDPOINT,
  gqlEndpoint: (import.meta as any).env.VITE_GQL_ENDPOINT,
  primaryNestId: (import.meta as any).env.VITE_PRIMARY_NEST_ID,
  registryProcessId: (import.meta as any).env.VITE_REGISTRY_PROCESS_ID,
  releaseTag: (import.meta as any).env.VITE_RELEASE_TAG,
  searchApiUrl: (import.meta as any).env.VITE_SEARCH_API_URL,
  analyticsApiUrl: (import.meta as any).env.VITE_ANALYTICS_API_URL,
  versionSha: (import.meta as any).env.VITE_VERSION_SHA,
  versionTimestamp: (import.meta as any).env.VITE_VERSION_TIMESTAMP,
  siteHostname: (import.meta as any).env.VITE_SITE_HOSTNAME,
  allowIndexing: (import.meta as any).env.VITE_ALLOW_INDEXING === 'true'
}
