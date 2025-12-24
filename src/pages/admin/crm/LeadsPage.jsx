import { useEffect, useState } from 'react';
import { CRMService } from '../../../services/crm.service'; // Ensure path is correct
import { Phone, Calendar, Ruler, MessageCircle, ArrowRight, UserPlus, FileText } from 'lucide-react';
import AppointmentModal from './components/AppointmentModal';
import toast from 'react-hot-toast';

// Simple Tabs Component
const Tabs = ({ activeTab, setActiveTab }) => (
  <div className="flex border-b border-zinc-800 mb-6">
    <button 
        onClick={() => setActiveTab('leads')}
        className={`px-6 py-3 font-medium text-sm flex items-center gap-2 transition-colors border-b-2 ${activeTab === 'leads' ? 'border-[#d4af37] text-[#d4af37]' : 'border-transparent text-gray-400 hover:text-white'}`}
    >
        <UserPlus size={18} /> Prospects
    </button>
    <button 
        onClick={() => setActiveTab('calendar')}
        className={`px-6 py-3 font-medium text-sm flex items-center gap-2 transition-colors border-b-2 ${activeTab === 'calendar' ? 'border-[#d4af37] text-[#d4af37]' : 'border-transparent text-gray-400 hover:text-white'}`}
    >
        <Calendar size={18} /> Agenda
    </button>
    <button 
        onClick={() => setActiveTab('measurements')}
        className={`px-6 py-3 font-medium text-sm flex items-center gap-2 transition-colors border-b-2 ${activeTab === 'measurements' ? 'border-[#d4af37] text-[#d4af37]' : 'border-transparent text-gray-400 hover:text-white'}`}
    >
        <Ruler size={18} /> Mesures
    </button>
  </div>
);

// STATUS BADGES
const StatusBadge = ({ status }) => {
    const styles = {
        new: 'bg-red-500/10 text-red-500 border-red-500/20',
        contacted: 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20',
        meeting_scheduled: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
        won: 'bg-green-500/10 text-green-500 border-green-500/20',
        lost: 'bg-zinc-500/10 text-zinc-500 border-zinc-500/20',
    };
    
    // Fallback translations
    const labels = {
        new: 'Nouveau',
        contacted: 'Contacté',
        meeting_scheduled: 'RDV Fixé',
        won: 'Gagné',
        lost: 'Perdu'
    };

    return (
        <span className={`px-2 py-1 rounded text-xs font-bold border ${styles[status] || styles.new}`}>
            {labels[status] || status}
        </span>
    );
};

export default function LeadsPage() {
  const [activeTab, setActiveTab] = useState('leads');
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedLead, setSelectedLead] = useState(null);

  useEffect(() => {
    if (activeTab === 'leads') {
        loadLeads();
    }
  }, [activeTab]);

  const loadLeads = async () => {
    setLoading(true);
    const res = await CRMService.getAllLeads();
    if (res.success) {
        setLeads(res.data);
    } else {
        toast.error("Erreur chargement leads");
    }
    setLoading(false);
  };

  const handleWhatsApp = (phone) => {
      // Remove leading 0, add 972
      if (!phone) return;
      const cleanPhone = phone.replace(/\D/g, ''); // numeric only
      const international = cleanPhone.startsWith('0') ? '972' + cleanPhone.substring(1) : cleanPhone;
      window.open(`https://wa.me/${international}?text=Bonjour, ici Gad Doors...`, '_blank');
  };

  const handleConvert = (lead) => {
      setSelectedLead(lead);
      setIsModalOpen(true);
  };

  const handleNewAppointment = () => {
      setSelectedLead(null); // Pure new appointment
      setIsModalOpen(true);
  }

  return (
    <div className="h-full flex flex-col">
      <div className="flex justify-between items-center mb-2">
         <h1 className="text-3xl font-bold font-heading text-white">CRM</h1>
         {activeTab === 'calendar' && (
             <button onClick={handleNewAppointment} className="bg-[#d4af37] text-black px-4 py-2 rounded font-bold hover:bg-yellow-500 transition">
                 + Nouveau RDV
             </button>
         )}
      </div>

      <Tabs activeTab={activeTab} setActiveTab={setActiveTab} />

      <div className="flex-1 overflow-auto">
        {activeTab === 'leads' && (
            <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden shadow-lg">
                <table className="w-full text-left text-sm text-gray-400">
                    <thead className="bg-zinc-950 text-gray-200 uppercase tracking-wider">
                        <tr>
                            <th className="px-6 py-4">Date</th>
                            <th className="px-6 py-4">Client</th>
                            <th className="px-6 py-4">Contact</th>
                            <th className="px-6 py-4">Ville</th>
                            <th className="px-6 py-4">Status</th>
                            <th className="px-6 py-4 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-800">
                        {leads.map(lead => (
                            <tr key={lead.id} className="hover:bg-zinc-800/50 transition-colors group">
                                <td className="px-6 py-4">{lead.createdAt?.seconds ? new Date(lead.createdAt.seconds * 1000).toLocaleDateString() : 'N/A'}</td>
                                <td className="px-6 py-4 font-medium text-white">{lead.name}</td>
                                <td className="px-6 py-4 flex items-center gap-2">
                                    <span>{lead.phone}</span>
                                    {lead.phone && (
                                        <button 
                                            onClick={() => handleWhatsApp(lead.phone)}
                                            className="text-green-500 hover:text-green-400 p-1 rounded hover:bg-green-500/10 transition"
                                            title="WhatsApp"
                                        >
                                            <MessageCircle size={16} />
                                        </button>
                                    )}
                                </td>
                                <td className="px-6 py-4">{lead.city}</td>
                                <td className="px-6 py-4">
                                    <StatusBadge status={lead.status} />
                                </td>
                                <td className="px-6 py-4 text-right">
                                    {lead.status !== 'meeting_scheduled' && lead.status !== 'won' && (
                                        <button 
                                            onClick={() => handleConvert(lead)}
                                            className="inline-flex items-center gap-1 bg-zinc-800 hover:bg-[#d4af37] hover:text-black text-white px-3 py-1 rounded-full text-xs transition border border-zinc-700"
                                        >
                                            Convertir <ArrowRight size={12} />
                                        </button>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {leads.length === 0 && !loading && (
                    <div className="p-12 text-center text-gray-500">Aucun prospect.</div>
                )}
            </div>
        )}

        {activeTab === 'calendar' && (
            <div className="text-center p-12 text-gray-500 bg-zinc-900 border border-zinc-800 rounded-xl">
                <Calendar size={48} className="mx-auto mb-4 opacity-20" />
                <p>Module Agenda en construction... (Utiliser "Nouveau RDV" pour tester le modal)</p>
            </div>
        )}

        {activeTab === 'measurements' && (
            <div className="text-center p-12 text-gray-500 bg-zinc-900 border border-zinc-800 rounded-xl">
                 <Ruler size={48} className="mx-auto mb-4 opacity-20" />
                 <p>Module Mesures en construction...</p>
            </div>
        )}
      </div>

      <AppointmentModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        leadToConvert={selectedLead}
        onSuccess={() => {
            loadLeads(); // Refresh list
        }}
      />
    </div>
  );
}
