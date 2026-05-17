import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { backendClient } from '../api/backendClient';
import ProjectCard from './ProjectCard';
import AuthModal from './AuthModal';
import ProfileModal from './ProfileModal';

const ProjectsPage = ({ onOpenProject, onCreateProject }) => {
  const { user, isAuthenticated } = useAuth();
  const [isDarkTheme, setIsDarkTheme] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState('login');
  
  // Состояние для проектов
  const [projects, setProjects] = useState([]);
  const [sharedProjects, setSharedProjects] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // Загрузка проектов при монтировании компонента
  useEffect(() => {
    if (isAuthenticated) {
      loadProjects();
    }
  }, [isAuthenticated]);

  const loadProjects = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const projectsData = await backendClient.getProjects();
      setProjects(projectsData.owned_projects || []);
      setSharedProjects(projectsData.shared_projects || []);
    } catch (error) {
      console.error('Error loading projects:', error);
      setError('Не удалось загрузить проекты');
    } finally {
      setIsLoading(false);
    }
  };

  // Объединяем все проекты для отображения
  const allProjects = [...projects, ...sharedProjects];

  const toggleTheme = () => {
    setIsDarkTheme(prev => !prev);
  };

  const openAuthModal = (mode = 'login') => {
    setAuthModalMode(mode);
    setIsAuthModalOpen(true);
  };

  const closeAuthModal = () => {
    setIsAuthModalOpen(false);
  };

  const openProfileModal = () => {
    setIsProfileModalOpen(true);
  };

  const closeProfileModal = () => {
    setIsProfileModalOpen(false);
  };

  const handleCreateProject = async () => {
    if (!isAuthenticated) {
      openAuthModal('login');
      return;
    }

    try {
      setIsLoading(true);
      
      const newProject = await backendClient.createProject({
        name: 'Новый проект',
        description: 'Описание нового проекта',
        is_public: false
      });

      // Обновляем список проектов
      await loadProjects();
      
      // Открываем созданный проект
      if (onOpenProject) {
        onOpenProject(newProject);
      }
    } catch (error) {
      console.error('Error creating project:', error);
      setError('Не удалось создать проект');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={`app projects-page ${isDarkTheme ? 'dark' : 'light'}`}>
      {/* Хэдер */}
      <div className="projects-header">
        <div className="header-left">
          <h1 className="page-title">
            <span className="title-icon"></span>
            Мои проекты
          </h1>
        </div>
        
        <div className="header-right">
          <button onClick={handleCreateProject} className="btn btn-primary">
            <span>➕</span>
            Новый проект
          </button>
          
          <button onClick={toggleTheme} className="btn btn-theme">
            <span>{isDarkTheme ? '☀️' : '🌙'}</span>
            {isDarkTheme ? 'Светлая тема' : 'Тёмная тема'}
          </button>
          
          {/* Блок аутентификации */}
          <div className="auth-section">
            {isAuthenticated ? (
              <div className="user-menu">
                <button
                  className="user-avatar-btn"
                  onClick={openProfileModal}
                  title={`Личный кабинет - ${user.full_name || user.username || 'Пользователь'}`}
                >
                  <div className="user-avatar">
                    {(user.full_name || user.username || 'П').charAt(0).toUpperCase()}
                  </div>
                  <span className="user-name">{user.full_name || user.username || 'Пользователь'}</span>
                </button>
              </div>
            ) : (
              <div className="auth-buttons">
                <button
                  className="btn btn-outline"
                  onClick={() => openAuthModal('login')}
                >
                  Войти
                </button>
                <button
                  className="btn btn-primary"
                  onClick={() => openAuthModal('register')}
                >
                  Регистрация
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Основной контент */}
      <div className="projects-content">
        <div className="projects-container">
          {/* Отображение ошибки */}
          {error && (
            <div className="error-message">
              <span className="error-icon">⚠️</span>
              <span>{error}</span>
              <button onClick={loadProjects} className="btn btn-theme">
                Повторить
              </button>
            </div>
          )}

          {/* Состояние загрузки */}
          {isLoading && !error && (
            <div className="loading-state">
              <div className="loading-spinner">⏳</div>
              <p>Загрузка проектов...</p>
            </div>
          )}

          {/* Отображение проектов */}
          {!isLoading && !error && (
            <>
              {allProjects.length > 0 ? (
                <div className="projects-grid">
                  {allProjects.map(project => (
                    <ProjectCard
                      key={project.id}
                      project={project}
                      onOpenProject={onOpenProject}
                    />
                  ))}
                </div>
              ) : (
                <div className="empty-state">
                  <div className="empty-icon">📊</div>
                  <h3>Пока нет проектов</h3>
                  <p>Создайте свой первый проект для работы с SQL запросами</p>
                  {isAuthenticated ? (
                    <button onClick={handleCreateProject} className="btn btn-primary">
                      <span>➕</span>
                      Создать проект
                    </button>
                  ) : (
                    <button onClick={() => openAuthModal('login')} className="btn btn-primary">
                      <span>🔐</span>
                      Войти для создания проектов
                    </button>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Модальные окна */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={closeAuthModal}
        initialMode={authModalMode}
      />
      
      <ProfileModal
        isOpen={isProfileModalOpen}
        onClose={closeProfileModal}
      />
    </div>
  );
};

export default ProjectsPage;