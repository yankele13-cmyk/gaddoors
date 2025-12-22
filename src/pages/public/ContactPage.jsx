import { useState } from 'react';
import { Mail, Phone, MapPin, Send } from 'lucide-react';
import { db } from '../../services/firebase'; 
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    message: ''
  });
  const [status, setStatus] = useState('idle'); // idle, submitting, success, error

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus('submitting');

    try {
      await addDoc(collection(db, "messages"), {
        ...formData,
        read: false,
        status: 'new',
        createdAt: serverTimestamp()
      });
      setStatus('success');
      setFormData({ name: '', email: '', phone: '', message: '' });
    } catch (error) {
      console.error("Error sending message:", error);
      setStatus('error');
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <div className="bg-black min-h-screen pt-24 pb-20 px-4 sm:px-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl md:text-6xl font-heading text-[#d4af37] mb-8 text-center">
          Contactez-nous
        </h1>
        <p className="text-gray-400 text-center max-w-2xl mx-auto mb-16 text-lg">
          Une question sur nos portes blindées ou nos modèles italiens exclusifs ? 
          Notre équipe d'experts est à votre disposition pour réaliser votre projet sur mesure.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 text-white">
          {/* Contact Info */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-8">
            <h2 className="text-2xl font-bold font-heading text-white mb-6">Envoyez-nous un message</h2>
            
            {status === 'success' ? (
              <div className="bg-green-900/20 border border-green-500/50 text-green-400 p-6 rounded-lg text-center">
                <h3 className="text-xl font-bold mb-2">Message envoyé !</h3>
                <p>Nous vous répondrons dans les plus brefs délais.</p>
                <button 
                  onClick={() => setStatus('idle')}
                  className="mt-4 text-sm underline hover:text-white"
                >
                  Envoyer un autre message
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">Nom complet</label>
                  <input
                    type="text"
                    name="name"
                    required
                    autoFocus
                    value={formData.name}
                    onChange={handleChange}
                    className="w-full bg-zinc-800 border border-zinc-700 rounded-lg p-3 text-white focus:border-[#d4af37] focus:ring-1 focus:ring-[#d4af37] outline-none transition"
                    placeholder="Votre Nom"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2">Email</label>
                    <input
                      type="email"
                      name="email"
                      required
                      value={formData.email}
                      onChange={handleChange}
                      className="w-full bg-zinc-800 border border-zinc-700 rounded-lg p-3 text-white focus:border-[#d4af37] focus:ring-1 focus:ring-[#d4af37] outline-none transition"
                      placeholder="votre@email.com"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2">Téléphone</label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      className="w-full bg-zinc-800 border border-zinc-700 rounded-lg p-3 text-white focus:border-[#d4af37] focus:ring-1 focus:ring-[#d4af37] outline-none transition"
                      placeholder="06 12 34 56 78"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">Message de votre projet</label>
                  <textarea
                    name="message"
                    required
                    rows="4"
                    value={formData.message}
                    onChange={handleChange}
                    className="w-full bg-zinc-800 border border-zinc-700 rounded-lg p-3 text-white focus:border-[#d4af37] focus:ring-1 focus:ring-[#d4af37] outline-none transition resize-none"
                    placeholder="Décrivez votre besoin (type de porte, dimensions, style...)"
                  ></textarea>
                </div>

                <button
                  type="submit"
                  disabled={status === 'submitting'}
                  className="w-full bg-[#d4af37] hover:bg-yellow-500 text-black font-bold py-4 rounded-lg flex items-center justify-center gap-2 transition disabled:opacity-50"
                >
                  {status === 'submitting' ? 'Envoi...' : (
                    <>
                      Envoyer ma demande <Send size={20} />
                    </>
                  )}
                </button>
                
                {status === 'error' && (
                  <p className="text-red-500 text-sm text-center">Une erreur est survenue. Veuillez réessayer.</p>
                )}
              </form>
            )}
          </div>
          
          {/* Contact Info */}
          <div className="space-y-8 bg-zinc-900/50 p-8 rounded-2xl border border-zinc-800 h-fit">
            <h2 className="text-2xl font-bold font-heading text-white mb-6">Nos Coordonnées</h2>
            
            <div className="flex items-start gap-4">
              <div className="p-3 bg-[#d4af37]/10 rounded-lg text-[#d4af37]">
                <Phone size={24} />
              </div>
              <div>
                <h3 className="font-bold text-lg">Téléphone</h3>
                <p className="text-gray-400 mt-1 cursor-pointer hover:text-white transition">+972 55 278 3693</p>
                <p className="text-sm text-gray-500 mt-1">Du Lundi au Vendredi, 9h-18h</p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="p-3 bg-[#d4af37]/10 rounded-lg text-[#d4af37]">
                <Mail size={24} />
              </div>
              <div>
                <h3 className="font-bold text-lg">Email</h3>
                <p className="text-gray-400 mt-1 cursor-pointer hover:text-white transition">yankele13@gmail.com</p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="p-3 bg-[#d4af37]/10 rounded-lg text-[#d4af37]">
                <MapPin size={24} />
              </div>
              <div>
                <h3 className="font-bold text-lg">Showroom</h3>
                <p className="text-gray-400 mt-1">
                  Aaron Eshkoli 115<br/>
                  Jerusalem
                </p>
                <p className="text-sm text-gray-500 mt-1">Sur rendez-vous uniquement</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
