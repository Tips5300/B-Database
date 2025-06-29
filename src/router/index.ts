import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    // Authentication Routes
    {
      path: '/auth',
      name: 'auth',
      component: () => import('@/views/Auth/AuthScreen.vue'),
      meta: { requiresGuest: true }
    },
    {
      path: '/setup',
      name: 'setup',
      component: () => import('@/views/Auth/SetupScreen.vue'),
      meta: { requiresGuest: true }
    },
    
    // Main App Routes
    {
      path: '/',
      name: 'dashboard',
      component: () => import('@/views/Dashboard.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/databases',
      name: 'databases',
      component: () => import('@/views/DatabaseManager.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/database/:id',
      name: 'database-detail',
      component: () => import('@/views/DatabaseDetail.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/database/:id/table/:tableId',
      name: 'table-editor',
      component: () => import('@/views/TableEditor.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/analytics',
      name: 'analytics',
      component: () => import('@/views/Analytics.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/settings',
      name: 'settings',
      component: () => import('@/views/Settings.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/profile',
      name: 'profile',
      component: () => import('@/views/Profile.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/subscription',
      name: 'subscription',
      component: () => import('@/views/Subscription.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/help',
      name: 'help',
      component: () => import('@/views/Help.vue'),
      meta: { requiresAuth: true }
    },
    
    // Catch all route
    {
      path: '/:pathMatch(.*)*',
      name: 'not-found',
      redirect: '/'
    }
  ]
})

router.beforeEach(async (to, from, next) => {
  const authStore = useAuthStore()
  
  // Wait for auth initialization if not already done
  if (!authStore.isInitialized) {
    await authStore.initializeAuth()
  }
  
  const requiresAuth = to.matched.some(record => record.meta.requiresAuth)
  const requiresGuest = to.matched.some(record => record.meta.requiresGuest)
  
  // Handle authentication requirements
  if (requiresAuth) {
    if (!authStore.hasAuthSetup) {
      // No auth setup, redirect to setup
      if (to.path !== '/setup') {
        next('/setup')
        return
      }
    } else if (!authStore.isAuthenticated) {
      // Has auth setup but not authenticated, redirect to auth
      if (to.path !== '/auth') {
        next('/auth')
        return
      }
    }
    // User is authenticated or already on correct auth route, proceed
    next()
  } else if (requiresGuest) {
    if (authStore.isAuthenticated) {
      // Already authenticated, redirect to dashboard
      next('/')
      return
    }
    // Not authenticated, proceed to guest route
    next()
  } else {
    // No auth requirements, proceed
    next()
  }
})

export default router