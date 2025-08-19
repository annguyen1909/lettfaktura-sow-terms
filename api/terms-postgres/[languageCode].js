import postgres from 'postgres';

export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  try {
    const { languageCode } = req.query;

    // Debug info
    const debugInfo = {
      status: "OK",
      timestamp: new Date().toISOString(),
      environment: process.env.VERCEL ? 'vercel-serverless' : 'local',
      languageCode,
      environmentVariables: {
        DB_HOST: process.env.DB_HOST ? 'SET' : 'MISSING',
        DB_USER: process.env.DB_USER ? 'SET' : 'MISSING',
        DB_PASSWORD: process.env.DB_PASSWORD ? 'SET' : 'MISSING',
        DB_NAME: process.env.DB_NAME ? 'SET' : 'MISSING',
        DB_PORT: process.env.DB_PORT || 'DEFAULT',
        DB_SSL: process.env.DB_SSL || 'DEFAULT'
      }
    };

    // Validate required environment variables
    if (!process.env.DB_HOST || !process.env.DB_USER || !process.env.DB_PASSWORD || !process.env.DB_NAME) {
      return res.status(500).json({
        ...debugInfo,
        database: "error",
        databaseError: "Missing required environment variables"
      });
    }

    // Create postgres connection
    const sql = postgres({
      host: process.env.DB_HOST,
      port: parseInt(process.env.DB_PORT) || 5432,
      database: process.env.DB_NAME,
      username: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false,
      max: 1, // Limit connections for serverless
      idle_timeout: 20,
      connect_timeout: 30
    });

    try {
      // Test database connection
      await sql`SELECT 1 as test`;
      
      // Query terms
      const terms = await sql`
        SELECT * FROM terms 
        WHERE language_code = ${languageCode}
        ORDER BY section_order ASC, item_order ASC
      `;

      await sql.end(); // Close connection

      if (terms.length === 0) {
        return res.status(404).json({
          ...debugInfo,
          database: "connected",
          error: 'No terms found for the specified language code',
          availableLanguages: ['en', 'sv', 'no', 'da', 'fi']
        });
      }

      // Group terms by section
      const groupedTerms = terms.reduce((acc, term) => {
        const sectionKey = term.section_key;
        if (!acc[sectionKey]) {
          acc[sectionKey] = {
            section: term.section_title,
            items: []
          };
        }
        acc[sectionKey].items.push({
          title: term.title,
          content: term.content
        });
        return acc;
      }, {});

      res.status(200).json({
        ...debugInfo,
        database: "connected",
        data: groupedTerms
      });

    } catch (dbError) {
      await sql.end(); // Ensure connection is closed
      console.error('Database error:', dbError);
      
      // Return fallback data
      const fallbackData = {
        general: {
          section: "General Terms",
          items: [
            {
              title: "Database Connection Issue",
              content: `Unable to connect to database. Error: ${dbError.message}. Please check your database configuration.`
            }
          ]
        }
      };

      res.status(200).json({
        ...debugInfo,
        database: "error",
        databaseError: dbError.message,
        data: fallbackData,
        note: "Using fallback data due to database connection issue"
      });
    }

  } catch (error) {
    console.error('Function error:', error);
    res.status(500).json({
      status: "ERROR",
      timestamp: new Date().toISOString(),
      environment: process.env.VERCEL ? 'vercel-serverless' : 'local',
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
}
