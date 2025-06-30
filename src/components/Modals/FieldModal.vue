<template>
  <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
    <div class="bg-white dark:bg-gray-800 rounded-lg shadow-lg max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col">
      <div class="flex justify-between items-center p-6 border-b border-gray-200 dark:border-gray-700">
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

      <div class="flex-1 overflow-y-auto p-6">
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
                  <option value="rating">Rating</option>
                  <option value="progress">Progress</option>
                  <option value="duration">Duration</option>
                </optgroup>
                <optgroup label="Date & Time">
                  <option value="date">Date</option>
                  <option value="time">Time</option>
                  <option value="datetime">Date & Time</option>
                  <option value="created_time">Created Time</option>
                  <option value="modified_time">Modified Time</option>
                </optgroup>
                <optgroup label="Media">
                  <option value="image">Image</option>
                  <option value="file">File</option>
                  <option value="signature">Signature</option>
                </optgroup>
                <optgroup label="Selection">
                  <option value="boolean">Boolean</option>
                  <option value="enum">Select/Enum</option>
                  <option value="tags">Tags</option>
                  <option value="checklist">Checklist</option>
                </optgroup>
                <optgroup label="Advanced">
                  <option value="json">JSON</option>
                  <option value="geometry">Geometry/Location</option>
                  <option value="color">Color</option>
                  <option value="csv">CSV Data</option>
                  <option value="barcode">Barcode</option>
                  <option value="qr_code">QR Code</option>
                  <option value="formula">Formula</option>
                  <option value="lookup">Lookup</option>
                  <option value="rollup">Rollup</option>
                  <option value="autonumber">Auto Number</option>
                  <option value="relationship">Relationship</option>
                </optgroup>
                <optgroup label="System">
                  <option value="created_by">Created By</option>
                  <option value="modified_by">Modified By</option>
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

            <div v-if="formData.type && !isSystemField(formData.type)">
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

          <!-- Type-specific Options -->
          <div v-if="showTypeSpecificOptions" class="space-y-6">
            <!-- Rating Options -->
            <div v-if="formData.type === 'rating'" class="space-y-4">
              <h3 class="text-lg font-medium text-gray-900 dark:text-white">Rating Options</h3>
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label for="maxRating" class="form-label">Maximum Rating</label>
                  <select
                    id="maxRating"
                    v-model="formData.options.maxRating"
                    class="form-input"
                  >
                    <option value="3">3 Stars</option>
                    <option value="5">5 Stars</option>
                    <option value="10">10 Points</option>
                  </select>
                </div>
                <div class="flex items-center">
                  <label class="flex items-center space-x-2">
                    <input
                      v-model="formData.options.showValue"
                      type="checkbox"
                      class="w-4 h-4 text-primary-600 bg-gray-100 border-gray-300 rounded focus:ring-primary-500"
                    />
                    <span class="text-sm text-gray-900 dark:text-white">Show numeric value</span>
                  </label>
                </div>
              </div>
            </div>

            <!-- Enum Options -->
            <div v-if="formData.type === 'enum'" class="space-y-3">
              <h3 class="text-lg font-medium text-gray-900 dark:text-white">Enum Options</h3>
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
        </form>
      </div>

      <div class="flex justify-end space-x-3 p-6 border-t border-gray-200 dark:border-gray-700">
        <button
          type="button"
          @click="$emit('close')"
          class="btn-secondary"
        >
          Cancel
        </button>
        <button
          @click="handleSubmit"
          class="btn-primary"
        >
          {{ field ? 'Update' : 'Add' }} Field
        </button>
      </div>
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
    allowMultiple: false,
    maxRating: 5,
    showValue: true,
    tagSuggestions: [] as string[],
    barcodeFormat: 'code128',
    qrErrorCorrection: 'M',
    formula: '',
    autoNumberStart: 1,
    autoNumberStep: 1
  }
})

const isTextType = computed(() => 
  ['text', 'long_text', 'email', 'phone', 'url'].includes(formData.type)
)

const isNumberType = computed(() => 
  ['number', 'currency', 'rating', 'progress', 'duration'].includes(formData.type)
)

const showValidation = computed(() => 
  isTextType.value || isNumberType.value
)

const showTypeSpecificOptions = computed(() => 
  ['enum', 'currency', 'file', 'image', 'rating'].includes(formData.type)
)

const isSystemField = (type: string) => {
  return ['created_time', 'modified_time', 'created_by', 'modified_by', 'autonumber'].includes(type)
}

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
    allowMultiple: false,
    maxRating: 5,
    showValue: true,
    tagSuggestions: [],
    barcodeFormat: 'code128',
    qrErrorCorrection: 'M',
    formula: '',
    autoNumberStart: 1,
    autoNumberStep: 1
  }
  
  formData.defaultValue = ''
}

const getDefaultValueInputType = () => {
  switch (formData.type) {
    case 'number':
    case 'currency':
    case 'rating':
    case 'progress':
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
    case 'rating':
      return '0'
    case 'progress':
      return '0'
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