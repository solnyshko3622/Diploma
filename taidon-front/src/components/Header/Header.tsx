import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import './Header.css';
import { useTheme } from '../../contexts/ThemeContext';
import { logout, getCurrentUser } from '../../api/Auth';

interface HeaderProps {
  showNavigation?: boolean;
  currentPage?: 'editor' | 'dashboard' | 'projects' | 'settings';
}

const Header: React.FC<HeaderProps> = ({ 
  showNavigation = true, 
  currentPage = 'projects' 
}) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { theme, toggleTheme } = useTheme();
  const user = getCurrentUser();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItems = [
    { id: 'editor', label: 'Editor', path: '/editor' },
    { id: 'dashboard', label: 'Dashboard', path: '/dashboard' },
    { id: 'projects', label: 'Projects', path: '/projects' },
    { id: 'settings', label: 'Settings', path: '/settings' },
  ];

  return (
    <header className="app-header">
      <div className="header-content">
        {/* Left Section */}
        <div className="header-left">
          <span className="header-logo" onClick={() => navigate('/')}>
            MONOLITH_SQL
          </span>
          
          {showNavigation && (
            <nav className="header-nav">
              {navItems.map((item) => (
                <a
                  key={item.id}
                  href={item.path}
                  className={`header-nav-link ${currentPage === item.id ? 'active' : ''}`}
                  onClick={(e) => {
                    e.preventDefault();
                    navigate(item.path);
                  }}
                >
                  {item.label}
                </a>
              ))}
            </nav>
          )}
        </div>

        {/* Right Section */}
        <div className="header-right">
          {/* Theme Toggle */}
          <button
            className="header-icon-button"
            onClick={toggleTheme}
            aria-label="Toggle theme"
            title={theme === 'light' ? 'Переключить на тёмную тему' : 'Переключить на светлую тему'}
          >
            <span className="material-icon">{theme === 'light' ? '🌙' : '☀️'}</span>
          </button>

          {/* Notifications */}
          <button className="header-icon-button" aria-label="Notifications">
            <span className="material-icon">🔔</span>
          </button>

          {/* Settings */}
          <button 
            className="header-icon-button" 
            aria-label="Settings"
            onClick={() => navigate('/settings')}
          >
            <span className="material-icon">⚙️</span>
          </button>

          {/* User Profile */}
          <div className="header-user-menu">
            <button className="header-user-avatar" aria-label="User menu">
              <div className="avatar-circle">
                {user?.username?.charAt(0).toUpperCase() || 'U'}
              </div>
            </button>
            
            {/* Dropdown Menu */}
            <div className="user-dropdown">
              <div className="dropdown-header">
                <div className="dropdown-user-info">
                  <p className="dropdown-username">{user?.username || 'User'}</p>
                  <p className="dropdown-email">{user?.email || 'user@example.com'}</p>
                </div>
              </div>
              <div className="dropdown-divider"></div>
              <div className="dropdown-menu">
                <button 
                  className="dropdown-item"
                  onClick={() => navigate('/profile')}
                >
                  <span className="dropdown-icon">👤</span>
                  Profile
                </button>
                <button 
                  className="dropdown-item"
                  onClick={() => navigate('/settings')}
                >
                  <span className="dropdown-icon">⚙️</span>
                  Settings
                </button>
                <div className="dropdown-divider"></div>
                <button 
                  className="dropdown-item danger"
                  onClick={handleLogout}
                >
                  <span className="dropdown-icon">🚪</span>
                  Logout
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
