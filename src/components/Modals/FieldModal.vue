<template>
  <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
    <div class="bg-white dark:bg-gray-800 rounded-lg shadow-lg max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto">
      <div class="flex justify-between items-center mb-6">
        <h2 class="text-xl font-semibold text-gray-900 dark:text-white">
          {{ field ? 'Edit Field' : 'Add Field' }}
        </h2>
        <button
          @click="$emit('close')"
          class="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
        >
          <XMarkIcon class="w-6 h-6" />
        </button>
      </div>

      <form @submit.prevent="handleSubmit" class="space-y-6">
        <!-- Basic Information -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label for="name" class="form-label">Field Name</label>
            <input
              id="name"
              v-model="formData.name"
              type="text"
              required
              class="form-input"
              placeholder="Enter field name"
            />
          </div>

          <div>
            <label for="type" class="form-label">Field Type</label>
            <select
              id="type"
              v-model="formData.type"
              @change="onTypeChange"
              required
              class="form-input"
            >
              <option value="">Select field type</option>
              <optgroup label="Text">
                <option value="text">Text</option>
                <option value="long_text">Long Text</option>
                <option value="email">Email</option>
                <option value="phone">Phone</option>
                <option value="url">URL</option>
              </optgroup>
              <optgroup label="Numbers">
                <option value="number">Number</option>
                <option value="currency">Currency</option>
              </optgroup>
              <optgroup label="Date & Time">
                <option value="date">Date</option>
                <option value="time">Time</option>
                <option value="datetime">Date & Time</option>
              </optgroup>
              <optgroup label="Media">
                <option value="image">Image</option>
                <option value="file">File</option>
              </optgroup>
              <optgroup label="Advanced">
                <option value="boolean">Boolean</option>
                <option value="enum">Select/Enum</option>
                <option value="json">JSON</option>
                <option value="geometry">Geometry/Location</option>
                <option value="color">Color</option>
                <option value="csv">CSV Data</option>
                <option value="relationship">Relationship</option>
              </optgroup>
            </select>
          </div>
        </div>

        <!-- Field Properties -->
        <div class="space-y-4">
          <div class="flex items-center space-x-6">
            <label class="flex items-center space-x-2">
              <input
                v-model="formData.isRequired"
                type="checkbox"
                class="w-4 h-4 text-primary-600 bg-gray-100 border-gray-300 rounded focus:ring-primary-500"
              />
              <span class="text-sm text-gray-900 dark:text-white">Required</span>
            </label>

            <label class="flex items-center space-x-2">
              <input
                v-model="formData.isPrimary"
                type="checkbox"
                class="w-4 h-4 text-primary-600 bg-gray-100 border-gray-300 rounded focus:ring-primary-500"
              />
              <span class="text-sm text-gray-900 dark:text-white">Primary Field</span>
            </label>

            <label class="flex items-center space-x-2">
              <input
                v-model="formData.isUnique"
                type="checkbox"
                class="w-4 h-4 text-primary-600 bg-gray-100 border-gray-300 rounded focus:ring-primary-500"
              />
              <span class="text-sm text-gray-900 dark:text-white">Unique</span>
            </label>
          </div>

          <div v-if="formData.type && formData.type !== 'relationship'">
            <label for="defaultValue" class="form-label">Default Value</label>
            <input
              id="defaultValue"
              v-model="formData.defaultValue"
              :type="getDefaultValueInputType()"
              class="form-input"
              :placeholder="getDefaultValuePlaceholder()"
            />
          </div>
        </div>

        <!-- Relationship Options -->
        <div v-if="formData.type === 'relationship'" class="space-y-4">
          <h3 class="text-lg font-medium text-gray-900 dark:text-white">Relationship Configuration</h3>
          
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label for="relationshipType" class="form-label">Relationship Type</label>
              <select
                id="relationshipType"
                v-model="formData.options.relationshipType"
                class="form-input"
                required
              >
                <option value="">Select type</option>
                <option value="one-to-one">One to One</option>
                <option value="one-to-many">One to Many</option>
                <option value="many-to-one">Many to One</option>
                <option value="many-to-many">Many to Many</option>
                <option value="self-referential">Self Referential</option>
              </select>
            </div>

            <div>
              <label for="targetTable" class="form-label">Target Table</label>
              <select
                id="targetTable"
                v-model="formData.options.targetTableId"
                @change="onTargetTableChange"
                class="form-input"
                required
              >
                <option value="">Select table</option>
                <option
                  v-for="table in availableTables"
                  :key="table.id"
                  :value="table.id"
                >
                  {{ table.name }}
                </option>
              </select>
            </div>
          </div>

          <div>
            <label for="displayField" class="form-label">Display Field</label>
            <select
              id="displayField"
              v-model="formData.options.displayField"
              class="form-input"
            >
              <option value="">Auto (Primary field)</option>
              <option
                v-for="field in targetTableFields"
                :key="field.id"
                :value="field.id"
              >
                {{ field.name }} ({{ field.type }})
              </option>
            </select>
          </div>

          <div v-if="['one-to-many', 'many-to-many'].includes(formData.options.relationshipType)">
            <label class="flex items-center space-x-2">
              <input
                v-model="formData.options.allowMultiple"
                type="checkbox"
                class="w-4 h-4 text-primary-600 bg-gray-100 border-gray-300 rounded focus:ring-primary-500"
              />
              <span class="text-sm text-gray-900 dark:text-white">Allow Multiple Selection</span>
            </label>
          </div>
        </div>

        <!-- Type-specific Validation -->
        <div v-if="showValidation" class="space-y-4">
          <h3 class="text-lg font-medium text-gray-900 dark:text-white">Validation</h3>
          
          <!-- Text Validation -->
          <div v-if="isTextType" class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label for="minLength" class="form-label">Minimum Length</label>
              <input
                id="minLength"
                v-model.number="formData.validation.minLength"
                type="number"
                min="0"
                class="form-input"
              />
            </div>
            <div>
              <label for="maxLength" class="form-label">Maximum Length</label>
              <input
                id="maxLength"
                v-model.number="formData.validation.maxLength"
                type="number"
                min="0"
                class="form-input"
              />
            </div>
            <div class="md:col-span-2">
              <label for="pattern" class="form-label">Pattern (Regex)</label>
              <input
                id="pattern"
                v-model="formData.validation.pattern"
                type="text"
                class="form-input"
                placeholder="^[A-Za-z]+$"
              />
            </div>
          </div>

          <!-- Number Validation -->
          <div v-if="isNumberType" class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label for="min" class="form-label">Minimum Value</label>
              <input
                id="min"
                v-model.number="formData.validation.min"
                type="number"
                class="form-input"
              />
            </div>
            <div>
              <label for="max" class="form-label">Maximum Value</label>
              <input
                id="max"
                v-model.number="formData.validation.max"
                type="number"
                class="form-input"
              />
            </div>
          </div>
        </div>

        <!-- Type-specific Options -->
        <div v-if="showOptions" class="space-y-4">
          <h3 class="text-lg font-medium text-gray-900 dark:text-white">Options</h3>
          
          <!-- Enum Options -->
          <div v-if="formData.type === 'enum'" class="space-y-3">
            <div class="flex items-center space-x-2">
              <input
                v-model="newEnumValue"
                type="text"
                placeholder="Add option"
                class="form-input flex-1"
                @keyup.enter="addEnumValue"
              />
              <button
                type="button"
                @click="addEnumValue"
                :disabled="!newEnumValue.trim()"
                class="btn-secondary disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Add
              </button>
            </div>
            <div v-if="formData.options.enumValues.length > 0" class="space-y-2">
              <div class="text-sm font-medium text-gray-700 dark:text-gray-300">Options:</div>
              <div class="space-y-1">
                <div
                  v-for="(value, index) in formData.options.enumValues"
                  :key="index"
                  class="flex items-center justify-between bg-gray-50 dark:bg-gray-700 rounded px-3 py-2"
                >
                  <span class="text-sm text-gray-900 dark:text-white">{{ value }}</span>
                  <button
                    type="button"
                    @click="removeEnumValue(index)"
                    class="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
                  >
                    <XMarkIcon class="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>

          <!-- Currency Options -->
          <div v-if="formData.type === 'currency'" class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label for="currency" class="form-label">Currency</label>
              <select
                id="currency"
                v-model="formData.options.currency"
                class="form-input"
              >
                <option value="USD">USD - US Dollar</option>
                <option value="EUR">EUR - Euro</option>
                <option value="GBP">GBP - British Pound</option>
                <option value="JPY">JPY - Japanese Yen</option>
                <option value="CAD">CAD - Canadian Dollar</option>
                <option value="AUD">AUD - Australian Dollar</option>
              </select>
            </div>
            <div>
              <label for="precision" class="form-label">Decimal Places</label>
              <input
                id="precision"
                v-model.number="formData.options.precision"
                type="number"
                min="0"
                max="4"
                class="form-input"
              />
            </div>
          </div>

          <!-- File Options -->
          <div v-if="formData.type === 'file' || formData.type === 'image'" class="space-y-4">
            <div>
              <label for="maxFileSize" class="form-label">Max File Size (MB)</label>
              <input
                id="maxFileSize"
                v-model.number="maxFileSizeMB"
                type="number"
                min="1"
                max="100"
                class="form-input"
              />
            </div>
            <div>
              <label for="fileTypes" class="form-label">Allowed File Types</label>
              <input
                v-model="fileTypesInput"
                type="text"
                class="form-input"
                placeholder="image/jpeg, image/png, .pdf"
              />
              <div class="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Separate multiple types with commas
              </div>
            </div>
          </div>
        </div>

        <div class="flex justify-end space-x-3 pt-6 border-t border-gray-200 dark:border-gray-700">
          <button
            type="button"
            @click="$emit('close')"
            class="btn-secondary"
          >
            Cancel
          </button>
          <button
            type="submit"
            class="btn-primary"
          >
            {{ field ? 'Update' : 'Add' }} Field
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive, computed, ref, onMounted, watch } from 'vue'
import type { Field, Table } from '@/types/database'
import { FieldType } from '@/types/database'
import { XMarkIcon } from '@heroicons/vue/24/outline'

interface Props {
  field?: Field | null
  tables?: Table[]
  currentTableId?: string
}

const props = defineProps<Props>()

const emit = defineEmits<{
  close: []
  save: [data: any]
}>()

const newEnumValue = ref('')
const maxFileSizeMB = ref(5)
const fileTypesInput = ref('')

const formData = reactive({
  name: '',
  type: '' as FieldType | '',
  isRequired: false,
  isPrimary: false,
  isUnique: false,
  defaultValue: '',
  position: 1,
  validation: {
    minLength: undefined as number | undefined,
    maxLength: undefined as number | undefined,
    min: undefined as number | undefined,
    max: undefined as number | undefined,
    pattern: ''
  },
  options: {
    enumValues: [] as string[],
    currency: 'USD',
    precision: 2,
    dateFormat: 'default',
    fileTypes: [] as string[],
    maxFileSize: 5 * 1024 * 1024, // 5MB
    relationshipType: '',
    targetTableId: '',
    displayField: '',
    allowMultiple: false
  }
})

const availableTables = computed(() => {
  if (!props.tables) return []
  
  // For self-referential relationships, include current table
  // For other relationships, exclude current table
  if (formData.options.relationshipType === 'self-referential') {
    return props.tables.filter(table => table.id === props.currentTableId)
  }
  
  return props.tables.filter(table => table.id !== props.currentTableId)
})

const targetTableFields = computed(() => {
  if (!formData.options.targetTableId || !props.tables) return []
  
  const table = props.tables.find(t => t.id === formData.options.targetTableId)
  return table?.fields || []
})

const isTextType = computed(() => 
  ['text', 'long_text', 'email', 'phone', 'url'].includes(formData.type)
)

const isNumberType = computed(() => 
  ['number', 'currency'].includes(formData.type)
)

const showValidation = computed(() => 
  isTextType.value || isNumberType.value
)

const showOptions = computed(() => 
  ['enum', 'currency', 'file', 'image'].includes(formData.type)
)

const onTypeChange = () => {
  // Reset validation and options when type changes
  formData.validation = {
    minLength: undefined,
    maxLength: undefined,
    min: undefined,
    max: undefined,
    pattern: ''
  }
  
  formData.options = {
    enumValues: [],
    currency: 'USD',
    precision: 2,
    dateFormat: 'default',
    fileTypes: [],
    maxFileSize: 5 * 1024 * 1024,
    relationshipType: '',
    targetTableId: '',
    displayField: '',
    allowMultiple: false
  }
  
  formData.defaultValue = ''
}

const onTargetTableChange = () => {
  formData.options.displayField = ''
}

const getDefaultValueInputType = () => {
  switch (formData.type) {
    case 'number':
    case 'currency':
      return 'number'
    case 'date':
      return 'date'
    case 'time':
      return 'time'
    case 'datetime':
      return 'datetime-local'
    case 'email':
      return 'email'
    case 'url':
      return 'url'
    case 'phone':
      return 'tel'
    case 'color':
      return 'color'
    case 'boolean':
      return 'checkbox'
    default:
      return 'text'
  }
}

const getDefaultValuePlaceholder = () => {
  switch (formData.type) {
    case 'text':
      return 'Default text value'
    case 'number':
      return '0'
    case 'currency':
      return '0.00'
    case 'email':
      return 'user@example.com'
    case 'phone':
      return '+1234567890'
    case 'url':
      return 'https://example.com'
    case 'color':
      return '#000000'
    default:
      return 'Default value'
  }
}

const addEnumValue = () => {
  if (newEnumValue.value.trim() && !formData.options.enumValues.includes(newEnumValue.value.trim())) {
    formData.options.enumValues.push(newEnumValue.value.trim())
    newEnumValue.value = ''
  }
}

const removeEnumValue = (index: number) => {
  formData.options.enumValues.splice(index, 1)
}

watch(maxFileSizeMB, (newValue) => {
  formData.options.maxFileSize = newValue * 1024 * 1024
})

watch(fileTypesInput, (newValue) => {
  formData.options.fileTypes = newValue.split(',').map(type => type.trim()).filter(Boolean)
})

const handleSubmit = () => {
  const fieldData = {
    ...formData,
    validation: Object.fromEntries(
      Object.entries(formData.validation).filter(([_, value]) => value !== undefined && value !== '')
    ),
    options: Object.fromEntries(
      Object.entries(formData.options).filter(([_, value]) => {
        if (Array.isArray(value)) return value.length > 0
        return value !== undefined && value !== ''
      })
    )
  }
  
  emit('save', fieldData)
}

onMounted(() => {
  if (props.field) {
    Object.assign(formData, {
      name: props.field.name,
      type: props.field.type,
      isRequired: props.field.isRequired,
      isPrimary: props.field.isPrimary,
      isUnique: props.field.isUnique,
      defaultValue: props.field.defaultValue || '',
      position: props.field.position,
      validation: props.field.validation || {},
      options: props.field.options || {}
    })
    
    if (props.field.options?.maxFileSize) {
      maxFileSizeMB.value = props.field.options.maxFileSize / (1024 * 1024)
    }
    
    if (props.field.options?.fileTypes) {
      fileTypesInput.value = props.field.options.fileTypes.join(', ')
    }
  }
})
</script>