import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';

export default function LoginPage() {
  const { loginWithGoogle } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState('');

  async function handleLogin() {
    try {
      setError('');
      await loginWithGoogle();
      navigate('/admin/dashboard');
    } catch (err) {
      setError('Echec de la connexion Google. ' + err.message);
    }
  }

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-zinc-900 border border-gold/20 rounded-xl p-8 shadow-2xl text-center">
        <div className="mb-6 flex justify-center">
           <span className="text-4xl">🔐</span> 
        </div>
        <h1 className="text-3xl font-bold text-white mb-2 font-heading tracking-wider">GAD DOORS</h1>
        <h2 className="text-xl text-gold mb-8 uppercase tracking-widest text-[#d4af37]">Command Center</h2>

        {error && <div className="bg-red-900/50 text-red-200 p-3 rounded mb-4">{error}</div>}

        <button
          onClick={handleLogin}
          className="w-full flex items-center justify-center gap-3 bg-white text-black font-bold py-3 px-6 rounded-lg hover:bg-gray-100 transition duration-200"
        >
          <img src="https://www.svgrepo.com/show/475656/google-color.svg" className="w-6 h-6" alt="Google" />
          Se connecter avec Google
        </button>

        <p className="mt-6 text-sm text-gray-500">
          Accès réservé au personnel autorisé.<br/>
          Toute tentative d'intrusion sera loggée.
        </p>
      </div>
    </div>
  );
}
