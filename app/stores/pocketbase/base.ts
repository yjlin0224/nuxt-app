import type {
  CommonOptions,
  FileOptions,
  ListResult,
  RecordFullListOptions,
  RecordListOptions,
  RecordOptions,
  SendOptions,
} from 'pocketbase'
import type { PocketbaseSchemaKey } from '~/composables/pocketbase/collections'
import type usePocketbaseBase from '~/composables/pocketbase/collections/base'
import type {
  BasePayload,
  BaseRecord,
  RecordId,
  WithoutBaseRecord,
} from '~/composables/pocketbase/schemas/base'

import usePocketbaseCollections from '~/composables/pocketbase/collections'
import {
  RecordSubscriptionAction,
  type RecordSubscriptionTopic,
} from '~/composables/pocketbase/collections/base'

export default function pocketbaseBaseStoreDefiner<
  K extends PocketbaseSchemaKey,
  TPayload extends BasePayload,
  TRecord extends BaseRecord,
  TPocketbase extends ReturnType<typeof usePocketbaseBase<TPayload, TRecord>>,
>(schemaKey: K) {
  return defineStore(`${schemaKey}.base`, () => {
    const collection = usePocketbaseCollections[schemaKey]() as unknown as TPocketbase

    const records: Ref<TRecord[]> = ref([])
    const recordMap = computed(() => new Map(records.value.map((record) => [record.id, record])))
    const subscribedTopics = ref<RecordSubscriptionTopic[]>([])

    function upsertToRecords(record: TRecord) {
      const index = records.value.findIndex((r) => r.id === record.id)
      records.value = records.value.toSpliced(index, index >= 0 ? 1 : 0, record)
    }

    function deleteFromRecords(recordId: RecordId) {
      const index = records.value.findIndex((r) => r.id === recordId)
      if (index >= 0) {
        records.value = records.value.toSpliced(index, 1)
      }
    }

    async function getAll(queryParams?: RecordFullListOptions): Promise<TRecord[]> {
      const records = await collection.getAll(queryParams)
      records.forEach(upsertToRecords)
      return records
    }

    async function getMany(
      queryParams: NonNullableProperty<RecordListOptions, 'page' | 'perPage'>,
    ): Promise<ListResult<TRecord>> {
      const recordListResult = await collection.getMany(queryParams)
      recordListResult.items.forEach(upsertToRecords)
      return recordListResult
    }

    async function getFirst(
      queryParams: NonNullableProperty<RecordListOptions, 'filter'>,
    ): Promise<TRecord | null> {
      const record = await collection.getFirst(queryParams)
      if (is.plainObject(record)) {
        upsertToRecords(record)
      }
      return record
    }

    async function getById(id: RecordId, queryParams?: RecordOptions): Promise<TRecord> {
      const record = await collection.getById(id, queryParams)
      upsertToRecords(record)
      return record
    }

    async function add(
      record: WithoutBaseRecord<TRecord>,
      queryParams?: RecordOptions,
    ): Promise<TRecord> {
      const newRecord = await collection.add(record, queryParams)
      upsertToRecords(newRecord)
      return newRecord
    }

    async function update(
      id: RecordId,
      newRecord: WithoutBaseRecord<TRecord>,
      oldRecord?: WithoutBaseRecord<TRecord>,
      queryParams?: RecordOptions,
    ): Promise<TRecord> {
      const record = await collection.update(id, newRecord, oldRecord, queryParams)
      upsertToRecords(record)
      return record
    }

    async function removeById(
      id: RecordId,
      options?: { permanently: boolean } & CommonOptions,
    ): Promise<TRecord | null> {
      const record = await collection.removeById(id, options)
      if (!is.plainObject(record)) {
        deleteFromRecords(id)
      } else {
        upsertToRecords(record)
      }
      return record
    }

    async function subscribe(topic: RecordId | '*' = '*', options?: SendOptions) {
      if (subscribedTopics.value.includes(topic)) return
      await collection.subscribe(
        topic,
        ({ action, record }) => {
          switch (action) {
            case RecordSubscriptionAction.Create:
            case RecordSubscriptionAction.Update:
              upsertToRecords(record)
              break
            case RecordSubscriptionAction.Delete:
              deleteFromRecords(record.id)
              break
          }
        },
        options,
      )
      subscribedTopics.value = [...subscribedTopics.value, topic]
    }

    async function unsubscribe(topic: RecordId | '*' = '*') {
      if (!subscribedTopics.value.includes(topic)) return
      await collection.unsubscribe(topic)
      subscribedTopics.value = subscribedTopics.value.filter((t) => t !== topic)
    }

    function getFileUrl<T extends FilteredKeys<TRecord, string | null>>(
      record: TRecord,
      key: T,
      queryParams?: FileOptions,
    ): TRecord[T] {
      return collection.getFileUrl(record, key, queryParams)
    }

    return {
      collection,
      records,
      recordMap,
      subscribedTopics,
      upsertToRecords,
      deleteFromRecords,
      getAll,
      getMany,
      getFirst,
      getById,
      add,
      update,
      removeById,
      subscribe,
      unsubscribe,
      getFileUrl,
    }
  })
}
