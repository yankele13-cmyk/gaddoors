import { useForm } from 'react-hook-form';
import { X, Save, User, MapPin, Phone, Mail } from 'lucide-react';
import { CRMService } from '../../../../services/crm.service';
import toast from 'react-hot-toast';

import { useEffect } from 'react'; // Added useEffect

export default function LeadModal({ isOpen, onClose, onSuccess, initialData }) { // Added initialData
  const { register, handleSubmit, reset, formState: { errors } } = useForm();

  // Reset form when modal opens or initialData changes
  useEffect(() => {
    if (isOpen && initialData) {
      reset(initialData);
    } else if (isOpen) {
      reset({}); // Reset to empty if no data
    }
  }, [isOpen, initialData, reset]);

  const onSubmit = async (data) => {
    const res = await CRMService.createLead(data);
    if (res.success) {
      toast.success("Prospect créé !");
      reset();
      onSuccess();
      onClose();
    } else {
      toast.error("Erreur création prospect");
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl w-full max-w-md shadow-2xl">
        <div className="p-6 border-b border-zinc-800 flex justify-between items-center bg-zinc-950 rounded-t-xl">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <User className="text-[#d4af37]" /> Nouveau Prospect
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white">
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Nom Complet</label>
            <input 
              {...register("name", { required: true })} 
              className="w-full bg-zinc-950 border border-zinc-800 rounded p-2 text-white focus:border-[#d4af37] outline-none"
              placeholder="Ex: David Levi"
            />
            {errors.name && <span className="text-red-500 text-xs">Requis</span>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Téléphone</label>
              <input 
                {...register("phone", { required: true })} 
                className="w-full bg-zinc-950 border border-zinc-800 rounded p-2 text-white focus:border-[#d4af37] outline-none"
                placeholder="050..."
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Email</label>
              <input 
                {...register("email")} 
                className="w-full bg-zinc-950 border border-zinc-800 rounded p-2 text-white focus:border-[#d4af37] outline-none"
                placeholder="@gmail.com"
              />
            </div>
          </div>

          <div>
             <label className="block text-xs font-medium text-gray-500 mb-1">Ville</label>
             <input 
               {...register("city", { required: true })} 
               className="w-full bg-zinc-950 border border-zinc-800 rounded p-2 text-white focus:border-[#d4af37] outline-none"
               placeholder="Tel Aviv"
             />
          </div>

          <div>
             <label className="block text-xs font-medium text-gray-500 mb-1">Adresse</label>
             <input 
               {...register("address")} 
               className="w-full bg-zinc-950 border border-zinc-800 rounded p-2 text-white focus:border-[#d4af37] outline-none"
               placeholder="Rue, Numéro..."
             />
          </div>
          
          <div>
             <label className="block text-xs font-medium text-gray-500 mb-1">Source</label>
             <select {...register("source")} className="w-full bg-zinc-950 border border-zinc-800 rounded p-2 text-white focus:border-[#d4af37] outline-none">
                <option value="web">Site Web</option>
                <option value="phone">Téléphone</option>
                <option value="referral">Recommandation</option>
                <option value="social">Réseaux Sociaux</option>
             </select>
          </div>

          <button type="submit" className="w-full bg-[#d4af37] hover:bg-yellow-500 text-black font-bold py-3 rounded flex items-center justify-center gap-2 mt-4 transition">
            <Save size={18} /> Créer le Prospect
          </button>
        </form>
      </div>
    </div>
  );
}
