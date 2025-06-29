<script setup lang="ts">
import TheWelcome from '../components/TheWelcome.vue'
</script>

<template>
  <main>
    <div class="w-16 h-16 text-indigo-600 dark:text-indigo-300">
<img src="@/assets/logo.svg" alt="Logo" class="w-full h-full" />
    </div>

    <div class="text-center mt-4">
      <h1 class="text-2xl font-bold text-gray-900 dark:text-gray-100">Welcome to B-Database</h1>
      <p class="text-gray-600 dark:text-gray-400">Your personal database management system</p>
</div>

    <TheWelcome />
  </main>
</template>
