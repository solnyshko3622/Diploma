import React, { useState } from 'react';

const NewFileModal = ({ isOpen, onClose, onCreateFile }) => {
  const [fileName, setFileName] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!fileName.trim()) {
      setError('Название файла обязательно');
      return;
    }

    if (fileName.trim().length < 2) {
      setError('Название должно содержать минимум 2 символа');
      return;
    }

    // Создаем новый файл
    onCreateFile(fileName.trim());
    
    // Закрываем модальное окно и очищаем форму
    setFileName('');
    setError('');
    onClose();
  };

  const handleInputChange = (e) => {
    setFileName(e.target.value);
    if (error) {
      setError('');
    }
  };

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const handleClose = () => {
    setFileName('');
    setError('');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={handleOverlayClick}>
      <div className="modal-content new-file-modal">
        <div className="modal-header">
          <h2>Создать новый файл</h2>
          <button className="modal-close" onClick={handleClose}>
            ✕
          </button>
        </div>

        <div className="modal-body">
          <form onSubmit={handleSubmit} className="new-file-form">
            <div className="form-group">
              <label htmlFor="file-name">Название файла</label>
              <input
                type="text"
                id="file-name"
                value={fileName}
                onChange={handleInputChange}
                className={error ? 'error' : ''}
                placeholder="Введите название SQL файла"
                autoFocus
              />
              {error && <span className="error-message">{error}</span>}
            </div>

            <div className="form-actions">
              <button 
                type="submit" 
                className="btn btn-primary"
              >
                Создать
              </button>
              <button 
                type="button" 
                className="btn btn-secondary"
                onClick={handleClose}
              >
                Отмена
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default NewFileModal;