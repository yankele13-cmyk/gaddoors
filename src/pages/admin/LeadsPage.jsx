import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getLeads, updateLeadStatus } from '../../services/db';
import { formatDistanceToNow, format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { 
  Search, Filter, Mail, Phone, Calendar, 
  CheckCircle, XCircle, Clock, MessageSquare, 
  MoreVertical, ArrowRight 
} from 'lucide-react';
import toast from 'react-hot-toast';

export default function LeadsPage() {
  const navigate = useNavigate();
  const [leads, setLeads] = useState([]);
  const [selectedLead, setSelectedLead] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('all');

  useEffect(() => {
    fetchLeads();
  }, []);

  async function fetchLeads() {
    try {
      const data = await getLeads();
      setLeads(data);
      if (data.length > 0 && !selectedLead) {
        setSelectedLead(data[0]);
      }
    } catch (error) {
      console.error("Error fetching leads:", error);
    } finally {
      setLoading(false);
    }
  }

  async function handleStatusChange(leadId, newStatus) {
    try {
      await updateLeadStatus(leadId, newStatus);
      // Update local state
      setLeads(prev => prev.map(l => 
        l.id === leadId ? { ...l, status: newStatus, read: true } : l
      ));
      if (selectedLead?.id === leadId) {
        setSelectedLead(prev => ({ ...prev, status: newStatus, read: true }));
      }
      toast.success(`Statut mis à jour : ${newStatus}`);
    } catch (error) {
      console.error("Failed to update status:", error);
      toast.error("Erreur mise à jour statut.");
    }
  }

  const filteredLeads = leads.filter(lead => {
    if (filterStatus === 'all') return true;
    return (lead.status || 'new') === filterStatus;
  });

  const getStatusColor = (status) => {
    switch (status) {
      case 'new': return 'bg-blue-500';
      case 'contacted': return 'bg-yellow-500';
      case 'meeting': return 'bg-green-500';
      case 'won': return 'bg-emerald-600';
      case 'lost': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case 'new': return 'Nouveau';
      case 'contacted': return 'Contacté';
      case 'meeting': return 'RDV Fixé';
      case 'won': return 'Gagné (Installé)';
      case 'lost': return 'Perdu';
      default: return 'Nouveau';
    }
  };

  return (
    <div className="flex flex-col lg:flex-row h-[calc(100vh-64px)] overflow-hidden bg-black text-white">
      {/* Sidebar List */}
      <div className={`w-full lg:w-1/3 border-r border-zinc-800 flex flex-col ${selectedLead ? 'hidden lg:flex' : 'flex'}`}>
        {/* Header / Search */}
        <div className="p-4 border-b border-zinc-800">
          <h1 className="text-xl font-bold mb-4 font-heading">Leads & Demandes</h1>
          <div className="relative">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-500" />
            <input 
              type="text" 
              placeholder="Rechercher un contact..." 
              className="w-full bg-zinc-900 border border-zinc-700 rounded-lg pl-10 pr-4 py-2 text-sm focus:outline-none focus:border-gold"
            />
          </div>
          <div className="flex gap-2 mt-4 overflow-x-auto pb-2 scrollbar-none">
            {['all', 'new', 'contacted', 'meeting'].map((status) => (
              <button
                key={status}
                onClick={() => setFilterStatus(status)}
                className={`px-3 py-1 rounded-full text-xs whitespace-nowrap border ${
                  filterStatus === status 
                    ? 'border-gold text-gold bg-gold/10' 
                    : 'border-zinc-700 text-gray-400 hover:border-gray-500'
                }`}
              >
                {status === 'all' ? 'Tous' : getStatusLabel(status)}
              </button>
            ))}
          </div>
        </div>

        {/* Lead List */}
        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="p-8 text-center text-gray-500">Chargement...</div>
          ) : filteredLeads.map(lead => (
            <div 
              key={lead.id}
              onClick={() => setSelectedLead(lead)}
              className={`p-4 border-b border-zinc-800 cursor-pointer transition-colors hover:bg-zinc-900 ${
                selectedLead?.id === lead.id ? 'bg-zinc-900 border-l-2 border-l-gold' : ''
              }`}
            >
              <div className="flex justify-between items-start mb-1">
                <span className={`font-medium ${!lead.read ? 'text-white' : 'text-gray-400'}`}>
                  {lead.name}
                </span>
                <span className="text-xs text-gray-600">
                  {formatDistanceToNow(lead.createdAt, { addSuffix: true, locale: fr })}
                </span>
              </div>
              <div className="text-sm text-gray-500 truncate mb-2">
                {lead.message}
              </div>
              <div className="flex items-center gap-2">
                <span className={`w-2 h-2 rounded-full ${getStatusColor(lead.status || 'new')}`} />
                <span className="text-xs text-gray-500 capitalize">{getStatusLabel(lead.status || 'new')}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Main Content (Detail) */}
      <div className={`flex-1 bg-zinc-950 flex flex-col ${!selectedLead ? 'hidden lg:flex' : 'flex absolute inset-0 lg:static z-20'}`}>
        {selectedLead ? (
          <>
            {/* Header */}
            <div className="p-6 border-b border-zinc-800 flex flex-col sm:flex-row justify-between items-start gap-4">
               {/* Mobile Back Button */}
               <button onClick={() => setSelectedLead(null)} className="lg:hidden text-gray-400 mb-2">← Retour</button>
               <div className="w-full">
                <h2 className="text-2xl font-bold font-heading mb-1">{selectedLead.name}</h2>
                <div className="flex items-center gap-4 text-gray-400 text-sm">
                  <span className="flex items-center gap-2">
                    <Mail className="w-4 h-4" /> {selectedLead.email}
                  </span>
                  <span className="flex items-center gap-2">
                    <Phone className="w-4 h-4" /> {selectedLead.phone}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-3">
                 <select 
                   value={selectedLead.status || 'new'}
                   onChange={(e) => handleStatusChange(selectedLead.id, e.target.value)}
                   className="bg-zinc-900 border border-zinc-700 text-white text-sm rounded-lg p-2.5 focus:border-gold outline-none"
                 >
                   <option value="new">Nouveau</option>
                   <option value="contacted">Contacté</option>
                   <option value="meeting">RDV Fixé</option>
                   <option value="won">Gagné</option>
                   <option value="lost">Perdu</option>
                 </select>
              </div>
            </div>

            {/* Body */}
            <div className="flex-1 p-8 overflow-y-auto">
              <div className="bg-zinc-900/50 rounded-xl p-6 border border-zinc-800">
                <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                  <MessageSquare className="w-5 h-5 text-gold" />
                  Message
                </h3>
                <p className="text-gray-300 whitespace-pre-wrap leading-relaxed">
                  {selectedLead.message}
                </p>
                <div className="mt-6 pt-6 border-t border-zinc-800 text-sm text-gray-500 flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  Reçu le {format(selectedLead.createdAt, "d MMMM yyyy à HH:mm", { locale: fr })}
                </div>
              </div>

              {/* Quick Actions */}
              <div className="mt-8 grid grid-cols-2 gap-4">
                <button 
                  onClick={() => handleStatusChange(selectedLead.id, 'contacted')}
                  className="flex items-center justify-center gap-3 p-4 bg-zinc-900 border border-zinc-700 rounded-xl hover:border-gold hover:text-gold transition group"
                >
                  <Phone className="w-6 h-6 text-gray-400 group-hover:text-gold" />
                  <div className="text-left">
                    <div className="font-bold">Marquer comme contacté</div>
                    <div className="text-xs text-gray-500">Si vous avez appelé le client</div>
                  </div>
                </button>

                <button 
                  onClick={() => navigate('/admin/calendar', { 
                    state: { 
                      newEvent: {
                        title: `RDV ${selectedLead.name}`,
                        notes: `Client: ${selectedLead.name}\nTéléphone: ${selectedLead.phone}\nEmail: ${selectedLead.email}\n\nMessage:\n${selectedLead.message}`
                      }
                    } 
                  })}
                  className="flex items-center justify-center gap-3 p-4 bg-zinc-900 border border-zinc-700 rounded-xl hover:border-gold hover:text-gold transition group"
                >
                  <Calendar className="w-6 h-6 text-gray-400 group-hover:text-gold" />
                  <div className="text-left">
                    <div className="font-bold">Planifier un RDV</div>
                    <div className="text-xs text-gray-500">Ajouter au calendrier</div>
                  </div>
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-gray-500">
            Sélectionnez un lead pour voir les détails
          </div>
        )}
      </div>
    </div>
  );
}
