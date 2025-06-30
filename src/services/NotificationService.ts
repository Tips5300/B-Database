export interface NotificationOptions {
  title: string
  body: string
  icon?: string
  badge?: string
  tag?: string
  requireInteraction?: boolean
  actions?: NotificationAction[]
}

export class NotificationService {
  private static permission: NotificationPermission = 'default'

  static async initialize(): Promise<boolean> {
    if (!('Notification' in window)) {
      console.warn('This browser does not support notifications')
      return false
    }

    this.permission = Notification.permission

    if (this.permission === 'default') {
      this.permission = await Notification.requestPermission()
    }

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
        actions: options.actions
      })

      return notification
    } catch (error) {
      console.error('Failed to show notification:', error)
      return null
    }
  }

  static async showDataBackup(): Promise<void> {
    await this.show({
      title: 'Data Backup Complete',
      body: 'Your database has been successfully backed up.',
      tag: 'backup'
    })
  }

  static async showDataSync(): Promise<void> {
    await this.show({
      title: 'Data Synced',
      body: 'Your data has been synchronized across devices.',
      tag: 'sync'
    })
  }

  static async showLowStorage(): Promise<void> {
    await this.show({
      title: 'Storage Warning',
      body: 'You are running low on storage space. Consider upgrading your plan.',
      tag: 'storage',
      requireInteraction: true
    })
  }

  static async showRecordAdded(tableName: string): Promise<void> {
    await this.show({
      title: 'Record Added',
      body: `New record added to ${tableName}`,
      tag: 'record-added'
    })
  }
}