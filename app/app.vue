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
  <NuxtLoadingIndicator />
  <NuxtRouteAnnouncer />
  <NuxtLayout>
    <NuxtPage />
  </NuxtLayout>
</template>
