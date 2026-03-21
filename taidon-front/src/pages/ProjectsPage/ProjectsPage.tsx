import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './projects_page.css';
import Header from '../../components/Header/Header';

interface Project {
  id: number;
  name: string;
  description: string;
  createdAt: string;
  updatedAt: string;
  owner?: {
    username: string;
  };
}

const ProjectsPage: React.FC = () => {
  const navigate = useNavigate();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    // TODO: Fetch projects from API
    // Placeholder data for now
    const mockProjects: Project[] = [
      {
        id: 1,
        name: 'Analytics Dashboard',
        description: 'Основной проект аналитики для отслеживания метрик пользователей',
        createdAt: '2026-01-15T10:00:00Z',
        updatedAt: '2026-03-20T15:30:00Z',
        owner: { username: 'admin' }
      },
      {
        id: 2,
        name: 'E-commerce Database',
        description: 'База данных для интернет-магазина с продуктами и заказами',
        createdAt: '2026-02-01T09:00:00Z',
        updatedAt: '2026-03-21T12:00:00Z',
        owner: { username: 'admin' }
      },
      {
        id: 3,
        name: 'User Management',
        description: 'Система управления пользователями и ролями',
        createdAt: '2026-02-10T14:00:00Z',
        updatedAt: '2026-03-19T16:45:00Z',
        owner: { username: 'admin' }
      }
    ];
    
    setTimeout(() => {
      setProjects(mockProjects);
      setLoading(false);
    }, 500);
  }, []);

  const filteredProjects = projects.filter(project =>
    project.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    project.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ru-RU', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  const handleCreateProject = () => {
    // TODO: Navigate to create project page or open modal
    console.log('Create new project');
  };

  const handleProjectClick = (projectId: number) => {
    navigate(`/editor/${projectId}`);
  };

  return (
    <div className="projects-page">
      {/* Header Component */}
      <Header currentPage="projects" />

      <main className="projects-content">
        {/* Header Section */}
        <section className="projects-header">
          <div className="header-top">
            <div>
              <h1 className="page-title">Мои проекты</h1>
              <p className="page-description">
                Управляйте вашими SQL-проектами и базами данных
              </p>
            </div>
            <button className="btn-primary btn-large" onClick={handleCreateProject}>
              <span className="btn-icon">+</span>
              Создать проект
            </button>
          </div>

          {/* Search Bar */}
          <div className="search-container">
            <div className="search-input-wrapper">
              <span className="search-icon">🔍</span>
              <input
                type="text"
                className="search-input"
                placeholder="Поиск проектов..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
        </section>

        {/* Projects Grid */}
        <section className="projects-section">
          {loading ? (
            <div className="loading-state">
              <div className="loading-spinner"></div>
              <p>Загрузка проектов...</p>
            </div>
          ) : filteredProjects.length === 0 ? (
            <div className="empty-state">
              <span className="empty-icon">📁</span>
              <h3 className="empty-title">
                {searchQuery ? 'Проекты не найдены' : 'Нет проектов'}
              </h3>
              <p className="empty-description">
                {searchQuery
                  ? 'Попробуйте изменить поисковый запрос'
                  : 'Создайте свой первый проект для начала работы'}
              </p>
              {!searchQuery && (
                <button className="btn-primary" onClick={handleCreateProject}>
                  Создать первый проект
                </button>
              )}
            </div>
          ) : (
            <div className="projects-grid">
              {filteredProjects.map((project) => (
                <div
                  key={project.id}
                  className="project-card"
                  onClick={() => handleProjectClick(project.id)}
                >
                  <div className="project-card-header">
                    <div className="project-icon">📊</div>
                    <div className="project-menu">⋮</div>
                  </div>
                  <div className="project-card-content">
                    <h3 className="project-name">{project.name}</h3>
                    <p className="project-description">{project.description}</p>
                  </div>
                  <div className="project-card-footer">
                    <div className="project-meta">
                      <span className="meta-item">
                        <span className="meta-icon">👤</span>
                        {project.owner?.username || 'Unknown'}
                      </span>
                      <span className="meta-item">
                        <span className="meta-icon">📅</span>
                        {formatDate(project.updatedAt)}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Stats Section */}
        {!loading && projects.length > 0 && (
          <section className="stats-section">
            <div className="stats-grid">
              <div className="stat-card">
                <span className="stat-icon">📊</span>
                <div className="stat-content">
                  <p className="stat-value">{projects.length}</p>
                  <p className="stat-label">Всего проектов</p>
                </div>
              </div>
              <div className="stat-card">
                <span className="stat-icon">⚡</span>
                <div className="stat-content">
                  <p className="stat-value">
                    {projects.filter(p => {
                      const updated = new Date(p.updatedAt);
                      const now = new Date();
                      const diffDays = (now.getTime() - updated.getTime()) / (1000 * 60 * 60 * 24);
                      return diffDays <= 7;
                    }).length}
                  </p>
                  <p className="stat-label">Активных за неделю</p>
                </div>
              </div>
              <div className="stat-card">
                <span className="stat-icon">🔒</span>
                <div className="stat-content">
                  <p className="stat-value">{projects.length}</p>
                  <p className="stat-label">Приватных</p>
                </div>
              </div>
            </div>
          </section>
        )}
      </main>
    </div>
  );
};

export default ProjectsPage;
