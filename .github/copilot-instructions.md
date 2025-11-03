# Wuzzy Site - AI Coding Agent Instructions

## Architecture Overview
This is a Vue 3 + TypeScript frontend for Wuzzy, an advanced Arweave search platform with intelligent query syntax detection. The app uses **Vite SSG** for static site generation and deploys to Arweave via Turbo SDK.

### Key Components
- **Search System**: Multi-modal search (text, images, audio, video, transactions) with smart syntax detection
- **GraphQL Integration**: Arweave blockchain queries via Goldsky endpoints
- **Nest/Registry System**: Manages Wuzzy process instances and crawlers
- **Arweave Deployment**: Custom deployment pipeline using ANT processes

## Configuration Pattern
Environment variables are centralized in `src/app-config.ts`. Required vars:
- `VITE_REGISTRY_PROCESS_ID` - Wuzzy Nest Registry Process
- `VITE_PRIMARY_NEST_ID` - Homepage search nest
- `VITE_HYPERBEAM_ENDPOINT` - Hyperbeam node
- `VITE_SEARCH_API_URL` - Search API endpoint

## Search Intelligence
The core feature is intelligent query syntax detection in `src/components/TransactionSearch.vue`:
- **Wildcard**: `audio/*` → Yellow chips, `WILDCARD` match
- **Exact**: `"phrase"` → Blue chips, `EXACT` match  
- **Fuzzy OR**: `jazz,blues` → Green chips, `FUZZY_OR` match
- **Fuzzy AND**: `separate tags` → Pink chips, `FUZZY_AND` match
- **Value-only**: `tag:=MirrorXYZ` → Special targeting

Search chips are reactive UI elements with color-coded match types. See `searchChips` array management.

## Composables Architecture
- **`useSearch()`**: Core search functionality with URL conversion (`wayfinderUrl` → `resolvedUrl`)
- **`useGql()`**: GraphQL operations for Arweave transactions with pagination
- **`useWallet()`**: Arweave wallet integration

## Development Workflow
```bash
npm run dev          # Vite dev server (localhost:5173)
npm run build        # Vue-tsc + vite-ssg build with --mock
npm run deploy:arweave  # Deploy to Arweave via scripts/deploy.ts
```

## Deployment System
Two deployment paths:
1. **Arweave**: `scripts/deploy.ts` uses Turbo SDK with ANT process management
2. **Static**: Wrangler Pages for traditional hosting

The Arweave deployment requires `PRIVATE_KEY` (wallet path) and `ANT_PROCESS_ID`. Uses `undername` routing (dev/stage/@).

## File Patterns
- **Views**: Route-level components in `src/views/` (index, search, nest, etc.)
- **Components**: Reusable UI in `src/components/` with shadcn-vue structure
- **Types**: Domain models in `src/types/` (search-types, wuzzy-nest, ario-gql)
- **Operations**: Deployment configs in `operations/` (Nomad HCL files)

## Key Integrations
- **Reka UI/Radix**: Component library with Tailwind CSS v4
- **Vite SSG**: Static generation with route-based code splitting
- **Arweave SDK**: Direct blockchain interaction via `@ar.io/sdk`
- **Goldsky GraphQL**: Enhanced Arweave querying capabilities

## Testing/Debugging
No formal test suite. Debug via:
- Vite dev tools and Vue DevTools
- Console logging in composables (search.ts has extensive logging)
- Network tab for API calls to `VITE_SEARCH_API_URL`

## Common Patterns
- Reactive refs for loading states (`hasSearchError`, `hasMoreResults`)
- URL-based state management via router queries
- Error boundaries with fallback UI states
- Responsive design with Tailwind breakpoints

## Notes
- Do not run the app itself, the user will handle manual spot testing.
- Make sure the app compiles with `npm run build`
