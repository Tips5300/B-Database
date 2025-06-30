<template>
  <nav class="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 z-50">
    <div class="flex justify-around items-center h-16 px-4">
      <router-link
        v-for="item in navigationItems"
        :key="item.name"
        :to="item.path"
        class="flex flex-col items-center justify-center flex-1 py-2 transition-colors duration-200"
        :class="[
          $route.path === item.path || ($route.path.startsWith(item.path) && item.path !== '/')
            ? 'text-primary-600 dark:text-primary-400'
            : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
        ]"
      >
        <component
          :is="item.icon"
          class="w-6 h-6 mb-1"
        />
        <span class="text-xs font-medium">{{ item.name }}</span>
      </router-link>
    </div>
  </nav>
</template>

<script setup lang="ts">
import {
  HomeIcon,
  ServerStackIcon,
  CogIcon,
  ChartBarIcon,
  UserIcon
} from '@heroicons/vue/24/outline'

const navigationItems = [
  {
    name: 'Home',
    path: '/',
    icon: HomeIcon
  },
  {
    name: 'Databases',
    path: '/databases',
    icon: ServerStackIcon
  },
  {
    name: 'Analytics',
    path: '/analytics',
    icon: ChartBarIcon
  },
  {
    name: 'Settings',
    path: '/settings',
    icon: CogIcon
  },
  {
    name: 'Profile',
    path: '/profile',
    icon: UserIcon
  }
]
</script>