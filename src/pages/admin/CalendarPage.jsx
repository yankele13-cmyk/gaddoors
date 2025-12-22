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
import { getAppointments, addAppointment } from '../../services/db';
import { Plus, X } from 'lucide-react';
import { useForm } from 'react-hook-form';

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
  const [showModal, setShowModal] = useState(false);
  const { register, handleSubmit, reset } = useForm();

  const { state } = useLocation();

  useEffect(() => {
    fetchEvents();
    if (state?.newEvent) {
      // Pre-fill modal with data from navigation (e.g. from Leads Page)
      reset({
        title: state.newEvent.title,
        notes: state.newEvent.notes,
        type: 'meeting', // Default to meeting
        start: new Date().toISOString().slice(0, 16) // Current time ~
      });
      setShowModal(true);
      // Clear state to prevent reopening on refresh (optional/complex without clearing history)
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

  const onSubmit = async (data) => {
    try {
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
      reset();
    } catch (error) {
      console.error("Error adding event:", error);
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
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 bg-gold text-black hover:bg-yellow-500 font-bold py-2 px-4 rounded-lg transition"
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
          eventPropGetter={eventStyleGetter}
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

      {/* ADD EVENT MODAL */}
      {showModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-zinc-900 border border-zinc-700 rounded-xl w-full max-w-md p-6 relative">
            <button 
              onClick={() => setShowModal(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-white"
            >
              <X size={24} />
            </button>
            
            <h2 className="text-xl font-bold mb-6 font-heading">Ajouter un événement</h2>
            
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div>
                <label className="block text-sm text-gray-400 mb-1">Titre</label>
                <input 
                  {...register("title", { required: true })}
                  className="w-full bg-zinc-800 border border-zinc-700 rounded p-2 text-white focus:border-gold outline-none"
                  placeholder="Installation M. Dupont" 
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                 <div>
                    <label className="block text-sm text-gray-400 mb-1">Début</label>
                    <input 
                      type="datetime-local"
                      {...register("start", { required: true })}
                      className="w-full bg-zinc-800 border border-zinc-700 rounded p-2 text-white focus:border-gold outline-none"
                    />
                 </div>
                 <div>
                    <label className="block text-sm text-gray-400 mb-1">Fin</label>
                    <input 
                      type="datetime-local"
                      {...register("end", { required: true })}
                      className="w-full bg-zinc-800 border border-zinc-700 rounded p-2 text-white focus:border-gold outline-none"
                    />
                 </div>
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-1">Type</label>
                <select 
                  {...register("type")}
                  className="w-full bg-zinc-800 border border-zinc-700 rounded p-2 text-white focus:border-gold outline-none"
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
                  className="w-full bg-zinc-800 border border-zinc-700 rounded p-2 text-white focus:border-gold outline-none h-24"
                  placeholder="Détails supplémentaires..." 
                />
              </div>

              <button 
                type="submit"
                className="w-full bg-gold hover:bg-yellow-500 text-black font-bold py-3 rounded mt-4 transition"
              >
                Enregistrer
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
