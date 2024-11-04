<script setup lang="ts">
const { initializeTheme, isThemeInitialized } = useTheme()

const appConfig = useAppConfig()
const route = useRoute()
const pageTitle = computed(() =>
  is.nonEmptyStringAndNotWhitespace(route.meta.title)
    ? `${appConfig.name} - ${route.meta.title}`
    : (appConfig.name as string),
)

useHead({
  meta: [{ property: "og:title", content: pageTitle.value }],
})

onMounted(() => {
  initializeTheme()
})
</script>

<template>
  <VApp v-show="isThemeInitialized">
    <VAppBar color="surface-variant" flat>
      <VAppBarNavIcon />
      <VAppBarTitle>{{ pageTitle }}</VAppBarTitle>
    </VAppBar>
    <VMain class="bg-surface-variant">
      <slot />
    </VMain>
  </VApp>
  <VProgressCircular
    v-if="!isThemeInitialized"
    style="position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%)"
    :size="96"
    :width="8"
    indeterminate
    color="primary"
  />
</template>
