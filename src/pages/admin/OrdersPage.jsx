import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ordersService } from '../../services/orders.service';
import QuoteBuilder from '../../modules/cpq/QuoteBuilder';
import { Plus, List, FileText } from 'lucide-react';
import { useTranslation } from 'react-i18next'; // Added

export default function OrdersPage() {
  const { t } = useTranslation(); // Hook
  const [viewMode, setViewMode] = useState('list'); // list | builder
  const [orders, setOrders] = useState([]);
  const [lastDoc, setLastDoc] = useState(null);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (viewMode === 'list') {
      // If we switch back to list, maybe reload or keep state. 
      // For now, reload fresh if empty or just basic init.
       if(orders.length === 0) loadOrders();
    }
  }, [viewMode]);

  const loadOrders = async (isLoadMore = false) => {
    try {
      setLoading(true);
      const cursor = isLoadMore ? lastDoc : null;
      const { items, lastDoc: newLastDoc } = await ordersService.getPage(cursor);

      if (isLoadMore) {
        setOrders(prev => [...prev, ...items]);
      } else {
        setOrders(items);
      }

      setLastDoc(newLastDoc);
      if (items.length < 20) setHasMore(false);
      else setHasMore(true);

    } catch (error) {
       console.error(error);
    } finally {
       setLoading(false);
    }
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
                            <th className="p-4">{t('admin.orders.reference', 'Référence')}</th>
                            <th className="p-4">{t('admin.orders.client', 'Client')}</th>
                            <th className="p-4">{t('admin.orders.date', 'Date')}</th>
                            <th className="p-4 text-right">{t('admin.orders.amount', 'Montant TTC')}</th>
                            <th className="p-4">{t('admin.orders.status', 'Statut')}</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-800">
                        {orders.length === 0 ? (
                            <tr><td colSpan="5" className="p-8 text-center text-gray-500">{t('admin.dashboard.none', 'Aucune commande')}</td></tr>
                        ) : orders.map(order => (
                            <tr 
                                key={order.id} 
                                className="hover:bg-zinc-800/50 cursor-pointer transition"
                                onClick={() => navigate(`/admin/orders/${order.id}`)}
                            >
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
                                        {order.status ? t(`status.${order.status}`, order.status) : '-'}
                                    </span>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                
                {hasMore && viewMode === 'list' && (
                    <div className="p-4 border-t border-zinc-800 flex justify-center bg-zinc-950/50">
                        <button 
                            onClick={() => loadOrders(true)}
                            disabled={loading}
                            className="flex items-center gap-2 text-[#d4af37] hover:text-white transition disabled:opacity-50 font-medium text-sm"
                        >
                            {loading ? (
                                <span className="animate-pulse">Chargement...</span>
                            ) : (
                                <>
                                    <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full" />
                                    Voir plus
                                </>
                            )}
                        </button>
                    </div>
                )}
            </div>
        )}
      </div>
    </div>
  );
}
