import { useEffect, useState } from 'react';
import { CRMService } from '../../../services/crm.service';
import { Phone, Calendar as CalendarIcon, Ruler, MessageCircle, ArrowRight, UserPlus, FileText } from 'lucide-react';
import AppointmentModal from './components/AppointmentModal';
import LeadModal from './components/LeadModal';
import toast from 'react-hot-toast';

// Calendar Imports
import { Calendar, dateFnsLocalizer } from 'react-big-calendar';
import format from 'date-fns/format';
import parse from 'date-fns/parse';
import startOfWeek from 'date-fns/startOfWeek';
import getDay from 'date-fns/getDay';
import fr from 'date-fns/locale/fr';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import '../../../components/admin/calendar/CalendarStyles.css';

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales: { 'fr': fr },
});

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
        <CalendarIcon size={18} /> Agenda
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
  const [appointments, setAppointments] = useState([]); // Shared for Calendar & Measurements
  const [loading, setLoading] = useState(true);
  
  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false); // Appointment Modal
  const [isLeadModalOpen, setIsLeadModalOpen] = useState(false); // Lead Modal
  
  const [selectedLead, setSelectedLead] = useState(null);

  // Calendar State
  const [view, setView] = useState('month');
  const [date, setDate] = useState(new Date());

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
        )}

        {/* AGENDA VIEW */}
        {activeTab === 'calendar' && (
            <div className="h-full bg-zinc-900 border border-zinc-800 rounded-xl p-4 calendar-dark-theme">
                 <Calendar
                  localizer={localizer}
                  events={appointments}
                  startAccessor="start"
                  endAccessor="end"
                  style={{ height: '100%' }}
                  culture="fr"
                  eventPropGetter={eventStyleGetter}
                  view={view}
                  date={date}
                  onView={(newView) => setView(newView)}
                  onNavigate={(newDate) => setDate(newDate)}
                  messages={{ next: "Suivant", previous: "Précédent", today: "Aujourd'hui", month: "Mois", week: "Semaine", day: "Jour", agenda: "Agenda" }}
                />
            </div>
        )}

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
    </div>
  );
}
