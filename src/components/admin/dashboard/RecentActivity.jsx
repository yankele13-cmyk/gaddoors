import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Mail, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function RecentActivity({ messages }) {
  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-white font-heading">
          <span className="text-[#d4af37]">💬</span> Derniers Messages
        </h2>
        <Link to="/admin/leads" className="text-zinc-500 text-sm hover:text-[#d4af37] flex items-center gap-1 transition">
          Voir tout <ArrowRight size={14} />
        </Link>
      </div>

      <div className="space-y-4">
        {messages.length > 0 ? (
          messages.map((msg) => (
            <div key={msg.id} className="group p-4 rounded-lg bg-black/40 border border-zinc-800 hover:border-[#d4af37]/30 transition cursor-pointer">
              <div className="flex justify-between items-start mb-2">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center text-[#d4af37]">
                    <Mail size={14} />
                  </div>
                  <div>
                    <p className="text-white font-medium text-sm group-hover:text-[#d4af37] transition">{msg.name || 'Anonyme'}</p>
                    <p className="text-xs text-zinc-500">{msg.email}</p>
                  </div>
                </div>
                <span className="text-xs text-zinc-600">
                  {msg.createdAt ? formatDistanceToNow(new Date(msg.createdAt), { addSuffix: true, locale: fr }) : 'Récemment'}
                </span>
              </div>
              <p className="text-zinc-400 text-sm line-clamp-2 pl-10 border-l-2 border-zinc-800 group-hover:border-[#d4af37] transition-all">
                {msg.message}
              </p>
            </div>
          ))
        ) : (
          <p className="text-zinc-500 text-center py-4">Aucun nouveau message.</p>
        )}
      </div>
    </div>
  );
}
