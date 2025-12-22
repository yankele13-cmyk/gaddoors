import { Clock, MapPin, BadgeCheck, AlertCircle } from 'lucide-react';

export default function DailyBriefing() {
  // Mock data for now - will be replaced by API call later
  const events = [
    { id: 1, time: '09:00', type: 'installation', client: 'M. Benaroch', location: 'Tel Aviv', status: 'pending' },
    { id: 2, time: '11:30', type: 'measurement', client: 'Sarah Cohen', location: 'Herzliya', status: 'confirmed' },
    { id: 3, time: '14:00', type: 'quote', client: 'David Levy', location: 'Ra\'anana', status: 'done' },
  ];

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 h-full">
      <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2 font-heading">
        <span className="text-[#d4af37]">📅</span> Daily Briefing
      </h2>
      
      <div className="space-y-6 relative before:absolute before:left-[19px] before:top-2 before:bottom-2 before:w-[2px] before:bg-zinc-800">
        {events.map((event) => (
          <div key={event.id} className="relative flex gap-4 items-start pl-2">
            <div className={`absolute left-0 mt-1 w-[40px] h-[40px] rounded-full border-4 border-black flex items-center justify-center z-10 
              ${event.type === 'installation' ? 'bg-blue-500' : 
                event.type === 'measurement' ? 'bg-purple-500' : 'bg-[#d4af37]'}`}>
               {event.status === 'done' ? <BadgeCheck size={16} className="text-white" /> : <Clock size={16} className="text-white" />} 
            </div>
            
            <div className="ml-12 w-full p-4 rounded-lg bg-black/40 border border-zinc-800 hover:border-zinc-700 transition">
              <div className="flex justify-between items-start mb-1">
                <span className="font-mono text-[#d4af37] font-bold text-lg">{event.time}</span>
                <span className={`text-[10px] uppercase font-bold px-2 py-1 rounded ${
                  event.type === 'installation' ? 'bg-blue-900/30 text-blue-300' : 
                  event.type === 'measurement' ? 'bg-purple-900/30 text-purple-300' : 'bg-yellow-900/30 text-yellow-300'
                }`}>
                  {event.type}
                </span>
              </div>
              <h3 className="text-white font-medium text-base mb-1">{event.client}</h3>
              <div className="flex items-center gap-2 text-zinc-500 text-sm">
                <MapPin size={14} />
                {event.location}
              </div>
            </div>
          </div>
        ))}

        {events.length === 0 && (
          <div className="text-center text-zinc-500 py-8">
            <p>Aucun rendez-vous aujourd'hui.</p>
          </div>
        )}
      </div>
    </div>
  );
}
