<template>
  <div id="app" :class="{ 'dark': isDarkMode }">
    <LoadingSpinner v-if="isInitializing" />
    
    <!-- Main App -->
    <div v-else class="min-h-screen bg-gray-50 dark:bg-gray-900">
      <router-view />
      <BottomNavigation v-if="showBottomNav" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useToast } from 'vue-toastification'
import { useAuthStore } from '@/stores/auth'
import { useSettingsStore } from '@/stores/settings'
import { useDatabaseStore } from '@/stores/database'
import { initializeDatabase } from '@/database/connection'
import LoadingSpinner from '@/components/UI/LoadingSpinner.vue'
import BottomNavigation from '@/components/Navigation/BottomNavigation.vue'

const route = useRoute()
const toast = useToast()
const authStore = useAuthStore()
const settingsStore = useSettingsStore()
const databaseStore = useDatabaseStore()

const isInitializing = ref(true)

const isDarkMode = computed(() => settingsStore.isDarkMode)

const showBottomNav = computed(() => {
  const authRoutes = ['/auth', '/setup']
  return authStore.isAuthenticated && !authRoutes.includes(route.path)
})

onMounted(async () => {
  try {
    // Initialize database
    await initializeDatabase()
    
    // Load settings
    settingsStore.loadSettings()
    
    // Initialize auth (this will set isInitialized to true)
    await authStore.initializeAuth()
    
    // If already authenticated, load data
    if (authStore.isAuthenticated) {
      await databaseStore.loadDatabases()
    }
  } catch (error) {
    console.error('Failed to initialize app:', error)
    toast.error('Failed to initialize the app. Please refresh and try again.')
  } finally {
    isInitializing.value = false
  }
})
</script>