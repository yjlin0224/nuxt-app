import type { ThemeDefinition } from 'vuetify'

import { Blend, Scheme, TonalPalette } from '@material/material-color-utilities'
import * as R from 'remeda'
import { md3 } from 'vuetify/blueprints'
import { zhHans, zhHant as zhHantPartial } from 'vuetify/locale'
import colors from 'vuetify/util/colors'
import { defineVuetifyConfiguration } from 'vuetify-nuxt-module/custom-configuration'

const zhHant = R.mergeDeep(zhHantPartial, {
  open: '開啟',
  dismiss: '放棄',
  confirmEdit: {
    ok: '確定',
    cancel: '取消',
  },
  dateRangeInput: {
    divider: '到',
  },
  datePicker: {
    itemsSelected: '選擇了 {0} 天',
    range: {
      title: '選擇日期範圍',
      header: '指定日期範圍',
    },
    title: '選擇日期',
    header: '指定日期',
    input: {
      placeholder: '輸入日期',
    },
  },
  carousel: {
    ariaLabel: {
      delimiter: '幻燈片 {1} / {0}',
    },
  },
  calendar: {
    today: '今天',
  },
  input: {
    clear: '清除 {0}',
    prependAction: '{0} 個前置動作',
    appendAction: '{0} 個後置動作',
    otp: '請輸入OTP字元 {0}',
  },
  timePicker: {
    am: '上午',
    pm: '下午',
    title: '選擇時間',
  },
  pagination: {
    ariaLabel: {
      first: '首頁',
      last: '末頁',
    },
  },
  stepper: {
    next: '下一步',
    prev: '上一步',
  },
  rating: {
    ariaLabel: {
      item: '評分 {1} / {0}',
    },
  },
  loading: '載入中...',
  infiniteScroll: {
    loadMore: '讀取更多',
    empty: '沒有更多項目',
  },
})

export enum ThemeMode {
  system = 'system',
  light = 'light',
  dark = 'dark',
}

export type ActualThemeMode = Exclude<ThemeMode, ThemeMode.system>
export type ThemeScheme = keyof Omit<typeof colors, 'shades'>

export const actualThemeModes = [ThemeMode.light, ThemeMode.dark]
export const themeSchemes: ThemeScheme[] = R.pipe(colors, R.omit(['shades']), R.keys())

type VuetifyThemeLabel = `${ActualThemeMode}/${ThemeScheme}`
type VuetifyThemes = Record<VuetifyThemeLabel, ThemeDefinition>

export function getVuetifyThemeLabel(
  actualThemeMode: ActualThemeMode,
  themeScheme: ThemeScheme,
): VuetifyThemeLabel {
  return `${actualThemeMode}/${themeScheme}`
}

function generateVuetifyThemes(themeScheme: ThemeScheme): Partial<VuetifyThemes> {
  type ColorRgbCode = `#${string}`
  type ColorArgbValue = number

  function convertColorRgbCodeToArgbValue(colorRgbCode: ColorRgbCode): ColorArgbValue {
    return Number.parseInt(colorRgbCode.replace('#', 'ff'), 16)
  }

  function convertColorArgbValueToRgbCode(colorArgbValue: ColorArgbValue): ColorRgbCode {
    return `#${colorArgbValue.toString(16).slice(2)}`
  }

  type BaseVariantColorName = 'success' | 'warning' | 'info'
  type VariantColorName =
    | BaseVariantColorName
    | 'background'
    | 'surface'
    | 'surface-variant'
    | 'primary'
    | 'primary-container'
    | 'secondary'
    | 'secondary-container'
    | 'tertiary'
    | 'tertiary-container'
    | 'error'
  type VariantColorKey = `${VariantColorName}` | `on-${VariantColorName}`
  type VariantColors = {
    [key in VariantColorKey]: ColorArgbValue
  }

  function generateBaseVariantColors(
    variantName: BaseVariantColorName,
    variantColorRgbCode: ColorRgbCode,
  ): { [key in ActualThemeMode]: Partial<VariantColors> } {
    const variantColorArgbValue = convertColorRgbCodeToArgbValue(variantColorRgbCode)
    const variantTonalPalette = TonalPalette.fromInt(variantColorArgbValue)
    const lightVariantColors: Partial<VariantColors> = {
      [variantName]: variantTonalPalette.tone(40),
      [`on-${variantName}`]: variantTonalPalette.tone(100),
    }
    const darkVariantColors: Partial<VariantColors> = {
      [variantName]: variantTonalPalette.tone(80),
      [`on-${variantName}`]: variantTonalPalette.tone(20),
    }
    return {
      [ThemeMode.light]: lightVariantColors,
      [ThemeMode.dark]: darkVariantColors,
    }
  }

  const variantColorRgbCodes = {
    success: colors.green.base as ColorRgbCode,
    warning: colors.orange.darken1 as ColorRgbCode,
    info: colors.blue.base as ColorRgbCode,
  }
  const baseVariantColors = {
    success: generateBaseVariantColors('success', variantColorRgbCodes.success),
    warning: generateBaseVariantColors('warning', variantColorRgbCodes.warning),
    info: generateBaseVariantColors('info', variantColorRgbCodes.info),
  }

  function generateVuetifyTheme(
    actualThemeMode: ActualThemeMode,
    colorArgbValue: ColorArgbValue,
  ): ThemeDefinition {
    const colorScheme = Scheme[actualThemeMode](colorArgbValue)
    const harmonize = (baseColorArgbValue: ColorArgbValue) =>
      Blend.harmonize(baseColorArgbValue, colorArgbValue) as ColorArgbValue
    const harmonized = {
      success: harmonize(baseVariantColors.success[actualThemeMode].success!),
      warning: harmonize(baseVariantColors.warning[actualThemeMode].warning!),
      info: harmonize(baseVariantColors.info[actualThemeMode].info!),
      onSuccess: harmonize(baseVariantColors.success[actualThemeMode]['on-success']!),
      onWarning: harmonize(baseVariantColors.warning[actualThemeMode]['on-warning']!),
      onInfo: harmonize(baseVariantColors.info[actualThemeMode]['on-info']!),
    }
    const colorArgbValues: VariantColors = {
      'background': colorScheme.background,
      'surface': colorScheme.surface,
      'surface-variant': colorScheme.surfaceVariant,
      'primary': colorScheme.primary,
      'primary-container': colorScheme.primaryContainer,
      'secondary': colorScheme.secondary,
      'secondary-container': colorScheme.secondaryContainer,
      'tertiary': colorScheme.tertiary,
      'tertiary-container': colorScheme.tertiaryContainer,
      'success': harmonized.success,
      'warning': harmonized.warning,
      'error': colorScheme.error,
      'info': harmonized.info,
      'on-background': colorScheme.onBackground,
      'on-surface': colorScheme.onSurface,
      'on-surface-variant': colorScheme.onSurfaceVariant,
      'on-primary': colorScheme.onPrimary,
      'on-primary-container': colorScheme.onPrimaryContainer,
      'on-secondary': colorScheme.onSecondary,
      'on-secondary-container': colorScheme.onSecondaryContainer,
      'on-tertiary': colorScheme.onTertiary,
      'on-tertiary-container': colorScheme.onTertiaryContainer,
      'on-success': harmonized.onSuccess,
      'on-warning': harmonized.onWarning,
      'on-error': colorScheme.onError,
      'on-info': harmonized.onInfo,
    }
    return {
      dark: actualThemeMode === ThemeMode.dark,
      colors: R.mapValues(colorArgbValues, convertColorArgbValueToRgbCode),
    }
  }

  const colorRgbCode = colors[themeScheme].base as ColorRgbCode
  const colorArgbValue = convertColorRgbCodeToArgbValue(colorRgbCode)
  return {
    [getVuetifyThemeLabel(ThemeMode.light, themeScheme)]: generateVuetifyTheme(
      ThemeMode.light,
      colorArgbValue,
    ),
    [getVuetifyThemeLabel(ThemeMode.dark, themeScheme)]: generateVuetifyTheme(
      ThemeMode.dark,
      colorArgbValue,
    ),
  }
}

const themes = R.pipe(themeSchemes, R.map(generateVuetifyThemes), R.mergeAll) as VuetifyThemes

export default defineVuetifyConfiguration({
  blueprint: md3,
  labComponents: true,
  locale: {
    locale: 'zh-Hant',
    fallback: 'zh-Hans',
    messages: {
      'zh-Hant': zhHant,
      'zh-Hans': zhHans,
    },
  },
  date: {
    adapter: 'luxon',
    formats: {
      fullDate: 'yyyy年MM月dd日',
      fullDateWithWeekday: 'yyyy年MM月dd日 EEEE',
      normalDate: 'yyyy/MM/dd',
      normalDateWithWeekday: 'yyyy/MM/dd EEEE',
      shortDate: 'yy/MM/dd',
      year: 'yyyy年',
      month: 'MM月',
      monthShort: 'MM月',
      monthAndYear: 'yyyy年MM月',
      monthAndDate: 'MM月dd日',
      weekday: 'EEEE',
      weekdayShort: 'EEE',
      dayOfMonth: 'dd',
      hours12h: 'ahh時',
      hours24h: 'HH時',
      minutes: 'mm分',
      seconds: 'ss秒',
      fullTime: 'hh:mm',
      fullTime12h: 'ahh時mm分',
      fullTime24h: 'HH時mm分',
      fullDateTime: 'yyyy年MM月dd日 HH:mm',
      fullDateTime12h: 'yyyy年MM月dd日 ahh時mm分',
      fullDateTime24h: 'yyyy年MM月dd日 HH時mm分',
      keyboardDate: 'yyyy/MM/dd',
      keyboardDateTime: 'yyyy/MM/dd HH:mm',
      keyboardDateTime12h: 'yyyy/MM/dd hh:mm a',
      keyboardDateTime24h: 'yyyy/MM/dd HH:mm',
    },
  },
  theme: {
    themes,
  },
})
