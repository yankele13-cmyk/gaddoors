import { useState, useEffect } from 'react';
import { userService } from '../../services/userService';
import { USER_ROLES } from '../../config/constants'; // Make sure to export this in constants.js
import { Users, Shield, UserCheck, Hammer, Eye } from 'lucide-react';
import toast from 'react-hot-toast';

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

export default function TeamPage() {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);

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
        // Optimistic update
        const originalUsers = [...users];
        setUsers(users.map(u => u.uid === uid ? { ...u, role: newRole } : u));

        const { success } = await userService.updateUserRole(uid, newRole);
        
        if (success) {
            toast.success("Rôle mis à jour");
        } else {
            setUsers(originalUsers); // Revert
            toast.error("Echec mise à jour");
        }
    };

    if (loading) return <div className="p-8 text-center text-[#d4af37]">Chargement...</div>;

    return (
        <div className="h-full flex flex-col space-y-6">
             <div className="flex justify-between items-center">
                 <div>
                    <h1 className="text-3xl font-bold font-heading text-white">Gestion d'Équipe</h1>
                    <p className="text-gray-400">Gérez les accès et permissions du staff</p>
                 </div>
                 <div className="bg-[#d4af37]/10 border border-[#d4af37]/20 px-4 py-2 rounded-lg text-[#d4af37] text-sm">
                     <span className="font-bold">{users.length}</span> Membres
                 </div>
            </div>

            <div className="flex-1 bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
                <table className="w-full text-left">
                    <thead className="bg-zinc-950 text-gray-500 uppercase text-xs">
                        <tr>
                            <th className="p-4">Utilisateur</th>
                            <th className="p-4">Rôle Actuel</th>
                            <th className="p-4">Action</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-800">
                        {users.map(user => (
                            <tr key={user.uid} className="hover:bg-zinc-800/50 transition">
                                <td className="p-4">
                                    <div className="flex items-center gap-3">
                                        {user.photoURL ? (
                                            <img src={user.photoURL} className="w-10 h-10 rounded-full border border-zinc-700" alt="" />
                                        ) : (
                                            <div className="w-10 h-10 rounded-full bg-zinc-800 flex items-center justify-center text-gray-400">
                                                <Users size={16} />
                                            </div>
                                        )}
                                        <div>
                                            <div className="font-bold text-white max-w-[200px] truncate">{user.displayName || 'Utilisateur'}</div>
                                            <div className="text-xs text-gray-500 max-w-[200px] truncate">{user.email}</div>
                                        </div>
                                    </div>
                                </td>
                                <td className="p-4">
                                    <RoleBadge role={user.role} />
                                </td>
                                <td className="p-4">
                                    <select 
                                        value={user.role} 
                                        onChange={(e) => handleRoleChange(user.uid, e.target.value)}
                                        className="bg-zinc-950 border border-zinc-700 rounded p-2 text-sm text-white focus:border-[#d4af37] outline-none cursor-pointer"
                                    >
                                        <option value={USER_ROLES.VIEWER}>Viewer</option>
                                        <option value={USER_ROLES.INSTALLER}>Installateur</option>
                                        <option value={USER_ROLES.COMMERCIAL}>Commercial</option>
                                        <option value={USER_ROLES.ADMIN}>Administrateur</option>
                                    </select>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
