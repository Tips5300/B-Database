<template>
  <div>
    <MobileHeader title="Dashboard" icon="📊" :show-search="true" :show-menu="true" @search="handleSearch"
      @menu="handleMenu" />

    <div class="p-4 space-y-6">
      <!-- Stats Cards -->
      <div class="grid grid-cols-2 gap-4">
        <div class="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm">
          <div class="flex items-center space-x-3">
            <div class="w-10 h-10 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center">
              <ServerStackIcon class="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <p class="text-2xl font-bold text-gray-900 dark:text-white">
                {{ databaseStore.stats.totalDatabases }}
              </p>
              <p class="text-xs text-gray-500 dark:text-gray-400">Databases</p>
            </div>
          </div>
        </div>

        <div class="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm">
          <div class="flex items-center space-x-3">
            <div class="w-10 h-10 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center">
              <TableCellsIcon class="w-5 h-5 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <p class="text-2xl font-bold text-gray-900 dark:text-white">
                {{ databaseStore.stats.totalTables }}
              </p>
              <p class="text-xs text-gray-500 dark:text-gray-400">Tables</p>
            </div>
          </div>
        </div>

        <div class="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm">
          <div class="flex items-center space-x-3">
            <div class="w-10 h-10 bg-purple-100 dark:bg-purple-900 rounded-lg flex items-center justify-center">
              <DocumentTextIcon class="w-5 h-5 text-purple-600 dark:text-purple-400" />
            </div>
            <div>
              <p class="text-2xl font-bold text-gray-900 dark:text-white">
                {{ databaseStore.stats.totalRecords }}
              </p>
              <p class="text-xs text-gray-500 dark:text-gray-400">Records</p>
            </div>
          </div>
        </div>

        <div class="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm">
          <div class="flex items-center space-x-3">
            <div class="w-10 h-10 bg-orange-100 dark:bg-orange-900 rounded-lg flex items-center justify-center">
              <CloudIcon class="w-5 h-5 text-orange-600 dark:text-orange-400" />
            </div>
            <div>
              <p class="text-2xl font-bold text-gray-900 dark:text-white">
                {{ formatBytes(databaseStore.stats.storageUsed) }}
              </p>
              <p class="text-xs text-gray-500 dark:text-gray-400">Storage</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Quick Actions -->
      <div class="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm">
        <h2 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Quick Actions
        </h2>
        <div class="grid grid-cols-2 gap-3">
          <button @click="$router.push('/databases')"
            class="flex flex-col items-center p-4 bg-primary-50 dark:bg-primary-900/20 rounded-lg hover:bg-primary-100 dark:hover:bg-primary-900/30 transition-colors">
            <PlusIcon class="w-8 h-8 text-primary-600 dark:text-primary-400 mb-2" />
            <span class="text-sm font-medium text-primary-600 dark:text-primary-400">
              New Database
            </span>
          </button>

          <button @click="showImportModal = true"
            class="flex flex-col items-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg hover:bg-green-100 dark:hover:bg-green-900/30 transition-colors">
            <ArrowUpTrayIcon class="w-8 h-8 text-green-600 dark:text-green-400 mb-2" />
            <span class="text-sm font-medium text-green-600 dark:text-green-400">
              Import Data
            </span>
          </button>

          <button @click="showPurchaseModal = true"
            class="flex flex-col items-center p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg hover:bg-yellow-100 dark:hover:bg-yellow-900/30 transition-colors">
            <StarIcon class="w-8 h-8 text-yellow-600 dark:text-yellow-400 mb-2" />
            <span class="text-sm font-medium text-yellow-600 dark:text-yellow-400">
              Upgrade
            </span>
          </button>

          <button @click="exportAllData"
            class="flex flex-col items-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors">
            <ArrowDownTrayIcon class="w-8 h-8 text-blue-600 dark:text-blue-400 mb-2" />
            <span class="text-sm font-medium text-blue-600 dark:text-blue-400">
              Export All
            </span>
          </button>
        </div>
      </div>

      <!-- Recent Databases -->
      <div class="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm">
        <h2 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Recent Databases
        </h2>

        <div v-if="recentDatabases.length === 0" class="text-center py-8">
          <ServerStackIcon class="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p class="text-gray-500 dark:text-gray-400 mb-4">No databases yet</p>
          <button @click="$router.push('/databases')"
            class="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
            Create Your First Database
          </button>
        </div>

        <div v-else class="space-y-3">
          <div v-for="database in recentDatabases" :key="database.id"
            class="flex items-center space-x-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors cursor-pointer"
            @click="$router.push(`/database/${database.id}`)">
            <div class="w-12 h-12 bg-gray-200 dark:bg-gray-600 rounded-lg overflow-hidden shrink-0">
              <img v-if="database.thumbnail" :src="database.thumbnail" :alt="database.name"
                class="w-full h-full object-cover" />
              <div v-else class="w-full h-full flex items-center justify-center text-xl">
                📊
              </div>
            </div>
            <div class="flex-1 min-w-0">
              <h3 class="font-medium text-gray-900 dark:text-white truncate">
                {{ database.name }}
              </h3>
              <p class="text-sm text-gray-500 dark:text-gray-400">
                {{ database.tables?.length || 0 }} tables
              </p>
            </div>
            <ChevronRightIcon class="w-5 h-5 text-gray-400" />
          </div>
        </div>
      </div>
    </div>

    <!-- Modals -->
    <PurchaseModal v-if="showPurchaseModal" @close="showPurchaseModal = false" @success="handlePurchaseSuccess" />
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useDatabaseStore } from '@/stores/database'
import { useToastStore } from '@/stores/toast'
import {
  ServerStackIcon,
  TableCellsIcon,
  DocumentTextIcon,
  CloudIcon,
  PlusIcon,
  ArrowUpTrayIcon,
  ArrowDownTrayIcon,
  StarIcon,
  ChevronRightIcon
} from '@heroicons/vue/24/outline'
import MobileHeader from '@/components/Navigation/MobileHeader.vue'
import PurchaseModal from '@/components/Purchase/PurchaseModal.vue'

const databaseStore = useDatabaseStore()
const toastStore = useToastStore()

const showPurchaseModal = ref(false)

const recentDatabases = computed(() =>
  databaseStore.databases.slice(0, 5)
)

const formatBytes = (bytes: number) => {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i]
}

const handleSearch = () => {
  // Implement search functionality
  toastStore.info('Search functionality coming soon')
}

const handleMenu = () => {
  // Implement menu functionality
  toastStore.info('Menu functionality coming soon')
}

const exportAllData = async () => {
  try {
    const blob = await databaseStore.exportData({
      format: 'sql',
      includeMetadata: true,
      includeRelationships: true
    })

    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `database_export_${new Date().toISOString().split('T')[0]}.sql`
    a.click()
    URL.revokeObjectURL(url)

    toastStore.success('Data exported successfully')
  } catch (error) {
    toastStore.error('Failed to export data')
  }
}

const handlePurchaseSuccess = (productId: string) => {
  toastStore.success('Purchase successful!')
  showPurchaseModal.value = false
  // Update subscription status
}
</script>
