import type { ActualThemeMode, ThemeScheme } from "@@/vuetify.config"

import { ThemeMode, getVuetifyThemeLabel } from "@@/vuetify.config"

export default () => {
  const preferredColorScheme = usePreferredColorScheme()
  const themeMode = useLocalStorage<ThemeMode>("theme.mode", ThemeMode.system)
  const themeScheme = useLocalStorage<ThemeScheme>("theme.scheme", "purple")
  const currentThemeMode = computed<ActualThemeMode>(() => {
    if (themeMode.value === ThemeMode.system) {
      return preferredColorScheme.value === "dark" ? ThemeMode.dark : ThemeMode.light
    }
    return themeMode.value
  })
  const vuetifyThemeLabel = computed(() =>
    getVuetifyThemeLabel(currentThemeMode.value, themeScheme.value),
  )

  if (getCurrentInstance()) {
    const vTheme = useVTheme()
    watch(currentThemeMode, (newValue) => {
      vTheme.global.name.value = getVuetifyThemeLabel(newValue, themeScheme.value)
    })
    watch(themeScheme, (newValue) => {
      vTheme.global.name.value = getVuetifyThemeLabel(currentThemeMode.value, newValue)
    })
  }

  const isThemeInitialized = ref(false)

  function initializeTheme() {
    const { $vuetify } = useNuxtApp()
    $vuetify.theme.global.name.value = vuetifyThemeLabel.value
    isThemeInitialized.value = true
    console.log("Theme initialized")
    console.log(isThemeInitialized.value)
  }

  return {
    themeMode,
    themeScheme,
    currentThemeMode,
    vuetifyThemeLabel,
    isThemeInitialized,
    initializeTheme,
  }
}
