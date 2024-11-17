<script lang="ts">
import type { VBtn, VIcon } from 'vuetify/components'

import { VueFinalModal } from 'vue-final-modal'

export enum ConfirmDialogType {
  None = 'none',
  Info = 'info',
  Success = 'success',
  Warning = 'warning',
  Error = 'error',
}

export enum ConfirmDialogAction {
  Ok = 'ok',
  Cancel = 'cancel',
  Yes = 'yes',
  No = 'no',
  Abort = 'abort',
  Retry = 'retry',
  Ignore = 'ignore',
  Try = 'try',
  Continue = 'continue',
}

export const ConfirmDialogActions = {
  Ok: [ConfirmDialogAction.Ok],
  OkCancel: [ConfirmDialogAction.Ok, ConfirmDialogAction.Cancel],
  AbortRetryIgnore: [
    ConfirmDialogAction.Abort,
    ConfirmDialogAction.Retry,
    ConfirmDialogAction.Ignore,
  ],
  YesNoCancel: [ConfirmDialogAction.Yes, ConfirmDialogAction.No, ConfirmDialogAction.Cancel],
  YesNo: [ConfirmDialogAction.Yes, ConfirmDialogAction.No],
  RetryCancel: [ConfirmDialogAction.Retry, ConfirmDialogAction.Cancel],
  TryContinueCancel: [
    ConfirmDialogAction.Try,
    ConfirmDialogAction.Continue,
    ConfirmDialogAction.Cancel,
  ],
}

export type ConfirmDialogProps = {
  type?: ConfirmDialogType
  title?: string
  message?: string
  actions?: ConfirmDialogAction[]
  persistent?: boolean
  showCloseButton?: boolean
  maxWidth?: number
}
</script>

<script setup lang="ts">
const confirmDialogIconProps: { [key in ConfirmDialogType]: VIcon['$props'] | null } = {
  [ConfirmDialogType.None]: null,
  [ConfirmDialogType.Info]: { icon: 'mdi-information', color: 'info' },
  [ConfirmDialogType.Success]: { icon: 'mdi-check-circle', color: 'success' },
  [ConfirmDialogType.Warning]: { icon: 'mdi-alert-circle', color: 'warning' },
  [ConfirmDialogType.Error]: { icon: 'mdi-close-circle', color: 'error' },
}

const confirmDialogActionButtonProps: { [key in ConfirmDialogAction]: VBtn['$props'] } = {
  [ConfirmDialogAction.Ok]: { color: 'success', prependIcon: 'mdi-circle-outline', text: '確定' },
  [ConfirmDialogAction.Cancel]: { color: 'warning', prependIcon: 'mdi-cancel', text: '取消' },
  [ConfirmDialogAction.Yes]: { color: 'success', prependIcon: 'mdi-check', text: '是' },
  [ConfirmDialogAction.No]: { color: 'error', prependIcon: 'mdi-close', text: '否' },
  [ConfirmDialogAction.Abort]: { color: 'error', prependIcon: 'mdi-stop', text: '中止' },
  [ConfirmDialogAction.Retry]: { color: 'success', prependIcon: 'mdi-refresh', text: '重試' },
  [ConfirmDialogAction.Ignore]: {
    color: 'warning',
    prependIcon: 'mdi-debug-step-over',
    text: '忽略',
  },
  [ConfirmDialogAction.Try]: { color: 'success', prependIcon: 'mdi-reload', text: '嘗試' },
  [ConfirmDialogAction.Continue]: { color: 'error', prependIcon: 'mdi-arrow-right', text: '繼續' },
}

const props = withDefaults(defineProps<ConfirmDialogProps>(), {
  type: ConfirmDialogType.None,
  title: '',
  message: '',
  actions: () => ConfirmDialogActions.Ok,
  persistent: false,
  showCloseButton: true,
  maxWidth: 400,
})

const emits = defineEmits<{
  confirm: [action: ConfirmDialogAction]
}>()

const iconProps = computed(() => confirmDialogIconProps[props.type])
</script>

<template>
  <VueFinalModal
    class="v-overlay v-overlay--active v-dialog"
    style="pointer-events: auto"
    overlay-class="v-overlay__scrim"
    overlay-style="pointer-events: none"
    content-class="v-overlay__content"
    content-transition="vfm-fade"
    :content-style="`max-width: ${props.maxWidth}px`"
    :z-index-fn="({ index }) => 2000 + index"
    :click-to-close="!props.persistent"
    :esc-to-close="!props.persistent"
    :prevent-navigation-gestures="props.persistent"
  >
    <!-- @vue-expect-error: `close` is not typed but available -->
    <template #default="{ close }">
      <VCard>
        <VToolbar color="surface" dark density="comfortable">
          <VIcon v-if="iconProps" class="ml-4" v-bind="iconProps" />
          <VToolbarTitle>
            <template v-if="is.nonEmptyStringAndNotWhitespace(props.title)">
              {{ props.title }}
            </template>
            <slot v-else name="title" />
          </VToolbarTitle>
          <VSpacer />
          <VBtn v-if="showCloseButton" icon="mdi-close" @click="close()" />
        </VToolbar>
        <VCardText>
          <template v-if="is.nonEmptyStringAndNotWhitespace(props.message)">
            {{ props.message }}
          </template>
          <slot v-else />
        </VCardText>
        <VCardActions>
          <VBtn
            v-for="action in props.actions"
            :key="action"
            class="flex-1-0"
            v-bind="confirmDialogActionButtonProps[action]"
            variant="tonal"
            @click="emits('confirm', action)"
          />
        </VCardActions>
      </VCard>
      <!-- v-dialog css loading hack -->
      <VDialog v-if="false" />
    </template>
  </VueFinalModal>
</template>
