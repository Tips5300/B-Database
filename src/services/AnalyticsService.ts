export interface AnalyticsEvent {
  name: string
  properties?: Record<string, any>
  timestamp?: Date
  userId?: string
  sessionId?: string
}

export interface UsageStats {
  dailyActiveUsers: number
  totalDatabases: number
  totalTables: number
  totalRecords: number
  storageUsed: number
  apiCalls: number
  errorRate: number
  averageSessionDuration: number
  topFeatures: { name: string; usage: number }[]
  deviceInfo: {
    platform: string
    browser: string
    version: string
  }
}

export interface AnalyticsReport {
  period: string
  totalEvents: number
  uniqueUsers: number
  topEvents: { name: string; count: number }[]
  userEngagement: {
    averageSessionTime: number
    bounceRate: number
    returnUserRate: number
  }
  featureUsage: { feature: string; usage: number }[]
  errorAnalysis: {
    totalErrors: number
    topErrors: { error: string; count: number }[]
  }
}

export class AnalyticsService {
  private static events: AnalyticsEvent[] = []
  private static sessionId: string = ''
  private static sessionStart: number = 0
  private static userId: string = ''

  static initialize(userId?: string): void {
    this.userId = userId || this.generateUserId()
    this.sessionId = this.generateSessionId()
    this.sessionStart = Date.now()
    
    // Load stored events
    this.loadStoredEvents()
    
    // Track session start
    this.track('session_start', {
      platform: this.getPlatform(),
      browser: this.getBrowser(),
      viewport: `${window.innerWidth}x${window.innerHeight}`,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
    })

    // Track page visibility changes
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        this.track('session_pause')
      } else {
        this.track('session_resume')
      }
    })

    // Track session end on beforeunload
    window.addEventListener('beforeunload', () => {
      this.track('session_end', {
        duration: Date.now() - this.sessionStart
      })
      this.saveEvents()
    })
  }

  static track(eventName: string, properties?: Record<string, any>): void {
    const event: AnalyticsEvent = {
      name: eventName,
      properties: {
        ...properties,
        url: window.location.pathname,
        referrer: document.referrer,
        userAgent: navigator.userAgent
      },
      timestamp: new Date(),
      userId: this.userId,
      sessionId: this.sessionId
    }

    this.events.push(event)
    
    // Auto-save events periodically
    if (this.events.length % 10 === 0) {
      this.saveEvents()
    }
  }

  static getEvents(days: number = 7): AnalyticsEvent[] {
    const cutoffDate = new Date()
    cutoffDate.setDate(cutoffDate.getDate() - days)

    return this.events.filter(event => 
      new Date(event.timestamp || 0) >= cutoffDate
    )
  }

  static getUsageStats(): UsageStats {
    const events = this.getEvents(30) // Last 30 days
    
    return {
      dailyActiveUsers: this.getUniqueUsers(1),
      totalDatabases: this.countEvents('database_created'),
      totalTables: this.countEvents('table_created'),
      totalRecords: this.countEvents('record_created'),
      storageUsed: this.calculateStorageUsed(),
      apiCalls: this.countEvents('api_call'),
      errorRate: this.calculateErrorRate(),
      averageSessionDuration: this.calculateAverageSessionDuration(),
      topFeatures: this.getTopFeatures(),
      deviceInfo: {
        platform: this.getPlatform(),
        browser: this.getBrowser(),
        version: this.getAppVersion()
      }
    }
  }

  static generateReport(days: number = 7): AnalyticsReport {
    const events = this.getEvents(days)
    const uniqueUsers = new Set(events.map(e => e.userId)).size
    
    return {
      period: `Last ${days} days`,
      totalEvents: events.length,
      uniqueUsers,
      topEvents: this.getTopEvents(events),
      userEngagement: {
        averageSessionTime: this.calculateAverageSessionDuration(),
        bounceRate: this.calculateBounceRate(),
        returnUserRate: this.calculateReturnUserRate()
      },
      featureUsage: this.getTopFeatures(),
      errorAnalysis: {
        totalErrors: this.countEvents('error_occurred'),
        topErrors: this.getTopErrors()
      }
    }
  }

  static exportReport(format: 'json' | 'csv' = 'json'): Blob {
    const report = this.generateReport(30)
    
    if (format === 'csv') {
      const csv = this.convertToCSV(report)
      return new Blob([csv], { type: 'text/csv' })
    } else {
      return new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' })
    }
  }

  // Predefined tracking methods
  static trackPageView(page: string): void {
    this.track('page_view', { page })
  }

  static trackFeatureUsed(feature: string, context?: Record<string, any>): void {
    this.track('feature_used', { feature, ...context })
  }

  static trackDatabaseCreated(databaseName: string): void {
    this.track('database_created', { name: databaseName })
  }

  static trackTableCreated(tableName: string, databaseId: string): void {
    this.track('table_created', { name: tableName, databaseId })
  }

  static trackRecordCreated(tableId: string): void {
    this.track('record_created', { tableId })
  }

  static trackFieldCreated(fieldType: string, tableId: string): void {
    this.track('field_created', { type: fieldType, tableId })
  }

  static trackExport(format: string, itemCount: number): void {
    this.track('data_exported', { format, itemCount })
  }

  static trackImport(format: string, itemCount: number): void {
    this.track('data_imported', { format, itemCount })
  }

  static trackError(error: string, context?: string, stack?: string): void {
    this.track('error_occurred', { error, context, stack })
  }

  static trackUserAction(action: string, target: string, value?: any): void {
    this.track('user_action', { action, target, value })
  }

  static trackPerformance(metric: string, value: number, unit: string = 'ms'): void {
    this.track('performance_metric', { metric, value, unit })
  }

  static trackSearch(query: string, results: number): void {
    this.track('search_performed', { query, results })
  }

  static trackSubscriptionChange(from: string, to: string): void {
    this.track('subscription_changed', { from, to })
  }

  // Private helper methods
  private static generateUserId(): string {
    let userId = localStorage.getItem('analytics_user_id')
    if (!userId) {
      userId = 'user_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9)
      localStorage.setItem('analytics_user_id', userId)
    }
    return userId
  }

  private static generateSessionId(): string {
    return 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9)
  }

  private static loadStoredEvents(): void {
    try {
      const storedEvents = localStorage.getItem('analytics_events')
      if (storedEvents) {
        this.events = JSON.parse(storedEvents)
        
        // Keep only last 1000 events to prevent storage bloat
        if (this.events.length > 1000) {
          this.events = this.events.slice(-1000)
        }
      }
    } catch (error) {
      console.error('Failed to load stored analytics events:', error)
      this.events = []
    }
  }

  private static saveEvents(): void {
    try {
      localStorage.setItem('analytics_events', JSON.stringify(this.events))
    } catch (error) {
      console.error('Failed to save analytics events:', error)
    }
  }

  private static countEvents(eventName: string): number {
    return this.getEvents().filter(event => event.name === eventName).length
  }

  private static getUniqueUsers(days: number): number {
    const events = this.getEvents(days)
    return new Set(events.map(e => e.userId)).size
  }

  private static calculateStorageUsed(): number {
    try {
      const dbData = localStorage.getItem('database')
      return dbData ? new Blob([dbData]).size : 0
    } catch {
      return 0
    }
  }

  private static calculateErrorRate(): number {
    const events = this.getEvents()
    const totalEvents = events.length
    const errorEvents = events.filter(event => event.name.includes('error')).length
    
    return totalEvents > 0 ? (errorEvents / totalEvents) * 100 : 0
  }

  private static calculateAverageSessionDuration(): number {
    const sessionEvents = this.getEvents().filter(e => e.name === 'session_end')
    if (sessionEvents.length === 0) return 0
    
    const totalDuration = sessionEvents.reduce((sum, event) => {
      return sum + (event.properties?.duration || 0)
    }, 0)
    
    return totalDuration / sessionEvents.length
  }

  private static getTopFeatures(): { name: string; usage: number }[] {
    const featureEvents = this.getEvents().filter(e => e.name === 'feature_used')
    const featureCounts: Record<string, number> = {}
    
    featureEvents.forEach(event => {
      const feature = event.properties?.feature
      if (feature) {
        featureCounts[feature] = (featureCounts[feature] || 0) + 1
      }
    })
    
    return Object.entries(featureCounts)
      .map(([name, usage]) => ({ name, usage }))
      .sort((a, b) => b.usage - a.usage)
      .slice(0, 10)
  }

  private static getTopEvents(events: AnalyticsEvent[]): { name: string; count: number }[] {
    const eventCounts: Record<string, number> = {}
    
    events.forEach(event => {
      eventCounts[event.name] = (eventCounts[event.name] || 0) + 1
    })
    
    return Object.entries(eventCounts)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10)
  }

  private static getTopErrors(): { error: string; count: number }[] {
    const errorEvents = this.getEvents().filter(e => e.name === 'error_occurred')
    const errorCounts: Record<string, number> = {}
    
    errorEvents.forEach(event => {
      const error = event.properties?.error
      if (error) {
        errorCounts[error] = (errorCounts[error] || 0) + 1
      }
    })
    
    return Object.entries(errorCounts)
      .map(([error, count]) => ({ error, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5)
  }

  private static calculateBounceRate(): number {
    const sessions = new Set(this.getEvents().map(e => e.sessionId))
    let bouncedSessions = 0
    
    sessions.forEach(sessionId => {
      const sessionEvents = this.events.filter(e => e.sessionId === sessionId)
      if (sessionEvents.length <= 2) { // Only session_start and session_end
        bouncedSessions++
      }
    })
    
    return sessions.size > 0 ? (bouncedSessions / sessions.size) * 100 : 0
  }

  private static calculateReturnUserRate(): number {
    const userSessions: Record<string, number> = {}
    
    this.getEvents().forEach(event => {
      if (event.name === 'session_start' && event.userId) {
        userSessions[event.userId] = (userSessions[event.userId] || 0) + 1
      }
    })
    
    const totalUsers = Object.keys(userSessions).length
    const returnUsers = Object.values(userSessions).filter(sessions => sessions > 1).length
    
    return totalUsers > 0 ? (returnUsers / totalUsers) * 100 : 0
  }

  private static getPlatform(): string {
    const userAgent = navigator.userAgent.toLowerCase()
    if (userAgent.includes('mobile')) return 'mobile'
    if (userAgent.includes('tablet')) return 'tablet'
    return 'desktop'
  }

  private static getBrowser(): string {
    const userAgent = navigator.userAgent
    if (userAgent.includes('Chrome')) return 'Chrome'
    if (userAgent.includes('Firefox')) return 'Firefox'
    if (userAgent.includes('Safari')) return 'Safari'
    if (userAgent.includes('Edge')) return 'Edge'
    return 'Unknown'
  }

  private static getAppVersion(): string {
    return '1.0.0' // This would typically come from your build process
  }

  private static convertToCSV(report: AnalyticsReport): string {
    const lines = [
      'Analytics Report',
      `Period: ${report.period}`,
      `Total Events: ${report.totalEvents}`,
      `Unique Users: ${report.uniqueUsers}`,
      '',
      'Top Events:',
      'Event Name,Count'
    ]
    
    report.topEvents.forEach(event => {
      lines.push(`${event.name},${event.count}`)
    })
    
    lines.push('', 'Feature Usage:', 'Feature,Usage Count')
    report.featureUsage.forEach(feature => {
      lines.push(`${feature.feature},${feature.usage}`)
    })
    
    return lines.join('\n')
  }
}