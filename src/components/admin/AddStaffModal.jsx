import { useState } from 'react';
import { X, Save, User, Mail, Phone, Shield } from 'lucide-react';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../config/firebase';
import toast from 'react-hot-toast';
import { USER_ROLES } from '../../config/constants';

export default function AddStaffModal({ onClose, onAdded }) {
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        displayName: '',
        email: '',
        phone: '',
        role: 'worker' // Default role
    });

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.displayName || !formData.email) return toast.error("Nom et Email requis");

        setLoading(true);
        try {
            // Generate a Ghost ID (Cannot use Auth UID yet)
            const ghostUid = `staff_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
            
            await setDoc(doc(db, 'users', ghostUid), {
                ...formData,
                uid: ghostUid,
                createdAt: serverTimestamp(),
                photoURL: null,
                isGhost: true, // Marker for "Invited/Managed" user
                balance: 0,
                installationsCount: 0
            });

            toast.success("Membre ajouté !");
            onAdded(); // Refresh list
            onClose();
        } catch (error) {
            console.error(error);
            toast.error("Erreur lors de la création");
        }
        setLoading(false);
    };

    return (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
            <div className="bg-zinc-900 border border-zinc-700 rounded-xl w-full max-w-md shadow-2xl animate-fadeIn">
                <div className="p-6 border-b border-zinc-800 flex justify-between items-center bg-zinc-950 rounded-t-xl">
                    <h2 className="text-xl font-bold text-white flex items-center gap-2">
                        <User className="text-[#d4af37]" /> Nouveau Membre
                    </h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-white transition">
                        <X size={20} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    <div className="space-y-2">
                        <label className="text-xs uppercase font-bold text-gray-500">Nom complet</label>
                        <div className="relative">
                            <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={16}/>
                            <input 
                                type="text"
                                value={formData.displayName}
                                onChange={e => setFormData({...formData, displayName: e.target.value})}
                                className="w-full bg-zinc-950 border border-zinc-800 rounded p-3 pl-10 text-white focus:border-[#d4af37] outline-none"
                                placeholder="Ex: David Cohen"
                                autoFocus
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-xs uppercase font-bold text-gray-500">Email (Connexion future)</label>
                        <div className="relative">
                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={16}/>
                            <input 
                                type="email"
                                value={formData.email}
                                onChange={e => setFormData({...formData, email: e.target.value})}
                                className="w-full bg-zinc-950 border border-zinc-800 rounded p-3 pl-10 text-white focus:border-[#d4af37] outline-none"
                                placeholder="david@gaddoors.com"
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-xs uppercase font-bold text-gray-500">Téléphone</label>
                        <div className="relative">
                            <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={16}/>
                            <input 
                                type="tel"
                                value={formData.phone}
                                onChange={e => setFormData({...formData, phone: e.target.value})}
                                className="w-full bg-zinc-950 border border-zinc-800 rounded p-3 pl-10 text-white focus:border-[#d4af37] outline-none"
                                placeholder="050..."
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-xs uppercase font-bold text-gray-500">Rôle</label>
                        <div className="relative">
                            <Shield className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={16}/>
                            <select 
                                value={formData.role}
                                onChange={e => setFormData({...formData, role: e.target.value})}
                                className="w-full bg-zinc-950 border border-zinc-800 rounded p-3 pl-10 text-white focus:border-[#d4af37] outline-none appearance-none"
                            >
                                <option value="viewer">Viewer (Accès lecture seule)</option>
                                <option value="worker">Ouvrier / Installateur</option>
                                <option value="commercial">Commercial</option>
                                <option value="admin">Admin</option>
                            </select>
                        </div>
                    </div>

                    <div className="pt-4">
                        <button 
                            type="submit" 
                            disabled={loading}
                            className="w-full bg-[#d4af37] hover:bg-[#b5952f] text-black font-bold py-3 rounded flex justify-center items-center gap-2 transition"
                        >
                            {loading ? 'Création...' : <><Save size={18}/> Créer la fiche</>}
                        </button>
                        <p className="text-center text-[10px] text-gray-600 mt-2">
                            * Ce membre ne pourra pas se connecter tant qu'il ne s'inscrit pas avec cet email.
                        </p>
                    </div>
                </form>
            </div>
        </div>
    );
}
