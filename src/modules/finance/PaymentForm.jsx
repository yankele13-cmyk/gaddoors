import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { financeService } from '../../services/finance.service';
import { ordersService } from '../../services/orders.service';
import { X, CreditCard, Banknote, Landmark } from 'lucide-react';
import toast from 'react-hot-toast';

export default function PaymentForm({ onClose, fixedOrderId, onSuccess }) {
  const { register, handleSubmit, watch, setValue } = useForm({
    defaultValues: {
      type: 'bit', // bit, check, cash, transfer
      amount: '',
      date: new Date().toISOString().split('T')[0],
      orderId: fixedOrderId || '',
      checkDetails: {
        bankName: '',
        branch: '',
        checkNumber: '',
        depositDate: ''
      }
    }
  });

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const paymentType = watch('type');

  useEffect(() => {
    if (!fixedOrderId) {
        loadOrders();
    }
  }, []);

  const loadOrders = async () => {
    const data = await ordersService.getAll();
    // Filter only unpaid orders ideally, but list all for now
    setOrders(data);
  };

  const onSubmit = async (data) => {
    setLoading(true);
    try {
        const payload = {
            ...data,
            status: data.type === 'check' ? 'deferred' : 'cleared'
        };
        await financeService.addPayment(payload);
        toast.success("Paiement enregistré");
        if(onSuccess) onSuccess();
        onClose();
    } catch (e) {
        console.error(e);
        toast.error("Erreur enregistrement");
    } finally {
        setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl w-full max-w-md">
        <div className="p-4 border-b border-zinc-800 bg-zinc-950 rounded-t-xl flex justify-between items-center">
            <h3 className="font-bold text-white">Nouveau Paiement</h3>
            <button onClick={onClose}><X className="text-gray-400 hover:text-white" /></button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4">
            {/* Order Select */}
            {!fixedOrderId && (
                <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Commande à créditer</label>
                    <select 
                        {...register('orderId', { required: true })}
                        className="w-full bg-zinc-800 border border-zinc-700 rounded p-2 text-white outline-none"
                    >
                        <option value="">Choisir une commande...</option>
                        {orders.map(o => (
                            <option key={o.id} value={o.id}>
                                {o.humanId} - {o.clientSnapshot?.name} ({o.financials?.balanceDue}₪ restants)
                            </option>
                        ))}
                    </select>
                </div>
            )}

            {/* Type & Amount */}
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Type</label>
                    <select 
                        {...register('type')}
                        className="w-full bg-zinc-800 border border-zinc-700 rounded p-2 text-white outline-none"
                    >
                        <option value="bit">Bit / PayBox</option>
                        <option value="check">Chèque</option>
                        <option value="cash">Espèces</option>
                        <option value="transfer">Virement</option>
                    </select>
                </div>
                <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Montant (₪)</label>
                    <input 
                        type="number"
                        {...register('amount', { required: true, min: 1 })}
                        className="w-full bg-zinc-800 border border-zinc-700 rounded p-2 text-white outline-none font-mono text-right"
                    />
                </div>
            </div>

            {/* Date */}
            <div>
                 <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Date du Paiement</label>
                 <input 
                    type="date"
                    {...register('date')}
                    className="w-full bg-zinc-800 border border-zinc-700 rounded p-2 text-white outline-none"
                />
            </div>

            {/* CHECK SPECIFIC FIELDS */}
            {paymentType === 'check' && (
                <div className="bg-zinc-950 p-4 rounded border border-zinc-800 space-y-3">
                    <div className="flex items-center gap-2 text-[#d4af37] text-xs font-bold uppercase border-b border-zinc-800 pb-2 mb-2">
                        <Landmark size={14} /> Détails du Chèque
                    </div>
                    
                    <div className="grid grid-cols-2 gap-3">
                        <input 
                            placeholder="Banque"
                            {...register('checkDetails.bankName')}
                            className="bg-zinc-900 border border-zinc-800 rounded p-2 text-xs text-white"
                        />
                         <input 
                            placeholder="Branche (Snif)"
                            {...register('checkDetails.branch')}
                            className="bg-zinc-900 border border-zinc-800 rounded p-2 text-xs text-white"
                        />
                    </div>
                    <input 
                        placeholder="Numéro de Chèque"
                        {...register('checkDetails.checkNumber')}
                        className="w-full bg-zinc-900 border border-zinc-800 rounded p-2 text-xs text-white font-mono"
                    />
                    <div>
                        <label className="block text-[10px] text-gray-500 uppercase mb-1">Date d'encaissement (Piraon)</label>
                        <input 
                            type="date"
                            {...register('checkDetails.depositDate', { required: paymentType === 'check' })}
                            className="w-full bg-zinc-900 border border-zinc-800 rounded p-2 text-xs text-white"
                        />
                    </div>
                </div>
            )}

            <button 
                type="submit"
                disabled={loading} 
                className="w-full bg-[#d4af37] text-black font-bold py-3 rounded-lg hover:bg-yellow-500 mt-4 disabled:opacity-50"
            >
                {loading ? 'Traitement...' : 'Enregistrer Paiement'}
            </button>
        </form>
      </div>
    </div>
  );
}
