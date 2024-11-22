import type { ActualThemeColor, ActualThemeMode, ThemeColor } from '~~/vuetify.config'

import { ThemeMode, actualThemeColors, getVuetifyThemeLabel } from '~~/vuetify.config'

export const useThemeStore = defineStore('theme', () => {
  const preferredColorScheme = usePreferredColorScheme()
  const vTheme = useVTheme()

  // FIXME: useLocalStorage fallbacks to default value when page is reloaded
  //  maybe try `pinia-plugin-persistedstate` package instead
  const localStorageThemeMode = useLocalStorage<ThemeMode>('theme.mode', ThemeMode.system)
  const localStorageThemeColor = useLocalStorage<ThemeColor>('theme.color', 'random')

  const mode = ref<ThemeMode>(ThemeMode.system)
  const color = ref<ThemeColor>('random')
  const randomColor = ref<ActualThemeColor>('purple')

  const currentMode = computed<ActualThemeMode>(() => {
    if (mode.value === ThemeMode.system) {
      return preferredColorScheme.value === 'dark' ? ThemeMode.dark : ThemeMode.light
    }
    return mode.value
  })
  const currentColor = computed<ActualThemeColor>(() =>
    color.value === 'random' ? randomColor.value : color.value,
  )
  const vuetifyLabel = computed(() => getVuetifyThemeLabel(currentMode.value, currentColor.value))

  watch(vuetifyLabel, (newValue) => {
    vTheme.global.name.value = newValue
  })

  watch([mode, color], ([newMode, newColor]) => {
    if (newColor === 'random') {
      setRandomColor()
    }
    localStorageThemeMode.value = newMode
    localStorageThemeColor.value = newColor
  })

  const isInitialized = ref(false)

  function initialize() {
    vTheme.global.name.value = vuetifyLabel.value
    mode.value = localStorageThemeMode.value
    color.value = localStorageThemeColor.value
    isInitialized.value = true
  }

  function setRandomColor() {
    const index = Math.floor(Math.random() * actualThemeColors.length)
    randomColor.value = actualThemeColors[index] ?? 'purple'
  }

  return {
    mode,
    color,
    currentMode,
    currentColor,
    vuetifyLabel,
    isInitialized,
    initialize,
    setRandomColor,
  }
})
