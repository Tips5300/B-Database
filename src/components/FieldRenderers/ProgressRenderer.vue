<template>
  <div class="progress-renderer">
    <div v-if="readonly" class="progress-renderer-display">
      <div class="space-y-2">
        <div class="flex items-center justify-between">
          <span class="text-sm text-gray-600 dark:text-gray-400">{{ field.name }}</span>
          <span class="text-sm font-medium text-gray-900 dark:text-white">{{ value || 0 }}%</span>
        </div>
        <div class="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
          <div
            :class="[
              'h-2 rounded-full transition-all duration-300',
              getProgressColor()
            ]"
            :style="{ width: `${Math.min(Math.max(value || 0, 0), 100)}%` }"
          ></div>
        </div>
      </div>
    </div>
    <div v-else class="progress-renderer-input">
      <div class="space-y-3">
        <div class="flex items-center space-x-3">
          <input
            type="range"
            :value="value || 0"
            @input="updateValue"
            min="0"
            max="100"
            step="1"
            class="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
          />
          <input
            type="number"
            :value="value || 0"
            @input="updateValueFromInput"
            min="0"
            max="100"
            class="w-16 px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white"
          />
          <span class="text-sm text-gray-500 dark:text-gray-400">%</span>
        </div>
        
        <div class="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
          <div
            :class="[
              'h-2 rounded-full transition-all duration-300',
              getProgressColor()
            ]"
            :style="{ width: `${Math.min(Math.max(value || 0, 0), 100)}%` }"
          ></div>
        </div>
        
        <div class="flex justify-between text-xs text-gray-500 dark:text-gray-400">
          <button @click="setProgress(0)" class="hover:text-gray-700 dark:hover:text-gray-200">0%</button>
          <button @click="setProgress(25)" class="hover:text-gray-700 dark:hover:text-gray-200">25%</button>
          <button @click="setProgress(50)" class="hover:text-gray-700 dark:hover:text-gray-200">50%</button>
          <button @click="setProgress(75)" class="hover:text-gray-700 dark:hover:text-gray-200">75%</button>
          <button @click="setProgress(100)" class="hover:text-gray-700 dark:hover:text-gray-200">100%</button>
        </div>
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

const props = defineProps<Props>()

const emit = defineEmits<{
  'update:value': [value: number]
}>()

const updateValue = (event: Event) => {
  const target = event.target as HTMLInputElement
  const numValue = parseInt(target.value)
  emit('update:value', Math.min(Math.max(numValue, 0), 100))
}

const updateValueFromInput = (event: Event) => {
  const target = event.target as HTMLInputElement
  const numValue = parseInt(target.value)
  emit('update:value', Math.min(Math.max(numValue, 0), 100))
}

const setProgress = (percentage: number) => {
  emit('update:value', percentage)
}

const getProgressColor = () => {
  const progress = props.value || 0
  if (progress >= 80) return 'bg-green-500'
  if (progress >= 60) return 'bg-blue-500'
  if (progress >= 40) return 'bg-yellow-500'
  if (progress >= 20) return 'bg-orange-500'
  return 'bg-red-500'
}
</script>