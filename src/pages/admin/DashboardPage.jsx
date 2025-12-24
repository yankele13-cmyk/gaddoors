import { useEffect, useState } from 'react';
import { FinanceService } from '../../services/finance.service';
import { CRMService } from '../../services/crm.service';
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
import { useAuth } from '../../context/AuthContext';

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

export default function DashboardPage() {
  const [stats, setStats] = useState({
      revenue: 0,
      debt: 0,
      activeLeads: 0,
      upcomingInstallations: 0
  });
  const [chartData, setChartData] = useState([]);
  const [recentOrders, setRecentOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isReady, setIsReady] = useState(false); // Fix for Recharts width animation

  
  useEffect(() => {
    // Wait a tick for the DOM layout to settle before rendering chart
    const timer = setTimeout(() => setIsReady(true), 500);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
        // Parallel Fetch
        const [ordersRes, leadsRes, apptsRes] = await Promise.all([
            FinanceService.getRecentOrders(50),
            CRMService.getAllLeads(),
            CRMService.getUpcomingAppointments(10)
        ]);

        // 1. Calculate Financial KPIs (Revenue & Debt)
        let revenue = 0;
        let debt = 0;
        let monthlySales = {}; // Map: "Jan" -> 12000

        // Initialize last 6 months in map
        const months = [];
        for (let i = 5; i >= 0; i--) {
            const d = new Date();
            d.setMonth(d.getMonth() - i);
            const key = d.toLocaleString('fr-FR', { month: 'short' });
            monthlySales[key] = 0;
            months.push(key);
        }

        if (ordersRes.success) {
            setRecentOrders(ordersRes.data.slice(0, 5)); // Take top 5 for widget

            ordersRes.data.forEach(order => {
                // Revenue (Paid + Partial)
                if (order.status === 'paid' || order.status === 'partial_payment' || order.status === 'installed') {
                     revenue += Number(order.amountPaid) || 0;
                }
                
                // Debt (Remaining on active orders)
                if (order.status !== 'cancelled' && order.status !== 'closed') {
                    const total = Number(order.total) || 0;
                    const paid = Number(order.amountPaid) || 0;
                    debt += Math.max(0, total - paid);
                }

                // Chart Data (Based on createdAt)
                if (order.createdAt?.seconds) {
                    const date = new Date(order.createdAt.seconds * 1000);
                    const key = date.toLocaleString('fr-FR', { month: 'short' });
                    if (monthlySales[key] !== undefined) {
                        monthlySales[key] += Number(order.total) || 0;
                    }
                }
            });
        }

        // 2. Leads KPI
        let activeLeadsCount = 0;
        if (leadsRes.success) {
            activeLeadsCount = leadsRes.data.filter(l => l.status === 'new' || l.status === 'contacted').length;
        }

        // 3. Upcoming Installations
        let nextInstallationsCount = 0;
        if (apptsRes.success) {
            // Count upcoming 'installations'
            nextInstallationsCount = apptsRes.data.filter(a => a.type === 'installation').length;
        }

        setStats({
            revenue,
            debt,
            activeLeads: activeLeadsCount,
            upcomingInstallations: nextInstallationsCount
        });

        // Format Chart Data
        setChartData(months.map(m => ({ name: m, sales: monthlySales[m] })));

    } catch (error) {
        console.error("Dashboard Error:", error);
        toast.error("Erreur chargement dashboard");
    } finally {
        setLoading(false);
    }
  };

  if (loading) return <div className="p-12 text-center text-[#d4af37]">Chargement du tableau de bord...</div>;

  return (
    <div className="space-y-6">
       <div className="flex justify-between items-center">
            <h1 className="text-3xl font-bold font-heading text-white">Tableau de Bord</h1>
            <p className="text-gray-400 text-sm">Vue d'ensemble <span className="text-[#d4af37]">• {new Date().toLocaleDateString()}</span></p>
       </div>

       {/* KPI Cards */}
       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatCard 
                title="Chiffre d'Affaires" 
                value={formatCurrency(stats.revenue)} 
                subtext="Encaissements validés (Mois)" 
                icon={TrendingUp} 
                color="green" // Dynamic color prop mapping is simple here
            />
            <StatCard 
                title="Reste à Payer (Dette)" 
                value={formatCurrency(stats.debt)} 
                subtext="En attente de paiement" 
                icon={DollarSign} 
                color="red"
            />
             <StatCard 
                title="Leads Actifs" 
                value={stats.activeLeads} 
                subtext="Nouveaux & Contactés" 
                icon={Users} 
                color="blue" 
            />
            <StatCard 
                title="Installations" 
                value={stats.upcomingInstallations} 
                subtext="7 prochains jours" 
                icon={Calendar} 
                color="yellow" 
            />
       </div>

       {/* Charts & Graphs */}
       <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
            <h3 className="text-lg font-bold text-white mb-6">Évolution des Ventes (6 mois)</h3>
            <div style={{ width: '100%', height: 300, minHeight: 300 }}>
                {/* Recharts fix: Wait for layout to be ready (width calculated) */}
                {isReady && chartData.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
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
                    </ResponsiveContainer>
                ) : (
                    <div className="flex h-full items-center justify-center text-gray-500">
                        Chargement des données...
                    </div>
                )}
            </div>
       </div>

       {/* Bottom Widgets */}
       <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
           
           {/* Recent Orders */}
           <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden flex flex-col">
                <div className="p-6 border-b border-zinc-800 flex justify-between items-center">
                    <h3 className="font-bold text-white flex items-center gap-2"><Briefcase size={18} className="text-[#d4af37]"/> Dernières Commandes</h3>
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
                                <tr><td colSpan="3" className="p-6 text-center">Aucune commande récente</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
           </div>

           {/* Alerts */}
           <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden flex flex-col">
                <div className="p-6 border-b border-zinc-800 flex justify-between items-center">
                    <h3 className="font-bold text-white flex items-center gap-2"><Bell size={18} className="text-[#d4af37]"/> Alertes Opérationnelles</h3>
                </div>
                <div className="flex-1 p-6 space-y-4">
                     {/* Mock Logic for Alerts - ideally computed from real data */}
                     {stats.activeLeads > 5 && (
                         <div className="flex items-start gap-3 p-3 rounded-lg bg-orange-500/10 border border-orange-500/20">
                             <AlertTriangle className="text-orange-500 shrink-0" size={20} />
                             <div>
                                 <p className="text-orange-500 text-sm font-bold">{stats.activeLeads} Nouveaux Leads</p>
                                 <p className="text-gray-400 text-xs">Ces prospects attendent d'être contactés.</p>
                             </div>
                         </div>
                     )}
                     
                     <div className="flex items-start gap-3 p-3 rounded-lg bg-blue-500/10 border border-blue-500/20">
                          <Calendar className="text-blue-500 shrink-0" size={20} />
                          <div>
                              <p className="text-blue-500 text-sm font-bold">Planning Hebdo</p>
                              <p className="text-gray-400 text-xs">{stats.upcomingInstallations} installations prévues cette semaine.</p>
                          </div>
                     </div>

                     <div className="flex items-start gap-3 p-3 rounded-lg bg-zinc-800 border border-zinc-700">
                          <div className="h-2 w-2 rounded-full bg-green-500 mt-2"></div>
                          <p className="text-gray-400 text-sm">Système opérationnel. Aucune alerte critique.</p>
                     </div>
                </div>
           </div>

       </div>
    </div>
  );
}
