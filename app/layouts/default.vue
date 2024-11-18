<script setup lang="ts">
import { ModalsContainer } from 'vue-final-modal'
const { initializeTheme, isThemeInitialized } = useTheme()

const appConfig = useAppConfig()
const route = useRoute()

const headTitle = computed(() =>
  is.nonEmptyStringAndNotWhitespace(route.meta.title) ? route.meta.title : null,
)
const pageTitle = computed(() =>
  is.string(headTitle.value) ? `${appConfig.name} - ${headTitle.value}` : appConfig.name,
)

useHead({
  title: headTitle,
  meta: [{ property: 'og:title', content: pageTitle }],
})

onMounted(() => {
  initializeTheme()
})
</script>

<template>
  <VApp v-show="isThemeInitialized">
    <VAppBar color="surface-variant" flat density="comfortable">
      <VAppBarNavIcon />
      <VAppBarTitle>{{ pageTitle }}</VAppBarTitle>
    </VAppBar>
    <VMain class="bg-surface-variant">
      <slot />
    </VMain>
    <ModalsContainer />
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
