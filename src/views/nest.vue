<template>
  <h2>
    Nest Id: <code>{{ route.params.nestId }}</code>
  </h2>
  <template v-if="info">
    <table>
      <tbody>
        <tr>
          <td>Owner</td>
          <td>{{ info.owner }}</td>
        </tr>
        <tr>
          <td>Total Documents</td>
          <td>{{ info.total_documents }}</td>
        </tr>
        <tr>
          <td>Average Document Length in Terms</td>
          <td>{{ info.average_document_term_length }}</td>
        </tr>
        <tr>
          <td>Total Term Count</td>
          <td>{{ info.total_term_count }}</td>
        </tr>
        <tr>
          <td>Total Content Length</td>
          <td>{{ info.total_content_length }}</td>
        </tr>
        <tr>
          <td>Total Crawlers</td>
          <td>{{ info.total_crawlers }}</td>
        </tr>
      </tbody>
      <tfoot>
        <tr>
          <td colspan="2">
            <a class="underline" :href="`/nest/${route.params.nestId}/search`">
              Search this Nest
            </a>
          </td>
        </tr>
      </tfoot>
    </table>

    <table>
      <thead>
        <tr>
          <td colspan="3">Crawlers ({{ info.total_crawlers }})</td>
        </tr>
        <tr>
          <td>Crawler ID</td>
          <td>Name</td>
          <td>Owner</td>
        </tr>
      </thead>
      <tbody>
        <tr v-for="crawler in crawlers" :key="crawler.id">
          <td>
            <a class="underline" :href="`/crawler/${crawler.id}`">
              {{ crawler.id }}
            </a>
          </td>
          <td>{{ crawler.name }}</td>
          <td>{{ crawler.owner }}</td>
        </tr>
      </tbody>
    </table>

    <table>
      <thead>
        <tr>
          <td colspan="7">Documents ({{ info.total_documents }})</td>
        </tr>
        <tr>
          <!-- <td>Document ID</td> -->
          <td>Index</td>
          <td>URL / Document ID</td>
          <td>Title</td>
          <td>Description</td>
          <td>Content Type</td>
          <td>Content Length</td>
          <td>Term Count</td>
        </tr>
      </thead>
      <tbody>
        <tr v-for="document in documents" :key="document.id">
          <td>
            <!-- <a class="underline" :href="`/nest/${route.params.nestId}/document/${document.idx}`"> -->
            {{ document.idx }}
            <!-- </a> -->
          </td>
          <td>
            <a class="underline" :href="document.url" target="_blank">
              {{ document.url }}
            </a>
          </td>
          <td>{{ document.title }}</td>
          <td>{{ document.description }}</td>
          <td>{{ document.content_type }}</td>
          <td>{{ document.content_length }}</td>
          <td>{{ document.term_count }}</td>
        </tr>
      </tbody>
    </table>
  </template>
  <template v-else> Loading Nest... </template>
</template>

<style scoped>
h2 {
  text-transform: none;
}

tbody {
  font-size: smaller;
}
</style>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRoute } from 'vue-router'
import type { WuzzyNestInfo } from '../types/wuzzy-nest'
import config from '../app-config'
import { useSeoMeta } from '@unhead/vue'
// import { useWallet } from '../composables/wallet'

const nestViewModuleId = 'NWtLbRjMo6JHX1dH04PsnhbaDq8NmNT9L1HAPo_mtvc'
const route = useRoute()
// const { checkWalletOnLoad } = useWallet()

const info = ref<WuzzyNestInfo | null>(null)
const crawlers = ref<Array<any>>([])
const documents = ref<Array<any>>([])
onMounted(async () => {
  try {
    const response = await fetch(
      `${config.hyperbeamEndpoint}/${route.params.nestId}/now/~lua@5.3a&module=${nestViewModuleId}/nest_info/serialize~json@1.0`
    )
    info.value = (await response.json()) as WuzzyNestInfo
    console.log('Got Nest Info:', info.value)

    crawlers.value = []
    for (let i = 1; i <= info.value.total_crawlers; i++) {
      crawlers.value.push({
        id: info.value[`crawler_${i}_id`],
        owner: info.value[`crawler_${i}_owner`],
        name: info.value[`crawler_${i}_name`]
      })
    }

    documents.value = []
    for (let i = 1; i <= info.value.total_documents; i++) {
      documents.value.push({
        idx: i,
        id: info.value[`document_${i}_id`],
        url: info.value[`document_${i}_url`],
        content_length: info.value[`document_${i}_content_length`],
        content_type: info.value[`document_${i}_content_type`],
        term_count: info.value[`document_${i}_term_count`],
        description: info.value[`document_${i}_description`],
        title: info.value[`document_${i}_title`],
        last_crawled_at: info.value[`document_${i}_last_crawled_at`]
      })
    }
  } catch (e) {
    console.error('Error looking up Nest Info:', e)
  }
})
// onMounted(checkWalletOnLoad)

useSeoMeta({
  title: computed(() => `Nest ${route.params.nestId}`)
})
</script>
