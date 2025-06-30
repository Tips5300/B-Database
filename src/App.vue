<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { RouterView } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useDatabaseStore } from '@/stores/database'
import { useSettingsStore } from '@/stores/settings'
import Toast from '@/components/UI/Toast.vue'
import AuthScreen from '@/components/Auth/AuthScreen.vue'
import BiometricSetup from '@/components/Auth/BiometricSetup.vue'
import LoadingSpinner from '@/components/UI/LoadingSpinner.vue'

const authStore = useAuthStore()
const databaseStore = useDatabaseStore()
const settingsStore = useSettingsStore()

const showAuthSetup = ref(false)
const isInitializing = ref(true)

const handleAuthSuccess = () => {
  authStore.isAuthenticated = true
}

const handleAuthSetupSuccess = (method: 'biometric' | 'pin') => {
  authStore.setupAuth(method)
  showAuthSetup.value = false
}

const handleAuthSetupSkip = () => {
  showAuthSetup.value = false
  authStore.isAuthenticated = true
}

const handleAuthReset = () => {
  authStore.resetAuth()
  showAuthSetup.value = true
}

onMounted(async () => {
  try {
    // Initialize settings first
    settingsStore.loadSettings()
    
    // Initialize auth
    await authStore.initializeAuth()
    
    // Load databases
    await databaseStore.loadDatabases()
    
    // Check if auth setup is needed
    if (!authStore.hasAuthSetup) {
      showAuthSetup.value = true
    } else {
      // If auth is set up but user is not authenticated, they need to authenticate
      authStore.isAuthenticated = false
    }
  } catch (error) {
    console.error('Failed to initialize app:', error)
  } finally {
    isInitializing.value = false
  }
})
</script>

<template>
  <!-- Loading Screen -->
  <LoadingSpinner v-if="isInitializing" />
  
  <!-- Auth Setup Screen -->
  <BiometricSetup 
    v-else-if="showAuthSetup"
    @success="handleAuthSetupSuccess"
    @skip="handleAuthSetupSkip"
  />
  
  <!-- Auth Screen -->
  <AuthScreen 
    v-else-if="!authStore.isAuthenticated"
    @success="handleAuthSuccess"
    @reset="handleAuthReset"
  />
  
  <!-- Main App -->
  <div v-else>
    <RouterView />
    <Toast />
  </div>
</template>

<style scoped></style>