import { useState, useEffect } from 'react';
import { leadsService } from '../../services/leads.service';
import { LEAD_STATUS } from '../../config/constants';
import { Phone, Mail, Clock, MessageSquare, ArrowRight, CheckCircle } from 'lucide-react';
import toast from 'react-hot-toast';

const STATUS_COLUMNS = [
  { id: LEAD_STATUS.NEW, label: 'Nouveau', color: 'border-blue-500' },
  { id: LEAD_STATUS.CONTACTED, label: 'Contacté', color: 'border-yellow-500' },
  { id: LEAD_STATUS.MEETING_SCHEDULED, label: 'RDV Fixé', color: 'border-purple-500' },
  { id: LEAD_STATUS.WON, label: 'Gagné', color: 'border-green-500' },
  { id: LEAD_STATUS.LOST, label: 'Perdu', color: 'border-red-500' }
];

export default function LeadKanban({ onSelectLead }) {
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadLeads();
  }, []);

  const loadLeads = async () => {
    try {
      const data = await leadsService.getAll();
      setLeads(data);
    } catch (error) {
      console.error(error);
      toast.error("Erreur chargement leads");
    } finally {
      setLoading(false);
    }
  };

  const moveToStatus = async (lead, newStatus, e) => {
    e.stopPropagation(); // Prevent opening detail
    try {
        // Optimistic Update
        const updatedLeads = leads.map(l => l.id === lead.id ? { ...l, status: newStatus } : l);
        setLeads(updatedLeads);
        
        await leadsService.updateStatus(lead.id, newStatus);
        toast.success(`Statut mis à jour: ${newStatus}`);
    } catch (error) {
        toast.error("Erreur mise à jour");
        loadLeads(); // Revert
    }
  };

  if (loading) return <div>Chargement du pipeline...</div>;

  return (
    <div className="flex gap-4 overflow-x-auto pb-4 h-[calc(100vh-200px)]">
      {STATUS_COLUMNS.map(col => {
        const colLeads = leads.filter(l => (l.status || 'new') === col.id);
        
        return (
            <div key={col.id} className="min-w-[300px] bg-zinc-900/50 rounded-xl border border-zinc-800 flex flex-col">
                {/* Header */}
                <div className={`p-4 border-b-2 ${col.color} bg-zinc-900 rounded-t-xl sticky top-0 z-10`}>
                    <div className="flex justify-between items-center">
                        <h3 className="font-bold text-white uppercase text-sm tracking-wider">{col.label}</h3>
                        <span className="bg-zinc-800 px-2 py-1 rounded-full text-xs font-mono text-gray-400">
                            {colLeads.length}
                        </span>
                    </div>
                </div>

                {/* Cards */}
                <div className="flex-1 p-3 overflow-y-auto space-y-3">
                    {colLeads.map(lead => (
                        <div 
                            key={lead.id}
                            onClick={() => onSelectLead(lead)}
                            className="bg-zinc-800 p-4 rounded-lg border border-zinc-700 hover:border-[#d4af37] cursor-pointer group transition shadow-sm hover:shadow-md"
                        >
                            <div className="font-bold text-white mb-1 truncate">{lead.name || 'Sans nom'}</div>
                            <div className="text-xs text-gray-400 mb-3 ml-0.5">
                                {lead.createdAt?.seconds ? new Date(lead.createdAt.seconds * 1000).toLocaleDateString() : 'Date inconnue'}
                            </div>

                            <div className="flex items-center gap-2 text-xs text-gray-300 mb-1">
                                <Phone size={12} className="text-zinc-500" /> {lead.phone}
                            </div>
                            <div className="flex items-center gap-2 text-xs text-gray-300 mb-3">
                                <MessageSquare size={12} className="text-zinc-500" /> 
                                <span className="truncate max-w-[200px]">{lead.message}</span>
                            </div>

                            {/* Actions Footer */}
                            <div className="pt-3 border-t border-zinc-700/50 flex justify-end">
                                {col.id === 'new' && (
                                    <button 
                                        onClick={(e) => moveToStatus(lead, 'contacted', e)}
                                        className="text-xs bg-blue-900/30 text-blue-400 px-2 py-1 rounded hover:bg-blue-900/50 flex items-center gap-1"
                                    >
                                        Contacté <ArrowRight size={12} />
                                    </button>
                                )}
                                {col.id === 'contacted' && (
                                    <button 
                                        onClick={(e) => moveToStatus(lead, 'meeting_scheduled', e)}
                                        className="text-xs bg-purple-900/30 text-purple-400 px-2 py-1 rounded hover:bg-purple-900/50 flex items-center gap-1"
                                    >
                                        Fixer RDV <ArrowRight size={12} />
                                    </button>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        );
      })}
    </div>
  );
}
