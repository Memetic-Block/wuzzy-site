<template>
<h1>Permaweb Console</h1>
<router-link class="underline" to="/console/home">Go to My Permaweb Console</router-link>
<br />
<router-link class="underline" to="/console/registry">Go to Registry</router-link>
</template>

<script setup lang="ts">
import { useSeoMeta } from '@unhead/vue'

useSeoMeta({ title: 'Permaweb Console' })
</script>
