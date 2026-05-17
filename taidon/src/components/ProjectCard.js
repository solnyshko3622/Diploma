import React from 'react';

const ProjectCard = ({ project, onOpenProject }) => {
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ru-RU', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="project-card" onClick={() => onOpenProject(project)}>
      <div className="project-card-header">
        <h3 className="project-title">{project.name}</h3>
      </div>
      
      <div className="project-card-body">
        <div className="project-description">
          {project.description || 'Описание проекта отсутствует'}
        </div>
        
        <div className="project-stats">
          <div className="stat-item">
            <span className="stat-icon">📄</span>
            <span className="stat-text">{project.scriptsCount || 0} скриптов</span>
          </div>
        </div>
      </div>
      
      <div className="project-card-footer">
        <div className="project-dates">
          <div className="date-item">
            <span className="date-label">Создан:</span>
            <span className="date-value">{formatDate(project.createdAt)}</span>
          </div>
          <div className="date-item">
            <span className="date-label">Изменён:</span>
            <span className="date-value">{formatDate(project.updatedAt)}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProjectCard;