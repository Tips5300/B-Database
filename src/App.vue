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
import { useRouter } from 'vue-router'
import { useToast } from 'vue-toastification'
import { useAuthStore } from '@/stores/auth'
import { useSettingsStore } from '@/stores/settings'
import { useDatabaseStore } from '@/stores/database'
import { initializeDatabase } from '@/database/connection'
import LoadingSpinner from '@/components/UI/LoadingSpinner.vue'
import BiometricSetup from '@/components/Auth/BiometricSetup.vue'
import AuthScreen from '@/components/Auth/AuthScreen.vue'
import BottomNavigation from '@/components/Navigation/BottomNavigation.vue'

const router = useRouter()
const toast = useToast()
const authStore = useAuthStore()
const settingsStore = useSettingsStore()
const databaseStore = useDatabaseStore()

const isInitializing = ref(true)

const isDarkMode = computed(() => settingsStore.isDarkMode)

const handleAuthSetup = async (method: 'biometric' | 'pin') => {
  try {
    authStore.setupAuth(method)
    await loadAppData()
    
    // Redirect to dashboard after successful setup
    toast.success(`🎉 Welcome! ${method === 'biometric' ? 'Biometric' : 'PIN'} authentication is now active`)
    await router.push('/')
  } catch (error) {
    console.error('Failed to complete auth setup:', error)
    toast.error('Failed to complete setup. Please try again.')
  }
}

const handleAuthSkip = async () => {
  try {
    authStore.isAuthenticated = true
    await loadAppData()
    
    // Redirect to dashboard after skipping auth
    toast.info('🚀 Welcome! You can set up authentication later in Settings')
    await router.push('/')
  } catch (error) {
    console.error('Failed to skip auth setup:', error)
    toast.error('Failed to initialize app. Please try again.')
  }
}

const handleAuthSuccess = async () => {
  try {
    authStore.isAuthenticated = true
    await loadAppData()
    
    // Redirect to dashboard after successful authentication
    toast.success('🎉 Welcome back!')
    await router.push('/')
  } catch (error) {
    console.error('Failed to complete authentication:', error)
    toast.error('Failed to load your data. Please try again.')
  }
}

const handleAuthReset = () => {
  authStore.resetAuth()
  toast.warning('🔄 Authentication has been reset. Please set up authentication again.')
}

const loadAppData = async () => {
  try {
    await databaseStore.loadDatabases()
  } catch (error) {
    console.error('Failed to load app data:', error)
    toast.error('Failed to load your databases')
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
    
    // If already authenticated, load data and redirect to dashboard
    if (authStore.isAuthenticated) {
      await loadAppData()
      
      // Only redirect if we're not already on a specific route
      if (router.currentRoute.value.path === '/') {
        await router.push('/')
      }
    }
  } catch (error) {
    console.error('Failed to initialize app:', error)
    toast.error('Failed to initialize the app. Please refresh and try again.')
  } finally {
    isInitializing.value = false
  }
})
</script>