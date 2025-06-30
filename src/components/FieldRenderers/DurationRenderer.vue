<template>
  <div class="duration-renderer">
    <div v-if="readonly" class="duration-renderer-display">
      <span class="text-sm text-gray-900 dark:text-white">
        {{ formatDuration(value) }}
      </span>
    </div>
    <div v-else class="duration-renderer-input">
      <div class="space-y-3">
        <div class="grid grid-cols-4 gap-2">
          <div>
            <label class="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
              Days
            </label>
            <input
              type="number"
              :value="duration.days"
              @input="updateDays"
              min="0"
              class="w-full px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white"
            />
          </div>
          <div>
            <label class="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
              Hours
            </label>
            <input
              type="number"
              :value="duration.hours"
              @input="updateHours"
              min="0"
              max="23"
              class="w-full px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white"
            />
          </div>
          <div>
            <label class="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
              Minutes
            </label>
            <input
              type="number"
              :value="duration.minutes"
              @input="updateMinutes"
              min="0"
              max="59"
              class="w-full px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white"
            />
          </div>
          <div>
            <label class="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
              Seconds
            </label>
            <input
              type="number"
              :value="duration.seconds"
              @input="updateSeconds"
              min="0"
              max="59"
              class="w-full px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white"
            />
          </div>
        </div>
        
        <div class="flex items-center justify-between">
          <div class="text-sm text-gray-600 dark:text-gray-400">
            Total: {{ formatDuration(getTotalSeconds()) }}
          </div>
          <div class="flex space-x-2">
            <button
              @click="setPreset(3600)" 
              class="text-xs text-primary-600 dark:text-primary-400 hover:underline"
            >
              1h
            </button>
            <button
              @click="setPreset(28800)" 
              class="text-xs text-primary-600 dark:text-primary-400 hover:underline"
            >
              8h
            </button>
            <button
              @click="setPreset(86400)" 
              class="text-xs text-primary-600 dark:text-primary-400 hover:underline"
            >
              1d
            </button>
            <button
              @click="setPreset(0)" 
              class="text-xs text-red-600 dark:text-red-400 hover:underline"
            >
              Clear
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive, computed } from 'vue'
import type { Field } from '@/types/database'

interface Props {
  field: Field
  value: number // Duration in seconds
  readonly?: boolean
  compact?: boolean
}

const props = defineProps<Props>()

const emit = defineEmits<{
  'update:value': [value: number]
}>()

const duration = reactive({
  days: Math.floor((props.value || 0) / 86400),
  hours: Math.floor(((props.value || 0) % 86400) / 3600),
  minutes: Math.floor(((props.value || 0) % 3600) / 60),
  seconds: (props.value || 0) % 60
})

const updateDays = (event: Event) => {
  const target = event.target as HTMLInputElement
  duration.days = Math.max(0, parseInt(target.value) || 0)
  emitUpdate()
}

const updateHours = (event: Event) => {
  const target = event.target as HTMLInputElement
  duration.hours = Math.max(0, Math.min(23, parseInt(target.value) || 0))
  emitUpdate()
}

const updateMinutes = (event: Event) => {
  const target = event.target as HTMLInputElement
  duration.minutes = Math.max(0, Math.min(59, parseInt(target.value) || 0))
  emitUpdate()
}

const updateSeconds = (event: Event) => {
  const target = event.target as HTMLInputElement
  duration.seconds = Math.max(0, Math.min(59, parseInt(target.value) || 0))
  emitUpdate()
}

const getTotalSeconds = () => {
  return duration.days * 86400 + duration.hours * 3600 + duration.minutes * 60 + duration.seconds
}

const emitUpdate = () => {
  emit('update:value', getTotalSeconds())
}

const setPreset = (seconds: number) => {
  duration.days = Math.floor(seconds / 86400)
  duration.hours = Math.floor((seconds % 86400) / 3600)
  duration.minutes = Math.floor((seconds % 3600) / 60)
  duration.seconds = seconds % 60
  emitUpdate()
}

const formatDuration = (totalSeconds: number) => {
  if (!totalSeconds) return '0s'
  
  const days = Math.floor(totalSeconds / 86400)
  const hours = Math.floor((totalSeconds % 86400) / 3600)
  const minutes = Math.floor((totalSeconds % 3600) / 60)
  const seconds = totalSeconds % 60
  
  const parts = []
  if (days > 0) parts.push(`${days}d`)
  if (hours > 0) parts.push(`${hours}h`)
  if (minutes > 0) parts.push(`${minutes}m`)
  if (seconds > 0) parts.push(`${seconds}s`)
  
  return parts.join(' ') || '0s'
}
</script>