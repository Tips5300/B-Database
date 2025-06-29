import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { BiometricAuthService } from '../services/BiometricAuthService'
import { PinAuthService } from '../services/PinAuthService'

export const useAuthStore = defineStore('auth', () => {
  const isAuthenticated = ref(false)
  const isInitialized = ref(false)
  const isLoading = ref(false)
  const authMethod = ref<'biometric' | 'pin' | null>(null)
  const deviceId = ref('')
  const subscriptionPlan = ref('free')
  const user = ref({
    name: 'Database User',
    email: 'user@example.com'
  })
  const userPlan = computed(() => subscriptionPlan.value.charAt(0).toUpperCase() + subscriptionPlan.value.slice(1))

  const hasAuthSetup = computed(() => {
    return PinAuthService.hasPinSet() || BiometricAuthService.hasCredential()
  })

  const initializeAuth = async () => {
    if (isInitialized.value) return
    
    isLoading.value = true
    try {
      // Generate or get device ID
      let storedDeviceId = localStorage.getItem('deviceId')
      if (!storedDeviceId) {
        storedDeviceId = 'device-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9)
        localStorage.setItem('deviceId', storedDeviceId)
      }
      deviceId.value = storedDeviceId

      // Check authentication methods
      const biometricAvailable = await BiometricAuthService.isAvailable()
      const hasBiometricCredential = BiometricAuthService.hasCredential()
      const hasPinSet = PinAuthService.hasPinSet()
      
      if (biometricAvailable && hasBiometricCredential) {
        authMethod.value = 'biometric'
      } else if (hasPinSet) {
        authMethod.value = 'pin'
      }

      // Load subscription plan
      const savedPlan = localStorage.getItem('subscriptionPlan')
      if (savedPlan) {
        subscriptionPlan.value = savedPlan
      }

      // Load user data
      const savedUser = localStorage.getItem('user_profile')
      if (savedUser) {
        try {
          user.value = JSON.parse(savedUser)
        } catch (error) {
          console.error('Failed to parse user data:', error)
        }
      }

      // Check if user was previously authenticated (for app restart scenarios)
      const wasAuthenticated = localStorage.getItem('was_authenticated')
      if (wasAuthenticated === 'true' && hasAuthSetup.value) {
        // User was authenticated before, but we still need them to re-authenticate
        isAuthenticated.value = false
      }
    } catch (error) {
      console.error('Failed to initialize auth:', error)
    } finally {
      isLoading.value = false
      isInitialized.value = true
    }
  }

  const setupAuth = async (method: 'biometric' | 'pin') => {
    authMethod.value = method
    if (method === 'biometric') {
      localStorage.setItem('preferBiometric', 'true')
    }
    // Don't automatically authenticate after setup
  }

  const authenticate = async (): Promise<boolean> => {
    isLoading.value = true
    try {
      if (authMethod.value === 'biometric') {
        const result = await BiometricAuthService.authenticate()
        if (result.success) {
          isAuthenticated.value = true
          localStorage.setItem('was_authenticated', 'true')
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
    localStorage.removeItem('was_authenticated')
  }

  const resetAuth = () => {
    PinAuthService.removePin()
    BiometricAuthService.removeCredential()
    localStorage.removeItem('preferBiometric')
    localStorage.removeItem('was_authenticated')
    authMethod.value = null
    isAuthenticated.value = false
  }

  const updateSubscription = (plan: string) => {
    subscriptionPlan.value = plan
    localStorage.setItem('subscriptionPlan', plan)
  }

  const updateProfile = (profileData: any) => {
    user.value = { ...user.value, ...profileData }
    localStorage.setItem('user_profile', JSON.stringify(user.value))
  }

  // Mock login for demo purposes
  const login = async (credentials: any): Promise<boolean> => {
    isLoading.value = true
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      if (credentials.email === 'demo@example.com' && credentials.password === 'demo') {
        isAuthenticated.value = true
        localStorage.setItem('was_authenticated', 'true')
        return true
      }
      return false
    } catch (error) {
      return false
    } finally {
      isLoading.value = false
    }
  }

  return {
    isAuthenticated,
    isInitialized,
    isLoading,
    authMethod,
    deviceId,
    subscriptionPlan,
    user,
    userPlan,
    hasAuthSetup,
    initializeAuth,
    setupAuth,
    authenticate,
    logout,
    resetAuth,
    updateSubscription,
    updateProfile,
    login
  }
})