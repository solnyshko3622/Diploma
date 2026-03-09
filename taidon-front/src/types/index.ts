export interface DatabaseConnection {
  id: string;
  name: string;
  type: 'postgresql' | 'mysql' | 'sqlite';
  host?: string;
  port?: number;
  database: string;
  username?: string;
  password?: string;
  filename?: string; // For SQLite
  ssl?: boolean;
  readOnly?: boolean;
}

export interface QueryResult {
  columns: string[];
  rows: any[];
  rowCount: number;
  executionTime: number;
  error?: string;
}

export interface QueryHistoryItem {
  id: string;
  query: string;
  timestamp: Date;
  connectionId: string;
  executionTime?: number;
  rowCount?: number;
  error?: string;
}

export interface Tab {
  id: string;
  title: string;
  query: string;
  connectionId?: string;
  result?: QueryResult;
  isDirty: boolean;
}

export interface User {
  id: string;
  email: string;
  name: string;
  createdAt: Date;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

export interface FileNode {
  id: string;
  name: string;
  type: 'file' | 'folder';
  path: string;
  children?: FileNode[];
  content?: string;
  isOpen?: boolean;
}

export interface Project {
  id: string;
  name: string;
  description?: string;
  ownerId: string;
  createdAt: Date;
  updatedAt: Date;
  status: 'active' | 'archived' | 'completed';
  tags: string[];
  members: ProjectMember[];
  settings: ProjectSettings;
}

export interface ProjectMember {
  userId: string;
  role: 'owner' | 'admin' | 'member' | 'viewer';
  joinedAt: Date;
}

export interface ProjectSettings {
  theme?: 'light' | 'dark';
  defaultConnectionId?: string;
  autoSave: boolean;
  queryTimeout: number;
}

export interface AppState {
  auth: AuthState;
  connections: DatabaseConnection[];
  currentConnectionId?: string;
  tabs: Tab[];
  activeTabId: string;
  queryHistory: QueryHistoryItem[];
  theme: 'light' | 'dark';
  fileTree: FileNode[];
  currentFile?: FileNode;
  projects: Project[];
  currentProjectId?: string;
  currentView: 'editor' | 'projects';
  showAuthForm: boolean;
  authFormType: 'login' | 'register';
}