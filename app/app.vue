<script setup lang="ts">
const appConfig = useAppConfig()

useHead({
  titleTemplate: (title?: string) =>
    is.nonEmptyStringAndNotWhitespace(title)
      ? `${title} - ${appConfig.name}`
      : (appConfig.name as string),
})
</script>

<template>
  <NuxtLoadingIndicator :height="4" />
  <NuxtRouteAnnouncer />
  <NuxtLayout>
    <NuxtPage />
  </NuxtLayout>
</template>
