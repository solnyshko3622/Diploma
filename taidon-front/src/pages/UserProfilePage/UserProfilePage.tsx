import React, { useState } from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import './user_profile_page.css';

interface UserProfile {
  firstName: string;
  lastName: string;
  email: string;
  organization: string;
  role: string;
  avatar: string;
  preferences: {
    theme: 'dark' | 'light';
    sqlDialect: string;
    language: string;
  };
  security: {
    twoFactorEnabled: boolean;
    lastPasswordUpdate: string;
  };
  integrations: {
    github: boolean;
    google: boolean;
  };
}

const UserProfilePage: React.FC = () => {
  const { theme, toggleTheme } = useTheme();
  
  const [profile, setProfile] = useState<UserProfile>({
    firstName: 'Алексей',
    lastName: 'Иванов',
    email: 'alexey.ivanov@example.com',
    organization: 'Taidon Systems',
    role: 'Senior Data Architect',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
    preferences: {
      theme: theme,
      sqlDialect: 'PostgreSQL',
      language: 'Русский'
    },
    security: {
      twoFactorEnabled: true,
      lastPasswordUpdate: '3 месяца назад'
    },
    integrations: {
      github: true,
      google: false
    }
  });

  const [activeTab, setActiveTab] = useState('profile');

  const handleInputChange = (field: string, value: string) => {
    setProfile(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handlePreferenceChange = (field: string, value: string) => {
    setProfile(prev => ({
      ...prev,
      preferences: {
        ...prev.preferences,
        [field]: value
      }
    }));
  };

  const handleSecurityToggle = (field: string) => {
    setProfile(prev => ({
      ...prev,
      security: {
        ...prev.security,
        [field]: !prev.security[field as keyof typeof prev.security]
      }
    }));
  };

  const handleIntegrationToggle = (service: string) => {
    setProfile(prev => ({
      ...prev,
      integrations: {
        ...prev.integrations,
        [service]: !prev.integrations[service as keyof typeof prev.integrations]
      }
    }));
  };

  return (
    <div className="user-profile-page">
      {/* Top Navigation */}
      <nav className="profile-nav">
        <div className="nav-content">
          <div className="nav-left">
            <span className="logo">Taidon</span>
            <div className="nav-links">
              <a href="/editor">Редактор</a>
              <a href="/dashboard">Панель</a>
              <a href="/projects">Проекты</a>
              <a href="/profile" className="active">Настройки</a>
            </div>
          </div>
          <div className="nav-right">
            <button className="notification-btn">
              <span className="material-icons">notifications</span>
            </button>
            <button className="help-btn">
              <span className="material-icons">help_outline</span>
            </button>
            <div className="user-avatar-small">
              <img src={profile.avatar} alt="User avatar" />
            </div>
          </div>
        </div>
      </nav>

      <div className="profile-layout">
        {/* Sidebar Navigation */}
        <aside className="profile-sidebar">
          <div className="sidebar-header">
            <h2>Аккаунт</h2>
            <p>Управление рабочим пространством</p>
          </div>
          <nav className="sidebar-nav">
            <button 
              className={`sidebar-item ${activeTab === 'profile' ? 'active' : ''}`}
              onClick={() => setActiveTab('profile')}
            >
              <span className="material-icons">person</span>
              Профиль
            </button>
            <button 
              className={`sidebar-item ${activeTab === 'security' ? 'active' : ''}`}
              onClick={() => setActiveTab('security')}
            >
              <span className="material-icons">shield</span>
              Безопасность
            </button>
            <button 
              className={`sidebar-item ${activeTab === 'billing' ? 'active' : ''}`}
              onClick={() => setActiveTab('billing')}
            >
              <span className="material-icons">payments</span>
              Оплата
            </button>
            <button 
              className={`sidebar-item ${activeTab === 'api' ? 'active' : ''}`}
              onClick={() => setActiveTab('api')}
            >
              <span className="material-icons">key</span>
              API Ключи
            </button>
            <button 
              className={`sidebar-item ${activeTab === 'preferences' ? 'active' : ''}`}
              onClick={() => setActiveTab('preferences')}
            >
              <span className="material-icons">settings_suggest</span>
              Настройки
            </button>
          </nav>
        </aside>

        {/* Main Content */}
        <main className="profile-main">
          <header className="profile-header">
            <h1>Профиль пользователя</h1>
            <p>Обновите свою личную информацию и настройки.</p>
          </header>

          <div className="profile-content">
            <div className="profile-left">
              {/* Profile Overview Card */}
              <section className="profile-overview">
                <div className="avatar-section">
                  <div className="avatar-container">
                    <img src={profile.avatar} alt="Profile avatar" className="profile-avatar" />
                    <button className="avatar-edit-btn">
                      <span className="material-icons">edit</span>
                    </button>
                  </div>
                </div>
                <div className="profile-info">
                  <h3>{profile.firstName} {profile.lastName}</h3>
                  <p className="role">{profile.role}</p>
                  <p className="email">{profile.email}</p>
                  <div className="badges">
                    <span className="badge">Администратор</span>
                    <span className="badge">Доступ к продакшену</span>
                  </div>
                </div>
              </section>

              {/* Personal Information Form */}
              <section className="personal-info">
                <h2>
                  <span className="section-indicator"></span>
                  Личная информация
                </h2>
                <div className="form-grid">
                  <div className="form-group">
                    <label>Имя</label>
                    <input 
                      type="text" 
                      value={profile.firstName}
                      onChange={(e) => handleInputChange('firstName', e.target.value)}
                    />
                  </div>
                  <div className="form-group">
                    <label>Фамилия</label>
                    <input 
                      type="text" 
                      value={profile.lastName}
                      onChange={(e) => handleInputChange('lastName', e.target.value)}
                    />
                  </div>
                  <div className="form-group full-width">
                    <label>Организация</label>
                    <input 
                      type="text" 
                      value={profile.organization}
                      onChange={(e) => handleInputChange('organization', e.target.value)}
                    />
                  </div>
                </div>
                <div className="form-actions">
                  <button className="btn-primary">Обновить информацию</button>
                </div>
              </section>

              {/* Security Section */}
              <section className="security-section">
                <h2>
                  <span className="section-indicator error"></span>
                  Безопасность и доступ
                </h2>
                <div className="security-items">
                  <div className="security-item">
                    <div className="security-info">
                      <p className="security-title">Изменить пароль</p>
                      <p className="security-subtitle">Последнее обновление {profile.security.lastPasswordUpdate}</p>
                    </div>
                    <button className="btn-secondary">Обновить</button>
                  </div>
                  <div className="security-item">
                    <div className="security-info-with-icon">
                      <div className="security-icon">
                        <span className="material-icons">verified_user</span>
                      </div>
                      <div>
                        <p className="security-title">Двухфакторная аутентификация</p>
                        <p className="security-subtitle enabled">Включена</p>
                      </div>
                    </div>
                    <div className="toggle-switch">
                      <input 
                        type="checkbox" 
                        checked={profile.security.twoFactorEnabled}
                        onChange={() => handleSecurityToggle('twoFactorEnabled')}
                      />
                      <span className="slider"></span>
                    </div>
                  </div>
                </div>
              </section>
            </div>

            <div className="profile-right">
              {/* Preferences Card */}
              <section className="preferences-card">
                <h2>Настройки</h2>
                <div className="preferences-content">
                  <div className="preference-group">
                    <label>Тема оформления</label>
                    <div className="theme-buttons">
                      <button 
                        className={`theme-btn ${profile.preferences.theme === 'dark' ? 'active' : ''}`}
                        onClick={() => {
                          handlePreferenceChange('theme', 'dark');
                          if (theme !== 'dark') toggleTheme();
                        }}
                      >
                        Тёмная
                      </button>
                      <button 
                        className={`theme-btn ${profile.preferences.theme === 'light' ? 'active' : ''}`}
                        onClick={() => {
                          handlePreferenceChange('theme', 'light');
                          if (theme !== 'light') toggleTheme();
                        }}
                      >
                        Светлая
                      </button>
                    </div>
                  </div>
                  <div className="preference-group">
                    <label>SQL диалект по умолчанию</label>
                    <select 
                      value={profile.preferences.sqlDialect}
                      onChange={(e) => handlePreferenceChange('sqlDialect', e.target.value)}
                    >
                      <option>PostgreSQL</option>
                      <option>MySQL</option>
                      <option>Snowflake</option>
                      <option>BigQuery</option>
                    </select>
                  </div>
                  <div className="preference-group">
                    <label>Язык интерфейса</label>
                    <select 
                      value={profile.preferences.language}
                      onChange={(e) => handlePreferenceChange('language', e.target.value)}
                    >
                      <option>Русский</option>
                      <option>English (US)</option>
                      <option>Deutsch</option>
                      <option>日本語</option>
                    </select>
                  </div>
                </div>
              </section>

              {/* Integrations */}
              <section className="integrations-section">
                <h2>Интеграции</h2>
                <div className="integration-items">
                  <div className="integration-item">
                    <div className="integration-info">
                      <div className="integration-icon">
                        <img src="https://github.githubassets.com/images/modules/logos_page/GitHub-Mark.png" alt="GitHub" />
                      </div>
                      <span>GitHub</span>
                    </div>
                    <span className={`integration-status ${profile.integrations.github ? 'connected' : ''}`}>
                      {profile.integrations.github ? 'Подключено' : 'Подключить'}
                    </span>
                  </div>
                  <div className="integration-item">
                    <div className="integration-info">
                      <div className="integration-icon">
                        <img src="https://developers.google.com/identity/images/g-logo.png" alt="Google" />
                      </div>
                      <span>Google</span>
                    </div>
                    <button 
                      className="integration-connect"
                      onClick={() => handleIntegrationToggle('google')}
                    >
                      {profile.integrations.google ? 'Отключить' : 'Подключить'}
                    </button>
                  </div>
                </div>
              </section>

              {/* Info Box */}
              <div className="info-box">
                <div className="info-content">
                  <span className="material-icons">info</span>
                  <p>
                    Ваши данные защищены с помощью шифрования AES-256. Интегрированные аккаунты используются только для аутентификации и синхронизации репозиториев.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default UserProfilePage;