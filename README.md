# 123 Fakturera Terms Page

A modern, responsive terms of service page built with Vite, featuring multilingual support and database-driven content.

## 🚀 Features

- **Modern Frontend**: Built with Vite for fast development and optimized builds
- **Multilingual Support**: Swedish and English language switching
- **Database-Driven Content**: PostgreSQL backend with real terms content
- **Responsive Design**: Works seamlessly on desktop and mobile devices
- **API Integration**: RESTful API for configuration and content management
- **Error Handling**: Graceful fallbacks when API is unavailable

## 🏗️ Project Structure

```
lettfaktura-sow-terms/
├── src/                    # Vite frontend source
│   ├── main.js            # Application entry point
│   ├── terms.js           # Terms page functionality
│   └── style.css          # Main styles
├── components/            # Reusable components
│   ├── navbar/           # Navigation component
│   │   └── navbar.css    # Navigation styles
│   └── utils.js          # Utility functions
├── api/                   # Express.js backend
│   ├── server.js         # API server
│   ├── package.json      # Backend dependencies
│   └── .env              # Database configuration
├── database/             # Database files
│   ├── schema.sql        # Complete database schema
│   └── update_terms_content.sql  # Content update script
├── public/               # Static assets
├── dist/                 # Built files (generated)
└── package.json          # Frontend dependencies
```

## 🛠️ Setup & Installation

### Prerequisites
- Node.js (v16 or higher)
- PostgreSQL database (or Supabase account)
- npm or yarn

### 1. Clone and Install
```bash
git clone <repository-url>
cd lettfaktura-sow-terms
npm install
```

### 2. Backend Setup
```bash
# Install API dependencies
npm run setup

# Configure database
cp api/.env.example api/.env
# Edit api/.env with your database credentials
```

### 3. Database Setup
```bash
# Run the schema file in your PostgreSQL database
psql -d your_database -f database/schema.sql

# Or use the update script for existing databases
psql -d your_database -f database/update_terms_content.sql
```

### 4. Environment Configuration
```bash
# Frontend environment (already created)
# Edit .env if needed for different API URL
VITE_API_URL=http://localhost:3000/api/v1
VITE_DEFAULT_LANGUAGE=se
```

## 🚦 Running the Application

### Development Mode
```bash
# Run both frontend and backend together
npm start

# Or run them separately:
npm run dev          # Frontend only (Vite dev server)
npm run api:dev      # Backend only (Express server)
```

### Production Build
```bash
# Build frontend for production
npm run build

# Preview production build
npm run preview

# Run production API
npm run api
```

## 🌐 API Endpoints

### Configuration
- `GET /api/v1/config` - Site configuration, navigation, and languages

### Terms Content
- `GET /api/v1/locals/terms/:languageCode` - Terms content for specific language
  - `:languageCode` - `se` for Swedish, `en` for English

## 🗄️ Database Schema

### Tables
- **languages** - Available languages (Swedish, English)
- **site_config** - Site configuration (title, logo, background)
- **navigation_items** - Navigation menu structure
- **navigation_translations** - Multilingual navigation labels
- **terms_content** - Terms of service content in multiple languages

### Content Fields
The terms content includes 24 text fields (`terms_text_1` through `terms_text_24`) plus a Swedish-specific field (`terms_text_10_se`) for detailed terms coverage.

## 🎨 Styling & Responsive Design

- **CSS Variables**: Consistent theming throughout the application
- **Flexbox Layout**: Modern, flexible layout system
- **Mobile-First**: Responsive design that works on all screen sizes
- **Loading States**: Smooth loading indicators for better UX

## 🌍 Language Support

### Supported Languages
- **Swedish (se)**: Default language with complete terms content
- **English (en)**: Full English translation of all terms

### Adding New Languages
1. Add language entry to `languages` table
2. Create translations in `navigation_translations` table
3. Add terms content to `terms_content` table
4. Update frontend language selector

## 🔧 Development

### Hot Reload
Vite provides instant hot module replacement during development for a smooth developer experience.

### API Proxy
Development server automatically proxies `/api` requests to the Express backend running on port 3000.

### Error Handling
- Graceful API failure handling with fallback content
- User-friendly error messages
- Automatic retry mechanisms

## 📦 Building for Production

### Frontend
```bash
npm run build
```
Generates optimized static files in the `dist/` directory.

### Backend
The Express server can be deployed to any Node.js hosting platform. Make sure to:
1. Set up your production database
2. Configure environment variables
3. Run the database schema

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is part of the 123 Fakturera application suite.

---

**Built with ❤️ using Vite + Express.js + PostgreSQL**
