<template>
  <div class="enum-renderer">
    <div v-if="readonly" class="enum-renderer-display">
      <span
        v-if="value"
        class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary-100 text-primary-800 dark:bg-primary-900 dark:text-primary-200"
      >
        {{ value }}
      </span>
      <span v-else class="text-sm text-gray-500 dark:text-gray-400">-</span>
    </div>
    <div v-else class="enum-renderer-input">
      <div class="space-y-3">
        <select
          :value="value"
          @change="updateValue"
          :required="field.isRequired"
          class="form-input"
        >
          <option value="">{{ field.isRequired ? 'Select an option' : 'None' }}</option>
          <option
            v-for="option in enumOptions"
            :key="option"
            :value="option"
          >
            {{ option }}
          </option>
        </select>
        
        <div class="flex items-center space-x-2">
          <input
            v-model="newOption"
            type="text"
            placeholder="Add new option"
            class="form-input flex-1 text-sm"
            @keyup.enter="addOption"
          />
          <button
            @click="addOption"
            :disabled="!newOption.trim()"
            class="btn-secondary text-sm disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Add
          </button>
        </div>
        
        <div v-if="enumOptions.length > 0" class="space-y-2">
          <div class="text-xs font-medium text-gray-700 dark:text-gray-300">
            Available Options:
          </div>
          <div class="flex flex-wrap gap-2">
            <div
              v-for="(option, index) in enumOptions"
              :key="option"
              class="flex items-center space-x-1 bg-gray-100 dark:bg-gray-700 rounded px-2 py-1"
            >
              <span class="text-xs text-gray-700 dark:text-gray-300">{{ option }}</span>
              <button
                @click="removeOption(index)"
                class="text-gray-400 hover:text-red-600 dark:hover:text-red-400"
              >
                <XMarkIcon class="w-3 h-3" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import type { Field } from '@/types/database'
import {
  XMarkIcon
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

const newOption = ref('')

const enumOptions = computed(() => 
  props.field.options?.enumValues || []
)

const updateValue = (event: Event) => {
  const target = event.target as HTMLSelectElement
  emit('update:value', target.value)
}

const addOption = () => {
  if (newOption.value.trim() && !enumOptions.value.includes(newOption.value.trim())) {
    // In a real implementation, this would update the field options
    // For now, we'll just emit an event or handle it differently
    console.log('Add option:', newOption.value.trim())
    newOption.value = ''
  }
}

const removeOption = (index: number) => {
  // In a real implementation, this would update the field options
  console.log('Remove option at index:', index)
}
</script>