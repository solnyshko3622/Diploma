# Taidon Mock Backend

Simple Express.js mock backend for Taidon SQL Editor with authentication, projects, and database connection management.

## Features

- **JWT Authentication**: Secure login and registration
- **Project Management**: Create, read, update, and delete SQL projects
- **Database Connections**: Manage PostgreSQL, MySQL, and SQLite connections
- **Query History**: Track executed SQL queries with performance metrics
- **CORS Enabled**: Configured for frontend integration
- **Demo Data**: Pre-populated with sample projects and connections

## Quick Start

### Prerequisites

- Node.js 14+ 
- npm or yarn

### Installation

1. **Install dependencies:**
   ```bash
   cd mock-backend
   npm install
   ```

2. **Start the server:**
   ```bash
   npm run dev
   ```

The backend will be available at `http://localhost:3001`

### Demo Credentials

- **Email:** demo@example.com
- **Password:** password

## API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration
- `GET /api/users/me` - Get current user (requires auth)

### Projects
- `GET /api/projects` - List user's projects (requires auth)
- `GET /api/projects/:id` - Get project by ID (requires auth)
- `POST /api/projects` - Create new project (requires auth)
- `PUT /api/projects/:id` - Update project (requires auth)
- `DELETE /api/projects/:id` - Delete project (requires auth)

### Database Connections
- `GET /api/database-connections` - List user's connections (requires auth)
- `POST /api/database-connections` - Create new connection (requires auth)
- `DELETE /api/database-connections/:id` - Delete connection (requires auth)

### Query History
- `GET /api/query-history` - List user's query history (requires auth)
- `POST /api/query-history` - Log new query (requires auth)

### Health Check
- `GET /api/health` - Server health status

## Data Models

### User
```javascript
{
  id: string,
  name: string,
  email: string,
  password: string (hashed),
  createdAt: string (ISO date)
}
```

### Project
```javascript
{
  id: string,
  name: string,
  description: string,
  ownerId: string,
  createdAt: string,
  updatedAt: string,
  status: 'active' | 'archived' | 'completed',
  tags: string[],
  members: Array<{
    userId: string,
    role: 'owner' | 'admin' | 'member' | 'viewer',
    joinedAt: string
  }>,
  settings: {
    theme: 'light' | 'dark',
    autoSave: boolean,
    queryTimeout: number
  }
}
```

### DatabaseConnection
```javascript
{
  id: string,
  name: string,
  type: 'postgresql' | 'mysql' | 'sqlite',
  host: string,
  port: number,
  database: string,
  username: string,
  password: string,
  filename: string (for SQLite),
  ssl: boolean,
  readOnly: boolean,
  projectId: string,
  ownerId: string,
  createdAt: string
}
```

### QueryHistory
```javascript
{
  id: string,
  query: string,
  executionTime: number,
  rowCount: number,
  error: string | null,
  connectionId: string,
  projectId: string,
  userId: string,
  timestamp: string
}
```

## Development

### Running in Development Mode
```bash
npm run dev
```

### Running in Production
```bash
npm start
```

### Seeding the Database
```bash
npm run seed
```

## Integration with Frontend

The backend is configured with CORS to allow requests from:
- `http://localhost:5173` (Vite dev server)
- `http://localhost:3000` (React dev server)
- `http://localhost:8080` (Alternative port)

## Authentication Flow

1. **Login/Register**: Use `/api/auth/login` or `/api/auth/register`
2. **Get Token**: Response includes JWT token
3. **API Calls**: Include token in Authorization header: `Bearer <token>`
4. **Auto-logout**: Tokens expire after 7 days

## Example API Usage

### Login
```bash
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"demo@example.com","password":"password"}'
```

### Get Projects (with auth)
```bash
curl -X GET http://localhost:3001/api/projects \
  -H "Authorization: Bearer <your-jwt-token>"
```

### Create Project
```bash
curl -X POST http://localhost:3001/api/projects \
  -H "Authorization: Bearer <your-jwt-token>" \
  -H "Content-Type: application/json" \
  -d '{"name":"My Project","description":"Project description"}'
```

## Security Notes

- Passwords are hashed using bcrypt
- JWT tokens expire after 7 days
- CORS is configured for specific origins only
- All sensitive endpoints require authentication

## License

MIT License