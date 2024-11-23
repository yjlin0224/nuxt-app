<script setup lang="ts">
import type { RouteLocationResolvedGeneric } from 'vue-router'

import { ModalsContainer } from 'vue-final-modal'

const appConfig = useAppConfig()
const display = useVDisplay()
const route = useRoute()
const router = useRouter()

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

const themeStore = useThemeStore()

const drawer = {
  open: ref(true),
  shrink: ref(false),
}

watch([display.xs, display.smAndUp, display.mdAndUp], resetDrawerState)

function resetDrawerState() {
  drawer.open.value = !display.xs.value
  drawer.shrink.value = !display.xs.value && !display.mdAndUp.value
}

function openOrShrinkDrawer() {
  if (display.xs.value) {
    drawer.shrink.value = false
    drawer.open.value = !drawer.open.value
  } else {
    drawer.open.value = true
    drawer.shrink.value = !drawer.shrink.value
  }
}

type NavigationItem = {
  title: string
  icon: string
  route: RouteLocationResolvedGeneric
}

function makeNavigationItem(
  name: string,
  icon: string,
  titleFallback: string = '',
): NavigationItem {
  const route = router.resolve({ name })
  const title = is.nonEmptyStringAndNotWhitespace(route.meta.title)
    ? route.meta.title
    : titleFallback
  return { title, icon, route }
}

const navigationItems = computed(() => [
  makeNavigationItem('index', 'mdi-home', '首頁'),
  makeNavigationItem('page', 'mdi-file'),
  makeNavigationItem('pages', 'mdi-file-multiple'),
])

const isRouteInNavigationItems = computed(() =>
  navigationItems.value.some((item) => item.route.name === route.name),
)

const parentRoute = computed(() => {
  if (isRouteInNavigationItems.value) return null
  const { parent } = route.meta
  if (is.nonEmptyStringAndNotWhitespace(parent)) return router.resolve({ name: parent })
  return router.resolve({ name: 'index' })
})
</script>

<template>
  <VApp v-show="themeStore.isInitialized">
    <VAppBar>
      <template #prepend>
        <VAppBarNavIcon v-if="isRouteInNavigationItems" @click.stop="openOrShrinkDrawer()" />
        <VIcon v-else-if="is.string(route.name) && route.name.endsWith('-auth')">
          mdi-login-variant
        </VIcon>
        <VBtn v-else icon :disabled="is.null(parentRoute)" :to="parentRoute ?? 'index'">
          <VIcon>mdi-arrow-left</VIcon>
        </VBtn>
      </template>
      <template #append>
        <AppUserMenuIconButton />
        <AppThemeMenuIconButton v-if="themeStore.isInitialized" />
      </template>
      <VAppBarTitle>{{ pageTitle }}</VAppBarTitle>
      <div id="app-bar--slot" />
      <VSpacer v-if="display.mdAndUp.value" />
    </VAppBar>
    <VNavigationDrawer
      v-if="isRouteInNavigationItems"
      :model-value="drawer.open.value"
      :rail="drawer.shrink.value"
      :permanent="display.smAndUp.value"
    >
      <VList density="compact" nav>
        <VListItem
          v-for="(item, i) in navigationItems"
          :key="i"
          :prepend-icon="item.icon"
          :title="item.title"
          :to="item.route"
        />
      </VList>
    </VNavigationDrawer>
    <VMain>
      <div
        :class="[
          'd-flex align-center w-100 h-100 pt-0 pb-2 px-2',
          isRouteInNavigationItems ? 'pl-sm-0' : '',
        ]"
      >
        <slot />
      </div>
    </VMain>
    <ModalsContainer />
  </VApp>
  <VProgressCircular
    v-if="!themeStore.isInitialized"
    class="position-fixed"
    style="top: 50%; left: 50%; transform: translate(-50%, -50%)"
    color="primary"
    indeterminate
    :width="8"
    :size="96"
  />
</template>

<style lang="scss">
@use 'sass:map';
@use 'vuetify/styles' as vuetify;

#app-bar--slot:not(:empty) {
  width: 48px;

  > .v-input {
    margin-inline: 4px;
  }
}

@media #{map.get(vuetify.$display-breakpoints, 'xs')} {
  #app-bar--slot:not(:empty) {
    &:has(.v-input .v-field--focused),
    &:has(.v-input .v-field__clearable[style='']) {
      width: 100%;
    }

    .v-field:not(.v-field--focused, :has(.v-field__clearable[style=''])) {
      padding-inline: 8px;
      cursor: pointer;
      border-radius: 50%;
    }
  }
}

@media #{map.get(vuetify.$display-breakpoints, 'sm-and-up')} {
  #app-bar--slot:not(:empty) {
    width: calc((100vw - 48px * 3 - 4px * 2) / 2);
  }
}

@media #{map.get(vuetify.$display-breakpoints, 'md-and-up')} {
  #app-bar--slot:not(:empty) {
    width: calc(map.get(vuetify.$grid-breakpoints, 'sm') / 1.5);
  }
}

@media #{map.get(vuetify.$display-breakpoints, 'lg-and-up')} {
  #app-bar--slot:not(:empty) {
    width: calc(map.get(vuetify.$grid-breakpoints, 'sm'));
  }
}
</style>
