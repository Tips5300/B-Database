<template>
  <div class="signature-renderer">
    <div v-if="readonly" class="signature-renderer-display">
      <div v-if="value" class="space-y-2">
        <div class="border border-gray-300 dark:border-gray-600 rounded-lg p-2 bg-white">
          <img
            :src="value"
            alt="Signature"
            class="max-w-full h-auto"
            style="max-height: 100px;"
          />
        </div>
        <div v-if="!compact" class="flex items-center space-x-2">
          <button
            @click="downloadSignature"
            class="text-xs text-primary-600 dark:text-primary-400 hover:underline"
          >
            Download
          </button>
          <span class="text-xs text-gray-400">•</span>
          <button
            @click="clearSignature"
            class="text-xs text-red-600 dark:text-red-400 hover:underline"
          >
            Clear
          </button>
        </div>
      </div>
      <span v-else class="text-sm text-gray-500 dark:text-gray-400">No signature</span>
    </div>
    <div v-else class="signature-renderer-input">
      <div class="space-y-3">
        <div v-if="value" class="border border-gray-300 dark:border-gray-600 rounded-lg p-2 bg-white">
          <img
            :src="value"
            alt="Current signature"
            class="max-w-full h-auto"
            style="max-height: 100px;"
          />
        </div>
        
        <div class="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-4">
          <canvas
            ref="signatureCanvas"
            @mousedown="startDrawing"
            @mousemove="draw"
            @mouseup="stopDrawing"
            @mouseleave="stopDrawing"
            @touchstart="startDrawing"
            @touchmove="draw"
            @touchend="stopDrawing"
            class="w-full bg-white cursor-crosshair"
            width="400"
            height="150"
          ></canvas>
        </div>
        
        <div class="flex items-center justify-between">
          <div class="flex items-center space-x-4">
            <div>
              <label class="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                Pen Color
              </label>
              <input
                v-model="penColor"
                type="color"
                class="w-8 h-8 rounded border border-gray-300 dark:border-gray-600 cursor-pointer"
              />
            </div>
            <div>
              <label class="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                Pen Size
              </label>
              <input
                v-model="penSize"
                type="range"
                min="1"
                max="10"
                class="w-16"
              />
            </div>
          </div>
          
          <div class="flex space-x-2">
            <button
              @click="clearCanvas"
              class="btn-secondary text-sm"
            >
              Clear
            </button>
            <button
              @click="saveSignature"
              :disabled="!hasDrawn"
              class="btn-primary text-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Save
            </button>
          </div>
        </div>
        
        <div class="text-xs text-gray-500 dark:text-gray-400">
          Draw your signature in the box above. Use mouse or touch to sign.
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
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

const signatureCanvas = ref<HTMLCanvasElement>()
const isDrawing = ref(false)
const hasDrawn = ref(false)
const penColor = ref('#000000')
const penSize = ref(2)

let ctx: CanvasRenderingContext2D | null = null

onMounted(() => {
  if (signatureCanvas.value) {
    ctx = signatureCanvas.value.getContext('2d')
    if (ctx) {
      ctx.lineCap = 'round'
      ctx.lineJoin = 'round'
    }
  }
})

const getEventPos = (event: MouseEvent | TouchEvent) => {
  const canvas = signatureCanvas.value
  if (!canvas) return { x: 0, y: 0 }
  
  const rect = canvas.getBoundingClientRect()
  const scaleX = canvas.width / rect.width
  const scaleY = canvas.height / rect.height
  
  let clientX, clientY
  if (event instanceof MouseEvent) {
    clientX = event.clientX
    clientY = event.clientY
  } else {
    clientX = event.touches[0].clientX
    clientY = event.touches[0].clientY
  }
  
  return {
    x: (clientX - rect.left) * scaleX,
    y: (clientY - rect.top) * scaleY
  }
}

const startDrawing = (event: MouseEvent | TouchEvent) => {
  event.preventDefault()
  isDrawing.value = true
  hasDrawn.value = true
  
  const pos = getEventPos(event)
  if (ctx) {
    ctx.beginPath()
    ctx.moveTo(pos.x, pos.y)
    ctx.strokeStyle = penColor.value
    ctx.lineWidth = parseInt(penSize.value.toString())
  }
}

const draw = (event: MouseEvent | TouchEvent) => {
  if (!isDrawing.value || !ctx) return
  
  event.preventDefault()
  const pos = getEventPos(event)
  
  ctx.lineTo(pos.x, pos.y)
  ctx.stroke()
}

const stopDrawing = () => {
  isDrawing.value = false
}

const clearCanvas = () => {
  if (ctx && signatureCanvas.value) {
    ctx.clearRect(0, 0, signatureCanvas.value.width, signatureCanvas.value.height)
    hasDrawn.value = false
  }
}

const saveSignature = () => {
  if (signatureCanvas.value && hasDrawn.value) {
    const dataURL = signatureCanvas.value.toDataURL('image/png')
    emit('update:value', dataURL)
    clearCanvas()
  }
}

const clearSignature = () => {
  emit('update:value', '')
}

const downloadSignature = () => {
  if (props.value) {
    const link = document.createElement('a')
    link.download = 'signature.png'
    link.href = props.value
    link.click()
  }
}
</script>