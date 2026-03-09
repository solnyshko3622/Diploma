const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');

// Mock database arrays
const users = [];
const projects = [];
const connections = [];
const queryHistory = [];

async function seedDatabase() {
  console.log('🌱 Seeding mock database with demo data...');

  try {
    // Clear existing data
    users.length = 0;
    projects.length = 0;
    connections.length = 0;
    queryHistory.length = 0;

    // Create demo user
    const demoUser = {
      id: uuidv4(),
      name: 'Demo User',
      email: 'demo@example.com',
      password: await bcrypt.hash('password', 10),
      createdAt: new Date().toISOString()
    };
    users.push(demoUser);

    console.log('✅ Demo user created:', demoUser.email);

    // Create sample projects
    const sampleProjects = [
      {
        id: uuidv4(),
        name: 'E-commerce Analytics',
        description: 'Analytics database for online store',
        ownerId: demoUser.id,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        status: 'active',
        tags: ['analytics', 'ecommerce', 'postgresql'],
        members: [{
          userId: demoUser.id,
          role: 'owner',
          joinedAt: new Date().toISOString()
        }],
        settings: {
          theme: 'dark',
          autoSave: true,
          queryTimeout: 30000
        }
      },
      {
        id: uuidv4(),
        name: 'Customer Database',
        description: 'Main customer relationship management database',
        ownerId: demoUser.id,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        status: 'active',
        tags: ['crm', 'mysql', 'production'],
        members: [{
          userId: demoUser.id,
          role: 'owner',
          joinedAt: new Date().toISOString()
        }],
        settings: {
          theme: 'light',
          autoSave: false,
          queryTimeout: 60000
        }
      },
      {
        id: uuidv4(),
        name: 'Development Sandbox',
        description: 'Testing and development environment',
        ownerId: demoUser.id,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        status: 'active',
        tags: ['development', 'testing', 'sqlite'],
        members: [{
          userId: demoUser.id,
          role: 'owner',
          joinedAt: new Date().toISOString()
        }],
        settings: {
          theme: 'light',
          autoSave: true,
          queryTimeout: 15000
        }
      }
    ];

    projects.push(...sampleProjects);
    console.log('✅ Projects created:', sampleProjects.map(p => p.name));

    // Create sample database connections
    const sampleConnections = [
      {
        id: uuidv4(),
        name: 'Production PostgreSQL',
        type: 'postgresql',
        host: 'localhost',
        port: 5432,
        database: 'ecommerce_db',
        username: 'admin',
        password: 'securepassword123',
        ssl: false,
        readOnly: false,
        projectId: sampleProjects[0].id,
        ownerId: demoUser.id,
        createdAt: new Date().toISOString()
      },
      {
        id: uuidv4(),
        name: 'CRM MySQL',
        type: 'mysql',
        host: 'db.company.com',
        port: 3306,
        database: 'customer_crm',
        username: 'crm_user',
        password: 'crmpass123',
        ssl: true,
        readOnly: false,
        projectId: sampleProjects[1].id,
        ownerId: demoUser.id,
        createdAt: new Date().toISOString()
      },
      {
        id: uuidv4(),
        name: 'Local SQLite',
        type: 'sqlite',
        filename: ':memory:',
        database: 'development',
        readOnly: false,
        projectId: sampleProjects[2].id,
        ownerId: demoUser.id,
        createdAt: new Date().toISOString()
      }
    ];

    connections.push(...sampleConnections);
    console.log('✅ Database connections created');

    // Create sample query history
    const sampleQueries = [
      {
        id: uuidv4(),
        query: 'SELECT * FROM users LIMIT 10;',
        executionTime: 0.125,
        rowCount: 10,
        error: null,
        connectionId: sampleConnections[0].id,
        projectId: sampleProjects[0].id,
        userId: demoUser.id,
        timestamp: new Date(Date.now() - 3600000).toISOString()
      },
      {
        id: uuidv4(),
        query: 'SELECT COUNT(*) as total_users FROM users;',
        executionTime: 0.045,
        rowCount: 1,
        error: null,
        connectionId: sampleConnections[0].id,
        projectId: sampleProjects[0].id,
        userId: demoUser.id,
        timestamp: new Date(Date.now() - 7200000).toISOString()
      },
      {
        id: uuidv4(),
        query: 'UPDATE products SET price = price * 1.1 WHERE category = "electronics";',
        executionTime: 0.234,
        rowCount: 25,
        error: null,
        connectionId: sampleConnections[1].id,
        projectId: sampleProjects[1].id,
        userId: demoUser.id,
        timestamp: new Date(Date.now() - 10800000).toISOString()
      },
      {
        id: uuidv4(),
        query: 'CREATE TABLE test_table (id SERIAL PRIMARY KEY, name VARCHAR(100));',
        executionTime: 0.089,
        rowCount: 0,
        error: null,
        connectionId: sampleConnections[2].id,
        projectId: sampleProjects[2].id,
        userId: demoUser.id,
        timestamp: new Date(Date.now() - 14400000).toISOString()
      }
    ];

    queryHistory.push(...sampleQueries);
    console.log('✅ Query history created');

    console.log('🎉 Database seeding completed successfully!');
    console.log('📧 Demo credentials: demo@example.com / password');
    console.log('🚀 Start the server with: npm run dev');

  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  }
}

// Export the data arrays and seed function
module.exports = {
  users,
  projects,
  connections,
  queryHistory,
  seedDatabase
};

// Run seeding if this file is executed directly
if (require.main === module) {
  seedDatabase();
}