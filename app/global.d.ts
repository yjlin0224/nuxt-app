import type { UnwrapRef } from "vue"

export {} // do not remove this line, don't know why it's needed

declare global {
  const is: (typeof import("@sindresorhus/is"))["default"]

  const yup: typeof import("yup")

  const R: typeof import("remeda")

  const DateTime: (typeof import("@types/luxon"))["DateTime"]
  const Duration: (typeof import("@types/luxon"))["Duration"]
  const Interval: (typeof import("@types/luxon"))["Interval"]
  const Zone: (typeof import("@types/luxon"))["Zone"]
}

declare module "vue" {
  interface ComponentCustomProperties {
    readonly is: UnwrapRef<(typeof import("@sindresorhus/is"))["default"]>

    readonly yup: UnwrapRef<typeof import("yup")>

    readonly R: UnwrapRef<typeof import("remeda")>

    readonly DateTime: UnwrapRef<(typeof import("@types/luxon"))["DateTime"]>
    readonly Duration: UnwrapRef<(typeof import("@types/luxon"))["Duration"]>
    readonly Interval: UnwrapRef<(typeof import("@types/luxon"))["Interval"]>
    readonly Zone: UnwrapRef<(typeof import("@types/luxon"))["Zone"]>
  }
}
