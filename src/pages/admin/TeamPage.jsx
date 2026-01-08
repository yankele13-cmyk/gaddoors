import { useState, useEffect } from 'react';
import { userService } from '../../services/userService';
import { USER_ROLES } from '../../config/constants';
import { Users, Shield, UserCheck, Hammer, Eye, Phone, Mail, MessageCircle, Search, Save, Edit2, X } from 'lucide-react';
import toast from 'react-hot-toast';
import { doc, updateDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../config/firebase';

const RoleBadge = ({ role }) => {
    switch(role) {
        case USER_ROLES.ADMIN: 
            return <div className="flex items-center gap-1 text-red-500 bg-red-500/10 px-2 py-1 rounded text-xs font-bold border border-red-500/20"><Shield size={12}/> Admin</div>;
        case USER_ROLES.COMMERCIAL:
            return <div className="flex items-center gap-1 text-blue-500 bg-blue-500/10 px-2 py-1 rounded text-xs font-bold border border-blue-500/20"><UserCheck size={12}/> Commercial</div>;
        case USER_ROLES.INSTALLER:
            return <div className="flex items-center gap-1 text-orange-500 bg-orange-500/10 px-2 py-1 rounded text-xs font-bold border border-orange-500/20"><Hammer size={12}/> Installateur</div>;
        default:
            return <div className="flex items-center gap-1 text-gray-400 bg-zinc-800 px-2 py-1 rounded text-xs font-bold border border-zinc-700"><Eye size={12}/> Viewer</div>;
    }
};

import StaffDetailsModal from '../../components/admin/StaffDetailsModal';

const UserCard = ({ user, onRoleChange, onPhoneUpdate, onOpenDetails }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [phone, setPhone] = useState(user.phoneNumber || user.phone || '');

    const handleSavePhone = () => {
        onPhoneUpdate(user.uid, phone);
        setIsEditing(false);
    };

    return (
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 flex flex-col gap-4 hover:border-[#d4af37] transition group relative">
            
            {/* Header: Avatar & Role */}
            <div className="flex justify-between items-start">
                <div className="flex items-center gap-3">
                     {user.photoURL ? (
                        <img src={user.photoURL} className="w-12 h-12 rounded-full border-2 border-zinc-800 group-hover:border-[#d4af37] transition" alt="" />
                    ) : (
                        <div className="w-12 h-12 rounded-full bg-zinc-800 flex items-center justify-center text-gray-400 border border-zinc-700">
                            <Users size={20} />
                        </div>
                    )}
                    <div>
                        <div className="font-bold text-white text-lg truncate max-w-[150px]">{user.displayName || 'Utilisateur'}</div>
                        <div className="text-xs text-gray-500">Inscrit le {user.createdAt?.seconds ? new Date(user.createdAt.seconds * 1000).toLocaleDateString() : '-'}</div>
                    </div>
                </div>
                <div className="absolute top-4 right-4">
                     <select 
                        value={user.role || 'viewer'} 
                        onChange={(e) => onRoleChange(user.uid, e.target.value)}
                        className="bg-zinc-950 border border-zinc-800 rounded px-2 py-1 text-xs text-gray-300 focus:border-[#d4af37] outline-none cursor-pointer hover:bg-zinc-800"
                    >
                        <option value={USER_ROLES.VIEWER}>Viewer</option>
                        <option value={USER_ROLES.INSTALLER}>Installateur</option>
                        <option value={USER_ROLES.COMMERCIAL}>Commercial</option>
                        <option value={USER_ROLES.ADMIN}>Admin</option>
                    </select>
                </div>
            </div>

            {/* Content: Contact Info */}
            <div className="space-y-3 mt-2">
                <div className="flex items-center gap-3 text-sm text-gray-400 bg-zinc-950/50 p-2 rounded">
                    <Mail size={16} />
                    <a href={`mailto:${user.email}`} className="hover:text-[#d4af37] truncate">{user.email}</a>
                </div>
                
                <div className="flex items-center gap-3 text-sm text-gray-400 bg-zinc-950/50 p-2 rounded justify-between h-10">
                    <div className="flex items-center gap-3 flex-1">
                        <Phone size={16} />
                        {isEditing ? (
                            <input 
                                value={phone} 
                                onChange={(e) => setPhone(e.target.value)} 
                                className="bg-zinc-900 border border-zinc-700 rounded px-1 w-full text-white outline-none focus:border-[#d4af37]"
                                placeholder="+972..."
                                autoFocus
                            />
                        ) : (
                            <span className={phone ? "text-gray-300" : "text-gray-600 italic"}>{phone || 'Pas de numéro'}</span>
                        )}
                    </div>
                    {isEditing ? (
                        <div className="flex gap-1">
                            <button onClick={handleSavePhone} className="text-green-500 hover:text-green-400"><Save size={14} /></button>
                            <button onClick={() => setIsEditing(false)} className="text-red-500 hover:text-red-400"><X size={14} /></button>
                        </div>
                    ) : (
                        <button onClick={() => setIsEditing(true)} className="text-gray-500 hover:text-white"><Edit2 size={14} /></button>
                    )}
                </div>
            </div>

            {/* Actions Footer */}
            <div className="grid grid-cols-2 gap-2 mt-auto pt-4 border-t border-zinc-800">
                <a 
                    href={phone ? `https://wa.me/${phone.replace(/[^0-9]/g, '')}` : '#'} 
                    target="_blank" 
                    rel="noreferrer"
                    className={`flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-bold transition ${phone ? 'bg-green-600/20 text-green-500 hover:bg-green-600/30' : 'bg-zinc-800 text-gray-600 cursor-not-allowed'}`}
                    onClick={(e) => !phone && e.preventDefault()}
                >
                    <MessageCircle size={16} /> WhatsApp
                </a>
                <a 
                    href={phone ? `tel:${phone}` : '#'}
                    className={`flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-bold transition ${phone ? 'bg-blue-600/20 text-blue-500 hover:bg-blue-600/30' : 'bg-zinc-800 text-gray-600 cursor-not-allowed'}`}
                    onClick={(e) => !phone && e.preventDefault()}
                >
                     <Phone size={16} /> Appeler
                </a>
            </div>

            {/* Details Button */}
            <button 
                onClick={() => onOpenDetails(user)}
                className="w-full mt-2 bg-zinc-800 hover:bg-zinc-700 text-gray-300 py-2 rounded-lg text-sm font-bold transition border border-zinc-700 flex justify-center items-center gap-2"
            >
                <Eye size={16}/> Voir Détails & Finance (PRO)
            </button>
            
             <div className="mt-2 text-center">
                 <RoleBadge role={user.role} />
             </div>
        </div>
    );
};

import AddStaffModal from '../../components/admin/AddStaffModal';

export default function TeamPage() {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedUser, setSelectedUser] = useState(null);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);

    useEffect(() => {
        loadUsers();
    }, []);

    const loadUsers = async () => {
        setLoading(true);
        const { success, data } = await userService.getAllUsers();
        if (success) {
            setUsers(data);
        } else {
            toast.error("Erreur chargement utilisateurs");
        }
        setLoading(false);
    };

    const handleRoleChange = async (uid, newRole) => {
        const originalUsers = [...users];
        setUsers(users.map(u => u.uid === uid ? { ...u, role: newRole } : u));
        
        const { success } = await userService.updateUserRole(uid, newRole);
        if (success) toast.success("Rôle mis à jour");
        else {
            setUsers(originalUsers); 
            toast.error("Échec mise à jour");
        }
    };

    const handlePhoneUpdate = async (uid, newPhone) => {
        // Local update
        setUsers(users.map(u => u.uid === uid ? { ...u, phone: newPhone } : u));
        
        // Firestore Update (Manually here since userService might not have dedicated phone update method yet, or utilize generic update)
        try {
            await updateDoc(doc(db, 'users', uid), { phone: newPhone });
            toast.success("Numéro enregistré");
        } catch (e) {
            console.error(e);
            toast.error("Erreur sauvegarde numéro");
        }
    };

    const filteredUsers = users.filter(u => 
        (u.displayName || '').toLowerCase().includes(searchTerm.toLowerCase()) || 
        (u.email || '').toLowerCase().includes(searchTerm.toLowerCase())
    );

    const stats = {
        total: users.length,
        admin: users.filter(u => u.role === 'admin').length,
        commercial: users.filter(u => u.role === 'commercial').length,
        installer: users.filter(u => u.role === 'worker' || u.role === 'installer').length
    };

    if (loading) return <div className="p-12 text-center text-[#d4af37]">Chargement de la Dream Team...</div>;

    return (
        <div className="h-full flex flex-col space-y-6">
             {/* Header Section */}
             <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                 <div>
                    <h1 className="text-3xl font-bold font-heading text-white">Gestion d'Équipe</h1>
                    <p className="text-gray-400">Gérez les accès, rôles et contacts du staff</p>
                 </div>
                 
                 <div className="flex gap-4">
                     <button 
                        onClick={() => setIsAddModalOpen(true)}
                        className="bg-[#d4af37] hover:bg-[#b5952f] text-black px-4 py-2 rounded-lg text-sm font-bold transition flex items-center gap-2 shadow-lg shadow-[#d4af37]/20"
                     >
                        <Users size={18} /> Nouveau Membre
                     </button>
                     <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                        <input 
                            type="text" 
                            placeholder="Rechercher un membre..." 
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="bg-zinc-900 border border-zinc-800 text-white rounded-lg pl-10 pr-4 py-2 focus:border-[#d4af37] outline-none w-64"
                        />
                     </div>
                 </div>
            </div>

            {/* Stats Bar */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-zinc-900 border border-zinc-800 p-4 rounded-xl flex flex-col">
                    <span className="text-gray-500 text-xs uppercase">Total Staff</span>
                    <span className="text-2xl font-bold text-white">{stats.total}</span>
                </div>
                <div className="bg-zinc-900 border border-zinc-800 p-4 rounded-xl flex flex-col">
                    <span className="text-gray-500 text-xs uppercase">Admins</span>
                    <span className="text-2xl font-bold text-red-500">{stats.admin}</span>
                </div>
                <div className="bg-zinc-900 border border-zinc-800 p-4 rounded-xl flex flex-col">
                    <span className="text-gray-500 text-xs uppercase">Commerciaux</span>
                    <span className="text-2xl font-bold text-blue-500">{stats.commercial}</span>
                </div>
                <div className="bg-zinc-900 border border-zinc-800 p-4 rounded-xl flex flex-col">
                    <span className="text-gray-500 text-xs uppercase">Installateurs</span>
                    <span className="text-2xl font-bold text-orange-500">{stats.installer}</span>
                </div>
            </div>

            {/* Cards Grid */}
            <div className="flex-1 overflow-y-auto min-h-0 pb-10">
                {filteredUsers.length === 0 ? (
                    <div className="text-center py-20 text-gray-500">Aucun membre trouvé.</div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {filteredUsers.map(user => (
                            <UserCard 
                                key={user.uid} 
                                user={user} 
                                onRoleChange={handleRoleChange} 
                                onPhoneUpdate={handlePhoneUpdate}
                                onOpenDetails={setSelectedUser}
                            />
                        ))}
                    </div>
                )}
            </div>

            {/* Details Modal */}
            {selectedUser && (
                <StaffDetailsModal 
                    user={selectedUser} 
                    onClose={() => setSelectedUser(null)} 
                    onUpdate={loadUsers} 
                />
            )}

            {/* Add Member Modal */}
            {isAddModalOpen && (
                <AddStaffModal 
                    onClose={() => setIsAddModalOpen(false)}
                    onAdded={loadUsers}
                />
            )}
        </div>
    );
}

