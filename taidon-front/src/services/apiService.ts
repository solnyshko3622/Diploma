import type { Project, DatabaseConnection, QueryHistoryItem } from '../types';

const API_BASE_URL = 'http://localhost:3001/api';

// Helper function for API calls
async function apiCall(endpoint: string, options: RequestInit = {}) {
  const url = `${API_BASE_URL}${endpoint}`;
  const config = {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  };

  try {
    const response = await fetch(url, config);
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('API call failed:', error);
    throw error;
  }
}

// Helper function for authenticated API calls
async function authenticatedApiCall(endpoint: string, options: RequestInit = {}) {
  const token = localStorage.getItem('authToken');
  
  if (!token) {
    throw new Error('No authentication token found');
  }

  return apiCall(endpoint, {
    ...options,
    headers: {
      'Authorization': `Bearer ${token}`,
      ...options.headers,
    },
  });
}

// Auth API
export const authAPI = {
  async login(email: string, password: string) {
    const data = await apiCall('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    
    // Store token for future requests
    if (data.jwt) {
      localStorage.setItem('authToken', data.jwt);
    }
    
    return data;
  },

  async register(name: string, email: string, password: string) {
    const data = await apiCall('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ name, email, password }),
    });
    
    // Store token for future requests
    if (data.jwt) {
      localStorage.setItem('authToken', data.jwt);
    }
    
    return data;
  },

  async getCurrentUser() {
    return authenticatedApiCall('/users/me');
  },

  logout() {
    localStorage.removeItem('authToken');
  },
};

// Projects API
export const projectsAPI = {
  async getAll() {
    const data = await authenticatedApiCall('/projects');
    // Convert string dates to Date objects
    return data.map((project: any) => ({
      ...project,
      createdAt: new Date(project.createdAt),
      updatedAt: new Date(project.updatedAt),
      members: project.members.map((member: any) => ({
        ...member,
        joinedAt: new Date(member.joinedAt),
      })),
    }));
  },

  async getById(id: string) {
    const data = await authenticatedApiCall(`/projects/${id}`);
    // Convert string dates to Date objects
    return {
      ...data,
      createdAt: new Date(data.createdAt),
      updatedAt: new Date(data.updatedAt),
      members: data.members.map((member: any) => ({
        ...member,
        joinedAt: new Date(member.joinedAt),
      })),
    };
  },

  async create(name: string, description?: string) {
    const data = await authenticatedApiCall('/projects', {
      method: 'POST',
      body: JSON.stringify({ name, description }),
    });
    // Convert string dates to Date objects
    return {
      ...data,
      createdAt: new Date(data.createdAt),
      updatedAt: new Date(data.updatedAt),
      members: data.members.map((member: any) => ({
        ...member,
        joinedAt: new Date(member.joinedAt),
      })),
    };
  },

  async update(project: Project) {
    const data = await authenticatedApiCall(`/projects/${project.id}`, {
      method: 'PUT',
      body: JSON.stringify(project),
    });
    // Convert string dates to Date objects
    return {
      ...data,
      createdAt: new Date(data.createdAt),
      updatedAt: new Date(data.updatedAt),
      members: data.members.map((member: any) => ({
        ...member,
        joinedAt: new Date(member.joinedAt),
      })),
    };
  },

  async delete(id: string) {
    await authenticatedApiCall(`/projects/${id}`, {
      method: 'DELETE',
    });
  },
};

// Database Connections API
export const connectionsAPI = {
  async getAll() {
    const data = await authenticatedApiCall('/database-connections');
    // Convert string dates to Date objects
    return data.map((connection: any) => ({
      ...connection,
      createdAt: new Date(connection.createdAt),
    }));
  },

  async create(connection: Omit<DatabaseConnection, 'id' | 'createdAt'>) {
    const data = await authenticatedApiCall('/database-connections', {
      method: 'POST',
      body: JSON.stringify(connection),
    });
    // Convert string dates to Date objects
    return {
      ...data,
      createdAt: new Date(data.createdAt),
    };
  },

  async delete(id: string) {
    await authenticatedApiCall(`/database-connections/${id}`, {
      method: 'DELETE',
    });
  },
};

// Query History API
export const queryHistoryAPI = {
  async getAll() {
    const data = await authenticatedApiCall('/query-history');
    // Convert string dates to Date objects
    return data.map((item: any) => ({
      ...item,
      timestamp: new Date(item.timestamp),
    }));
  },

  async create(queryData: Omit<QueryHistoryItem, 'id' | 'timestamp'>) {
    const data = await authenticatedApiCall('/query-history', {
      method: 'POST',
      body: JSON.stringify(queryData),
    });
    // Convert string dates to Date objects
    return {
      ...data,
      timestamp: new Date(data.timestamp),
    };
  },
};

// Health check
export const healthAPI = {
  async check() {
    return apiCall('/health');
  },
};