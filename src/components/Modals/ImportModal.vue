<template>
  <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
    <div class="bg-white dark:bg-gray-800 rounded-lg shadow-lg max-w-md w-full p-6">
      <div class="flex justify-between items-center mb-6">
        <h2 class="text-xl font-semibold text-gray-900 dark:text-white">
          Import Data
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
          <label for="file" class="form-label">Select File</label>
          <input
            id="file"
            ref="fileInput"
            type="file"
            accept=".json,.csv"
            @change="handleFileChange"
            class="block w-full text-sm text-gray-900 border border-gray-300 rounded-lg cursor-pointer bg-gray-50 dark:text-gray-400 focus:outline-none dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400"
          />
        </div>

        <div>
          <label for="format" class="form-label">Format</label>
          <select
            id="format"
            v-model="importOptions.format"
            class="form-input"
          >
            <option value="json">JSON</option>
            <option value="csv">CSV</option>
          </select>
        </div>

        <div class="flex items-center">
          <input
            id="createTable"
            v-model="importOptions.createTable"
            type="checkbox"
            class="w-4 h-4 text-primary-600 bg-gray-100 border-gray-300 rounded focus:ring-primary-500 dark:focus:ring-primary-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
          />
          <label for="createTable" class="ml-2 text-sm text-gray-900 dark:text-gray-300">
            Create new table if needed
          </label>
        </div>

        <div class="flex items-center">
          <input
            id="updateExisting"
            v-model="importOptions.updateExisting"
            type="checkbox"
            class="w-4 h-4 text-primary-600 bg-gray-100 border-gray-300 rounded focus:ring-primary-500 dark:focus:ring-primary-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
          />
          <label for="updateExisting" class="ml-2 text-sm text-gray-900 dark:text-gray-300">
            Update existing records
          </label>
        </div>

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
            :disabled="!selectedFile"
            class="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Import
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { XMarkIcon } from '@heroicons/vue/24/outline'
import type { ImportOptions } from '@/types/database'

const emit = defineEmits<{
  close: []
  import: [file: File, options: ImportOptions]
}>()

const fileInput = ref<HTMLInputElement>()
const selectedFile = ref<File | null>(null)

const importOptions = reactive<ImportOptions>({
  format: 'json',
  createTable: true,
  updateExisting: false
})

const handleFileChange = (event: Event) => {
  const target = event.target as HTMLInputElement
  selectedFile.value = target.files?.[0] || null
}

const handleSubmit = () => {
  if (selectedFile.value) {
    emit('import', selectedFile.value, { ...importOptions })
  }
}
</script>