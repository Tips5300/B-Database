<template>
  <div>
    <MobileHeader
      title="Settings"
      icon="⚙️"
    />

    <div class="p-4 space-y-6">
      <!-- Appearance -->
      <div class="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm">
        <h2 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Appearance
        </h2>
        <div class="space-y-4">
          <div class="flex items-center justify-between">
            <div>
              <div class="font-medium text-gray-900 dark:text-white">Dark Mode</div>
              <div class="text-sm text-gray-500 dark:text-gray-400">Switch between light and dark themes</div>
            </div>
            <button
              @click="settingsStore.toggleDarkMode"
              :class="[
                'relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none',
                settingsStore.isDarkMode ? 'bg-primary-600' : 'bg-gray-200'
              ]"
            >
              <span
                :class="[
                  'inline-block h-4 w-4 transform rounded-full bg-white transition-transform',
                  settingsStore.isDarkMode ? 'translate-x-6' : 'translate-x-1'
                ]"
              />
            </button>
          </div>

          <div class="flex items-center justify-between">
            <div>
              <div class="font-medium text-gray-900 dark:text-white">Compact Mode</div>
              <div class="text-sm text-gray-500 dark:text-gray-400">Use more compact layouts</div>
            </div>
            <button
              @click="toggleCompactMode"
              :class="[
                'relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none',
                settingsStore.compactMode ? 'bg-primary-600' : 'bg-gray-200'
              ]"
            >
              <span
                :class="[
                  'inline-block h-4 w-4 transform rounded-full bg-white transition-transform',
                  settingsStore.compactMode ? 'translate-x-6' : 'translate-x-1'
                ]"
              />
            </button>
          </div>
        </div>
      </div>

      <!-- Security -->
      <div class="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm">
        <h2 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Security
        </h2>
        <div class="space-y-4">
          <button
            @click="changeAuthMethod"
            class="w-full flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
          >
            <div class="flex items-center space-x-3">
              <FingerPrintIcon class="w-5 h-5 text-gray-400" />
              <div class="text-left">
                <div class="font-medium text-gray-900 dark:text-white">Authentication Method</div>
                <div class="text-sm text-gray-500 dark:text-gray-400 capitalize">
                  {{ authStore.authMethod || 'Not set' }}
                </div>
              </div>
            </div>
            <ChevronRightIcon class="w-5 h-5 text-gray-400" />
          </button>

          <button
            @click="resetAuth"
            class="w-full flex items-center justify-between p-3 bg-red-50 dark:bg-red-900/20 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors"
          >
            <div class="flex items-center space-x-3">
              <TrashIcon class="w-5 h-5 text-red-500" />
              <div class="text-left">
                <div class="font-medium text-red-600 dark:text-red-400">Reset Authentication</div>
                <div class="text-sm text-red-500 dark:text-red-400">Clear all authentication data</div>
              </div>
            </div>
            <ChevronRightIcon class="w-5 h-5 text-red-400" />
          </button>
        </div>
      </div>

      <!-- Backup & Sync -->
      <div class="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm">
        <h2 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Backup & Sync
        </h2>
        <div class="space-y-4">
          <div class="flex items-center justify-between">
            <div>
              <div class="font-medium text-gray-900 dark:text-white">Auto Backup</div>
              <div class="text-sm text-gray-500 dark:text-gray-400">Automatically backup your data</div>
            </div>
            <button
              @click="toggleAutoBackup"
              :class="[
                'relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none',
                settingsStore.autoBackup ? 'bg-primary-600' : 'bg-gray-200'
              ]"
            >
              <span
                :class="[
                  'inline-block h-4 w-4 transform rounded-full bg-white transition-transform',
                  settingsStore.autoBackup ? 'translate-x-6' : 'translate-x-1'
                ]"
              />
            </button>
          </div>

          <div>
            <label class="block font-medium text-gray-900 dark:text-white mb-2">
              Backup Frequency
            </label>
            <select
              v-model="settingsStore.backupFrequency"
              @change="settingsStore.saveSettings"
              class="w-full px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:text-white"
            >
              <option value="hourly">Hourly</option>
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
              <option value="monthly">Monthly</option>
            </select>
          </div>
        </div>
      </div>

      <!-- Data Management -->
      <div class="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm">
        <h2 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Data Management
        </h2>
        <div class="space-y-3">
          <button
            @click="exportAllData"
            class="w-full flex items-center justify-center p-3 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors"
          >
            <ArrowDownTrayIcon class="w-5 h-5 mr-2" />
            Export All Data
          </button>

          <button
            @click="importData"
            class="w-full flex items-center justify-center p-3 bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 rounded-lg hover:bg-green-100 dark:hover:bg-green-900/30 transition-colors"
          >
            <ArrowUpTrayIcon class="w-5 h-5 mr-2" />
            Import Data
          </button>

          <button
            @click="clearAllData"
            class="w-full flex items-center justify-center p-3 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors"
          >
            <TrashIcon class="w-5 h-5 mr-2" />
            Clear All Data
          </button>
        </div>
      </div>

      <!-- Subscription -->
      <div class="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm">
        <h2 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Subscription
        </h2>
        <div class="flex items-center justify-between">
          <div>
            <div class="font-medium text-gray-900 dark:text-white capitalize">
              {{ authStore.subscriptionPlan }} Plan
            </div>
            <div class="text-sm text-gray-500 dark:text-gray-400">
              {{ getPlanDescription() }}
            </div>
          </div>
          <button
            @click="showPurchaseModal = true"
            class="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg font-medium transition-colors"
          >
            Upgrade
          </button>
        </div>
      </div>

      <!-- About -->
      <div class="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm">
        <h2 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          About
        </h2>
        <div class="space-y-2 text-sm text-gray-600 dark:text-gray-400">
          <div class="flex justify-between">
            <span>Version</span>
            <span>1.0.0</span>
          </div>
          <div class="flex justify-between">
            <span>Build</span>
            <span>2024.01.15</span>
          </div>
          <div class="flex justify-between">
            <span>Device ID</span>
            <span class="font-mono text-xs">{{ authStore.deviceId.slice(0, 8) }}...</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Purchase Modal -->
    <PurchaseModal
      v-if="showPurchaseModal"
      @close="showPurchaseModal = false"
      @success="handlePurchaseSuccess"
    />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { useSettingsStore } from '@/stores/settings'
import { useDatabaseStore } from '@/stores/database'
import { useToast } from 'vue-toastification'
import {
  FingerPrintIcon,
  TrashIcon,
  ChevronRightIcon,
  ArrowDownTrayIcon,
  ArrowUpTrayIcon
} from '@heroicons/vue/24/outline'
import MobileHeader from '@/components/Navigation/MobileHeader.vue'
import PurchaseModal from '@/components/Purchase/PurchaseModal.vue'

const authStore = useAuthStore()
const settingsStore = useSettingsStore()
const databaseStore = useDatabaseStore()
const toast = useToast()

const showPurchaseModal = ref(false)

const toggleCompactMode = () => {
  settingsStore.compactMode = !settingsStore.compactMode
  settingsStore.saveSettings()
  toast.success(`Compact mode ${settingsStore.compactMode ? 'enabled' : 'disabled'}`)
}

const toggleAutoBackup = () => {
  settingsStore.autoBackup = !settingsStore.autoBackup
  settingsStore.saveSettings()
  toast.success(`Auto backup ${settingsStore.autoBackup ? 'enabled' : 'disabled'}`)
}

const changeAuthMethod = () => {
  toast.info('Authentication method change coming soon')
}

const resetAuth = () => {
  if (confirm('Are you sure you want to reset authentication? You will need to set it up again.')) {
    authStore.resetAuth()
    toast.success('Authentication reset successfully')
  }
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
    a.download = `full_backup_${new Date().toISOString().split('T')[0]}.sql`
    a.click()
    URL.revokeObjectURL(url)
    
    toast.success('Data exported successfully')
  } catch (error) {
    toast.error('Failed to export data')
  }
}

const importData = () => {
  const input = document.createElement('input')
  input.type = 'file'
  input.accept = '.sql,.json,.csv'
  input.onchange = async (e) => {
    const file = (e.target as HTMLInputElement).files?.[0]
    if (file) {
      try {
        await databaseStore.importData(file, {
          format: file.name.endsWith('.sql') ? 'sql' : 'json',
          createTable: true,
          updateExisting: false
        })
        toast.success('Data imported successfully')
      } catch (error) {
        toast.error('Failed to import data')
      }
    }
  }
  input.click()
}

const clearAllData = () => {
  if (confirm('Are you sure you want to clear all data? This action cannot be undone.')) {
    // Clear localStorage database
    localStorage.removeItem('database')
    // Reload the page to reinitialize
    window.location.reload()
  }
}

const getPlanDescription = () => {
  const descriptions = {
    free: 'Basic features with limited storage',
    premium: 'Advanced features with cloud sync',
    professional: 'Full features for teams',
    enterprise: 'Custom solutions for organizations'
  }
  return descriptions[authStore.subscriptionPlan as keyof typeof descriptions] || 'Unknown plan'
}

const handlePurchaseSuccess = (productId: string) => {
  toast.success('Purchase successful!')
  showPurchaseModal.value = false
  authStore.updateSubscription('premium') // Update based on actual purchase
}
</script>