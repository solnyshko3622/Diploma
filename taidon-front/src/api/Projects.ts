const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:1337';

export interface Project {
  id: number;
  name: string;
  description: string;
  createdAt: string;
  updatedAt: string;
  owner?: {
    id: number;
    username: string;
    email: string;
  };
}

export interface CreateProjectData {
  name: string;
  description?: string;
}

export interface UpdateProjectData {
  name?: string;
  description?: string;
}

/**
 * Fetch all projects available to the current user
 */
export const getProjects = async (): Promise<Project[]> => {
  const token = localStorage.getItem('jwt');
  
  if (!token) {
    throw new Error('No authentication token found');
  }

  const response = await fetch(`${API_URL}/api/projects?populate=owner`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error('Failed to fetch projects');
  }

  const data = await response.json();
  return data.data.map((item: any) => ({
    id: item.id,
    ...item.attributes,
    owner: item.attributes.owner?.data ? {
      id: item.attributes.owner.data.id,
      ...item.attributes.owner.data.attributes,
    } : undefined,
  }));
};

/**
 * Fetch a single project by ID
 */
export const getProject = async (id: number): Promise<Project> => {
  const token = localStorage.getItem('jwt');
  
  if (!token) {
    throw new Error('No authentication token found');
  }

  const response = await fetch(`${API_URL}/api/projects/${id}?populate=owner`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error('Failed to fetch project');
  }

  const data = await response.json();
  return {
    id: data.data.id,
    ...data.data.attributes,
    owner: data.data.attributes.owner?.data ? {
      id: data.data.attributes.owner.data.id,
      ...data.data.attributes.owner.data.attributes,
    } : undefined,
  };
};

/**
 * Create a new project
 */
export const createProject = async (projectData: CreateProjectData): Promise<Project> => {
  const token = localStorage.getItem('jwt');
  
  if (!token) {
    throw new Error('No authentication token found');
  }

  const response = await fetch(`${API_URL}/api/projects`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ data: projectData }),
  });

  if (!response.ok) {
    throw new Error('Failed to create project');
  }

  const data = await response.json();
  return {
    id: data.data.id,
    ...data.data.attributes,
  };
};

/**
 * Update an existing project
 */
export const updateProject = async (id: number, projectData: UpdateProjectData): Promise<Project> => {
  const token = localStorage.getItem('jwt');
  
  if (!token) {
    throw new Error('No authentication token found');
  }

  const response = await fetch(`${API_URL}/api/projects/${id}`, {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ data: projectData }),
  });

  if (!response.ok) {
    throw new Error('Failed to update project');
  }

  const data = await response.json();
  return {
    id: data.data.id,
    ...data.data.attributes,
  };
};

/**
 * Delete a project
 */
export const deleteProject = async (id: number): Promise<void> => {
  const token = localStorage.getItem('jwt');
  
  if (!token) {
    throw new Error('No authentication token found');
  }

  const response = await fetch(`${API_URL}/api/projects/${id}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error('Failed to delete project');
  }
};
