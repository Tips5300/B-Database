<template>
  <div class="number-renderer">
    <div v-if="readonly" class="number-renderer-display">
      <span class="text-sm text-gray-900 dark:text-white">
        {{ formatNumber(value) }}
      </span>
    </div>
    <div v-else class="number-renderer-input">
      <input
        type="number"
        :value="value"
        @input="updateValue"
        :placeholder="field.name"
        :required="field.isRequired"
        :min="field.validation?.min"
        :max="field.validation?.max"
        :step="getStep()"
        class="form-input"
      />
      <div v-if="field.validation?.min !== undefined || field.validation?.max !== undefined" class="text-xs text-gray-500 dark:text-gray-400 mt-1">
        Range: {{ field.validation?.min || 0 }} - {{ field.validation?.max || '∞' }}
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Field } from '@/types/database'

interface Props {
  field: Field
  value: number
  readonly?: boolean
  compact?: boolean
}

defineProps<Props>()

const emit = defineEmits<{
  'update:value': [value: number]
}>()

const updateValue = (event: Event) => {
  const target = event.target as HTMLInputElement
  const numValue = parseFloat(target.value)
  emit('update:value', isNaN(numValue) ? 0 : numValue)
}

const formatNumber = (value: number) => {
  if (value === null || value === undefined) return '-'
  
  const precision = props.field.options?.precision || 0
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: precision,
    maximumFractionDigits: precision
  }).format(value)
}

const getStep = () => {
  const precision = props.field.options?.precision || 0
  return precision > 0 ? Math.pow(10, -precision) : 1
}
</script>