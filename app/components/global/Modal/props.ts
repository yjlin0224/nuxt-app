import type { VBtn, VIcon } from 'vuetify/components'

export enum ModalType {
  None = 'none',
  Info = 'info',
  Success = 'success',
  Warning = 'warning',
  Error = 'error',
}

export enum ModalAction {
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

export const ModalActions = {
  None: [],
  Ok: [ModalAction.Ok],
  OkCancel: [ModalAction.Ok, ModalAction.Cancel],
  AbortRetryIgnore: [ModalAction.Abort, ModalAction.Retry, ModalAction.Ignore],
  YesNoCancel: [ModalAction.Yes, ModalAction.No, ModalAction.Cancel],
  YesNo: [ModalAction.Yes, ModalAction.No],
  RetryCancel: [ModalAction.Retry, ModalAction.Cancel],
  TryContinueCancel: [ModalAction.Try, ModalAction.Continue, ModalAction.Cancel],
}
export const modalIconProps: { [key in ModalType]: VIcon['$props'] | null } = {
  [ModalType.None]: null,
  [ModalType.Info]: { icon: 'mdi-information', color: 'info' },
  [ModalType.Success]: { icon: 'mdi-check-circle', color: 'success' },
  [ModalType.Warning]: { icon: 'mdi-alert-circle', color: 'warning' },
  [ModalType.Error]: { icon: 'mdi-close-circle', color: 'error' },
}

export const modalActionButtonProps: { [key in ModalAction]: VBtn['$props'] } = {
  [ModalAction.Ok]: { color: 'success', prependIcon: 'mdi-circle-outline', text: '確定' },
  [ModalAction.Cancel]: { color: 'warning', prependIcon: 'mdi-cancel', text: '取消' },
  [ModalAction.Yes]: { color: 'success', prependIcon: 'mdi-check', text: '是' },
  [ModalAction.No]: { color: 'error', prependIcon: 'mdi-close', text: '否' },
  [ModalAction.Abort]: { color: 'error', prependIcon: 'mdi-stop', text: '中止' },
  [ModalAction.Retry]: { color: 'success', prependIcon: 'mdi-refresh', text: '重試' },
  [ModalAction.Ignore]: {
    color: 'warning',
    prependIcon: 'mdi-debug-step-over',
    text: '忽略',
  },
  [ModalAction.Try]: { color: 'success', prependIcon: 'mdi-reload', text: '嘗試' },
  [ModalAction.Continue]: { color: 'error', prependIcon: 'mdi-arrow-right', text: '繼續' },
}
