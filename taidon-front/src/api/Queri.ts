// Query API - Handles SQL query execution and management

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:1337/api';

export interface Query {
  id: number;
  name: string;
  content: string;
  projectId: number;
  createdAt: string;
  updatedAt: string;
}

export interface QueryExecutionResult {
  success: boolean;
  columns?: string[];
  rows?: any[];
  executionTime?: number;
  rowCount?: number;
  error?: string;
  message?: string;
}

export interface QueryHistoryItem {
  id: number;
  query: string;
  status: 'success' | 'error';
  executionTime?: number;
  rowCount?: number;
  error?: string;
  timestamp: string;
  databaseConnection: string;
  projectId: number;
}

/**
 * Execute a SQL query
 */
export async function executeQuery(
  query: string,
  connectionId: number,
  projectId: number
): Promise<QueryExecutionResult> {
  try {
    const token = localStorage.getItem('jwt');
    
    const response = await fetch(`${API_URL}/queries/execute`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
      },
      body: JSON.stringify({
        query,
        connectionId,
        projectId,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error?.message || 'Failed to execute query');
    }

    const data = await response.json();
    return {
      success: true,
      columns: data.columns,
      rows: data.rows,
      executionTime: data.executionTime,
      rowCount: data.rowCount,
    };
  } catch (error) {
    console.error('Query execution error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
    };
  }
}

/**
 * Save a query to the project
 */
export async function saveQuery(
  name: string,
  content: string,
  projectId: number
): Promise<Query | null> {
  try {
    const token = localStorage.getItem('jwt');
    
    const response = await fetch(`${API_URL}/queries`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
      },
      body: JSON.stringify({
        data: {
          name,
          content,
          project: projectId,
        },
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to save query');
    }

    const result = await response.json();
    return result.data;
  } catch (error) {
    console.error('Save query error:', error);
    return null;
  }
}

/**
 * Update an existing query
 */
export async function updateQuery(
  queryId: number,
  name: string,
  content: string
): Promise<Query | null> {
  try {
    const token = localStorage.getItem('jwt');
    
    const response = await fetch(`${API_URL}/queries/${queryId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
      },
      body: JSON.stringify({
        data: {
          name,
          content,
        },
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to update query');
    }

    const result = await response.json();
    return result.data;
  } catch (error) {
    console.error('Update query error:', error);
    return null;
  }
}

/**
 * Delete a query
 */
export async function deleteQuery(queryId: number): Promise<boolean> {
  try {
    const token = localStorage.getItem('jwt');
    
    const response = await fetch(`${API_URL}/queries/${queryId}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
      },
    });

    return response.ok;
  } catch (error) {
    console.error('Delete query error:', error);
    return false;
  }
}

/**
 * Get all queries for a project
 */
export async function getProjectQueries(projectId: number): Promise<Query[]> {
  try {
    const token = localStorage.getItem('jwt');
    
    const response = await fetch(
      `${API_URL}/queries?filters[project][id][$eq]=${projectId}&populate=*`,
      {
        headers: {
          'Content-Type': 'application/json',
          ...(token && { Authorization: `Bearer ${token}` }),
        },
      }
    );

    if (!response.ok) {
      throw new Error('Failed to fetch queries');
    }

    const result = await response.json();
    return result.data || [];
  } catch (error) {
    console.error('Fetch queries error:', error);
    return [];
  }
}

/**
 * Get query history for a project
 */
export async function getQueryHistory(
  projectId: number,
  limit: number = 20
): Promise<QueryHistoryItem[]> {
  try {
    const token = localStorage.getItem('jwt');
    
    const response = await fetch(
      `${API_URL}/query-histories?filters[project][id][$eq]=${projectId}&sort=createdAt:desc&pagination[limit]=${limit}&populate=*`,
      {
        headers: {
          'Content-Type': 'application/json',
          ...(token && { Authorization: `Bearer ${token}` }),
        },
      }
    );

    if (!response.ok) {
      throw new Error('Failed to fetch query history');
    }

    const result = await response.json();
    return result.data || [];
  } catch (error) {
    console.error('Fetch query history error:', error);
    return [];
  }
}

/**
 * Export query results to CSV
 */
export function exportToCSV(columns: string[], rows: any[], filename: string = 'query_results.csv'): void {
  try {
    // Create CSV header
    const header = columns.join(',');
    
    // Create CSV rows
    const csvRows = rows.map(row => {
      return columns.map(col => {
        const value = row[col];
        // Escape quotes and wrap in quotes if contains comma
        if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
          return `"${value.replace(/"/g, '""')}"`;
        }
        return value;
      }).join(',');
    });
    
    // Combine header and rows
    const csv = [header, ...csvRows].join('\n');
    
    // Create blob and download
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  } catch (error) {
    console.error('Export to CSV error:', error);
  }
}

/**
 * Format SQL query for display
 */
export function formatSQL(sql: string): string {
  // Basic SQL formatting
  return sql
    .replace(/\bSELECT\b/gi, '\nSELECT')
    .replace(/\bFROM\b/gi, '\nFROM')
    .replace(/\bWHERE\b/gi, '\nWHERE')
    .replace(/\bJOIN\b/gi, '\nJOIN')
    .replace(/\bLEFT JOIN\b/gi, '\nLEFT JOIN')
    .replace(/\bRIGHT JOIN\b/gi, '\nRIGHT JOIN')
    .replace(/\bINNER JOIN\b/gi, '\nINNER JOIN')
    .replace(/\bON\b/gi, '\n  ON')
    .replace(/\bGROUP BY\b/gi, '\nGROUP BY')
    .replace(/\bORDER BY\b/gi, '\nORDER BY')
    .replace(/\bLIMIT\b/gi, '\nLIMIT')
    .trim();
}

/**
 * Validate SQL query (basic validation)
 */
export function validateSQL(sql: string): { valid: boolean; error?: string } {
  if (!sql || sql.trim().length === 0) {
    return { valid: false, error: 'Query cannot be empty' };
  }

  // Check for dangerous operations (basic security)
  const dangerousPatterns = [
    /DROP\s+DATABASE/gi,
    /DROP\s+TABLE/gi,
    /TRUNCATE/gi,
  ];

  for (const pattern of dangerousPatterns) {
    if (pattern.test(sql)) {
      return { 
        valid: false, 
        error: 'Dangerous operation detected. Please use with caution.' 
      };
    }
  }

  return { valid: true };
}
