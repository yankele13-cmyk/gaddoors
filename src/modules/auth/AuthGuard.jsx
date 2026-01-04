import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { ROUTES } from '../../config/constants';
import toast from 'react-hot-toast';

export default function AuthGuard({ children }) {
  const { currentUser, isAdmin } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // 1. Not Logged In -> Redirect to Login
    if (!currentUser) {
       navigate(ROUTES.ADMIN.LOGIN || '/admin/login');
       return;
    }

    // 2. Logged In but Not Admin -> Redirect Home
    if (isAdmin === false) {
      toast.error("Accès Refusé : Vous n'êtes pas administrateur.");
      navigate(ROUTES.PUBLIC.HOME); 
    }
  }, [currentUser, isAdmin, navigate]);

  // If no user, the layout/router usually handles redirect to login, 
  // but we can enforce it here if needed. 
  // However, AuthContext initial loading state usually handles the "wait".
  
  if (!currentUser) {
     // If loading is done and no user, we should be redirected. 
     // We'll assume the parent component or App.jsx handles the initial "Is Logged In" check via the LoginPage redirection logic
     // But for safety:
     return null; // Don't render admin content
  }

  if (!isAdmin) {
    return null; // Don't render while redirecting
  }

  return children;
}
