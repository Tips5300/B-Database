export interface NotificationOptions {
  title: string
  body: string
  icon?: string
  badge?: string
  tag?: string
  requireInteraction?: boolean
  actions?: NotificationAction[]
  data?: any
}

export interface NotificationAction {
  action: string
  title: string
  icon?: string
}

export class NotificationService {
  private static permission: NotificationPermission = 'default'
  private static isInitialized = false

  static async initialize(): Promise<boolean> {
    if (this.isInitialized) {
      return this.permission === 'granted'
    }

    if (!('Notification' in window)) {
      console.warn('This browser does not support notifications')
      return false
    }

    this.permission = Notification.permission

    if (this.permission === 'default') {
      this.permission = await Notification.requestPermission()
    }

    this.isInitialized = true
    return this.permission === 'granted'
  }

  static async show(options: NotificationOptions): Promise<Notification | null> {
    if (this.permission !== 'granted') {
      console.warn('Notification permission not granted')
      return null
    }

    try {
      const notification = new Notification(options.title, {
        body: options.body,
        icon: options.icon || '/icon-192x192.png',
        badge: options.badge || '/icon-192x192.png',
        tag: options.tag,
        requireInteraction: options.requireInteraction,
        actions: options.actions,
        data: options.data
      })

      // Auto-close after 5 seconds unless requireInteraction is true
      if (!options.requireInteraction) {
        setTimeout(() => {
          notification.close()
        }, 5000)
      }

      return notification
    } catch (error) {
      console.error('Failed to show notification:', error)
      return null
    }
  }

  static async showDataBackup(success: boolean = true): Promise<void> {
    await this.show({
      title: success ? 'Backup Complete' : 'Backup Failed',
      body: success 
        ? 'Your database has been successfully backed up.' 
        : 'Failed to backup your database. Please try again.',
      tag: 'backup',
      icon: success ? '/icon-192x192.png' : undefined
    })
  }

  static async showDataSync(success: boolean = true): Promise<void> {
    await this.show({
      title: success ? 'Data Synced' : 'Sync Failed',
      body: success 
        ? 'Your data has been synchronized across devices.' 
        : 'Failed to sync your data. Check your connection.',
      tag: 'sync'
    })
  }

  static async showLowStorage(): Promise<void> {
    await this.show({
      title: 'Storage Warning',
      body: 'You are running low on storage space. Consider upgrading your plan.',
      tag: 'storage',
      requireInteraction: true,
      actions: [
        { action: 'upgrade', title: 'Upgrade Plan' },
        { action: 'dismiss', title: 'Dismiss' }
      ]
    })
  }

  static async showRecordAdded(tableName: string): Promise<void> {
    await this.show({
      title: 'Record Added',
      body: `New record added to ${tableName}`,
      tag: 'record-added'
    })
  }

  static async showImportComplete(recordCount: number): Promise<void> {
    await this.show({
      title: 'Import Complete',
      body: `Successfully imported ${recordCount} records`,
      tag: 'import-complete'
    })
  }

  static async showExportComplete(fileName: string): Promise<void> {
    await this.show({
      title: 'Export Complete',
      body: `Data exported to ${fileName}`,
      tag: 'export-complete'
    })
  }

  static async showAuthenticationRequired(): Promise<void> {
    await this.show({
      title: 'Authentication Required',
      body: 'Please authenticate to continue using the app',
      tag: 'auth-required',
      requireInteraction: true
    })
  }

  static async showPlanLimitReached(limitType: string): Promise<void> {
    await this.show({
      title: 'Plan Limit Reached',
      body: `You've reached your ${limitType} limit. Upgrade to continue.`,
      tag: 'plan-limit',
      requireInteraction: true,
      actions: [
        { action: 'upgrade', title: 'Upgrade Now' },
        { action: 'dismiss', title: 'Later' }
      ]
    })
  }

  static async showUpdateAvailable(): Promise<void> {
    await this.show({
      title: 'Update Available',
      body: 'A new version of the app is available. Tap to update.',
      tag: 'update-available',
      requireInteraction: true,
      actions: [
        { action: 'update', title: 'Update Now' },
        { action: 'later', title: 'Later' }
      ]
    })
  }

  static async showOfflineMode(): Promise<void> {
    await this.show({
      title: 'Offline Mode',
      body: 'You are now working offline. Changes will sync when connection is restored.',
      tag: 'offline-mode'
    })
  }

  static async showOnlineMode(): Promise<void> {
    await this.show({
      title: 'Back Online',
      body: 'Connection restored. Syncing your changes...',
      tag: 'online-mode'
    })
  }

  static getPermissionStatus(): NotificationPermission {
    return this.permission
  }

  static isSupported(): boolean {
    return 'Notification' in window
  }
}