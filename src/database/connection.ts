import { CapacitorSQLite, SQLiteConnection, SQLiteDBConnection } from '@capacitor-community/sqlite';
import { Capacitor } from '@capacitor/core';
import { DataSource } from 'typeorm';
import initSqlJs from 'sql.js';
import { Database } from './entities/Database';
import { Table } from './entities/Table';
import { Field } from './entities/Field';
import { Record } from './entities/Record';
import { User } from './entities/User';
import { Relationship } from './entities/Relationship';

let dataSource: DataSource | null = null;
let sqliteConnection: SQLiteConnection | null = null;
let db: SQLiteDBConnection | null = null;

const DB_NAME = 'database_manager.db';
const DB_VERSION = 1;

export async function initializeDatabase(): Promise<DataSource> {
  if (dataSource && dataSource.isInitialized) {
    return dataSource;
  }

  try {
    if (Capacitor.isNativePlatform()) {
      // Native platform - use Capacitor SQLite
      sqliteConnection = new SQLiteConnection(CapacitorSQLite);
      
      // Check if database exists
      const isDBExists = await sqliteConnection.isDatabase(DB_NAME);
      
      if (!isDBExists.result) {
        // Create database if it doesn't exist
        await sqliteConnection.createConnection(DB_NAME, false, 'no-encryption', DB_VERSION, false);
      }
      
      // Open database connection
      db = await sqliteConnection.retrieveConnection(DB_NAME, false);
      if (!db.isDBOpen().result) {
        await db.open();
      }

      // Create TypeORM DataSource with native SQLite
      dataSource = new DataSource({
        type: 'capacitor',
        driver: CapacitorSQLite,
        database: DB_NAME,
        entities: [Database, Table, Field, Record, User, Relationship],
        synchronize: true,
        logging: false
      });
    } else {
      // Web platform - use SQL.js with localStorage fallback
      const SQL = await initSqlJs({
        locateFile: (file: string) => `/${file}`
      });

      const savedDb = localStorage.getItem('database');
      const sqliteDb = savedDb 
        ? new SQL.Database(new Uint8Array(JSON.parse(savedDb)))
        : new SQL.Database();

      dataSource = new DataSource({
        type: 'sqljs',
        database: sqliteDb,
        entities: [Database, Table, Field, Record, User, Relationship],
        synchronize: true,
        logging: false,
        autoSave: true,
        autoSaveCallback: (data: Uint8Array) => {
          try {
            localStorage.setItem('database', JSON.stringify(Array.from(data)));
          } catch (error) {
            console.error('Failed to save database:', error);
          }
        }
      });
    }

    await dataSource.initialize();
    console.log('Database initialized successfully');
    return dataSource;
  } catch (error) {
    console.error('Failed to initialize database:', error);
    throw error;
  }
}

export function getDataSource(): DataSource {
  if (!dataSource || !dataSource.isInitialized) {
    throw new Error('Database not initialized');
  }
  return dataSource;
}

export async function saveDatabase(): Promise<void> {
  if (Capacitor.isNativePlatform() && db) {
    try {
      await db.close();
      await db.open();
    } catch (error) {
      console.error('Failed to save native database:', error);
    }
  }
  // Web platform auto-saves via autoSaveCallback
}

export async function exportDatabaseSQL(): Promise<string> {
  try {
    if (Capacitor.isNativePlatform() && db) {
      // Native platform - export using Capacitor SQLite
      const exportResult = await db.exportToJson('full');
      if (exportResult.export) {
        // Convert JSON export to SQL statements
        return convertJsonToSQL(exportResult.export);
      }
      return '';
    } else {
      // Web platform - use existing SQL.js export
      const ds = getDataSource();
      const sqliteDb = (ds.driver as any).database;
      
      const tables = ['databases', 'tables', 'fields', 'records', 'users', 'relationships'];
      let sql = '';
      
      for (const table of tables) {
        try {
          const result = sqliteDb.exec(`SELECT sql FROM sqlite_master WHERE type='table' AND name='${table}'`);
          if (result.length > 0 && result[0].values.length > 0) {
            sql += result[0].values[0][0] + ';\n\n';
            
            const data = sqliteDb.exec(`SELECT * FROM ${table}`);
            if (data.length > 0 && data[0].values.length > 0) {
              const columns = data[0].columns;
              for (const row of data[0].values) {
                const values = row.map(val => 
                  val === null ? 'NULL' : 
                  typeof val === 'string' ? `'${val.replace(/'/g, "''")}'` : 
                  val
                ).join(', ');
                sql += `INSERT INTO ${table} (${columns.join(', ')}) VALUES (${values});\n`;
              }
              sql += '\n';
            }
          }
        } catch (error) {
          console.warn(`Error exporting table ${table}:`, error);
        }
      }
      
      return sql;
    }
  } catch (error) {
    console.error('Failed to export database:', error);
    return '';
  }
}

export async function importDatabaseSQL(sqlContent: string): Promise<void> {
  try {
    if (Capacitor.isNativePlatform() && db) {
      // Native platform - import using Capacitor SQLite
      const statements = sqlContent.split(';').filter(stmt => stmt.trim());
      for (const statement of statements) {
        if (statement.trim()) {
          await db.execute(statement.trim());
        }
      }
    } else {
      // Web platform - use existing SQL.js import
      const ds = getDataSource();
      const sqliteDb = (ds.driver as any).database;
      
      sqliteDb.exec(sqlContent);
      const data = sqliteDb.export();
      localStorage.setItem('database', JSON.stringify(Array.from(data)));
    }
  } catch (error) {
    console.error('Failed to import SQL:', error);
    throw new Error(`Failed to import SQL: ${error}`);
  }
}

export async function closeDatabase(): Promise<void> {
  if (Capacitor.isNativePlatform() && db) {
    try {
      await db.close();
      if (sqliteConnection) {
        await sqliteConnection.closeConnection(DB_NAME, false);
      }
    } catch (error) {
      console.error('Failed to close database:', error);
    }
  }
}

export async function deleteDatabase(): Promise<void> {
  try {
    if (Capacitor.isNativePlatform()) {
      if (db && db.isDBOpen().result) {
        await db.close();
      }
      if (sqliteConnection) {
        const isDBExists = await sqliteConnection.isDatabase(DB_NAME);
        if (isDBExists.result) {
          await sqliteConnection.deleteDatabase(DB_NAME);
        }
      }
    } else {
      // Web platform - clear localStorage
      localStorage.removeItem('database');
    }
  } catch (error) {
    console.error('Failed to delete database:', error);
    throw error;
  }
}

// Helper function to convert JSON export to SQL statements
function convertJsonToSQL(jsonExport: any): string {
  let sql = '';
  
  if (jsonExport.database && jsonExport.tables) {
    for (const table of jsonExport.tables) {
      // Create table statement
      sql += `CREATE TABLE IF NOT EXISTS ${table.name} (\n`;
      const columns = table.schema.map((col: any) => 
        `  ${col.column} ${col.value}`
      );
      sql += columns.join(',\n');
      sql += '\n);\n\n';
      
      // Insert data
      if (table.values && table.values.length > 0) {
        const columnNames = table.schema.map((col: any) => col.column);
        for (const row of table.values) {
          const values = row.map((val: any) => 
            val === null ? 'NULL' : 
            typeof val === 'string' ? `'${val.replace(/'/g, "''")}'` : 
            val
          ).join(', ');
          sql += `INSERT INTO ${table.name} (${columnNames.join(', ')}) VALUES (${values});\n`;
        }
        sql += '\n';
      }
    }
  }
  
  return sql;
}