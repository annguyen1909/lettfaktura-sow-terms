const fastify = require('fastify')({ logger: true });
const { TermsContent, testConnection } = require('./models');

// Register CORS
fastify.register(require('@fastify/cors'), {
  origin: true
});

// Routes

// Health check
fastify.get('/health', async (request, reply) => {
  return { 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    database: 'connected' 
  };
});

// Get terms content for specific language (Swedish or English only)
fastify.get('/api/v1/locals/terms/:languageCode', async (request, reply) => {
  try {
    const { languageCode } = request.params;
    
    // Only allow Swedish and English
    if (!['se', 'en'].includes(languageCode.toLowerCase())) {
      return reply.code(400).send({ 
        error: 'Only Swedish (se) and English (en) languages are supported' 
      });
    }

    // Get terms content from database
    const termsContent = await TermsContent.findOne({
      where: {
        language_code: languageCode.toLowerCase()
      }
    });

    if (!termsContent) {
      return reply.code(404).send({ 
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

    return response;
  } catch (error) {
    fastify.log.error('Terms content error:', error);
    return reply.code(500).send({ error: 'Internal server error' });
  }
});

// Get simple config with fallback data
fastify.get('/api/v1/config', async (request, reply) => {
  return {
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
});

// Start server
const start = async () => {
  try {
    // Test database connection
    await testConnection();
    
    // Start server
    await fastify.listen({ 
      port: process.env.PORT || 3000,
      host: '0.0.0.0'
    });
    
    console.log('🚀 Fastify server running on port', process.env.PORT || 3000);
    console.log('📋 Health check: http://localhost:3000/health');
    console.log('🇸🇪 Swedish terms: http://localhost:3000/api/v1/locals/terms/se');
    console.log('🇬🇧 English terms: http://localhost:3000/api/v1/locals/terms/en');
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};

start();
