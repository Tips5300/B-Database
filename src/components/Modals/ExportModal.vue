<template>
  <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
    <div class="bg-white dark:bg-gray-800 rounded-lg shadow-lg max-w-md w-full p-6">
      <div class="flex justify-between items-center mb-6">
        <h2 class="text-xl font-semibold text-gray-900 dark:text-white">
          Export Data
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
          <label for="format" class="form-label">Export Format</label>
          <select
            id="format"
            v-model="exportOptions.format"
            class="form-input"
          >
            <option value="json">JSON</option>
            <option value="csv">CSV</option>
            <option value="html">HTML Table</option>
            <option value="pdf">PDF Document</option>
            <option value="docx">Word Document</option>
          </select>
        </div>

        <div v-if="database.tables.length > 1">
          <label class="form-label">Tables to Export</label>
          <div class="space-y-2 max-h-32 overflow-y-auto">
            <label
              v-for="table in database.tables"
              :key="table.id"
              class="flex items-center space-x-2"
            >
              <input
                v-model="selectedTables"
                :value="table.id"
                type="checkbox"
                class="w-4 h-4 text-primary-600 bg-gray-100 border-gray-300 rounded focus:ring-primary-500"
              />
              <span class="text-sm text-gray-900 dark:text-white">
                {{ table.emoji }} {{ table.name }} ({{ table.records.length }} records)
              </span>
            </label>
          </div>
          <button
            type="button"
            @click="toggleAllTables"
            class="text-xs text-primary-600 dark:text-primary-400 hover:underline mt-2"
          >
            {{ selectedTables.length === database.tables.length ? 'Deselect All' : 'Select All' }}
          </button>
        </div>

        <div class="space-y-3">
          <label class="flex items-center space-x-2">
            <input
              v-model="exportOptions.includeMetadata"
              type="checkbox"
              class="w-4 h-4 text-primary-600 bg-gray-100 border-gray-300 rounded focus:ring-primary-500"
            />
            <span class="text-sm text-gray-900 dark:text-white">Include metadata</span>
          </label>

          <label class="flex items-center space-x-2">
            <input
              v-model="exportOptions.includeRelationships"
              type="checkbox"
              class="w-4 h-4 text-primary-600 bg-gray-100 border-gray-300 rounded focus:ring-primary-500"
            />
            <span class="text-sm text-gray-900 dark:text-white">Include relationships</span>
          </label>
        </div>

        <div class="bg-gray-50 dark:bg-gray-700 rounded-lg p-3">
          <div class="text-sm text-gray-700 dark:text-gray-300">
            <div class="font-medium mb-1">Export Summary:</div>
            <div>Format: {{ exportOptions.format.toUpperCase() }}</div>
            <div>Tables: {{ selectedTables.length }} of {{ database.tables.length }}</div>
            <div>Total Records: {{ getTotalRecords() }}</div>
          </div>
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
            :disabled="selectedTables.length === 0"
            class="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Export
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import type { Database, ExportOptions } from '@/types/database'
import { XMarkIcon } from '@heroicons/vue/24/outline'

interface Props {
  database: Database
}

const props = defineProps<Props>()

const emit = defineEmits<{
  close: []
  export: [options: ExportOptions]
}>()

const selectedTables = ref<string[]>([])

const exportOptions = reactive<ExportOptions>({
  format: 'json',
  includeMetadata: true,
  includeRelationships: false,
  tables: []
})

const getTotalRecords = () => {
  return props.database.tables
    .filter(table => selectedTables.value.includes(table.id))
    .reduce((total, table) => total + table.records.length, 0)
}

const toggleAllTables = () => {
  if (selectedTables.value.length === props.database.tables.length) {
    selectedTables.value = []
  } else {
    selectedTables.value = props.database.tables.map(table => table.id)
  }
}

const handleSubmit = () => {
  exportOptions.tables = selectedTables.value
  emit('export', { ...exportOptions })
}

onMounted(() => {
  // Select all tables by default
  selectedTables.value = props.database.tables.map(table => table.id)
})
</script>