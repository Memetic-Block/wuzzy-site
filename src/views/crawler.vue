<template>
  <h2>Crawler Id: <code>{{ route.params.crawlerId }}</code></h2>
  <template v-if="info">
    <table>
      <tbody>
        <tr>
          <td>Owner</td>
          <td>{{ info.owner }}</td>
        </tr>
        <tr>
          <td>Nest ID</td>
          <td><a :href="`/nest/${info.nest_id}`">{{ info.nest_id }}</a></td>
        </tr>
        <tr>
          <td>Gateway</td>
          <td>{{ info.gateway }}</td>
        </tr>
        <tr>
          <td>Total Crawl Tasks</td>
          <td>{{ info.total_crawl_tasks }}</td>
        </tr>
        <tr>
          <td>Crawl Queue Size</td>
          <td>{{ info.crawl_queue_size }}</td>
        </tr>
        <tr>
          <td>Crawled URLs Memory Size</td>
          <td>{{ info.crawled_urls_memory_size }}</td>
        </tr>
        <tr>
          <td colspan="2">
            <a class="underline" :href="`/nest/${info.nest_id}/search`">
              Search this Crawler's Nest
            </a>
          </td>
        </tr>
      </tbody>
    </table>

    <table>
      <thead>
        <tr>
          <td colspan="3">
            Crawl Tasks ({{ info.total_crawl_tasks }})
          </td>
        </tr>
        <tr>
          <td>Domain</td>
          <td>URL</td>
          <td>Added By</td>
        </tr>
      </thead>
      <tbody>
        <tr v-for="task in crawlTasks" :key="task.url">
          <td>{{ task.domain }}</td>
          <td>{{ task.url }}</td>
          <td>{{ task.added_by }}</td>
        </tr>
      </tbody>
    </table>

    <table>
      <thead>
        <tr>
          <td colspan="2">
            Crawl Queue ({{ info.crawl_queue_size }})
          </td>
        </tr>
      </thead>
      <tbody>
        <tr v-for="item in crawlQueue" :key="item.url">
          <td>{{ item.domain }}</td>
          <td>{{ item.url }}</td>
        </tr>
      </tbody>
    </table>

    <table>
      <thead>
        <tr>
          <td colspan="2">
            Crawled URLs Memory ({{ info.crawled_urls_memory_size }})
          </td>
        </tr>
      </thead>
      <tbody>
        <tr v-for="url in crawlMemory" :key="url">
          <td>{{ url }}</td>
        </tr>
      </tbody>
    </table>
  </template>
  <template v-else-if="hasError">
    There was an error loading this Crawler
  </template>
  <template v-else>
    Loading Crawler...
  </template>
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
import { onMounted, ref } from 'vue'
import { useRoute } from 'vue-router'
import type { WuzzyCrawlerInfo } from '../types/wuzzy-crawler'
import config from '../app-config'

const crawlerViewModuleId = 'ZK1AXFffVJ2XNNIt5-s6NsI7r_nrsatoRdHyqSKs6xk'
const route = useRoute()
const info = ref<WuzzyCrawlerInfo | null>(null)
const crawlTasks = ref<Array<any>>([])
const crawlQueue = ref<Array<any>>([])
const crawlMemory = ref<Array<any>>([])
const hasError = ref<boolean>(false)
onMounted(async () => {
  hasError.value = false
  try {
    const tryFetch = async (tries: number): Promise<Response> => {
      const response = await fetch(
        `${config.hyperbeamEndpoint}/${route.params.crawlerId}/now/~lua@5.3a&module=${crawlerViewModuleId}/crawler_info/serialize~json@1.0`
      )
      if (!response.ok) {
        if (tries > 1) {
          console.warn(
            `Fetch failed with status ${response.status}, retrying... (${tries - 1} tries left)`
          )
          return new Promise<Response>((resolve) => setTimeout(() => resolve(tryFetch(tries - 1)), 1000)
          ).then((res) => res)
        } else {
          throw new Error(
            `Failed to fetch after multiple attempts, status: ${response.status}`
          )
        }
      }
      return response
    }
    const response = await tryFetch(3)
    info.value = await response.json() as WuzzyCrawlerInfo
    console.log('Got Crawler Info:', info)

    crawlTasks.value = []
    for (let i = 1; i <= info.value.total_crawl_tasks; i++) {
      crawlTasks.value.push({
        url: info.value[`crawl_task_${i}_url`],
        added_by: info.value[`crawl_task_${i}_added_by`],
        domain: info.value[`crawl_task_${i}_domain`],
        submitted_url: info.value[`crawl_task_${i}_submitted_url`]
      })
    }

    crawlQueue.value = []
    for (let i = 1; i <= info.value.crawl_queue_size; i++) {
      crawlQueue.value.push({
        url: info.value[`crawl_queue_item_${i}_url`],
        domain: info.value[`crawl_queue_item_${i}_domain`]
      })
    }

    crawlMemory.value = []
    for (let i = 1; i <= info.value.crawled_urls_memory_size; i++) {
      crawlMemory.value.push(info.value[`crawled_url_${i}`])
    }
  } catch (e) {
    console.error('Error looking up Crawler Info:', e)
    hasError.value = true
  }
})
</script>
