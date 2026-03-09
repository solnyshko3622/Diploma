const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');

const app = express();
const PORT = process.env.PORT || 3001;
const JWT_SECRET = process.env.JWT_SECRET || 'taidon-mock-backend-secret';

// Middleware
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:3000', 'http://localhost:8080'],
  credentials: true
}));
app.use(express.json());

// Mock database (import seeded data)
const { users, projects, connections, queryHistory, seedDatabase } = require('./seed');

// Seed the database on server start
seedDatabase();

// Authentication middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid token' });
    }
    req.user = user;
    next();
  });
};

// Helper function to get user projects
const getUserProjects = (userId) => {
  return projects.filter(p => p.ownerId === userId || p.members.some(m => m.userId === userId));
};

// Helper function to get user connections
const getUserConnections = (userId) => {
  const userProjects = getUserProjects(userId);
  const projectIds = userProjects.map(p => p.id);
  return connections.filter(c => projectIds.includes(c.projectId));
};

// Auth Routes
app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }

  const user = users.find(u => u.email === email);
  if (!user) {
    return res.status(401).json({ error: 'Invalid email or password' });
  }

  const validPassword = await bcrypt.compare(password, user.password);
  if (!validPassword) {
    return res.status(401).json({ error: 'Invalid email or password' });
  }

  const token = jwt.sign(
    { id: user.id, email: user.email, name: user.name },
    JWT_SECRET,
    { expiresIn: '7d' }
  );

  res.json({
    jwt: token,
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      createdAt: user.createdAt
    }
  });
});

app.post('/api/auth/register', async (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ error: 'Name, email, and password are required' });
  }

  if (users.find(u => u.email === email)) {
    return res.status(400).json({ error: 'User already exists' });
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  const user = {
    id: uuidv4(),
    name,
    email,
    password: hashedPassword,
    createdAt: new Date().toISOString()
  };

  users.push(user);

  const token = jwt.sign(
    { id: user.id, email: user.email, name: user.name },
    JWT_SECRET,
    { expiresIn: '7d' }
  );

  res.status(201).json({
    jwt: token,
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      createdAt: user.createdAt
    }
  });
});

app.get('/api/users/me', authenticateToken, (req, res) => {
  const user = users.find(u => u.id === req.user.id);
  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }

  res.json({
    id: user.id,
    email: user.email,
    name: user.name,
    createdAt: user.createdAt
  });
});

// Project Routes
app.get('/api/projects', authenticateToken, (req, res) => {
  const userProjects = getUserProjects(req.user.id);
  res.json(userProjects);
});

app.get('/api/projects/:id', authenticateToken, (req, res) => {
  const project = projects.find(p => p.id === req.params.id);
  if (!project) {
    return res.status(404).json({ error: 'Project not found' });
  }

  // Check if user has access to this project
  const hasAccess = project.ownerId === req.user.id || 
                   project.members.some(m => m.userId === req.user.id);
  if (!hasAccess) {
    return res.status(403).json({ error: 'Access denied' });
  }

  res.json(project);
});

app.post('/api/projects', authenticateToken, (req, res) => {
  const { name, description } = req.body;

  if (!name) {
    return res.status(400).json({ error: 'Project name is required' });
  }

  const project = {
    id: uuidv4(),
    name,
    description: description || '',
    ownerId: req.user.id,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    status: 'active',
    tags: [],
    members: [{
      userId: req.user.id,
      role: 'owner',
      joinedAt: new Date().toISOString()
    }],
    settings: {
      theme: 'light',
      autoSave: true,
      queryTimeout: 30000
    }
  };

  projects.push(project);
  res.status(201).json(project);
});

app.put('/api/projects/:id', authenticateToken, (req, res) => {
  const projectIndex = projects.findIndex(p => p.id === req.params.id);
  if (projectIndex === -1) {
    return res.status(404).json({ error: 'Project not found' });
  }

  const project = projects[projectIndex];
  
  // Check if user has access to this project
  const hasAccess = project.ownerId === req.user.id || 
                   project.members.some(m => m.userId === req.user.id);
  if (!hasAccess) {
    return res.status(403).json({ error: 'Access denied' });
  }

  const updates = req.body;
  projects[projectIndex] = {
    ...project,
    ...updates,
    updatedAt: new Date().toISOString()
  };

  res.json(projects[projectIndex]);
});

app.delete('/api/projects/:id', authenticateToken, (req, res) => {
  const projectIndex = projects.findIndex(p => p.id === req.params.id);
  if (projectIndex === -1) {
    return res.status(404).json({ error: 'Project not found' });
  }

  const project = projects[projectIndex];
  if (project.ownerId !== req.user.id) {
    return res.status(403).json({ error: 'Only project owner can delete the project' });
  }

  // Remove related connections and query history
  connections = connections.filter(c => c.projectId !== req.params.id);
  queryHistory = queryHistory.filter(q => q.projectId !== req.params.id);
  
  projects.splice(projectIndex, 1);
  res.status(204).send();
});

// Database Connection Routes
app.get('/api/database-connections', authenticateToken, (req, res) => {
  const userConnections = getUserConnections(req.user.id);
  res.json(userConnections);
});

app.post('/api/database-connections', authenticateToken, (req, res) => {
  const connectionData = req.body;
  
  if (!connectionData.name || !connectionData.type || !connectionData.database) {
    return res.status(400).json({ error: 'Name, type, and database are required' });
  }

  // Verify project access
  const project = projects.find(p => p.id === connectionData.projectId);
  if (!project) {
    return res.status(404).json({ error: 'Project not found' });
  }

  const hasAccess = project.ownerId === req.user.id || 
                   project.members.some(m => m.userId === req.user.id);
  if (!hasAccess) {
    return res.status(403).json({ error: 'Access denied' });
  }

  const connection = {
    id: uuidv4(),
    ...connectionData,
    ownerId: req.user.id,
    createdAt: new Date().toISOString()
  };

  connections.push(connection);
  res.status(201).json(connection);
});

app.delete('/api/database-connections/:id', authenticateToken, (req, res) => {
  const connectionIndex = connections.findIndex(c => c.id === req.params.id);
  if (connectionIndex === -1) {
    return res.status(404).json({ error: 'Connection not found' });
  }

  const connection = connections[connectionIndex];
  
  // Verify project access
  const project = projects.find(p => p.id === connection.projectId);
  if (!project) {
    return res.status(404).json({ error: 'Project not found' });
  }

  const hasAccess = project.ownerId === req.user.id || 
                   project.members.some(m => m.userId === req.user.id);
  if (!hasAccess) {
    return res.status(403).json({ error: 'Access denied' });
  }

  // Remove related query history
  queryHistory = queryHistory.filter(q => q.connectionId !== req.params.id);
  
  connections.splice(connectionIndex, 1);
  res.status(204).send();
});

// Query History Routes
app.get('/api/query-history', authenticateToken, (req, res) => {
  const userConnections = getUserConnections(req.user.id);
  const connectionIds = userConnections.map(c => c.id);
  const userQueryHistory = queryHistory.filter(q => connectionIds.includes(q.connectionId));
  res.json(userQueryHistory);
});

app.post('/api/query-history', authenticateToken, (req, res) => {
  const queryData = req.body;
  
  if (!queryData.query || !queryData.connectionId) {
    return res.status(400).json({ error: 'Query and connectionId are required' });
  }

  // Verify connection access
  const connection = connections.find(c => c.id === queryData.connectionId);
  if (!connection) {
    return res.status(404).json({ error: 'Connection not found' });
  }

  const project = projects.find(p => p.id === connection.projectId);
  if (!project) {
    return res.status(404).json({ error: 'Project not found' });
  }

  const hasAccess = project.ownerId === req.user.id || 
                   project.members.some(m => m.userId === req.user.id);
  if (!hasAccess) {
    return res.status(403).json({ error: 'Access denied' });
  }

  const query = {
    id: uuidv4(),
    ...queryData,
    userId: req.user.id,
    projectId: connection.projectId,
    timestamp: new Date().toISOString()
  };

  queryHistory.push(query);
  res.status(201).json(query);
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Mock backend server running on port ${PORT}`);
  console.log(`📧 Demo credentials: demo@example.com / password`);
});