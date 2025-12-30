import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { useTranslation } from 'react-i18next'; // Added
import { useEffect, Suspense, lazy } from 'react'; // Added useEffect
import { Toaster } from 'react-hot-toast';
import ScrollToTop from './components/layout/ScrollToTop';


import MainLayout from './components/layout/MainLayout';
import HomePage from './pages/public/HomePage';
import CatalogPage from './pages/public/CatalogPage';
import ProductDetailPage from './pages/public/ProductDetailPage';
import InstallationsPage from './pages/public/InstallationsPage';
import ContactPage from './pages/public/ContactPage';

// Admin Imports (Lazy Loaded)
import { AuthProvider } from './context/AuthContext';
const LoginPage = lazy(() => import('./pages/admin/LoginPage'));
const AdminLayout = lazy(() => import('./layouts/AdminLayout'));
const AuthGuard = lazy(() => import('./modules/auth/AuthGuard'));
const DashboardPage = lazy(() => import('./pages/admin/DashboardPage'));
const LeadsPage = lazy(() => import('./pages/admin/crm/LeadsPage'));
const CalendarPage = lazy(() => import('./pages/admin/CalendarPage'));
const FinancePage = lazy(() => import('./pages/admin/FinancePage'));

// Product Pages
const ProductListPage = lazy(() => import('./pages/admin/products/ProductListPage'));
const ProductFormPage = lazy(() => import('./pages/admin/products/ProductFormPage'));

// Finance Pages
const QuoteBuilder = lazy(() => import('./pages/admin/finance/QuoteBuilder'));
const OrderListPage = lazy(() => import('./pages/admin/finance/OrderListPage'));
const OrderDetailPage = lazy(() => import('./pages/admin/finance/OrderDetailPage'));
const OrdersPage = lazy(() => import('./pages/admin/OrdersPage')); // Switch to main OrdersPage
const TranslationManagerPage = lazy(() => import('./pages/admin/settings/TranslationManagerPage'));

// Loading Fallback
const AdminLoading = () => (
  <div className="h-screen w-full flex items-center justify-center bg-zinc-950 text-[#d4af37]">
    Chargement de l'Admin...
  </div>
);

function App() {
  const { i18n } = useTranslation();

  useEffect(() => {
    const isRtl = i18n.language === 'he';
    document.dir = isRtl ? 'rtl' : 'ltr';
    document.documentElement.lang = i18n.language;
    
    // Optional: Add a class to body for easier CSS targeting if needed
    if (isRtl) {
      document.body.classList.add('rtl');
    } else {
      document.body.classList.remove('rtl');
    }
  }, [i18n.language]);

  return (
    <BrowserRouter>
      <ScrollToTop />
      <Toaster position="bottom-right" toastOptions={{ duration: 4000, style: { background: '#333', color: '#fff' } }} />
      <AuthProvider>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<MainLayout />}>
            <Route index element={<HomePage />} />
            <Route path="catalogue" element={<CatalogPage />} />
            <Route path="produit/:id" element={<ProductDetailPage />} />
            <Route path="realisations" element={<InstallationsPage />} />
            <Route path="contact" element={<ContactPage />} />
          </Route>

          {/* Admin Routes */}
          <Route path="/admin" element={
            <Suspense fallback={<AdminLoading />}>
              <AuthGuard>
                <AdminLayout />
              </AuthGuard>
            </Suspense>
          }>
             <Route index element={<DashboardPage />} /> 
             <Route path="dashboard" element={<DashboardPage />} />
             <Route path="leads" element={<LeadsPage />} />
             <Route path="calendar" element={<CalendarPage />} />
             
             {/* Product Management Routes */}
             <Route path="products">
                <Route index element={<ProductListPage />} />
                <Route path="new" element={<ProductFormPage />} />
                <Route path="edit/:id" element={<ProductFormPage />} />
             </Route>

             <Route path="finance" element={<FinancePage />} />
             <Route path="quotes/new" element={<QuoteBuilder />} />
             <Route path="orders" element={<OrdersPage />} />
             <Route path="orders/:id" element={<OrderDetailPage />} /> {/* Order Detail Route */}
             
             {/* Settings Routes */}
             <Route path="settings">
                <Route path="translations" element={<TranslationManagerPage />} />
             </Route>
          </Route>

          {/* Login Separation: Needs to be outside the guarded layout but lazy loaded */}
          <Route path="/admin/login" element={
            <Suspense fallback={<AdminLoading />}>
              <LoginPage />
            </Suspense>
          } />
          
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;