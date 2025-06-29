<template>
  <div class="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-4">
    <div class="max-w-md w-full bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6">
      <div class="text-center mb-8">
        <div class="w-20 h-20 bg-primary-100 dark:bg-primary-900 rounded-full flex items-center justify-center mx-auto mb-4">
          <ShieldCheckIcon class="w-10 h-10 text-primary-600 dark:text-primary-400" />
        </div>
        <h1 class="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          Secure Your Data
        </h1>
        <p class="text-gray-600 dark:text-gray-400">
          Set up authentication to protect your databases
        </p>
      </div>

      <div class="space-y-6">
        <!-- Biometric Option -->
        <div
          v-if="biometricAvailable"
          class="border-2 rounded-xl p-4 cursor-pointer transition-all duration-200 hover:border-primary-500 hover:bg-primary-50 dark:hover:bg-primary-900/20"
          :class="{ 
            'border-primary-500 bg-primary-50 dark:bg-primary-900/20': selectedMethod === 'biometric',
            'border-gray-200 dark:border-gray-700': selectedMethod !== 'biometric'
          }"
          @click="selectedMethod = 'biometric'"
        >
          <div class="flex items-center space-x-3">
            <div class="w-12 h-12 bg-primary-100 dark:bg-primary-900 rounded-lg flex items-center justify-center">
              <FingerPrintIcon class="w-6 h-6 text-primary-600 dark:text-primary-400" />
            </div>
            <div class="flex-1">
              <h3 class="font-semibold text-gray-900 dark:text-white">Biometric Authentication</h3>
              <p class="text-sm text-gray-500 dark:text-gray-400">Use fingerprint or face recognition</p>
            </div>
            <div class="w-5 h-5 rounded-full border-2 flex items-center justify-center"
                 :class="selectedMethod === 'biometric' ? 'border-primary-500' : 'border-gray-300 dark:border-gray-600'">
              <div
                v-if="selectedMethod === 'biometric'"
                class="w-3 h-3 bg-primary-600 rounded-full"
              ></div>
            </div>
          </div>
        </div>

        <!-- PIN Option -->
        <div
          class="border-2 rounded-xl p-4 cursor-pointer transition-all duration-200 hover:border-primary-500 hover:bg-primary-50 dark:hover:bg-primary-900/20"
          :class="{ 
            'border-primary-500 bg-primary-50 dark:bg-primary-900/20': selectedMethod === 'pin',
            'border-gray-200 dark:border-gray-700': selectedMethod !== 'pin'
          }"
          @click="selectedMethod = 'pin'"
        >
          <div class="flex items-center space-x-3">
            <div class="w-12 h-12 bg-primary-100 dark:bg-primary-900 rounded-lg flex items-center justify-center">
              <LockClosedIcon class="w-6 h-6 text-primary-600 dark:text-primary-400" />
            </div>
            <div class="flex-1">
              <h3 class="font-semibold text-gray-900 dark:text-white">PIN Code</h3>
              <p class="text-sm text-gray-500 dark:text-gray-400">Use a 4-8 digit PIN</p>
            </div>
            <div class="w-5 h-5 rounded-full border-2 flex items-center justify-center"
                 :class="selectedMethod === 'pin' ? 'border-primary-500' : 'border-gray-300 dark:border-gray-600'">
              <div
                v-if="selectedMethod === 'pin'"
                class="w-3 h-3 bg-primary-600 rounded-full"
              ></div>
            </div>
          </div>
        </div>

        <!-- PIN Input -->
        <div v-if="selectedMethod === 'pin'" class="space-y-4 animate-fade-in">
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Enter PIN (4-8 digits)
            </label>
            <input
              v-model="pin"
              type="password"
              inputmode="numeric"
              pattern="[0-9]*"
              maxlength="8"
              class="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white text-center text-lg tracking-widest"
              placeholder="••••"
              @input="validatePin"
            />
            <div v-if="pinError" class="text-red-600 dark:text-red-400 text-sm mt-1">
              {{ pinError }}
            </div>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Confirm PIN
            </label>
            <input
              v-model="confirmPin"
              type="password"
              inputmode="numeric"
              pattern="[0-9]*"
              maxlength="8"
              class="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white text-center text-lg tracking-widest"
              placeholder="••••"
              @input="validatePin"
            />
          </div>
          
          <!-- PIN Strength Indicator -->
          <div class="space-y-2">
            <div class="flex justify-between text-sm">
              <span class="text-gray-600 dark:text-gray-400">PIN Strength</span>
              <span :class="pinStrengthColor">{{ pinStrengthText }}</span>
            </div>
            <div class="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
              <div 
                class="h-2 rounded-full transition-all duration-300"
                :class="pinStrengthColor.replace('text-', 'bg-')"
                :style="{ width: `${pinStrengthPercentage}%` }"
              ></div>
            </div>
          </div>
        </div>

        <!-- Error Message -->
        <div v-if="error" class="text-red-600 dark:text-red-400 text-sm text-center bg-red-50 dark:bg-red-900/20 p-3 rounded-lg">
          {{ error }}
        </div>

        <!-- Setup Button -->
        <button
          @click="setupAuth"
          :disabled="!canSetup || isLoading"
          class="w-full bg-primary-600 hover:bg-primary-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-semibold py-3 px-4 rounded-lg transition-colors duration-200"
        >
          <div v-if="isLoading" class="flex items-center justify-center">
            <div class="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
            Setting up...
          </div>
          <span v-else>Set Up Authentication</span>
        </button>

        <!-- Skip Option -->
        <button
          @click="skipSetup"
          class="w-full text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 font-medium py-2 transition-colors duration-200"
        >
          Skip for now
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useToast } from 'vue-toastification'
import { useAuthStore } from '@/stores/auth'
import { BiometricAuthService } from '@/services/BiometricAuthService'
import { PinAuthService } from '@/services/PinAuthService'
import {
  FingerPrintIcon,
  LockClosedIcon,
  ShieldCheckIcon
} from '@heroicons/vue/24/outline'

const router = useRouter()
const toast = useToast()
const authStore = useAuthStore()

const selectedMethod = ref<'biometric' | 'pin'>('pin')
const biometricAvailable = ref(false)
const pin = ref('')
const confirmPin = ref('')
const pinError = ref('')
const error = ref('')
const isLoading = ref(false)

const canSetup = computed(() => {
  if (selectedMethod.value === 'biometric') {
    return biometricAvailable.value
  }
  return pin.value.length >= 4 && pin.value === confirmPin.value && !pinError.value
})

const pinStrengthPercentage = computed(() => {
  if (!pin.value) return 0
  
  let strength = 0
  if (pin.value.length >= 4) strength += 25
  if (pin.value.length >= 6) strength += 25
  if (pin.value.length >= 8) strength += 25
  if (hasVariedDigits(pin.value)) strength += 25
  
  return strength
})

const pinStrengthText = computed(() => {
  const percentage = pinStrengthPercentage.value
  if (percentage <= 25) return 'Weak'
  if (percentage <= 50) return 'Fair'
  if (percentage <= 75) return 'Good'
  return 'Strong'
})

const pinStrengthColor = computed(() => {
  const percentage = pinStrengthPercentage.value
  if (percentage <= 25) return 'text-red-500'
  if (percentage <= 50) return 'text-yellow-500'
  if (percentage <= 75) return 'text-blue-500'
  return 'text-green-500'
})

const validatePin = () => {
  pinError.value = ''
  
  if (pin.value && !/^\d+$/.test(pin.value)) {
    pinError.value = 'PIN must contain only numbers'
    return
  }
  
  if (pin.value && pin.value.length < 4) {
    pinError.value = 'PIN must be at least 4 digits'
    return
  }
  
  if (pin.value && pin.value.length > 8) {
    pinError.value = 'PIN must be no more than 8 digits'
    return
  }
  
  if (confirmPin.value && pin.value !== confirmPin.value) {
    pinError.value = 'PINs do not match'
    return
  }
}

const hasVariedDigits = (pin: string): boolean => {
  const uniqueDigits = new Set(pin.split(''))
  return uniqueDigits.size >= Math.min(3, pin.length)
}

const setupAuth = async () => {
  error.value = ''
  isLoading.value = true

  try {
    if (selectedMethod.value === 'biometric') {
      const result = await BiometricAuthService.enrollBiometric()
      if (result.success) {
        authStore.setupAuth('biometric')
        authStore.isAuthenticated = true
        toast.success('Biometric authentication set up successfully!')
        await router.push('/')
      } else {
        error.value = result.error || 'Failed to set up biometric authentication'
      }
    } else {
      if (pin.value !== confirmPin.value) {
        error.value = 'PINs do not match'
        return
      }
      
      const success = await PinAuthService.setPin(pin.value)
      if (success) {
        authStore.setupAuth('pin')
        authStore.isAuthenticated = true
        toast.success('PIN authentication set up successfully!')
        await router.push('/')
      } else {
        error.value = 'Failed to set up PIN'
      }
    }
  } catch (err) {
    error.value = 'An unexpected error occurred'
    console.error('Authentication setup error:', err)
  } finally {
    isLoading.value = false
  }
}

const skipSetup = async () => {
  authStore.isAuthenticated = true
  toast.info('You can set up authentication later in Settings')
  await router.push('/')
}

onMounted(async () => {
  try {
    biometricAvailable.value = await BiometricAuthService.isAvailable()
    if (biometricAvailable.value) {
      selectedMethod.value = 'biometric'
    }
  } catch (error) {
    console.error('Error checking biometric availability:', error)
  }
})
</script>