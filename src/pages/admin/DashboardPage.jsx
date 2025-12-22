import { useEffect, useState } from 'react';
import { getDashboardStats, getRecentMessages } from '../../services/db';
import KPICard from '../../components/admin/dashboard/KPICard';
import DailyBriefing from '../../components/admin/dashboard/DailyBriefing';
import RecentActivity from '../../components/admin/dashboard/RecentActivity';
import { DollarSign, Users, Calendar, Package } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function DashboardPage() {
  const [stats, setStats] = useState(null);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);

  // Mock data for the chart
  const revenueData = [
    { name: 'Jan', uv: 4000 },
    { name: 'Feb', uv: 3000 },
    { name: 'Mar', uv: 2000 },
    { name: 'Apr', uv: 2780 },
    { name: 'May', uv: 1890 },
    { name: 'Jun', uv: 2390 },
    { name: 'Jul', uv: 3490 },
    { name: 'Aug', uv: 4200 },
    { name: 'Sep', uv: 5100 },
    { name: 'Oct', uv: 6500 },
    { name: 'Nov', uv: 8200 },
    { name: 'Dec', uv: 12000 }, // Current month boost
  ];

  useEffect(() => {
    async function fetchData() {
      try {
        const [statsData, messagesData] = await Promise.all([
          getDashboardStats(),
          getRecentMessages()
        ]);
        setStats(statsData);
        setMessages(messagesData);
      } catch (error) {
        console.error("Dashboard data load failed", error);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  if (loading) return <div className="text-white p-8">Chargement du cockpit...</div>;

  return (
    <div className="space-y-6">
      {/* 1. Header is handled by Layout, so we start with KPIs */}
      
      {/* KPI Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <KPICard 
          title="CA Mensuel (Estimé)" 
          value={`${stats?.monthlyRevenue?.toLocaleString()} ₪`} 
          icon={DollarSign} 
          trend={12} 
        />
        <KPICard 
          title="Leads en attente" 
          value={stats?.unreadMessages} 
          icon={Users} 
          trend={stats?.unreadMessages > 5 ? 5 : 0} 
          color="text-blue-400"
        />
        <KPICard 
          title="Installations à venir" 
          value={stats?.pendingInstallations} 
          icon={Calendar} 
          color="text-purple-400"
        />
        <KPICard 
          title="Produits en Catalogue" 
          value={stats?.totalProducts} 
          icon={Package} 
          color="text-green-400"
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[500px]">
        {/* Left Col (2/3): Charts & Activity */}
        <div className="lg:col-span-2 space-y-6 flex flex-col h-full">
          {/* Revenue Chart */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 flex-1 min-h-[300px]">
             <h3 className="text-white font-bold mb-4 flex items-center gap-2 font-heading">
               <span className="text-[#d4af37]">📈</span> Croissance Annuelle
             </h3>
             <div className="h-full pb-8">
               <ResponsiveContainer width="100%" height="100%">
                 <AreaChart data={revenueData}>
                   <defs>
                     <linearGradient id="colorUv" x1="0" y1="0" x2="0" y2="1">
                       <stop offset="5%" stopColor="#d4af37" stopOpacity={0.8}/>
                       <stop offset="95%" stopColor="#d4af37" stopOpacity={0}/>
                     </linearGradient>
                   </defs>
                   <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                   <XAxis dataKey="name" stroke="#666" />
                   <YAxis stroke="#666" />
                   <Tooltip 
                      contentStyle={{ backgroundColor: '#000', border: '1px solid #333' }}
                      itemStyle={{ color: '#d4af37' }}
                   />
                   <Area type="monotone" dataKey="uv" stroke="#d4af37" fillOpacity={1} fill="url(#colorUv)" />
                 </AreaChart>
               </ResponsiveContainer>
             </div>
          </div>

          <RecentActivity messages={messages} />
        </div>

        {/* Right Col (1/3): Daily Briefing */}
        <div className="lg:col-span-1 h-full">
           <DailyBriefing />
        </div>
      </div>
    </div>
  );
}
