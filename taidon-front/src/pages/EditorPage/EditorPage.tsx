import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import SimpleEditor from '../../components/SimpleEditor/SimpleEditor';
import './editor_page.css';

interface QueryTab {
  id: string;
  name: string;
  content: string;
  isActive: boolean;
}

interface QueryResult {
  columns: string[];
  rows: any[];
  executionTime: number;
  rowCount: number;
}

interface HistoryItem {
  id: string;
  query: string;
  status: 'success' | 'error';
  timestamp: string;
  database: string;
}

interface SchemaTable {
  name: string;
  schema: string;
}

const EditorPage: React.FC = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();
  
  const [tabs, setTabs] = useState<QueryTab[]>([
    {
      id: '1',
      name: 'user_growth_query.sql',
      content: `-- Analysis of monthly active user growth
SELECT
    u.id,
    u.username,
    COUNT(t.id) AS transaction_count,
    SUM(t.amount) AS total_spent
FROM users u
JOIN transactions t ON u.id = t.user_id
WHERE t.status = 'completed'
AND t.created_at > CURRENT_DATE - INTERVAL '30 days'
GROUP BY 1, 2
ORDER BY 4 DESC;`,
      isActive: true
    },
    {
      id: '2',
      name: 'monthly_revenue.sql',
      content: 'SELECT * FROM revenue WHERE month = CURRENT_MONTH;',
      isActive: false
    }
  ]);

  const [activeTabId, setActiveTabId] = useState('1');
  const [queryResults, setQueryResults] = useState<QueryResult | null>({
    columns: ['id', 'username', 'transaction_count', 'total_spent', 'last_active'],
    rows: [
      { id: '9c1b2d...', username: 'alex_rivera', transaction_count: 142, total_spent: '$12,450.00', last_active: '2023-11-24 14:22:01' },
      { id: '4f7a9e...', username: 'sarah_connor', transaction_count: 98, total_spent: '$8,120.50', last_active: '2023-11-24 13:45:12' },
      { id: '2d4e1c...', username: 'tech_pioneer', transaction_count: 76, total_spent: '$6,944.20', last_active: '2023-11-24 13:10:00' },
      { id: '8a3b5d...', username: 'data_wizard', transaction_count: 54, total_spent: '$5,200.00', last_active: '2023-11-24 12:55:44' },
      { id: '1f9c0e...', username: 'cloud_runner', transaction_count: 31, total_spent: '$2,850.15', last_active: '2023-11-24 11:20:01' },
    ],
    executionTime: 42,
    rowCount: 1248
  });

  const [showHistory, setShowHistory] = useState(true);
  const [showExplorer, setShowExplorer] = useState(true);
  const [currentDatabase, setCurrentDatabase] = useState('PROD_DB_01');
  const [showToast, setShowToast] = useState(false);
  const [cursorPosition, setCursorPosition] = useState({ line: 8, col: 24 });

  const [historyItems] = useState<HistoryItem[]>([
    {
      id: '1',
      query: 'SELECT u.id, u.username, COUNT(t.id) AS transaction_count FROM users u...',
      status: 'success',
      timestamp: '14:22:01',
      database: 'PROD_DB_01'
    },
    {
      id: '2',
      query: "SELECT * FROM transactions WHERE status = 'pending' LIMIT 50;",
      status: 'success',
      timestamp: '13:45:12',
      database: 'PROD_DB_01'
    },
    {
      id: '3',
      query: 'ALTER TABLE analytics_logs ADD COLUMN metadata JSONB;',
      status: 'error',
      timestamp: '13:10:00',
      database: 'STAGING_DB'
    },
    {
      id: '4',
      query: "UPDATE users SET last_login = NOW() WHERE id = '9c1b2d';",
      status: 'success',
      timestamp: '12:55:44',
      database: 'PROD_DB_01'
    }
  ]);

  const [schemaTables] = useState<SchemaTable[]>([
    { name: 'users', schema: 'public' },
    { name: 'transactions', schema: 'public' },
    { name: 'analytics_logs', schema: 'public' }
  ]);

  const activeTab = tabs.find(tab => tab.id === activeTabId);

  const handleRunQuery = () => {
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
    // TODO: Execute actual query
  };

  const handleTabChange = (tabId: string) => {
    setActiveTabId(tabId);
  };

  const handleTabClose = (tabId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const newTabs = tabs.filter(tab => tab.id !== tabId);
    if (activeTabId === tabId && newTabs.length > 0) {
      setActiveTabId(newTabs[0].id);
    }
    setTabs(newTabs);
  };

  const handleNewQuery = () => {
    const newTab: QueryTab = {
      id: Date.now().toString(),
      name: `untitled_${tabs.length + 1}.sql`,
      content: '-- New query\n',
      isActive: true
    };
    setTabs([...tabs, newTab]);
    setActiveTabId(newTab.id);
  };

  const handleQueryChange = (content: string) => {
    setTabs(tabs.map(tab => 
      tab.id === activeTabId ? { ...tab, content } : tab
    ));
  };

  return (
    <div className="editor-page">
      {/* Top Navigation Bar */}
      <header className="editor-header">
        <div className="header-left">
          <span className="header-logo" onClick={() => navigate('/projects')}>
            MONOLITH_SQL
          </span>
          <nav className="header-nav">
            <a href="#" className="nav-link active">Editor</a>
            <a href="#" className="nav-link">Dashboards</a>
            <a href="#" className="nav-link">Collections</a>
            <a href="#" className="nav-link">Admin</a>
          </nav>
        </div>
        <div className="header-right">
          <div className="database-badge">
            <span className="database-icon">💾</span>
            <span className="database-name">{currentDatabase}</span>
          </div>
          <button className="btn-run" onClick={handleRunQuery}>
            <span className="btn-icon">▶</span>
            <span className="btn-text">RUN</span>
          </button>
          <div className="header-actions">
            <button className="icon-button" aria-label="Notifications">
              <span className="icon">🔔</span>
            </button>
            <button className="icon-button" aria-label="Settings">
              <span className="icon">⚙️</span>
            </button>
            <div className="user-avatar">
              <div className="avatar-circle">U</div>
            </div>
          </div>
        </div>
      </header>

      <div className="editor-layout">
        {/* Icon Rail */}
        <aside className="icon-rail">
          <div className="rail-top">
            <button 
              className={`rail-button ${showExplorer ? 'active' : ''}`}
              onClick={() => setShowExplorer(!showExplorer)}
              title="Explorer"
            >
              <span className="icon">📊</span>
            </button>
            <button 
              className={`rail-button ${showHistory ? 'active' : ''}`}
              onClick={() => setShowHistory(!showHistory)}
              title="Query History"
            >
              <span className="icon">🕐</span>
            </button>
            <button className="rail-button" title="Snippets">
              <span className="icon">📝</span>
            </button>
            <button className="rail-button" title="Connections">
              <span className="icon">🔌</span>
            </button>
          </div>
          <div className="rail-bottom">
            <button className="rail-button" title="Docs">
              <span className="icon">❓</span>
            </button>
            <button className="rail-button" title="Support">
              <span className="icon">💬</span>
            </button>
          </div>
        </aside>

        {/* Explorer Sidebar */}
        {showExplorer && (
          <aside className="explorer-sidebar">
            <div className="sidebar-header">
              <div className="database-info">
                <div className="database-icon-box">
                  <span className="icon">💾</span>
                </div>
                <div className="database-details">
                  <div className="database-title">{currentDatabase}</div>
                  <div className="database-version">PostgreSQL 15.4</div>
                </div>
              </div>
              <button className="btn-new-query" onClick={handleNewQuery}>
                <span className="icon">+</span> New Query
              </button>
            </div>
            <nav className="sidebar-nav">
              <div className="nav-section-title">EXPLORER</div>
              <details className="schema-group" open>
                <summary className="schema-summary">
                  <span className="chevron">›</span>
                  <span className="folder-icon">📁</span>
                  public
                </summary>
                <div className="schema-tables">
                  {schemaTables.map(table => (
                    <div key={table.name} className="table-item">
                      <span className="table-icon">📋</span> {table.name}
                    </div>
                  ))}
                </div>
              </details>
            </nav>
          </aside>
        )}

        {/* History Sidebar */}
        {showHistory && (
          <aside className="history-sidebar">
            <div className="history-header">
              <div className="history-title">
                <span className="icon">🕐</span>
                RECENT HISTORY
              </div>
              <button className="icon-button-small">
                <span className="icon">🔍</span>
              </button>
            </div>
            <div className="history-list">
              {historyItems.map(item => (
                <div key={item.id} className="history-item">
                  <div className="history-item-header">
                    <span className={`history-status ${item.status}`}>
                      {item.status === 'success' ? 'Success' : 'Failed'}
                    </span>
                    <span className="history-time">{item.timestamp}</span>
                  </div>
                  <div className="history-query">{item.query}</div>
                  <div className="history-meta">
                    <span className="icon">💾</span>
                    <span className="history-database">{item.database}</span>
                  </div>
                </div>
              ))}
            </div>
            <div className="history-footer">
              <button className="btn-view-all">VIEW FULL HISTORY</button>
            </div>
          </aside>
        )}

        {/* Main Workspace */}
        <main className="editor-workspace">
          {/* SQL Editor Area */}
          <section className="editor-section">
            <div className="editor-tabs">
              <div className="tabs-list">
                {tabs.map(tab => (
                  <div
                    key={tab.id}
                    className={`tab ${tab.id === activeTabId ? 'active' : ''}`}
                    onClick={() => handleTabChange(tab.id)}
                  >
                    <span className="tab-icon">📄</span>
                    <span className="tab-name">{tab.name}</span>
                    <button 
                      className="tab-close"
                      onClick={(e) => handleTabClose(tab.id, e)}
                    >
                      ×
                    </button>
                  </div>
                ))}
                <button className="tab-add" onClick={handleNewQuery}>
                  <span className="icon">+</span>
                </button>
              </div>
            </div>
            <div className="editor-content">
              <SimpleEditor
                value={activeTab?.content || ''}
                onChange={handleQueryChange}
                onRun={handleRunQuery}
                height="400px"
              />
            </div>
          </section>

          {/* Results Pane */}
          <section className="results-section">
            <div className="results-header">
              <div className="results-info">
                <h2 className="results-title">QUERY RESULTS</h2>
                <div className="results-meta">
                  <span className="meta-item">
                    <span className="icon">⏱</span> {queryResults?.executionTime}ms
                  </span>
                  <span className="meta-item">
                    <span className="icon">📋</span> {queryResults?.rowCount.toLocaleString()} rows
                  </span>
                </div>
              </div>
              <div className="results-actions">
                <button className="action-button">
                  <span className="icon">⬇</span> Export
                </button>
                <button className="action-button">
                  <span className="icon">🔍</span> Filter
                </button>
                <button className="icon-button-small">
                  <span className="icon">⋮</span>
                </button>
              </div>
            </div>
            <div className="results-table-container">
              {queryResults && (
                <table className="results-table">
                  <thead>
                    <tr>
                      {queryResults.columns.map(col => (
                        <th key={col}>{col}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {queryResults.rows.map((row, index) => (
                      <tr key={index}>
                        {queryResults.columns.map(col => (
                          <td key={col} className={col === 'total_spent' ? 'highlight' : ''}>
                            {row[col]}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
            <div className="results-footer">
              <div className="pagination-info">Showing 1-25 of {queryResults?.rowCount.toLocaleString()}</div>
              <div className="pagination-controls">
                <button className="pagination-button">⏮</button>
                <button className="pagination-button">◀</button>
                <div className="pagination-current">1</div>
                <button className="pagination-button">▶</button>
                <button className="pagination-button">⏭</button>
              </div>
            </div>
          </section>
        </main>
      </div>

      {/* Success Toast */}
      {showToast && (
        <div className="toast-notification">
          <span className="toast-icon">✓</span>
          <div className="toast-content">
            <span className="toast-title">Execution Success</span>
            <span className="toast-message">
              {queryResults?.rowCount.toLocaleString()} rows returned in {queryResults?.executionTime}ms
            </span>
          </div>
          <button className="toast-close" onClick={() => setShowToast(false)}>
            ×
          </button>
        </div>
      )}
    </div>
  );
};


export default EditorPage;
