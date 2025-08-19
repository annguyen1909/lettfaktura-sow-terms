// Database models (will try to use if environment variables are set)
let TermsContent, testConnection;

try {
  const models = require('../models');
  TermsContent = models.TermsContent;
  testConnection = models.testConnection;
} catch (error) {
  console.log('Database models not available, using fallback data');
}
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
    
    // Only allow Swedish and English
    if (!['se', 'en'].includes(languageCode?.toLowerCase())) {
      return res.status(400).json({ 
        error: 'Only Swedish (se) and English (en) languages are supported' 
      });
    }

    // Try to load from database first
    if (TermsContent && testConnection) {
      try {
        await testConnection();
        
        const termsContent = await TermsContent.findOne({
          where: {
            language_code: languageCode.toLowerCase()
          }
        });

        if (termsContent) {
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
        }
      } catch (dbError) {
        console.log('Database error, falling back to static data:', dbError.message);
      }
    }

    // Fallback to static data
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
