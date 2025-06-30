<template>
  <div class="rating-renderer">
    <div v-if="readonly" class="rating-renderer-display">
      <div class="flex items-center space-x-1">
        <StarIcon
          v-for="i in maxRating"
          :key="i"
          :class="[
            'w-5 h-5',
            i <= (value || 0) ? 'text-yellow-400 fill-current' : 'text-gray-300 dark:text-gray-600'
          ]"
        />
        <span v-if="showValue" class="ml-2 text-sm text-gray-600 dark:text-gray-400">
          {{ value || 0 }}/{{ maxRating }}
        </span>
      </div>
    </div>
    <div v-else class="rating-renderer-input">
      <div class="space-y-3">
        <div class="flex items-center space-x-1">
          <button
            v-for="i in maxRating"
            :key="i"
            @click="setRating(i)"
            @mouseover="hoverRating = i"
            @mouseleave="hoverRating = 0"
            type="button"
            class="focus:outline-none transition-colors"
          >
            <StarIcon
              :class="[
                'w-6 h-6',
                i <= (hoverRating || value || 0) 
                  ? 'text-yellow-400 fill-current hover:text-yellow-500' 
                  : 'text-gray-300 dark:text-gray-600 hover:text-gray-400'
              ]"
            />
          </button>
          <button
            v-if="!field.isRequired"
            @click="setRating(0)"
            class="ml-2 text-xs text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          >
            Clear
          </button>
        </div>
        
        <div class="flex items-center justify-between text-sm">
          <span class="text-gray-600 dark:text-gray-400">
            {{ value || 0 }} out of {{ maxRating }}
          </span>
          <div class="flex items-center space-x-2">
            <label class="text-xs text-gray-500 dark:text-gray-400">Max:</label>
            <select
              :value="maxRating"
              @change="updateMaxRating"
              class="text-xs bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded px-2 py-1"
            >
              <option value="3">3</option>
              <option value="5">5</option>
              <option value="10">10</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import type { Field } from '@/types/database'
import { StarIcon } from '@heroicons/vue/24/solid'

interface Props {
  field: Field
  value: number
  readonly?: boolean
  compact?: boolean
}

const props = defineProps<Props>()

const emit = defineEmits<{
  'update:value': [value: number]
}>()

const hoverRating = ref(0)

const maxRating = computed(() => props.field.options?.maxRating || 5)
const showValue = computed(() => props.field.options?.showValue !== false)

const setRating = (rating: number) => {
  emit('update:value', rating)
}

const updateMaxRating = (event: Event) => {
  const target = event.target as HTMLSelectElement
  // This would typically update the field options
  console.log('Max rating changed to:', target.value)
}
</script>