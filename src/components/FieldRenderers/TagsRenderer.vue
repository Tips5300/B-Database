<template>
  <div class="tags-renderer">
    <div v-if="readonly" class="tags-renderer-display">
      <div v-if="tags && tags.length > 0" class="flex flex-wrap gap-1">
        <span
          v-for="tag in displayTags"
          :key="tag"
          class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-primary-100 text-primary-800 dark:bg-primary-900 dark:text-primary-200"
        >
          {{ tag }}
        </span>
        <span
          v-if="tags.length > maxDisplayTags"
          class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400"
        >
          +{{ tags.length - maxDisplayTags }}
        </span>
      </div>
      <span v-else class="text-sm text-gray-500 dark:text-gray-400">-</span>
    </div>
    <div v-else class="tags-renderer-input">
      <div class="space-y-3">
        <div class="flex flex-wrap gap-1 min-h-10 p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700">
          <span
            v-for="(tag, index) in tags"
            :key="index"
            class="inline-flex items-center px-2 py-1 rounded-full text-sm bg-primary-100 text-primary-800 dark:bg-primary-900 dark:text-primary-200"
          >
            {{ tag }}
            <button
              @click="removeTag(index)"
              class="ml-1 text-primary-600 dark:text-primary-400 hover:text-primary-800 dark:hover:text-primary-200"
            >
              <XMarkIcon class="w-3 h-3" />
            </button>
          </span>
          <input
            v-model="newTag"
            @keydown="handleKeydown"
            @blur="addTag"
            type="text"
            placeholder="Add tag..."
            class="flex-1 min-w-20 bg-transparent border-none outline-none text-sm text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
          />
        </div>
        
        <div v-if="suggestedTags.length > 0" class="space-y-2">
          <div class="text-xs font-medium text-gray-700 dark:text-gray-300">Suggested tags:</div>
          <div class="flex flex-wrap gap-1">
            <button
              v-for="suggestion in suggestedTags"
              :key="suggestion"
              @click="addSuggestedTag(suggestion)"
              class="inline-flex items-center px-2 py-1 rounded-full text-xs bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600 transition-colors"
            >
              {{ suggestion }}
              <PlusIcon class="w-3 h-3 ml-1" />
            </button>
          </div>
        </div>
        
        <div class="text-xs text-gray-500 dark:text-gray-400">
          Press Enter or comma to add tags. {{ tags.length }} tag(s) added.
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import type { Field } from '@/types/database'
import {
  XMarkIcon,
  PlusIcon
} from '@heroicons/vue/24/outline'

interface Props {
  field: Field
  value: string[]
  readonly?: boolean
  compact?: boolean
}

const props = defineProps<Props>()

const emit = defineEmits<{
  'update:value': [value: string[]]
}>()

const newTag = ref('')
const maxDisplayTags = props.compact ? 3 : 10

const tags = computed(() => props.value || [])

const displayTags = computed(() => 
  tags.value.slice(0, maxDisplayTags)
)

const suggestedTags = computed(() => {
  const suggestions = props.field.options?.tagSuggestions || []
  return suggestions.filter(tag => !tags.value.includes(tag))
})

const handleKeydown = (event: KeyboardEvent) => {
  if (event.key === 'Enter' || event.key === ',') {
    event.preventDefault()
    addTag()
  } else if (event.key === 'Backspace' && newTag.value === '' && tags.value.length > 0) {
    removeTag(tags.value.length - 1)
  }
}

const addTag = () => {
  const tag = newTag.value.trim()
  if (tag && !tags.value.includes(tag)) {
    const newTags = [...tags.value, tag]
    emit('update:value', newTags)
    newTag.value = ''
  }
}

const addSuggestedTag = (tag: string) => {
  if (!tags.value.includes(tag)) {
    const newTags = [...tags.value, tag]
    emit('update:value', newTags)
  }
}

const removeTag = (index: number) => {
  const newTags = [...tags.value]
  newTags.splice(index, 1)
  emit('update:value', newTags)
}
</script>