<template>
  <div class="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-4">
    <div class="max-w-md w-full bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8">
      <div class="text-center mb-8">
        <div class="w-20 h-20 bg-primary-100 dark:bg-primary-900 rounded-full flex items-center justify-center mx-auto mb-4">
          <component
            :is="authMethod === 'biometric' ? FingerPrintIcon : LockClosedIcon"
            class="w-10 h-10 text-primary-600 dark:text-primary-400"
          />
        </div>
        <h1 class="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          Welcome Back
        </h1>
        <p class="text-gray-600 dark:text-gray-400">
          {{ authMethod === 'biometric' ? 'Use your biometric to unlock' : 'Enter your PIN to continue' }}
        </p>
      </div>

      <div class="space-y-6">
        <!-- Biometric Auth -->
        <div v-if="authMethod === 'biometric'" class="text-center">
          <button
            @click="authenticateWithBiometric"
            :disabled="isLoading"
            class="w-24 h-24 bg-primary-100 dark:bg-primary-900 rounded-full flex items-center justify-center mx-auto mb-4 hover:bg-primary-200 dark:hover:bg-primary-800 transition-colors duration-200 disabled:opacity-50"
          >
            <FingerPrintIcon class="w-12 h-12 text-primary-600 dark:text-primary-400" />
          </button>
          <p class="text-sm text-gray-500 dark:text-gray-400">
            Touch the sensor to authenticate
          </p>
        </div>

        <!-- PIN Auth -->
        <div v-else class="space-y-4">
          <div class="relative">
            <input
              v-model="pin"
              type="password"
              inputmode="numeric"
              pattern="[0-9]*"
              maxlength="8"
              class="w-full px-4 py-4 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white text-center text-xl tracking-widest"
              placeholder="Enter PIN"
              @input="handlePinInput"
              :disabled="isLockedOut"
            />
          </div>
          
          <!-- PIN Dots -->
          <div class="flex justify-center space-x-3">
            <div
              v-for="i in 8"
              :key="i"
              class="w-3 h-3 rounded-full transition-colors duration-200"
              :class="i <= pin.length ? 'bg-primary-600' : 'bg-gray-300 dark:bg-gray-600'"
            ></div>
          </div>

          <!-- Attempts Warning -->
          <div v-if="remainingAttempts < 5 && remainingAttempts > 0" class="text-center">
            <p class="text-sm text-yellow-600 dark:text-yellow-400">
              {{ remainingAttempts }} attempt{{ remainingAttempts !== 1 ? 's' : '' }} remaining
            </p>
          </div>

          <!-- Lockout Message -->
          <div v-if="isLockedOut" class="text-center">
            <p class="text-sm text-red-600 dark:text-red-400">
              Too many failed attempts. Try again in {{ lockoutTimeRemaining }}
            </p>
          </div>
        </div>

        <!-- Error Message -->
        <div v-if="error" class="text-red-600 dark:text-red-400 text-sm text-center bg-red-50 dark:bg-red-900/20 p-3 rounded-lg">
          {{ error }}
        </div>

        <!-- Alternative Auth Method -->
        <div v-if="canSwitchMethod" class="text-center">
          <button
            @click="switchAuthMethod"
            class="text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 font-medium text-sm transition-colors duration-200"
          >
            {{ authMethod === 'biometric' ? 'Use PIN instead' : 'Use biometric instead' }}
          </button>
        </div>

        <!-- Forgot PIN -->
        <div v-if="authMethod === 'pin'" class="text-center">
          <button
            @click="resetAuth"
            class="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 font-medium text-sm transition-colors duration-200"
          >
            Forgot PIN? Reset authentication
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useToast } from 'vue-toastification'
import { BiometricAuthService } from '../../services/BiometricAuthService'
import { PinAuthService } from '../../services/PinAuthService'
import {
  FingerPrintIcon,
  LockClosedIcon
} from '@heroicons/vue/24/outline'

const emit = defineEmits<{
  success: []
  reset: []
}>()

const toast = useToast()

const authMethod = ref<'biometric' | 'pin'>('pin')
const pin = ref('')
const error = ref('')
const isLoading = ref(false)
const biometricAvailable = ref(false)
const remainingAttempts = ref(5)
const isLockedOut = ref(false)
const lockoutTimeRemaining = ref('')

let lockoutTimer: NodeJS.Timeout | null = null

const canSwitchMethod = computed(() => {
  return biometricAvailable.value && PinAuthService.hasPinSet()
})

const authenticateWithBiometric = async () => {
  error.value = ''
  isLoading.value = true

  try {
    const result = await BiometricAuthService.authenticate()
    if (result.success) {
      emit('success')
    } else {
      error.value = result.error || 'Biometric authentication failed'
    }
  } catch (err) {
    error.value = 'Authentication failed'
    console.error('Biometric authentication error:', err)
  } finally {
    isLoading.value = false
  }
}

const handlePinInput = async () => {
  if (pin.value.length >= 4) {
    error.value = ''
    
    try {
      const isValid = await PinAuthService.verifyPin(pin.value)
      if (isValid) {
        emit('success')
      } else {
        error.value = 'Invalid PIN'
        pin.value = ''
        updateLockoutStatus()
      }
    } catch (err) {
      error.value = 'PIN verification failed'
      pin.value = ''
      console.error('PIN verification error:', err)
    }
  }
}

const switchAuthMethod = () => {
  error.value = ''
  pin.value = ''
  authMethod.value = authMethod.value === 'biometric' ? 'pin' : 'biometric'
}

const resetAuth = () => {
  if (confirm('This will reset all authentication settings. You will need to set up authentication again. Continue?')) {
    emit('reset')
  }
}

const updateLockoutStatus = () => {
  remainingAttempts.value = PinAuthService.getRemainingAttempts()
  isLockedOut.value = PinAuthService.isLockedOut()
  
  if (isLockedOut.value) {
    updateLockoutTimer()
  }
}

const updateLockoutTimer = () => {
  const updateTimer = () => {
    const timeRemaining = PinAuthService.getLockoutTimeRemaining()
    if (timeRemaining > 0) {
      lockoutTimeRemaining.value = PinAuthService.formatLockoutTime(timeRemaining)
      lockoutTimer = setTimeout(updateTimer, 1000)
    } else {
      isLockedOut.value = false
      remainingAttempts.value = 5
      lockoutTimeRemaining.value = ''
    }
  }
  updateTimer()
}

onMounted(async () => {
  try {
    biometricAvailable.value = await BiometricAuthService.isAvailable()
    
    // Determine default auth method
    if (biometricAvailable.value && BiometricAuthService.hasCredential()) {
      authMethod.value = 'biometric'
    } else if (PinAuthService.hasPinSet()) {
      authMethod.value = 'pin'
      updateLockoutStatus()
    }
  } catch (error) {
    console.error('Error initializing auth screen:', error)
  }
})

onUnmounted(() => {
  if (lockoutTimer) {
    clearTimeout(lockoutTimer)
  }
})
</script>