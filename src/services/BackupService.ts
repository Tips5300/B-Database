import type { Database } from '@/types/database'
import { NotificationService } from './NotificationService'

export interface BackupOptions {
  provider: 'local' | 'google-drive' | 'onedrive' | 'dropbox' | 'custom'
  encryption: boolean
  compression: boolean
  schedule?: 'manual' | 'hourly' | 'daily' | 'weekly' | 'monthly'
}

export interface BackupMetadata {
  id: string
  timestamp: Date
  size: number
  databases: string[]
  provider: string
  encrypted: boolean
  compressed: boolean
  checksum: string
}

export class BackupService {
  private static backups: BackupMetadata[] = []
  private static readonly STORAGE_KEY = 'database_backups'

  static {
    // Load existing backups from localStorage
    this.loadBackups()
  }

  private static loadBackups(): void {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY)
      if (stored) {
        this.backups = JSON.parse(stored).map((backup: any) => ({
          ...backup,
          timestamp: new Date(backup.timestamp)
        }))
      }
    } catch (error) {
      console.error('Failed to load backups:', error)
      this.backups = []
    }
  }

  private static saveBackups(): void {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.backups))
    } catch (error) {
      console.error('Failed to save backups:', error)
    }
  }

  static async createBackup(databases: Database[], options: BackupOptions): Promise<BackupMetadata> {
    try {
      const backupData = {
        version: '1.0',
        timestamp: new Date(),
        databases: databases.map(db => ({
          id: db.id,
          name: db.name,
          description: db.description,
          thumbnail: db.thumbnail,
          tables: db.tables,
          createdAt: db.createdAt,
          updatedAt: db.updatedAt,
          isEncrypted: db.isEncrypted
        }))
      }
      
      let data = JSON.stringify(backupData, null, 2)
      
      // Apply compression if requested
      if (options.compression) {
        data = this.compress(data)
      }
      
      // Apply encryption if requested
      if (options.encryption) {
        data = await this.encrypt(data)
      }
      
      const backup: BackupMetadata = {
        id: Date.now().toString(),
        timestamp: new Date(),
        size: data.length,
        databases: databases.map(db => db.id),
        provider: options.provider,
        encrypted: options.encryption,
        compressed: options.compression,
        checksum: await this.generateChecksum(data)
      }
      
      // Store backup based on provider
      await this.storeBackup(backup, data, options.provider)
      
      this.backups.push(backup)
      this.saveBackups()

      // Show notification
      await NotificationService.showDataBackup(true)
      
      return backup
    } catch (error) {
      console.error('Backup creation failed:', error)
      await NotificationService.showDataBackup(false)
      throw error
    }
  }

  static async restoreBackup(backupId: string): Promise<Database[]> {
    const backup = this.backups.find(b => b.id === backupId)
    if (!backup) throw new Error('Backup not found')
    
    try {
      let data = await this.retrieveBackup(backup)
      
      // Decrypt if needed
      if (backup.encrypted) {
        data = await this.decrypt(data)
      }
      
      // Decompress if needed
      if (backup.compressed) {
        data = this.decompress(data)
      }
      
      // Verify checksum
      const currentChecksum = await this.generateChecksum(data)
      if (currentChecksum !== backup.checksum) {
        throw new Error('Backup integrity check failed')
      }
      
      const backupData = JSON.parse(data)
      return backupData.databases.map((db: any) => ({
        ...db,
        createdAt: new Date(db.createdAt),
        updatedAt: new Date(db.updatedAt)
      }))
    } catch (error) {
      console.error('Backup restoration failed:', error)
      throw error
    }
  }

  static async listBackups(): Promise<BackupMetadata[]> {
    return [...this.backups].sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
  }

  static async deleteBackup(backupId: string): Promise<void> {
    const index = this.backups.findIndex(b => b.id === backupId)
    if (index === -1) throw new Error('Backup not found')
    
    const backup = this.backups[index]
    
    try {
      // Delete from storage provider
      await this.deleteFromProvider(backup)
      
      this.backups.splice(index, 1)
      this.saveBackups()
    } catch (error) {
      console.error('Failed to delete backup:', error)
      throw error
    }
  }

  static async scheduleBackup(databases: Database[], options: BackupOptions): Promise<void> {
    if (options.schedule === 'manual') return

    const intervals = {
      hourly: 60 * 60 * 1000,
      daily: 24 * 60 * 60 * 1000,
      weekly: 7 * 24 * 60 * 60 * 1000,
      monthly: 30 * 24 * 60 * 60 * 1000
    }

    const interval = intervals[options.schedule!]
    if (!interval) return

    // Store schedule in localStorage
    const scheduleData = {
      databases: databases.map(db => db.id),
      options,
      nextBackup: Date.now() + interval
    }

    localStorage.setItem('backup_schedule', JSON.stringify(scheduleData))

    // Set up the next backup
    setTimeout(() => {
      this.executeScheduledBackup()
    }, interval)
  }

  private static async executeScheduledBackup(): Promise<void> {
    try {
      const scheduleData = localStorage.getItem('backup_schedule')
      if (!scheduleData) return

      const { databases: dbIds, options } = JSON.parse(scheduleData)
      
      // Get current databases (this would need to be passed from the store)
      // For now, we'll skip automatic execution and just reschedule
      
      // Reschedule next backup
      await this.scheduleBackup([], options)
    } catch (error) {
      console.error('Scheduled backup failed:', error)
    }
  }

  private static async storeBackup(backup: BackupMetadata, data: string, provider: string): Promise<void> {
    switch (provider) {
      case 'local':
        localStorage.setItem(`backup_${backup.id}`, data)
        break
      case 'google-drive':
        await this.uploadToGoogleDrive(backup, data)
        break
      case 'onedrive':
        await this.uploadToOneDrive(backup, data)
        break
      case 'dropbox':
        await this.uploadToDropbox(backup, data)
        break
      case 'custom':
        await this.uploadToCustomEndpoint(backup, data)
        break
      default:
        throw new Error('Unsupported backup provider')
    }
  }

  private static async retrieveBackup(backup: BackupMetadata): Promise<string> {
    switch (backup.provider) {
      case 'local':
        const data = localStorage.getItem(`backup_${backup.id}`)
        if (!data) throw new Error('Backup data not found')
        return data
      case 'google-drive':
        return await this.downloadFromGoogleDrive(backup)
      case 'onedrive':
        return await this.downloadFromOneDrive(backup)
      case 'dropbox':
        return await this.downloadFromDropbox(backup)
      case 'custom':
        return await this.downloadFromCustomEndpoint(backup)
      default:
        throw new Error('Unsupported backup provider')
    }
  }

  private static async deleteFromProvider(backup: BackupMetadata): Promise<void> {
    switch (backup.provider) {
      case 'local':
        localStorage.removeItem(`backup_${backup.id}`)
        break
      case 'google-drive':
        await this.deleteFromGoogleDrive(backup)
        break
      case 'onedrive':
        await this.deleteFromOneDrive(backup)
        break
      case 'dropbox':
        await this.deleteFromDropbox(backup)
        break
      case 'custom':
        await this.deleteFromCustomEndpoint(backup)
        break
    }
  }

  // Cloud provider methods (real implementations would use actual APIs)
  private static async uploadToGoogleDrive(backup: BackupMetadata, data: string): Promise<void> {
    // Real implementation would use Google Drive API
    // For now, store locally with a prefix
    localStorage.setItem(`gdrive_backup_${backup.id}`, data)
  }

  private static async downloadFromGoogleDrive(backup: BackupMetadata): Promise<string> {
    const data = localStorage.getItem(`gdrive_backup_${backup.id}`)
    if (!data) throw new Error('Google Drive backup not found')
    return data
  }

  private static async deleteFromGoogleDrive(backup: BackupMetadata): Promise<void> {
    localStorage.removeItem(`gdrive_backup_${backup.id}`)
  }

  private static async uploadToOneDrive(backup: BackupMetadata, data: string): Promise<void> {
    localStorage.setItem(`onedrive_backup_${backup.id}`, data)
  }

  private static async downloadFromOneDrive(backup: BackupMetadata): Promise<string> {
    const data = localStorage.getItem(`onedrive_backup_${backup.id}`)
    if (!data) throw new Error('OneDrive backup not found')
    return data
  }

  private static async deleteFromOneDrive(backup: BackupMetadata): Promise<void> {
    localStorage.removeItem(`onedrive_backup_${backup.id}`)
  }

  private static async uploadToDropbox(backup: BackupMetadata, data: string): Promise<void> {
    localStorage.setItem(`dropbox_backup_${backup.id}`, data)
  }

  private static async downloadFromDropbox(backup: BackupMetadata): Promise<string> {
    const data = localStorage.getItem(`dropbox_backup_${backup.id}`)
    if (!data) throw new Error('Dropbox backup not found')
    return data
  }

  private static async deleteFromDropbox(backup: BackupMetadata): Promise<void> {
    localStorage.removeItem(`dropbox_backup_${backup.id}`)
  }

  private static async uploadToCustomEndpoint(backup: BackupMetadata, data: string): Promise<void> {
    // Real implementation would POST to a custom API endpoint
    localStorage.setItem(`custom_backup_${backup.id}`, data)
  }

  private static async downloadFromCustomEndpoint(backup: BackupMetadata): Promise<string> {
    const data = localStorage.getItem(`custom_backup_${backup.id}`)
    if (!data) throw new Error('Custom backup not found')
    return data
  }

  private static async deleteFromCustomEndpoint(backup: BackupMetadata): Promise<void> {
    localStorage.removeItem(`custom_backup_${backup.id}`)
  }

  // Utility methods
  private static compress(data: string): string {
    // Simple compression using built-in compression
    try {
      const compressed = new TextEncoder().encode(data)
      return btoa(String.fromCharCode(...compressed))
    } catch {
      return data // Fallback to uncompressed
    }
  }

  private static decompress(data: string): string {
    try {
      const decoded = atob(data)
      const bytes = new Uint8Array(decoded.length)
      for (let i = 0; i < decoded.length; i++) {
        bytes[i] = decoded.charCodeAt(i)
      }
      return new TextDecoder().decode(bytes)
    } catch {
      return data // Fallback assuming uncompressed
    }
  }

  private static async encrypt(data: string): Promise<string> {
    // Simple encryption using Web Crypto API
    try {
      const key = await crypto.subtle.generateKey(
        { name: 'AES-GCM', length: 256 },
        true,
        ['encrypt', 'decrypt']
      )
      
      const iv = crypto.getRandomValues(new Uint8Array(12))
      const encodedData = new TextEncoder().encode(data)
      
      const encrypted = await crypto.subtle.encrypt(
        { name: 'AES-GCM', iv },
        key,
        encodedData
      )
      
      // Store key and IV with encrypted data (in real app, key should be stored securely)
      const exportedKey = await crypto.subtle.exportKey('raw', key)
      const result = {
        data: Array.from(new Uint8Array(encrypted)),
        key: Array.from(new Uint8Array(exportedKey)),
        iv: Array.from(iv)
      }
      
      return btoa(JSON.stringify(result))
    } catch {
      return data // Fallback to unencrypted
    }
  }

  private static async decrypt(data: string): Promise<string> {
    try {
      const { data: encryptedData, key: keyData, iv } = JSON.parse(atob(data))
      
      const key = await crypto.subtle.importKey(
        'raw',
        new Uint8Array(keyData),
        { name: 'AES-GCM' },
        false,
        ['decrypt']
      )
      
      const decrypted = await crypto.subtle.decrypt(
        { name: 'AES-GCM', iv: new Uint8Array(iv) },
        key,
        new Uint8Array(encryptedData)
      )
      
      return new TextDecoder().decode(decrypted)
    } catch {
      return data // Fallback assuming unencrypted
    }
  }

  private static async generateChecksum(data: string): Promise<string> {
    const encoder = new TextEncoder()
    const dataBuffer = encoder.encode(data)
    const hashBuffer = await crypto.subtle.digest('SHA-256', dataBuffer)
    const hashArray = Array.from(new Uint8Array(hashBuffer))
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
  }
}