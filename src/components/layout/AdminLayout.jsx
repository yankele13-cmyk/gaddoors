import { useState } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { LayoutDashboard, Users, Calendar, Package, FileText, LogOut, Menu, X } from 'lucide-react';

export default function AdminLayout() {
  const { logout, currentUser } = useAuth();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navigation = [
    { icon: LayoutDashboard, label: 'Tableau de bord', path: '/admin/dashboard' },
    { icon: Users, label: 'Leads & Clients', path: '/admin/leads' },
    { icon: Calendar, label: 'Calendrier', path: '/admin/calendar' },
    { icon: Package, label: 'Produits', path: '/admin/products' },
    { icon: FileText, label: 'Finance', path: '/admin/finance' },
  ];

  return (
    <div className="flex h-screen bg-black text-white overflow-hidden">
      {/* Mobile Toggle */}
      <button 
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        className="lg:hidden absolute top-4 right-4 z-50 p-2 text-white bg-zinc-800 rounded"
      >
        {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Sidebar */}
      <aside className={`
        fixed inset-y-0 left-0 z-40 w-64 bg-zinc-900 border-r border-zinc-800 flex flex-col transition-transform duration-300 transform 
        lg:translate-x-0 lg:static lg:h-screen
        ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="p-6 border-b border-zinc-800">
          <h1 className="text-2xl font-bold text-[#d4af37] font-heading">GAD COMMAND</h1>
          <p className="text-xs text-zinc-500 mt-1 uppercase tracking-wider">v1.0.0 Stable</p>
        </div>

        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          {navigation.map((item) => {
            const isActive = location.pathname.startsWith(item.path);
            const Icon = item.icon;
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setIsMobileMenuOpen(false)}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors duration-200 ${
                  isActive 
                    ? 'bg-[#d4af37]/20 text-[#d4af37] border border-[#d4af37]/50' 
                    : 'text-zinc-400 hover:bg-zinc-800 hover:text-white'
                }`}
              >
                <Icon size={20} />
                <span className="font-medium">{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-zinc-800">
          <div className="flex items-center gap-3 mb-4 px-2">
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#d4af37] to-yellow-200 flex items-center justify-center text-black font-bold text-xs">
              {currentUser?.email?.substring(0, 2).toUpperCase()}
            </div>
            <div className="overflow-hidden">
              <p className="text-sm font-medium text-white truncate">{currentUser?.displayName || 'Admin'}</p>
              <p className="text-xs text-zinc-500 truncate">{currentUser?.email}</p>
            </div>
          </div>
          <button
            onClick={() => logout()}
            className="w-full flex items-center justify-center gap-2 bg-red-900/30 text-red-200 py-2 rounded border border-red-900/50 hover:bg-red-900/50 transition"
          >
            <LogOut size={16} />
            Déconnexion
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto bg-black p-8">
        <div className="max-w-7xl mx-auto">
           <Outlet />
        </div>
      </main>
    </div>
  );
}
