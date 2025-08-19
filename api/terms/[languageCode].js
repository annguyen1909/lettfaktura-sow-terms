// Fallback data for when database is not available
const fallbackTermsData = {
  se: {
    heading: "Villkor",
    close_button_text: "Stäng och gå tillbaka",
    terms_text_1: "Här hittar ni våra villkor för 123 Fakturera. Vi arbetar för att ge er den bästa faktureringslösningen på marknaden.",
    terms_text_2: "Genom att använda våra tjänster accepterar ni dessa villkor.",
    terms_text_3: "Vi förbehåller oss rätten att uppdatera dessa villkor när som helst."
  },
  en: {
    heading: "Terms",
    close_button_text: "Close",
    terms_text_1: "Here you can find our terms of service for 123 Fakturera. We work to provide you with the best invoicing solution on the market.",
    terms_text_2: "By using our services, you accept these terms.",
    terms_text_3: "We reserve the right to update these terms at any time."
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

    // Use fallback data for now (can be enhanced with database later)
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
