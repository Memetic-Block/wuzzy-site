<template>
  <h1>Wuzzy Nest Registry</h1>

  <template v-if="info">
    <table>
      <thead>
        <tr>
          <td>Nest ID</td>
          <td>Owner</td>
        </tr>
      </thead>
      <tbody>
        <tr v-for="nest in nests" :key="nest.id">
          <td><a :href="`/nest/${nest.id}`">{{ nest.id }}</a></td>
          <td>{{ nest.owner }}</td>
        </tr>
      </tbody>
    </table>
  </template>
  <template v-else-if="hasError">
    Error loading Wuzzy Nest Registry. Please try again later.
  </template>
  <template v-else>
    Loading Wuzzy Nest Registry...
  </template>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import type { WuzzyNestRegistryInfo } from '../types/wuzzy-nest-registry'
import config from '../app-config'

const registryViewModuleId = '64J-FBSrijo_KuF4LAaKoHFgkJM6RSJZoyCBmUUSzPI'
const info = ref<WuzzyNestRegistryInfo | null>(null)
const nests = ref<Array<any>>([])
const hasError = ref<boolean>(false)
onMounted(async () => {
  hasError.value = false
  try {
    const tryFetch = async (tries: number): Promise<Response> => {
      const response = await fetch(
        `${config.hyperbeamEndpoint}/${config.registryProcessId}/now/~lua@5.3a&module=${registryViewModuleId}/registry_info/serialize~json@1.0`
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
    info.value = await response.json() as WuzzyNestRegistryInfo
    console.log('Got Wuzzy Nest Registry Info:', info)

    nests.value = []
    for (let i = 1; i < info.value.total_nests; i++) {
      nests.value.push({
        id: info.value[`nest_${i}_id`],
        owner: info.value[`nest_${i}_owner`]
      })
    }
  } catch (e) {
    console.error('Error looking up Wuzzy Nest Registry Info:', e)
  }
})
</script>
