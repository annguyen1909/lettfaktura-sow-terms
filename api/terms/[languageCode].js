const { TermsContent, testConnection } = require('../api/models');

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
    
    // Only allow Swedish and English
    if (!['se', 'en'].includes(languageCode?.toLowerCase())) {
      return res.status(400).json({ 
        error: 'Only Swedish (se) and English (en) languages are supported' 
      });
    }

    // Test database connection first
    await testConnection();

    // Get terms content from database
    const termsContent = await TermsContent.findOne({
      where: {
        language_code: languageCode.toLowerCase()
      }
    });

    if (!termsContent) {
      return res.status(404).json({ 
        error: `Terms content not found for language: ${languageCode}` 
      });
    }

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
  } catch (error) {
    console.error('Terms content error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
