import { useForm } from 'react-hook-form';
import { X, Check, CreditCard, Banknote, Smartphone, Landmark } from 'lucide-react';
import toast from 'react-hot-toast';

export default function PaymentModal({ isOpen, onClose, onSubmit, remainingAmount }) {
  const { register, handleSubmit, watch, formState: { errors }, reset } = useForm({
    defaultValues: {
      amount: remainingAmount || 0,
      type: 'transfer',
      currrency: 'ILS'
    }
  });

  const paymentType = watch('type');

  const onFormSubmit = (data) => {
    // Basic validation logic wrapper
    onSubmit(data);
    reset();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl w-full max-w-md shadow-2xl">
        
        {/* Header */}
        <div className="p-6 border-b border-zinc-800 flex justify-between items-center bg-zinc-950 rounded-t-xl">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <CreditCard className="text-[#d4af37]" /> Encaisser un Paiement
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors">
            <X size={24} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit(onFormSubmit)} className="p-6 space-y-6">
            
            {/* Amount */}
            <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Montant (₪)</label>
                <div className="relative">
                    <span className="absolute left-3 top-2.5 text-gray-400">₪</span>
                    <input 
                        type="number"
                        step="0.01"
                        {...register("amount", { required: true, min: 0.1 })}
                        className="w-full bg-zinc-950 border border-zinc-800 rounded-lg py-2 pl-8 pr-4 text-white font-bold text-lg focus:border-[#d4af37] outline-none"
                    />
                </div>
                {errors.amount && <span className="text-red-500 text-xs">Montant requis</span>}
            </div>

            {/* Payment Type Grid */}
            <div>
                <label className="block text-xs font-medium text-gray-500 mb-2">Moyen de Paiement</label>
                <div className="grid grid-cols-3 gap-2">
                    <label className={`cursor-pointer border rounded-lg p-2 flex flex-col items-center justify-center gap-1 transition-all ${paymentType === 'transfer' ? 'bg-[#d4af37]/10 border-[#d4af37] text-[#d4af37]' : 'border-zinc-800 hover:bg-zinc-800 text-gray-400'}`}>
                        <input type="radio" value="transfer" {...register("type")} className="hidden"/>
                        <Landmark size={20} />
                        <span className="text-xs font-medium">Virement</span>
                    </label>
                    <label className={`cursor-pointer border rounded-lg p-2 flex flex-col items-center justify-center gap-1 transition-all ${paymentType === 'check' ? 'bg-[#d4af37]/10 border-[#d4af37] text-[#d4af37]' : 'border-zinc-800 hover:bg-zinc-800 text-gray-400'}`}>
                        <input type="radio" value="check" {...register("type")} className="hidden"/>
                        <Banknote size={20} />
                        <span className="text-xs font-medium">Chèque</span>
                    </label>
                    <label className={`cursor-pointer border rounded-lg p-2 flex flex-col items-center justify-center gap-1 transition-all ${paymentType === 'bit' ? 'bg-[#d4af37]/10 border-[#d4af37] text-[#d4af37]' : 'border-zinc-800 hover:bg-zinc-800 text-gray-400'}`}>
                        <input type="radio" value="bit" {...register("type")} className="hidden"/>
                        <Smartphone size={20} />
                        <span className="text-xs font-medium">Bit / App</span>
                    </label>
                    <label className={`cursor-pointer border rounded-lg p-2 flex flex-col items-center justify-center gap-1 transition-all ${paymentType === 'cash' ? 'bg-[#d4af37]/10 border-[#d4af37] text-[#d4af37]' : 'border-zinc-800 hover:bg-zinc-800 text-gray-400'}`}>
                        <input type="radio" value="cash" {...register("type")} className="hidden"/>
                        <Banknote size={20} />
                        <span className="text-xs font-medium">Espèces</span>
                    </label>
                    <label className={`cursor-pointer border rounded-lg p-2 flex flex-col items-center justify-center gap-1 transition-all ${paymentType === 'card' ? 'bg-[#d4af37]/10 border-[#d4af37] text-[#d4af37]' : 'border-zinc-800 hover:bg-zinc-800 text-gray-400'}`}>
                        <input type="radio" value="card" {...register("type")} className="hidden"/>
                        <CreditCard size={20} />
                        <span className="text-xs font-medium">Carte</span>
                    </label>
                </div>
            </div>

            {/* Dynamic Fields */}
            <div className="bg-zinc-950/50 rounded-lg p-4 border border-zinc-800/50 space-y-4">
                 
                 <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">Date du paiement (Valeur)</label>
                    <input 
                        type="date"
                        {...register("date", { required: true })}
                        className="w-full bg-zinc-900 border border-zinc-700 rounded p-2 text-white outline-none"
                    />
                 </div>

                 {(paymentType === 'transfer' || paymentType === 'bit' || paymentType === 'check') && (
                    <div>
                        <label className="block text-xs font-medium text-gray-500 mb-1">
                            {paymentType === 'check' ? 'Numéro du chèque' : 'Référence / Asmachta'}
                        </label>
                        <input 
                            {...register("reference")}
                            className="w-full bg-zinc-900 border border-zinc-700 rounded p-2 text-white outline-none"
                            placeholder="ex: 123456"
                        />
                    </div>
                 )}

                 {paymentType === 'check' && (
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-medium text-gray-500 mb-1">Banque</label>
                            <input 
                                {...register("bankName", { required: true })}
                                className="w-full bg-zinc-900 border border-zinc-700 rounded p-2 text-white outline-none"
                                placeholder="Leumi, Poalim..."
                            />
                            {errors.bankName && <span className="text-red-500 text-xs">Requis</span>}
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-gray-500 mb-1">Date d'encaissement</label>
                            <input 
                                type="date"
                                {...register("dueDate", { required: true })}
                                className="w-full bg-zinc-900 border border-zinc-700 rounded p-2 text-white outline-none"
                            />
                            {errors.dueDate && <span className="text-red-500 text-xs">Requis</span>}
                        </div>
                    </div>
                 )}
            </div>

            <button type="submit" className="w-full bg-[#d4af37] hover:bg-yellow-500 text-black font-bold py-3 rounded-lg transition shadow-lg flex justify-center items-center gap-2">
                <Check size={18} /> Valider le Paiement
            </button>

        </form>
      </div>
    </div>
  );
}
