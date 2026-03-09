import React, { createContext, useContext, useReducer, useEffect } from 'react';
import type { ReactNode } from 'react';
import type { AppState, DatabaseConnection, Tab, QueryHistoryItem, User, FileNode, Project } from '../types';
import { databaseService } from '../services/databaseService';
import { authAPI, projectsAPI, connectionsAPI, queryHistoryAPI } from '../services/apiService';

type AppAction =
  | { type: 'LOGIN_START' }
  | { type: 'LOGIN_SUCCESS'; payload: User }
  | { type: 'LOGIN_FAILURE' }
  | { type: 'LOGOUT' }
  | { type: 'REGISTER_START' }
  | { type: 'REGISTER_SUCCESS'; payload: User }
  | { type: 'REGISTER_FAILURE' }
  | { type: 'ADD_CONNECTION'; payload: DatabaseConnection }
  | { type: 'UPDATE_CONNECTION'; payload: DatabaseConnection }
  | { type: 'DELETE_CONNECTION'; payload: string }
  | { type: 'SET_CURRENT_CONNECTION'; payload: string }
  | { type: 'ADD_TAB'; payload: Tab }
  | { type: 'UPDATE_TAB'; payload: { id: string; updates: Partial<Tab> } }
  | { type: 'CLOSE_TAB'; payload: string }
  | { type: 'SET_ACTIVE_TAB'; payload: string }
  | { type: 'ADD_QUERY_HISTORY'; payload: QueryHistoryItem }
  | { type: 'CLEAR_QUERY_HISTORY' }
  | { type: 'SET_THEME'; payload: 'light' | 'dark' }
  | { type: 'TOGGLE_FOLDER'; payload: string }
  | { type: 'SELECT_FILE'; payload: FileNode }
  | { type: 'CREATE_FILE'; payload: { parentId: string; name: string; type: 'file' | 'folder' } }
  | { type: 'DELETE_FILE'; payload: string }
  | { type: 'ADD_PROJECT'; payload: Project }
  | { type: 'UPDATE_PROJECT'; payload: Project }
  | { type: 'DELETE_PROJECT'; payload: string }
  | { type: 'SET_CURRENT_PROJECT'; payload: string }
  | { type: 'SET_CURRENT_VIEW'; payload: 'editor' | 'projects' }
  | { type: 'SHOW_AUTH_FORM'; payload: boolean }
  | { type: 'SET_AUTH_FORM_TYPE'; payload: 'login' | 'register' };

const initialState: AppState = {
  auth: {
    user: null,
    isAuthenticated: false,
    isLoading: false,
  },
  connections: [],
  currentConnectionId: undefined,
  tabs: [
    {
      id: '1',
      title: 'Query 1',
      query: 'SELECT * FROM users;',
      isDirty: false,
    },
  ],
  activeTabId: '1',
  queryHistory: [],
  theme: 'light',
  fileTree: [
    {
      id: '1',
      name: 'queries',
      type: 'folder',
      path: '/queries',
      isOpen: true,
      children: [
        {
          id: '2',
          name: 'sample.sql',
          type: 'file',
          path: '/queries/sample.sql',
          content: 'SELECT * FROM users;'
        }
      ]
    },
    {
      id: '3',
      name: 'schemas',
      type: 'folder',
      path: '/schemas',
      isOpen: false,
      children: []
    }
  ],
  projects: [],
  currentProjectId: undefined,
  currentView: 'editor',
  showAuthForm: false,
  authFormType: 'login' as 'login' | 'register',
};

function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case 'LOGIN_START':
    case 'REGISTER_START':
      return {
        ...state,
        auth: {
          ...state.auth,
          isLoading: true,
        },
      };

    case 'LOGIN_SUCCESS':
      return {
        ...state,
        auth: {
          user: action.payload,
          isAuthenticated: true,
          isLoading: false,
        },
        authFormType: 'login',
      };
    case 'REGISTER_SUCCESS':
      return {
        ...state,
        auth: {
          user: action.payload,
          isAuthenticated: true,
          isLoading: false,
        },
        authFormType: 'register',
      };

    case 'LOGIN_FAILURE':
    case 'REGISTER_FAILURE':
      return {
        ...state,
        auth: {
          ...state.auth,
          user: null,
          isAuthenticated: false,
          isLoading: false,
        },
      };

    case 'LOGOUT':
      return {
        ...state,
        auth: {
          user: null,
          isAuthenticated: false,
          isLoading: false,
        },
      };

    case 'ADD_CONNECTION':
      return {
        ...state,
        connections: [...state.connections, action.payload],
      };

    case 'UPDATE_CONNECTION':
      return {
        ...state,
        connections: state.connections.map(conn =>
          conn.id === action.payload.id ? action.payload : conn
        ),
      };

    case 'DELETE_CONNECTION':
      return {
        ...state,
        connections: state.connections.filter(conn => conn.id !== action.payload),
        currentConnectionId: state.currentConnectionId === action.payload ? undefined : state.currentConnectionId,
      };

    case 'SET_CURRENT_CONNECTION':
      return {
        ...state,
        currentConnectionId: action.payload,
      };

    case 'ADD_TAB':
      return {
        ...state,
        tabs: [...state.tabs, action.payload],
        activeTabId: action.payload.id,
      };

    case 'UPDATE_TAB':
      return {
        ...state,
        tabs: state.tabs.map(tab =>
          tab.id === action.payload.id ? { ...tab, ...action.payload.updates } : tab
        ),
      };

    case 'CLOSE_TAB':
      const remainingTabs = state.tabs.filter(tab => tab.id !== action.payload);
      return {
        ...state,
        tabs: remainingTabs,
        activeTabId: remainingTabs.length > 0 
          ? (remainingTabs[0].id === action.payload ? remainingTabs[0].id : state.activeTabId)
          : '1',
      };

    case 'SET_ACTIVE_TAB':
      return {
        ...state,
        activeTabId: action.payload,
      };

    case 'ADD_QUERY_HISTORY':
      return {
        ...state,
        queryHistory: [action.payload, ...state.queryHistory].slice(0, 100), // Keep last 100 items
      };

    case 'CLEAR_QUERY_HISTORY':
      return {
        ...state,
        queryHistory: [],
      };

    case 'SET_THEME':
      return {
        ...state,
        theme: action.payload,
      };

    case 'TOGGLE_FOLDER':
      return {
        ...state,
        fileTree: toggleFolder(state.fileTree, action.payload),
      };

    case 'SELECT_FILE':
      return {
        ...state,
        currentFile: action.payload,
      };

    case 'CREATE_FILE':
      return {
        ...state,
        fileTree: createFile(state.fileTree, action.payload),
      };

    case 'DELETE_FILE':
      return {
        ...state,
        fileTree: deleteFile(state.fileTree, action.payload),
      };

    case 'ADD_PROJECT':
      return {
        ...state,
        projects: [...state.projects, action.payload],
      };

    case 'UPDATE_PROJECT':
      return {
        ...state,
        projects: state.projects.map(project =>
          project.id === action.payload.id ? action.payload : project
        ),
      };

    case 'DELETE_PROJECT':
      return {
        ...state,
        projects: state.projects.filter(project => project.id !== action.payload),
        currentProjectId: state.currentProjectId === action.payload ? undefined : state.currentProjectId,
      };

    case 'SET_CURRENT_PROJECT':
      return {
        ...state,
        currentProjectId: action.payload,
      };

    case 'SET_CURRENT_VIEW':
      return {
        ...state,
        currentView: action.payload,
      };

    case 'SHOW_AUTH_FORM':
      return {
        ...state,
        showAuthForm: action.payload,
      };

    case 'SET_AUTH_FORM_TYPE':
      return {
        ...state,
        authFormType: action.payload,
      };

    default:
      return state;
  }
}

interface AppContextType extends AppState {
  dispatch: React.Dispatch<AppAction>;
  login: (email: string, password: string) => Promise<boolean>;
  register: (name: string, email: string, password: string) => Promise<boolean>;
  logout: () => void;
  executeQuery: (query: string) => Promise<void>;
  connectToDatabase: (connection: DatabaseConnection) => Promise<boolean>;
  disconnectFromDatabase: (connectionId: string) => Promise<void>;
  createProject: (name: string, description?: string) => Promise<boolean>;
  updateProject: (project: Project) => Promise<boolean>;
  deleteProject: (projectId: string) => Promise<void>;
  selectProject: (projectId: string) => void;
  switchView: (view: 'editor' | 'projects') => void;
  setShowAuthForm: (show: boolean) => void;
  setAuthFormType: (type: 'login' | 'register') => void;
  createConnection: (connection: Omit<DatabaseConnection, 'id' | 'createdAt' | 'updatedAt'>) => Promise<boolean>;
  updateConnection: (connectionId: string, updates: Partial<DatabaseConnection>) => Promise<boolean>;
  deleteConnection: (connectionId: string) => Promise<boolean>;
  selectConnection: (connectionId: string) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(appReducer, initialState);

  // Load data when user is authenticated
  useEffect(() => {
    const loadInitialData = async () => {
      if (state.auth.isAuthenticated && state.auth.user) {
        try {
          // Load projects
          const projects = await projectsAPI.getAll();
          projects.forEach((project: Project) => {
            dispatch({ type: 'ADD_PROJECT', payload: project });
          });

          // Load connections
          const connections = await connectionsAPI.getAll();
          connections.forEach((connection: DatabaseConnection) => {
            dispatch({ type: 'ADD_CONNECTION', payload: connection });
          });

          // Load query history
          const queryHistory = await queryHistoryAPI.getAll();
          queryHistory.forEach((item: QueryHistoryItem) => {
            dispatch({ type: 'ADD_QUERY_HISTORY', payload: item });
          });
        } catch (error) {
          console.error('Failed to load initial data:', error);
        }
      }
    };

    loadInitialData();
  }, [state.auth.isAuthenticated, state.auth.user]);

  const login = async (email: string, password: string): Promise<boolean> => {
    dispatch({ type: 'LOGIN_START' });
    
    try {
      const response = await authAPI.login(email, password);
      const user: User = {
        id: response.user.id,
        email: response.user.email,
        name: response.user.name,
        createdAt: new Date(response.user.createdAt),
      };
      dispatch({ type: 'LOGIN_SUCCESS', payload: user });
      return true;
    } catch (error) {
      dispatch({ type: 'LOGIN_FAILURE' });
      return false;
    }
  };

  const register = async (name: string, email: string, password: string): Promise<boolean> => {
    dispatch({ type: 'REGISTER_START' });
    
    try {
      const response = await authAPI.register(name, email, password);
      const user: User = {
        id: response.user.id,
        email: response.user.email,
        name: response.user.name,
        createdAt: new Date(response.user.createdAt),
      };
      dispatch({ type: 'REGISTER_SUCCESS', payload: user });
      return true;
    } catch (error) {
      dispatch({ type: 'REGISTER_FAILURE' });
      return false;
    }
  };

  const logout = () => {
    authAPI.logout();
    dispatch({ type: 'LOGOUT' });
  };

  const executeQuery = async (query: string) => {
    if (!state.currentConnectionId) {
      throw new Error('No database connection selected');
    }

    const startTime = performance.now();
    try {
      const result = await databaseService.executeQuery(state.currentConnectionId, query);
      const executionTime = performance.now() - startTime;

      // Update current tab with result
      dispatch({
        type: 'UPDATE_TAB',
        payload: {
          id: state.activeTabId,
          updates: { result },
        },
      });

      // Add to query history
      const queryHistoryItem = {
        id: Date.now().toString(),
        query,
        timestamp: new Date(),
        connectionId: state.currentConnectionId,
        executionTime,
        rowCount: result.rowCount,
        error: result.error,
      };
      
      dispatch({
        type: 'ADD_QUERY_HISTORY',
        payload: queryHistoryItem,
      });

      // Save to backend
      try {
        await queryHistoryAPI.create(queryHistoryItem);
      } catch (error) {
        console.error('Failed to save query history:', error);
      }
    } catch (error) {
      const executionTime = performance.now() - startTime;
      const errorMessage = error instanceof Error ? error.message : String(error);
      
      dispatch({
        type: 'UPDATE_TAB',
        payload: {
          id: state.activeTabId,
          updates: {
            result: {
              columns: [],
              rows: [],
              rowCount: 0,
              executionTime,
              error: errorMessage,
            },
          },
        },
      });

      // Add to query history even for failed queries
      const queryHistoryItem = {
        id: Date.now().toString(),
        query,
        timestamp: new Date(),
        connectionId: state.currentConnectionId,
        executionTime,
        rowCount: 0,
        error: errorMessage,
      };
      
      dispatch({
        type: 'ADD_QUERY_HISTORY',
        payload: queryHistoryItem,
      });

      // Save to backend
      try {
        await queryHistoryAPI.create(queryHistoryItem);
      } catch (historyError) {
        console.error('Failed to save query history:', historyError);
      }
    }
  };

  const connectToDatabase = async (connection: DatabaseConnection): Promise<boolean> => {
    try {
      await databaseService.connect(connection);
      dispatch({ type: 'ADD_CONNECTION', payload: connection });
      dispatch({ type: 'SET_CURRENT_CONNECTION', payload: connection.id });
      return true;
    } catch (error) {
      console.error('Failed to connect to database:', error);
      return false;
    }
  };

  const disconnectFromDatabase = async (connectionId: string) => {
    await databaseService.disconnect(connectionId);
    dispatch({ type: 'DELETE_CONNECTION', payload: connectionId });
  };

  const createProject = async (name: string, description?: string): Promise<boolean> => {
    try {
      const project = await projectsAPI.create(name, description);
      dispatch({ type: 'ADD_PROJECT', payload: project });
      return true;
    } catch (error) {
      console.error('Failed to create project:', error);
      return false;
    }
  };

  const updateProject = async (project: Project): Promise<boolean> => {
    try {
      const updatedProject = await projectsAPI.update(project);
      dispatch({ type: 'UPDATE_PROJECT', payload: updatedProject });
      return true;
    } catch (error) {
      console.error('Failed to update project:', error);
      return false;
    }
  };

  const deleteProject = async (projectId: string) => {
    try {
      await projectsAPI.delete(projectId);
      dispatch({ type: 'DELETE_PROJECT', payload: projectId });
    } catch (error) {
      console.error('Failed to delete project:', error);
    }
  };

  const selectProject = (projectId: string) => {
    dispatch({ type: 'SET_CURRENT_PROJECT', payload: projectId });
  };

  const switchView = (view: 'editor' | 'projects') => {
    dispatch({ type: 'SET_CURRENT_VIEW', payload: view });
  };

  const setShowAuthForm = (show: boolean) => {
    dispatch({ type: 'SHOW_AUTH_FORM', payload: show });
  };

  const setAuthFormType = (type: 'login' | 'register') => {
    dispatch({ type: 'SET_AUTH_FORM_TYPE', payload: type });
  };

  // Connection management functions
  const createConnection = async (connection: Omit<DatabaseConnection, 'id' | 'createdAt' | 'updatedAt'>): Promise<boolean> => {
    try {
      const newConnection = await connectionsAPI.create(connection);
      dispatch({ type: 'ADD_CONNECTION', payload: newConnection });
      return true;
    } catch (error) {
      console.error('Failed to create connection:', error);
      return false;
    }
  };

  const updateConnection = async (connectionId: string, updates: Partial<DatabaseConnection>): Promise<boolean> => {
    try {
      // For now, simulate API call since connectionsAPI.update is not implemented
      await new Promise(resolve => setTimeout(resolve, 300));
      
      // Find the connection and apply updates
      const connection = state.connections.find(conn => conn.id === connectionId);
      if (!connection) {
        throw new Error('Connection not found');
      }
      
      const updatedConnection = { ...connection, ...updates, updatedAt: new Date() };
      dispatch({ type: 'UPDATE_CONNECTION', payload: updatedConnection });
      return true;
    } catch (error) {
      console.error('Failed to update connection:', error);
      return false;
    }
  };

  const deleteConnection = async (connectionId: string): Promise<boolean> => {
    try {
      await connectionsAPI.delete(connectionId);
      dispatch({ type: 'DELETE_CONNECTION', payload: connectionId });
      return true;
    } catch (error) {
      console.error('Failed to delete connection:', error);
      return false;
    }
  };

  const selectConnection = (connectionId: string) => {
    dispatch({ type: 'SET_CURRENT_CONNECTION', payload: connectionId });
  };

  return (
    <AppContext.Provider
      value={{
        ...state,
        dispatch,
        login,
        register,
        logout,
        executeQuery,
        connectToDatabase,
        disconnectFromDatabase,
        createProject,
        updateProject,
        deleteProject,
        selectProject,
        switchView,
        setShowAuthForm,
        setAuthFormType,
        createConnection,
        updateConnection,
        deleteConnection,
        selectConnection,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}

// File tree utility functions
function toggleFolder(nodes: FileNode[], nodeId: string): FileNode[] {
  return nodes.map(node => {
    if (node.id === nodeId && node.type === 'folder') {
      return { ...node, isOpen: !node.isOpen };
    }
    if (node.children) {
      return { ...node, children: toggleFolder(node.children, nodeId) };
    }
    return node;
  });
}

function createFile(nodes: FileNode[], payload: { parentId: string; name: string; type: 'file' | 'folder' }): FileNode[] {
  return nodes.map(node => {
    if (node.id === payload.parentId && node.type === 'folder') {
      const newFile: FileNode = {
        id: Date.now().toString(),
        name: payload.name,
        type: payload.type,
        path: `${node.path}/${payload.name}`,
        ...(payload.type === 'folder' && { children: [], isOpen: false })
      };
      return {
        ...node,
        children: [...(node.children || []), newFile]
      };
    }
    if (node.children) {
      return { ...node, children: createFile(node.children, payload) };
    }
    return node;
  });
}

function deleteFile(nodes: FileNode[], nodeId: string): FileNode[] {
  return nodes.filter(node => {
    if (node.id === nodeId) {
      return false;
    }
    if (node.children) {
      node.children = deleteFile(node.children, nodeId);
    }
    return true;
  });
}