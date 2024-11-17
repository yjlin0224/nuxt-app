import type { PocketbaseSchemaAuthKey } from '@/composables/pocketbase/collections'
import type usePocketbaseAuth from '@/composables/pocketbase/collections/auth'
import type { AuthPayload, AuthRecord } from '@/composables/pocketbase/schemas/auth'

import usePocketbaseCollections from '@/composables/pocketbase/collections'
import pocketbaseBaseStoreDefiner from '@/stores/pocketbase/base'

export default function pocketbaseAuthStoreDefiner<
  K extends PocketbaseSchemaAuthKey,
  TPayload extends AuthPayload,
  TRecord extends AuthRecord,
  TPocketbase extends ReturnType<typeof usePocketbaseAuth<TPayload, TRecord>>,
>(schemaKey: K) {
  const collection = usePocketbaseCollections[schemaKey]() as unknown as TPocketbase
  const useBaseStore = pocketbaseBaseStoreDefiner<K, TPayload, TRecord, TPocketbase>(schemaKey)

  return defineStore(schemaKey, () => {
    const baseStore = useBaseStore()

    return {
      ...baseStore,
      collection,
    }
  })
}

// const a = pocketbaseAuthStoreDefiner<
//   'user',
//   UserPayload,
//   UserRecord,
//   ReturnType<typeof usePocketbaseCollections.user>
// >('user')()
// a.getAll()
