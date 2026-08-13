# Vmax.mn Client (Frontend)

The frontend web application for **Vmax.mn** — a modern Real Estate Marketplace built with React, Vite, TypeScript, and Tailwind CSS.

---

## 🚀 Overview

The Vmax Client is a single-page application (SPA) providing real estate listing browsing, property search, interactive maps, user authentication, agent dashboards, and property management.

### Tech Stack
- **Framework**: React 19 + TypeScript
- **Build Tool**: Vite 8
- **Styling**: Tailwind CSS v4
- **State Management**: Zustand
- **Routing**: React Router v7
- **HTTP Client**: Axios
- **UI & Animations**: Framer Motion, Lucide Icons
- **Forms**: React Hook Form

---

## 🛠️ How to Run the Client

### Prerequisites
- Node.js (v18 or higher recommended)
- npm or yarn

### 1. Install Dependencies
```bash
cd client
npm install
```

### 2. Configure Environment Variables (Optional)
If environment variables are required (e.g., API base URL, Google OAuth Client ID), create a `.env` file in the `client` directory:
```env
VITE_API_BASE_URL=http://localhost:5000
VITE_GOOGLE_CLIENT_ID=your_google_client_id
```

### 3. Run Development Server
To start the local development server:
```bash
npm run dev
```
> The application will start at `http://localhost:3000`.

> ⚠️ **Note**: `npm run start` is **not** a valid script in Vite. Always use `npm run dev` to start the frontend.

---

## 📜 Available Scripts

| Command | Description |
|---|---|
| `npm run dev` | Starts the Vite development server with HMR |
| `npm run build` | Runs TypeScript check (`tsc -b`) and builds production assets |
| `npm run preview` | Previews the local production build |
| `npm run lint` | Runs `oxlint` for code linting |

---

## 📁 Project Structure

```
client/
├── src/
│   ├── assets/       # Static assets (images, fonts, logos)
│   ├── components/   # Reusable UI components
│   ├── hooks/        # Custom React hooks
│   ├── i18n/         # Multi-language translations
│   ├── pages/        # Route page components
│   ├── services/     # API service layer (Axios)
│   ├── store/        # Zustand state stores
│   ├── types/        # TypeScript interfaces & types
│   ├── App.tsx       # Main router & app root
│   └── main.tsx      # Entry point
├── index.html        # HTML template
├── vite.config.ts    # Vite configuration
└── package.json      # Dependencies and scripts
```
