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

  console.log('=== Direct PG Connection Test ===');

  // Fallback data
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

  try {
    const { languageCode } = req.query;
    
    console.log('Environment variables check:', {
      DB_HOST: process.env.DB_HOST ? 'SET' : 'MISSING',
      DB_USER: process.env.DB_USER ? 'SET' : 'MISSING', 
      DB_PASSWORD: process.env.DB_PASSWORD ? 'SET' : 'MISSING',
      DB_NAME: process.env.DB_NAME ? 'SET' : 'MISSING',
      DB_PORT: process.env.DB_PORT || 'NOT SET',
      DB_SSL: process.env.DB_SSL || 'NOT SET'
    });
    
    // Only allow Swedish and English
    if (!['se', 'en'].includes(languageCode?.toLowerCase())) {
      console.log('Invalid language code:', languageCode);
      return res.status(400).json({ 
        error: 'Only Swedish (se) and English (en) languages are supported' 
      });
    }

    console.log('Processing language:', languageCode);

    // Check if we have database credentials
    const hasDbCredentials = process.env.DB_HOST && process.env.DB_USER && process.env.DB_PASSWORD && process.env.DB_NAME;
    console.log('Has database credentials:', hasDbCredentials);

    if (hasDbCredentials) {
      try {
        console.log('Attempting direct pg connection...');
        const { Pool } = require('pg');
        
        const pool = new Pool({
          host: process.env.DB_HOST,
          port: process.env.DB_PORT || 5432,
          database: process.env.DB_NAME,
          user: process.env.DB_USER,
          password: process.env.DB_PASSWORD,
          ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false,
          max: 1, // Limit connections for serverless
          idleTimeoutMillis: 30000,
          connectionTimeoutMillis: 5000,
        });

        console.log('Executing database query...');
        const result = await pool.query(
          'SELECT * FROM terms_content WHERE language_code = $1',
          [languageCode.toLowerCase()]
        );

        console.log('Query result rows:', result.rows.length);

        if (result.rows.length > 0) {
          console.log('Database data found for', languageCode);
          const termsContent = result.rows[0];
          
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

          await pool.end();
          console.log('Returning database data');
          return res.status(200).json(response);
        } else {
          console.log('No database data found for', languageCode);
          await pool.end();
        }
      } catch (dbError) {
        console.log('Database error:', dbError.message);
        console.log('Full error:', dbError);
      }
    } else {
      console.log('Missing database credentials, using fallback');
    }

    // Fallback to static data
    console.log('Using fallback data for', languageCode);
    const termsData = fallbackTermsData[languageCode.toLowerCase()];
    
    if (!termsData) {
      console.log('No fallback data found for', languageCode);
      return res.status(404).json({ 
        error: `Terms content not found for language: ${languageCode}` 
      });
    }

    console.log('Returning fallback data');
    return res.status(200).json(termsData);
  } catch (error) {
    console.error('Handler error:', error);
    return res.status(500).json({ 
      error: 'Internal server error',
      message: error.message 
    });
  }
}
