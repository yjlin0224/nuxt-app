<script setup lang="ts">
definePageMeta({
  title: `子頁面`,
  parent: 'pages',
})

const route = useRoute()
route.meta.title = `子頁面 ${route.params.id}`
</script>

<template>
  <VCard id="page--pages-id" class="w-100 h-100" flat>子頁面 {{ route.params.id }}</VCard>
</template>
