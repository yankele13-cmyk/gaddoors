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
  X 
} from 'lucide-react';
import { useState } from 'react';

import { auth } from '../config/firebase';

export default function AdminLayout() {
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const user = auth.currentUser;
  const location = useLocation();

  const handleLogout = async () => {
    if(window.confirm("Déconnexion ?")) {
      await logout();
    }
  };

  const NavItem = ({ to, icon: Icon, label }) => {
    const isActive = location.pathname.startsWith(to);
    return (
      <Link 
        to={to} 
        onClick={() => setSidebarOpen(false)}
        className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
          isActive 
            ? 'bg-[#d4af37]/10 text-[#d4af37] font-bold border border-[#d4af37]/20' 
            : 'text-gray-400 hover:bg-zinc-800 hover:text-white'
        }`}
      >
        <Icon size={20} />
        <span>{label}</span>
      </Link>
    );
  };

  return (
    <div className="min-h-screen w-full bg-zinc-950 text-white flex">
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
          <NavItem to={ROUTES.ADMIN.DASHBOARD} icon={LayoutDashboard} label="Tableau de Bord" />
          <NavItem to={ROUTES.ADMIN.PRODUCTS} icon={Package} label="Produits (PIM)" />
          <NavItem to={ROUTES.ADMIN.LEADS} icon={Users} label="Prospects (CRM)" />
          <NavItem to={ROUTES.ADMIN.ORDERS} icon={ShoppingCart} label="Commandes (CPQ)" />
          <NavItem to={ROUTES.ADMIN.CALENDAR} icon={Calendar} label="Planning (OPS)" />
          <NavItem to={ROUTES.ADMIN.FINANCE} icon={CreditCard} label="Finance" />
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
        <div className="flex-1 overflow-auto p-4 lg:p-8">
           <Outlet />
        </div>
      </main>
    </div>
  );
}
