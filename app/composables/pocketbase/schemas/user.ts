import { type AuthPayload, authDataColumnConverters } from '@/composables/pocketbase/schemas/auth'
import {
  type DataColumnConverter,
  type WithBasePayload,
  type WithBaseRecord,
  genericColumnConverter,
} from '@/composables/pocketbase/schemas/base'

export type UserPayload = WithBasePayload<
  AuthPayload & {
    name: string
    avatar: string
  }
>

export type UserRecord = WithBaseRecord<UserPayload>

export const userDataColumnConverters: DataColumnConverter<
  keyof UserPayload,
  keyof UserRecord,
  unknown,
  unknown
>[] = [...authDataColumnConverters, genericColumnConverter('name', 'name')]