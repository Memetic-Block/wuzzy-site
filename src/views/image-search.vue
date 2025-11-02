<template>
  <div class="max-w-7xl mx-auto px-4 py-8">
    <ImageSearch 
      ref="imageSearchRef"
    />

    <div class="mt-12">
      <details class="border border-gray-200 rounded-lg p-4 bg-gray-50">
        <summary class="font-semibold text-lg cursor-pointer p-2 -mx-2 rounded hover:bg-gray-100">Image Search Guide</summary>

        <div class="mt-4">
          <div class="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <p>💡 <strong>Pro tip:</strong> All code examples below are clickable! Click any example to automatically fill the search bar and try it out.</p>
          </div>

          <h3 class="text-xl font-semibold mb-4">Common Image Searches</h3>

          <div class="mb-8">
            <h4 class="text-lg font-semibold mb-2 text-gray-700">Search by Owner</h4>
            <p class="text-gray-600 mb-3">Find images uploaded by specific wallet addresses</p>
            <div class="flex flex-col gap-2">
              <code @click="setExampleQuery('owner:4Tb6AwCp8c_bi-wsAKI3MM_fe5oJFEOA2Qvs2JGg6_g')" class="bg-gray-100 px-3 py-2 rounded-md font-mono text-sm cursor-pointer hover:bg-gray-200 transition-colors inline-block w-fit">owner:wallet-address</code>
            </div>
          </div>

          <div class="mb-8">
            <h4 class="text-lg font-semibold mb-2 text-gray-700">Search by Application</h4>
            <p class="text-gray-600 mb-3">Find images from specific applications or platforms</p>
            <div class="flex flex-col gap-2">
              <code @click="setExampleQuery('tags:App-Name=ArtByCity')" class="bg-gray-100 px-3 py-2 rounded-md font-mono text-sm cursor-pointer hover:bg-gray-200 transition-colors inline-block w-fit">tags:App-Name=ArtByCity</code>
              <code @click="setExampleQuery('tags:App-Name=ArDrive')" class="bg-gray-100 px-3 py-2 rounded-md font-mono text-sm cursor-pointer hover:bg-gray-200 transition-colors inline-block w-fit">tags:App-Name=ArDrive</code>
              <code @click="setExampleQuery('tags:Protocol=AO')" class="bg-gray-100 px-3 py-2 rounded-md font-mono text-sm cursor-pointer hover:bg-gray-200 transition-colors inline-block w-fit">tags:Protocol=AO</code>
            </div>
          </div>

          <div class="mb-8">
            <h4 class="text-lg font-semibold mb-2 text-gray-700">Filter by Block Height</h4>
            <p class="text-gray-600 mb-3">Find images from specific time periods using block ranges</p>
            <div class="flex flex-col gap-2">
              <code @click="setExampleQuery('block:1300000-1400000')" class="bg-gray-100 px-3 py-2 rounded-md font-mono text-sm cursor-pointer hover:bg-gray-200 transition-colors inline-block w-fit">block:1300000-1400000</code>
            </div>
          </div>

          <h3 class="text-xl font-semibold mb-4">Advanced Image Searches</h3>

          <div class="grid gap-4 mb-8">
            <div class="border border-gray-200 rounded-md p-4 bg-white">
              <h4 class="text-base font-semibold mb-2 text-gray-700">NFT Art Images</h4>
              <code @click="setExampleQuery('tags:Type=image tags:Category=art')" class="bg-gray-100 px-3 py-2 rounded-md font-mono text-sm cursor-pointer hover:bg-gray-200 transition-colors inline-block w-fit">tags:Type=image tags:Category=art</code>
            </div>

            <div class="border border-gray-200 rounded-md p-4 bg-white">
              <h4 class="text-base font-semibold mb-2 text-gray-700">Profile Pictures</h4>
              <code @click="setExampleQuery('tags:Type=avatar')" class="bg-gray-100 px-3 py-2 rounded-md font-mono text-sm cursor-pointer hover:bg-gray-200 transition-colors inline-block w-fit">tags:Type=avatar</code>
            </div>

            <div class="border border-gray-200 rounded-md p-4 bg-white">
              <h4 class="text-base font-semibold mb-2 text-gray-700">Recent Images by Block</h4>
              <code @click="setExampleQuery('block:1300000')" class="bg-gray-100 px-3 py-2 rounded-md font-mono text-sm cursor-pointer hover:bg-gray-200 transition-colors inline-block w-fit">block:1300000</code>
            </div>
          </div>

          <h3 class="text-xl font-semibold mb-4">Tips for Image Search</h3>
          <ul class="pl-6 space-y-2 text-gray-700">
            <li>Use the format filter radio buttons above to quickly filter by PNG, JPEG, GIF, or all images</li>
            <li>Combine filters with other search criteria like owner or tags</li>
            <li>Images are displayed in a responsive grid layout</li>
            <li>Click on any image to view it full size</li>
            <li>Failed image loads are automatically hidden</li>
            <li>Use "Load More" to browse additional results</li>
          </ul>
        </div>
      </details>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import ImageSearch from '../components/ImageSearch.vue'

const router = useRouter()
const imageSearchRef = ref<InstanceType<typeof ImageSearch>>()

// Function to update URL with current search state
function updateURLWithQuery(query: string) {
  if (query) {
    router.replace({
      query: { q: query }
    })
  } else {
    router.replace({ query: {} })
  }
}

// Function to set example query
function setExampleQuery(query: string) {
  // Just update the URL, ImageSearch watch will handle the rest
  updateURLWithQuery(query)
  // Scroll to search component
  document.querySelector('.image-search')?.scrollIntoView({
    behavior: 'smooth',
    block: 'start'
  })
}
</script>
