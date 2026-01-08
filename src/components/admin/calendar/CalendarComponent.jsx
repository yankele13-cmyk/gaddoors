import { Calendar, dateFnsLocalizer } from 'react-big-calendar';
import format from 'date-fns/format';
import parse from 'date-fns/parse';
import startOfWeek from 'date-fns/startOfWeek';
import getDay from 'date-fns/getDay';
import fr from 'date-fns/locale/fr';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import './CalendarStyles.css'; // Ensure this file exists relative to this component
import { useState } from 'react';

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

export default function CalendarComponent({ 
    events = [], 
    onSelectEvent, 
    onSelectSlot,
    height = '100%',
    defaultView = 'month'
}) {
  const [view, setView] = useState(defaultView);
  const [date, setDate] = useState(new Date());

  // Custom Event Style
  const eventStyleGetter = (event) => {
    let backgroundColor = '#d4af37'; // Default Gold
    if (event.type === 'installation') backgroundColor = '#10b981'; // Green
    if (event.type === 'meeting') backgroundColor = '#3b82f6'; // Blue
    if (event.type === 'measurement') backgroundColor = '#8b5cf6'; // Purple
    
    return {
      style: {
        backgroundColor,
        borderRadius: '6px',
        opacity: 0.9,
        color: 'white',
        border: '0px',
        display: 'block',
        boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
        fontWeight: '500',
        fontSize: '0.85rem'
      }
    };
  };

  return (
    <div className="h-full bg-zinc-900 border border-zinc-800 rounded-xl p-4 calendar-dark-theme shadow-xl overflow-hidden flex flex-col">
      <div className="flex-1 overflow-x-auto overflow-y-hidden">
        <div className="min-w-[600px] h-full"> {/* Force minimum width to prevent grid squishing */}
           <Calendar
             localizer={localizer}
             events={events}
             startAccessor="start"
             endAccessor="end"
             style={{ height: '100%' }}
             culture="fr"
             onSelectEvent={onSelectEvent}
             onSelectSlot={onSelectSlot}
             selectable={!!onSelectSlot}
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
               noEventsInRange: "Aucun événement dans cette plage.",
               allDay: "Toute la journée"
             }}
             components={{
                 toolbar: (props) => (
                     <div className="flex flex-col xl:flex-row justify-between items-center mb-4 gap-4 w-full">
                        <div className="flex gap-2 w-full xl:w-auto justify-center">
                            <button onClick={() => props.onNavigate('PREV')} className="px-3 py-1 bg-zinc-800 text-white rounded hover:bg-zinc-700 transition text-sm">Précédent</button>
                            <button onClick={() => props.onNavigate('TODAY')} className="px-3 py-1 bg-[#d4af37] text-black font-bold rounded hover:bg-yellow-500 transition text-sm">Aujourd'hui</button>
                            <button onClick={() => props.onNavigate('NEXT')} className="px-3 py-1 bg-zinc-800 text-white rounded hover:bg-zinc-700 transition text-sm">Suivant</button>
                        </div>
                        
                        <span className="text-lg xl:text-xl font-bold text-white capitalize text-center w-full xl:w-auto order-first xl:order-none">
                            {props.label}
                        </span>
    
                        <div className="flex gap-1 w-full xl:w-auto justify-center overflow-x-auto pb-1 xl:pb-0">
                            {['month', 'week', 'day', 'agenda'].map(v => (
                                <button 
                                    key={v}
                                    onClick={() => props.onView(v)} 
                                    className={`px-3 py-1 rounded capitalize transition text-sm whitespace-nowrap ${view === v ? 'bg-zinc-700 text-white border border-zinc-500' : 'text-zinc-400 hover:text-white'}`}
                                >
                                    {v === 'month' ? 'Mois' : v === 'week' ? 'Semaine' : v === 'day' ? 'Jour' : 'Agenda'}
                                </button>
                            ))}
                        </div>
                    </div>
                 )
             }}
               />
        </div>
      </div>
    </div>
  );
}
