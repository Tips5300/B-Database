<template>
  <div>
    <MobileHeader
      title="Profile"
      icon="👤"
    />

    <div class="p-4 space-y-6">
      <!-- Profile Header -->
      <div class="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm text-center">
        <div class="w-20 h-20 bg-primary-100 dark:bg-primary-900 rounded-full flex items-center justify-center mx-auto mb-4">
          <UserIcon class="w-10 h-10 text-primary-600 dark:text-primary-400" />
        </div>
        <h2 class="text-xl font-bold text-gray-900 dark:text-white mb-1">
          Database User
        </h2>
        <p class="text-gray-500 dark:text-gray-400 text-sm">
          Device ID: {{ authStore.deviceId.slice(0, 8) }}...
        </p>
        <div class="mt-4">
          <span class="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-primary-100 text-primary-800 dark:bg-primary-900 dark:text-primary-200 capitalize">
            {{ authStore.subscriptionPlan }} Plan
          </span>
        </div>
      </div>

      <!-- Usage Statistics -->
      <div class="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm">
        <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Usage Statistics
        </h3>
        <div class="grid grid-cols-2 gap-4">
          <div class="text-center">
            <div class="text-2xl font-bold text-primary-600 dark:text-primary-400">
              {{ databaseStore.stats.totalDatabases }}
            </div>
            <div class="text-sm text-gray-500 dark:text-gray-400">Databases Created</div>
          </div>
          <div class="text-center">
            <div class="text-2xl font-bold text-green-600 dark:text-green-400">
              {{ databaseStore.stats.totalRecords }}
            </div>
            <div class="text-sm text-gray-500 dark:text-gray-400">Records Added</div>
          </div>
          <div class="text-center">
            <div class="text-2xl font-bold text-blue-600 dark:text-blue-400">
              {{ databaseStore.stats.totalTables }}
            </div>
            <div class="text-sm text-gray-500 dark:text-gray-400">Tables Created</div>
          </div>
          <div class="text-center">
            <div class="text-2xl font-bold text-purple-600 dark:text-purple-400">
              {{ formatBytes(databaseStore.stats.storageUsed) }}
            </div>
            <div class="text-sm text-gray-500 dark:text-gray-400">Storage Used</div>
          </div>
        </div>
      </div>

      <!-- Account Actions -->
      <div class="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm">
        <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Account Actions
        </h3>
        <div class="space-y-3">
          <button
            @click="showPurchaseModal = true"
            class="w-full flex items-center justify-between p-3 bg-primary-50 dark:bg-primary-900/20 rounded-lg hover:bg-primary-100 dark:hover:bg-primary-900/30 transition-colors"
          >
            <div class="flex items-center space-x-3">
              <StarIcon class="w-5 h-5 text-primary-600 dark:text-primary-400" />
              <div class="text-left">
                <div class="font-medium text-primary-600 dark:text-primary-400">Upgrade Plan</div>
                <div class="text-sm text-primary-500 dark:text-primary-400">Get more features and storage</div>
              </div>
            </div>
            <ChevronRightIcon class="w-5 h-5 text-primary-400" />
          </button>

          <button
            @click="exportProfile"
            class="w-full flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
          >
            <div class="flex items-center space-x-3">
              <ArrowDownTrayIcon class="w-5 h-5 text-gray-400" />
              <div class="text-left">
                <div class="font-medium text-gray-900 dark:text-white">Export Profile Data</div>
                <div class="text-sm text-gray-500 dark:text-gray-400">Download your data</div>
              </div>
            </div>
            <ChevronRightIcon class="w-5 h-5 text-gray-400" />
          </button>

          <button
            @click="shareApp"
            class="w-full flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
          >
            <div class="flex items-center space-x-3">
              <ShareIcon class="w-5 h-5 text-gray-400" />
              <div class="text-left">
                <div class="font-medium text-gray-900 dark:text-white">Share App</div>
                <div class="text-sm text-gray-500 dark:text-gray-400">Tell others about this app</div>
              </div>
            </div>
            <ChevronRightIcon class="w-5 h-5 text-gray-400" />
          </button>
        </div>
      </div>

      <!-- Achievements -->
      <div class="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm">
        <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Achievements
        </h3>
        <div class="grid grid-cols-2 gap-3">
          <div
            v-for="achievement in achievements"
            :key="achievement.id"
            class="flex flex-col items-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg"
            :class="{ 'opacity-50': !achievement.unlocked }"
          >
            <div class="text-2xl mb-2">{{ achievement.icon }}</div>
            <div class="text-sm font-medium text-gray-900 dark:text-white text-center">
              {{ achievement.name }}
            </div>
            <div class="text-xs text-gray-500 dark:text-gray-400 text-center">
              {{ achievement.description }}
            </div>
          </div>
        </div>
      </div>

      <!-- Danger Zone -->
      <div class="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm">
        <h3 class="text-lg font-semibold text-red-600 dark:text-red-400 mb-4">
          Danger Zone
        </h3>
        <div class="space-y-3">
          <button
            @click="resetAllData"
            class="w-full flex items-center justify-center p-3 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors"
          >
            <TrashIcon class="w-5 h-5 mr-2" />
            Reset All Data
          </button>
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
import { ref, computed } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { useDatabaseStore } from '@/stores/database'
import { useToast } from 'vue-toastification'
import { deleteDatabase } from '@/database/connection'
import {
  UserIcon,
  StarIcon,
  ArrowDownTrayIcon,
  ShareIcon,
  ChevronRightIcon,
  TrashIcon
} from '@heroicons/vue/24/outline'
import MobileHeader from '@/components/Navigation/MobileHeader.vue'
import PurchaseModal from '@/components/Purchase/PurchaseModal.vue'

const authStore = useAuthStore()
const databaseStore = useDatabaseStore()
const toast = useToast()

const showPurchaseModal = ref(false)

const achievements = computed(() => [
  {
    id: 'first_database',
    name: 'First Steps',
    description: 'Created your first database',
    icon: '🎯',
    unlocked: databaseStore.stats.totalDatabases > 0
  },
  {
    id: 'data_collector',
    name: 'Data Collector',
    description: 'Added 100 records',
    icon: '📊',
    unlocked: databaseStore.stats.totalRecords >= 100
  },
  {
    id: 'organizer',
    name: 'Organizer',
    description: 'Created 10 tables',
    icon: '🗂️',
    unlocked: databaseStore.stats.totalTables >= 10
  },
  {
    id: 'power_user',
    name: 'Power User',
    description: 'Created 5 databases',
    icon: '⚡',
    unlocked: databaseStore.stats.totalDatabases >= 5
  }
])

const formatBytes = (bytes: number) => {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i]
}

const exportProfile = async () => {
  try {
    const profileData = {
      deviceId: authStore.deviceId,
      subscriptionPlan: authStore.subscriptionPlan,
      stats: databaseStore.stats,
      achievements: achievements.value.filter(a => a.unlocked),
      exportedAt: new Date().toISOString()
    }
    
    const blob = new Blob([JSON.stringify(profileData, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `profile_data_${new Date().toISOString().split('T')[0]}.json`
    a.click()
    URL.revokeObjectURL(url)
    
    toast.success('Profile data exported')
  } catch (error) {
    toast.error('Failed to export profile data')
  }
}

const shareApp = async () => {
  const shareData = {
    title: 'Database Manager',
    text: 'Check out this amazing database management app!',
    url: window.location.origin
  }
  
  if (navigator.share) {
    try {
      await navigator.share(shareData)
    } catch (error) {
      // User cancelled sharing
    }
  } else {
    // Fallback to clipboard
    try {
      await navigator.clipboard.writeText(`${shareData.text} ${shareData.url}`)
      toast.success('Share link copied to clipboard')
    } catch (error) {
      toast.error('Failed to share')
    }
  }
}

const resetAllData = async () => {
  if (confirm('Are you sure you want to reset all data? This will delete everything and cannot be undone.')) {
    if (confirm('This is your final warning. All databases, tables, and records will be permanently deleted. Continue?')) {
      try {
        await deleteDatabase()
        localStorage.clear()
        toast.success('All data has been reset')
        window.location.reload()
      } catch (error) {
        console.error('Failed to reset data:', error)
        toast.error('Failed to reset data')
      }
    }
  }
}

const handlePurchaseSuccess = (productId: string) => {
  showPurchaseModal.value = false
  authStore.updateSubscription('premium')
}
</script>