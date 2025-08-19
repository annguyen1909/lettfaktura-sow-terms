# 123 Fakturera Terms Page

A modern, responsive terms of service page built with Vite, featuring multilingual support and database-driven content.

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

# Lettfaktura SOW Terms

## Project Overview
This project is a simple multilingual terms and conditions web app for Lettfaktura, built with a modern frontend stack and a lightweight backend. It supports language switching (Swedish/English) and is styled for both desktop and mobile.

## Tech Stack & Details

- **Frontend:**
  - Vanilla JavaScript (ES6+)
  - HTML5
  - CSS3 (custom, no frameworks)
  - Vite (for fast development and build)
- **Backend:**
  - Fastify (Node.js web server)
  - Sequelize (ORM for database, if used)
- **Node.js Version:** 18.x or newer recommended
- **No React or frontend frameworks used**
- **No CSS frameworks (like Tailwind, Bootstrap) used**
- **No icons or icon libraries included**

## Key Features
- Language selector (Swedish/English)
- Responsive navigation bar
- Terms content loaded dynamically
- Mobile and desktop support

**Backend API Endpoints (Serverless Functions):**
- `/api/health` - Health check
- `/api/config` - Site configuration and navigation
- `/api/terms/[languageCode]` - Terms content (se or en)

**Note:**
- The backend runs as Vercel Serverless Functions
- Database connections are handled automatically
- Each API call creates a new serverless instance


