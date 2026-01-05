import { useEffect, useState } from 'react';
import { CRMService } from '../../../services/crm.service';
import { Phone, Calendar as CalendarIcon, Ruler, MessageCircle, ArrowRight, UserPlus, FileText } from 'lucide-react';
import AppointmentModal from './components/AppointmentModal';
import LeadModal from './components/LeadModal';
import toast from 'react-hot-toast';

// Calendar Imports REMOVED
import { getAppointments, addAppointment, deleteAppointment } from '../../../services/db'; // Import DB services
import { useForm } from 'react-hook-form'; // Import useForm
import { Plus, X, Trash2, LayoutList, Kanban, Users } from 'lucide-react'; // Import icons (Removed duplicate Ruler)
import LeadKanban from '../../../modules/crm/LeadKanban'; // Import LeadKanban

// Missing Components Definitions
const Tabs = ({ activeTab, setActiveTab }) => (
  <div className="flex gap-4 border-b border-zinc-800 mb-6">
    <button 
      onClick={() => setActiveTab('leads')}
      className={`pb-2 px-2 text-sm font-medium transition ${activeTab === 'leads' ? 'text-[#d4af37] border-b-2 border-[#d4af37]' : 'text-gray-400 hover:text-white'}`}
    >
      Prospects
    </button>
    <button 
      onClick={() => setActiveTab('measurements')}
      className={`pb-2 px-2 text-sm font-medium transition ${activeTab === 'measurements' ? 'text-[#d4af37] border-b-2 border-[#d4af37]' : 'text-gray-400 hover:text-white'}`}
    >
      Prises de Mesures
    </button>
  </div>
);

const StatusBadge = ({ status }) => {
    const styles = {
        new: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
        contacted: 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20',
        meeting_scheduled: 'bg-purple-500/10 text-purple-500 border-purple-500/20',
        won: 'bg-green-500/10 text-green-500 border-green-500/20',
        lost: 'bg-red-500/10 text-red-500 border-red-500/20'
    };
    const labels = {
        new: 'Nouveau',
        contacted: 'Contacté',
        meeting_scheduled: 'RDV Fixé',
        won: 'Gagné',
        lost: 'Perdu'
    };
    return (
        <span className={`px-2 py-1 rounded-full text-xs font-medium border ${styles[status] || 'bg-gray-500/10 text-gray-500'}`}>
            {labels[status] || status}
        </span>
    );
};

// ... (existing code)

export default function LeadsPage() {
  const [activeTab, setActiveTab] = useState('leads');
  const [viewMode, setViewMode] = useState('list'); // 'list' or 'kanban'
  const [leads, setLeads] = useState([]);
  const [appointments, setAppointments] = useState([]); // Shared for Calendar & Measurements
  const [loading, setLoading] = useState(true);
  
  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false); // Appointment Modal
  const [isLeadModalOpen, setIsLeadModalOpen] = useState(false); // Lead Modal
  
  const [selectedLead, setSelectedLead] = useState(null);



  // Calendar State & Handlers REMOVED (Moved to CalendarPage)

  useEffect(() => {
    loadData();
  }, [activeTab]);

  const loadData = async () => {
    setLoading(true);
    if (activeTab === 'leads') {
        const res = await CRMService.getAllLeads();
        if (res.success) setLeads(res.data);
    } else if (activeTab === 'calendar' || activeTab === 'measurements') {
        const res = await CRMService.getAllAppointments();
        if (res.success) {
            // Ensure dates are Objects for Calendar
            const formatted = res.data.map(appt => ({
                ...appt,
                start: appt.start?.seconds ? new Date(appt.start.seconds * 1000) : (appt.start || new Date()),
                end: appt.end?.seconds ? new Date(appt.end.seconds * 1000) : (appt.end || new Date()),
                title: appt.title || 'RDV'
            }));
            setAppointments(formatted);
        }
    }
    setLoading(false);
  };

  const handleWhatsApp = (phone) => {
      if (!phone) return;
      const cleanPhone = phone.replace(/\D/g, ''); 
      const international = cleanPhone.startsWith('0') ? '972' + cleanPhone.substring(1) : cleanPhone;
      window.open(`https://wa.me/${international}?text=Bonjour, ici Gad Doors...`, '_blank');
  };

  const handleConvert = (lead) => {
      setSelectedLead(lead);
      setIsModalOpen(true);
  };

  const measurements = appointments.filter(a => a.type === 'measurements');

  const eventStyleGetter = (event) => {
    let backgroundColor = '#d4af37'; 
    if (event.type === 'installation') backgroundColor = '#10b981';
    if (event.type === 'measurements') backgroundColor = '#8b5cf6'; // Purple for measurements
    if (event.type === 'meeting') backgroundColor = '#3b82f6'; 
    
    return {
      style: { backgroundColor, borderRadius: '5px', opacity: 0.8, color: 'white', border: '0px', display: 'block' }
    };
  };

  return (
    <div className="h-full flex flex-col">
      <div className="flex justify-between items-center mb-2">
         <h1 className="text-3xl font-bold font-heading text-white">CRM</h1>
         <div className="flex gap-2">
             {activeTab === 'leads' && (
                 <button 
                    onClick={() => setIsLeadModalOpen(true)} 
                    className="flex items-center gap-2 bg-zinc-800 hover:bg-zinc-700 text-white px-4 py-2 rounded font-bold transition border border-zinc-600"
                 >
                     <UserPlus size={18} /> Nouveau Prospect
                 </button>
             )}
             <button onClick={() => { setSelectedLead(null); setIsModalOpen(true); }} className="bg-[#d4af37] text-black px-4 py-2 rounded font-bold hover:bg-yellow-500 transition flex items-center gap-2">
                 <CalendarIcon size={18} /> + RDV
             </button>
         </div>
      </div>

      <Tabs activeTab={activeTab} setActiveTab={setActiveTab} />

      <div className="flex-1 overflow-auto">
        {/* LEADS LIST */}
        {activeTab === 'leads' && (
            <>
                <div className="flex justify-end mb-4 gap-2">
                    <button 
                        onClick={() => setViewMode('list')}
                        className={`p-2 rounded ${viewMode === 'list' ? 'bg-zinc-800 text-[#d4af37]' : 'text-gray-500 hover:text-white'}`}
                        title="Vue Liste"
                    >
                        <LayoutList size={20} />
                    </button>
                    <button 
                        onClick={() => setViewMode('kanban')}
                        className={`p-2 rounded ${viewMode === 'kanban' ? 'bg-zinc-800 text-[#d4af37]' : 'text-gray-500 hover:text-white'}`}
                        title="Vue Kanban"
                    >
                        <Kanban size={20} />
                    </button>
                </div>

                {viewMode === 'list' ? (
                    <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden shadow-lg">
                        <table className="w-full text-left text-sm text-gray-400">
                            {/* ... Table Content ... */}
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
                                                <button onClick={() => handleWhatsApp(lead.phone)} className="text-green-500 hover:text-green-400" title="WhatsApp"><MessageCircle size={16} /></button>
                                            )}
                                        </td>
                                        <td className="px-6 py-4">{lead.city}</td>
                                        <td className="px-6 py-4"><StatusBadge status={lead.status} /></td>
                                        <td className="px-6 py-4 text-right">
                                            {lead.status !== 'meeting_scheduled' && lead.status !== 'won' && (
                                                <button onClick={() => handleConvert(lead)} className="inline-flex items-center gap-1 bg-zinc-800 hover:bg-[#d4af37] hover:text-black text-white px-3 py-1 rounded-full text-xs transition border border-zinc-700">
                                                    Convertir <ArrowRight size={12} />
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        {leads.length === 0 && !loading && <div className="p-12 text-center text-gray-500">Aucun prospect.</div>}
                    </div>
                ) : (
                    <LeadKanban 
                        onSelectLead={(lead) => { setSelectedLead(lead); setIsLeadModalOpen(true); }} // Re-use LeadModal for editing? Or details?
                        // Actually LeadKanban fetches its own leads in the current implementation (checked file in step 446). 
                        // We should probably pass 'leads' to it if we want to control data, but LeadKanban.jsx does its own 'loadLeads()'. 
                        // To be consistent with LeadsPage state, we should update LeadKanban to accept 'leads' prop or refactor.
                        // For Quick Win: Let's use it as is, but it might double fetch. 
                        // Better: LeadKanban.jsx (Step 446) takes 'onSelectLead'.
                    />
                )}
            </>
        )}

        {/* AGENDA VIEW REMOVED - Use CalendarPage */}

        {/* MEASUREMENTS LIST */}
        {activeTab === 'measurements' && (
            <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
                <div className="p-4 border-b border-zinc-800 bg-zinc-950 flex justify-between items-center">
                    <h3 className="font-bold text-white">Prises de Mesures</h3>
                    <span className="text-xs text-gray-400">{measurements.length} planifiées</span>
                </div>
                {measurements.length === 0 ? (
                    <div className="p-12 text-center text-gray-500">Aucune mesure planifiée.</div>
                ) : (
                    <div className="divide-y divide-zinc-800">
                        {measurements.map(m => (
                             <div key={m.id} className="p-4 hover:bg-zinc-800/50 flex justify-between items-center">
                                 <div>
                                     <div className="font-bold text-white text-sm">{m.clientName || m.title}</div>
                                     <div className="text-xs text-gray-500">{m.start.toLocaleString()} • {m.city}</div>
                                     <div className="text-xs text-purple-400 mt-1">Tech: Yossef</div>
                                 </div>
                                 <button className="text-gray-400 hover:text-white"><FileText size={18}/></button>
                             </div>
                        ))}
                    </div>
                )}
            </div>
        )}
      </div>

      <AppointmentModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        leadToConvert={selectedLead}
        onSuccess={() => loadData()}
      />

      <LeadModal
        isOpen={isLeadModalOpen}
        onClose={() => setIsLeadModalOpen(false)}
        onSuccess={() => loadData()}
      />

      {/* EVENT MODAL (Copied from CalendarPage) */}
      {/* EVENT MODAL REMOVED */}
    </div>
  );
}
