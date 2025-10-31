<template>
  <div class="transaction-search-page">
    <div class="page-header">
      <h1>Transaction Search</h1>
      <p class="subtitle">
        Search Arweave transactions using a simple query syntax. 
        Enter search criteria in <code>name:value</code> format.
      </p>
    </div>

    <TransactionSearch ref="transactionSearchRef" />

    <div class="documentation-section">
      <details>
        <summary>Query Syntax Documentation</summary>
        
        <div class="docs-content">
          <div class="clickable-notice">
            <p>💡 <strong>Pro tip:</strong> All code examples below are clickable! Click any example to automatically fill the search bar and try it out.</p>
          </div>
          
          <h3>Supported Query Parameters</h3>
          
          <div class="param-section">
            <h4><code>owner</code> / <code>owners</code></h4>
            <p>Find transactions by owner wallet address(es)</p>
            <div class="examples">
              <code @click="setExampleQuery('owner:4Tb6AwCp8c_bi-wsAKI3MM_fe5oJFEOA2Qvs2JGg6_g')" class="clickable-example">owner:4Tb6AwCp8c_bi-wsAKI3MM_fe5oJFEOA2Qvs2JGg6_g</code>
              <code @click="setExampleQuery('owners:addr1,addr2,addr3')" class="clickable-example">owners:addr1,addr2,addr3</code>
            </div>
          </div>

          <div class="param-section">
            <h4><code>recipient</code> / <code>recipients</code></h4>
            <p>Find transactions by recipient address(es)</p>
            <div class="examples">
              <code @click="setExampleQuery('recipient:target-wallet-address')" class="clickable-example">recipient:target-wallet-address</code>
              <code @click="setExampleQuery('recipients:addr1,addr2')" class="clickable-example">recipients:addr1,addr2</code>
            </div>
          </div>

          <div class="param-section">
            <h4><code>tags</code></h4>
            <p>Find transactions by tag name and value. Special syntax for tag filtering.</p>
            <div class="examples">
              <code @click="setExampleQuery('tags:Content-Type=application/json')" class="clickable-example">tags:Content-Type=application/json</code>
              <code @click="setExampleQuery('tags:Content-Type=image/png first:5')" class="clickable-example">tags:Content-Type=image/png</code>
              <code @click="setExampleQuery('tags:App-Name=MyApp')" class="clickable-example">tags:App-Name=MyApp</code>
              <code @click="setExampleQuery('tags:Type=Process')" class="clickable-example">tags:Type=Process</code>
              <code @click="setExampleQuery('tags:Protocol=AO')" class="clickable-example">tags:Protocol=AO</code>
            </div>
          </div>

          <div class="param-section">
            <h4><code>id</code> / <code>ids</code></h4>
            <p>Find specific transaction(s) by ID</p>
            <div class="examples">
              <code @click="setExampleQuery('id:specific-transaction-id')" class="clickable-example">id:specific-transaction-id</code>
              <code @click="setExampleQuery('ids:tx1,tx2,tx3')" class="clickable-example">ids:tx1,tx2,tx3</code>
            </div>
          </div>

          <div class="param-section">
            <h4><code>block</code> / <code>height</code></h4>
            <p>Find transactions within block height range</p>
            <div class="examples">
              <code @click="setExampleQuery('block:1000000 first:10')" class="clickable-example">block:1000000</code> (from block 1000000 onwards)
              <code @click="setExampleQuery('block:1000000-1100000 first:10')" class="clickable-example">block:1000000-1100000</code> (between blocks)
              <code @click="setExampleQuery('height:900000-1000000 first:10')" class="clickable-example">height:900000-1000000</code>
            </div>
          </div>

          <div class="param-section">
            <h4><code>first</code> / <code>limit</code></h4>
            <p>Limit number of results (max 100)</p>
            <div class="examples">
              <code @click="setExampleQuery('first:20')" class="clickable-example">first:20</code>
              <code @click="setExampleQuery('limit:50')" class="clickable-example">limit:50</code>
            </div>
          </div>

          <div class="param-section">
            <h4><code>bundled</code> / <code>bundledin</code></h4>
            <p>Find data items within specific bundles</p>
            <div class="examples">
              <code @click="setExampleQuery('bundled:bundle-transaction-id')" class="clickable-example">bundled:bundle-transaction-id</code>
              <code @click="setExampleQuery('bundledin:bundle1,bundle2')" class="clickable-example">bundledin:bundle1,bundle2</code>
            </div>
          </div>

          <h3>Complex Query Examples</h3>
          
          <div class="complex-examples">
            <div class="example-item">
              <h4>AO Process Messages</h4>
              <code @click="setExampleQuery('tags:Type=Message tags:Data-Protocol=ao first:5')" class="clickable-example">tags:Type=Message tags:Data-Protocol=ao first:5</code>
            </div>
            
            <div class="example-item">
              <h4>Recent JSON Data</h4>
              <code @click="setExampleQuery('tags:Content-Type=application/json first:5')" class="clickable-example">tags:Content-Type=application/json first:5</code>
            </div>
            
            <div class="example-item">
              <h4>Browse Images (with preview)</h4>
              <code @click="setExampleQuery('tags:Content-Type=image/jpeg first:5')" class="clickable-example">tags:Content-Type=image/jpeg first:5</code>
            </div>
            
            <div class="example-item">
              <h4>Specific User's Images</h4>
              <code @click="setExampleQuery('owner:wallet-address tags:Content-Type=image/png first:20')" class="clickable-example">owner:wallet-address tags:Content-Type=image/png first:20</code>
            </div>
            
            <div class="example-item">
              <h4>App-specific Data</h4>
              <code @click="setExampleQuery('tags:App-Name=MyApp tags:Version=1.0 first:15')" class="clickable-example">tags:App-Name=MyApp tags:Version=1.0 first:15</code>
            </div>
          </div>

          <h3>Tips</h3>
          <ul class="tips-list">
            <li>Use quotes for values with spaces: <code @click="setExampleQuery('tags:Title=&quot;My File Name&quot; first:5')" class="clickable-example">tags:Title="My File Name"</code></li>
            <li>Combine multiple criteria with spaces: <code @click="setExampleQuery('owner:address tags:Type=Image first:10')" class="clickable-example">owner:address tags:Type=Image first:10</code></li>
            <li>Block ranges use dash notation: <code @click="setExampleQuery('block:1000-2000 first:10')" class="clickable-example">block:1000-2000</code></li>
            <li>Tag filters support exact matching with the <code>=</code> operator</li>
            <li>Results are paginated - use "Load More" for additional results</li>
            <li>Maximum 100 results per request (use <code>first:100</code>)</li>
          </ul>
        </div>
      </details>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import TransactionSearch from '../components/TransactionSearch.vue'

const transactionSearchRef = ref<InstanceType<typeof TransactionSearch>>()

// Function to set example query
function setExampleQuery(query: string) {
  transactionSearchRef.value?.setSearchQuery(query)
  // Scroll to search component
  document.querySelector('.transaction-search')?.scrollIntoView({ 
    behavior: 'smooth', 
    block: 'start' 
  })
}
</script>

<style scoped>
.transaction-search-page {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem 1rem;
}

.page-header {
  text-align: center;
  margin-bottom: 2rem;
}

.page-header h1 {
  font-size: 2.5rem;
  font-weight: 700;
  margin-bottom: 0.5rem;
  color: #1f2937;
}

.subtitle {
  font-size: 1.125rem;
  color: #6b7280;
  margin-bottom: 0;
}

.subtitle code {
  background: #f3f4f6;
  padding: 0.125rem 0.25rem;
  border-radius: 0.25rem;
  font-family: 'Courier New', monospace;
}

.documentation-section {
  margin-top: 3rem;
}

.documentation-section details {
  border: 1px solid #e5e7eb;
  border-radius: 0.5rem;
  padding: 1rem;
  background: #f9fafb;
}

.documentation-section summary {
  font-weight: 600;
  font-size: 1.125rem;
  cursor: pointer;
  padding: 0.5rem;
  margin: -0.5rem;
  border-radius: 0.25rem;
  transition: background-color 0.2s;
}

.documentation-section summary:hover {
  background: #f3f4f6;
}

.docs-content {
  margin-top: 1rem;
  padding-top: 1rem;
  border-top: 1px solid #e5e7eb;
}

.clickable-notice {
  background: linear-gradient(90deg, #dbeafe 0%, #e0f2fe 100%);
  border: 1px solid #3b82f6;
  border-radius: 0.5rem;
  padding: 1rem;
  margin-bottom: 1.5rem;
}

.clickable-notice p {
  margin: 0;
  color: #1e40af;
  font-size: 0.875rem;
}

.docs-content h3 {
  font-size: 1.25rem;
  font-weight: 600;
  margin-bottom: 1rem;
  color: #374151;
}

.param-section {
  margin-bottom: 1.5rem;
  padding: 1rem;
  background: white;
  border-radius: 0.5rem;
  border: 1px solid #e5e7eb;
}

.param-section h4 {
  font-size: 1rem;
  font-weight: 600;
  margin-bottom: 0.5rem;
  color: #1f2937;
}

.param-section h4 code {
  background: #dbeafe;
  color: #1e40af;
  padding: 0.25rem 0.5rem;
  border-radius: 0.25rem;
  font-family: 'Courier New', monospace;
}

.param-section p {
  margin-bottom: 0.75rem;
  color: #4b5563;
}

.examples {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.examples code {
  background: #f3f4f6;
  padding: 0.5rem;
  border-radius: 0.25rem;
  font-family: 'Courier New', monospace;
  font-size: 0.875rem;
  border: 1px solid #e5e7eb;
}

.clickable-example {
  cursor: pointer;
  transition: all 0.2s ease;
  position: relative;
}

.clickable-example:hover {
  background: #e0e7ff !important;
  border-color: #3b82f6 !important;
  transform: translateY(-1px);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.clickable-example:active {
  transform: translateY(0);
}

.clickable-example::before {
  content: "👆 Click to try";
  position: absolute;
  top: -1.5rem;
  left: 0;
  font-size: 0.75rem;
  color: #6b7280;
  opacity: 0;
  transition: opacity 0.2s;
  pointer-events: none;
}

.clickable-example:hover::before {
  opacity: 1;
}

.complex-examples {
  display: grid;
  gap: 1rem;
  margin-bottom: 2rem;
}

.example-item {
  padding: 1rem;
  background: white;
  border-radius: 0.5rem;
  border: 1px solid #e5e7eb;
}

.example-item h4 {
  font-size: 1rem;
  font-weight: 600;
  margin-bottom: 0.5rem;
  color: #1f2937;
}

.example-item code {
  display: block;
  background: #f8fafc;
  padding: 0.75rem;
  border-radius: 0.25rem;
  font-family: 'Courier New', monospace;
  font-size: 0.875rem;
  border: 1px solid #e2e8f0;
  word-break: break-all;
}

.example-item .clickable-example {
  cursor: pointer;
  transition: all 0.2s ease;
}

.example-item .clickable-example:hover {
  background: #e0e7ff !important;
  border-color: #3b82f6 !important;
  transform: translateY(-1px);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.tips-list {
  background: white;
  padding: 1.5rem;
  border-radius: 0.5rem;
  border: 1px solid #e5e7eb;
}

.tips-list li {
  margin-bottom: 0.5rem;
  color: #4b5563;
}

.tips-list code {
  background: #f3f4f6;
  padding: 0.125rem 0.25rem;
  border-radius: 0.125rem;
  font-family: 'Courier New', monospace;
  font-size: 0.875rem;
}

.tips-list .clickable-example {
  padding: 0.25rem 0.5rem;
  border: 1px solid #e5e7eb;
  cursor: pointer;
  transition: all 0.2s ease;
}

.tips-list .clickable-example:hover {
  background: #e0e7ff !important;
  border-color: #3b82f6 !important;
  transform: translateY(-1px);
}

@media (max-width: 768px) {
  .transaction-search-page {
    padding: 1rem 0.5rem;
  }
  
  .page-header h1 {
    font-size: 2rem;
  }
  
  .param-section {
    padding: 0.75rem;
  }
  
  .examples {
    gap: 0.5rem;
  }
  
  .example-item code {
    font-size: 0.75rem;
    padding: 0.5rem;
  }
}
</style>