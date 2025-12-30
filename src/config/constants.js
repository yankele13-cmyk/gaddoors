export const APP_CONFIG = {
  COMPANY_NAME: "Gad Doors",
  CURRENCY: "ILS",
  LOCALE: "fr-FR", // Admin UI language
  VAT_RATE: 0.17, // 17%
  LOGISTICS: {
    BASE_PRICE: 250,
    FLOOR_SURCHARGE: 50
  }
};

export const ROUTES = {
  PUBLIC: {
    HOME: "/",
  },
  ADMIN: {
    DASHBOARD: "/admin/dashboard",
    LOGIN: "/admin/login",
    PRODUCTS: "/admin/products",
    LEADS: "/admin/leads",
    ORDERS: "/admin/orders",
    FINANCE: "/admin/finance",
    CALENDAR: "/admin/calendar",
  },
};

export const ORDER_STATUS = {
  DRAFT: "draft",
  VALIDATED: "validated",
  PRODUCTION: "production",
  INSTALLATION_SCHEDULED: "installation_scheduled",
  COMPLETED: "completed",
  CANCELLED: "cancelled",
};

export const LEAD_STATUS = {
  NEW: "new",
  CONTACTED: "contacted",
  MEETING_SCHEDULED: "meeting_scheduled",
  QUOTED: "quoted",
  WON: "won",
  LOST: "lost",
};

// DEPRECATED: Only used for migration in userService.js. 
// New access control is handled via Firestore 'users' collection.
export const ALLOWED_ADMINS = [
  'yankele13@gmail.com',
  'gad@gaddoors.co.il'
];
