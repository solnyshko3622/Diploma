import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../contexts/AppContext';
import type { Project } from '../types';
import { Header } from './Header';

export function ProjectsPage() {
  const navigate = useNavigate();
  const {
    projects,
    currentProjectId,
    // auth,
    createProject,
    updateProject,
    deleteProject,
    selectProject,
  } = useApp();

  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [newProjectName, setNewProjectName] = useState('');
  const [newProjectDescription, setNewProjectDescription] = useState('');

  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProjectName.trim()) return;

    const success = await createProject(newProjectName, newProjectDescription);
    if (success) {
      setNewProjectName('');
      setNewProjectDescription('');
      setShowCreateForm(false);
    }
  };

  const handleEditProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProject) return;

    const success = await updateProject(editingProject);
    if (success) {
      setEditingProject(null);
    }
  };

  const handleDeleteProject = async (projectId: string) => {
    if (window.confirm('Вы уверены, что хотите удалить этот проект?')) {
      await deleteProject(projectId);
    }
  };

  const handleSelectProject = (projectId: string) => {
    selectProject(projectId);
    navigate('/editor');
  };

  return (
    <div className="app">
      <Header currentView="projects" />
      
      <div className="projects-page">
        <div className="projects-content">
          <div className="projects-actions-header">
            <button
              className="btn-primary"
              onClick={() => setShowCreateForm(true)}
            >
              + Создать проект
            </button>
          </div>

      {showCreateForm && (
        <div className="projects-modal-overlay">
          <div className="projects-modal">
            <h2>Создать новый проект</h2>
            <form onSubmit={handleCreateProject}>
              <div className="projects-form-group">
                <label htmlFor="projectName">Название проекта *</label>
                <input
                  id="projectName"
                  type="text"
                  value={newProjectName}
                  onChange={(e) => setNewProjectName(e.target.value)}
                  placeholder="Введите название проекта"
                  required
                />
              </div>
              <div className="projects-form-group">
                <label htmlFor="projectDescription">Описание</label>
                <textarea
                  id="projectDescription"
                  value={newProjectDescription}
                  onChange={(e) => setNewProjectDescription(e.target.value)}
                  placeholder="Описание проекта (необязательно)"
                  rows={3}
                />
              </div>
              <div className="projects-form-actions">
                <button type="submit" className="btn-primary">
                  Создать
                </button>
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={() => setShowCreateForm(false)}
                >
                  Отмена
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {editingProject && (
        <div className="projects-modal-overlay">
          <div className="projects-modal">
            <h2>Редактировать проект</h2>
            <form onSubmit={handleEditProject}>
              <div className="projects-form-group">
                <label htmlFor="editProjectName">Название проекта *</label>
                <input
                  id="editProjectName"
                  type="text"
                  value={editingProject.name}
                  onChange={(e) =>
                    setEditingProject({ ...editingProject, name: e.target.value })
                  }
                  required
                />
              </div>
              <div className="projects-form-group">
                <label htmlFor="editProjectDescription">Описание</label>
                <textarea
                  id="editProjectDescription"
                  value={editingProject.description || ''}
                  onChange={(e) =>
                    setEditingProject({
                      ...editingProject,
                      description: e.target.value,
                    })
                  }
                  rows={3}
                />
              </div>
              <div className="projects-form-group">
                <label htmlFor="editProjectStatus">Статус</label>
                <select
                  id="editProjectStatus"
                  value={editingProject.status}
                  onChange={(e) =>
                    setEditingProject({
                      ...editingProject,
                      status: e.target.value as 'active' | 'archived' | 'completed',
                    })
                  }
                >
                  <option value="active">Активный</option>
                  <option value="archived">Архивный</option>
                  <option value="completed">Завершенный</option>
                </select>
              </div>
              <div className="projects-form-actions">
                <button type="submit" className="btn-primary">
                  Сохранить
                </button>
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={() => setEditingProject(null)}
                >
                  Отмена
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="projects-grid">
        {projects.length === 0 ? (
          <div className="empty-state">
            <h3>У вас пока нет проектов</h3>
            <p>Создайте свой первый проект, чтобы начать работу</p>
            <button
              className="btn-primary"
              onClick={() => setShowCreateForm(true)}
            >
              Создать проект
            </button>
          </div>
        ) : (
          projects.map((project) => (
            <div
              key={project.id}
              className={`project-card ${
                project.id === currentProjectId ? 'active' : ''
              } ${project.status}`}
            >
              <div className="project-header">
                <h3>{project.name}</h3>
                <div className="project-actions">
                  <button
                    className="btn-icon"
                    onClick={() => setEditingProject(project)}
                    title="Редактировать"
                  >
                    ✏️
                  </button>
                  <button
                    className="btn-icon"
                    onClick={() => handleDeleteProject(project.id)}
                    title="Удалить"
                  >
                    🗑️
                  </button>
                </div>
              </div>
              {project.description && (
                <p className="project-description">{project.description}</p>
              )}
              <div className="project-meta">
                <span className={`project-status ${project.status}`}>
                  {project.status === 'active' ? 'Активный' :
                   project.status === 'archived' ? 'Архивный' : 'Завершенный'}
                </span>
                <span className="project-date">
                  Создан: {project.createdAt.toLocaleDateString()}
                </span>
              </div>
              <div className="project-members">
                <span>Участники: {project.members.length}</span>
              </div>
              <div className="project-actions-main">
                <button
                  className="btn-primary"
                  onClick={() => handleSelectProject(project.id)}
                >
                  Открыть проект
                </button>
              </div>
            </div>
          ))
        )}
          </div>
        </div>
      </div>
    </div>
  );
}