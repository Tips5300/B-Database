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
    if (this.isInitialized) return this.permission === 'granted'

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
    if (!await this.initialize()) {
      console.warn('Notification permission not granted')
      return null
    }

    try {
      const notification = new Notification(options.title, {
        body: options.body,
        icon: options.icon || '/favicon.ico',
        badge: options.badge || '/favicon.ico',
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
      icon: success ? '/favicon.ico' : '/favicon.ico'
    })
  }

  static async showDataSync(success: boolean = true): Promise<void> {
    await this.show({
      title: success ? 'Data Synced' : 'Sync Failed',
      body: success 
        ? 'Your data has been synchronized successfully.' 
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

  static async showPurchaseSuccess(productName: string): Promise<void> {
    await this.show({
      title: 'Purchase Successful',
      body: `Successfully purchased ${productName}. Thank you!`,
      tag: 'purchase-success'
    })
  }

  static async showAuthenticationRequired(): Promise<void> {
    await this.show({
      title: 'Authentication Required',
      body: 'Please authenticate to continue using the app.',
      tag: 'auth-required',
      requireInteraction: true
    })
  }

  static async showExportComplete(format: string): Promise<void> {
    await this.show({
      title: 'Export Complete',
      body: `Your data has been exported as ${format.toUpperCase()}.`,
      tag: 'export-complete'
    })
  }

  static async showImportComplete(recordCount: number): Promise<void> {
    await this.show({
      title: 'Import Complete',
      body: `Successfully imported ${recordCount} records.`,
      tag: 'import-complete'
    })
  }
}