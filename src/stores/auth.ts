import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { BiometricAuthService } from '../services/BiometricAuthService'
import { PinAuthService } from '../services/PinAuthService'
import { InAppPurchaseService } from '../services/InAppPurchaseService'
import { SubscriptionPlan } from '../types/auth'

export const useAuthStore = defineStore('auth', () => {
  const isAuthenticated = ref(false)
  const isLoading = ref(false)
  const authMethod = ref<'biometric' | 'pin' | null>(null)
  const deviceId = ref('')
  const subscriptionPlan = ref<SubscriptionPlan>(SubscriptionPlan.FREE)
  const subscriptionExpiry = ref<Date | null>(null)
  const purchasedProducts = ref<string[]>([])

  const hasAuthSetup = computed(() => {
    return PinAuthService.hasPinSet() || authMethod.value === 'biometric'
  })

  const isSubscriptionActive = computed(() => {
    if (subscriptionPlan.value === SubscriptionPlan.FREE) return true
    if (!subscriptionExpiry.value) return false
    return new Date() < subscriptionExpiry.value
  })

  const canAccessFeature = computed(() => (feature: string) => {
    const planFeatures = {
      [SubscriptionPlan.FREE]: ['basic_export', 'basic_fields', 'local_storage'],
      [SubscriptionPlan.PREMIUM]: ['advanced_export', 'all_fields', 'cloud_backup', 'encryption', 'advanced_views'],
      [SubscriptionPlan.PROFESSIONAL]: ['unlimited_databases', 'team_features', 'api_access', 'automation'],
      [SubscriptionPlan.ENTERPRISE]: ['custom_integrations', 'sso', 'dedicated_support', 'white_label']
    }

    if (!isSubscriptionActive.value && subscriptionPlan.value !== SubscriptionPlan.FREE) {
      return planFeatures[SubscriptionPlan.FREE].includes(feature)
    }

    const currentPlanFeatures = planFeatures[subscriptionPlan.value] || []
    const lowerPlanFeatures = Object.values(planFeatures)
      .slice(0, Object.keys(planFeatures).indexOf(subscriptionPlan.value))
      .flat()

    return [...currentPlanFeatures, ...lowerPlanFeatures].includes(feature)
  })

  const getUsageLimits = computed(() => {
    const limits = {
      [SubscriptionPlan.FREE]: {
        databases: 3,
        tables: 10,
        records: 1000,
        storage: 100 * 1024 * 1024, // 100MB
        exports: 5
      },
      [SubscriptionPlan.PREMIUM]: {
        databases: 25,
        tables: 100,
        records: 50000,
        storage: 5 * 1024 * 1024 * 1024, // 5GB
        exports: -1 // unlimited
      },
      [SubscriptionPlan.PROFESSIONAL]: {
        databases: -1, // unlimited
        tables: -1,
        records: 500000,
        storage: 50 * 1024 * 1024 * 1024, // 50GB
        exports: -1
      },
      [SubscriptionPlan.ENTERPRISE]: {
        databases: -1,
        tables: -1,
        records: -1,
        storage: 500 * 1024 * 1024 * 1024, // 500GB
        exports: -1
      }
    }

    return limits[subscriptionPlan.value] || limits[SubscriptionPlan.FREE]
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

      // Load subscription data
      loadSubscriptionData()

      // Initialize in-app purchases
      await InAppPurchaseService.initialize()

      // Restore purchases on app start
      await restorePurchases()
    } catch (error) {
      console.error('Failed to initialize auth:', error)
    } finally {
      isLoading.value = false
    }
  }

  const loadSubscriptionData = () => {
    const savedPlan = localStorage.getItem('subscriptionPlan')
    if (savedPlan && Object.values(SubscriptionPlan).includes(savedPlan as SubscriptionPlan)) {
      subscriptionPlan.value = savedPlan as SubscriptionPlan
    }

    const savedExpiry = localStorage.getItem('subscriptionExpiry')
    if (savedExpiry) {
      subscriptionExpiry.value = new Date(savedExpiry)
    }

    const savedProducts = localStorage.getItem('purchasedProducts')
    if (savedProducts) {
      try {
        purchasedProducts.value = JSON.parse(savedProducts)
      } catch (error) {
        console.error('Failed to parse purchased products:', error)
      }
    }
  }

  const saveSubscriptionData = () => {
    localStorage.setItem('subscriptionPlan', subscriptionPlan.value)
    if (subscriptionExpiry.value) {
      localStorage.setItem('subscriptionExpiry', subscriptionExpiry.value.toISOString())
    }
    localStorage.setItem('purchasedProducts', JSON.stringify(purchasedProducts.value))
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

  const updateSubscription = (plan: SubscriptionPlan, productId?: string) => {
    subscriptionPlan.value = plan
    
    // Set expiry date based on plan
    if (plan !== SubscriptionPlan.FREE) {
      const now = new Date()
      if (productId?.includes('yearly')) {
        subscriptionExpiry.value = new Date(now.getTime() + 365 * 24 * 60 * 60 * 1000) // 1 year
      } else {
        subscriptionExpiry.value = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000) // 1 month
      }
    } else {
      subscriptionExpiry.value = null
    }

    if (productId && !purchasedProducts.value.includes(productId)) {
      purchasedProducts.value.push(productId)
    }

    saveSubscriptionData()
  }

  const restorePurchases = async () => {
    try {
      const restoredPurchases = await InAppPurchaseService.restorePurchases()
      
      for (const purchase of restoredPurchases) {
        if (purchase.success && purchase.productId) {
          // Map product ID to subscription plan
          const planMapping: { [key: string]: SubscriptionPlan } = {
            'premium_monthly': SubscriptionPlan.PREMIUM,
            'premium_yearly': SubscriptionPlan.PREMIUM,
            'professional_monthly': SubscriptionPlan.PROFESSIONAL,
            'enterprise_monthly': SubscriptionPlan.ENTERPRISE
          }

          const plan = planMapping[purchase.productId]
          if (plan) {
            updateSubscription(plan, purchase.productId)
          }

          if (!purchasedProducts.value.includes(purchase.productId)) {
            purchasedProducts.value.push(purchase.productId)
          }
        }
      }

      saveSubscriptionData()
      return restoredPurchases.filter(p => p.success).length
    } catch (error) {
      console.error('Failed to restore purchases:', error)
      return 0
    }
  }

  const processPurchase = async (productId: string): Promise<boolean> => {
    try {
      const result = await InAppPurchaseService.purchaseProduct(productId)
      
      if (result.success) {
        // Map product ID to subscription plan
        const planMapping: { [key: string]: SubscriptionPlan } = {
          'premium_monthly': SubscriptionPlan.PREMIUM,
          'premium_yearly': SubscriptionPlan.PREMIUM,
          'professional_monthly': SubscriptionPlan.PROFESSIONAL,
          'enterprise_monthly': SubscriptionPlan.ENTERPRISE
        }

        const plan = planMapping[productId]
        if (plan) {
          updateSubscription(plan, productId)
        }

        return true
      }

      return false
    } catch (error) {
      console.error('Failed to process purchase:', error)
      return false
    }
  }

  const checkUsageLimit = (type: 'databases' | 'tables' | 'records' | 'storage' | 'exports', current: number): boolean => {
    const limits = getUsageLimits.value
    const limit = limits[type]
    
    if (limit === -1) return true // unlimited
    return current < limit
  }

  return {
    isAuthenticated,
    isLoading,
    authMethod,
    deviceId,
    subscriptionPlan,
    subscriptionExpiry,
    purchasedProducts,
    hasAuthSetup,
    isSubscriptionActive,
    canAccessFeature,
    getUsageLimits,
    initializeAuth,
    setupAuth,
    authenticate,
    logout,
    resetAuth,
    updateSubscription,
    restorePurchases,
    processPurchase,
    checkUsageLimit
  }
})