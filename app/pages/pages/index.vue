<script setup lang="ts">
definePageMeta({
  title: '多頁面',
})
</script>

<template>
  <VCard id="page--pages" class="w-100 h-100" flat>
    多頁面
    <VBtn :to="{ name: 'pages-id', params: { id: 1 } }">子頁面1</VBtn>
    <VBtn :to="{ name: 'pages-id', params: { id: 2 } }">子頁面2</VBtn>
  </VCard>
</template>
