// Try to load database models - with better error handling
let TermsContent, testConnection, sequelize;

const initDatabase = async () => {
  try {
    // Manual Sequelize setup for serverless
    const { Sequelize } = require('sequelize');
    
    sequelize = new Sequelize({
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

    // Define TermsContent model directly
    TermsContent = sequelize.define('TermsContent', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      language_code: {
        type: Sequelize.STRING(2),
        allowNull: false
      },
      heading: {
        type: Sequelize.STRING,
        allowNull: true
      },
      close_button_text: {
        type: Sequelize.STRING,
        allowNull: true
      },
      terms_text_1: Sequelize.TEXT,
      terms_text_2: Sequelize.TEXT,
      terms_text_3: Sequelize.TEXT,
      terms_text_4: Sequelize.TEXT,
      terms_text_5: Sequelize.TEXT,
      terms_text_6: Sequelize.TEXT,
      terms_text_7: Sequelize.TEXT,
      terms_text_8: Sequelize.TEXT,
      terms_text_9: Sequelize.TEXT,
      terms_text_10: Sequelize.TEXT,
      terms_text_10_se: Sequelize.TEXT,
      terms_text_11: Sequelize.TEXT,
      terms_text_12: Sequelize.TEXT,
      terms_text_13: Sequelize.TEXT,
      terms_text_14: Sequelize.TEXT,
      terms_text_15: Sequelize.TEXT,
      terms_text_16: Sequelize.TEXT,
      terms_text_17: Sequelize.TEXT,
      terms_text_18: Sequelize.TEXT,
      terms_text_19: Sequelize.TEXT,
      terms_text_20: Sequelize.TEXT,
      terms_text_21: Sequelize.TEXT,
      terms_text_22: Sequelize.TEXT,
      terms_text_23: Sequelize.TEXT,
      terms_text_24: Sequelize.TEXT
    }, {
      tableName: 'terms_content',
      timestamps: false
    });

    testConnection = async () => {
      await sequelize.authenticate();
      console.log('✅ Database connection established');
    };

    return true;
  } catch (error) {
    console.log('Database initialization failed:', error.message);
    return false;
  }
};

// Fallback data for when database is not available
const fallbackTermsData = {
  se: {
    heading: "Villkor",
    close_button_text: "Stäng och gå tillbaka",
    terms_text_1: "Här hittar ni våra villkor för 123 Fakturera. Vi arbetar för att ge er den bästa faktureringslösningen på marknaden.",
    terms_text_2: "Genom att använda våra tjänster accepterar ni dessa villkor och regler.",
    terms_text_3: "Vi förbehåller oss rätten att uppdatera dessa villkor när som helst.",
    terms_text_4: "För frågor om villkoren, kontakta oss på support@123fakturera.se.",
    terms_text_5: "Dessa villkor gäller från och med den dag du börjar använda tjänsten."
  },
  en: {
    heading: "Terms of Service",
    close_button_text: "Close",
    terms_text_1: "Here you can find our terms of service for 123 Fakturera. We work to provide you with the best invoicing solution on the market.",
    terms_text_2: "By using our services, you accept these terms and conditions.",
    terms_text_3: "We reserve the right to update these terms at any time.",
    terms_text_4: "For questions about the terms, contact us at support@123fakturera.se.",
    terms_text_5: "These terms are effective from the day you start using the service."
  }
};

export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { languageCode } = req.query;
    
    console.log('Environment check:', {
      hasHost: !!process.env.DB_HOST,
      hasUser: !!process.env.DB_USER,
      hasPassword: !!process.env.DB_PASSWORD,
      hasName: !!process.env.DB_NAME
    });
    
    // Only allow Swedish and English
    if (!['se', 'en'].includes(languageCode?.toLowerCase())) {
      return res.status(400).json({ 
        error: 'Only Swedish (se) and English (en) languages are supported' 
      });
    }

    // Try to initialize and use database
    const dbInitialized = await initDatabase();
    
    if (dbInitialized && TermsContent && testConnection) {
      try {
        await testConnection();
        console.log('Database connected, querying for language:', languageCode);
        
        const termsContent = await TermsContent.findOne({
          where: {
            language_code: languageCode.toLowerCase()
          }
        });

        if (termsContent) {
          console.log('Database data found for', languageCode);
          // Format response to match frontend expectations
          const response = {
            heading: termsContent.heading,
            close_button_text: termsContent.close_button_text
          };

          // Add all terms_text fields that have content
          for (let i = 1; i <= 24; i++) {
            const fieldName = `terms_text_${i}`;
            const seFieldName = `terms_text_${i}_se`;
            
            // For Swedish, check if there's a special SE field first
            if (languageCode.toLowerCase() === 'se' && termsContent[seFieldName]) {
              response[seFieldName] = termsContent[seFieldName];
            } else if (termsContent[fieldName]) {
              response[fieldName] = termsContent[fieldName];
            }
          }

          return res.status(200).json(response);
        } else {
          console.log('No database data found for', languageCode, 'using fallback');
        }
      } catch (dbError) {
        console.log('Database query error:', dbError.message);
      }
    } else {
      console.log('Database not initialized, using fallback');
    }

    // Fallback to static data
    console.log('Using fallback data for', languageCode);
    const termsData = fallbackTermsData[languageCode.toLowerCase()];
    
    if (!termsData) {
      return res.status(404).json({ 
        error: `Terms content not found for language: ${languageCode}` 
      });
    }

    return res.status(200).json(termsData);
  } catch (error) {
    console.error('Terms content error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
