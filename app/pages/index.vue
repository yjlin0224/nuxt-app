<script setup lang="ts">
// definePageMeta({
//   title: '首頁',
// })
</script>

<template>
  <Teleport to="#app-bar--slot">
    <VTextField
      bg-color="surface"
      clearable
      density="compact"
      flat
      hide-details
      label="搜尋"
      prepend-inner-icon="mdi-magnify"
      single-line
      variant="solo-filled"
    />
  </Teleport>
  <VContainer id="page--index" class="fill-height" fluid>
    <div>首頁</div>
  </VContainer>
</template>
