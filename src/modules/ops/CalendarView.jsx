import { useState, useEffect } from 'react';
import { opsService } from '../../services/ops.service';
import { Calendar as CalIcon, MapPin, User, Clock, Plus, PenTool, Printer } from 'lucide-react';
import toast from 'react-hot-toast';
import WorkOrderDocument from '../../components/admin/ops/WorkOrderDocument';

export default function CalendarView() {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [installers, setInstallers] = useState([]);
  const [printData, setPrintData] = useState(null);

  useEffect(() => {
    if (printData) {
        window.print();
        setPrintData(null); // Reset after print triggers
    }
  }, [printData]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
        const appts = await opsService.getUpcomingAppointments();
        const insts = await opsService.getInstallers();
        setAppointments(appts);
        setInstallers(insts);
    } catch (e) {
        toast.error("Erreur chargement planning");
    } finally {
        setLoading(false);
    }
  };

  // Group by Date helper
  const groupedAppts = appointments.reduce((acc, appt) => {
    const date = appt.start ? appt.start.split('T')[0] : 'Sans date';
    if (!acc[date]) acc[date] = [];
    acc[date].push(appt);
    return acc;
  }, {});

  const dates = Object.keys(groupedAppts).sort();

  if (loading) return <div>Chargement planning...</div>;

  return (
    <div className="space-y-6">
      {/* Filters/Actions could go here */}
      
      {/* Schedule List */}
      <div className="space-y-8">
        {dates.length === 0 ? (
            <div className="text-gray-500 text-center py-10 bg-zinc-900 rounded-xl border border-zinc-800">
                Aucun rendez-vous prévu.
            </div>
        ) : dates.map(date => (
            <div key={date}>
                <h3 className="text-[#d4af37] font-bold text-lg mb-3 sticky top-0 bg-zinc-950/90 backdrop-blur py-2 border-b border-zinc-800">
                    {new Date(date).toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {groupedAppts[date].map(appt => (
                        <div key={appt.id} className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 hover:border-[#d4af37] transition group relative">
                             {/* Badge Type */}
                             <div className={`absolute top-4 right-4 text-xs font-bold px-2 py-1 rounded uppercase ${
                                appt.type === 'installation' ? 'bg-green-900/30 text-green-500' : 
                                appt.type === 'measurement' ? 'bg-blue-900/30 text-blue-500' : 'bg-purple-900/30 text-purple-500'
                             }`}>
                                {appt.type === 'installation' ? 'Pose' : appt.type === 'measurement' ? 'Mesure' : appt.type}
                             </div>

                             <div className="flex items-center gap-2 mb-3">
                                <Clock size={16} className="text-gray-500" />
                                <span className="text-white font-mono font-bold">
                                    {appt.start ? appt.start.split('T')[1] : '??:??'} - {appt.end ? appt.end.split('T')[1] : '??:??'}
                                </span>
                             </div>

                             <div className="mb-4">
                                <h4 className="font-bold text-lg text-white">{appt.clientName || "Client Inconnu"}</h4>
                                <a 
                                    href={`https://waze.com/ul?q=${encodeURIComponent(appt.address)}`} 
                                    target="_blank" 
                                    rel="noreferrer"
                                    className="text-sm text-gray-400 hover:text-[#d4af37] flex items-center gap-1 mt-1 truncate"
                                >
                                    <MapPin size={14} /> {appt.address || "Adresse manquante"}
                                </a>
                             </div>

                             {/* Bottom: Installer & Action */}
                             <div className="flex justify-between items-center border-t border-zinc-800 pt-3">
                                 <div className="flex items-center gap-2">
                                     <div className="w-6 h-6 rounded-full bg-zinc-800 flex items-center justify-center text-gray-400">
                                        <User size={12} />
                                     </div>
                                     <span className="text-xs text-gray-300">
                                         {installers.find(i => i.id === appt.installerId)?.name || 'Non assigné'}
                                     </span>
                                 </div>
                                 <button 
                                    onClick={() => {
                                        // Construct Work Order Data on the fly
                                        // In real app, we might need to fetch full order details if 'appt' is lightweight.
                                        // Assuming appt contains enough info or we fetch it.
                                        // For MVP, we'll map what we have and mock the rest or rely on appt being rich.
                                        setPrintData({
                                            humanId: `WO-${appt.id.slice(0,6)}`,
                                            client: { name: appt.clientName, address: appt.address, phone: appt.phone || '050-0000000' },
                                            logistics: { zone: 'Normal', floor: appt.floor || 0, hasElevator: appt.elevator || false },
                                            items: appt.items || [] // We need items in appointment!
                                        });
                                    }}
                                    className="text-xs bg-zinc-800 hover:bg-white hover:text-black text-white px-2 py-1 rounded transition flex items-center gap-1"
                                 >
                                    <Printer size={12} /> Fiche Travail
                                 </button>
                             </div>
                        </div>
                    ))}
                </div>
            </div>
        ))}
      </div>

      {/* HIDDEN PRINT DOC */}
      <WorkOrderDocument data={printData} />
    </div>
  );
}
