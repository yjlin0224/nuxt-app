import {
  type ConvertToNullable,
  type DataColumnConverter,
  genericColumnConverter,
  nullableStringColumnConverter,
} from '@/composables/pocketbase/schemas/base'
import {
  type AuthPayload,
  type AuthRecord,
  authDataColumnConverters,
} from '~/composables/pocketbase/schemas/auth'

type _UserPayload = {
  name: string
  avatar: string
}

export type UserPayload = AuthPayload & _UserPayload

type _UserRecord = ConvertToNullable<_UserPayload, 'avatar'>

export type UserRecord = AuthRecord & _UserRecord

export const userDataColumnConverters: DataColumnConverter<
  keyof UserPayload,
  keyof UserRecord,
  unknown,
  unknown
>[] = [
  ...authDataColumnConverters,
  genericColumnConverter('name', 'name'),
  nullableStringColumnConverter('avatar', 'avatar'),
]
