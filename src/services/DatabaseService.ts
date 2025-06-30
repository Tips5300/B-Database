import type { Database, Table, Field, Record, ExportOptions, ImportOptions } from '@/types/database'
import { FieldType } from '@/types/database'

export class DatabaseService {
  private static databases: Database[] = []

  static async getAllDatabases(): Promise<Database[]> {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 500))
    
    if (this.databases.length === 0) {
      // Create sample data
      this.databases = [
        {
          id: '1',
          name: 'Personal CRM',
          emoji: '👥',
          description: 'Contact management system',
          tables: [
            {
              id: 'table-1',
              name: 'Contacts',
              emoji: '📞',
              databaseId: '1',
              fields: [
                {
                  id: 'field-1',
                  name: 'Name',
                  type: FieldType.TEXT,
                  isRequired: true,
                  isPrimary: true,
                  isUnique: false,
                  position: 1
                },
                {
                  id: 'field-2',
                  name: 'Email',
                  type: FieldType.EMAIL,
                  isRequired: true,
                  isPrimary: false,
                  isUnique: true,
                  position: 2
                },
                {
                  id: 'field-3',
                  name: 'Phone',
                  type: FieldType.PHONE,
                  isRequired: false,
                  isPrimary: false,
                  isUnique: false,
                  position: 3
                }
              ],
              records: [
                {
                  id: 'record-1',
                  tableId: 'table-1',
                  data: {
                    'field-1': 'John Doe',
                    'field-2': 'john@example.com',
                    'field-3': '+1234567890'
                  },
                  createdAt: new Date(),
                  updatedAt: new Date(),
                  version: 1
                }
              ],
              relationships: [],
              createdAt: new Date(),
              updatedAt: new Date()
            }
          ],
          createdAt: new Date(),
          updatedAt: new Date(),
          isEncrypted: false
        }
      ]
    }
    
    return this.databases
  }

  static async createDatabase(name: string, emoji?: string, description?: string): Promise<Database> {
    const newDatabase: Database = {
      id: Date.now().toString(),
      name,
      emoji,
      description,
      tables: [],
      createdAt: new Date(),
      updatedAt: new Date(),
      isEncrypted: false
    }
    
    this.databases.push(newDatabase)
    return newDatabase
  }

  static async updateDatabase(id: string, updates: Partial<Database>): Promise<Database> {
    const index = this.databases.findIndex(db => db.id === id)
    if (index === -1) throw new Error('Database not found')
    
    this.databases[index] = { ...this.databases[index], ...updates, updatedAt: new Date() }
    return this.databases[index]
  }

  static async deleteDatabase(id: string): Promise<void> {
    this.databases = this.databases.filter(db => db.id !== id)
  }

  static async createTable(databaseId: string, name: string, emoji?: string): Promise<Table> {
    const database = this.databases.find(db => db.id === databaseId)
    if (!database) throw new Error('Database not found')
    
    const newTable: Table = {
      id: Date.now().toString(),
      name,
      emoji,
      databaseId,
      fields: [],
      records: [],
      relationships: [],
      createdAt: new Date(),
      updatedAt: new Date()
    }
    
    database.tables.push(newTable)
    return newTable
  }

  static async updateTable(tableId: string, updates: Partial<Table>): Promise<Table> {
    for (const database of this.databases) {
      const index = database.tables.findIndex(table => table.id === tableId)
      if (index !== -1) {
        database.tables[index] = { ...database.tables[index], ...updates, updatedAt: new Date() }
        return database.tables[index]
      }
    }
    throw new Error('Table not found')
  }

  static async deleteTable(tableId: string): Promise<void> {
    for (const database of this.databases) {
      database.tables = database.tables.filter(table => table.id !== tableId)
    }
  }

  static async addField(tableId: string, field: Omit<Field, 'id'>): Promise<Field> {
    const table = this.findTableById(tableId)
    if (!table) throw new Error('Table not found')
    
    const newField: Field = {
      ...field,
      id: Date.now().toString()
    }
    
    table.fields.push(newField)
    return newField
  }

  static async updateField(fieldId: string, updates: Partial<Field>): Promise<Field> {
    for (const database of this.databases) {
      for (const table of database.tables) {
        const index = table.fields.findIndex(field => field.id === fieldId)
        if (index !== -1) {
          table.fields[index] = { ...table.fields[index], ...updates }
          return table.fields[index]
        }
      }
    }
    throw new Error('Field not found')
  }

  static async deleteField(fieldId: string): Promise<void> {
    for (const database of this.databases) {
      for (const table of database.tables) {
        table.fields = table.fields.filter(field => field.id !== fieldId)
      }
    }
  }

  static async addRecord(tableId: string, data: { [fieldId: string]: any }): Promise<Record> {
    const table = this.findTableById(tableId)
    if (!table) throw new Error('Table not found')
    
    const newRecord: Record = {
      id: Date.now().toString(),
      tableId,
      data,
      createdAt: new Date(),
      updatedAt: new Date(),
      version: 1
    }
    
    table.records.push(newRecord)
    return newRecord
  }

  static async updateRecord(recordId: string, data: { [fieldId: string]: any }): Promise<Record> {
    for (const database of this.databases) {
      for (const table of database.tables) {
        const index = table.records.findIndex(record => record.id === recordId)
        if (index !== -1) {
          table.records[index] = {
            ...table.records[index],
            data: { ...table.records[index].data, ...data },
            updatedAt: new Date(),
            version: table.records[index].version + 1
          }
          return table.records[index]
        }
      }
    }
    throw new Error('Record not found')
  }

  static async deleteRecord(recordId: string): Promise<void> {
    for (const database of this.databases) {
      for (const table of database.tables) {
        table.records = table.records.filter(record => record.id !== recordId)
      }
    }
  }

  static async exportData(databaseId: string, options: ExportOptions): Promise<Blob> {
    const database = this.databases.find(db => db.id === databaseId)
    if (!database) throw new Error('Database not found')
    
    let exportData: any = {}
    
    if (options.format === 'json') {
      exportData = {
        database: {
          id: database.id,
          name: database.name,
          emoji: database.emoji,
          description: database.description
        },
        tables: database.tables.map(table => ({
          id: table.id,
          name: table.name,
          emoji: table.emoji,
          fields: table.fields,
          records: table.records
        }))
      }
      
      return new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' })
    }
    
    // Add other export formats here
    throw new Error('Export format not supported')
  }

  static async importData(databaseId: string, file: File, options: ImportOptions): Promise<any> {
    const database = this.databases.find(db => db.id === databaseId)
    if (!database) throw new Error('Database not found')
    
    const text = await file.text()
    
    if (options.format === 'json') {
      const data = JSON.parse(text)
      // Process JSON import
      return { success: true, recordsImported: 0 }
    } else if (options.format === 'csv') {
      // Process CSV import
      return { success: true, recordsImported: 0 }
    }
    
    throw new Error('Import format not supported')
  }

  private static findTableById(tableId: string): Table | null {
    for (const database of this.databases) {
      const table = database.tables.find(t => t.id === tableId)
      if (table) return table
    }
    return null
  }
}