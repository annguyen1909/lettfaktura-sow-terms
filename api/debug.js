export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { Sequelize } = require('sequelize');
    
    const envCheck = {
      DB_HOST: process.env.DB_HOST ? 'SET' : 'MISSING',
      DB_USER: process.env.DB_USER ? 'SET' : 'MISSING', 
      DB_PASSWORD: process.env.DB_PASSWORD ? 'SET' : 'MISSING',
      DB_NAME: process.env.DB_NAME ? 'SET' : 'MISSING',
      DB_PORT: process.env.DB_PORT || 'default(5432)',
      DB_SSL: process.env.DB_SSL || 'false'
    };

    const response = {
      status: 'OK',
      timestamp: new Date().toISOString(),
      environment: 'vercel-serverless',
      environmentVariables: envCheck
    };

    // Try database connection if credentials exist
    if (process.env.DB_HOST && process.env.DB_USER && process.env.DB_PASSWORD && process.env.DB_NAME) {
      try {
        const sequelize = new Sequelize({
          host: process.env.DB_HOST,
          port: process.env.DB_PORT || 5432,
          database: process.env.DB_NAME,
          username: process.env.DB_USER,
          password: process.env.DB_PASSWORD,
          dialect: 'postgres',
          ssl: process.env.DB_SSL === 'true',
          dialectOptions: {
            ssl: process.env.DB_SSL === 'true' ? {
              require: true,
              rejectUnauthorized: false
            } : false
          },
          logging: false
        });

        await sequelize.authenticate();
        response.database = 'connected';
        
        // Test if terms_content table exists
        const [results] = await sequelize.query(
          "SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'terms_content'"
        );
        
        response.termsTableExists = results.length > 0;
        
        if (results.length > 0) {
          // Count records in terms_content
          const [countResult] = await sequelize.query("SELECT COUNT(*) as count FROM terms_content");
          response.termsRecordCount = countResult[0].count;
        }
        
        await sequelize.close();
      } catch (dbError) {
        response.database = 'error';
        response.databaseError = dbError.message;
      }
    } else {
      response.database = 'no-credentials';
    }

    return res.status(200).json(response);
  } catch (error) {
    return res.status(500).json({ 
      error: 'Internal server error',
      message: error.message 
    });
  }
}
