<template>
  <div id="app" :class="{ 'dark': isDarkMode }">
    <LoadingSpinner v-if="isInitializing" />
    
    <!-- Auth Setup -->
    <BiometricSetup
      v-else-if="!authStore.hasAuthSetup"
      @success="handleAuthSetup"
      @skip="handleAuthSkip"
    />
    
    <!-- Auth Screen -->
    <AuthScreen
      v-else-if="!authStore.isAuthenticated"
      @success="handleAuthSuccess"
      @reset="handleAuthReset"
    />
    
    <!-- Main App -->
    <div v-else class="min-h-screen bg-gray-50 dark:bg-gray-900 pb-16">
      <router-view />
      <BottomNavigation />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { useSettingsStore } from '@/stores/settings'
import { useDatabaseStore } from '@/stores/database'
import { initializeDatabase } from '@/database/connection'
import LoadingSpinner from '@/components/UI/LoadingSpinner.vue'
import BiometricSetup from '@/components/Auth/BiometricSetup.vue'
import AuthScreen from '@/components/Auth/AuthScreen.vue'
import BottomNavigation from '@/components/Navigation/BottomNavigation.vue'

const authStore = useAuthStore()
const settingsStore = useSettingsStore()
const databaseStore = useDatabaseStore()

const isInitializing = ref(true)

const isDarkMode = computed(() => settingsStore.isDarkMode)

const handleAuthSetup = (method: 'biometric' | 'pin') => {
  authStore.setupAuth(method)
  loadAppData()
}

const handleAuthSkip = () => {
  authStore.isAuthenticated = true
  loadAppData()
}

const handleAuthSuccess = () => {
  authStore.isAuthenticated = true
  loadAppData()
}

const handleAuthReset = () => {
  authStore.resetAuth()
}

const loadAppData = async () => {
  try {
    await databaseStore.loadDatabases()
  } catch (error) {
    console.error('Failed to load app data:', error)
  }
}

onMounted(async () => {
  try {
    // Initialize database
    await initializeDatabase()
    
    // Load settings
    settingsStore.loadSettings()
    
    // Initialize auth
    await authStore.initializeAuth()
    
    // If already authenticated, load data
    if (authStore.isAuthenticated) {
      await loadAppData()
    }
  } catch (error) {
    console.error('Failed to initialize app:', error)
  } finally {
    isInitializing.value = false
  }
})
</script>