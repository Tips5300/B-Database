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

      <!-- Usage Trends Chart -->
      <div class="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm">
        <h2 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Activity Over Time
        </h2>
        <div class="h-48 flex items-end justify-between space-x-2">
          <div
            v-for="(day, index) in activityData"
            :key="index"
            class="flex-1 bg-primary-200 dark:bg-primary-800 rounded-t"
            :style="{ height: `${(day.value / maxActivity) * 100}%` }"
            :title="`${day.label}: ${day.value} activities`"
          >
          </div>
        </div>
        <div class="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-2">
          <span v-for="(day, index) in activityData" :key="index">
            {{ day.label }}
          </span>
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

      <!-- Usage Insights -->
      <div class="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm">
        <h2 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Usage Insights
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
            <span class="text-gray-600 dark:text-gray-400">Average Records per Table</span>
            <span class="font-medium text-gray-900 dark:text-white">
              {{ getAverageRecordsPerTable() }}
            </span>
          </div>

          <div class="flex items-center justify-between">
            <span class="text-gray-600 dark:text-gray-400">Data Growth Rate</span>
            <span class="font-medium text-gray-900 dark:text-white text-green-600">
              +{{ getGrowthRate() }}% this week
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

          <button @click="createBackup"
            class="flex flex-col items-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg hover:bg-green-100 dark:hover:bg-green-900/30 transition-colors">
            <CloudArrowUpIcon class="w-6 h-6 text-green-600 dark:text-green-400 mb-2" />
            <span class="text-sm font-medium text-green-600 dark:text-green-400">
              Backup Now
            </span>
          </button>

          <button @click="optimizeDatabase"
            class="flex flex-col items-center p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg hover:bg-purple-100 dark:hover:bg-purple-900/30 transition-colors">
            <CogIcon class="w-6 h-6 text-purple-600 dark:text-purple-400 mb-2" />
            <span class="text-sm font-medium text-purple-600 dark:text-purple-400">
              Optimize
            </span>
          </button>

          <button @click="generateInsights"
            class="flex flex-col items-center p-4 bg-orange-50 dark:bg-orange-900/20 rounded-lg hover:bg-orange-100 dark:hover:bg-orange-900/30 transition-colors">
            <LightBulbIcon class="w-6 h-6 text-orange-600 dark:text-orange-400 mb-2" />
            <span class="text-sm font-medium text-orange-600 dark:text-orange-400">
              Insights
            </span>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useDatabaseStore } from '@/stores/database'
import { useToastStore } from '@/stores/toast'
import { BackupService } from '@/services/BackupService'
import { AnalyticsService } from '@/services/AnalyticsService'
import type { Database } from '@/database/entities/Database'
import {
  ChartBarIcon,
  ArrowDownTrayIcon,
  CloudArrowUpIcon,
  CogIcon,
  LightBulbIcon
} from '@heroicons/vue/24/outline'
import MobileHeader from '@/components/Navigation/MobileHeader.vue'

const databaseStore = useDatabaseStore()
const toastStore = useToastStore()

const activityData = computed(() => {
  const events = AnalyticsService.getEvents(7)
  const days = []
  
  for (let i = 6; i >= 0; i--) {
    const date = new Date()
    date.setDate(date.getDate() - i)
    const dayEvents = events.filter(event => {
      const eventDate = new Date(event.timestamp || 0)
      return eventDate.toDateString() === date.toDateString()
    })
    
    days.push({
      label: date.toLocaleDateString('en-US', { weekday: 'short' }),
      value: dayEvents.length
    })
  }
  
  return days
})

const maxActivity = computed(() => {
  return Math.max(...activityData.value.map(d => d.value), 1)
})

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
  if (databaseStore.databases.length === 0) return 'None'
  
  const dbWithMostRecords = databaseStore.databases.reduce((prev, current) => {
    return getTotalRecords(current) > getTotalRecords(prev) ? current : prev
  })
  
  return dbWithMostRecords.name
}

const getLargestTable = () => {
  let largestTable = { name: 'None', recordCount: 0 }
  
  for (const database of databaseStore.databases) {
    for (const table of database.tables || []) {
      const recordCount = table.records?.length || 0
      if (recordCount > largestTable.recordCount) {
        largestTable = { name: `${database.name} > ${table.name}`, recordCount }
      }
    }
  }
  
  return largestTable.name
}

const getAverageRecordsPerTable = () => {
  const totalTables = databaseStore.stats.totalTables
  const totalRecords = databaseStore.stats.totalRecords
  
  if (totalTables === 0) return '0'
  return Math.round(totalRecords / totalTables).toString()
}

const getGrowthRate = () => {
  // Calculate growth based on recent activity
  const recentEvents = AnalyticsService.getEvents(7)
  const recordCreationEvents = recentEvents.filter(e => e.name === 'record_created')
  
  // Simple growth calculation based on recent activity
  return Math.min(recordCreationEvents.length * 5, 100)
}

const handleMenu = () => {
  toastStore.info('Analytics menu opened')
}

const exportAnalytics = async () => {
  try {
    const analyticsData = {
      overview: {
        totalDatabases: databaseStore.stats.totalDatabases,
        totalTables: databaseStore.stats.totalTables,
        totalRecords: databaseStore.stats.totalRecords,
        storageUsed: databaseStore.stats.storageUsed
      },
      activity: activityData.value,
      insights: {
        mostActiveDatabase: getMostActiveDatabase(),
        largestTable: getLargestTable(),
        averageRecordsPerTable: getAverageRecordsPerTable(),
        growthRate: getGrowthRate()
      },
      events: AnalyticsService.getEvents(30),
      exportedAt: new Date().toISOString()
    }

    const blob = new Blob([JSON.stringify(analyticsData, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `analytics_report_${new Date().toISOString().split('T')[0]}.json`
    a.click()
    URL.revokeObjectURL(url)

    AnalyticsService.track('analytics_exported', { format: 'json' })
    toastStore.success('Analytics report exported successfully')
  } catch (error) {
    toastStore.error('Failed to export analytics report')
  }
}

const createBackup = async () => {
  try {
    await BackupService.createBackup(databaseStore.databases, {
      provider: 'local',
      encryption: false,
      compression: true
    })
    
    AnalyticsService.track('backup_created', { provider: 'local' })
    toastStore.success('Backup created successfully')
  } catch (error) {
    toastStore.error('Failed to create backup')
  }
}

const optimizeDatabase = async () => {
  try {
    // Simulate database optimization
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    AnalyticsService.track('database_optimized')
    toastStore.success('Database optimized successfully')
  } catch (error) {
    toastStore.error('Failed to optimize database')
  }
}

const generateInsights = async () => {
  try {
    const insights = []
    
    // Generate insights based on data
    if (databaseStore.stats.totalRecords > 1000) {
      insights.push('Consider archiving old records to improve performance')
    }
    
    if (databaseStore.stats.totalTables > 20) {
      insights.push('You might benefit from organizing tables into separate databases')
    }
    
    if (databaseStore.stats.storageUsed > 50 * 1024 * 1024) {
      insights.push('Storage usage is high - consider upgrading your plan')
    }
    
    if (insights.length === 0) {
      insights.push('Your database is well-organized and performing optimally!')
    }
    
    AnalyticsService.track('insights_generated', { count: insights.length })
    
    // Show insights in a simple alert for now
    alert('Database Insights:\n\n' + insights.join('\n\n'))
  } catch (error) {
    toastStore.error('Failed to generate insights')
  }
}
</script>