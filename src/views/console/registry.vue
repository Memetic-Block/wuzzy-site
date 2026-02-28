<template>
<div class="flex flex-col mt-16">
  <div class="flex flex-col">
    <h2 class="self-start mt-0! mb-0! text-xl! border-current border-2 p-4">Permaweb Console // Registry</h2>
    <div class="h-4 border-current border-l-2 border-dotted"></div>
    <div>
      <template v-if="registry">
        <div class="border-current border-2 flex flex-row justify-between">
          <div class="p-4">Process ID</div>
          <div class="p-4">{{ AppConfig.nestRegistryId }}</div>
        </div>
        <div class="border-current border-2 flex flex-row justify-between">
          <div class="p-4">Registered Nests</div>
          <div class="p-4">{{ registry.total_nests }}</div>
        </div>
        <div class="border-current border-2 flex flex-row justify-between">
          <div class="p-4">Registration Codes Required</div>
          <div class="p-4">{{ registry.registration_code_required }}</div>
        </div>
        <div v-if="registry.registration_code_required" class="border-current border-2 flex flex-row justify-between">
          <div class="p-4">Available Registration Codes</div>
          <div class="p-4">{{ registry.total_registration_codes }}</div>
        </div>
      </template>
      <div v-else-if="isRegistryPending" class="border-current border-2 p-4">
        Loading...
      </div>
      <div v-else class="border-current border-2 p-4">
        You have no Nests yet.
      </div>
      <div v-if="isRegistryError" class="border-current border-2 p-4">
        Error ! {{ registryError?.message }}
      </div>
    </div>

    <div
      class="h-4 border-current border-r-2 border-dotted"
      :class="{ 'border-l-2': hasCreateRegistrationCodeRole }"
    ></div>
    <div
      class="flex flex-row"
      :class="{
        'justify-end': !hasCreateRegistrationCodeRole,
        'justify-between': hasCreateRegistrationCodeRole
      }"
    >
      <button
        class="cursor-pointer border-current border-2 p-4"
        @click="() => createRegistrationCode()"
        :disabled="isCreateRegistrationCodePending"
      >
        <template v-if="isCreateRegistrationCodePending">Creating...</template>
        <template v-else-if="isCreateRegistrationCodeError">Error ! {{ createRegistrationCodeError?.message }}</template>
        <template v-else-if="isCreateRegistrationCodeSuccess">Registration code created ! Check console for details.</template>
        <template v-else>Create Registration Code</template>
      </button>
      <router-link
        class="self-end border-current border-2 p-4"
        to="/console"
      >Go back to Console</router-link>
    </div>
  </div>
</div>
</template>

<script setup lang="ts">
import { useMutation, useQuery, useQueryClient } from '@tanstack/vue-query'
import { useSeoMeta } from '@unhead/vue'
import { computed } from 'vue'
import AppConfig from '@/app-config'
import { useNestRegistry } from '@/composables/nest-registry'
import { useWallet } from '@/composables/wallet'

useSeoMeta({ title: 'Permaweb Console: Registry' })
const queryClient = useQueryClient()
const { address, isConnected } = useWallet()
const { getNestRegistryState, addRegistrationCode } = useNestRegistry()
const {
  data: registry,
  isPending: isRegistryPending,
  isError: isRegistryError,
  error: registryError
} = useQuery({
  queryKey: ['registry'],
  queryFn: () => getNestRegistryState(),
  enabled: () => isConnected.value && !!address.value
})
const hasCreateRegistrationCodeRole = computed(() => {
  if (!isConnected.value) { return false }
  if (!registry.value) { return false }
  if (address.value === registry.value.owner) { return true }

  // TODO: This needs to be fixed
  // return (registry.value.acl.roles as any[]).some(role => role.name === 'create_registration_code')
  return false
})
const {
  isPending: isCreateRegistrationCodePending,
  isError: isCreateRegistrationCodeError,
  error: createRegistrationCodeError,
  isSuccess: isCreateRegistrationCodeSuccess,
  mutate: createRegistrationCode
} = useMutation({
  mutationFn: () => addRegistrationCode(),
  onSuccess: () => queryClient.invalidateQueries({ queryKey: ['registry'] })
})
</script>
