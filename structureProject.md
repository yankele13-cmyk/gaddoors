
# 📘 GAD DOORS V3 - TECHNICAL BLUEPRINT

Ce document sert de plan technique détaillé pour le développement de la version 3 de l'application Gad Doors.

---

## 1. Identité du Projet

- **Nom :** Gad Doors
- **Secteur :** E-commerce / Artisanat (Vente et Installation de portes d'intérieur & Mamad).
- **Type d'Application :** Single Page Application (SPA).
- **Objectif :** Site vitrine haute performance avec catalogue interactif, visualisateur AR, et back-office de gestion complet.

---

## 2. Stack Technique (Le Moteur)

- **Build Tool :** Vite (v6+) - Pour un développement instantané et un build optimisé.
- **Framework Frontend :** React (v19) - Architecture basée sur les Hooks et Composants fonctionnels.
- **Langage :** JavaScript (ESModules).
- **Routing :** `react-router-dom` (v7) - Navigation client-side fluide (sans rechargement de page).
- **Styling :** Tailwind CSS (v4) - Approche "Utility-First" avec configuration Design System "Luxe" (Noir/Or/Crème).
- **Animations :** Framer Motion - Micro-interactions, transitions de pages et effets "Smooth".
- **SEO :** `react-helmet-async` - Gestion dynamique des balises `<head>` (Titre, Description) pour Google.

---

## 3. Infrastructure Backend (Firebase)

L'application est **"Serverless"**, reposant entièrement sur l'écosystème Google Firebase (Client SDK).

- **Authentification :** Firebase Auth (Email/Password) pour sécuriser l'accès Admin.
- **Base de Données :** Cloud Firestore (NoSQL). Données en temps réel.
- **Stockage Média :** Firebase Storage (Buckets) pour les images des portes (formats WebP/AVIF optimisés).
- **Hosting :** Firebase Hosting (ou Vercel) servant les fichiers statiques générés par Vite.

---

## 4. Architecture Dossier (`src/`)

Structure atomique et modulaire :

```plaintext
src/
├── assets/          # Images statiques, icônes SVG, fonts locales
├── components/      # Briques UI réutilisables
│   ├── ui/          # Atomes (Button, Card, Input, Loader)
│   ├── layout/      # Header, Footer, SidebarAdmin
│   ├── features/    # Composants métier (DoorVisualizer, ProductGrid)
│   └── auth/        # ProtectedRoute.jsx (Guard de sécurité)
├── context/         # États globaux (AuthContext, CartContext, UIContext)
├── hooks/           # Custom Hooks (useFirestore, useStorage, useDebounce)
├── pages/           # Vues principales (liées aux routes)
│   ├── public/      # Home, Catalog, ProductDetail, Visualizer, Contact
│   └── admin/       # Login, Dashboard, ProductManager, Leads
├── services/        # Logique métier pure & API Firebase
│   ├── firebase.js  # Init SDK
│   └── db.js        # Fonctions CRUD (addProduct, getProducts...)
├── styles/          # globals.css (Tailwind directives)
├── App.jsx          # Configuration des Routes & Providers
└── main.jsx         # Point d'entrée (Mount React)
```

---

## 5. Fonctionnalités Détaillées

### A. Partie Publique (Front-Office)

- **Home Page ("L'Expérience") :**
  - Hero Section avec Vidéo/Image immersive.
  - Mise en avant "Expertise Mamad".
  - Galerie "Avant/Après" (Installations).
- **Catalogue Intelligent :**
  - Filtres dynamiques : Catégorie (Intérieur/Mamad), Prix, Finition.
  - Chargement progressif (Lazy Loading) des cartes produits.
- **Fiche Produit :**
  - Galerie d'images avec zoom.
  - Spécifications techniques (Matériaux, Isolation phonique).
  - CTA (Call to Action) : "Visualiser chez moi" ou "Demander un devis".
- **Le Visualisateur (Feature Star) :**
  - Mode : Superposition (Overlay) sur photo utilisateur ou Caméra.
  - Tech : Manipulation Canvas HTML5 ou CSS Transform.
  - Action : L'utilisateur upload sa photo -> Choisit une porte -> Ajuste la taille/perspective -> Télécharge le résultat.
- **Prise de Contact :**
  - Formulaire relié à Firestore (Collection `leads`).
  - Bouton WhatsApp flottant.

### B. Partie Privée (Back-Office Admin)

- **Accessibilité** via `/admin` - Protégée par `AuthContext`.
- **Dashboard :** Vue d'ensemble (Nombre de vues, Nouveaux leads).
- **Product Manager (CRUD) :**
  - Ajouter/Modifier une porte.
  - Upload d'image avec redimensionnement automatique (si possible) avant envoi Storage.
  - Gestion des stocks/visibilité (Afficher/Masquer).
- **Lead Manager :**
  - Liste des messages reçus via le formulaire de contact.
  - Statut du lead (Nouveau, Contacté, Clos).

---

## 6. Modèle de Données (Firestore Schema)

- **Collection : `products`**

  ```json
  {
    "id": "string (auto-generated)",
    "name": "string",
    "category": "interior | mamad",
    "price": "number",
    "description": "string",
    "imageUrl": "string (URL Firebase Storage)",
    "specifications": {
      "material": "WPC",
      "acoustic": "25db"
    },
    "isVisible": "boolean",
    "createdAt": "timestamp"
  }
  ```

- **Collection : `leads` (Messages)**

  ```json
  {
    "id": "string",
    "clientName": "string",
    "phone": "string",
    "message": "string",
    "status": "new | processed",
    "date": "timestamp"
  }
  ```

---

## 7. Performance & Sécurité

- **Performance :** Code Splitting via `React.lazy()` pour ne charger le code de l'Admin et du Visualisateur que si nécessaire.
- **Sécurité :** Règles Firestore (Security Rules) interdisant l'écriture publique (`allow write: if request.auth != null;`). Validation des formulaires avec Zod.
 **Design :** Mobile-First absolu. Pas de débordement horizontal, boutons tactiles > 44px