import { Link, useLocation } from 'react-router-dom';

export default function AdminNavItem({ to, icon: Icon, label, onClick }) {
  const location = useLocation();
  // Check if current path starts with the link path (for nested routes like products/new)
  // Logic: Active if exact match OR if path starts with 'to' + '/'
  const isActive = location.pathname === to || location.pathname.startsWith(`${to}/`);
  
  return (
    <Link 
      to={to} 
      onClick={onClick}
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
}
