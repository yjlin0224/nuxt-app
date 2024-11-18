import type usePocketbaseCollections from '~/composables/pocketbase/collections'
import type { ExamplePayload, ExampleRecord } from '~/composables/pocketbase/schemas/example'
import type { UserPayload, UserRecord } from '~/composables/pocketbase/schemas/user'

import pocketbaseAuthStoreDefiner from '~/stores/pocketbase/auth'
import pocketbaseBaseStoreDefiner from '~/stores/pocketbase/base'

const usePocketbaseStores = {
  user: pocketbaseAuthStoreDefiner<
    'user',
    UserPayload,
    UserRecord,
    ReturnType<typeof usePocketbaseCollections.user>
  >('user'),
  example: pocketbaseBaseStoreDefiner<
    'example',
    ExamplePayload,
    ExampleRecord,
    ReturnType<typeof usePocketbaseCollections.example>
  >('example'),
}

export default usePocketbaseStores
