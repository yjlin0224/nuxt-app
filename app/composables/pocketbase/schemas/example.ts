import {
  type ConvertToNullableDateTimeWithSuffix,
  type ConvertToType,
  type DataColumnConverter,
  type WithBasePayload,
  type WithBaseRecord,
  baseDataColumnConverters,
  genericColumnConverter,
  multiSelectionFieldColumnConverter,
  singleSelectionFieldColumnConverter,
} from '~/composables/pocketbase/schemas/base'

export enum ExampleSelectionOption {
  OptionA = 'optionA',
  OptionB = 'optionB',
}

type _ExamplePayload = {
  textField: string
  numberField: number
  booleanField: boolean
  dateTimeField: string
  singleSelectionField: string
  multiSelectionField: string[]
}

export type ExamplePayload = WithBasePayload<_ExamplePayload>

type _ExampleRecord = ConvertToType<
  ConvertToType<
    ConvertToNullableDateTimeWithSuffix<_ExamplePayload, 'dateTimeField'>,
    'singleSelectionField',
    ExampleSelectionOption | null
  >,
  'multiSelectionField',
  ExampleSelectionOption[]
>

export type ExampleRecord = WithBaseRecord<_ExampleRecord>

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
