const API_BASE_URL = 'http://localhost:8000';
const USE_MOCK_MODE = true; // Set to true to disable real backend calls

// Mock data
const MOCK_USER = {
  id: 1,
  username: 'admin',
  email: 'admin@taidon.com',
  full_name: 'Администратор',
  is_active: true,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString()
};

const MOCK_PROJECTS = [
  {
    id: 1,
    name: 'Мой первый проект',
    description: 'Демонстрационный проект для работы с SQL',
    is_public: false,
    owner_id: 1,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    owner: MOCK_USER,
    scripts: []
  },
  {
    id: 2,
    name: 'Анализ данных',
    description: 'Проект для анализа пользовательских данных',
    is_public: false,
    owner_id: 1,
    created_at: new Date(Date.now() - 86400000).toISOString(),
    updated_at: new Date(Date.now() - 86400000).toISOString(),
    owner: MOCK_USER,
    scripts: []
  }
];

let mockProjectIdCounter = 3;
let mockScriptIdCounter = 1;

class BackendClient {
  constructor() {
    this.baseURL = API_BASE_URL;
    this.token = localStorage.getItem('access_token');
    this.mockMode = USE_MOCK_MODE;
    
    if (this.mockMode) {
      console.log('%c🔧 MOCK MODE ENABLED - Backend calls disabled', 'color: #ff6b35; font-weight: bold; font-size: 14px;');
    }
  }

  setToken(token) {
    this.token = token;
    if (token) {
      localStorage.setItem('access_token', token);
    } else {
      localStorage.removeItem('access_token');
    }
  }

  getAuthHeaders() {
    const headers = {
      'Content-Type': 'application/json',
    };
    
    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }
    
    return headers;
  }

  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const config = {
      headers: this.getAuthHeaders(),
      ...options,
    };

    try {
      const response = await fetch(url, config);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || `HTTP error! status: ${response.status}`);
      }

      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        return await response.json();
      }
      
      return await response.text();
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  // Auth methods
  async register(userData) {
    if (this.mockMode) {
      console.log('🔧 Mock registration');
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const mockUser = {
        ...MOCK_USER,
        username: userData.username || userData.email.split('@')[0],
        email: userData.email,
        full_name: userData.full_name || userData.username || 'Пользователь'
      };
      
      return mockUser;
    }
    
    return this.request('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  }

  async login(username, password) {
    if (this.mockMode) {
      console.log('🔧 Mock login - accepting any credentials');
      await new Promise(resolve => setTimeout(resolve, 300));
      
      const mockToken = 'mock-jwt-token-' + Date.now();
      this.setToken(mockToken);
      
      return {
        access_token: mockToken,
        token_type: 'bearer',
        user: MOCK_USER
      };
    }
    
    const formData = new FormData();
    formData.append('username', username);
    formData.append('password', password);

    const response = await this.request('/auth/login', {
      method: 'POST',
      headers: {
        // Don't set Content-Type for FormData, let browser set it
        ...(this.token && { 'Authorization': `Bearer ${this.token}` }),
      },
      body: formData,
    });

    if (response.access_token) {
      this.setToken(response.access_token);
    }

    return response;
  }

  async getCurrentUser() {
    if (this.mockMode) {
      console.log('🔧 Mock getCurrentUser');
      await new Promise(resolve => setTimeout(resolve, 100));
      return MOCK_USER;
    }
    
    return this.request('/auth/me');
  }

  async updateProfile(userData) {
    if (this.mockMode) {
      console.log('🔧 Mock updateProfile');
      await new Promise(resolve => setTimeout(resolve, 200));
      return { ...MOCK_USER, ...userData };
    }
    
    return this.request('/auth/me', {
      method: 'PUT',
      body: JSON.stringify(userData),
    });
  }

  logout() {
    this.setToken(null);
  }

  // Project methods
  async getProjects() {
    if (this.mockMode) {
      console.log('🔧 Mock getProjects');
      await new Promise(resolve => setTimeout(resolve, 200));
      return {
        owned_projects: [...MOCK_PROJECTS],
        shared_projects: []
      };
    }
    
    return this.request('/projects/');
  }

  async getProject(projectId) {
    if (this.mockMode) {
      console.log('🔧 Mock getProject');
      await new Promise(resolve => setTimeout(resolve, 150));
      const project = MOCK_PROJECTS.find(p => p.id === parseInt(projectId));
      if (!project) {
        throw new Error('Project not found');
      }
      return { ...project };
    }
    
    return this.request(`/projects/${projectId}`);
  }

  async createProject(projectData) {
    if (this.mockMode) {
      console.log('🔧 Mock createProject');
      await new Promise(resolve => setTimeout(resolve, 300));
      
      const newProject = {
        id: mockProjectIdCounter++,
        name: projectData.name,
        description: projectData.description || '',
        is_public: projectData.is_public || false,
        owner_id: 1,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        owner: MOCK_USER,
        scripts: []
      };
      
      MOCK_PROJECTS.push(newProject);
      return { ...newProject };
    }
    
    return this.request('/projects/', {
      method: 'POST',
      body: JSON.stringify(projectData),
    });
  }

  async updateProject(projectId, projectData) {
    if (this.mockMode) {
      console.log('🔧 Mock updateProject');
      await new Promise(resolve => setTimeout(resolve, 200));
      
      const projectIndex = MOCK_PROJECTS.findIndex(p => p.id === parseInt(projectId));
      if (projectIndex === -1) {
        throw new Error('Project not found');
      }
      
      const updatedProject = {
        ...MOCK_PROJECTS[projectIndex],
        ...projectData,
        updated_at: new Date().toISOString()
      };
      
      MOCK_PROJECTS[projectIndex] = updatedProject;
      return { ...updatedProject };
    }
    
    return this.request(`/projects/${projectId}`, {
      method: 'PUT',
      body: JSON.stringify(projectData),
    });
  }

  async deleteProject(projectId) {
    if (this.mockMode) {
      console.log('🔧 Mock deleteProject');
      await new Promise(resolve => setTimeout(resolve, 150));
      
      const projectIndex = MOCK_PROJECTS.findIndex(p => p.id === parseInt(projectId));
      if (projectIndex === -1) {
        throw new Error('Project not found');
      }
      
      MOCK_PROJECTS.splice(projectIndex, 1);
      return { message: 'Project deleted successfully' };
    }
    
    return this.request(`/projects/${projectId}`, {
      method: 'DELETE',
    });
  }

  async copyProject(projectId, copyData) {
    if (this.mockMode) {
      console.log('🔧 Mock copyProject');
      await new Promise(resolve => setTimeout(resolve, 400));
      
      const originalProject = MOCK_PROJECTS.find(p => p.id === parseInt(projectId));
      if (!originalProject) {
        throw new Error('Project not found');
      }
      
      const copiedProject = {
        id: mockProjectIdCounter++,
        name: copyData.name || `${originalProject.name} (копия)`,
        description: copyData.description || originalProject.description,
        is_public: false,
        owner_id: 1,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        owner: MOCK_USER,
        scripts: copyData.copy_scripts ? [...originalProject.scripts] : []
      };
      
      MOCK_PROJECTS.push(copiedProject);
      return { ...copiedProject };
    }
    
    return this.request(`/projects/${projectId}/copy`, {
      method: 'POST',
      body: JSON.stringify(copyData),
    });
  }

  // Project permissions methods
  async getProjectPermissions(projectId) {
    return this.request(`/projects/${projectId}/permissions`);
  }

  async grantProjectPermission(projectId, permissionData) {
    return this.request(`/projects/${projectId}/permissions`, {
      method: 'POST',
      body: JSON.stringify(permissionData),
    });
  }

  async updateProjectPermission(projectId, userId, permissionData) {
    return this.request(`/projects/${projectId}/permissions/${userId}`, {
      method: 'PUT',
      body: JSON.stringify(permissionData),
    });
  }

  async revokeProjectPermission(projectId, userId) {
    return this.request(`/projects/${projectId}/permissions/${userId}`, {
      method: 'DELETE',
    });
  }

  // Script methods
  async getProjectScripts(projectId) {
    if (this.mockMode) {
      console.log('🔧 Mock getProjectScripts');
      await new Promise(resolve => setTimeout(resolve, 150));
      
      // Возвращаем пустой массив скриптов для демо
      return [];
    }
    
    return this.request(`/scripts/project/${projectId}`);
  }

  async getScript(scriptId) {
    if (this.mockMode) {
      console.log('🔧 Mock getScript');
      await new Promise(resolve => setTimeout(resolve, 100));
      
      return {
        id: scriptId,
        name: `Скрипт ${scriptId}`,
        content: 'SELECT * FROM users;',
        project_id: 1,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
    }
    
    return this.request(`/scripts/${scriptId}`);
  }

  async createScript(projectId, scriptData) {
    if (this.mockMode) {
      console.log('🔧 Mock createScript');
      await new Promise(resolve => setTimeout(resolve, 200));
      
      return {
        id: mockScriptIdCounter++,
        name: scriptData.name || `Новый скрипт ${mockScriptIdCounter}`,
        content: scriptData.content || '',
        project_id: projectId,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
    }
    
    return this.request(`/scripts/?project_id=${projectId}`, {
      method: 'POST',
      body: JSON.stringify(scriptData),
    });
  }

  async updateScript(scriptId, scriptData) {
    if (this.mockMode) {
      console.log('🔧 Mock updateScript');
      await new Promise(resolve => setTimeout(resolve, 150));
      
      return {
        id: scriptId,
        name: scriptData.name,
        content: scriptData.content,
        project_id: scriptData.project_id || 1,
        created_at: new Date(Date.now() - 86400000).toISOString(),
        updated_at: new Date().toISOString()
      };
    }
    
    return this.request(`/scripts/${scriptId}`, {
      method: 'PUT',
      body: JSON.stringify(scriptData),
    });
  }

  async deleteScript(scriptId) {
    if (this.mockMode) {
      console.log('🔧 Mock deleteScript');
      await new Promise(resolve => setTimeout(resolve, 100));
      
      return { message: 'Script deleted successfully' };
    }
    
    return this.request(`/scripts/${scriptId}`, {
      method: 'DELETE',
    });
  }

  // Health check
  async healthCheck() {
    if (this.mockMode) {
      console.log('🔧 Mock healthCheck');
      await new Promise(resolve => setTimeout(resolve, 100));
      return { status: 'ok', message: 'Mock mode active' };
    }
    
    try {
      return await this.request('/health');
    } catch (error) {
      return { status: 'error', message: error.message };
    }
  }
}

export const backendClient = new BackendClient();