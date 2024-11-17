import type { ExamplePayload, ExampleRecord } from '@/composables/pocketbase/schemas/example'
import type { UserPayload, UserRecord } from '@/composables/pocketbase/schemas/user'

import Pocketbase from 'pocketbase'

import usePocketbaseCollectionAuth from '@/composables/pocketbase/collections/auth'
import usePocketbaseCollectionBase from '@/composables/pocketbase/collections/base'
import { exampleDataColumnConverters } from '@/composables/pocketbase/schemas/example'
import { userDataColumnConverters } from '@/composables/pocketbase/schemas/user'

const runtimeConfig = useRuntimeConfig()

export const database = new Pocketbase(runtimeConfig.public.pocketbaseUrl)

const pocketbaseServices = {
  user: database.collection<UserPayload>('users'),
  example: database.collection<ExamplePayload>('examples'),
}

const usePocketbaseCollections = {
  user: () =>
    usePocketbaseCollectionAuth<UserPayload, UserRecord>(
      pocketbaseServices.user,
      userDataColumnConverters,
    ),
  baseUser: () =>
    usePocketbaseCollectionBase<UserPayload, UserRecord>(
      pocketbaseServices.example,
      userDataColumnConverters,
    ),
  example: () =>
    usePocketbaseCollectionBase<ExamplePayload, ExampleRecord>(
      pocketbaseServices.example,
      exampleDataColumnConverters,
    ),
} as const

export type PocketbaseSchemaKey = keyof typeof usePocketbaseCollections

export type PocketbaseSchemaAuthKey = {
  [K in keyof typeof usePocketbaseCollections]: ReturnType<
    (typeof usePocketbaseCollections)[K]
  > extends {
    isAuth: true
  }
    ? K
    : never
}[keyof typeof usePocketbaseCollections]

export type PocketbaseSchemaBaseKey = Exclude<PocketbaseSchemaKey, PocketbaseSchemaAuthKey>

export default usePocketbaseCollections
