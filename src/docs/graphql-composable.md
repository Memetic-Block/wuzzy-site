# GraphQL Vue Composable Documentation

This GraphQL composable provides a comprehensive interface for interacting with Arweave's GraphQL API in Vue.js applications.

## Features

- ✅ Full TypeScript support with comprehensive type definitions
- ✅ Reactive queries with loading and error states
- ✅ Manual query execution
- ✅ Convenient helper functions for common operations
- ✅ Tag filtering and range filtering helpers
- ✅ Configurable endpoints
- ✅ Error handling and validation

## Installation

The composable is already included in your project at `src/composables/gql.ts`. No additional dependencies required - it uses the native `fetch` API.

## Basic Usage

### Import the Composable

```typescript
import { useGraphQL } from '../composables/gql'

// Or use the singleton instance
import { gql } from '../composables/gql'
```

### 1. Reactive Queries

Use `useQuery` for reactive GraphQL queries that automatically execute and manage loading/error states:

```typescript
import { useGraphQL } from '../composables/gql'

export default {
  setup() {
    const { useQuery } = useGraphQL()

    // Reactive query that executes immediately
    const transactionQuery = useQuery(`
      query GetRecentTransactions {
        transactions(first: 10) {
          edges {
            node {
              id
              owner {
                address
              }
              tags {
                name
                value
              }
            }
          }
        }
      }
    `)

    return {
      transactions: transactionQuery.data,
      loading: transactionQuery.loading,
      error: transactionQuery.error,
      refetch: transactionQuery.refetch
    }
  }
}
```

### 2. Manual Queries

Execute queries manually with full control:

```typescript
const { query, getTransaction, getTransactions } = useGraphQL()

// Raw GraphQL query
const result = await query(`
  query GetTransaction($id: ID!) {
    transaction(id: $id) {
      id
      owner {
        address
      }
    }
  }
`, { id: 'your-transaction-id' })

// Helper function for single transaction
const transaction = await getTransaction('your-transaction-id')

// Helper function for filtered transactions
const transactions = await getTransactions({
  owners: ['owner-address'],
  first: 20
})
```

### 3. Filtering Transactions

#### By Owner
```typescript
const transactions = await getTransactions({
  owners: ['wallet-address-1', 'wallet-address-2'],
  first: 10
})
```

#### By Tags
```typescript
const { createTagFilter } = useGraphQL()

const transactions = await getTransactions({
  tags: [
    createTagFilter('Content-Type', ['application/json']),
    createTagFilter('App-Name', ['MyApp'])
  ],
  first: 10
})
```

#### By Block Height Range
```typescript
const { createRangeFilter } = useGraphQL()

const transactions = await getTransactions({
  block: createRangeFilter(1000000, 1100000), // Between block heights
  first: 10
})
```

#### By Multiple Criteria
```typescript
const transactions = await getTransactions({
  owners: ['owner-address'],
  tags: [createTagFilter('Content-Type', ['image/png', 'image/jpeg'])],
  block: createRangeFilter(1000000), // From block 1000000 onwards
  first: 50,
  after: 'cursor-for-pagination'
})
```

### 4. Pagination

Use the `after` parameter and `pageInfo` for pagination:

```typescript
let allTransactions = []
let cursor = undefined

do {
  const result = await getTransactions({
    first: 100,
    after: cursor
  })
  
  allTransactions.push(...result.edges.map(edge => edge.node))
  cursor = result.edges[result.edges.length - 1]?.cursor
} while (result.pageInfo.hasNextPage)
```

### 5. Custom Endpoints

Override the default GraphQL endpoint:

```typescript
const customResult = await query(
  'query { transactions(first: 1) { edges { node { id } } } }',
  {},
  'https://your-custom-endpoint.com/graphql'
)
```

## Type Definitions

The composable includes comprehensive TypeScript types:

```typescript
interface Transaction {
  id: string
  owner: Owner
  tags: Tag[]
  data: MetaData
  block?: Block
  // ... more fields
}

interface TransactionQueryOptions {
  ids?: string[]
  owners?: string[]
  recipients?: string[]
  tags?: TagFilter[]
  bundledIn?: string[]
  first?: number
  after?: string
  // ... more options
}
```

## Helper Functions

### Tag Filters
```typescript
const { createTagFilter } = useGraphQL()

// Exact match (default)
const exactFilter = createTagFilter('Content-Type', ['application/json'])

// Not equal
const notFilter = createTagFilter('Status', ['deleted'], 'NEQ')
```

### Range Filters
```typescript
const { createRangeFilter } = useGraphQL()

// From minimum value
const fromFilter = createRangeFilter(1000000)

// To maximum value  
const toFilter = createRangeFilter(undefined, 2000000)

// Between values
const betweenFilter = createRangeFilter(1000000, 2000000)
```

## Error Handling

All functions properly handle and throw errors:

```typescript
try {
  const transaction = await getTransaction('invalid-id')
} catch (error) {
  console.error('Failed to fetch transaction:', error.message)
}

// Or with reactive queries
const query = useQuery('{ invalid query }')
if (query.error) {
  console.error('Query failed:', query.error)
}
```

## Configuration

The composable automatically detects your GraphQL endpoint from:

1. `config.hyperbeamEndpoint + '/graphql'` (if available)
2. Falls back to `'https://arweave.net/graphql'`

You can override this by passing a custom endpoint to any query function.

## Examples

See `src/examples/GraphQLExample.vue` for comprehensive usage examples including:

- Reactive queries
- Manual transaction lookups
- Owner-based filtering
- Tag-based filtering
- Custom raw queries
- Error handling patterns

## Performance Tips

1. Use `first` parameter to limit result set sizes
2. Use specific tag filters to narrow results
3. Prefer `getTransaction` for single transaction lookups
4. Use pagination for large datasets
5. Cache results when appropriate