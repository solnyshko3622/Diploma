import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';

const AuthModal = ({ isOpen, onClose, initialMode = 'login' }) => {
  const [mode, setMode] = useState(initialMode); // 'login' или 'register'
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const { login, register } = useAuth();

  const resetForm = () => {
    setFormData({
      name: '',
      email: '',
      password: '',
      confirmPassword: ''
    });
    setErrors({});
  };

  const handleModeSwitch = (newMode) => {
    setMode(newMode);
    resetForm();
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Очищаем ошибку для этого поля
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    // Проверка email
    if (!formData.email) {
      newErrors.email = 'Email обязателен';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Неверный формат email';
    }

    // Проверка пароля
    if (!formData.password) {
      newErrors.password = 'Пароль обязателен';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Пароль должен содержать минимум 6 символов';
    }

    // Дополнительные проверки для регистрации
    if (mode === 'register') {
      if (!formData.name) {
        newErrors.name = 'Имя обязательно';
      } else if (formData.name.length < 2) {
        newErrors.name = 'Имя должно содержать минимум 2 символа';
      }

      if (!formData.confirmPassword) {
        newErrors.confirmPassword = 'Подтверждение пароля обязательно';
      } else if (formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = 'Пароли не совпадают';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      let result;
      
      if (mode === 'login') {
        result = await login(formData.email, formData.password);
      } else {
        result = await register({
          name: formData.name,
          email: formData.email,
          password: formData.password
        });
      }

      if (result.success) {
        resetForm();
        onClose();
      } else {
        setErrors({ general: result.error });
      }
    } catch (error) {
      setErrors({ general: 'Произошла ошибка. Попробуйте снова.' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={handleOverlayClick}>
      <div className="modal-content auth-modal">
        <div className="modal-header">
          <h2>{mode === 'login' ? 'Вход в систему' : 'Регистрация'}</h2>
          <button className="modal-close" onClick={onClose}>
            ✕
          </button>
        </div>

        <div className="modal-body">
          {errors.general && (
            <div className="error-message general-error">
              {errors.general}
            </div>
          )}

          <form onSubmit={handleSubmit} className="auth-form">
            {mode === 'register' && (
              <div className="form-group">
                <label htmlFor="name">Имя</label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className={errors.name ? 'error' : ''}
                  placeholder="Введите ваше имя"
                />
                {errors.name && <span className="error-message">{errors.name}</span>}
              </div>
            )}

            <div className="form-group">
              <label htmlFor="email">Email</label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                className={errors.email ? 'error' : ''}
                placeholder="Введите ваш email"
              />
              {errors.email && <span className="error-message">{errors.email}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="password">Пароль</label>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                className={errors.password ? 'error' : ''}
                placeholder="Введите пароль"
              />
              {errors.password && <span className="error-message">{errors.password}</span>}
            </div>

            {mode === 'register' && (
              <div className="form-group">
                <label htmlFor="confirmPassword">Подтверждение пароля</label>
                <input
                  type="password"
                  id="confirmPassword"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  className={errors.confirmPassword ? 'error' : ''}
                  placeholder="Подтвердите пароль"
                />
                {errors.confirmPassword && <span className="error-message">{errors.confirmPassword}</span>}
              </div>
            )}

            <button 
              type="submit" 
              className="btn btn-primary auth-submit"
              disabled={isLoading}
            >
              {isLoading ? 'Загрузка...' : (mode === 'login' ? 'Войти' : 'Зарегистрироваться')}
            </button>
          </form>

          <div className="auth-switch">
            {mode === 'login' ? (
              <p>
                Нет аккаунта?{' '}
                <button 
                  type="button" 
                  className="link-button"
                  onClick={() => handleModeSwitch('register')}
                >
                  Зарегистрироваться
                </button>
              </p>
            ) : (
              <p>
                Уже есть аккаунт?{' '}
                <button 
                  type="button" 
                  className="link-button"
                  onClick={() => handleModeSwitch('login')}
                >
                  Войти
                </button>
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthModal;