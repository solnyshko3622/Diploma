import React, { createContext, useContext, useState, useEffect } from 'react';
import { backendClient } from '../api/backendClient';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Проверяем токен при инициализации
  useEffect(() => {
    const token = localStorage.getItem('access_token');
    if (token) {
      backendClient.setToken(token);
      getCurrentUser();
    } else {
      setIsLoading(false);
    }
  }, []);

  const getCurrentUser = async () => {
    try {
      const userData = await backendClient.getCurrentUser();
      setUser(userData);
    } catch (error) {
      console.error('Error getting current user:', error);
      // Токен недействителен, очищаем его
      backendClient.logout();
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  // Регистрация пользователя
  const register = async (userData) => {
    try {
      setIsLoading(true);
      
      // Регистрируем пользователя
      const newUser = await backendClient.register({
        email: userData.email,
        username: userData.username,
        full_name: userData.name || userData.username,
        password: userData.password
      });

      // Автоматически входим после регистрации
      await backendClient.login(userData.username, userData.password);
      
      // Получаем обновленную информацию о пользователе
      const currentUser = await backendClient.getCurrentUser();
      setUser(currentUser);
      
      return { success: true, user: currentUser };
    } catch (error) {
      console.error('Registration error:', error);
      return { success: false, error: error.message };
    } finally {
      setIsLoading(false);
    }
  };

  // Вход пользователя
  const login = async (credentials) => {
    try {
      setIsLoading(true);
      
      // Используем username или email для входа
      const username = credentials.username || credentials.email;
      const response = await backendClient.login(username, credentials.password);
      
      // Получаем информацию о пользователе
      const userData = await backendClient.getCurrentUser();
      
      setUser(userData);
      
      return { success: true, user: userData };
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, error: error.message };
    } finally {
      setIsLoading(false);
    }
  };

  // Выход пользователя
  const logout = () => {
    backendClient.logout();
    setUser(null);
  };

  // Обновление профиля пользователя
  const updateProfile = async (updates) => {
    try {
      if (!user) {
        throw new Error('Пользователь не авторизован');
      }

      const updatedUser = await backendClient.updateProfile({
        email: updates.email,
        username: updates.username,
        full_name: updates.name || updates.full_name
      });
      
      setUser(updatedUser);
      return { success: true, user: updatedUser };
    } catch (error) {
      console.error('Profile update error:', error);
      return { success: false, error: error.message };
    }
  };

  // Изменение пароля (пока не реализовано в бэкенде)
  const changePassword = async (currentPassword, newPassword) => {
    try {
      // TODO: Реализовать в бэкенде
      throw new Error('Изменение пароля пока не поддерживается');
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  const value = {
    user,
    isLoading,
    register,
    login,
    logout,
    updateProfile,
    changePassword,
    isAuthenticated: !!user
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};