<template>
  <div class="email-renderer">
    <div v-if="readonly" class="email-renderer-display">
      <div v-if="value" class="flex items-center space-x-2">
        <EnvelopeIcon class="w-4 h-4 text-gray-400 flex-shrink-0" />
        <a
          :href="`mailto:${value}`"
          class="text-primary-600 dark:text-primary-400 hover:underline text-sm"
          :class="{ 'truncate': compact }"
        >
          {{ value }}
        </a>
      </div>
      <span v-else class="text-sm text-gray-500 dark:text-gray-400">-</span>
    </div>
    <div v-else class="email-renderer-input">
      <div class="space-y-2">
        <div class="relative">
          <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <EnvelopeIcon class="w-4 h-4 text-gray-400" />
          </div>
          <input
            type="email"
            :value="value"
            @input="updateValue"
            @blur="validateEmail"
            :placeholder="field.name || 'user@example.com'"
            :required="field.isRequired"
            class="form-input pl-10"
          />
        </div>
        
        <div v-if="value && isValidEmail(value)" class="flex items-center space-x-2">
          <button
            @click="sendEmail"
            class="text-xs text-primary-600 dark:text-primary-400 hover:underline"
          >
            Send Email
          </button>
          <span class="text-xs text-gray-400">•</span>
          <button
            @click="copyEmail"
            class="text-xs text-primary-600 dark:text-primary-400 hover:underline"
          >
            Copy
          </button>
        </div>
        
        <div v-if="emailError" class="text-xs text-red-600 dark:text-red-400">
          {{ emailError }}
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import type { Field } from '@/types/database'
import {
  EnvelopeIcon
} from '@heroicons/vue/24/outline'

interface Props {
  field: Field
  value: string
  readonly?: boolean
  compact?: boolean
}

const props = defineProps<Props>()

const emit = defineEmits<{
  'update:value': [value: string]
}>()

const emailError = ref('')

const updateValue = (event: Event) => {
  const target = event.target as HTMLInputElement
  emit('update:value', target.value)
  emailError.value = ''
}

const validateEmail = () => {
  if (props.value && !isValidEmail(props.value)) {
    emailError.value = 'Please enter a valid email address'
  } else {
    emailError.value = ''
  }
}

const isValidEmail = (email: string) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

const sendEmail = () => {
  if (props.value) {
    window.location.href = `mailto:${props.value}`
  }
}

const copyEmail = async () => {
  if (props.value) {
    try {
      await navigator.clipboard.writeText(props.value)
      // Could show a toast notification here
    } catch (error) {
      console.error('Failed to copy email:', error)
    }
  }
}
</script>