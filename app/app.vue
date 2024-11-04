<script setup lang="ts">
const appConfig = useAppConfig()

useHead({
  titleTemplate: (title?: string) =>
    is.nonEmptyStringAndNotWhitespace(title)
      ? `${appConfig.name} - ${title}`
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
