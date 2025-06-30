<template>
  <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
    <div class="bg-white dark:bg-gray-800 rounded-lg shadow-lg max-w-md w-full max-h-[90vh] overflow-hidden flex flex-col">
      <div class="flex justify-between items-center p-6 border-b border-gray-200 dark:border-gray-700">
        <h2 class="text-xl font-semibold text-gray-900 dark:text-white">
          {{ table ? 'Edit Table' : 'Create Table' }}
        </h2>
        <button
          @click="$emit('close')"
          class="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
        >
          <XMarkIcon class="w-6 h-6" />
        </button>
      </div>

      <div class="flex-1 overflow-y-auto p-6">
        <form @submit.prevent="handleSubmit" class="space-y-4">
          <div>
            <label for="name" class="form-label">Table Name</label>
            <input
              id="name"
              v-model="formData.name"
              type="text"
              required
              class="form-input"
              placeholder="Enter table name"
            />
          </div>

          <ThumbnailPicker v-model="formData.thumbnail" />
        </form>
      </div>

      <div class="flex justify-end space-x-3 p-6 border-t border-gray-200 dark:border-gray-700">
        <button
          type="button"
          @click="$emit('close')"
          class="btn-secondary"
        >
          Cancel
        </button>
        <button
          @click="handleSubmit"
          class="btn-primary"
        >
          {{ table ? 'Update' : 'Create' }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive, onMounted } from 'vue'
import type { Table } from '@/types/database'
import { XMarkIcon } from '@heroicons/vue/24/outline'
import ThumbnailPicker from '@/components/Database/ThumbnailPicker.vue'

interface Props {
  databaseId: string
  table?: Table | null
}

const props = defineProps<Props>()

const emit = defineEmits<{
  close: []
  save: [data: any]
}>()

const formData = reactive({
  name: '',
  thumbnail: ''
})

const handleSubmit = () => {
  emit('save', { ...formData })
}

onMounted(() => {
  if (props.table) {
    formData.name = props.table.name
    formData.thumbnail = props.table.thumbnail || ''
  }
})
</script>