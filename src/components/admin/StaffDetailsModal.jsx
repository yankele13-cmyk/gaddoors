
import { useState, useEffect } from 'react';
import { X, Save, DollarSign, Calendar, MapPin, Briefcase, Plus, Minus, History } from 'lucide-react';
import { doc, updateDoc, arrayUnion, Timestamp } from 'firebase/firestore';
import { db } from "../../config/firebase";
import toast from 'react-hot-toast';

export default function StaffDetailsModal({ user, onClose, onUpdate }) {
    const [activeTab, setActiveTab] = useState('profil');
    const [loading, setLoading] = useState(false);
    
    // Form State
    const [formData, setFormData] = useState({
        address: user.address || '',
        startDate: user.startDate ? new Date(user.startDate.seconds * 1000).toISOString().split('T')[0] : '',
        installationsCount: user.installationsCount || 0,
        balance: user.balance || 0
    });

    // Finance State
    const [amountInput, setAmountInput] = useState('');
    const [transactionReason, setTransactionReason] = useState('');

    const handleSaveProfile = async () => {
        setLoading(true);
        try {
            const updates = {
                address: formData.address,
                installationsCount: parseInt(formData.installationsCount),
            };
            
            if (formData.startDate) {
                updates.startDate = Timestamp.fromDate(new Date(formData.startDate));
            }

            await updateDoc(doc(db, 'users', user.uid), updates);
            toast.success("Profil mis à jour");
            onUpdate(); // Refresh parent
        } catch (e) {
            console.error(e);
            toast.error("Erreur sauvegarde");
        }
        setLoading(false);
    };

    const handleFinanceTransaction = async (type) => {
        if (!amountInput || isNaN(amountInput)) return toast.error("Montant invalide");
        
        setLoading(true);
        const amount = parseFloat(amountInput);
        const newBalance = type === 'add' ? (formData.balance + amount) : (formData.balance - amount);
        
        try {
            await updateDoc(doc(db, 'users', user.uid), {
                balance: newBalance,
                transactions: arrayUnion({
                    amount: amount,
                    type: type, // 'add' (Owed to installer) or 'subtract' (Paid to installer)
                    reason: transactionReason || (type === 'add' ? 'Prestation' : 'Paiement'),
                    date: Timestamp.now()
                })
            });
            
            setFormData(prev => ({ ...prev, balance: newBalance }));
            setAmountInput('');
            setTransactionReason('');
            toast.success("Solde mis à jour");
            onUpdate();
        } catch (e) {
            console.error(e);
            toast.error("Erreur transaction");
        }
        setLoading(false);
    };

    return (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
            <div className="bg-zinc-900 border border-zinc-700 rounded-xl w-full max-w-2xl flex flex-col max-h-[90vh] shadow-2xl">
                
                {/* Header */}
                <div className="p-6 border-b border-zinc-800 flex justify-between items-center bg-zinc-950 rounded-t-xl">
                    <div className="flex items-center gap-4">
                        {user.photoURL ? (
                             <img src={user.photoURL} className="w-16 h-16 rounded-full border-2 border-[#d4af37]" alt="" />
                        ) : (
                             <div className="w-16 h-16 rounded-full bg-zinc-800 flex items-center justify-center border border-zinc-700">
                                 <Briefcase size={24} className="text-gray-400"/>
                             </div>
                        )}
                        <div>
                            <h2 className="text-2xl font-bold text-white">{user.displayName}</h2>
                            <span className="text-sm text-[#d4af37] border border-[#d4af37]/30 px-2 py-0.5 rounded uppercase font-bold text-[10px] tracking-wider">
                                {user.role}
                            </span>
                        </div>
                    </div>
                    <button onClick={onClose} className="text-gray-400 hover:text-white transition bg-zinc-800 p-2 rounded-full hover:bg-zinc-700">
                        <X size={20} />
                    </button>
                </div>

                {/* Tabs */}
                <div className="flex border-b border-zinc-800 bg-zinc-900/50">
                    <button 
                        onClick={() => setActiveTab('profil')}
                        className={`flex-1 py-4 text-sm font-bold uppercase tracking-wider transition ${activeTab === 'profil' ? 'text-[#d4af37] border-b-2 border-[#d4af37] bg-white/5' : 'text-gray-500 hover:text-gray-300'}`}
                    >
                        Profil & Infos
                    </button>
                    <button 
                        onClick={() => setActiveTab('finance')}
                        className={`flex-1 py-4 text-sm font-bold uppercase tracking-wider transition ${activeTab === 'finance' ? 'text-green-500 border-b-2 border-green-500 bg-white/5' : 'text-gray-500 hover:text-gray-300'}`}
                    >
                        Finance & Solde
                    </button>
                    <button 
                        onClick={() => setActiveTab('activity')}
                        className={`flex-1 py-4 text-sm font-bold uppercase tracking-wider transition ${activeTab === 'activity' ? 'text-blue-500 border-b-2 border-blue-500 bg-white/5' : 'text-gray-500 hover:text-gray-300'}`}
                    >
                        Activité
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6 space-y-6">
                    
                    {activeTab === 'profil' && (
                        <div className="space-y-4 animate-fadeIn">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-gray-400 text-xs uppercase font-bold flex items-center gap-2"><MapPin size={14}/> Adresse</label>
                                    <input 
                                        type="text" 
                                        value={formData.address}
                                        onChange={(e) => setFormData({...formData, address: e.target.value})}
                                        className="w-full bg-zinc-950 border border-zinc-800 rounded p-3 text-white focus:border-[#d4af37] outline-none"
                                        placeholder="Ex: 12 Rue des Lilas, Tel Aviv"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-gray-400 text-xs uppercase font-bold flex items-center gap-2"><Calendar size={14}/> Date de début</label>
                                    <input 
                                        type="date" 
                                        value={formData.startDate}
                                        onChange={(e) => setFormData({...formData, startDate: e.target.value})}
                                        className="w-full bg-zinc-950 border border-zinc-800 rounded p-3 text-white focus:border-[#d4af37] outline-none"
                                    />
                                </div>
                            </div>
                            
                            <div className="pt-4 flex justify-end">
                                <button 
                                    onClick={handleSaveProfile}
                                    disabled={loading}
                                    className="bg-[#d4af37] hover:bg-[#b5952f] text-black font-bold py-2 px-6 rounded flex items-center gap-2 transition"
                                >
                                    <Save size={18} /> Enregistrer
                                </button>
                            </div>
                        </div>
                    )}

                    {activeTab === 'finance' && (
                        <div className="space-y-6 animate-fadeIn">
                            {/* Balance Card */}
                            <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-6 text-center relative overflow-hidden">
                                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-green-500 to-transparent opacity-50"></div>
                                <h3 className="text-gray-400 text-sm uppercase font-bold tracking-widest mb-2">Solde à Payer</h3>
                                <div className={`text-5xl font-bold font-heading ${formData.balance > 0 ? 'text-green-500' : 'text-gray-300'}`}>
                                    {formData.balance.toLocaleString()} ₪
                                </div>
                                <p className="text-xs text-gray-500 mt-2">Montant que l'entreprise doit à ce membre</p>
                            </div>

                            {/* Action Bar */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-gray-400 text-xs">Montant (₪)</label>
                                    <input 
                                        type="number" 
                                        value={amountInput}
                                        onChange={(e) => setAmountInput(e.target.value)}
                                        className="w-full bg-zinc-950 border border-zinc-800 rounded p-3 text-white font-mono text-lg focus:border-green-500 outline-none"
                                        placeholder="0.00"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-gray-400 text-xs">Motif (Optionnel)</label>
                                    <input 
                                        type="text" 
                                        value={transactionReason}
                                        onChange={(e) => setTransactionReason(e.target.value)}
                                        className="w-full bg-zinc-950 border border-zinc-800 rounded p-3 text-white focus:border-green-500 outline-none"
                                        placeholder="Ex: Pose Porte Entrée..."
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <button 
                                    onClick={() => handleFinanceTransaction('add')}
                                    disabled={loading}
                                    className="bg-green-600/20 border border-green-600/50 hover:bg-green-600 hover:text-white text-green-500 py-3 rounded-lg font-bold flex justify-center items-center gap-2 transition"
                                >
                                    <Plus size={18}/> Ajouter Dette
                                </button>
                                <button 
                                    onClick={() => handleFinanceTransaction('subtract')}
                                    disabled={loading}
                                    className="bg-red-600/20 border border-red-600/50 hover:bg-red-600 hover:text-white text-red-500 py-3 rounded-lg font-bold flex justify-center items-center gap-2 transition"
                                >
                                    <Minus size={18}/> Enregistrer Paiement
                                </button>
                            </div>

                            {/* Mini History (Client side filtered just for viz if needed, or fetched) - For now simplified */}
                             {user.transactions && user.transactions.length > 0 && (
                                <div className="mt-8 border-t border-zinc-800 pt-4">
                                    <h4 className="text-gray-400 text-xs uppercase font-bold mb-3 flex items-center gap-2"><History size={14}/> Historique Récent</h4>
                                    <div className="space-y-2 max-h-40 overflow-y-auto pr-2 custom-scrollbar">
                                        {[...user.transactions].reverse().map((t, index) => (
                                            <div key={index} className="flex justify-between items-center text-sm p-2 bg-zinc-950 rounded hover:bg-zinc-800/50 transition">
                                                <div className="flex flex-col">
                                                    <span className="text-white font-medium">{t.reason}</span>
                                                    <span className="text-xs text-gray-500">{t.date?.seconds ? new Date(t.date.seconds * 1000).toLocaleDateString() : 'Date inconnue'}</span>
                                                </div>
                                                <span className={`font-mono font-bold ${t.type === 'add' ? 'text-green-500' : 'text-red-500'}`}>
                                                    {t.type === 'add' ? '+' : '-'}{t.amount} ₪
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                    
                     {activeTab === 'activity' && (
                        <div className="space-y-6 animate-fadeIn">
                             <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-6 flex items-center justify-between">
                                 <div>
                                     <h3 className="text-gray-400 text-sm uppercase font-bold">Installations Totales</h3>
                                     <p className="text-xs text-gray-500">Nombre de chantiers terminés</p>
                                 </div>
                                 <div className="flex items-center gap-4">
                                     <button onClick={() => setFormData(p => ({...p, installationsCount: Math.max(0, p.installationsCount - 1)}))} className="w-8 h-8 rounded bg-zinc-800 hover:bg-zinc-700 flex items-center justify-center text-white font-bold">-</button>
                                     <span className="text-3xl font-bold text-white w-12 text-center">{formData.installationsCount}</span>
                                     <button onClick={() => setFormData(p => ({...p, installationsCount: p.installationsCount + 1}))} className="w-8 h-8 rounded bg-zinc-800 hover:bg-zinc-700 flex items-center justify-center text-white font-bold">+</button>
                                 </div>
                             </div>
                             
                             <div className="flex justify-end">
                                <button 
                                    onClick={handleSaveProfile} 
                                    className="text-sm text-[#d4af37] hover:underline"
                                >
                                    Sauvegarder le compteur
                                </button>
                             </div>
                        </div>
                     )}
                </div>
            </div>
        </div>
    );
}
