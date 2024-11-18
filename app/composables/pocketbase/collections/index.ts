import type { ExamplePayload, ExampleRecord } from '~/composables/pocketbase/schemas/example'
import type { UserPayload, UserRecord } from '~/composables/pocketbase/schemas/user'

import Pocketbase from 'pocketbase'

import usePocketbaseCollectionAuth from '~/composables/pocketbase/collections/auth'
import usePocketbaseCollectionBase from '~/composables/pocketbase/collections/base'
import { exampleDataColumnConverters } from '~/composables/pocketbase/schemas/example'
import { userDataColumnConverters } from '~/composables/pocketbase/schemas/user'

let database: Pocketbase | null = null

function getDatabase() {
  if (!database) {
    const runtimeConfig = useRuntimeConfig()
    console.log('runtimeConfig.public.pocketbaseUrl', runtimeConfig.public.pocketbaseUrl)
    database = new Pocketbase(runtimeConfig.public.pocketbaseUrl)
    // database = new Pocketbase('http://localhost:8090')
  }
  return database
}

const usePocketbaseCollections = {
  user: () =>
    usePocketbaseCollectionAuth<UserPayload, UserRecord>(
      getDatabase(),
      'users',
      userDataColumnConverters,
    ),
  example: () =>
    usePocketbaseCollectionBase<ExamplePayload, ExampleRecord>(
      getDatabase(),
      'examples',
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
