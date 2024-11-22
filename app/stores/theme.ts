import type { ActualThemeColor, ActualThemeMode, ThemeColor } from '~~/vuetify.config'

import { ThemeMode, actualThemeColors, getVuetifyThemeLabel } from '~~/vuetify.config'

export const useThemeStore = defineStore('theme', () => {
  const preferredColorScheme = usePreferredColorScheme()

  // FIXME: useLocalStorage fallbacks to default value when page is reloaded
  //  maybe try `pinia-plugin-persistedstate` package instead
  const localStorageThemeMode = useLocalStorage<ThemeMode>('theme.mode', ThemeMode.system)
  const localStorageThemeColor = useLocalStorage<ThemeColor>('theme.color', 'random')

  const mode = ref<ThemeMode>(ThemeMode.system)
  const color = ref<ThemeColor>('random')

  const currentMode = computed<ActualThemeMode>(() => {
    if (mode.value === ThemeMode.system) {
      return preferredColorScheme.value === 'dark' ? ThemeMode.dark : ThemeMode.light
    }
    return mode.value
  })
  const currentColor = computed<ActualThemeColor>(() => {
    if (color.value === 'random') {
      const index = Math.floor(Math.random() * actualThemeColors.length)
      return actualThemeColors[index] ?? 'purple'
    }
    return color.value
  })
  const vuetifyLabel = computed(() => getVuetifyThemeLabel(currentMode.value, currentColor.value))

  if (getCurrentInstance()) {
    watch(mode, (newValue) => {
      localStorageThemeMode.value = newValue
    })
    watch(color, (newValue) => {
      localStorageThemeColor.value = newValue
    })
    const vTheme = useVTheme()
    watch(currentMode, (newValue) => {
      vTheme.global.name.value = getVuetifyThemeLabel(newValue, currentColor.value)
    })
    watch(currentColor, (newValue) => {
      vTheme.global.name.value = getVuetifyThemeLabel(currentMode.value, newValue)
    })
  }

  const isInitialized = ref(false)

  function initialize() {
    mode.value = localStorageThemeMode.value
    color.value = localStorageThemeColor.value
    const { $vuetify } = useNuxtApp()
    $vuetify.theme.global.name.value = vuetifyLabel.value
    isInitialized.value = true
  }

  return {
    mode,
    color,
    currentMode,
    currentColor,
    vuetifyLabel,
    isInitialized,
    initialize,
  }
})
