import { Outlet, Link, useLocation } from 'react-router-dom';
import { logout } from '../services/authService';
import { ROUTES } from '../config/constants';
import { 
  LayoutDashboard, 
  Package, 
  Users, 
  ShoppingCart, 
  CreditCard, 
  Calendar, 
  LogOut,
  Menu,
  X,
  Shield, 
  Mail 
} from 'lucide-react';
import { useState, useRef, useEffect } from 'react'; 
import { useTranslation } from 'react-i18next';

import { auth } from '../config/firebase';

import AdminNavItem from '../components/layout/AdminNavItem';

export default function AdminLayout() {
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const user = auth.currentUser;
  const location = useLocation();
  const { i18n } = useTranslation();
  const scrollRef = useRef(null); // Ref for the scrollable container

  // Force French & LTR for Admin
  useEffect(() => {
    if (i18n.language !== 'fr') {
      i18n.changeLanguage('fr');
    }
    document.dir = 'ltr'; // Enforce LTR
    document.documentElement.lang = 'fr';
  }, [i18n]);

  // Scroll to top on route change
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = 0;
    }
  }, [location.pathname]);

  const handleLogout = async () => {
    if(window.confirm("Déconnexion ?")) {
      await logout();
    }
  };


  return (
    <div className="min-h-screen w-full bg-zinc-950 text-white flex" dir="ltr">
      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/80 z-40 lg:hidden backdrop-blur-sm"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed lg:static inset-y-0 left-0 z-50 w-64 bg-black border-r border-zinc-800 
        transform transition-transform duration-200 ease-in-out flex flex-col
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        <div className="p-6 border-b border-zinc-800 flex justify-between items-center">
          <h1 className="text-2xl font-bold font-heading text-white">
            GAD<span className="text-[#d4af37]">ADMIN</span>
          </h1>
          <button onClick={() => setSidebarOpen(false)} className="lg:hidden text-gray-400">
            <X size={24} />
          </button>
        </div>
        
        {/* User Info Debug */}
        <div className="px-6 py-2 text-xs text-gray-500 border-b border-zinc-800 break-all">
            {user?.email || "Non connecté"}
        </div>

        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          <AdminNavItem to={ROUTES.ADMIN.DASHBOARD} icon={LayoutDashboard} label="Tableau de Bord" onClick={() => setSidebarOpen(false)} />
          <AdminNavItem to={ROUTES.ADMIN.PRODUCTS} icon={Package} label="Produits (PIM)" onClick={() => setSidebarOpen(false)} />
          <AdminNavItem to={ROUTES.ADMIN.LEADS} icon={Users} label="Prospects (CRM)" onClick={() => setSidebarOpen(false)} />
          <AdminNavItem to={ROUTES.ADMIN.ORDERS} icon={ShoppingCart} label="Commandes (CPQ)" onClick={() => setSidebarOpen(false)} />
          {/* <AdminNavItem to={ROUTES.ADMIN.CALENDAR} icon={Calendar} label="Planning (OPS)" onClick={() => setSidebarOpen(false)} />  -- REMOVED as merged into CRM */}
          <AdminNavItem to={ROUTES.ADMIN.FINANCE} icon={CreditCard} label="Finance" onClick={() => setSidebarOpen(false)} />
          <AdminNavItem to={ROUTES.ADMIN.MESSAGES} icon={Mail} label="Messages" onClick={() => setSidebarOpen(false)} />
          <AdminNavItem to={ROUTES.ADMIN.TEAM} icon={Shield} label="Équipe" onClick={() => setSidebarOpen(false)} />
        </nav>

        <div className="p-4 border-t border-zinc-800">
          <button 
            onClick={handleLogout}
            className="flex items-center gap-3 px-4 py-3 w-full text-red-500 hover:bg-red-900/10 rounded-lg transition-colors"
          >
            <LogOut size={20} />
            <span>Déconnexion</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        {/* Topbar (Mobile Only) */}
        <header className="lg:hidden h-16 border-b border-zinc-800 flex items-center px-4 bg-black">
          <button onClick={() => setSidebarOpen(true)} className="text-gray-400">
            <Menu size={24} />
          </button>
          <span className="ml-4 font-bold text-[#d4af37]">GAD DOORS</span>
        </header>

        {/* Page Content */}
        <div ref={scrollRef} className="flex-1 overflow-auto p-4 lg:p-8">
           <Outlet />
        </div>
      </main>
    </div>
  );
}
