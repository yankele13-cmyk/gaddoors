# 🚪 Gad Doors - Enterprise Web Platform

Official repositories for Gad Doors (Jerusalem), specialized in High Security Doors and Interior Design.

## 🛠 Tech Stack

**Frontend:**
- **Framework:** React 19 + Vite
- **Styling:** Tailwind CSS v4 + Framer Motion
- **State/Logic:** React Router v6, React Hook Form, Zod
- **I18n:** `react-i18next` (FR, EN, HE)
- **PDF Generation:** `@react-pdf/renderer` (Invoices, Quotes)

**Backend (Firebase):**
- **Authentication:** Firebase Auth
- **Database:** Firestore (NoSQL)
- **Serverless:** Cloud Functions (Node.js 20)
- **Hosting:** Firebase Hosting

## 🚀 Getting Started

### Prerequisites
- Node.js > 18
- Firebase CLI (`npm install -g firebase-tools`)

### Installation
```bash
npm install
```

### Local Development
```bash
npm run dev
# App runs on http://localhost:5174
```

## 📂 Project Structure

```
src/
├── components/     # UI Building Blocks (Buttons, Cards...)
├── contexts/       # React Contexts (Auth)
├── layouts/        # AdminLayout, MainLayout
├── modules/        # Domain-specific logic (CRM, Finance)
├── pages/          # Application Routes (Public & Admin)
├── services/       # Firebase Service Layers (Single Source of Truth)
└── assets/         # Images, Fonts
```

## 📜 Key Scripts

- `npm run dev` : Start dev server (Port 5174, clear cache).
- `npm run build` : Production build.
- `npm run deploy:prod` : Build & Deploy to Firebase Hosting.

## 🔐 Credentials & Security

- **Environment:** Configured in `.env.local`.
- **RBAC:** Firestore Rules (`firestore.rules`) enforce Admin/Public access.
- **CORS:** Managed via `cors.json` for Google Cloud Storage.

## 📝 Admin Features (Private)

- **PIM:** Product Information Management.
- **CRM:** Lead Management (Kanban/List).
- **CPQ:** Quote Builder with PDF generation.
- **Finance:** Invoicing and Revenue Tracking.

---
© 2026 Gad Doors. Internal Use Only.
