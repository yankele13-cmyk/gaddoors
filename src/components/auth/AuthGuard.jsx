import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export default function AuthGuard({ children }) {
  const { currentUser, isWhitelisted } = useAuth();
  const location = useLocation();

  if (!currentUser) {
    // Redirect to login page with return url
    return <Navigate to="/admin/login" state={{ from: location }} replace />;
  }

  if (!isWhitelisted) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-black text-white p-4">
        <h1 className="text-3xl text-red-500 font-bold mb-4">ACCÈS REFUSÉ ⛔</h1>
        <p className="text-xl mb-6">L'adresse email <strong>{currentUser.email}</strong> n'est pas autorisée à accéder au Command Center.</p>
        <p className="text-gray-400">Si vous pensez qu'il s'agit d'une erreur, contactez l'administrateur système.</p>
        <button 
          onClick={() => window.location.href = '/'} 
          className="mt-8 px-6 py-2 bg-slate-800 hover:bg-slate-700 rounded transition"
        >
          Retour à l'accueil
        </button>
      </div>
    );
  }

  return children;
}
