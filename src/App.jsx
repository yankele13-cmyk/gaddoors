import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import ScrollToTop from './components/layout/ScrollToTop';

import MainLayout from './components/layout/MainLayout';
import HomePage from './pages/public/HomePage';
import CatalogPage from './pages/public/CatalogPage';
import ProductDetailPage from './pages/public/ProductDetailPage';
import InstallationsPage from './pages/public/InstallationsPage';
import ContactPage from './pages/public/ContactPage';
// Admin Imports
import { AuthProvider } from './context/AuthContext';
import LoginPage from './pages/admin/LoginPage';
import AdminLayout from './components/layout/AdminLayout';
import AuthGuard from './components/auth/AuthGuard';
import DashboardPage from './pages/admin/DashboardPage';
import LeadsPage from './pages/admin/LeadsPage';
import CalendarPage from './pages/admin/CalendarPage';
import ProductsPage from './pages/admin/ProductsPage';
import FinancePage from './pages/admin/FinancePage';

function App() {
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
          <Route path="/admin/login" element={<LoginPage />} />
          
          <Route path="/admin" element={
            <AuthGuard>
              <AdminLayout />
            </AuthGuard>
          }>
            <Route index element={<DashboardPage />} /> {/* Default to Dashboard */}
            <Route path="dashboard" element={<DashboardPage />} />
            <Route path="leads" element={<LeadsPage />} />
            <Route path="calendar" element={<CalendarPage />} />
            <Route path="products" element={<ProductsPage />} />
            <Route path="finance" element={<FinancePage />} />
          </Route>
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;