<template>
  <SearchInput
    initial-mode="ARNS"
  />
</template>

<script setup lang="ts">
import { useSeoMeta } from '@unhead/vue'
import SearchInput from '../components/SearchInput.vue'

useSeoMeta({
  titleTemplate: ''
})
</script>
