<template>
  <div class="checklist-renderer">
    <div v-if="readonly" class="checklist-renderer-display">
      <div v-if="items && items.length > 0" class="space-y-1">
        <div
          v-for="(item, index) in displayItems"
          :key="index"
          class="flex items-center space-x-2 text-sm"
        >
          <CheckCircleIcon
            v-if="item.completed"
            class="w-4 h-4 text-green-500 shrink-0"
          />
          <div
            v-else
            class="w-4 h-4 border border-gray-300 dark:border-gray-600 rounded shrink-0"
          ></div>
          <span
            :class="[
              item.completed 
                ? 'line-through text-gray-500 dark:text-gray-400' 
                : 'text-gray-900 dark:text-white'
            ]"
          >
            {{ item.text }}
          </span>
        </div>
        <div v-if="items.length > maxDisplayItems" class="text-xs text-gray-500 dark:text-gray-400">
          +{{ items.length - maxDisplayItems }} more items
        </div>
        <div class="text-xs text-gray-500 dark:text-gray-400 mt-2">
          {{ completedCount }}/{{ items.length }} completed
        </div>
      </div>
      <span v-else class="text-sm text-gray-500 dark:text-gray-400">-</span>
    </div>
    <div v-else class="checklist-renderer-input">
      <div class="space-y-3">
        <div class="space-y-2">
          <div
            v-for="(item, index) in items"
            :key="index"
            class="flex items-center space-x-2 group"
          >
            <button
              @click="toggleItem(index)"
              class="shrink-0"
            >
              <CheckCircleIcon
                v-if="item.completed"
                class="w-5 h-5 text-green-500 hover:text-green-600"
              />
              <div
                v-else
                class="w-5 h-5 border-2 border-gray-300 dark:border-gray-600 rounded hover:border-gray-400 dark:hover:border-gray-500"
              ></div>
            </button>
            <input
              v-model="item.text"
              @blur="updateItems"
              type="text"
              :class="[
                'flex-1 px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white',
                item.completed ? 'line-through text-gray-500 dark:text-gray-400' : ''
              ]"
              placeholder="Enter checklist item..."
            />
            <button
              @click="removeItem(index)"
              class="opacity-0 group-hover:opacity-100 p-1 text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 transition-opacity"
            >
              <XMarkIcon class="w-4 h-4" />
            </button>
          </div>
        </div>
        
        <button
          @click="addItem"
          class="flex items-center space-x-2 w-full p-2 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg text-gray-500 dark:text-gray-400 hover:border-primary-500 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
        >
          <PlusIcon class="w-4 h-4" />
          <span class="text-sm">Add item</span>
        </button>
        
        <div class="flex items-center justify-between text-sm">
          <span class="text-gray-600 dark:text-gray-400">
            {{ completedCount }}/{{ items.length }} completed ({{ completionPercentage }}%)
          </span>
          <div class="flex space-x-2">
            <button
              @click="checkAll"
              class="text-xs text-green-600 dark:text-green-400 hover:underline"
            >
              Check All
            </button>
            <button
              @click="uncheckAll"
              class="text-xs text-gray-600 dark:text-gray-400 hover:underline"
            >
              Uncheck All
            </button>
          </div>
        </div>
        
        <div class="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
          <div
            class="bg-green-500 h-2 rounded-full transition-all duration-300"
            :style="{ width: `${completionPercentage}%` }"
          ></div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { Field } from '@/types/database'
import {
  CheckCircleIcon,
  XMarkIcon,
  PlusIcon
} from '@heroicons/vue/24/outline'

interface ChecklistItem {
  text: string
  completed: boolean
}

interface Props {
  field: Field
  value: ChecklistItem[]
  readonly?: boolean
  compact?: boolean
}

const props = defineProps<Props>()

const emit = defineEmits<{
  'update:value': [value: ChecklistItem[]]
}>()

const maxDisplayItems = props.compact ? 3 : 10

const items = computed(() => props.value || [])

const displayItems = computed(() => 
  items.value.slice(0, maxDisplayItems)
)

const completedCount = computed(() => 
  items.value.filter(item => item.completed).length
)

const completionPercentage = computed(() => 
  items.value.length > 0 ? Math.round((completedCount.value / items.value.length) * 100) : 0
)

const toggleItem = (index: number) => {
  const newItems = [...items.value]
  newItems[index].completed = !newItems[index].completed
  emit('update:value', newItems)
}

const updateItems = () => {
  emit('update:value', [...items.value])
}

const removeItem = (index: number) => {
  const newItems = [...items.value]
  newItems.splice(index, 1)
  emit('update:value', newItems)
}

const addItem = () => {
  const newItems = [...items.value, { text: '', completed: false }]
  emit('update:value', newItems)
}

const checkAll = () => {
  const newItems = items.value.map(item => ({ ...item, completed: true }))
  emit('update:value', newItems)
}

const uncheckAll = () => {
  const newItems = items.value.map(item => ({ ...item, completed: false }))
  emit('update:value', newItems)
}
</script>