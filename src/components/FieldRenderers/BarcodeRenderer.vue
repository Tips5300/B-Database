<template>
  <div class="barcode-renderer">
    <div v-if="readonly" class="barcode-renderer-display">
      <div v-if="value" class="space-y-2">
        <div class="bg-white p-4 rounded border inline-block">
          <div class="barcode-lines flex items-end space-x-1">
            <div
              v-for="(line, index) in barcodeLines"
              :key="index"
              :class="[
                'bg-black',
                line.width === 'thin' ? 'w-0.5' : line.width === 'medium' ? 'w-1' : 'w-2',
                line.height === 'short' ? 'h-8' : line.height === 'medium' ? 'h-12' : 'h-16'
              ]"
            ></div>
          </div>
          <div class="text-center text-xs font-mono mt-2">{{ value }}</div>
        </div>
        <div v-if="!compact" class="flex items-center space-x-2">
          <button
            @click="copyBarcode"
            class="text-xs text-primary-600 dark:text-primary-400 hover:underline"
          >
            Copy Code
          </button>
          <span class="text-xs text-gray-400">•</span>
          <button
            @click="scanBarcode"
            class="text-xs text-primary-600 dark:text-primary-400 hover:underline"
          >
            Scan
          </button>
        </div>
      </div>
      <span v-else class="text-sm text-gray-500 dark:text-gray-400">-</span>
    </div>
    <div v-else class="barcode-renderer-input">
      <div class="space-y-3">
        <div class="flex items-center space-x-2">
          <input
            v-model="inputValue"
            @input="updateValue"
            type="text"
            :placeholder="field.name || 'Enter barcode'"
            :required="field.isRequired"
            class="form-input flex-1 font-mono"
            :pattern="getBarcodePattern()"
          />
          <button
            @click="generateBarcode"
            class="btn-secondary text-sm"
          >
            Generate
          </button>
          <button
            @click="scanBarcode"
            class="btn-secondary text-sm"
          >
            <QrCodeIcon class="w-4 h-4" />
          </button>
        </div>
        
        <div v-if="inputValue" class="bg-white p-4 rounded border">
          <div class="barcode-lines flex items-end space-x-1 justify-center">
            <div
              v-for="(line, index) in barcodeLines"
              :key="index"
              :class="[
                'bg-black',
                line.width === 'thin' ? 'w-0.5' : line.width === 'medium' ? 'w-1' : 'w-2',
                line.height === 'short' ? 'h-8' : line.height === 'medium' ? 'h-12' : 'h-16'
              ]"
            ></div>
          </div>
          <div class="text-center text-xs font-mono mt-2">{{ inputValue }}</div>
        </div>
        
        <div class="flex items-center space-x-4">
          <div>
            <label class="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
              Format
            </label>
            <select
              v-model="barcodeFormat"
              class="text-sm bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded px-2 py-1"
            >
              <option value="code128">Code 128</option>
              <option value="code39">Code 39</option>
              <option value="ean13">EAN-13</option>
              <option value="upc">UPC</option>
            </select>
          </div>
        </div>
        
        <div class="text-xs text-gray-500 dark:text-gray-400">
          Supports {{ barcodeFormat.toUpperCase() }} format. Click Generate for random code or Scan to use camera.
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import type { Field } from '@/types/database'
import { QrCodeIcon } from '@heroicons/vue/24/outline'

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
const barcodeFormat = ref(props.field.options?.barcodeFormat || 'code128')

const barcodeLines = computed(() => {
  // Generate a simple barcode representation
  const code = inputValue.value || props.value || ''
  if (!code) return []
  
  const lines = []
  for (let i = 0; i < code.length; i++) {
    const char = code.charCodeAt(i)
    const width = char % 3 === 0 ? 'thin' : char % 3 === 1 ? 'medium' : 'thick'
    const height = char % 2 === 0 ? 'tall' : 'medium'
    lines.push({ width, height })
    
    // Add spacing
    if (i < code.length - 1) {
      lines.push({ width: 'thin', height: 'short' })
    }
  }
  return lines
})

const updateValue = () => {
  emit('update:value', inputValue.value)
}

const generateBarcode = () => {
  const formats = {
    code128: () => Math.random().toString(36).substring(2, 15).toUpperCase(),
    code39: () => Math.random().toString(36).substring(2, 12).toUpperCase(),
    ean13: () => Math.floor(Math.random() * 9000000000000) + 1000000000000,
    upc: () => Math.floor(Math.random() * 900000000000) + 100000000000
  }
  
  const generator = formats[barcodeFormat.value as keyof typeof formats]
  inputValue.value = String(generator())
  updateValue()
}

const scanBarcode = async () => {
  try {
    // In a real implementation, this would use the camera API
    // For demo purposes, we'll simulate a scan
    const scannedCode = prompt('Enter scanned barcode (demo):')
    if (scannedCode) {
      inputValue.value = scannedCode
      updateValue()
    }
  } catch (error) {
    console.error('Barcode scanning failed:', error)
  }
}

const copyBarcode = async () => {
  if (props.value) {
    try {
      await navigator.clipboard.writeText(props.value)
      // Could show a toast notification here
    } catch (error) {
      console.error('Failed to copy barcode:', error)
    }
  }
}

const getBarcodePattern = () => {
  const patterns = {
    code128: '[A-Za-z0-9]+',
    code39: '[A-Z0-9\\-\\.\\$\\/\\+\\%\\*\\s]+',
    ean13: '[0-9]{13}',
    upc: '[0-9]{12}'
  }
  return patterns[barcodeFormat.value as keyof typeof patterns] || '[A-Za-z0-9]+'
}
</script>