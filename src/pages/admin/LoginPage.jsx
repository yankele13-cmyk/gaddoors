import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { ROUTES, ALLOWED_ADMINS } from '../../config/constants';
import toast from 'react-hot-toast';

export default function LoginPage() {
  const { loginWithGoogle } = useAuth();
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleGoogleLogin = async () => {
    setLoading(true);
    try {
      const result = await loginWithGoogle();
      const user = result.user;

      // Immediate Security Check
      if (ALLOWED_ADMINS.includes(user.email)) {
        toast.success(`Bienvenue ${user.displayName || 'Chef'} !`);
        navigate(ROUTES.ADMIN.DASHBOARD);
      } else {
        toast.error("Accès Refusé. Votre email n'est pas autorisé.");
        // We let AuthGuard or Context handle the logout/blocking, 
        // but for UX we show validation here too.
      }
    } catch (error) {
      console.error(error);
      toast.error("Erreur de connexion Google.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-zinc-900 border border-zinc-800 rounded-xl p-12 text-center">
        
        <div className="mb-10">
          <h1 className="text-4xl font-bold font-heading text-white mb-2">GAD<span className="text-[#d4af37]">DOORS</span></h1>
          <p className="text-gray-500 uppercase tracking-widest text-xs">Administration</p>
        </div>

        <div className="space-y-6">
           <button 
             onClick={handleGoogleLogin} 
             disabled={loading}
             className="w-full bg-white hover:bg-gray-100 text-black font-bold py-4 rounded-lg transition flex items-center justify-center gap-3 shadow-xl transform hover:scale-105 duration-200"
           >
             {loading ? (
                <span className="animate-pulse">Connexion...</span>
             ) : (
                <>
                    <svg className="w-5 h-5" viewBox="0 0 24 24">
                        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                        <path d="M5.84 14.11c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.6z" fill="#FBBC05"/>
                        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                    </svg>
                    Continuer avec Google
                </>
             )}
           </button>
           
           <p className="text-gray-600 text-xs">
              Accès strictement réservé.<br/>
              Toute tentative d'intrusion sera signalée.
           </p>
        </div>

      </div>
    </div>
  );
}
