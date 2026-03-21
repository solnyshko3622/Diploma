// Authentication API functions

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:1337/api';
const USE_MOCK = import.meta.env.VITE_USE_MOCK_AUTH === 'true' || true; // Default to mock for development

// Mock credentials
const MOCK_USER = {
  id: 1,
  username: 'admin',
  email: 'admin@taidon.com',
  confirmed: true,
  blocked: false,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

const MOCK_JWT = 'mock-jwt-token-' + Date.now();

export interface LoginCredentials {
  identifier: string; // email or username
  password: string;
}

export interface RegisterData {
  username: string;
  email: string;
  password: string;
}

export interface AuthResponse {
  jwt: string;
  user: {
    id: number;
    username: string;
    email: string;
    confirmed: boolean;
    blocked: boolean;
    createdAt: string;
    updatedAt: string;
  };
}

export interface User {
  id: number;
  username: string;
  email: string;
  confirmed: boolean;
  blocked: boolean;
  createdAt: string;
  updatedAt: string;
}

/**
 * Login user with email/username and password
 */
export const login = async (credentials: LoginCredentials): Promise<AuthResponse> => {
  // Use mock authentication if enabled
  if (USE_MOCK) {
    console.log('🔧 Using mock authentication');
    
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Accept any credentials for mock
    const mockResponse: AuthResponse = {
      jwt: MOCK_JWT,
      user: MOCK_USER,
    };
    
    // Save JWT token to localStorage
    localStorage.setItem('jwt', mockResponse.jwt);
    localStorage.setItem('user', JSON.stringify(mockResponse.user));
    
    return mockResponse;
  }
  
  // Real API call
  try {
    const response = await fetch(`${API_URL}/auth/local`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(credentials),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error?.message || 'Ошибка входа');
    }

    const data: AuthResponse = await response.json();
    
    // Save JWT token to localStorage
    localStorage.setItem('jwt', data.jwt);
    localStorage.setItem('user', JSON.stringify(data.user));
    
    return data;
  } catch (error) {
    console.error('Login error:', error);
    throw error;
  }
};

/**
 * Register new user
 */
export const register = async (userData: RegisterData): Promise<AuthResponse> => {
  // Use mock authentication if enabled
  if (USE_MOCK) {
    console.log('🔧 Using mock registration');
    
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Create mock user with provided data
    const mockResponse: AuthResponse = {
      jwt: MOCK_JWT,
      user: {
        ...MOCK_USER,
        username: userData.username,
        email: userData.email,
      },
    };
    
    // Save JWT token to localStorage
    localStorage.setItem('jwt', mockResponse.jwt);
    localStorage.setItem('user', JSON.stringify(mockResponse.user));
    
    return mockResponse;
  }
  
  // Real API call
  try {
    const response = await fetch(`${API_URL}/auth/local/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userData),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error?.message || 'Ошибка регистрации');
    }

    const data: AuthResponse = await response.json();
    
    // Save JWT token to localStorage
    localStorage.setItem('jwt', data.jwt);
    localStorage.setItem('user', JSON.stringify(data.user));
    
    return data;
  } catch (error) {
    console.error('Registration error:', error);
    throw error;
  }
};

/**
 * Logout user
 */
export const logout = (): void => {
  localStorage.removeItem('jwt');
  localStorage.removeItem('user');
};

/**
 * Get current user from localStorage
 */
export const getCurrentUser = (): User | null => {
  const userStr = localStorage.getItem('user');
  if (!userStr) return null;
  
  try {
    return JSON.parse(userStr);
  } catch {
    return null;
  }
};

/**
 * Get JWT token from localStorage
 */
export const getToken = (): string | null => {
  return localStorage.getItem('jwt');
};

/**
 * Check if user is authenticated
 */
export const isAuthenticated = (): boolean => {
  return !!getToken();
};

/**
 * Get current user info from API
 */
export const fetchCurrentUser = async (): Promise<User> => {
  const token = getToken();
  
  if (!token) {
    throw new Error('Не авторизован');
  }

  try {
    const response = await fetch(`${API_URL}/users/me`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error('Ошибка получения данных пользователя');
    }

    const user: User = await response.json();
    localStorage.setItem('user', JSON.stringify(user));
    
    return user;
  } catch (error) {
    console.error('Fetch user error:', error);
    throw error;
  }
};

/**
 * Request password reset
 */
export const forgotPassword = async (email: string): Promise<{ ok: boolean }> => {
  try {
    const response = await fetch(`${API_URL}/auth/forgot-password`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error?.message || 'Ошибка сброса пароля');
    }

    return await response.json();
  } catch (error) {
    console.error('Forgot password error:', error);
    throw error;
  }
};

/**
 * Reset password with code
 */
export const resetPassword = async (
  code: string,
  password: string,
  passwordConfirmation: string
): Promise<AuthResponse> => {
  try {
    const response = await fetch(`${API_URL}/auth/reset-password`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        code,
        password,
        passwordConfirmation,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error?.message || 'Ошибка сброса пароля');
    }

    const data: AuthResponse = await response.json();
    
    // Save JWT token to localStorage
    localStorage.setItem('jwt', data.jwt);
    localStorage.setItem('user', JSON.stringify(data.user));
    
    return data;
  } catch (error) {
    console.error('Reset password error:', error);
    throw error;
  }
};
