<template>
  <div class="formula-renderer">
    <div v-if="readonly" class="formula-renderer-display">
      <div class="flex items-center space-x-2">
        <span class="text-sm text-gray-900 dark:text-white">
          {{ calculatedValue }}
        </span>
        <CalculatorIcon class="w-4 h-4 text-gray-400" />
      </div>
    </div>
    <div v-else class="formula-renderer-input">
      <div class="space-y-3">
        <div class="relative">
          <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <span class="text-gray-500 dark:text-gray-400 text-sm">fx</span>
          </div>
          <input
            v-model="formula"
            @input="updateFormula"
            type="text"
            :placeholder="field.name || 'Enter formula'"
            class="form-input pl-8 font-mono text-sm"
          />
        </div>
        
        <div class="bg-gray-50 dark:bg-gray-700 rounded-lg p-3">
          <div class="text-sm font-medium text-gray-900 dark:text-white mb-2">
            Result: {{ calculatedValue }}
          </div>
          <div v-if="formulaError" class="text-xs text-red-600 dark:text-red-400">
            Error: {{ formulaError }}
          </div>
        </div>
        
        <div class="space-y-2">
          <div class="text-xs font-medium text-gray-700 dark:text-gray-300">Available Functions:</div>
          <div class="grid grid-cols-2 gap-2 text-xs">
            <button
              v-for="func in availableFunctions"
              :key="func.name"
              @click="insertFunction(func.name)"
              class="text-left p-2 bg-gray-100 dark:bg-gray-700 rounded hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
            >
              <div class="font-mono text-primary-600 dark:text-primary-400">{{ func.name }}</div>
              <div class="text-gray-500 dark:text-gray-400">{{ func.description }}</div>
            </button>
          </div>
        </div>
        
        <div class="space-y-2">
          <div class="text-xs font-medium text-gray-700 dark:text-gray-300">Available Fields:</div>
          <div class="flex flex-wrap gap-1">
            <button
              v-for="availableField in availableFields"
              :key="availableField.id"
              @click="insertField(availableField)"
              class="text-xs px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded hover:bg-blue-200 dark:hover:bg-blue-800 transition-colors"
            >
              {{ availableField.name }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import type { Field, Table } from '@/types/database'
import { CalculatorIcon } from '@heroicons/vue/24/outline'

interface Props {
  field: Field
  value: string
  readonly?: boolean
  compact?: boolean
  table?: Table
  record?: any
}

const props = defineProps<Props>()

const emit = defineEmits<{
  'update:value': [value: string]
}>()

const formula = ref(props.field.options?.formula || '')
const formulaError = ref('')

const availableFunctions = [
  { name: 'SUM()', description: 'Sum of values' },
  { name: 'AVG()', description: 'Average of values' },
  { name: 'COUNT()', description: 'Count of values' },
  { name: 'MIN()', description: 'Minimum value' },
  { name: 'MAX()', description: 'Maximum value' },
  { name: 'ROUND()', description: 'Round number' },
  { name: 'ABS()', description: 'Absolute value' },
  { name: 'SQRT()', description: 'Square root' },
  { name: 'NOW()', description: 'Current date/time' },
  { name: 'TODAY()', description: 'Current date' },
  { name: 'LEN()', description: 'Length of text' },
  { name: 'UPPER()', description: 'Uppercase text' },
  { name: 'LOWER()', description: 'Lowercase text' },
  { name: 'IF()', description: 'Conditional logic' }
]

const availableFields = computed(() => {
  return props.table?.fields?.filter(f => f.id !== props.field.id) || []
})

const calculatedValue = computed(() => {
  try {
    if (!formula.value) return ''
    
    // Simple formula evaluation for demo
    // In a real implementation, use a proper formula parser
    let result = formula.value
    
    // Replace field references with actual values
    if (props.record) {
      availableFields.value.forEach(field => {
        const fieldValue = props.record.data[field.id] || 0
        result = result.replace(new RegExp(`{${field.name}}`, 'g'), String(fieldValue))
      })
    }
    
    // Handle basic functions
    result = result.replace(/SUM\(([^)]+)\)/g, (match, args) => {
      const values = args.split(',').map((v: string) => parseFloat(v.trim()) || 0)
      return String(values.reduce((sum: number, val: number) => sum + val, 0))
    })
    
    result = result.replace(/AVG\(([^)]+)\)/g, (match, args) => {
      const values = args.split(',').map((v: string) => parseFloat(v.trim()) || 0)
      return String(values.reduce((sum: number, val: number) => sum + val, 0) / values.length)
    })
    
    result = result.replace(/COUNT\(([^)]+)\)/g, (match, args) => {
      const values = args.split(',').filter((v: string) => v.trim() !== '')
      return String(values.length)
    })
    
    result = result.replace(/NOW\(\)/g, new Date().toISOString())
    result = result.replace(/TODAY\(\)/g, new Date().toISOString().split('T')[0])
    
    // Evaluate basic math expressions
    if (/^[\d\s+\-*/().]+$/.test(result)) {
      try {
        result = String(eval(result))
      } catch {
        // Keep original if evaluation fails
      }
    }
    
    formulaError.value = ''
    return result
  } catch (error) {
    formulaError.value = error instanceof Error ? error.message : 'Invalid formula'
    return 'Error'
  }
})

const updateFormula = () => {
  emit('update:value', calculatedValue.value)
}

const insertFunction = (funcName: string) => {
  const cursorPos = formula.value.length
  formula.value = formula.value.slice(0, cursorPos) + funcName + formula.value.slice(cursorPos)
}

const insertField = (field: Field) => {
  const cursorPos = formula.value.length
  const fieldRef = `{${field.name}}`
  formula.value = formula.value.slice(0, cursorPos) + fieldRef + formula.value.slice(cursorPos)
}
</script>