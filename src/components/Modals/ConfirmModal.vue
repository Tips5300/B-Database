<template>
  <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
    <div class="bg-white dark:bg-gray-800 rounded-lg shadow-lg max-w-md w-full p-6">
      <div class="flex items-center mb-4">
        <div class="flex-shrink-0">
          <ExclamationTriangleIcon class="w-8 h-8 text-red-600" />
        </div>
        <div class="ml-4">
          <h3 class="text-lg font-medium text-gray-900 dark:text-white">
            {{ title }}
          </h3>
        </div>
      </div>
      
      <div class="mb-6">
        <p class="text-gray-600 dark:text-gray-400">
          {{ message }}
        </p>
      </div>
      
      <div class="flex justify-end space-x-3">
        <button
          @click="$emit('cancel')"
          class="btn-secondary"
        >
          Cancel
        </button>
        <button
          @click="$emit('confirm')"
          :class="confirmClass"
        >
          {{ confirmText }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ExclamationTriangleIcon } from '@heroicons/vue/24/outline'

interface Props {
  title: string
  message: string
  confirmText?: string
  confirmClass?: string
}

withDefaults(defineProps<Props>(), {
  confirmText: 'Confirm',
  confirmClass: 'btn-primary'
})

defineEmits<{
  confirm: []
  cancel: []
}>()
</script>

<style scoped>
.btn-danger {
  @apply bg-red-600 hover:bg-red-700 focus:ring-red-500 text-white font-medium rounded-lg text-sm px-5 py-2.5 focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors duration-200;
}
</style>