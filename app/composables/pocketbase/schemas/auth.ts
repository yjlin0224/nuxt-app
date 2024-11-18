import {
  type ConvertToNullable,
  type DataColumnConverter,
  type WithBasePayload,
  type WithBaseRecord,
  baseDataColumnConverters,
  genericColumnConverter,
  nullableStringColumnConverter,
} from '~/composables/pocketbase/schemas/base'

export type AuthPayload = WithBasePayload<{
  username: string
  email: string
  emailVisibility: boolean
  verified: boolean
}>

export type AuthRecord = WithBaseRecord<ConvertToNullable<AuthPayload, 'email'>>

export const authDataColumnConverters: DataColumnConverter<
  keyof AuthPayload,
  keyof AuthRecord,
  unknown,
  unknown
>[] = [
  ...baseDataColumnConverters,
  genericColumnConverter('username', 'username'),
  nullableStringColumnConverter('email', 'email'),
  genericColumnConverter('emailVisibility', 'emailVisibility'),
  genericColumnConverter('verified', 'verified'),
]
