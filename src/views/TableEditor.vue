<template>
  <div>
    <MobileHeader
      :title="table?.name || 'Table'"
      :subtitle="`${table?.records?.length || 0} records`"
      :show-back-button="true"
    >
      <template #actions>
        <button
          @click="showAddRecordModal = true"
          class="p-2 text-primary-600 dark:text-primary-400 hover:bg-primary-50 dark:hover:bg-primary-900/20 rounded-lg transition-colors"
        >
          <PlusIcon class="w-5 h-5" />
        </button>
        <button
          @click="showTableMenu = true"
          class="p-2 text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition-colors"
        >
          <EllipsisVerticalIcon class="w-5 h-5" />
        </button>
      </template>
    </MobileHeader>

    <div v-if="!table" class="p-4">
      <LoadingSpinner />
    </div>

    <div v-else class="p-4 space-y-4">
      <!-- View Toggle -->
      <div class="flex items-center justify-between">
        <div class="flex bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
          <button
            v-for="view in viewTypes"
            :key="view.type"
            @click="currentView = view.type"
            :class="[
              'flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors',
              currentView === view.type
                ? 'bg-white dark:bg-gray-700 text-primary-600 dark:text-primary-400 shadow-sm'
                : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
            ]"
          >
            <component :is="view.icon" class="w-4 h-4" />
            <span>{{ view.name }}</span>
          </button>
        </div>

        <button
          @click="showFilterModal = true"
          class="flex items-center space-x-2 px-3 py-2 bg-gray-100 dark:bg-gray-800 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
        >
          <FunnelIcon class="w-4 h-4" />
          <span>Filter</span>
          <Badge v-if="activeFilters.length > 0" variant="primary" size="sm">
            {{ activeFilters.length }}
          </Badge>
        </button>
      </div>

      <!-- Table Structure (if no fields) -->
      <div v-if="!table.fields || table.fields.length === 0" class="text-center py-12">
        <TableCellsIcon class="w-16 h-16 text-gray-400 mx-auto mb-4" />
        <h2 class="text-xl font-semibold text-gray-900 dark:text-white mb-2">
          No fields defined
        </h2>
        <p class="text-gray-600 dark:text-gray-400 mb-6">
          Add fields to define the structure of your table
        </p>
        <button
          @click="showAddFieldModal = true"
          class="bg-primary-600 hover:bg-primary-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
        >
          Add Field
        </button>
      </div>

      <!-- Data Views -->
      <div v-else>
        <!-- Table View -->
        <DataTable
          v-if="currentView === 'table'"
          :table="table"
          :records="filteredRecords"
          @edit-record="editRecord"
          @delete-record="deleteRecord"
          @edit-field="editField"
          @delete-field="deleteField"
        />

        <!-- Card View -->
        <CardView
          v-else-if="currentView === 'cards'"
          :table="table"
          :records="filteredRecords"
          @edit-record="editRecord"
          @delete-record="deleteRecord"
        />

        <!-- Kanban View -->
        <KanbanView
          v-else-if="currentView === 'kanban'"
          :table="table"
          :records="filteredRecords"
          @edit-record="editRecord"
          @delete-record="deleteRecord"
          @update-record="updateRecord"
        />

        <!-- Empty State for Records -->
        <div v-if="filteredRecords.length === 0 && table.records && table.records.length > 0" class="text-center py-12">
          <MagnifyingGlassIcon class="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 class="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            No records match your filters
          </h2>
          <p class="text-gray-600 dark:text-gray-400 mb-6">
            Try adjusting your filter criteria
          </p>
          <button
            @click="clearFilters"
            class="bg-primary-600 hover:bg-primary-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
          >
            Clear Filters
          </button>
        </div>

        <div v-else-if="(!table.records || table.records.length === 0)" class="text-center py-12">
          <DocumentTextIcon class="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 class="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            No records yet
          </h2>
          <p class="text-gray-600 dark:text-gray-400 mb-6">
            Add your first record to get started
          </p>
          <button
            @click="showAddRecordModal = true"
            class="bg-primary-600 hover:bg-primary-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
          >
            Add Record
          </button>
        </div>
      </div>
    </div>

    <!-- Modals -->
    <RecordModal
      v-if="showAddRecordModal"
      :table="table"
      :record="editingRecord"
      @close="closeRecordModal"
      @save="handleSaveRecord"
    />

    <FieldModal
      v-if="showAddFieldModal"
      :field="editingField"
      :tables="allTables"
      :current-table-id="table?.id"
      @close="closeFieldModal"
      @save="handleSaveField"
    />

    <FilterModal
      v-if="showFilterModal"
      :table="table"
      :filters="activeFilters"
      @close="showFilterModal = false"
      @apply="applyFilters"
    />

    <!-- Table Menu -->
    <div
      v-if="showTableMenu"
      class="fixed inset-0 bg-black bg-opacity-50 flex items-end justify-center p-4 z-50"
      @click="showTableMenu = false"
    >
      <div class="bg-white dark:bg-gray-800 rounded-t-2xl w-full max-w-md p-6 space-y-4">
        <div class="text-center">
          <h3 class="text-lg font-semibold text-gray-900 dark:text-white">
            Table Options
          </h3>
        </div>
        
        <div class="space-y-2">
          <button
            @click="showAddFieldModal = true; showTableMenu = false"
            class="w-full flex items-center space-x-3 p-3 text-left hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <PlusIcon class="w-5 h-5 text-gray-400" />
            <span class="text-gray-900 dark:text-white">Add Field</span>
          </button>
          
          <button
            @click="exportTable"
            class="w-full flex items-center space-x-3 p-3 text-left hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <ArrowDownTrayIcon class="w-5 h-5 text-gray-400" />
            <span class="text-gray-900 dark:text-white">Export Table</span>
          </button>
          
          <button
            @click="duplicateTable"
            class="w-full flex items-center space-x-3 p-3 text-left hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <DocumentDuplicateIcon class="w-5 h-5 text-gray-400" />
            <span class="text-gray-900 dark:text-white">Duplicate Table</span>
          </button>
          
          <button
            @click="deleteTable"
            class="w-full flex items-center space-x-3 p-3 text-left hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
          >
            <TrashIcon class="w-5 h-5 text-red-500" />
            <span class="text-red-600 dark:text-red-400">Delete Table</span>
          </button>
        </div>
        
        <button
          @click="showTableMenu = false"
          class="w-full p-3 bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg font-medium"
        >
          Cancel
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useDatabaseStore } from '@/stores/database'
import { useToast } from 'vue-toastification'
import type { Table, Record, Field, FilterCondition } from '@/types/database'
import {
  PlusIcon,
  EllipsisVerticalIcon,
  TableCellsIcon,
  DocumentTextIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  ArrowDownTrayIcon,
  DocumentDuplicateIcon,
  TrashIcon,
  Squares2X2Icon,
  ViewColumnsIcon,
  QueueListIcon
} from '@heroicons/vue/24/outline'
import MobileHeader from '@/components/Navigation/MobileHeader.vue'
import LoadingSpinner from '@/components/UI/LoadingSpinner.vue'
import Badge from '@/components/UI/Badge.vue'
import DataTable from '@/components/DataTable/DataTable.vue'
import CardView from '@/components/DataTable/CardView.vue'
import KanbanView from '@/components/DataTable/KanbanView.vue'
import RecordModal from '@/components/Modals/RecordModal.vue'
import FieldModal from '@/components/Modals/FieldModal.vue'
import FilterModal from '@/components/Modals/FilterModal.vue'

const route = useRoute()
const router = useRouter()
const databaseStore = useDatabaseStore()
const toast = useToast()

const databaseId = route.params.id as string
const tableId = route.params.tableId as string

const showAddRecordModal = ref(false)
const showAddFieldModal = ref(false)
const showFilterModal = ref(false)
const showTableMenu = ref(false)
const currentView = ref<'table' | 'cards' | 'kanban'>('table')
const editingRecord = ref<Record | null>(null)
const editingField = ref<Field | null>(null)
const activeFilters = ref<FilterCondition[]>([])

const viewTypes = [
  { type: 'table', name: 'Table', icon: ViewColumnsIcon },
  { type: 'cards', name: 'Cards', icon: Squares2X2Icon },
  { type: 'kanban', name: 'Kanban', icon: QueueListIcon }
]

const table = computed(() => {
  const database = databaseStore.databases.find(db => db.id === databaseId)
  return database?.tables?.find(t => t.id === tableId) || null
})

const allTables = computed(() => {
  const database = databaseStore.databases.find(db => db.id === databaseId)
  return database?.tables || []
})

const filteredRecords = computed(() => {
  if (!table.value?.records || activeFilters.value.length === 0) {
    return table.value?.records || []
  }

  return table.value.records.filter(record => {
    return activeFilters.value.every(filter => {
      const fieldValue = record.data[filter.fieldId]
      
      switch (filter.operator) {
        case 'equals':
          return fieldValue === filter.value
        case 'not_equals':
          return fieldValue !== filter.value
        case 'contains':
          return String(fieldValue).toLowerCase().includes(String(filter.value).toLowerCase())
        case 'not_contains':
          return !String(fieldValue).toLowerCase().includes(String(filter.value).toLowerCase())
        case 'starts_with':
          return String(fieldValue).toLowerCase().startsWith(String(filter.value).toLowerCase())
        case 'ends_with':
          return String(fieldValue).toLowerCase().endsWith(String(filter.value).toLowerCase())
        case 'greater_than':
          return Number(fieldValue) > Number(filter.value)
        case 'less_than':
          return Number(fieldValue) < Number(filter.value)
        case 'greater_equal':
          return Number(fieldValue) >= Number(filter.value)
        case 'less_equal':
          return Number(fieldValue) <= Number(filter.value)
        case 'is_empty':
          return !fieldValue || fieldValue === ''
        case 'is_not_empty':
          return fieldValue && fieldValue !== ''
        default:
          return true
      }
    })
  })
})

const editRecord = (record: Record) => {
  editingRecord.value = record
  showAddRecordModal.value = true
  toast.info('📝 Opening record for editing...')
}

const deleteRecord = async (record: Record) => {
  if (confirm('Are you sure you want to delete this record?')) {
    try {
      await databaseStore.deleteRecord(record.id)
      toast.success('🗑️ Record deleted successfully')
    } catch (error) {
      toast.error('Failed to delete record')
      console.error('Delete record error:', error)
    }
  }
}

const editField = (field: Field) => {
  editingField.value = field
  showAddFieldModal.value = true
  toast.info('⚙️ Opening field for editing...')
}

const deleteField = async (field: Field) => {
  if (confirm(`Are you sure you want to delete the field "${field.name}"? This will also delete all data in this field.`)) {
    try {
      await databaseStore.deleteField(field.id)
      toast.success('🗑️ Field deleted successfully')
    } catch (error) {
      toast.error('Failed to delete field')
      console.error('Delete field error:', error)
    }
  }
}

const updateRecord = async (recordId: string, data: any) => {
  try {
    await databaseStore.updateRecord(recordId, data)
    toast.success('✅ Record updated successfully')
  } catch (error) {
    toast.error('Failed to update record')
    console.error('Update record error:', error)
  }
}

const closeRecordModal = () => {
  showAddRecordModal.value = false
  editingRecord.value = null
}

const closeFieldModal = () => {
  showAddFieldModal.value = false
  editingField.value = null
}

const handleSaveRecord = async (recordData: any) => {
  try {
    if (editingRecord.value) {
      await databaseStore.updateRecord(editingRecord.value.id, recordData)
      toast.success('✅ Record updated successfully')
    } else {
      await databaseStore.addRecord(tableId, recordData)
      toast.success('🎉 Record added successfully')
    }
    closeRecordModal()
  } catch (error) {
    toast.error('Failed to save record')
    console.error('Save record error:', error)
  }
}

const handleSaveField = async (fieldData: any) => {
  try {
    if (editingField.value) {
      await databaseStore.updateField(editingField.value.id, fieldData)
      toast.success('✅ Field updated successfully')
    } else {
      await databaseStore.addField(tableId, fieldData)
      toast.success('🎉 Field added successfully')
    }
    closeFieldModal()
  } catch (error) {
    toast.error('Failed to save field')
    console.error('Save field error:', error)
  }
}

const applyFilters = (filters: FilterCondition[]) => {
  activeFilters.value = filters
  showFilterModal.value = false
  toast.success(`🔍 Applied ${filters.length} filter(s)`)
}

const clearFilters = () => {
  activeFilters.value = []
  toast.success('🧹 Filters cleared')
}

const exportTable = async () => {
  if (!table.value) return
  
  try {
    const exportData = {
      table: {
        name: table.value.name,
        fields: table.value.fields,
        records: filteredRecords.value
      },
      exportedAt: new Date().toISOString()
    }
    
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${table.value.name.replace(/[^a-z0-9]/gi, '_')}.json`
    a.click()
    URL.revokeObjectURL(url)
    
    toast.success('📥 Table exported successfully')
  } catch (error) {
    toast.error('Failed to export table')
    console.error('Export table error:', error)
  }
  showTableMenu.value = false
}

const duplicateTable = async () => {
  if (!table.value) return
  
  try {
    const newTable = await databaseStore.createTable(databaseId, `${table.value.name} (Copy)`, table.value.thumbnail)
    
    // Copy fields
    for (const field of table.value.fields) {
      await databaseStore.addField(newTable.id, {
        name: field.name,
        type: field.type,
        isRequired: field.isRequired,
        isPrimary: field.isPrimary,
        isUnique: field.isUnique,
        defaultValue: field.defaultValue,
        validation: field.validation,
        options: field.options,
        position: field.position
      })
    }
    
    // Copy records
    for (const record of table.value.records || []) {
      await databaseStore.addRecord(newTable.id, record.data)
    }
    
    toast.success('📋 Table duplicated successfully with all records')
    
    // Navigate to the duplicated table
    await router.push(`/database/${databaseId}/table/${newTable.id}`)
  } catch (error) {
    toast.error('Failed to duplicate table')
    console.error('Duplicate table error:', error)
  }
  showTableMenu.value = false
}

const deleteTable = async () => {
  if (!table.value) return
  
  if (confirm(`Are you sure you want to delete the table "${table.value.name}"? This action cannot be undone.`)) {
    try {
      await databaseStore.deleteTable(table.value.id)
      toast.success('🗑️ Table deleted successfully')
      await router.push(`/database/${databaseId}`)
    } catch (error) {
      toast.error('Failed to delete table')
      console.error('Delete table error:', error)
    }
  }
  showTableMenu.value = false
}

onMounted(() => {
  if (!table.value) {
    databaseStore.loadDatabases()
  }
})
</script>