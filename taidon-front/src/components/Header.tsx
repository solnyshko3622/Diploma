import { useNavigate } from 'react-router-dom';
import { useApp } from '../contexts/AppContext';
import { UserMenu } from './UserMenu';

interface HeaderProps {
  showNavigation?: boolean;
  currentView?: 'editor' | 'projects';
}

export function Header({ showNavigation = true, currentView = 'editor' }: HeaderProps) {
  const navigate = useNavigate();
  const {
    auth,
    theme,
    dispatch,
    setShowAuthForm,
    setAuthFormType,
  } = useApp();

  return (
    <header className="app-header">
      <div className="header-left">
        <h1>Taidon</h1>
        {showNavigation && (
          <div className="header-navigation">
            <button
              className={`nav-button ${currentView === 'projects' ? 'active' : ''}`}
              onClick={() => navigate('/projects')}
            >
              Все проекты
            </button>
          </div>
        )}
      </div>
      
      <div className="header-right">
        {auth.user ? (
          <UserMenu
            user={auth.user}
            theme={theme}
            onThemeToggle={() => dispatch({ type: 'SET_THEME', payload: theme === 'light' ? 'dark' : 'light' })}
            onLogout={() => {
              // Logout logic will be handled by the context
            }}
          />
        ) : (
          <div className="auth-buttons">
            <button
              className="btn-secondary"
              onClick={() => {
                setAuthFormType('login');
                setShowAuthForm(true);
              }}
            >
              Войти
            </button>
            <button
              className="btn-primary"
              onClick={() => {
                setAuthFormType('register');
                setShowAuthForm(true);
              }}
            >
              Зарегистрироваться
            </button>
          </div>
        )}
      </div>
    </header>
  );
}