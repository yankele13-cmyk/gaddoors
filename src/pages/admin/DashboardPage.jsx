import { useEffect, useState, useRef } from 'react';
import { dashboardService } from '../../services/dashboard.service';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { 
    TrendingUp, 
    AlertTriangle, 
    Users, 
    Calendar, 
    ArrowUpRight, 
    ArrowDownRight,
    DollarSign,
    Briefcase,
    Bell
} from 'lucide-react';
import toast from 'react-hot-toast';
// import { useAuth } from '../../context/AuthContext';
import { useTranslation } from 'react-i18next'; // Imported

// Helper to format currency
const formatCurrency = (amount) => new Intl.NumberFormat('he-IL', { style: 'currency', currency: 'ILS', minimumFractionDigits: 0 }).format(amount);

const StatCard = ({ title, value, subtext, icon: Icon, trend, color = "green" }) => (
    <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 relative overflow-hidden group">
        <div className={`absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity`}>
             <Icon size={64} className={`text-${color}-500`} />
        </div>
        <div className="flex justify-between items-start mb-4">
             <div className={`p-3 rounded-lg bg-${color}-500/10 text-${color}-500`}>
                 <Icon size={24} />
             </div>
             {trend && (
                 <div className={`flex items-center text-xs font-bold ${trend > 0 ? 'text-green-500' : 'text-red-500'}`}>
                     {trend > 0 ? <ArrowUpRight size={16} /> : <ArrowDownRight size={16} />}
                     {Math.abs(trend)}%
                 </div>
             )}
        </div>
        <div>
            <h3 className="text-gray-400 text-sm font-medium uppercase tracking-wider">{title}</h3>
            <p className="text-3xl font-bold text-white mt-1">{value}</p>
            {subtext && <p className="text-xs text-gray-500 mt-2">{subtext}</p>}
        </div>
    </div>
);

// Robust Chart Container to handle Resize/Visibility
const ChartContainer = ({ children }) => {
    const { t } = useTranslation();
    const containerRef = useRef(null);
    const [dims, setDims] = useState({ width: 0, height: 0 });

    const dirRef = (node) => {
        if (node !== null) {
            const { width, height } = node.getBoundingClientRect();
             // Only update if changed significantly to avoid loops
             if (width > 0 && height > 0 && (Math.abs(width - dims.width) > 1 || Math.abs(height - dims.height) > 1)) {
                 setDims({ width, height });
             }
        }
    };

    return (
        <div ref={dirRef} className="w-full h-full">
            {dims.width > 0 && dims.height > 0 ? (
                <ResponsiveContainer width={dims.width} height={dims.height}>
                    {children}
                </ResponsiveContainer>
            ) : (
                <div className="flex h-full items-center justify-center text-gray-500 text-xs">
                    {t('admin.dashboard.initializing')}
                </div>
            )}
        </div>
    );
};

export default function DashboardPage() {
  const { t } = useTranslation(); // Hook
  const [stats, setStats] = useState({
      revenue: 0,
      debt: 0,
      activeLeads: 0,
      upcomingInstallations: 0
  });
  const [chartData, setChartData] = useState([]);
  const [recentOrders, setRecentOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isReady, setIsReady] = useState(false); 

  
  useEffect(() => {
    const timer = setTimeout(() => setIsReady(true), 500);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
        const data = await dashboardService.getStats();

        setStats({
            revenue: data.revenue,
            debt: data.debt,
            activeLeads: data.activeLeads,
            upcomingInstallations: data.upcomingInstallations
        });

        setRecentOrders(data.recentOrders);

        // Chart Data Formatting
        // Ensure last 6 months order even if empty
        const chart = [];
        for (let i = 5; i >= 0; i--) {
            const d = new Date();
            d.setMonth(d.getMonth() - i);
            const key = d.toLocaleString('fr-FR', { month: 'short' });
            chart.push({
                name: key,
                sales: data.monthlySales[key] || 0
            });
        }
        setChartData(chart);

    } catch (error) {
        console.error("Dashboard Error:", error);
        toast.error("Erreur chargement dashboard");
    } finally {
        setLoading(false);
    }
  };

  if (loading) return <div className="p-12 text-center text-[#d4af37]">{t('admin.dashboard.loading')}</div>;

  return (
    <div className="space-y-6">
       <div className="flex justify-between items-center">
            <h1 className="text-3xl font-bold font-heading text-white">{t('admin.dashboard.title')}</h1>
            <p className="text-gray-400 text-sm">{t('admin.dashboard.subtitle')} <span className="text-[#d4af37]">• {new Date().toLocaleDateString()}</span></p>
       </div>

       {/* KPI Cards */}
       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatCard 
                title={t('admin.dashboard.revenue')} 
                value={formatCurrency(stats.revenue)} 
                subtext={t('admin.dashboard.revenueSub')} 
                icon={TrendingUp} 
                color="green" 
            />
            <StatCard 
                title={t('admin.dashboard.debt')} 
                value={formatCurrency(stats.debt)} 
                subtext={t('admin.dashboard.debtSub')} 
                icon={DollarSign} 
                color="red"
            />
             <StatCard 
                title={t('admin.dashboard.leads')} 
                value={stats.activeLeads} 
                subtext={t('admin.dashboard.leadsSub')} 
                icon={Users} 
                color="blue" 
            />
            <StatCard 
                title={t('admin.dashboard.installations')} 
                value={stats.upcomingInstallations} 
                subtext={t('admin.dashboard.installationsSub')} 
                icon={Calendar} 
                color="yellow" 
            />
       </div>

       {/* Charts & Graphs */}
       <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
            <h3 className="text-lg font-bold text-white mb-6">{t('admin.dashboard.salesEvolution')}</h3>
            <div className="w-full h-[300px] relative chart-container">
               <ChartContainer>
                   <AreaChart data={chartData}>
                        <defs>
                            <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#d4af37" stopOpacity={0.3}/>
                                <stop offset="95%" stopColor="#d4af37" stopOpacity={0}/>
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                        <XAxis dataKey="name" stroke="#666" />
                        <YAxis stroke="#666" />
                        <Tooltip 
                            contentStyle={{ backgroundColor: '#18181b', borderColor: '#333' }}
                            itemStyle={{ color: '#d4af37' }}
                        />
                        <Area type="monotone" dataKey="sales" stroke="#d4af37" fillOpacity={1} fill="url(#colorSales)" />
                    </AreaChart>
               </ChartContainer>
            </div>
       </div>

       {/* Bottom Widgets */}
       <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
           
           {/* Recent Orders */}
           <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden flex flex-col">
                <div className="p-6 border-b border-zinc-800 flex justify-between items-center">
                    <h3 className="font-bold text-white flex items-center gap-2"><Briefcase size={18} className="text-[#d4af37]"/> {t('admin.dashboard.recentOrders')}</h3>
                </div>
                <div className="flex-1 overflow-auto">
                    <table className="w-full text-left text-sm text-gray-400">
                        <tbody className="divide-y divide-zinc-800">
                            {recentOrders.map(order => (
                                <tr key={order.id} className="hover:bg-zinc-800/50">
                                    <td className="px-6 py-4 font-medium text-white">{order.clientName}</td>
                                    <td className="px-6 py-4">{formatCurrency(order.total)}</td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2 py-1 rounded text-xs font-bold border ${
                                            order.status === 'paid' ? 'bg-green-500/10 text-green-500 border-green-500/20' : 
                                            order.status === 'pending_payment' ? 'bg-red-500/10 text-red-500 border-red-500/20' :
                                            'bg-yellow-500/10 text-yellow-500 border-yellow-500/20'
                                        }`}>
                                            {order.status}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                            {recentOrders.length === 0 && (
                                <tr><td colSpan="3" className="p-6 text-center">{t('admin.dashboard.none')}</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
           </div>

           {/* Alerts */}
           <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden flex flex-col">
                <div className="p-6 border-b border-zinc-800 flex justify-between items-center">
                    <h3 className="font-bold text-white flex items-center gap-2"><Bell size={18} className="text-[#d4af37]"/> {t('admin.dashboard.alerts')}</h3>
                </div>
                <div className="flex-1 p-6 space-y-4">
                     {/* Mock Logic for Alerts - ideally computed from real data */}
                     {stats.activeLeads > 0 && (
                         <div className="flex items-start gap-3 p-3 rounded-lg bg-orange-500/10 border border-orange-500/20">
                             <AlertTriangle className="text-orange-500 shrink-0" size={20} />
                             <div>
                                 <p className="text-orange-500 text-sm font-bold">{t('admin.dashboard.newLeads', { count: stats.activeLeads })}</p>
                                 <p className="text-gray-400 text-xs">{t('admin.dashboard.leadsWait')}</p>
                             </div>
                         </div>
                     )}
                     
                     <div className="flex items-start gap-3 p-3 rounded-lg bg-blue-500/10 border border-blue-500/20">
                          <Calendar className="text-blue-500 shrink-0" size={20} />
                          <div>
                              <p className="text-blue-500 text-sm font-bold">{t('admin.dashboard.weeklySchedule')}</p>
                              <p className="text-gray-400 text-xs">{stats.upcomingInstallations} {t('admin.dashboard.installationsPlanned')}</p>
                          </div>
                     </div>

                     <div className="flex items-start gap-3 p-3 rounded-lg bg-zinc-800 border border-zinc-700">
                          <div className="h-2 w-2 rounded-full bg-green-500 mt-2"></div>
                          <p className="text-gray-400 text-sm">{t('admin.dashboard.systemOk')}</p>
                     </div>
                </div>
           </div>

       </div>
    </div>
  );
}
