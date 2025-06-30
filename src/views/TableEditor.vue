<template>
  <div>
    <MobileHeader 
      :title="table?.name || 'Table'" 
      :subtitle="`${table?.records?.length || 0} records`"
      :show-back-button="true"
    >
      <template #actions>
        <button
          @click="showViewSelector = !showViewSelector"
          class="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
        >
          <Squares2X2Icon v-if="currentView === 'table'" class="w-5 h-5" />
          <TableCellsIcon v-else-if="currentView === 'cards'" class="w-5 h-5" />
          <ViewColumnsIcon v-else class="w-5 h-5" />
        </button>
        <button
          @click="showAddFieldModal = true"
          class="p-2 text-primary-600 dark:text-primary-400 hover:bg-primary-50 dark:hover:bg-primary-900/20 rounded-lg transition-colors"
        >
          <PlusIcon class="w-5 h-5" />
        </button>
      </template>
    </MobileHeader>

    <!-- View Selector -->
    <div v-if="showViewSelector" class="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-4">
      <div class="flex space-x-2">
        <button
          v-for="view in views"
          :key="view.id"
          @click="selectView(view.id)"
          :class="[
            'flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
            currentView === view.id
              ? 'bg-primary-100 dark:bg-primary-900 text-primary-700 dark:text-primary-300'
              : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
          ]"
        >
          <component :is="view.icon" class="w-4 h-4" />
          <span>{{ view.name }}</span>
        </button>
      </div>
    </div>

    <div v-if="!table" class="p-4">
      <LoadingSpinner />
    </div>

    <div v-else class="p-4">
      <!-- Table Stats -->
      <div class="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm mb-6">
        <div class="grid grid-cols-3 gap-4 text-center">
          <div>
            <div class="text-lg font-bold text-primary-600 dark:text-primary-400">
              {{ table.fields?.length || 0 }}
            </div>
            <div class="text-xs text-gray-500 dark:text-gray-400">Fields</div>
          </div>
          <div>
            <div class="text-lg font-bold text-green-600 dark:text-green-400">
              {{ table.records?.length || 0 }}
            </div>
            <div class="text-xs text-gray-500 dark:text-gray-400">Records</div>
          </div>
          <div>
            <div class="text-lg font-bold text-blue-600 dark:text-blue-400">
              {{ getRelationshipCount() }}
            </div>
            <div class="text-xs text-gray-500 dark:text-gray-400">Relations</div>
          </div>
        </div>
      </div>

      <!-- Quick Actions -->
      <div class="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm mb-6">
        <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-3">Quick Actions</h3>
        <div class="grid grid-cols-2 gap-3">
          <button
            @click="showAddRecordModal = true"
            class="flex flex-col items-center p-3 bg-primary-50 dark:bg-primary-900/20 rounded-lg hover:bg-primary-100 dark:hover:bg-primary-900/30 transition-colors"
          >
            <PlusIcon class="w-6 h-6 text-primary-600 dark:text-primary-400 mb-1" />
            <span class="text-sm font-medium text-primary-600 dark:text-primary-400">Add Record</span>
          </button>

          <button
            @click="showFilterModal = true"
            class="flex flex-col items-center p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors"
          >
            <FunnelIcon class="w-6 h-6 text-blue-600 dark:text-blue-400 mb-1" />
            <span class="text-sm font-medium text-blue-600 dark:text-blue-400">Filter</span>
          </button>

          <button
            @click="exportTable"
            class="flex flex-col items-center p-3 bg-green-50 dark:bg-green-900/20 rounded-lg hover:bg-green-100 dark:hover:bg-green-900/30 transition-colors"
          >
            <ArrowDownTrayIcon class="w-6 h-6 text-green-600 dark:text-green-400 mb-1" />
            <span class="text-sm font-medium text-green-600 dark:text-green-400">Export</span>
          </button>

          <button
            @click="showRelationshipModal = true"
            class="flex flex-col items-center p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg hover:bg-purple-100 dark:hover:bg-purple-900/30 transition-colors"
          >
            <LinkIcon class="w-6 h-6 text-purple-600 dark:text-purple-400 mb-1" />
            <span class="text-sm font-medium text-purple-600 dark:text-purple-400">Relations</span>
          </button>
        </div>
      </div>

      <!-- Data View -->
      <div class="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden">
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
      </div>
    </div>

    <!-- Modals -->
    <FieldModal
      v-if="showAddFieldModal"
      :field="editingField"
      :tables="allTables"
      :current-table-id="tableId"
      @close="closeFieldModal"
      @save="handleSaveField"
    />

    <RecordModal
      v-if="showAddRecordModal"
      :table="table"
      :record="editingRecord"
      @close="closeRecordModal"
      @save="handleSaveRecord"
    />

    <FilterModal
      v-if="showFilterModal"
      :table="table"
      :filters="filters"
      @close="showFilterModal = false"
      @apply="applyFilters"
    />

    <RelationshipModal
      v-if="showRelationshipModal"
      :relationship="editingRelationship"
      :tables="allTables"
      :current-table-id="tableId"
      @close="closeRelationshipModal"
      @save="handleSaveRelationship"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useDatabaseStore } from '@/stores/database'
import { useToastStore } from '@/stores/toast'
import type { Table, Field, Record, FilterCondition, Relationship } from '@/types/database'
import {
  PlusIcon,
  Squares2X2Icon,
  TableCellsIcon,
  ViewColumnsIcon,
  FunnelIcon,
  ArrowDownTrayIcon,
  LinkIcon
} from '@heroicons/vue/24/outline'
import MobileHeader from '@/components/Navigation/MobileHeader.vue'
import LoadingSpinner from '@/components/UI/LoadingSpinner.vue'
import DataTable from '@/components/DataTable/DataTable.vue'
import CardView from '@/components/DataTable/CardView.vue'
import KanbanView from '@/components/DataTable/KanbanView.vue'
import FieldModal from '@/components/Modals/FieldModal.vue'
import RecordModal from '@/components/Modals/RecordModal.vue'
import FilterModal from '@/components/Modals/FilterModal.vue'
import RelationshipModal from '@/components/Modals/RelationshipModal.vue'

const route = useRoute()
const databaseStore = useDatabaseStore()
const toastStore = useToastStore()

const databaseId = route.params.id as string
const tableId = route.params.tableId as string

const showViewSelector = ref(false)
const currentView = ref('table')
const showAddFieldModal = ref(false)
const showAddRecordModal = ref(false)
const showFilterModal = ref(false)
const showRelationshipModal = ref(false)
const editingField = ref<Field | null>(null)
const editingRecord = ref<Record | null>(null)
const editingRelationship = ref<Relationship | null>(null)
const filters = ref<FilterCondition[]>([])

const views = [
  { id: 'table', name: 'Table', icon: TableCellsIcon },
  { id: 'cards', name: 'Cards', icon: Squares2X2Icon },
  { id: 'kanban', name: 'Kanban', icon: ViewColumnsIcon }
]

const table = computed(() => databaseStore.findTableById(tableId))
const allTables = computed(() => databaseStore.databases.flatMap(db => db.tables || []))

const filteredRecords = computed(() => {
  if (!table.value?.records || filters.value.length === 0) {
    return table.value?.records || []
  }

  return table.value.records.filter(record => {
    return filters.value.every(filter => {
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

const getRelationshipCount = () => {
  return (table.value?.sourceRelationships?.length || 0) + (table.value?.targetRelationships?.length || 0)
}

const selectView = (viewId: string) => {
  currentView.value = viewId
  showViewSelector.value = false
}

const closeFieldModal = () => {
  showAddFieldModal.value = false
  editingField.value = null
}

const closeRecordModal = () => {
  showAddRecordModal.value = false
  editingRecord.value = null
}

const closeRelationshipModal = () => {
  showRelationshipModal.value = false
  editingRelationship.value = null
}

const handleSaveField = async (fieldData: any) => {
  try {
    if (editingField.value) {
      await databaseStore.updateField(editingField.value.id, fieldData)
      toastStore.success('Field updated successfully')
    } else {
      await databaseStore.addField(tableId, fieldData)
      toastStore.success('Field added successfully')
    }
    closeFieldModal()
  } catch (error) {
    toastStore.error('Failed to save field')
  }
}

const handleSaveRecord = async (recordData: any) => {
  try {
    if (editingRecord.value) {
      await databaseStore.updateRecord(editingRecord.value.id, recordData)
      toastStore.success('Record updated successfully')
    } else {
      await databaseStore.addRecord(tableId, recordData)
      toastStore.success('Record added successfully')
    }
    closeRecordModal()
  } catch (error) {
    toastStore.error('Failed to save record')
  }
}

const handleSaveRelationship = async (relationshipData: any) => {
  try {
    if (editingRelationship.value) {
      await databaseStore.updateRelationship(editingRelationship.value.id, relationshipData)
      toastStore.success('Relationship updated successfully')
    } else {
      await databaseStore.createRelationship(relationshipData)
      toastStore.success('Relationship created successfully')
    }
    closeRelationshipModal()
  } catch (error) {
    toastStore.error('Failed to save relationship')
  }
}

const editRecord = (record: Record) => {
  editingRecord.value = record
  showAddRecordModal.value = true
}

const deleteRecord = async (record: Record) => {
  if (confirm('Are you sure you want to delete this record?')) {
    try {
      await databaseStore.deleteRecord(record.id)
      toastStore.success('Record deleted successfully')
    } catch (error) {
      toastStore.error('Failed to delete record')
    }
  }
}

const editField = (field: Field) => {
  editingField.value = field
  showAddFieldModal.value = true
}

const deleteField = async (field: Field) => {
  if (confirm(`Are you sure you want to delete the field "${field.name}"?`)) {
    try {
      await databaseStore.deleteField(field.id)
      toastStore.success('Field deleted successfully')
    } catch (error) {
      toastStore.error('Failed to delete field')
    }
  }
}

const updateRecord = async (recordId: string, data: any) => {
  try {
    await databaseStore.updateRecord(recordId, data)
    toastStore.success('Record updated successfully')
  } catch (error) {
    toastStore.error('Failed to update record')
  }
}

const applyFilters = (newFilters: FilterCondition[]) => {
  filters.value = newFilters
  showFilterModal.value = false
  toastStore.success(`Applied ${newFilters.length} filter(s)`)
}

const exportTable = async () => {
  try {
    if (!table.value) return

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

    toastStore.success('Table exported successfully')
  } catch (error) {
    toastStore.error('Failed to export table')
  }
}

onMounted(() => {
  if (!table.value) {
    databaseStore.loadDatabases()
  }
})
</script>