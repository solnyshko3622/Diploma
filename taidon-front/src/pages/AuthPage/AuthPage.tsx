import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './auth_page.css';
import { useTheme } from '../../contexts/ThemeContext';
import { login, register } from '../../api/Auth';

const AuthPage: React.FC = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    username: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    // Validation
    if (!formData.email || !formData.password) {
      setError('Пожалуйста, заполните все поля');
      setLoading(false);
      return;
    }

    if (!isLogin) {
      if (!formData.username) {
        setError('Пожалуйста, введите имя пользователя');
        setLoading(false);
        return;
      }
      if (formData.password !== formData.confirmPassword) {
        setError('Пароли не совпадают');
        setLoading(false);
        return;
      }
      if (formData.password.length < 6) {
        setError('Пароль должен содержать минимум 6 символов');
        setLoading(false);
        return;
      }
    }

    try {
      if (isLogin) {
        // Login
        await login({
          identifier: formData.email,
          password: formData.password
        });
      } else {
        // Register
        await register({
          username: formData.username,
          email: formData.email,
          password: formData.password
        });
      }
      
      // Redirect to projects page after successful auth
      navigate('/projects');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Произошла ошибка. Попробуйте снова.';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const toggleMode = () => {
    setIsLogin(!isLogin);
    setError('');
    setFormData({
      email: '',
      password: '',
      confirmPassword: '',
      username: ''
    });
  };

  return (
    <div className="auth-page">
      {/* Navigation */}
      <nav className="auth-nav">
        <div className="nav-content">
          <div className="nav-left">
            <span className="logo" onClick={() => navigate('/')}>Taidon</span>
          </div>
          <div className="nav-right">
            <button
              className="theme-toggle"
              onClick={toggleTheme}
              aria-label="Toggle theme"
              title={theme === 'light' ? 'Переключить на тёмную тему' : 'Переключить на светлую тему'}
            >
              {theme === 'light' ? '🌙' : '☀️'}
            </button>
          </div>
        </div>
      </nav>

      {/* Auth Container */}
      <div className="auth-container">
        <div className="auth-card">
          {/* Header */}
          <div className="auth-header">
            <h1 className="auth-title">
              {isLogin ? 'Добро пожаловать' : 'Создать аккаунт'}
            </h1>
            <p className="auth-subtitle">
              {isLogin 
                ? 'Войдите в свой аккаунт для продолжения' 
                : 'Зарегистрируйтесь для начала работы с Taidon'}
            </p>
          </div>

          {/* Form */}
          <form className="auth-form" onSubmit={handleSubmit}>
            {!isLogin && (
              <div className="form-group">
                <label htmlFor="username" className="form-label">
                  Имя пользователя
                </label>
                <input
                  type="text"
                  id="username"
                  name="username"
                  className="form-input"
                  placeholder="Введите имя пользователя"
                  value={formData.username}
                  onChange={handleInputChange}
                  disabled={loading}
                />
              </div>
            )}

            <div className="form-group">
              <label htmlFor="email" className="form-label">
                Email
              </label>
              <input
                type="email"
                id="email"
                name="email"
                className="form-input"
                placeholder="your@email.com"
                value={formData.email}
                onChange={handleInputChange}
                disabled={loading}
              />
            </div>

            <div className="form-group">
              <label htmlFor="password" className="form-label">
                Пароль
              </label>
              <input
                type="password"
                id="password"
                name="password"
                className="form-input"
                placeholder="••••••••"
                value={formData.password}
                onChange={handleInputChange}
                disabled={loading}
              />
            </div>

            {!isLogin && (
              <div className="form-group">
                <label htmlFor="confirmPassword" className="form-label">
                  Подтвердите пароль
                </label>
                <input
                  type="password"
                  id="confirmPassword"
                  name="confirmPassword"
                  className="form-input"
                  placeholder="••••••••"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  disabled={loading}
                />
              </div>
            )}

            {error && (
              <div className="error-message">
                <span className="error-icon">⚠️</span>
                {error}
              </div>
            )}

            {isLogin && (
              <div className="form-footer">
                <a href="#" className="forgot-password">
                  Забыли пароль?
                </a>
              </div>
            )}

            <button 
              type="submit" 
              className="btn-primary btn-large btn-full"
              disabled={loading}
            >
              {loading ? 'Загрузка...' : (isLogin ? 'Войти' : 'Зарегистрироваться')}
            </button>
          </form>

          {/* Toggle Mode */}
          <div className="auth-toggle">
            <span className="toggle-text">
              {isLogin ? 'Нет аккаунта?' : 'Уже есть аккаунт?'}
            </span>
            <button 
              type="button" 
              className="toggle-button" 
              onClick={toggleMode}
              disabled={loading}
            >
              {isLogin ? 'Зарегистрироваться' : 'Войти'}
            </button>
          </div>

          {/* Divider */}
          <div className="divider">
            <span className="divider-text">или</span>
          </div>

          {/* Social Auth */}
          <div className="social-auth">
            <button type="button" className="social-button" disabled={loading}>
              <span className="social-icon">🔗</span>
              <span>Продолжить с GitHub</span>
            </button>
            <button type="button" className="social-button" disabled={loading}>
              <span className="social-icon">📧</span>
              <span>Продолжить с Google</span>
            </button>
          </div>
        </div>

        {/* Side Panel */}
        <div className="auth-side-panel">
          <div className="side-panel-content">
            <div className="side-panel-badge">
              <span className="badge-icon">⚡</span>
              <span className="badge-text">Бета версия</span>
            </div>
            <h2 className="side-panel-title">
              Упрощаем работу с SQL <span className="gradient-text">улучшаем пользовательский опыт</span>.
            </h2>
            <p className="side-panel-description">
              Простой и лёгкий SQL-интерфейс для работы с данными. Управляйте вашими базами данных быстро и просто.
            </p>
            <div className="side-panel-features">
              <div className="feature-item">
                <span className="feature-icon">✓</span>
                <span className="feature-text">Многовкладочный редактор</span>
              </div>
              <div className="feature-item">
                <span className="feature-icon">✓</span>
                <span className="feature-text">Удобная подсветка синтаксиса</span>
              </div>
              <div className="feature-item">
                <span className="feature-icon">✓</span>
                <span className="feature-text">Быстрое выполнение запросов</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;
