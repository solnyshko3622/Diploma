import type { QueryResult } from '../types';

interface QueryResultProps {
  result?: QueryResult;
}

export function QueryResultDisplay({ result }: QueryResultProps) {
  if (!result) {
    return (
      <div className="query-result empty">
        <p>No query executed yet. Write a query and press Ctrl+Enter to execute.</p>
      </div>
    );
  }

  if (result.error) {
    return (
      <div className="query-result error">
        <div className="error-header">
          <h3>Error</h3>
          <span className="execution-time">{result.executionTime.toFixed(2)} ms</span>
        </div>
        <div className="error-message">{result.error}</div>
      </div>
    );
  }

  return (
    <div className="query-result">
      <div className="result-header">
        <div className="result-stats">
          <span className="row-count">{result.rowCount} rows</span>
          <span className="execution-time">{result.executionTime.toFixed(2)} ms</span>
        </div>
      </div>
      
      {result.rows.length > 0 ? (
        <div className="result-table-container">
          <table className="result-table">
            <thead>
              <tr>
                {result.columns.map((column, index) => (
                  <th key={index}>{column}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {result.rows.slice(0, 1000).map((row, rowIndex) => ( // Limit to 1000 rows for performance
                <tr key={rowIndex}>
                  {result.columns.map((column, colIndex) => (
                    <td key={colIndex}>
                      {typeof row[column] === 'object' 
                        ? JSON.stringify(row[column])
                        : String(row[column] ?? 'NULL')}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
          {result.rows.length > 1000 && (
            <div className="result-warning">
              Showing first 1000 rows of {result.rows.length} total rows
            </div>
          )}
        </div>
      ) : (
        <div className="no-results">
          Query executed successfully. No rows returned.
        </div>
      )}
    </div>
  );
}