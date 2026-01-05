
import { useState, useEffect } from 'react';
import { MessagesService } from '../../../services/messages.service'; // Adjust path if needed
import { Mail, Search, CheckCircle, Trash2, Reply, Clock, Send, X, UserPlus } from 'lucide-react';
import { format } from 'date-fns';
import toast from 'react-hot-toast';
import LeadModal from './components/LeadModal'; // Import LeadModal

export default function MessagesPage() {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // all, unread
  const [search, setSearch] = useState('');
  
  /* Inline Reply State: mapped by message ID */
  const [expandedReplyId, setExpandedReplyId] = useState(null);
  const [replyText, setReplyText] = useState('');
  const [sending, setSending] = useState(false);

  // Conversion State
  const [isLeadModalOpen, setIsLeadModalOpen] = useState(false);
  const [leadToConvert, setLeadToConvert] = useState(null);

  useEffect(() => {
    loadMessages();
  }, []);

  const loadMessages = async () => {
    setLoading(true);
    const res = await MessagesService.getAllMessages();
    if (res.success) {
        setMessages(res.data);
    }
    setLoading(false);
  };

  const handleDelete = async (id) => {
      if(!window.confirm("Supprimer ce message ?")) return;
      await MessagesService.deleteMessage(id);
      setMessages(prev => prev.filter(m => m.id !== id));
      toast.success("Message supprimé");
  };

  const toggleReply = (msg) => {
      if (expandedReplyId === msg.id) {
          setExpandedReplyId(null);
          setReplyText('');
      } else {
          setExpandedReplyId(msg.id);
          // Pre-fill greeting
          setReplyText(`Bonjour ${msg.name},\n\nMerci de votre message.\n\nCordialement,\nL'équipe Gad Doors`);
          if (!msg.read) handleMarkRead(msg.id);
      }
  };

  const handleMarkRead = async (id) => {
      await MessagesService.markAsRead(id);
      setMessages(prev => prev.map(m => m.id === id ? { ...m, read: true } : m));
  };

  const sendReply = async (msg) => {
      if (!replyText.trim()) return;
      setSending(true);
      
      const res = await MessagesService.replyToMessage(msg.id, replyText, msg.email);
      setSending(false);
      
      if (res.success) {
          toast.success("Réponse envoyée avec succès !");
          setMessages(prev => prev.map(m => m.id === msg.id ? { ...m, status: 'replied', lastReply: replyText } : m));
          setExpandedReplyId(null);
          setReplyText('');
      } else {
          toast.error("Erreur d'envoi: " + (res.error || "Inconnue"));
      }
  };

  const handleConvertToLead = (msg) => {
    setLeadToConvert({
      name: msg.name || '',
      email: msg.email || '',
      phone: msg.phone || '',
      source: 'web', // Default source from web message
      notes: `Message du ${new Date(msg.createdAt).toLocaleDateString()}:\n${msg.message}`
    });
    setIsLeadModalOpen(true);
  };

  const filteredMessages = messages.filter(m => {
      const matchesSearch = (m.name?.toLowerCase() || '').includes(search.toLowerCase()) || 
                            (m.email?.toLowerCase() || '').includes(search.toLowerCase()) ||
                            (m.message?.toLowerCase() || '').includes(search.toLowerCase());
      const matchesFilter = filter === 'all' ? true : !m.read;
      return matchesSearch && matchesFilter;
  });

  return (
    <div className="h-full flex flex-col bg-zinc-950 text-white">
      {/* Header */}
      <div className="p-6 border-b border-zinc-800 flex justify-between items-center bg-black">
        <div>
           <h1 className="text-2xl font-bold font-heading text-[#d4af37] flex items-center gap-2">
               <Mail /> Messages
           </h1>
           <p className="text-gray-400 text-sm">Gestion des demandes de contact</p>
        </div>
        <div className="flex gap-4">
             <div className="relative">
                <Search className="absolute left-3 top-2.5 text-gray-500" size={18} />
                <input 
                    type="text" 
                    placeholder="Rechercher..." 
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    className="pl-10 pr-4 py-2 bg-zinc-900 border border-zinc-700 rounded-lg text-sm focus:border-gold outline-none w-64"
                />
             </div>
             <select 
                value={filter} 
                onChange={e => setFilter(e.target.value)}
                className="bg-zinc-900 border border-zinc-700 rounded-lg px-3 text-sm focus:border-gold outline-none"
             >
                 <option value="all">Tous les messages</option>
                 <option value="unread">Non lus uniquement</option>
             </select>
        </div>
      </div>

      {/* List */}
      <div className="flex-1 overflow-auto p-6">
          {loading ? (
              <div className="text-center text-gray-500 mt-10">Chargement...</div>
          ) : filteredMessages.length === 0 ? (
              <div className="text-center text-gray-500 mt-10">Aucun message trouvé.</div>
          ) : (
             <div className="grid gap-4">
                 {filteredMessages.map(msg => (
                     <div key={msg.id} className={`bg-zinc-900 border ${msg.read ? 'border-zinc-800' : 'border-l-4 border-l-[#d4af37] border-zinc-700'} rounded-lg p-4 transition hover:bg-zinc-800/50`}>
                         <div className="flex justify-between items-start mb-2">
                             <div className="flex items-center gap-3">
                                <span className={`w-2 h-2 rounded-full ${msg.read ? 'bg-transparent' : 'bg-[#d4af37]'}`}></span>
                                <h3 className="font-bold text-lg">{msg.name}</h3>
                                <span className="text-xs text-gray-500 flex items-center gap-1 bg-zinc-800 px-2 py-1 rounded">
                                    <Clock size={12} /> {format(new Date(msg.createdAt), 'dd/MM/yyyy HH:mm')}
                                </span>
                                {msg.status === 'replied' && (
                                     <span className="text-xs text-green-400 border border-green-900 bg-green-900/20 px-2 py-1 rounded flex items-center gap-1">
                                         <Reply size={12} /> Répondu
                                     </span>
                                )}
                             </div>
                             <div className="flex gap-2">
                                 <button 
                                    onClick={() => toggleReply(msg)} 
                                    className={`p-2 rounded transition flex items-center gap-2 ${expandedReplyId === msg.id ? 'bg-[#d4af37] text-black font-bold' : 'text-[#d4af37] hover:bg-[#d4af37]/10'}`}
                                    title="Répondre"
                                 >
                                     <Reply size={18} /> {expandedReplyId !== msg.id && "Répondre"}
                                 </button>
                                 <button onClick={() => handleDelete(msg.id)} className="text-gray-500 hover:text-red-500 hover:bg-red-500/10 p-2 rounded transition" title="Supprimer">
                                     <Trash2 size={18} />
                                 </button>
                             </div>
                         </div>
                         
                         {/* Action Bar */}
                         <div className="flex gap-2 mb-3">
                             <button 
                                onClick={() => handleConvertToLead(msg)}
                                className="text-xs bg-zinc-800 hover:bg-[#d4af37] hover:text-black text-gray-300 px-3 py-1.5 rounded flex items-center gap-2 transition border border-zinc-700"
                             >
                                <UserPlus size={14} /> Créer Prospect
                             </button>
                         </div>
                         
                         <div className="grid md:grid-cols-2 gap-4 mb-3 text-sm text-gray-400">
                             <div>Email: <span className="text-white">{msg.email}</span></div>
                             <div>Tél: <span className="text-white">{msg.phone}</span></div>
                         </div>

                         <div className="bg-zinc-950 p-3 rounded border border-zinc-800 text-gray-300 text-sm whitespace-pre-wrap">
                             {msg.message}
                         </div>

                         {/* Inline Reply Area */}
                         {expandedReplyId === msg.id && (
                             <div className="mt-4 pt-4 border-t border-zinc-800 animate-in fade-in slide-in-from-top-2 duration-200">
                                 <div className="bg-zinc-950 border border-zinc-700 rounded-lg p-1">
                                    <div className="px-3 py-2 border-b border-zinc-800 text-xs text-gray-500 flex justify-between">
                                        <span>Réponse à : <span className="text-gray-300">{msg.email}</span></span>
                                        <span>De : <span className="text-gray-300">contact@gaddoors.com</span></span>
                                    </div>
                                    <textarea 
                                        value={replyText}
                                        onChange={(e) => setReplyText(e.target.value)}
                                        className="w-full bg-transparent p-3 text-white outline-none min-h-[150px] resize-y"
                                        placeholder="Écrivez votre réponse ici..."
                                    />
                                    <div className="px-3 py-2 border-t border-zinc-800 flex justify-between items-center bg-zinc-900/50 rounded-b-lg">
                                        <button onClick={() => setExpandedReplyId(null)} className="text-xs text-gray-500 hover:text-white px-2">Annuler</button>
                                        <button 
                                            onClick={() => sendReply(msg)}
                                            disabled={sending}
                                            className="bg-[#d4af37] text-black font-bold px-4 py-1.5 rounded text-sm hover:bg-yellow-500 disabled:opacity-50 flex items-center gap-2"
                                        >
                                            {sending ? 'Envoi...' : <><Send size={14} /> Envoyer la réponse</>}
                                        </button>
                                    </div>
                                 </div>
                             </div>
                         )}
                         
                         {/* Last Reply Preview */}
                         {msg.lastReply && expandedReplyId !== msg.id && (
                             <div className="mt-3 text-xs text-gray-500 border-l-2 border-gray-700 pl-3">
                                 <div className="uppercase mb-1">Dernière réponse :</div>
                                 <div className="line-clamp-2 italic">{msg.lastReply}</div>
                             </div>
                         )}
                     </div>
                 ))}
             </div>
          )}
      </div>

      <LeadModal
        isOpen={isLeadModalOpen}
        onClose={() => setIsLeadModalOpen(false)}
        initialData={leadToConvert}
        onSuccess={() => toast.success("Prospect converti avec succès !")}
      />
    </div>
  );
}
