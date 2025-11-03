import { reactive } from 'vue'
import config from '../app-config'

// Types based on the Arweave GraphQL schema
export interface Tag {
  name: string
  value: string
}

export interface Owner {
  address: string
  key: string
}

export interface Amount {
  winston: string
  ar: string
}

export interface MetaData {
  size: string
  type?: string
}

export interface Block {
  id: string
  timestamp: number
  height: number
  previous: string
}

export interface Transaction {
  id: string
  anchor: string
  signature: string
  recipient: string
  owner: Owner
  fee: Amount
  quantity: Amount
  data: MetaData
  tags: Tag[]
  block?: Block
  bundledIn?: {
    id: string
  }
}

export interface TransactionEdge {
  cursor: string
  node: Transaction
}

export interface PageInfo {
  hasNextPage: boolean
}

export interface TransactionConnection {
  pageInfo: PageInfo
  count?: string  // Goldsky provides total count as string
  edges: TransactionEdge[]
}

export interface TagFilter {
  name?: string  // Optional - can search by values only
  values?: string[]  // Optional - can search by name only  
  op?: 'EQ' | 'NEQ'
  match?: 'EXACT' | 'WILDCARD' | 'FUZZY_AND' | 'FUZZY_OR'  // Goldsky match types
}

export interface RangeFilter {
  min?: number
  max?: number
}

export interface TransactionQueryOptions {
  ids?: string[]
  owners?: string[]
  recipients?: string[]
  tags?: TagFilter[]
  bundledIn?: string[]  // Array of bundle IDs to search within
  ingested_at?: RangeFilter
  block?: RangeFilter
  first?: number
  after?: string
  sort?: 'HEIGHT_DESC' | 'HEIGHT_ASC' | 'INGESTED_AT_DESC' | 'INGESTED_AT_ASC'
}

export interface GraphQLResponse<T = any> {
  data?: T
  errors?: Array<{
    message: string
    locations?: Array<{
      line: number
      column: number
    }>
    path?: string[]
  }>
}

export interface GQLState {
  loading: boolean
  error: string | null
  data: any
}

export function useGraphQL() {
  const defaultState = (): GQLState => ({
    loading: false,
    error: null,
    data: null
  })

  // Default GraphQL endpoint (can be overridden)
  const getGraphQLEndpoint = () => {
    // Try to get from config first, fallback to Goldsky Search Service
    const gqlEndpoint = config.gqlEndpoint
    console.log('GraphQL Endpoint config:', gqlEndpoint)
    if (gqlEndpoint) {
      const fullEndpoint = `${gqlEndpoint}/graphql`
      console.log('Using custom GraphQL endpoint:', fullEndpoint)
      return fullEndpoint
    }
    console.log('Using Goldsky Search GraphQL endpoint: https://arweave-search.goldsky.com/graphql')
    return 'https://arweave-search.goldsky.com/graphql'
  }

  /**
   * Execute a GraphQL query
   */
  async function query<T = any>(
    queryString: string,
    variables?: Record<string, any>,
    endpoint?: string
  ): Promise<GraphQLResponse<T>> {
    const url = endpoint || getGraphQLEndpoint()
    
    try {
      const requestBody = {
        query: queryString,
        variables: variables || {},
      }
      
      console.log('GraphQL Request:', {
        url,
        body: requestBody
      })
      
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify(requestBody),
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const result: GraphQLResponse<T> = await response.json()
      
      console.log('GraphQL Response:', {
        data: result.data,
        errors: result.errors
      })
      
      if (result.errors && result.errors.length > 0) {
        console.error('GraphQL Errors:', result.errors)
        throw new Error(result.errors.map(e => e.message).join(', '))
      }

      return result
    } catch (error) {
      console.error('GraphQL query error:', error)
      throw error
    }
  }

  /**
   * Execute a reactive GraphQL query
   */
  function useQuery<T = any>(
    queryString: string,
    variables?: Record<string, any>,
    options?: {
      endpoint?: string
      immediate?: boolean
    }
  ) {
    const state = reactive<GQLState>(defaultState())
    
    const execute = async () => {
      state.loading = true
      state.error = null
      
      try {
        const result = await query<T>(queryString, variables, options?.endpoint)
        state.data = result.data
      } catch (error) {
        state.error = error instanceof Error ? error.message : String(error)
      } finally {
        state.loading = false
      }
    }

    // Execute immediately if requested (default: true)
    if (options?.immediate !== false) {
      execute()
    }

    return {
      ...state,
      execute,
      refetch: execute
    }
  }

  /**
   * Get transaction count only (lightweight query)
   */
  async function getTransactionCount(options: {
    ids?: string[]
    owners?: string[]
    recipients?: string[]
    tags?: TagFilter[]
    bundledIn?: string[]
    block?: { min?: number; max?: number }
  } = {}): Promise<string | null> {
    const { ids, owners, recipients, tags, bundledIn, block } = options

    // Build arguments (minimal query - just need count)
    let args = ['first: 1'] // Request minimal data
    
    if (ids && ids.length > 0) {
      const idsStr = ids.map(id => `"${id}"`).join(', ')
      args.push(`ids: [${idsStr}]`)
    }
    
    if (owners && owners.length > 0) {
      const ownersStr = owners.map(owner => `"${owner}"`).join(', ')
      args.push(`owners: [${ownersStr}]`)
    }
    
    if (recipients && recipients.length > 0) {
      const recipientsStr = recipients.map(recipient => `"${recipient}"`).join(', ')
      args.push(`recipients: [${recipientsStr}]`)
    }
    
    if (tags && tags.length > 0) {
      const tagsStr = tags.map(tag => {
        let tagFilter = '{'
        
        if (tag.name) {
          tagFilter += ` name: "${tag.name}"`
        }
        
        if (tag.values && tag.values.length > 0) {
          if (tag.name) tagFilter += ','
          const valuesStr = tag.values.map(v => `"${v}"`).join(', ')
          tagFilter += ` values: [${valuesStr}]`
        }
        
        if (tag.op) {
          tagFilter += `, op: ${tag.op}`
        }
        
        if (tag.match) {
          tagFilter += `, match: ${tag.match}`
        }
        
        tagFilter += ' }'
        return tagFilter
      }).join(', ')
      args.push(`tags: [${tagsStr}]`)
    }
    
    if (bundledIn && bundledIn.length > 0) {
      const bundledInStr = bundledIn.map(id => `"${id}"`).join(', ')
      args.push(`bundledIn: [${bundledInStr}]`)
    }
    
    if (block) {
      let blockFilter = '{'
      if (block.min !== undefined) blockFilter += ` min: ${block.min}`
      if (block.max !== undefined) {
        if (block.min !== undefined) blockFilter += ','
        blockFilter += ` max: ${block.max}`
      }
      blockFilter += ' }'
      args.push(`block: ${blockFilter}`)
    }

    // Minimal query - only fetch count
    const queryString = `
      {
        transactions(${args.join(', ')}) {
          count
        }
      }
    `

    try {
      const endpoint = getGraphQLEndpoint()
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ query: queryString })
      })

      if (!response.ok) {
        console.error('GraphQL count request failed:', response.status)
        return null
      }

      const json: GraphQLResponse = await response.json()
      
      if (json.errors) {
        console.error('GraphQL count errors:', json.errors)
        return null
      }

      return json.data?.transactions?.count || null
    } catch (error) {
      console.error('Error fetching transaction count:', error)
      return null
    }
  }

  /**
   * Get transactions with filters
   */
  async function getTransactions(options: {
    first?: number
    after?: string
    ids?: string[]
    owners?: string[]
    recipients?: string[]
    tags?: TagFilter[]
    bundledIn?: string[]
    block?: { min?: number; max?: number }
    sort?: 'HEIGHT_ASC' | 'HEIGHT_DESC' | 'INGESTED_AT_DESC' | 'INGESTED_AT_ASC'
  } = {}): Promise<TransactionConnection> {
    const { first = 20, after, ids, owners, recipients, tags, bundledIn, block, sort } = options

    // Build arguments directly (no variables) like the working example
    let args = [`first: ${first}`]
    
    if (after) {
      args.push(`after: "${after}"`)
      console.log('Using cursor pagination with after:', after)
    }
    
    if (ids && ids.length > 0) {
      const idsStr = ids.map(id => `"${id}"`).join(', ')
      args.push(`ids: [${idsStr}]`)
    }
    
    if (owners && owners.length > 0) {
      const ownersStr = owners.map(owner => `"${owner}"`).join(', ')
      args.push(`owners: [${ownersStr}]`)
    }
    
    if (recipients && recipients.length > 0) {
      const recipientsStr = recipients.map(recipient => `"${recipient}"`).join(', ')
      args.push(`recipients: [${recipientsStr}]`)
    }
    
    if (tags && tags.length > 0) {
      const tagsStr = tags.map(tag => {
        let tagFilter = '{'
        
        // Goldsky allows name-only or values-only searches
        if (tag.name) {
          tagFilter += ` name: "${tag.name}"`
        }
        
        if (tag.values && tag.values.length > 0) {
          if (tag.name) tagFilter += ','
          const valuesStr = tag.values.map(v => `"${v}"`).join(', ')
          tagFilter += ` values: [${valuesStr}]`
        }
        
        if (tag.op) {
          tagFilter += `, op: ${tag.op}`
        }
        
        // Goldsky enhanced matching
        if (tag.match) {
          tagFilter += `, match: ${tag.match}`
        }
        
        tagFilter += ' }'
        return tagFilter
      }).join(', ')
      args.push(`tags: [${tagsStr}]`)
    }
    
    if (bundledIn && bundledIn.length > 0) {
      const bundledInStr = bundledIn.map(id => `"${id}"`).join(', ')
      args.push(`bundledIn: [${bundledInStr}]`)
    }
    
    if (block) {
      let blockFilter = '{'
      if (block.min !== undefined) blockFilter += ` min: ${block.min}`
      if (block.max !== undefined) {
        if (block.min !== undefined) blockFilter += ','
        blockFilter += ` max: ${block.max}`
      }
      blockFilter += ' }'
      args.push(`block: ${blockFilter}`)
    }
    
    if (sort) {
      args.push(`sort: ${sort}`)
    }

    // Use simple query structure like the working example
    const queryString = `
      {
        transactions(${args.join(', ')}) {
          pageInfo {
            hasNextPage
          }
          edges {
            cursor
            node {
              id
              anchor
              signature
              recipient
              owner {
                address
                key
              }
              fee {
                winston
                ar
              }
              quantity {
                winston
                ar
              }
              data {
                size
                type
              }
              tags {
                name
                value
              }
              block {
                id
                timestamp
                height
                previous
              }
              bundledIn {
                id
              }
            }
          }
        }
      }
    `

    console.log('Generated query:', queryString)

    // No variables needed with direct parameter approach
    const result = await query<{ transactions: TransactionConnection }>(queryString)
    return result.data?.transactions || { pageInfo: { hasNextPage: false }, edges: [] }
  }

  /**
   * Get a single transaction by ID
   */
  async function getTransaction(id: string): Promise<Transaction | null> {
    const queryString = `
      query GetTransaction($id: ID!) {
        transaction(id: $id) {
          id
          anchor
          signature
          recipient
          owner {
            address
            key
          }
          fee {
            winston
            ar
          }
          quantity {
            winston
            ar
          }
          data {
            size
            type
          }
          tags {
            name
            value
          }
          ingested_at
          block {
            id
            timestamp
            height
            previous
          }
          bundledIn {
            id
          }
        }
      }
    `

    const result = await query<{ transaction: Transaction }>(queryString, { id })
    return result.data?.transaction || null
  }

  /**
   * Get a block by ID
   */
  async function getBlock(id: string): Promise<Block | null> {
    const queryString = `
      query GetBlock($id: String!) {
        block(id: $id) {
          id
          timestamp
          height
          previous
        }
      }
    `

    const result = await query<{ block: Block }>(queryString, { id })
    return result.data?.block || null
  }

  /**
   * Helper to create tag filters
   */
  const createTagFilter = (name: string, values: string[], op: 'EQ' | 'NEQ' = 'EQ'): TagFilter => ({
    name,
    values,
    op
  })

  /**
   * Goldsky: Helper to create wildcard tag filter (e.g., "audio/*")
   */
  const createWildcardTagFilter = (name?: string, values?: string[]): TagFilter => ({
    name,
    values,
    match: 'WILDCARD'
  })

  /**
   * Goldsky: Helper to create fuzzy tag filter
   */
  const createFuzzyTagFilter = (name?: string, values?: string[], mode: 'AND' | 'OR' = 'OR'): TagFilter => ({
    name,
    values,
    match: mode === 'AND' ? 'FUZZY_AND' : 'FUZZY_OR'
  })

  /**
   * Goldsky: Helper to search by tag name only
   */
  const createTagNameFilter = (name: string): TagFilter => ({
    name
  })

  /**
   * Goldsky: Helper to search by tag values only  
   */
  const createTagValueFilter = (values: string[]): TagFilter => ({
    values
  })

  /**
   * Helper to create range filters
   */
  const createRangeFilter = (min?: number, max?: number): RangeFilter => ({
    min,
    max
  })

  return {
    // Core functions
    query,
    useQuery,
    
    // Convenience functions
    getTransactions,
    getTransactionCount,
    getTransaction,
    getBlock,
    
    // Helpers
    createTagFilter,
    createRangeFilter,
    
    // Goldsky enhanced helpers
    createWildcardTagFilter,
    createFuzzyTagFilter,
    createTagNameFilter,
    createTagValueFilter,
    
    // State
    defaultState
  }
}

// Export a singleton instance for convenience
export const gql = useGraphQL()
