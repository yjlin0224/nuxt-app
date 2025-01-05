import type {
  ActualThemeColor,
  ActualThemeMode,
  ThemeColor,
  ThemeModeValue,
} from '~~/vuetify.config'

import { ThemeMode, actualThemeColors, getVuetifyThemeLabel } from '~~/vuetify.config'

const fallbackColor: ActualThemeColor = 'purple'

export const useThemeStore = defineStore('theme', () => {
  const preferredColorScheme = usePreferredColorScheme()
  const vTheme = useVTheme()

  // FIXME: useLocalStorage fallbacks to default value when page is reloaded
  //  maybe try `pinia-plugin-persistedstate` package instead
  const localStorageThemeMode = useLocalStorage<ThemeModeValue>('theme.mode', ThemeMode.System)
  const localStorageThemeColor = useLocalStorage<ThemeColor>('theme.color', 'random')

  const mode = ref<ThemeModeValue>(ThemeMode.System)
  const color = ref<ThemeColor>('random')
  const randomColor = ref<ActualThemeColor>(fallbackColor)

  const currentMode = computed<ActualThemeMode>(() => {
    if (mode.value === ThemeMode.System) {
      return preferredColorScheme.value === 'dark' ? ThemeMode.Dark : ThemeMode.Light
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
    setRandomColor()
    mode.value = localStorageThemeMode.value
    color.value = localStorageThemeColor.value
    vTheme.global.name.value = vuetifyLabel.value
    isInitialized.value = true
  }

  function setRandomColor() {
    const index = Math.floor(Math.random() * actualThemeColors.length)
    randomColor.value = actualThemeColors[index] ?? fallbackColor
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
