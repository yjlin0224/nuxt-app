<script setup lang="ts">
const display = useVDisplay()
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
    >
      <VTooltip v-if="display.xs.value" activator="parent" location="bottom">搜尋</VTooltip>
    </VTextField>
  </Teleport>
  <VCard id="page--index" class="w-100 h-100" flat>首頁</VCard>
</template>
