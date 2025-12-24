import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FinanceService } from '../../../services/finance.service';
import { ROUTES, ORDER_STATUS } from '../../../config/constants';
import { Search, Filter, ArrowRight, DollarSign } from 'lucide-react';
import toast from 'react-hot-toast';

export default function OrderListPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
    setLoading(true);
    // Ideally we would have a specific getAllOrders or getOrdersByStatus
    // Reusing getRecentOrders for now as it fetches ordered by date
    // Or implementing a new method in Service if needed.
    // Let's use getRecentOrders(100) for now.
    const res = await FinanceService.getRecentOrders(100);
    if (res.success) {
      setOrders(res.data);
    } else {
      toast.error("Erreur chargement commandes");
    }
    setLoading(false);
  };

  const filteredOrders = orders.filter(order => {
     const matchesSearch = 
        order.clientName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.id?.toLowerCase().includes(searchTerm.toLowerCase());
     
     if (!matchesSearch) return false;

     if (filterStatus === 'all') return true;
     if (filterStatus === 'unpaid') return order.status === 'pending_payment' || order.status === 'partial_payment';
     if (filterStatus === 'paid') return order.status === 'paid';
     if (filterStatus === 'active') return order.status !== 'cancelled' && order.status !== 'closed';
     
     return order.status === filterStatus;
  });

  const getStatusBadge = (status) => {
      const styles = {
          pending_payment: 'bg-red-500/10 text-red-500 border-red-500/20',
          partial_payment: 'bg-orange-500/10 text-orange-500 border-orange-500/20',
          paid: 'bg-green-500/10 text-green-500 border-green-500/20',
          production: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
          installed: 'bg-purple-500/10 text-purple-500 border-purple-500/20',
          cancelled: 'bg-zinc-800 text-gray-500 border-zinc-700'
      };
      return styles[status] || 'bg-zinc-800 text-gray-400';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold font-heading text-white">Gestion des Commandes</h1>
          <p className="text-gray-400 text-sm">{orders.length} commandes enregistrées</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4 bg-zinc-900 p-4 rounded-xl border border-zinc-800">
         <div className="relative flex-1">
            <Search className="absolute left-3 top-3 text-gray-500" size={20} />
            <input 
              type="text" 
              placeholder="Rechercher par client ou ID..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-zinc-950 border border-zinc-800 rounded-lg pl-10 pr-4 py-2 text-white focus:border-[#d4af37] outline-none"
            />
         </div>
         <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0">
             {['all', 'unpaid', 'paid', 'active'].map(status => (
                 <button
                    key={status}
                    onClick={() => setFilterStatus(status)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition ${
                        filterStatus === status 
                        ? 'bg-[#d4af37] text-black' 
                        : 'bg-zinc-950 text-gray-400 hover:bg-zinc-800'
                    }`}
                 >
                    {status === 'all' ? 'Toutes' : 
                     status === 'unpaid' ? 'À Payer' :
                     status === 'paid' ? 'Payées' : 'En Cours'}
                 </button>
             ))}
         </div>
      </div>

      {/* Table */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
         <div className="overflow-x-auto">
             <table className="w-full text-left text-sm text-gray-400">
                 <thead className="bg-zinc-950 text-gray-500 uppercase tracking-wider">
                     <tr>
                         <th className="px-6 py-4 font-medium">Référence</th>
                         <th className="px-6 py-4 font-medium">Client</th>
                         <th className="px-6 py-4 font-medium">Date</th>
                         <th className="px-6 py-4 font-medium">Montant</th>
                         <th className="px-6 py-4 font-medium">Reste dû</th>
                         <th className="px-6 py-4 font-medium">Statut</th>
                         <th className="px-6 py-4 font-medium text-right">Action</th>
                     </tr>
                 </thead>
                 <tbody className="divide-y divide-zinc-800">
                     {loading ? (
                         <tr><td colSpan="7" className="p-8 text-center text-[#d4af37]">Chargement...</td></tr>
                     ) : filteredOrders.length === 0 ? (
                         <tr><td colSpan="7" className="p-8 text-center">Aucune commande trouvée.</td></tr>
                     ) : (
                         filteredOrders.map(order => {
                             const total = Number(order.total) || 0;
                             const paid = Number(order.amountPaid) || 0;
                             const remaining = total - paid;

                             return (
                                <tr 
                                    key={order.id} 
                                    onClick={() => navigate(`/admin/orders/${order.id}`)}
                                    className="hover:bg-zinc-800/50 cursor-pointer transition"
                                >
                                    <td className="px-6 py-4 font-mono text-xs">{order.id.substring(0,8)}...</td>
                                    <td className="px-6 py-4 font-bold text-white">{order.clientName}</td>
                                    <td className="px-6 py-4">{new Date(order.createdAt?.seconds * 1000).toLocaleDateString()}</td>
                                    <td className="px-6 py-4 font-medium">{total.toLocaleString()} ₪</td>
                                    <td className={`px-6 py-4 font-bold ${remaining > 0 ? 'text-red-500' : 'text-green-500'}`}>
                                        {remaining > 0 ? remaining.toLocaleString() + ' ₪' : 'Soldé'}
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`px-3 py-1 rounded-full text-xs font-bold border ${getStatusBadge(order.status)}`}>
                                            {order.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <ArrowRight size={18} className="ml-auto text-gray-500 hover:text-[#d4af37]" />
                                    </td>
                                </tr>
                             );
                         })
                     )}
                 </tbody>
             </table>
         </div>
      </div>
    </div>
  );
}
