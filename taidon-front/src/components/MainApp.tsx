import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../contexts/AppContext';
import { TabManager } from './TabManager';
import { SQLEditor } from './SQLEditor';
import { QueryResultDisplay } from './QueryResult';
import { ConnectionManager } from './ConnectionManager';
import { FileTree } from './FileTree';
import { Header } from './Header';

export function MainApp() {
  const navigate = useNavigate();
  const {
    tabs,
    activeTabId,
    connections,
    currentConnectionId,
    theme,
    // auth,
    fileTree,
    dispatch,
    executeQuery,
    connectToDatabase,
    disconnectFromDatabase,
    // logout,
  } = useApp();

  const [showConnections, setShowConnections] = useState(false);
  const [showFileTree, setShowFileTree] = useState(true);
  const activeTab = tabs.find(tab => tab.id === activeTabId) || tabs[0];

  const handleQueryChange = (query: string) => {
    dispatch({
      type: 'UPDATE_TAB',
      payload: {
        id: activeTabId,
        updates: { query, isDirty: true },
      },
    });
  };

  const handleExecuteQuery = async () => {
    if (!activeTab.query.trim()) return;
    
    await executeQuery(activeTab.query);
    
    // Update tab title if it's the default
    if (activeTab.title.startsWith('Query ')) {
      const queryPreview = activeTab.query.split('\n')[0].substring(0, 30);
      dispatch({
        type: 'UPDATE_TAB',
        payload: {
          id: activeTabId,
          updates: { 
            title: queryPreview + (queryPreview.length < activeTab.query.split('\n')[0].length ? '...' : ''),
            isDirty: false 
          },
        },
      });
    }
  };

  const handleNewTab = () => {
    const newTabId = Date.now().toString();
    dispatch({
      type: 'ADD_TAB',
      payload: {
        id: newTabId,
        title: `Query ${tabs.length + 1}`,
        query: '',
        isDirty: false,
      },
    });
  };

  const handleTabSelect = (tabId: string) => {
    dispatch({ type: 'SET_ACTIVE_TAB', payload: tabId });
  };

  const handleTabClose = (tabId: string) => {
    if (tabs.length > 1) {
      dispatch({ type: 'CLOSE_TAB', payload: tabId });
    }
  };

  const handleConnectionSelect = (connectionId: string) => {
    dispatch({ type: 'SET_CURRENT_CONNECTION', payload: connectionId });
  };

  const handleConnectionCreate = async (connection: any) => {
    const success = await connectToDatabase(connection);
    if (!success) {
      alert('Failed to connect to database. Please check your connection settings.');
    }
  };

  const handleConnectionDelete = async (connectionId: string) => {
    await disconnectFromDatabase(connectionId);
  };

  return (
    <div className={`app ${theme}`}>
      <Header showNavigation={false} />
      
      {/* Simple navigation back to projects */}
      <div className="editor-navigation">
        <button
          className="btn-secondary"
          onClick={() => navigate('/projects')}
          style={{ margin: '10px 20px' }}
        >
          ← Назад к проектам
        </button>
      </div>
      
      <div className="app-content">
        <div className="editor-controls">
          <div className="control-buttons">
            <button
              className={`control-button ${showFileTree ? 'active' : ''}`}
              onClick={() => setShowFileTree(!showFileTree)}
            >
              📁 Files
            </button>
            <button
              className={`control-button ${showConnections ? 'active' : ''}`}
              onClick={() => setShowConnections(!showConnections)}
            >
              {currentConnectionId
                ? connections.find(c => c.id === currentConnectionId)?.name || 'Connected'
                : 'Connect to Database'}
            </button>
          </div>
          <button onClick={handleExecuteQuery} className="execute-button">
            Execute (Ctrl+Enter)
          </button>
        </div>
        <div className="app-content-inner">
          <aside className="sidebar">
            {showFileTree && (
              <div className="sidebar-section">
                <h3>Files</h3>
                <FileTree nodes={fileTree} />
              </div>
            )}
            {showConnections && (
              <div className="sidebar-section">
                <ConnectionManager
                  connections={connections}
                  currentConnectionId={currentConnectionId}
                  onConnectionSelect={handleConnectionSelect}
                  onConnectionCreate={handleConnectionCreate}
                  onConnectionDelete={handleConnectionDelete}
                />
              </div>
            )}
          </aside>

          <main className="main-content">
          <TabManager
            tabs={tabs}
            activeTabId={activeTabId}
            onTabSelect={handleTabSelect}
            onTabClose={handleTabClose}
            onNewTab={handleNewTab}
          />

          <div className="editor-container">
            <SQLEditor
              tab={activeTab}
              onQueryChange={handleQueryChange}
              onExecute={handleExecuteQuery}
              theme={theme}
            />
          </div>

          <div className="result-container">
            <QueryResultDisplay result={activeTab.result} />
          </div>
        </main>
      </div>
      </div>
    </div>
  );
}