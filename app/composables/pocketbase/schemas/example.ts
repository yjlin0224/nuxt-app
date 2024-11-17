import {
  type BasePayload,
  type ConvertToNullableDateTimeWithSuffix,
  type ConvertToType,
  type DataColumnConverter,
  type WithBasePayload,
  type WithBaseRecord,
  baseDataColumnConverters,
  genericColumnConverter,
  multiSelectionFieldColumnConverter,
  singleSelectionFieldColumnConverter,
} from '@/composables/pocketbase/schemas/base'

export enum ExampleSelectionOption {
  OptionA = 'optionA',
  OptionB = 'optionB',
}

export type ExamplePayload = WithBasePayload<
  BasePayload & {
    textField: string
    numberField: number
    booleanField: boolean
    dateTimeField: string
    singleSelectionField: string
    multiSelectionField: string[]
  }
>

export type ExampleRecord = WithBaseRecord<
  ConvertToType<
    ConvertToType<
      ConvertToNullableDateTimeWithSuffix<ExamplePayload, 'dateTimeField'>,
      'singleSelectionField',
      ExampleSelectionOption | null
    >,
    'multiSelectionField',
    ExampleSelectionOption[]
  >
>

export const exampleDataColumnConverters: DataColumnConverter<
  keyof ExamplePayload,
  keyof ExampleRecord,
  unknown,
  unknown
>[] = [
  ...baseDataColumnConverters,
  genericColumnConverter('textField', 'textField'),
  genericColumnConverter('numberField', 'numberField'),
  genericColumnConverter('booleanField', 'booleanField'),
  genericColumnConverter('dateTimeField', 'dateTimeFieldAt'),
  singleSelectionFieldColumnConverter(
    'singleSelectionField',
    'singleSelectionField',
    ExampleSelectionOption,
  ),
  multiSelectionFieldColumnConverter(
    'multiSelectionField',
    'multiSelectionField',
    ExampleSelectionOption,
  ),
]
