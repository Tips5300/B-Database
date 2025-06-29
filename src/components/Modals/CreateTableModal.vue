<template>
  <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
    <div class="bg-white dark:bg-gray-800 rounded-lg shadow-lg max-w-md w-full p-6">
      <div class="flex justify-between items-center mb-6">
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

        <div>
          <label for="emoji" class="form-label">Emoji (Optional)</label>
          <input
            id="emoji"
            v-model="formData.emoji"
            type="text"
            maxlength="2"
            class="form-input text-center text-2xl"
            placeholder="📋"
          />
        </div>

        <ThumbnailPicker v-model="formData.thumbnail" />

        <div class="flex justify-end space-x-3 pt-4">
          <button
            type="button"
            @click="$emit('close')"
            class="btn-secondary"
          >
            Cancel
          </button>
          <button
            type="submit"
            class="btn-primary"
          >
            {{ table ? 'Update' : 'Create' }}
          </button>
        </div>
      </form>
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
  emoji: '',
  thumbnail: ''
})

const handleSubmit = () => {
  emit('save', { ...formData })
}

onMounted(() => {
  if (props.table) {
    formData.name = props.table.name
    formData.emoji = props.table.emoji || ''
    formData.thumbnail = props.table.thumbnail || ''
  }
})
</script>