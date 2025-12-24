import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { subscribeToAuthChanges } from '../../services/authService';
import { ROUTES, ALLOWED_ADMINS } from '../../config/constants';
import toast from 'react-hot-toast';

export default function AuthGuard({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = subscribeToAuthChanges((currentUser) => {
      setLoading(false);
      
      // 1. Not Logged In
      if (!currentUser) {
        setUser(null);
        navigate(ROUTES.ADMIN.LOGIN);
        return;
      }

      // 2. Logged In but Unauthorized (RBAC)
      if (!ALLOWED_ADMINS.includes(currentUser.email)) {
        setUser(null);
        toast.error("Accès Refusé : Vous n'êtes pas administrateur.");
        navigate(ROUTES.PUBLIC.HOME); // Or Login
        return;
      }

      // 3. Authorized
      setUser(currentUser);
    });

    return () => unsubscribe();
  }, [navigate]);

  if (loading) {
    return <div className="h-screen w-full flex items-center justify-center bg-zinc-950 text-[#d4af37]">Chargement...</div>;
  }

  if (!user) {
    return null; // Will redirect via effect
  }

  return children;
}
