import React, { useState } from 'react';
import type { DatabaseConnection } from '../types';

interface ConnectionManagerProps {
  connections: DatabaseConnection[];
  currentConnectionId?: string;
  onConnectionSelect: (connectionId: string) => void;
  onConnectionCreate: (connection: DatabaseConnection) => void;
  onConnectionDelete: (connectionId: string) => void;
}

export function ConnectionManager({
  connections,
  currentConnectionId,
  onConnectionSelect,
  onConnectionCreate,
  onConnectionDelete,
}: ConnectionManagerProps) {
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState<Partial<DatabaseConnection>>({
    type: 'postgresql',
    name: '',
    host: 'localhost',
    port: 5432,
    database: '',
    username: '',
    password: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.name && formData.database) {
      onConnectionCreate({
        id: Date.now().toString(),
        name: formData.name,
        type: formData.type || 'postgresql',
        host: formData.host,
        port: formData.port,
        database: formData.database,
        username: formData.username,
        password: formData.password,
      });
      setShowForm(false);
      setFormData({
        type: 'postgresql',
        name: '',
        host: 'localhost',
        port: 5432,
        database: '',
        username: '',
        password: '',
      });
    }
  };

  return (
    <div className="connection-manager">
      <div className="connection-list">
        <h3>Database Connections</h3>
        {connections.map((connection) => (
          <div
            key={connection.id}
            className={`connection-item ${connection.id === currentConnectionId ? 'active' : ''}`}
            onClick={() => onConnectionSelect(connection.id)}
          >
            <div className="connection-info">
              <span className="connection-name">{connection.name}</span>
              <span className="connection-type">{connection.type}</span>
            </div>
            <button
              className="connection-delete"
              onClick={(e) => {
                e.stopPropagation();
                onConnectionDelete(connection.id);
              }}
              title="Delete connection"
            >
              ×
            </button>
          </div>
        ))}
        <button
          className="new-connection-button"
          onClick={() => setShowForm(true)}
        >
          + New Connection
        </button>
      </div>

      {showForm && (
        <div className="connection-form-overlay">
          <div className="connection-form">
            <h3>New Database Connection</h3>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Connection Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label>Database Type</label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
                >
                  <option value="postgresql">PostgreSQL</option>
                  <option value="mysql">MySQL</option>
                  <option value="sqlite">SQLite</option>
                </select>
              </div>

              {formData.type !== 'sqlite' && (
                <>
                  <div className="form-group">
                    <label>Host</label>
                    <input
                      type="text"
                      value={formData.host}
                      onChange={(e) => setFormData({ ...formData, host: e.target.value })}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label>Port</label>
                    <input
                      type="number"
                      value={formData.port}
                      onChange={(e) => setFormData({ ...formData, port: parseInt(e.target.value) })}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label>Username</label>
                    <input
                      type="text"
                      value={formData.username}
                      onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                    />
                  </div>

                  <div className="form-group">
                    <label>Password</label>
                    <input
                      type="password"
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    />
                  </div>
                </>
              )}

              <div className="form-group">
                <label>Database Name</label>
                <input
                  type="text"
                  value={formData.database}
                  onChange={(e) => setFormData({ ...formData, database: e.target.value })}
                  required
                />
              </div>

              <div className="form-actions">
                <button type="button" onClick={() => setShowForm(false)}>
                  Cancel
                </button>
                <button type="submit">Connect</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}