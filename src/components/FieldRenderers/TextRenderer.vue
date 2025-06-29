<template>
  <div class="text-renderer">
    <div v-if="readonly" class="text-renderer-display">
      <span
        v-if="compact && value && value.length > 50"
        :title="value"
        class="text-sm text-gray-900 dark:text-white truncate"
      >
        {{ value.substring(0, 50) }}...
      </span>
      <span
        v-else-if="field.type === 'long_text'"
        class="text-sm text-gray-900 dark:text-white whitespace-pre-wrap"
      >
        {{ value || '-' }}
      </span>
      <span
        v-else
        class="text-sm text-gray-900 dark:text-white"
      >
        {{ value || '-' }}
      </span>
    </div>
    <div v-else class="text-renderer-input">
      <textarea
        v-if="field.type === 'long_text'"
        :value="value"
        @input="updateValue"
        :placeholder="field.name"
        :required="field.isRequired"
        :maxlength="field.validation?.maxLength"
        :minlength="field.validation?.minLength"
        rows="4"
        class="form-input resize-none"
      />
      <input
        v-else
        type="text"
        :value="value"
        @input="updateValue"
        :placeholder="field.name"
        :required="field.isRequired"
        :maxlength="field.validation?.maxLength"
        :minlength="field.validation?.minLength"
        :pattern="field.validation?.pattern"
        class="form-input"
      />
      <div v-if="field.validation?.maxLength" class="text-xs text-gray-500 dark:text-gray-400 mt-1">
        {{ (value || '').length }} / {{ field.validation.maxLength }}
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Field } from '@/types/database'

interface Props {
  field: Field
  value: string
  readonly?: boolean
  compact?: boolean
}

defineProps<Props>()

const emit = defineEmits<{
  'update:value': [value: string]
}>()

const updateValue = (event: Event) => {
  const target = event.target as HTMLInputElement | HTMLTextAreaElement
  emit('update:value', target.value)
}
</script>