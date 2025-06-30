export interface User {
  id: string
  email: string
  name: string
  avatar?: string
  plan: SubscriptionPlan
  createdAt: Date
  lastLogin: Date
}

export interface AuthCredentials {
  email: string
  password: string
  rememberMe?: boolean
}

export interface BiometricAuthOptions {
  enabled: boolean
  type: 'fingerprint' | 'face' | 'voice'
  fallbackToPIN: boolean
}

export interface SecuritySettings {
  sessionTimeout: number
  requireReauth: boolean
  biometric: BiometricAuthOptions
  pinCode?: string
  autoLock: boolean
  lockTimeout: number
}

export enum SubscriptionPlan {
  FREE = 'free',
  PREMIUM = 'premium',
  PROFESSIONAL = 'professional',
  ENTERPRISE = 'enterprise'
}

export interface PlanLimits {
  maxDatabases: number
  maxTables: number
  maxRecords: number
  storageLimit: number
  backupRetention: number
  apiCalls: number
  collaborators: number
  features: string[]
}

export interface PlanFeatures {
  [key: string]: string[]
}

export interface UsageStats {
  databases: number
  tables: number
  records: number
  storage: number
  exports: number
}