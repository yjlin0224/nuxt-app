<script setup lang="ts">
import type { ThemeColor } from '~~/vuetify.config'

import { ThemeMode, themeColors, themeModes } from '~~/vuetify.config'

const themeModeIcons: Record<ThemeMode, string> = {
  [ThemeMode.system]: 'mdi-theme-light-dark',
  [ThemeMode.light]: 'mdi-weather-sunny',
  [ThemeMode.dark]: 'mdi-weather-night',
}

const themeModeLabels: Record<ThemeMode, string> = {
  [ThemeMode.system]: '系統',
  [ThemeMode.light]: '亮',
  [ThemeMode.dark]: '暗',
}

const themeColorLabels: Record<ThemeColor, string> = {
  pink: '粉紅色',
  red: '紅色',
  deepOrange: '深橙色',
  orange: '橙色',
  amber: '橙黃色',
  yellow: '黃色',
  lime: '萊姆色',
  lightGreen: '淺綠色',
  green: '綠色',
  teal: '藍綠色',
  cyan: '青色',
  lightBlue: '淺藍色',
  blue: '藍色',
  indigo: '靛藍色',
  purple: '紫色',
  deepPurple: '深紫色',
  brown: '棕色',
  blueGrey: '藍灰色',
  grey: '灰色',
  random: '隨機',
}

const themeStore = useThemeStore()

const buttonIcon = computed(() => themeModeIcons[themeStore.mode])
const buttonAvatarColor = computed(
  () =>
    `${R.toKebabCase(themeStore.currentColor)}-${
      themeStore.currentMode === ThemeMode.light ? 'lighten' : 'darken'
    }-3`,
)

function toggleThemeColor(color: ThemeColor, toggle: (() => void) | undefined) {
  if (!is.function(toggle)) return
  if (color === 'random') {
    themeStore.setRandomColor()
  }
  toggle()
}
</script>

<template>
  <VBtn v-tooltip:bottom="'主題'" class="app--theme-menu-icon-button" icon>
    <VAvatar :color="buttonAvatarColor">
      <VIcon :icon="buttonIcon" />
    </VAvatar>
    <VMenu activator="parent" :close-on-content-click="false">
      <VCard>
        <div class="pa-2">
          <VBtnToggle v-model="themeStore.mode" mandatory density="comfortable" variant="tonal">
            <VBtn v-for="(mode, i) in themeModes" :key="i" :value="mode">
              <VIcon start>{{ themeModeIcons[mode] }}</VIcon>
              {{ themeModeLabels[mode] }}
            </VBtn>
          </VBtnToggle>
        </div>
        <VDivider />
        <div class="pa-2">
          <VItemGroup v-model="themeStore.color" mandatory>
            <div style="display: grid; grid-template-columns: repeat(4, 1fr)">
              <VItem
                v-for="(color, i) in themeColors"
                :key="i"
                v-slot="{ isSelected, toggle }"
                :value="color"
              >
                <div class="d-flex align-center justify-center" style="aspect-ratio: 1">
                  <VBtn
                    v-tooltip:top="themeColorLabels[color]"
                    icon
                    :active="isSelected"
                    :variant="isSelected ? 'tonal' : 'text'"
                    @click="toggleThemeColor(color, toggle)"
                  >
                    <VAvatar :color="color === 'random' ? 'surface-variant' : R.toKebabCase(color)">
                      <VIcon v-if="color === 'random'">mdi-lightbulb-question</VIcon>
                    </VAvatar>
                  </VBtn>
                </div>
              </VItem>
            </div>
          </VItemGroup>
        </div>
      </VCard>
    </VMenu>
  </VBtn>
</template>
