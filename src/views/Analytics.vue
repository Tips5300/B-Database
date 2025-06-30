<template>
  <div>
    <MobileHeader title="Analytics" icon="📊" :show-menu="true" @menu="handleMenu" />

    <div class="p-4 space-y-6">
      <!-- Overview Cards -->
      <div class="grid grid-cols-2 gap-4">
        <div class="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm">
          <div class="text-center">
            <div class="text-2xl font-bold text-primary-600 dark:text-primary-400">
              {{ databaseStore.stats.totalDatabases }}
            </div>
            <div class="text-sm text-gray-500 dark:text-gray-400">Total Databases</div>
          </div>
        </div>

        <div class="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm">
          <div class="text-center">
            <div class="text-2xl font-bold text-green-600 dark:text-green-400">
              {{ databaseStore.stats.totalRecords }}
            </div>
            <div class="text-sm text-gray-500 dark:text-gray-400">Total Records</div>
          </div>
        </div>

        <div class="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm">
          <div class="text-center">
            <div class="text-2xl font-bold text-blue-600 dark:text-blue-400">
              {{ databaseStore.stats.totalTables }}
            </div>
            <div class="text-sm text-gray-500 dark:text-gray-400">Total Tables</div>
          </div>
        </div>

        <div class="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm">
          <div class="text-center">
            <div class="text-2xl font-bold text-purple-600 dark:text-purple-400">
              {{ formatBytes(databaseStore.stats.storageUsed) }}
            </div>
            <div class="text-sm text-gray-500 dark:text-gray-400">Storage Used</div>
          </div>
        </div>
      </div>

      <!-- Database Breakdown -->
      <div class="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm">
        <h2 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Database Breakdown
        </h2>

        <div v-if="databaseStore.databases.length === 0" class="text-center py-8">
          <ChartBarIcon class="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p class="text-gray-500 dark:text-gray-400">No data to analyze yet</p>
        </div>

        <div v-else class="space-y-4">
          <div v-for="database in databaseStore.databases" :key="database.id"
            class="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <div class="flex items-center space-x-3">
              <div class="w-10 h-10 bg-gray-200 dark:bg-gray-600 rounded-lg overflow-hidden">
                <img v-if="database.thumbnail" :src="database.thumbnail" :alt="database.name"
                  class="w-full h-full object-cover" />
                <div v-else class="w-full h-full flex items-center justify-center text-lg">
                  📊
                </div>
              </div>
              <div>
                <h3 class="font-medium text-gray-900 dark:text-white">
                  {{ database.name }}
                </h3>
                <p class="text-sm text-gray-500 dark:text-gray-400">
                  {{ database.tables?.length || 0 }} tables
                </p>
              </div>
            </div>
            <div class="text-right">
              <div class="font-semibold text-gray-900 dark:text-white">
                {{ getTotalRecords(database) }}
              </div>
              <div class="text-sm text-gray-500 dark:text-gray-400">records</div>
            </div>
          </div>
        </div>
      </div>

      <!-- Usage Trends -->
      <div class="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm">
        <h2 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Usage Trends
        </h2>

        <div class="space-y-4">
          <div class="flex items-center justify-between">
            <span class="text-gray-600 dark:text-gray-400">Most Active Database</span>
            <span class="font-medium text-gray-900 dark:text-white">
              {{ getMostActiveDatabase() }}
            </span>
          </div>

          <div class="flex items-center justify-between">
            <span class="text-gray-600 dark:text-gray-400">Largest Table</span>
            <span class="font-medium text-gray-900 dark:text-white">
              {{ getLargestTable() }}
            </span>
          </div>

          <div class="flex items-center justify-between">
            <span class="text-gray-600 dark:text-gray-400">Last Backup</span>
            <span class="font-medium text-gray-900 dark:text-white">
              {{ formatDate(databaseStore.stats.lastBackup) }}
            </span>
          </div>
        </div>
      </div>

      <!-- Quick Actions -->
      <div class="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm">
        <h2 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Quick Actions
        </h2>

        <div class="grid grid-cols-2 gap-3">
          <button @click="exportAnalytics"
            class="flex flex-col items-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors">
            <ArrowDownTrayIcon class="w-6 h-6 text-blue-600 dark:text-blue-400 mb-2" />
            <span class="text-sm font-medium text-blue-600 dark:text-blue-400">
              Export Report
            </span>
          </button>

          <button @click="scheduleBackup"
            class="flex flex-col items-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg hover:bg-green-100 dark:hover:bg-green-900/30 transition-colors">
            <CloudArrowUpIcon class="w-6 h-6 text-green-600 dark:text-green-400 mb-2" />
            <span class="text-sm font-medium text-green-600 dark:text-green-400">
              Backup Now
            </span>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useDatabaseStore } from '@/stores/database'
import { useToastStore } from '@/stores/toast'
import type { Database } from '@/database/entities/Database'
import {
  ChartBarIcon,
  ArrowDownTrayIcon,
  CloudArrowUpIcon
} from '@heroicons/vue/24/outline'
import MobileHeader from '@/components/Navigation/MobileHeader.vue'

const databaseStore = useDatabaseStore()
const toastStore = useToastStore()

const formatBytes = (bytes: number) => {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i]
}

const getTotalRecords = (database: Database) => {
  return database.tables?.reduce((total, table) => total + (table.records?.length || 0), 0) || 0
}

const getMostActiveDatabase = () => {
  if
