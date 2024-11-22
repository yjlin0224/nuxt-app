<script setup lang="ts">
import { ModalsContainer } from 'vue-final-modal'
import { useDisplay } from 'vuetify'

import usePocketbaseStores from '~/stores/pocketbase'

const themeStore = useThemeStore()

const appConfig = useAppConfig()
const display = useDisplay()
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

const userStore = usePocketbaseStores.user()
watch(
  () => userStore.isAuthed,
  (newValue) => {
    if (!newValue) {
      navigateTo({ name: 'user-auth', query: { redirect: route.fullPath } })
    }
  },
)

onMounted(() => {
  themeStore.initialize()
})
</script>

<template>
  <VApp v-show="themeStore.isInitialized">
    <VAppBar>
      <VAppBarNavIcon />
      <VAppBarTitle>{{ pageTitle }}</VAppBarTitle>
      <div
        id="app-bar--slot"
        :style="{
          width: `min(${display.thresholds.value.sm / 2}px, ${display.width.value - 56 * 4}px) `,
        }"
      />
      <VSpacer />
      <AppUserMenuIconButton />
      <AppThemeMenuIconButton v-if="themeStore.isInitialized" />
    </VAppBar>
    <VMain class="bg-surface-variant">
      <slot />
    </VMain>
    <ModalsContainer />
  </VApp>
  <VProgressCircular
    v-if="!themeStore.isInitialized"
    style="position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%)"
    :size="96"
    :width="8"
    indeterminate
    color="primary"
  />
</template>
