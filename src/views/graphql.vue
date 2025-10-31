<template>
  <div class="graphql-example p-6">
    <h2 class="text-2xl font-bold mb-6">GraphQL Composable Examples</h2>

    <div class="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
      <p class="text-blue-800 mb-2">
        <strong>💡 Looking for a user-friendly search interface?</strong>
      </p>
      <p class="text-blue-700">
        Try our <a href="/transaction-search" class="underline font-semibold hover:text-blue-900">Transaction Search Tool</a> 
        with a simple query syntax like <code class="bg-blue-100 px-1 rounded">owner:address tags:Content-Type=application/json</code>
      </p>
    </div>

    <!-- Example 1: Reactive Query -->
    <section class="mb-8">
      <h3 class="text-xl font-semibold mb-4">1. Reactive Transaction Query</h3>
      <div class="bg-gray-100 p-4 rounded-lg mb-4">
        <button 
          @click="refetchTransactions" 
          :disabled="transactionQuery.loading"
          class="bg-blue-500 text-white px-4 py-2 rounded disabled:bg-gray-400"
        >
          {{ transactionQuery.loading ? 'Loading...' : 'Refetch Transactions' }}
        </button>
      </div>
      
      <div v-if="transactionQuery.error" class="text-red-600 mb-4">
        Error: {{ transactionQuery.error }}
      </div>
      
      <div v-if="transactionQuery.data">
        <p class="mb-2">Found {{ transactionQuery.data.transactions.edges.length }} transactions</p>
        <div class="space-y-2 max-h-64 overflow-y-auto">
          <div 
            v-for="edge in transactionQuery.data.transactions.edges" 
            :key="edge.node.id"
            class="border p-2 rounded text-sm"
          >
            <strong>ID:</strong> {{ edge.node.id }}<br>
            <strong>Owner:</strong> {{ edge.node.owner.address }}<br>
            <strong>Size:</strong> {{ edge.node.data.size }} bytes
            <div v-if="edge.node.tags.length > 0" class="mt-1">
              <strong>Tags:</strong>
              <span v-for="tag in edge.node.tags" :key="tag.name" class="inline-block mr-2">
                {{ tag.name }}={{ tag.value }}
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Example 2: Manual Query -->
    <section class="mb-8">
      <h3 class="text-xl font-semibold mb-4">2. Manual Transaction Lookup</h3>
      <div class="bg-gray-100 p-4 rounded-lg mb-4">
        <input 
          v-model="transactionId" 
          placeholder="Enter transaction ID"
          class="w-full p-2 border rounded mb-2"
        >
        <button 
          @click="fetchSingleTransaction" 
          :disabled="fetchingTransaction"
          class="bg-green-500 text-white px-4 py-2 rounded disabled:bg-gray-400"
        >
          {{ fetchingTransaction ? 'Loading...' : 'Fetch Transaction' }}
        </button>
      </div>
      
      <div v-if="singleTransactionError" class="text-red-600 mb-4">
        Error: {{ singleTransactionError }}
      </div>
      
      <div v-if="singleTransaction" class="border p-4 rounded">
        <h4 class="font-semibold mb-2">Transaction Details</h4>
        <pre class="text-sm overflow-x-auto">{{ JSON.stringify(singleTransaction, null, 2) }}</pre>
      </div>
    </section>

    <!-- Example 3: Filtered Query -->
    <section class="mb-8">
      <h3 class="text-xl font-semibold mb-4">3. Filtered Query (By Owner)</h3>
      <div class="bg-gray-100 p-4 rounded-lg mb-4">
        <input 
          v-model="ownerAddress" 
          placeholder="Enter owner address"
          class="w-full p-2 border rounded mb-2"
        >
        <button 
          @click="fetchTransactionsByOwner" 
          :disabled="fetchingByOwner"
          class="bg-purple-500 text-white px-4 py-2 rounded disabled:bg-gray-400"
        >
          {{ fetchingByOwner ? 'Loading...' : 'Fetch by Owner' }}
        </button>
      </div>
      
      <div v-if="ownerTransactionsError" class="text-red-600 mb-4">
        Error: {{ ownerTransactionsError }}
      </div>
      
      <div v-if="ownerTransactions">
        <p class="mb-2">Found {{ ownerTransactions.edges.length }} transactions for this owner</p>
        <div class="space-y-2 max-h-64 overflow-y-auto">
          <div 
            v-for="edge in ownerTransactions.edges" 
            :key="edge.node.id"
            class="border p-2 rounded text-sm"
          >
            <strong>ID:</strong> {{ edge.node.id }}<br>
            <strong>Block Height:</strong> {{ edge.node.block?.height || 'Pending' }}<br>
            <strong>Size:</strong> {{ edge.node.data.size }} bytes
          </div>
        </div>
      </div>
    </section>

    <!-- Example 4: Tag-based Query -->
    <section class="mb-8">
      <h3 class="text-xl font-semibold mb-4">4. Tag-based Query</h3>
      <div class="bg-gray-100 p-4 rounded-lg mb-4">
        <div class="grid grid-cols-2 gap-2 mb-2">
          <input 
            v-model="tagName" 
            placeholder="Tag name (e.g., Content-Type)"
            class="p-2 border rounded"
          >
          <input 
            v-model="tagValue" 
            placeholder="Tag value (e.g., application/json)"
            class="p-2 border rounded"
          >
        </div>
        <button 
          @click="fetchTransactionsByTag" 
          :disabled="fetchingByTag"
          class="bg-orange-500 text-white px-4 py-2 rounded disabled:bg-gray-400"
        >
          {{ fetchingByTag ? 'Loading...' : 'Fetch by Tag' }}
        </button>
      </div>
      
      <div v-if="tagTransactionsError" class="text-red-600 mb-4">
        Error: {{ tagTransactionsError }}
      </div>
      
      <div v-if="tagTransactions">
        <p class="mb-2">Found {{ tagTransactions.edges.length }} transactions with this tag</p>
        <div class="space-y-2 max-h-64 overflow-y-auto">
          <div 
            v-for="edge in tagTransactions.edges" 
            :key="edge.node.id"
            class="border p-2 rounded text-sm"
          >
            <strong>ID:</strong> {{ edge.node.id }}<br>
            <strong>Owner:</strong> {{ edge.node.owner.address }}<br>
            <div v-if="edge.node.tags.length > 0" class="mt-1">
              <strong>All Tags:</strong>
              <div class="ml-2">
                <div v-for="tag in edge.node.tags" :key="tag.name" class="text-xs">
                  {{ tag.name }}: {{ tag.value }}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Raw GraphQL Query Example -->
    <section>
      <h3 class="text-xl font-semibold mb-4">5. Raw GraphQL Query</h3>
      <div class="bg-gray-100 p-4 rounded-lg mb-4">
        <textarea 
          v-model="customQuery" 
          placeholder="Enter your GraphQL query"
          class="w-full p-2 border rounded mb-2 h-32 font-mono text-sm"
        ></textarea>
        <button 
          @click="executeCustomQuery" 
          :disabled="executingCustom"
          class="bg-red-500 text-white px-4 py-2 rounded disabled:bg-gray-400"
        >
          {{ executingCustom ? 'Executing...' : 'Execute Query' }}
        </button>
      </div>
      
      <div v-if="customQueryError" class="text-red-600 mb-4">
        Error: {{ customQueryError }}
      </div>
      
      <div v-if="customQueryResult" class="border p-4 rounded">
        <h4 class="font-semibold mb-2">Query Result</h4>
        <pre class="text-sm overflow-x-auto max-h-96 overflow-y-auto">{{ JSON.stringify(customQueryResult, null, 2) }}</pre>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useGraphQL, type Transaction, type TransactionConnection } from '../composables/gql'

const { useQuery, getTransaction, getTransactions, query, createTagFilter } = useGraphQL()

// Example 1: Reactive query
const transactionQuery = useQuery<{ transactions: TransactionConnection }>(`
  query GetRecentTransactions {
    transactions(first: 5) {
      pageInfo {
        hasNextPage
      }
      edges {
        cursor
        node {
          id
          owner {
            address
          }
          data {
            size
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

const refetchTransactions = () => {
  transactionQuery.refetch()
}

// Example 2: Manual transaction lookup
const transactionId = ref('')
const singleTransaction = ref<Transaction | null>(null)
const singleTransactionError = ref<string | null>(null)
const fetchingTransaction = ref(false)

const fetchSingleTransaction = async () => {
  if (!transactionId.value) return
  
  fetchingTransaction.value = true
  singleTransactionError.value = null
  
  try {
    singleTransaction.value = await getTransaction(transactionId.value)
  } catch (error) {
    singleTransactionError.value = error instanceof Error ? error.message : String(error)
  } finally {
    fetchingTransaction.value = false
  }
}

// Example 3: Filtered by owner
const ownerAddress = ref('')
const ownerTransactions = ref<TransactionConnection | null>(null)
const ownerTransactionsError = ref<string | null>(null)
const fetchingByOwner = ref(false)

const fetchTransactionsByOwner = async () => {
  if (!ownerAddress.value) return
  
  fetchingByOwner.value = true
  ownerTransactionsError.value = null
  
  try {
    ownerTransactions.value = await getTransactions({
      owners: [ownerAddress.value],
      first: 10
    })
  } catch (error) {
    ownerTransactionsError.value = error instanceof Error ? error.message : String(error)
  } finally {
    fetchingByOwner.value = false
  }
}

// Example 4: Tag-based query
const tagName = ref('Content-Type')
const tagValue = ref('application/json')
const tagTransactions = ref<TransactionConnection | null>(null)
const tagTransactionsError = ref<string | null>(null)
const fetchingByTag = ref(false)

const fetchTransactionsByTag = async () => {
  if (!tagName.value || !tagValue.value) return
  
  fetchingByTag.value = true
  tagTransactionsError.value = null
  
  try {
    tagTransactions.value = await getTransactions({
      tags: [createTagFilter(tagName.value, [tagValue.value])],
      first: 5
    })
  } catch (error) {
    tagTransactionsError.value = error instanceof Error ? error.message : String(error)
  } finally {
    fetchingByTag.value = false
  }
}

// Example 5: Custom query
const customQuery = ref(`query GetBlocks {
  blocks(first: 3) {
    edges {
      node {
        id
        height
        timestamp
      }
    }
  }
}`)
const customQueryResult = ref<any>(null)
const customQueryError = ref<string | null>(null)
const executingCustom = ref(false)

const executeCustomQuery = async () => {
  if (!customQuery.value) return
  
  executingCustom.value = true
  customQueryError.value = null
  
  try {
    const result = await query(customQuery.value)
    customQueryResult.value = result.data
  } catch (error) {
    customQueryError.value = error instanceof Error ? error.message : String(error)
  } finally {
    executingCustom.value = false
  }
}
</script>

<style scoped>
/* Add any component-specific styles here */
</style>