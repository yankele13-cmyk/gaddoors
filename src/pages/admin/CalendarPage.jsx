import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Calendar, dateFnsLocalizer } from 'react-big-calendar';
import format from 'date-fns/format';
import parse from 'date-fns/parse';
import startOfWeek from 'date-fns/startOfWeek';
import getDay from 'date-fns/getDay';
import fr from 'date-fns/locale/fr';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import '../../components/admin/calendar/CalendarStyles.css';
import { getAppointments, addAppointment, deleteAppointment } from '../../services/db';
import { Plus, X, Trash2 } from 'lucide-react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';

// Setup Localizer
const locales = {
  'fr': fr,
};

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales,
});

export default function CalendarPage() {
  const [events, setEvents] = useState([]);
  const [view, setView] = useState('month');
  const [date, setDate] = useState(new Date());
  const [showModal, setShowModal] = useState(false);
  const [selectedEventId, setSelectedEventId] = useState(null);
  const { register, handleSubmit, reset, setValue } = useForm();

  const { state } = useLocation();

  useEffect(() => {
    fetchEvents();
    if (state?.newEvent) {
      // Pre-fill modal with data from navigation
      clearModal();
      setValue('title', state.newEvent.title);
      setValue('notes', state.newEvent.notes);
      setValue('type', 'meeting');
      setValue('start', new Date().toISOString().slice(0, 16));
      setShowModal(true);
    }
  }, [state]);

  async function fetchEvents() {
    try {
      const data = await getAppointments();
      setEvents(data);
    } catch (error) {
      console.error("Error fetching appointments:", error);
    }
  }

  const clearModal = () => {
    reset({ title: '', start: '', end: '', type: 'meeting', notes: '' });
    setSelectedEventId(null);
  };

  const handleSelectEvent = (event) => {
    setSelectedEventId(event.id);
    setValue('title', event.title);
    // Format dates for datetime-local input (YYYY-MM-DDThh:mm)
    setValue('start', new Date(event.start).toISOString().slice(0, 16));
    setValue('end', new Date(event.end).toISOString().slice(0, 16));
    setValue('type', event.type);
    setValue('notes', event.notes);
    setShowModal(true);
  };

  const handleDelete = async () => {
    if (!selectedEventId) return;
    if (window.confirm("Supprimer cet événement ?")) {
      try {
        await deleteAppointment(selectedEventId);
        toast.success("Événement supprimé");
        fetchEvents();
        setShowModal(false);
        clearModal();
      } catch (error) {
        console.error(error);
        toast.error("Erreur suppression");
      }
    }
  };

  const onSubmit = async (data) => {
    try {
      if (selectedEventId) {
          // If editing logic existed, we'd update here. For now, we block editing or treat as add? 
          // The prompt was just "Deletion", but UX implies edit. 
          // I will block edit for now to stay safe or treating as new adds duplicates.
          // Let's assume we just want to create new ones or delete. 
          // Actually, basic "Edit" is expected if I populate the form. 
          // But I don't have updateAppointment in db.js yet...
          // I will Focus on DELETION as requested. 
          // If user saves, it creates a new one currently. I should probably prevent that or implement Update.
          // Given the instructions "Reparer l'Agenda (Ajout suppression)", I will focus on deletion.
          // I will just add a comment.
          toast.error("La modification n'est pas encore implémentée, seul l'ajout et la suppression.");
          return; 
      }

      const newEvent = {
        title: data.title,
        start: new Date(data.start),
        end: new Date(data.end),
        type: data.type,
        notes: data.notes || ''
      };
      
      await addAppointment(newEvent);
      await fetchEvents();
      setShowModal(false);
      clearModal();
      toast.success("Événement ajouté");
    } catch (error) {
      console.error("Error adding event:", error);
      toast.error("Erreur lors de l'ajout");
    }
  };

  // Custom Event Style
  const eventStyleGetter = (event) => {
    let backgroundColor = '#d4af37'; // Default Gold
    if (event.type === 'installation') backgroundColor = '#10b981'; // Green
    if (event.type === 'meeting') backgroundColor = '#3b82f6'; // Blue
    
    return {
      style: {
        backgroundColor,
        borderRadius: '5px',
        opacity: 0.8,
        color: 'white',
        border: '0px',
        display: 'block'
      }
    };
  };

  return (
    <div className="h-[calc(100vh-64px)] p-6 bg-black text-white flex flex-col">
      <div className="flex justify-between items-center mb-6">
        <div>
           <h1 className="text-2xl font-bold font-heading text-white">Calendrier Intelligent</h1>
           <p className="text-gray-400 text-sm">Gérez vos installations et rendez-vous.</p>
        </div>
        <button 
          onClick={() => { clearModal(); setShowModal(true); }}
          className="flex items-center gap-2 bg-[#d4af37] text-black hover:bg-yellow-500 font-bold py-2 px-4 rounded-lg transition"
        >
          <Plus size={20} />
          Nouvel Événement
        </button>
      </div>

      <div className="flex-1 bg-zinc-900 border border-zinc-800 rounded-xl p-4 calendar-dark-theme">
        <Calendar
          localizer={localizer}
          events={events}
          startAccessor="start"
          endAccessor="end"
          style={{ height: '100%' }}
          culture="fr"
          onSelectEvent={handleSelectEvent}
          eventPropGetter={eventStyleGetter}
          // Controlled Props
          view={view}
          date={date}
          onView={(newView) => setView(newView)}
          onNavigate={(newDate) => setDate(newDate)}
          messages={{
            next: "Suivant",
            previous: "Précédent",
            today: "Aujourd'hui",
            month: "Mois",
            week: "Semaine",
            day: "Jour",
            agenda: "Agenda",
            date: "Date",
            time: "Heure",
            event: "Événement",
            noEventsInRange: "Aucun événement dans cette plage."
          }}
        />
      </div>

      {/* ADD/EDIT EVENT MODAL */}
      {showModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-zinc-900 border border-zinc-700 rounded-xl w-full max-w-md p-6 relative">
            <button 
              onClick={() => setShowModal(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-white"
            >
              <X size={24} />
            </button>
            
            <h2 className="text-xl font-bold mb-6 font-heading">
                {selectedEventId ? 'Détails Événement' : 'Ajouter un événement'}
            </h2>
            
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div>
                <label className="block text-sm text-gray-400 mb-1">Titre</label>
                <input 
                  {...register("title", { required: true })}
                  className="w-full bg-zinc-800 border border-zinc-700 rounded p-2 text-white focus:border-[#d4af37] outline-none"
                  placeholder="Installation M. Dupont" 
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                 <div>
                    <label className="block text-sm text-gray-400 mb-1">Début</label>
                    <input 
                      type="datetime-local"
                      {...register("start", { required: true })}
                      className="w-full bg-zinc-800 border border-zinc-700 rounded p-2 text-white focus:border-[#d4af37] outline-none"
                    />
                 </div>
                 <div>
                    <label className="block text-sm text-gray-400 mb-1">Fin</label>
                    <input 
                      type="datetime-local"
                      {...register("end", { required: true })}
                      className="w-full bg-zinc-800 border border-zinc-700 rounded p-2 text-white focus:border-[#d4af37] outline-none"
                    />
                 </div>
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-1">Type</label>
                <select 
                  {...register("type")}
                  className="w-full bg-zinc-800 border border-zinc-700 rounded p-2 text-white focus:border-[#d4af37] outline-none"
                >
                  <option value="meeting">Rendez-vous Commercial (Bleu)</option>
                  <option value="installation">Installation (Vert)</option>
                  <option value="other">Autre (Or)</option>
                </select>
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-1">Notes</label>
                <textarea 
                  {...register("notes")}
                  className="w-full bg-zinc-800 border border-zinc-700 rounded p-2 text-white focus:border-[#d4af37] outline-none h-24"
                  placeholder="Détails supplémentaires..." 
                />
              </div>

              <div className="flex gap-3 pt-2">
                 {selectedEventId && (
                     <button 
                        type="button"
                        onClick={handleDelete}
                        className="bg-red-900/30 text-red-400 border border-red-900/50 hover:bg-red-900/50 font-bold py-3 px-4 rounded transition flex items-center justify-center"
                     >
                        <Trash2 size={20} />
                     </button>
                 )}
                 <button 
                    type="submit"
                    className="flex-1 bg-[#d4af37] hover:bg-yellow-500 text-black font-bold py-3 rounded transition"
                 >
                    {selectedEventId ? 'Enregistrer (Copie)' : 'Enregistrer'}
                 </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
