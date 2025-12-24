import { useState, useEffect } from 'react';
import { ordersService } from '../../services/orders.service';
import QuoteBuilder from '../../modules/cpq/QuoteBuilder';
import { Plus, List, FileText } from 'lucide-react';

export default function OrdersPage() {
  const [viewMode, setViewMode] = useState('list'); // list | builder
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    if (viewMode === 'list') {
      loadOrders();
    }
  }, [viewMode]);

  const loadOrders = async () => {
    const data = await ordersService.getAll();
    setOrders(data);
  };

  return (
    <div className="h-full flex flex-col space-y-4">
      {/* Header */}
      <div className="flex justify-between items-center">
         <div>
            <h1 className="text-3xl font-bold font-heading text-white">Commandes & Devis</h1>
            <p className="text-gray-400">CPQ System</p>
         </div>
         <button 
            onClick={() => setViewMode(viewMode === 'list' ? 'builder' : 'list')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-bold transition ${
                viewMode === 'list' ? 'bg-[#d4af37] text-black hover:bg-yellow-500' : 'bg-zinc-800 text-white hover:bg-zinc-700'
            }`}
         >
            {viewMode === 'list' ? <><Plus size={20} /> Nouveau Devis</> : <><List size={20} /> Retour Liste</>}
         </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-hidden">
        {viewMode === 'builder' ? (
            <QuoteBuilder onSuccess={() => setViewMode('list')} />
        ) : (
            <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden h-full overflow-y-auto">
                <table className="w-full text-left">
                    <thead className="bg-zinc-950 text-gray-500 uppercase text-xs sticky top-0">
                        <tr>
                            <th className="p-4">Référence</th>
                            <th className="p-4">Client</th>
                            <th className="p-4">Date</th>
                            <th className="p-4 text-right">Montant TTC</th>
                            <th className="p-4">Statut</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-800">
                        {orders.length === 0 ? (
                            <tr><td colSpan="5" className="p-8 text-center text-gray-500">Aucune commande.</td></tr>
                        ) : orders.map(order => (
                            <tr key={order.id} className="hover:bg-zinc-800/50">
                                <td className="p-4 font-mono text-white text-sm">{order.humanId}</td>
                                <td className="p-4 text-gray-300">
                                    <div className="font-bold">{order.clientSnapshot?.name}</div>
                                    <div className="text-xs text-gray-500">{order.clientSnapshot?.phone}</div>
                                </td>
                                <td className="p-4 text-gray-400 text-sm">
                                    {order.createdAt?.seconds ? new Date(order.createdAt.seconds * 1000).toLocaleDateString() : '-'}
                                </td>
                                <td className="p-4 text-right font-mono text-[#d4af37]">
                                    {order.financials?.totalGt?.toLocaleString()} ₪
                                </td>
                                <td className="p-4">
                                    <span className="px-2 py-1 bg-zinc-800 border border-zinc-700 rounded text-xs text-gray-400 uppercase">
                                        {order.status}
                                    </span>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        )}
      </div>
    </div>
  );
}
