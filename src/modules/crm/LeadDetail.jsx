import { useState, useEffect } from 'react';
import { leadsService } from '../../services/leads.service';
import { X, Phone, Mail, Calendar, MessageSquare, Send } from 'lucide-react';
import { LEAD_STATUS } from '../../config/constants';
import toast from 'react-hot-toast';

export default function LeadDetail({ lead, onClose, onUpdate }) {
  const [notes, setNotes] = useState([]);
  const [newNote, setNewNote] = useState('');
  const [loadingNotes, setLoadingNotes] = useState(false);

  useEffect(() => {
    if (lead) {
      loadNotes();
    }
  }, [lead]);

  const loadNotes = async () => {
    setLoadingNotes(true);
    try {
      const data = await leadsService.getNotes(lead.id);
      setNotes(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingNotes(false);
    }
  };

  const handleAddNote = async (e) => {
    e.preventDefault();
    if (!newNote.trim()) return;

    try {
      await leadsService.addNote(lead.id, newNote);
      setNewNote('');
      loadNotes(); // Refresh
      toast.success("Note ajoutée");
    } catch (e) {
      toast.error("Erreur ajout note");
    }
  };

  const handleChangeStatus = async (e) => {
    const newStatus = e.target.value;
    try {
        await leadsService.updateStatus(lead.id, newStatus);
        onUpdate(); // Trigger parent refresh
        toast.success("Statut mis à jour");
    } catch (e) {
        toast.error("Erreur maj statut");
    }
  };

  if (!lead) return null;

  return (
    <div className="fixed inset-0 bg-black/80 flex justify-end z-50 backdrop-blur-sm">
      <div className="w-full max-w-lg bg-zinc-900 h-full border-l border-zinc-800 shadow-2xl flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-zinc-800 bg-zinc-950 flex justify-between items-start">
             <div>
                <h2 className="text-xl font-bold font-heading text-white mb-1">{lead.name}</h2>
                <div className="flex items-center gap-2">
                    <span className="text-gray-400 text-xs">Statut actuel:</span>
                    <select 
                        value={lead.status || LEAD_STATUS.NEW}
                        onChange={handleChangeStatus}
                        className="bg-zinc-800 text-white text-xs border border-zinc-700 rounded p-1 outline-none focus:border-[#d4af37]"
                    >
                        <option value={LEAD_STATUS.NEW}>Nouveau</option>
                        <option value={LEAD_STATUS.CONTACTED}>Contacté</option>
                        <option value={LEAD_STATUS.MEETING_SCHEDULED}>RDV Fixé</option>
                        <option value={LEAD_STATUS.QUOTED}>Devisé</option>
                        <option value={LEAD_STATUS.WON}>Gagné</option>
                        <option value={LEAD_STATUS.LOST}>Perdu</option>
                    </select>
                </div>
             </div>
             <button onClick={onClose} className="text-gray-400 hover:text-white p-2 bg-zinc-800 rounded-full"><X size={20} /></button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-8">
            {/* Contact Info */}
            <div className="space-y-4">
                <div className="flex items-center gap-3 text-gray-300">
                    <div className="p-2 bg-zinc-800 rounded text-[#d4af37]"><Phone size={18} /></div>
                    <div className="flex flex-col">
                        <span className="text-xs text-gray-500">Téléphone</span>
                        <a href={`tel:${lead.phone}`} className="hover:text-white hover:underline">{lead.phone}</a>
                    </div>
                </div>
                <div className="flex items-center gap-3 text-gray-300">
                    <div className="p-2 bg-zinc-800 rounded text-[#d4af37]"><Mail size={18} /></div>
                    <div className="flex flex-col">
                        <span className="text-xs text-gray-500">Email</span>
                        <a href={`mailto:${lead.email}`} className="hover:text-white hover:underline">{lead.email}</a>
                    </div>
                </div>
            </div>

            {/* Original Message */}
            <div className="bg-zinc-800/50 p-4 rounded-lg border border-zinc-700">
                <h3 className="text-sm font-bold text-gray-400 mb-2 flex items-center gap-2">
                    <MessageSquare size={14} /> Message Initial
                </h3>
                <p className="text-gray-300 text-sm whitespace-pre-wrap leading-relaxed">
                    {lead.message || "Aucun message."}
                </p>
            </div>

            {/* Timeline / Notes */}
            <div>
                <h3 className="text-sm font-bold text-[#d4af37] mb-4 uppercase tracking-wider border-b border-zinc-800 pb-2">Activité & Notes</h3>
                
                {/* Add Note Input */}
                <form onSubmit={handleAddNote} className="mb-6">
                    <div className="relative">
                        <textarea 
                            value={newNote}
                            onChange={(e) => setNewNote(e.target.value)}
                            placeholder="Ajouter une note interne..."
                            className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-3 pr-12 text-sm text-white focus:border-[#d4af37] outline-none resize-none"
                            rows={3}
                        />
                        <button 
                            type="submit"
                            disabled={!newNote.trim()}
                            className="absolute bottom-3 right-3 p-2 bg-[#d4af37] text-black rounded-full hover:bg-yellow-500 disabled:opacity-50 disabled:bg-zinc-700"
                        >
                            <Send size={16} />
                        </button>
                    </div>
                </form>

                <div className="space-y-4">
                    {loadingNotes ? <div className="text-center text-xs text-gray-500">Chargement notes...</div> : (
                        notes.length === 0 ? <div className="text-center text-xs text-gray-600 italic">Aucune note pour le moment.</div> :
                        notes.map(note => (
                            <div key={note.id} className="flex gap-3">
                                <div className="flex-col items-center hidden sm:flex">
                                    <div className="w-2 h-2 rounded-full bg-zinc-700 mt-2"></div>
                                    <div className="w-px h-full bg-zinc-800 my-1"></div>
                                </div>
                                <div className="bg-zinc-900 border border-zinc-800 p-3 rounded-lg flex-1">
                                    <div className="flex justify-between items-start mb-1">
                                        <span className="font-bold text-xs text-gray-300">{note.author}</span>
                                        <span className="text-[10px] text-gray-600">
                                            {note.createdAt?.seconds ? new Date(note.createdAt.seconds * 1000).toLocaleString() : ''}
                                        </span>
                                    </div>
                                    <p className="text-sm text-gray-400">{note.text}</p>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
      </div>
    </div>
  );
}
