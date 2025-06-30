<template>
  <div class="qr-code-renderer">
    <div v-if="readonly" class="qr-code-renderer-display">
      <div v-if="value" class="space-y-2">
        <div class="bg-white p-4 rounded border inline-block">
          <div class="qr-code-grid grid gap-0.5" :style="{ gridTemplateColumns: `repeat(${qrSize}, 1fr)` }">
            <div
              v-for="(cell, index) in qrPattern"
              :key="index"
              :class="[
                'aspect-square',
                cell ? 'bg-black' : 'bg-white'
              ]"
              style="width: 4px; height: 4px;"
            ></div>
          </div>
        </div>
        <div class="text-xs text-gray-600 dark:text-gray-400 max-w-32 break-all">
          {{ value }}
        </div>
        <div v-if="!compact" class="flex items-center space-x-2">
          <button
            @click="copyQRData"
            class="text-xs text-primary-600 dark:text-primary-400 hover:underline"
          >
            Copy Data
          </button>
          <span class="text-xs text-gray-400">•</span>
          <button
            @click="scanQRCode"
            class="text-xs text-primary-600 dark:text-primary-400 hover:underline"
          >
            Scan
          </button>
        </div>
      </div>
      <span v-else class="text-sm text-gray-500 dark:text-gray-400">-</span>
    </div>
    <div v-else class="qr-code-renderer-input">
      <div class="space-y-3">
        <textarea
          v-model="inputValue"
          @input="updateValue"
          :placeholder="field.name || 'Enter data for QR code'"
          :required="field.isRequired"
          rows="3"
          class="form-input resize-none"
        />
        
        <div v-if="inputValue" class="bg-white p-4 rounded border">
          <div class="qr-code-grid grid gap-0.5 mx-auto" :style="{ gridTemplateColumns: `repeat(${qrSize}, 1fr)`, width: 'fit-content' }">
            <div
              v-for="(cell, index) in qrPattern"
              :key="index"
              :class="[
                'aspect-square',
                cell ? 'bg-black' : 'bg-white'
              ]"
              style="width: 4px; height: 4px;"
            ></div>
          </div>
        </div>
        
        <div class="flex items-center justify-between">
          <div class="flex items-center space-x-4">
            <div>
              <label class="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                Error Correction
              </label>
              <select
                v-model="errorCorrection"
                class="text-sm bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded px-2 py-1"
              >
                <option value="L">Low (7%)</option>
                <option value="M">Medium (15%)</option>
                <option value="Q">Quartile (25%)</option>
                <option value="H">High (30%)</option>
              </select>
            </div>
          </div>
          
          <div class="flex space-x-2">
            <button
              @click="generateSampleData"
              class="text-xs text-primary-600 dark:text-primary-400 hover:underline"
            >
              Sample Data
            </button>
            <button
              @click="scanQRCode"
              class="text-xs text-primary-600 dark:text-primary-400 hover:underline"
            >
              Scan QR
            </button>
          </div>
        </div>
        
        <div class="text-xs text-gray-500 dark:text-gray-400">
          QR codes can store up to 4,296 alphanumeric characters. Higher error correction allows for better scanning in damaged conditions.
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import type { Field } from '@/types/database'

interface Props {
  field: Field
  value: string
  readonly?: boolean
  compact?: boolean
}

const props = defineProps<Props>()

const emit = defineEmits<{
  'update:value': [value: string]
}>()

const inputValue = ref(props.value || '')
const errorCorrection = ref(props.field.options?.qrErrorCorrection || 'M')
const qrSize = 21 // Standard QR code size for demo

const qrPattern = computed(() => {
  // Generate a simple QR code pattern for demo
  const data = inputValue.value || props.value || ''
  if (!data) return []
  
  const pattern = []
  const size = qrSize
  
  for (let i = 0; i < size * size; i++) {
    const row = Math.floor(i / size)
    const col = i % size
    
    // Create a simple pattern based on data
    const hash = data.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0)
    const isBlack = (row + col + hash) % 3 === 0
    
    // Add finder patterns (corners)
    if ((row < 7 && col < 7) || (row < 7 && col >= size - 7) || (row >= size - 7 && col < 7)) {
      const inFinder = (row < 7 && col < 7) || (row < 7 && col >= size - 7) || (row >= size - 7 && col < 7)
      const finderPattern = (row % 6 === 0 || col % 6 === 0 || (row > 1 && row < 5 && col > 1 && col < 5))
      pattern.push(inFinder && finderPattern)
    } else {
      pattern.push(isBlack)
    }
  }
  
  return pattern
})

const updateValue = () => {
  emit('update:value', inputValue.value)
}

const generateSampleData = () => {
  const samples = [
    'https://example.com',
    'Contact: John Doe\nPhone: +1234567890\nEmail: john@example.com',
    'WiFi:T:WPA;S:MyNetwork;P:password123;;',
    'BEGIN:VCARD\nVERSION:3.0\nFN:John Doe\nORG:Company\nTEL:+1234567890\nEMAIL:john@example.com\nEND:VCARD'
  ]
  
  inputValue.value = samples[Math.floor(Math.random() * samples.length)]
  updateValue()
}

const scanQRCode = async () => {
  try {
    // In a real implementation, this would use the camera API
    // For demo purposes, we'll simulate a scan
    const scannedData = prompt('Enter QR code data (demo):')
    if (scannedData) {
      inputValue.value = scannedData
      updateValue()
    }
  } catch (error) {
    console.error('QR code scanning failed:', error)
  }
}

const copyQRData = async () => {
  if (props.value) {
    try {
      await navigator.clipboard.writeText(props.value)
      // Could show a toast notification here
    } catch (error) {
      console.error('Failed to copy QR data:', error)
    }
  }
}
</script>