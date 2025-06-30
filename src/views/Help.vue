<template>
  <div>
    <MobileHeader title="Help & Support" icon="❓" :show-back-button="true" />

    <div class="p-4 space-y-6">
      <!-- Search Help -->
      <div class="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm">
        <div class="relative">
          <input
            v-model="searchQuery"
            type="text"
            placeholder="Search help articles..."
            class="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white"
          />
          <MagnifyingGlassIcon class="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
        </div>
      </div>

      <!-- Quick Help -->
      <Card>
        <template #header>
          <h2 class="text-lg font-semibold text-gray-900 dark:text-white">
            Quick Help
          </h2>
        </template>

        <div class="grid grid-cols-2 gap-3">
          <button v-for="quickHelp in filteredQuickHelp" :key="quickHelp.title" @click="openQuickHelp(quickHelp)"
            class="flex flex-col items-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors">
            <component :is="quickHelp.icon" class="w-8 h-8 text-primary-600 dark:text-primary-400 mb-2" />
            <span class="text-sm font-medium text-gray-900 dark:text-white text-center">
              {{ quickHelp.title }}
            </span>
          </button>
        </div>
      </Card>

      <!-- FAQ -->
      <Card>
        <template #header>
          <h2 class="text-lg font-semibold text-gray-900 dark:text-white">
            Frequently Asked Questions
          </h2>
        </template>

        <div class="space-y-4">
          <div v-for="(faq, index) in filteredFaqs" :key="index"
            class="border-b border-gray-200 dark:border-gray-700 last:border-b-0 pb-4 last:pb-0">
            <button @click="toggleFaq(index)" class="w-full text-left flex items-center justify-between py-2">
              <h3 class="font-medium text-gray-900 dark:text-white">{{ faq.question }}</h3>
              <ChevronDownIcon :class="[
                'w-5 h-5 text-gray-400 transition-transform',
                openFaqs.includes(index) ? 'rotate-180' : ''
              ]" />
            </button>
            <div v-if="openFaqs.includes(index)" class="mt-2 text-sm text-gray-600 dark:text-gray-400">
              {{ faq.answer }}
            </div>
          </div>
        </div>
      </Card>

      <!-- Video Tutorials -->
      <Card>
        <template #header>
          <h2 class="text-lg font-semibold text-gray-900 dark:text-white">
            Video Tutorials
          </h2>
        </template>

        <div class="space-y-3">
          <div v-for="tutorial in tutorials" :key="tutorial.id"
            class="flex items-center space-x-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors cursor-pointer"
            @click="openTutorial(tutorial)">
            <div class="w-12 h-12 bg-red-100 dark:bg-red-900/20 rounded-lg flex items-center justify-center">
              <PlayIcon class="w-6 h-6 text-red-600 dark:text-red-400" />
            </div>
            <div class="flex-1">
              <h4 class="font-medium text-gray-900 dark:text-white">{{ tutorial.title }}</h4>
              <p class="text-sm text-gray-500 dark:text-gray-400">{{ tutorial.duration }}</p>
            </div>
          </div>
        </div>
      </Card>

      <!-- Contact Support -->
      <Card>
        <template #header>
          <h2 class="text-lg font-semibold text-gray-900 dark:text-white">
            Contact Support
          </h2>
        </template>

        <div class="space-y-4">
          <button @click="sendEmail"
            class="w-full flex items-center space-x-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors">
            <EnvelopeIcon class="w-5 h-5 text-gray-400" />
            <div class="text-left">
              <div class="font-medium text-gray-900 dark:text-white">Email Support</div>
              <div class="text-sm text-gray-500 dark:text-gray-400">Get help via email</div>
            </div>
          </button>

          <button @click="openLiveChat"
            class="w-full flex items-center space-x-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors">
            <ChatBubbleLeftRightIcon class="w-5 h-5 text-gray-400" />
            <div class="text-left">
              <div class="font-medium text-gray-900 dark:text-white">Live Chat</div>
              <div class="text-sm text-gray-500 dark:text-gray-400">Chat with our support team</div>
            </div>
          </button>

          <button @click="reportBug"
            class="w-full flex items-center space-x-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors">
            <BugAntIcon class="w-5 h-5 text-gray-400" />
            <div class="text-left">
              <div class="font-medium text-gray-900 dark:text-white">Report a Bug</div>
              <div class="text-sm text-gray-500 dark:text-gray-400">Help us improve the app</div>
            </div>
          </button>

          <button @click="requestFeature"
            class="w-full flex items-center space-x-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors">
            <LightBulbIcon class="w-5 h-5 text-gray-400" />
            <div class="text-left">
              <div class="font-medium text-gray-900 dark:text-white">Request Feature</div>
              <div class="text-sm text-gray-500 dark:text-gray-400">Suggest new features</div>
            </div>
          </button>
        </div>
      </Card>

      <!-- App Info -->
      <Card>
        <template #header>
          <h2 class="text-lg font-semibold text-gray-900 dark:text-white">
            App Information
          </h2>
        </template>

        <div class="space-y-3 text-sm">
          <div class="flex justify-between">
            <span class="text-gray-600 dark:text-gray-400">Version</span>
            <span class="text-gray-900 dark:text-white">1.0.0</span>
          </div>
          <div class="flex justify-between">
            <span class="text-gray-600 dark:text-gray-400">Build</span>
            <span class="text-gray-900 dark:text-white">2024.01.15</span>
          </div>
          <div class="flex justify-between">
            <span class="text-gray-600 dark:text-gray-400">Platform</span>
            <span class="text-gray-900 dark:text-white">{{ getPlatform() }}</span>
          </div>
          <div class="flex justify-between">
            <span class="text-gray-600 dark:text-gray-400">Last Updated</span>
            <span class="text-gray-900 dark:text-white">{{ getLastUpdated() }}</span>
          </div>
        </div>
      </Card>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useToastStore } from '@/stores/toast'
import {
  ChevronDownIcon,
  EnvelopeIcon,
  ChatBubbleLeftRightIcon,
  BugAntIcon,
  LightBulbIcon,
  BookOpenIcon,
  PlayIcon,
  QuestionMarkCircleIcon,
  CogIcon,
  MagnifyingGlassIcon
} from '@heroicons/vue/24/outline'
import MobileHeader from '@/components/Navigation/MobileHeader.vue'
import Card from '@/components/UI/Card.vue'

const toastStore = useToastStore()

const searchQuery = ref('')
const openFaqs = ref<number[]>([])

const quickHelpItems = [
  {
    title: 'Getting Started',
    icon: BookOpenIcon,
    action: 'getting-started',
    keywords: ['start', 'begin', 'new', 'first', 'setup']
  },
  {
    title: 'Video Tutorials',
    icon: PlayIcon,
    action: 'tutorials',
    keywords: ['video', 'tutorial', 'learn', 'watch', 'guide']
  },
  {
    title: 'User Guide',
    icon: QuestionMarkCircleIcon,
    action: 'user-guide',
    keywords: ['guide', 'manual', 'documentation', 'help']
  },
  {
    title: 'Settings Help',
    icon: CogIcon,
    action: 'settings-help',
    keywords: ['settings', 'configuration', 'preferences', 'options']
  }
]

const faqs = [
  {
    question: 'How do I create my first database?',
    answer: 'Tap the "+" button on the Databases screen, enter a name and description, then tap "Create Database". You can then add tables and fields to organize your data.',
    keywords: ['create', 'database', 'new', 'first', 'add']
  },
  {
    question: 'What field types are available?',
    answer: 'We support text, numbers, dates, images, files, relationships, and many more field types. Premium plans include advanced field types like JSON, geometry, and custom validations.',
    keywords: ['field', 'types', 'text', 'number', 'date', 'image', 'file']
  },
  {
    question: 'How do I backup my data?',
    answer: 'Go to Settings > Data Management and tap "Export All Data". Premium users get automatic cloud backup. You can also manually export individual databases.',
    keywords: ['backup', 'export', 'save', 'data', 'cloud']
  },
  {
    question: 'Can I import data from other apps?',
    answer: 'Yes! You can import CSV, JSON, and SQL files. Go to Settings > Data Management > Import Data to get started.',
    keywords: ['import', 'csv', 'json', 'sql', 'data', 'file']
  },
  {
    question: 'Is my data secure?',
    answer: 'Absolutely. All data is stored locally on your device by default. Premium plans include encryption and secure cloud backup options.',
    keywords: ['secure', 'security', 'encryption', 'safe', 'privacy']
  },
  {
    question: 'How do relationships work?',
    answer: 'Relationships link records between tables. For example, you can link a "Customer" to multiple "Orders". We support one-to-one, one-to-many, and many-to-many relationships.',
    keywords: ['relationship', 'link', 'connect', 'reference', 'foreign']
  },
  {
    question: 'What happens if I reach my plan limits?',
    answer: 'You\'ll receive notifications as you approach limits. If you exceed them, you can upgrade your plan or remove some data to stay within limits.',
    keywords: ['limits', 'plan', 'upgrade', 'storage', 'quota']
  },
  {
    question: 'Can I use the app offline?',
    answer: 'Yes! The app works completely offline. Your data is stored locally and syncs when you\'re back online (Premium feature).',
    keywords: ['offline', 'sync', 'local', 'internet', 'connection']
  }
]

const tutorials = [
  {
    id: 1,
    title: 'Getting Started with Database Manager',
    duration: '5:30',
    url: 'https://example.com/tutorial1'
  },
  {
    id: 2,
    title: 'Creating Your First Database',
    duration: '3:45',
    url: 'https://example.com/tutorial2'
  },
  {
    id: 3,
    title: 'Working with Field Types',
    duration: '7:20',
    url: 'https://example.com/tutorial3'
  },
  {
    id: 4,
    title: 'Setting Up Relationships',
    duration: '6:15',
    url: 'https://example.com/tutorial4'
  },
  {
    id: 5,
    title: 'Data Import and Export',
    duration: '4:50',
    url: 'https://example.com/tutorial5'
  }
]

const filteredQuickHelp = computed(() => {
  if (!searchQuery.value) return quickHelpItems
  
  const query = searchQuery.value.toLowerCase()
  return quickHelpItems.filter(item => 
    item.title.toLowerCase().includes(query) ||
    item.keywords.some(keyword => keyword.includes(query))
  )
})

const filteredFaqs = computed(() => {
  if (!searchQuery.value) return faqs
  
  const query = searchQuery.value.toLowerCase()
  return faqs.filter(faq => 
    faq.question.toLowerCase().includes(query) ||
    faq.answer.toLowerCase().includes(query) ||
    faq.keywords.some(keyword => keyword.includes(query))
  )
})

const toggleFaq = (index: number) => {
  const faqIndex = openFaqs.value.indexOf(index)
  if (faqIndex > -1) {
    openFaqs.value.splice(faqIndex, 1)
  } else {
    openFaqs.value.push(index)
  }
}

const openQuickHelp = (item: any) => {
  switch (item.action) {
    case 'getting-started':
      window.open('https://docs.example.com/getting-started', '_blank')
      break
    case 'tutorials':
      window.open('https://docs.example.com/tutorials', '_blank')
      break
    case 'user-guide':
      window.open('https://docs.example.com/user-guide', '_blank')
      break
    case 'settings-help':
      window.open('https://docs.example.com/settings', '_blank')
      break
  }
  toastStore.success('Opening help documentation')
}

const openTutorial = (tutorial: any) => {
  window.open(tutorial.url, '_blank')
  toastStore.success(`Opening tutorial: ${tutorial.title}`)
}

const sendEmail = () => {
  const subject = encodeURIComponent('Database Manager Support Request')
  const body = encodeURIComponent(`Please describe your issue or question:

App Version: 1.0.0
Platform: ${getPlatform()}
Date: ${new Date().toISOString()}

Issue Description:
`)
  window.location.href = `mailto:support@example.com?subject=${subject}&body=${body}`
}

const openLiveChat = () => {
  // In a real implementation, this would open a chat widget
  window.open('https://support.example.com/chat', '_blank')
  toastStore.success('Opening live chat support')
}

const reportBug = () => {
  const subject = encodeURIComponent('Bug Report - Database Manager')
  const body = encodeURIComponent(`Bug Report:

App Version: 1.0.0
Platform: ${getPlatform()}
Date: ${new Date().toISOString()}

Steps to reproduce:
1. 
2. 
3. 

Expected behavior:


Actual behavior:


Additional information:
`)
  window.location.href = `mailto:bugs@example.com?subject=${subject}&body=${body}`
}

const requestFeature = () => {
  const subject = encodeURIComponent('Feature Request - Database Manager')
  const body = encodeURIComponent(`Feature Request:

App Version: 1.0.0
Platform: ${getPlatform()}
Date: ${new Date().toISOString()}

Feature Description:


Use Case:


Why this would be helpful:


Additional details:
`)
  window.location.href = `mailto:features@example.com?subject=${subject}&body=${body}`
}

const getPlatform = () => {
  const userAgent = navigator.userAgent
  if (userAgent.includes('iPhone') || userAgent.includes('iPad')) return 'iOS'
  if (userAgent.includes('Android')) return 'Android'
  if (userAgent.includes('Mac')) return 'macOS'
  if (userAgent.includes('Windows')) return 'Windows'
  if (userAgent.includes('Linux')) return 'Linux'
  return 'Web'
}

const getLastUpdated = () => {
  return new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}
</script>