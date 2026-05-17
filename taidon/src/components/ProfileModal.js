import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';

const ProfileModal = ({ isOpen, onClose }) => {
  const { user, logout, updateProfile, changePassword } = useAuth();
  const [activeTab, setActiveTab] = useState('profile'); // 'profile' или 'security'
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  // Данные профиля
  const [profileData, setProfileData] = useState({
    name: user?.name || '',
    email: user?.email || ''
  });

  // Данные для смены пароля
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const [errors, setErrors] = useState({});
  const [successMessage, setSuccessMessage] = useState('');

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const handleProfileInputChange = (e) => {
    const { name, value } = e.target;
    setProfileData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Очищаем ошибки
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handlePasswordInputChange = (e) => {
    const { name, value } = e.target;
    setPasswordData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Очищаем ошибки
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateProfileForm = () => {
    const newErrors = {};

    if (!profileData.name) {
      newErrors.name = 'Имя обязательно';
    } else if (profileData.name.length < 2) {
      newErrors.name = 'Имя должно содержать минимум 2 символа';
    }

    if (!profileData.email) {
      newErrors.email = 'Email обязателен';
    } else if (!/\S+@\S+\.\S+/.test(profileData.email)) {
      newErrors.email = 'Неверный формат email';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validatePasswordForm = () => {
    const newErrors = {};

    if (!passwordData.currentPassword) {
      newErrors.currentPassword = 'Введите текущий пароль';
    }

    if (!passwordData.newPassword) {
      newErrors.newPassword = 'Введите новый пароль';
    } else if (passwordData.newPassword.length < 6) {
      newErrors.newPassword = 'Пароль должен содержать минимум 6 символов';
    }

    if (!passwordData.confirmPassword) {
      newErrors.confirmPassword = 'Подтвердите новый пароль';
    } else if (passwordData.newPassword !== passwordData.confirmPassword) {
      newErrors.confirmPassword = 'Пароли не совпадают';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleProfileSave = async () => {
    if (!validateProfileForm()) {
      return;
    }

    setIsLoading(true);
    setSuccessMessage('');

    try {
      const result = await updateProfile(profileData);
      
      if (result.success) {
        setIsEditing(false);
        setSuccessMessage('Профиль успешно обновлен');
        setTimeout(() => setSuccessMessage(''), 3000);
      } else {
        setErrors({ general: result.error });
      }
    } catch (error) {
      setErrors({ general: 'Произошла ошибка при обновлении профиля' });
    } finally {
      setIsLoading(false);
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    
    if (!validatePasswordForm()) {
      return;
    }

    setIsLoading(true);
    setSuccessMessage('');

    try {
      const result = await changePassword(passwordData.currentPassword, passwordData.newPassword);
      
      if (result.success) {
        setPasswordData({
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        });
        setSuccessMessage('Пароль успешно изменен');
        setTimeout(() => setSuccessMessage(''), 3000);
      } else {
        setErrors({ general: result.error });
      }
    } catch (error) {
      setErrors({ general: 'Произошла ошибка при изменении пароля' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    onClose();
  };

  const cancelEdit = () => {
    setIsEditing(false);
    setProfileData({
      name: user?.name || '',
      email: user?.email || ''
    });
    setErrors({});
  };

  if (!isOpen || !user) return null;

  return (
    <div className="modal-overlay" onClick={handleOverlayClick}>
      <div className="modal-content profile-modal">
        <div className="modal-header">
          <h2>Личный кабинет</h2>
          <button className="modal-close" onClick={onClose}>
            ✕
          </button>
        </div>

        <div className="modal-body">
          {successMessage && (
            <div className="success-message">
              {successMessage}
            </div>
          )}

          {errors.general && (
            <div className="error-message general-error">
              {errors.general}
            </div>
          )}

          <div className="profile-tabs">
            <button 
              className={`tab-button ${activeTab === 'profile' ? 'active' : ''}`}
              onClick={() => setActiveTab('profile')}
            >
              Профиль
            </button>
            <button
              className={`tab-button ${activeTab === 'security' ? 'active' : ''}`}
              onClick={() => setActiveTab('security')}
            >
              Изменить пароль
            </button>
          </div>

          {activeTab === 'profile' && (
            <div className="tab-content">
              <div className="profile-info">
                <div className="user-avatar">
                  <div className="avatar-placeholder">
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                </div>

                <div className="profile-form">
                  <div className="form-group">
                    <label htmlFor="profile-name">Имя</label>
                    <input
                      type="text"
                      id="profile-name"
                      name="name"
                      value={profileData.name}
                      onChange={handleProfileInputChange}
                      disabled={!isEditing}
                      className={errors.name ? 'error' : ''}
                    />
                    {errors.name && <span className="error-message">{errors.name}</span>}
                  </div>

                  <div className="form-group">
                    <label htmlFor="profile-email">Email</label>
                    <input
                      type="email"
                      id="profile-email"
                      name="email"
                      value={profileData.email}
                      onChange={handleProfileInputChange}
                      disabled={!isEditing}
                      className={errors.email ? 'error' : ''}
                    />
                    {errors.email && <span className="error-message">{errors.email}</span>}
                  </div>

                  <div className="profile-actions">
                    {!isEditing ? (
                      <button 
                        className="btn btn-primary"
                        onClick={() => setIsEditing(true)}
                      >
                        Редактировать
                      </button>
                    ) : (
                      <div className="edit-actions">
                        <button 
                          className="btn btn-success"
                          onClick={handleProfileSave}
                          disabled={isLoading}
                        >
                          {isLoading ? 'Сохранение...' : 'Сохранить'}
                        </button>
                        <button 
                          className="btn btn-secondary"
                          onClick={cancelEdit}
                          disabled={isLoading}
                        >
                          Отмена
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'security' && (
            <div className="tab-content">
              <form onSubmit={handlePasswordChange} className="password-form">
                <div className="form-group">
                  <label htmlFor="current-password">Текущий пароль</label>
                  <input
                    type="password"
                    id="current-password"
                    name="currentPassword"
                    value={passwordData.currentPassword}
                    onChange={handlePasswordInputChange}
                    className={errors.currentPassword ? 'error' : ''}
                    placeholder="Введите текущий пароль"
                  />
                  {errors.currentPassword && <span className="error-message">{errors.currentPassword}</span>}
                </div>

                <div className="form-group">
                  <label htmlFor="new-password">Новый пароль</label>
                  <input
                    type="password"
                    id="new-password"
                    name="newPassword"
                    value={passwordData.newPassword}
                    onChange={handlePasswordInputChange}
                    className={errors.newPassword ? 'error' : ''}
                    placeholder="Введите новый пароль"
                  />
                  {errors.newPassword && <span className="error-message">{errors.newPassword}</span>}
                </div>

                <div className="form-group">
                  <label htmlFor="confirm-password">Подтверждение нового пароля</label>
                  <input
                    type="password"
                    id="confirm-password"
                    name="confirmPassword"
                    value={passwordData.confirmPassword}
                    onChange={handlePasswordInputChange}
                    className={errors.confirmPassword ? 'error' : ''}
                    placeholder="Подтвердите новый пароль"
                  />
                  {errors.confirmPassword && <span className="error-message">{errors.confirmPassword}</span>}
                </div>

                <button 
                  type="submit" 
                  className="btn btn-primary"
                  disabled={isLoading}
                >
                  {isLoading ? 'Изменение...' : 'Изменить пароль'}
                </button>
              </form>
            </div>
          )}

          <div className="profile-footer">
            <button 
              className="btn btn-danger logout-btn"
              onClick={handleLogout}
            >
              Выйти из аккаунта
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileModal;