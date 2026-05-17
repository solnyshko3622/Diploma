import React, { useState } from 'react';

const QueryResults = ({ results, isVisible, onClose }) => {
  const [activeTab, setActiveTab] = useState('data');

  if (!isVisible || !results) {
    return null;
  }

  const { success, data, columns, errors, executionTime } = results;

  const renderDataTable = () => {
    if (!data || data.length === 0) {
      return (
        <div className="no-data">
          <p>Запрос выполнен успешно, но не вернул данных.</p>
        </div>
      );
    }

    return (
      <div className="results-table-container">
        <div className="results-info">
          <span className="row-count">{data.length} строк(и)</span>
          <span className="execution-time">Время выполнения: {executionTime}мс</span>
        </div>
        <div className="table-wrapper">
          <table className="results-table">
            <thead>
              <tr>
                <th className="row-number">#</th>
                {columns.map((column, index) => (
                  <th key={index} className="column-header">
                    {column}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {data.map((row, rowIndex) => (
                <tr key={rowIndex} className={rowIndex % 2 === 0 ? 'even-row' : 'odd-row'}>
                  <td className="row-number">{rowIndex + 1}</td>
                  {columns.map((column, colIndex) => (
                    <td key={colIndex} className="table-cell">
                      <div className="cell-content" title={row[column]}>
                        {row[column] || ''}
                      </div>
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  const renderErrors = () => {
    if (!errors || errors.length === 0) {
      return (
        <div className="no-errors">
          <p>Ошибок не обнаружено.</p>
        </div>
      );
    }

    return (
      <div className="errors-container">
        {errors.map((error, index) => {
          // Handle both string errors and detailed error objects
          const isDetailedError = typeof error === 'object' && error !== null;
          const errorMessage = isDetailedError ? (error.details || error.message) : error;
          const errorCode = isDetailedError ? error.code : null;
          const originalMessage = isDetailedError ? error.originalMessage : null;
          
          return (
            <div key={index} className="error-item">
              <div className="error-icon">⚠️</div>
              <div className="error-content">
                {errorCode && (
                  <div className="error-code">
                    <strong>Код ошибки:</strong> {errorCode}
                  </div>
                )}
                <div className="error-message">{errorMessage}</div>
                {originalMessage && originalMessage !== errorMessage && (
                  <div className="error-original">
                    <strong>Исходное сообщение:</strong> {originalMessage}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  const renderMessages = () => {
    const messages = [];
    
    if (success) {
      messages.push({
        type: 'success',
        text: `Запрос выполнен успешно за ${executionTime}мс`
      });
      
      if (data && data.length > 0) {
        messages.push({
          type: 'info',
          text: `Получено ${data.length} строк(и)`
        });
      }
    } else {
      messages.push({
        type: 'error',
        text: 'Запрос завершился с ошибкой'
      });
    }

    return (
      <div className="messages-container">
        {messages.map((message, index) => (
          <div key={index} className={`message-item ${message.type}`}>
            <div className="message-icon">
              {message.type === 'success' && '✅'}
              {message.type === 'error' && '❌'}
              {message.type === 'info' && 'ℹ️'}
            </div>
            <div className="message-text">{message.text}</div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="query-results-panel">
      <div className="results-header">
        <div className="results-title">
          <h3>Результаты выполнения</h3>
          <div className={`status-indicator ${success ? 'success' : 'error'}`}>
            {success ? '✅ Успешно' : '❌ Ошибка'}
          </div>
        </div>
        <button className="close-results-btn" onClick={onClose} title="Закрыть результаты">
          ✕
        </button>
      </div>

      <div className="results-tabs">
        <button
          className={`tab-btn ${activeTab === 'data' ? 'active' : ''}`}
          onClick={() => setActiveTab('data')}
        >
          Данные {data && data.length > 0 && `(${data.length})`}
        </button>
        <button
          className={`tab-btn ${activeTab === 'messages' ? 'active' : ''}`}
          onClick={() => setActiveTab('messages')}
        >
          Сообщения
        </button>
        {errors && errors.length > 0 && (
          <button
            className={`tab-btn ${activeTab === 'errors' ? 'active' : ''} error-tab`}
            onClick={() => setActiveTab('errors')}
          >
            Ошибки ({errors.length})
          </button>
        )}
      </div>

      <div className="results-content">
        {activeTab === 'data' && renderDataTable()}
        {activeTab === 'messages' && renderMessages()}
        {activeTab === 'errors' && renderErrors()}
      </div>
    </div>
  );
};

export default QueryResults;