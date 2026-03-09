import { useApp } from '../contexts/AppContext';
import type { FileNode } from '../types';

interface FileTreeProps {
  nodes: FileNode[];
  depth?: number;
}

export function FileTree({ nodes, depth = 0 }: FileTreeProps) {
  const { dispatch, currentFile } = useApp();

  const handleToggleFolder = (node: FileNode) => {
    if (node.type === 'folder') {
      dispatch({ type: 'TOGGLE_FOLDER', payload: node.id });
    }
  };

  const handleSelectFile = (node: FileNode) => {
    if (node.type === 'file') {
      dispatch({ type: 'SELECT_FILE', payload: node });
      // Load file content into active tab
      if (node.content) {
        dispatch({
          type: 'UPDATE_TAB',
          payload: {
            id: '1', // Use active tab ID
            updates: { query: node.content, isDirty: false }
          }
        });
      }
    }
  };

  const handleCreateFile = (parentId: string, type: 'file' | 'folder') => {
    const name = prompt(`Enter ${type} name:`);
    if (name) {
      dispatch({ 
        type: 'CREATE_FILE', 
        payload: { parentId, name, type } 
      });
    }
  };

  const handleDeleteFile = (nodeId: string) => {
    if (confirm('Are you sure you want to delete this file?')) {
      dispatch({ type: 'DELETE_FILE', payload: nodeId });
    }
  };

  return (
    <div className="file-tree">
      {nodes.map((node) => (
        <div key={node.id} className="file-tree-node">
          <div 
            className={`file-tree-item ${node.type} ${currentFile?.id === node.id ? 'active' : ''}`}
            style={{ paddingLeft: `${depth * 16 + 8}px` }}
            onClick={() => node.type === 'folder' ? handleToggleFolder(node) : handleSelectFile(node)}
          >
            <span className="file-icon">
              {node.type === 'folder' ? (node.isOpen ? '📂' : '📁') : '📄'}
            </span>
            <span className="file-name">{node.name}</span>
            
            {node.type === 'folder' && (
              <div className="file-actions">
                <button 
                  className="file-action"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleCreateFile(node.id, 'file');
                  }}
                  title="New File"
                >
                  +
                </button>
                <button 
                  className="file-action"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleCreateFile(node.id, 'folder');
                  }}
                  title="New Folder"
                >
                  📁
                </button>
              </div>
            )}
            
            {node.type === 'file' && (
              <button 
                className="file-action delete"
                onClick={(e) => {
                  e.stopPropagation();
                  handleDeleteFile(node.id);
                }}
                title="Delete File"
              >
                ×
              </button>
            )}
          </div>
          
          {node.type === 'folder' && node.isOpen && node.children && (
            <FileTree nodes={node.children} depth={depth + 1} />
          )}
        </div>
      ))}
    </div>
  );
}