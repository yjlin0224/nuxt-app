import type { UnwrapRef } from 'vue'

export {} // do not remove this line, don't know why it's needed

declare global {
  import is, { assert } from '@sindresorhus/is'
  import { DateTime, Duration, Interval, Zone } from '@types/luxon'
  import * as R from 'remeda'
  import * as yup from 'yup'

  // Type utilities
  type Branded<T> = T & { readonly $brand: unique symbol }
  type EnumType<T extends string | number> = Record<string, T>
  type RemoveIndexSignature<T> = {
    [K in keyof T as K extends `${infer S}` ? S : never]: T[K]
  }
  type NonNullableProperty<T, K extends keyof T> = Omit<T, K> & Required<Pick<T, K>>
  type NumberEnumType<T extends number> = Record<string, T>
  type StringEnumType<T extends string> = Record<string, T>

  export {
    is,
    assert,
    yup,
    R,
    DateTime,
    Duration,
    Interval,
    Zone,
    Branded,
    EnumType,
    RemoveIndexSignature,
    NonNullableProperty,
    NumberEnumType,
    StringEnumType,
  }
}

declare module 'vue' {
  interface ComponentCustomProperties {
    readonly is: UnwrapRef<(typeof import('@sindresorhus/is'))['default']>
    readonly assert: UnwrapRef<(typeof import('@sindresorhus/is'))['assert']>

    readonly yup: UnwrapRef<typeof import('yup')>

    readonly R: UnwrapRef<typeof import('remeda')>

    readonly DateTime: UnwrapRef<(typeof import('@types/luxon'))['DateTime']>
    readonly Duration: UnwrapRef<(typeof import('@types/luxon'))['Duration']>
    readonly Interval: UnwrapRef<(typeof import('@types/luxon'))['Interval']>
    readonly Zone: UnwrapRef<(typeof import('@types/luxon'))['Zone']>
  }
}
