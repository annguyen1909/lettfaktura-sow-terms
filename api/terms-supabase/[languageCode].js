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
        SUPABASE_URL: process.env.SUPABASE_URL ? 'SET' : 'MISSING',
        SUPABASE_ANON_KEY: process.env.SUPABASE_ANON_KEY ? 'SET' : 'MISSING'
      }
    };

    // Check if we have Supabase credentials
    if (process.env.SUPABASE_URL && process.env.SUPABASE_ANON_KEY) {
      try {
        // Use Supabase REST API
        const supabaseUrl = process.env.SUPABASE_URL;
        const supabaseKey = process.env.SUPABASE_ANON_KEY;
        
        const response = await fetch(
          `${supabaseUrl}/rest/v1/terms?language_code=eq.${languageCode}&order=section_order.asc,item_order.asc`,
          {
            headers: {
              'apikey': supabaseKey,
              'Authorization': `Bearer ${supabaseKey}`,
              'Content-Type': 'application/json'
            }
          }
        );

        if (!response.ok) {
          throw new Error(`Supabase API error: ${response.status} ${response.statusText}`);
        }

        const terms = await response.json();

        if (terms.length === 0) {
          return res.status(404).json({
            ...debugInfo,
            database: "connected-supabase",
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

        return res.status(200).json({
          ...debugInfo,
          database: "connected-supabase",
          data: groupedTerms
        });

      } catch (apiError) {
        console.error('Supabase API error:', apiError);
        
        return res.status(200).json({
          ...debugInfo,
          database: "error",
          databaseError: `Supabase API error: ${apiError.message}`,
          data: getFallbackData(languageCode),
          note: "Using fallback data due to Supabase API error"
        });
      }
    }

    // If no Supabase credentials, return fallback data
    return res.status(200).json({
      ...debugInfo,
      database: "no-credentials",
      databaseError: "No Supabase credentials available",
      data: getFallbackData(languageCode),
      note: "Using fallback data - no database credentials"
    });

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

function getFallbackData(languageCode) {
  const fallbackTerms = {
    en: {
      general: {
        section: "General Terms",
        items: [
          {
            title: "Service Description",
            content: "This service provides access to terms and conditions data. Currently using fallback data due to database connectivity issues."
          },
          {
            title: "Availability",
            content: "The service is available 24/7, subject to maintenance windows and technical requirements."
          }
        ]
      },
      payment: {
        section: "Payment Terms",
        items: [
          {
            title: "Payment Methods",
            content: "We accept various payment methods as specified in your service agreement."
          }
        ]
      }
    },
    sv: {
      general: {
        section: "Allmänna villkor",
        items: [
          {
            title: "Tjänstebeskrivning",
            content: "Denna tjänst ger tillgång till villkorsdata. Använder för närvarande reservdata på grund av databasanslutningsproblem."
          }
        ]
      }
    }
  };

  return fallbackTerms[languageCode] || fallbackTerms.en;
}
