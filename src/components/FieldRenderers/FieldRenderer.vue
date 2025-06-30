<template>
  <div class="field-renderer">
    <component
      :is="getRendererComponent(field.type)"
      :field="field"
      :value="value"
      :readonly="readonly"
      :compact="compact"
      :tables="tables"
      :records="records"
      :table="table"
      :record="record"
      @update:value="$emit('update:value', $event)"
      @create-record="$emit('create-record', $event)"
    />
  </div>
</template>

<script setup lang="ts">
import type { Field, Table, Record } from '@/types/database'
import { FieldType } from '@/types/database'
import TextRenderer from './TextRenderer.vue'
import NumberRenderer from './NumberRenderer.vue'
import DateRenderer from './DateRenderer.vue'
import BooleanRenderer from './BooleanRenderer.vue'
import ImageRenderer from './ImageRenderer.vue'
import FileRenderer from './FileRenderer.vue'
import URLRenderer from './URLRenderer.vue'
import EmailRenderer from './EmailRenderer.vue'
import PhoneRenderer from './PhoneRenderer.vue'
import ColorRenderer from './ColorRenderer.vue'
import EnumRenderer from './EnumRenderer.vue'
import JSONRenderer from './JSONRenderer.vue'
import GeometryRenderer from './GeometryRenderer.vue'
import CurrencyRenderer from './CurrencyRenderer.vue'
import CSVRenderer from './CSVRenderer.vue'
import RelationshipRenderer from './RelationshipRenderer.vue'
import RatingRenderer from './RatingRenderer.vue'
import ProgressRenderer from './ProgressRenderer.vue'
import TagsRenderer from './TagsRenderer.vue'
import DurationRenderer from './DurationRenderer.vue'
import ChecklistRenderer from './ChecklistRenderer.vue'
import BarcodeRenderer from './BarcodeRenderer.vue'
import QRCodeRenderer from './QRCodeRenderer.vue'
import SignatureRenderer from './SignatureRenderer.vue'
import FormulaRenderer from './FormulaRenderer.vue'

interface Props {
  field: Field
  value: any
  readonly?: boolean
  compact?: boolean
  tables?: Table[]
  records?: Record[]
  table?: Table
  record?: any
}

defineProps<Props>()

defineEmits<{
  'update:value': [value: any]
  'create-record': [tableId: string, data: any]
}>()

const getRendererComponent = (type: FieldType) => {
  const renderers = {
    [FieldType.TEXT]: TextRenderer,
    [FieldType.LONG_TEXT]: TextRenderer,
    [FieldType.NUMBER]: NumberRenderer,
    [FieldType.CURRENCY]: CurrencyRenderer,
    [FieldType.DATE]: DateRenderer,
    [FieldType.TIME]: DateRenderer,
    [FieldType.DATETIME]: DateRenderer,
    [FieldType.IMAGE]: ImageRenderer,
    [FieldType.FILE]: FileRenderer,
    [FieldType.GEOMETRY]: GeometryRenderer,
    [FieldType.COLOR]: ColorRenderer,
    [FieldType.URL]: URLRenderer,
    [FieldType.EMAIL]: EmailRenderer,
    [FieldType.PHONE]: PhoneRenderer,
    [FieldType.ENUM]: EnumRenderer,
    [FieldType.JSON]: JSONRenderer,
    [FieldType.BOOLEAN]: BooleanRenderer,
    [FieldType.CSV]: CSVRenderer,
    [FieldType.RELATIONSHIP]: RelationshipRenderer,
    [FieldType.RATING]: RatingRenderer,
    [FieldType.PROGRESS]: ProgressRenderer,
    [FieldType.TAGS]: TagsRenderer,
    [FieldType.DURATION]: DurationRenderer,
    [FieldType.CHECKLIST]: ChecklistRenderer,
    [FieldType.BARCODE]: BarcodeRenderer,
    [FieldType.QR_CODE]: QRCodeRenderer,
    [FieldType.SIGNATURE]: SignatureRenderer,
    [FieldType.FORMULA]: FormulaRenderer,
    [FieldType.LOOKUP]: TextRenderer, // Simplified for now
    [FieldType.ROLLUP]: NumberRenderer, // Simplified for now
    [FieldType.AUTONUMBER]: NumberRenderer,
    [FieldType.CREATED_TIME]: DateRenderer,
    [FieldType.MODIFIED_TIME]: DateRenderer,
    [FieldType.CREATED_BY]: TextRenderer,
    [FieldType.MODIFIED_BY]: TextRenderer
  }
  return renderers[type] || TextRenderer
}
</script>