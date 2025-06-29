import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { BiometricAuthService } from '../services/BiometricAuthService'
import { PinAuthService } from '../services/PinAuthService'

export const useAuthStore = defineStore('auth', () => {
  const isAuthenticated = ref(false)
  const isLoading = ref(false)
  const authMethod = ref<'biometric' | 'pin' | null>(null)
  const deviceId = ref('')
  const subscriptionPlan = ref('free')

  const hasAuthSetup = computed(() => {
    return PinAuthService.hasPinSet() || authMethod.value === 'biometric'
  })

  const initializeAuth = async () => {
    isLoading.value = true
    try {
      // Generate or get device ID
      let storedDeviceId = localStorage.getItem('deviceId')
      if (!storedDeviceId) {
        storedDeviceId = 'device-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9)
        localStorage.setItem('deviceId', storedDeviceId)
      }
      deviceId.value = storedDeviceId

      // Check if biometric is available and preferred
      const biometricAvailable = await BiometricAuthService.isAvailable()
      const hasPinSet = PinAuthService.hasPinSet()
      
      if (biometricAvailable && localStorage.getItem('preferBiometric') === 'true') {
        authMethod.value = 'biometric'
      } else if (hasPinSet) {
        authMethod.value = 'pin'
      }

      // Load subscription plan
      const savedPlan = localStorage.getItem('subscriptionPlan')
      if (savedPlan) {
        subscriptionPlan.value = savedPlan
      }
    } catch (error) {
      console.error('Failed to initialize auth:', error)
    } finally {
      isLoading.value = false
    }
  }

  const setupAuth = async (method: 'biometric' | 'pin') => {
    authMethod.value = method
    if (method === 'biometric') {
      localStorage.setItem('preferBiometric', 'true')
    }
    isAuthenticated.value = true
  }

  const authenticate = async (): Promise<boolean> => {
    isLoading.value = true
    try {
      if (authMethod.value === 'biometric') {
        const result = await BiometricAuthService.authenticate()
        if (result.success) {
          isAuthenticated.value = true
          return true
        }
      }
      return false
    } catch (error) {
      console.error('Authentication failed:', error)
      return false
    } finally {
      isLoading.value = false
    }
  }

  const logout = () => {
    isAuthenticated.value = false
  }

  const resetAuth = () => {
    PinAuthService.removePin()
    localStorage.removeItem('preferBiometric')
    authMethod.value = null
    isAuthenticated.value = false
  }

  const updateSubscription = (plan: string) => {
    subscriptionPlan.value = plan
    localStorage.setItem('subscriptionPlan', plan)
  }

  return {
    isAuthenticated,
    isLoading,
    authMethod,
    deviceId,
    subscriptionPlan,
    hasAuthSetup,
    initializeAuth,
    setupAuth,
    authenticate,
    logout,
    resetAuth,
    updateSubscription
  }
})