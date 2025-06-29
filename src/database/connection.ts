import { DataSource } from 'typeorm';
import initSqlJs from 'sql.js';
import { Database } from './entities/Database';
import { Table } from './entities/Table';
import { Field } from './entities/Field';
import { Record } from './entities/Record';
import { User } from './entities/User';
import { Relationship } from './entities/Relationship';

let dataSource: DataSource | null = null;

export async function initializeDatabase(): Promise<DataSource> {
  if (dataSource && dataSource.isInitialized) {
    return dataSource;
  }

  try {
    const SQL = await initSqlJs({
      locateFile: (file: string) => `/${file}`
    });

    // Load existing database from localStorage or create new
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

export async function exportDatabaseSQL(): Promise<string> {
  try {
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
  } catch (error) {
    console.error('Failed to export database:', error);
    return '';
  }
}

export async function importDatabaseSQL(sqlContent: string): Promise<void> {
  try {
    const ds = getDataSource();
    const sqliteDb = (ds.driver as any).database;
    
    sqliteDb.exec(sqlContent);
    // Trigger auto-save
    const data = sqliteDb.export();
    localStorage.setItem('database', JSON.stringify(Array.from(data)));
  } catch (error) {
    console.error('Failed to import SQL:', error);
    throw new Error(`Failed to import SQL: ${error}`);
  }
}