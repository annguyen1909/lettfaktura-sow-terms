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
    const config = {
      title: "123 Fakturera",
      description: "Terms and Conditions",
      languages: [
        {
          code: "se",
          name: "Svenska",
          flag_url: "https://storage.123fakturere.no/public/flags/SE.png",
          is_active: true
        },
        {
          code: "en", 
          name: "English",
          flag_url: "https://storage.123fakturere.no/public/flags/GB.png",
          is_active: true
        }
      ],
      navigation: {
        se: [
          { title: "Hem", url: "/" },
          { title: "Beställ", url: "/pricing" },
          { title: "Våra Kunder", url: "/features" },
          { title: "Om oss", url: "/support" },
          { title: "Kontakta oss", url: "/contact" }
        ],
        en: [
          { title: "Home", url: "/" },
          { title: "Order", url: "/pricing" },
          { title: "Our Customers", url: "/features" },
          { title: "About us", url: "/support" },
          { title: "Contact us", url: "/contact" }
        ]
      }
    };

    return res.status(200).json(config);
  } catch (error) {
    console.error('Config error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
