# RunAI Notebook Webapp

A modern, feature-rich notebook application built with Next.js, featuring AI-powered assistance and real-time collaboration capabilities.

## 🚀 Features

- 📝 Interactive Notebook Interface
- 🤖 AI Assistant Integration (Multiple AI Providers Support)
- 🔐 Auth0 Authentication
- 💾 Cloudflare D1 Database
- 🎨 Modern UI with shadcn/ui Components
- 📱 Responsive Design
- 🌐 Edge Runtime Support
- 🔄 Real-time Updates

## 🛠️ Tech Stack

- **Framework:** Next.js 14
- **Authentication:** Auth0
- **Database:** Cloudflare D1 (SQLite)
- **UI Components:** shadcn/ui
- **Styling:** Tailwind CSS
- **AI Providers:** OpenAI, Anthropic, Groq, Mistral, XAI
- **Deployment:** Cloudflare Pages

## 📋 Prerequisites

- Node.js 18+ 
- Wrangler CLI (for D1 database)
- Auth0 Account
- AI Provider API Keys

## 🚀 Getting Started

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd runai-notebook-webapp
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   Create a `.env.local` file with the following variables:
   ```
   # Auth0
   AUTH0_SECRET='your-auth0-secret'
   AUTH0_BASE_URL='your-auth0-base-url'
   AUTH0_ISSUER_BASE_URL='your-auth0-issuer-url'
   AUTH0_CLIENT_ID='your-auth0-client-id'
   AUTH0_CLIENT_SECRET='your-auth0-client-secret'

   # AI Providers
   OPENAI_API_KEY='your-openai-api-key'
   # Add other AI provider keys as needed
   ```

4. **Initialize the database**
   ```bash
   wrangler d1 migrations apply --local
   ```

5. **Run the development server**
   ```bash
   npm run dev
   ```

## 🔧 Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build the application
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run pages:build` - Build for Cloudflare Pages
- `npm run preview` - Preview Cloudflare Pages build locally
- `npm run deploy` - Deploy to Cloudflare Pages

## 📦 Database Migrations

To create a new migration:
```bash
wrangler d1 migrations create <migration-name>
```

To apply migrations locally:
```bash
wrangler d1 migrations apply --local
```

## 🚀 Deployment

The application is configured for deployment on Cloudflare Pages. To deploy:

1. Ensure all environment variables are set in Cloudflare Pages dashboard
2. Run `npm run deploy`

## 🧪 Testing

API endpoints can be tested using the provided `api-db-test.http` file.

## 📝 Project Structure

- `/app` - Next.js application routes and pages
- `/components` - Reusable UI components
- `/server` - Backend services and domain logic
- `/hooks` - Custom React hooks
- `/migrations` - D1 database migrations
- `/lib` - Utility functions and shared code

## 🤝 Contributing

1. Fork the repository
2. Create a new branch
3. Make your changes
4. Submit a pull request

## 📄 License

This project is private and proprietary.
