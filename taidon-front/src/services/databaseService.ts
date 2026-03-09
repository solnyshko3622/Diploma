import type { DatabaseConnection, QueryResult } from '../types';

export class DatabaseService {
  private connections: Map<string, any> = new Map();

  async connect(connection: DatabaseConnection): Promise<void> {
    try {
      let client;
      
      switch (connection.type) {
        case 'postgresql':
          const { Client } = await import('pg');
          client = new Client({
            host: connection.host,
            port: connection.port,
            database: connection.database,
            user: connection.username,
            password: connection.password,
            ssl: connection.ssl ? { rejectUnauthorized: false } : false,
          });
          await client.connect();
          break;

        case 'mysql':
          const mysql = await import('mysql2/promise');
          client = await mysql.createConnection({
            host: connection.host,
            port: connection.port,
            database: connection.database,
            user: connection.username,
            password: connection.password,
            ssl: connection.ssl ? { rejectUnauthorized: false } : undefined,
          });
          break;

        case 'sqlite':
          // Note: SQLite in browser context would use sql.js
          // For server-side, we'd use better-sqlite3
          const { default: Database } = await import('better-sqlite3');
          client = new Database(connection.filename || ':memory:');
          break;

        default:
          throw new Error(`Unsupported database type: ${connection.type}`);
      }

      this.connections.set(connection.id, client);
    } catch (error) {
      throw new Error(`Failed to connect to database: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  async disconnect(connectionId: string): Promise<void> {
    const client = this.connections.get(connectionId);
    if (client) {
      try {
        if (client.end) await client.end();
        if (client.close) await client.close();
      } catch (error) {
        console.warn('Error disconnecting from database:', error);
      }
      this.connections.delete(connectionId);
    }
  }

  async executeQuery(connectionId: string, query: string): Promise<QueryResult> {
    const client = this.connections.get(connectionId);
    if (!client) {
      throw new Error('Database connection not found');
    }

    const startTime = performance.now();
    
    try {
      let result: any;

      if (client.query) {
        // PostgreSQL and MySQL
        const queryResult = await client.query(query);
        result = {
          columns: queryResult.fields?.map((f: any) => f.name) || Object.keys(queryResult[0] || {}),
          rows: queryResult.rows || queryResult,
          rowCount: queryResult.rowCount || queryResult.length,
        };
      } else if (client.prepare) {
        // SQLite with better-sqlite3
        const stmt = client.prepare(query);
        if (query.trim().toUpperCase().startsWith('SELECT')) {
          const rows = stmt.all();
          result = {
            columns: rows.length > 0 ? Object.keys(rows[0]) : [],
            rows: rows,
            rowCount: rows.length,
          };
        } else {
          const info = stmt.run();
          result = {
            columns: [],
            rows: [],
            rowCount: info.changes || 0,
          };
        }
      } else {
        throw new Error('Unsupported database client');
      }

      const executionTime = performance.now() - startTime;

      return {
        ...result,
        executionTime,
      };
    } catch (error) {
      const executionTime = performance.now() - startTime;
      return {
        columns: [],
        rows: [],
        rowCount: 0,
        executionTime,
        error: error instanceof Error ? error.message : String(error),
      };
    }
  }

  async testConnection(connection: DatabaseConnection): Promise<boolean> {
    try {
      await this.connect(connection);
      await this.disconnect(connection.id);
      return true;
    } catch {
      return false;
    }
  }

  getConnection(connectionId: string): any {
    return this.connections.get(connectionId);
  }
}

export const databaseService = new DatabaseService();