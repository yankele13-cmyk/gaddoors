import React, { useEffect, useState } from 'react';
import { Save, Plus, Trash2, Globe, FileText, Search, Loader2 } from 'lucide-react';
import { TranslationService } from '../../../services/translation.service';
import toast from 'react-hot-toast';

const SECTIONS = [
    { value: 'quoteTitle', label: 'Titre Devis' },
    { value: 'invoiceTitle', label: 'Titre Facture' },
    { value: 'clientLabel', label: 'Label Client' },
    { value: 'colDescription', label: 'Col. Description' },
    { value: 'colQty', label: 'Col. Qté' },
    { value: 'colUnitPrice', label: 'Col. Prix Unit.' },
    { value: 'colTotal', label: 'Col. Total' },
    { value: 'subTotalLabel', label: 'Label Sous-total' },
    { value: 'vatLabel', label: 'Label TVA' },
    { value: 'totalLabel', label: 'Label Total TTC' },
    { value: 'footerText', label: 'Pied de page' },
    { value: 'internalDocWarning', label: 'Alerte Doc Interne' }
];

export default function TranslationManagerPage() {
  const [translations, setTranslations] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeLang, setActiveLang] = useState('fr');
  const [customKeys, setCustomKeys] = useState([]); // For extensibility

  useEffect(() => {
    loadTranslations();
  }, []);

  const loadTranslations = async () => {
    setLoading(true);
    const data = await TranslationService.getAll();
    setTranslations(data);
    setLoading(false);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
        await TranslationService.updateLanguage(activeLang, translations[activeLang]);
        toast.success("Traductions sauvegardées !");
    } catch (e) {
        toast.error("Erreur sauvegarde");
    } finally {
        setSaving(false);
    }
  };

  const handleChange = (key, value) => {
    setTranslations(prev => ({
        ...prev,
        [activeLang]: {
            ...prev[activeLang],
            [key]: value
        }
    }));
  };

  if (loading) return <div className="p-12 text-center text-[#d4af37]"><Loader2 className="animate-spin mx-auto mb-2" /> Chargement...</div>;

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
        
        {/* Header */}
        <div className="flex justify-between items-center">
            <div>
                <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
                    <Globe className="text-[#d4af37]" /> Traductions Documents
                </h1>
                <p className="text-gray-400">Gérez les textes imprimés sur vos documents PDF (Devis, Factures, etc.)</p>
            </div>
            
            <button 
                onClick={handleSave} 
                disabled={saving}
                className="bg-[#d4af37] hover:bg-yellow-500 text-black font-bold px-6 py-3 rounded-lg flex items-center gap-2 transition disabled:opacity-50"
            >
                {saving ? <Loader2 className="animate-spin" size={20}/> : <Save size={20} />}
                Sauvegarder
            </button>
        </div>

        {/* Language Switcher */}
        <div className="bg-zinc-900 border border-zinc-800 p-1 rounded-lg flex gap-1 w-fit">
            <button 
                onClick={() => setActiveLang('fr')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition ${activeLang === 'fr' ? 'bg-zinc-800 text-white shadow' : 'text-gray-400 hover:text-white'}`}
            >
                🇫🇷 Français
            </button>
            <button 
                onClick={() => setActiveLang('he')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition ${activeLang === 'he' ? 'bg-zinc-800 text-white shadow' : 'text-gray-400 hover:text-white'}`}
            >
                🇮🇱 Hébreu
            </button>
            <button 
                onClick={() => setActiveLang('en')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition ${activeLang === 'en' ? 'bg-zinc-800 text-white shadow' : 'text-gray-400 hover:text-white'}`}
            >
                🇬🇧 Anglais (Futur)
            </button>
        </div>

        {/* Editor Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Standard Keys */}
            <div className="space-y-6">
                <h3 className="text-[#d4af37] font-bold border-b border-zinc-800 pb-2 uppercase text-xs tracking-wider">
                    Textes Standards
                </h3>
                
                <div className="space-y-4">
                    {SECTIONS.map((section) => (
                        <div key={section.value}>
                            <label className="block text-xs font-medium text-gray-500 mb-1">{section.label} ({section.value})</label>
                            <input 
                                type="text" 
                                value={translations[activeLang]?.[section.value] || ''}
                                onChange={(e) => handleChange(section.value, e.target.value)}
                                className="w-full bg-zinc-950 border border-zinc-800 rounded p-2 text-white focus:border-[#d4af37] outline-none"
                                dir={activeLang === 'he' ? 'rtl' : 'ltr'}
                            />
                        </div>
                    ))}
                </div>
            </div>

            {/* Preview / Info */}
            <div className="space-y-6">
                 <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 sticky top-6">
                    <h3 className="text-white font-bold mb-4 flex items-center gap-2">
                        <FileText size={18} className="text-[#d4af37]" /> Aperçu Logique
                    </h3>
                    <p className="text-sm text-gray-400 mb-4">
                        Ces traductions sont injectées directement dans les fichiers PDF lors de la génération.
                        <br/>
                        Les modifications sont immédiates pour tous les futurs documents.
                    </p>

                    <div className="bg-zinc-950 p-4 rounded-lg font-mono text-xs text-green-400 overflow-x-auto border border-zinc-800">
                        <p className="text-gray-500 mb-2">// {activeLang}/translation.json structure</p>
                        {JSON.stringify(translations[activeLang], null, 2)}
                    </div>
                 </div>
            </div>

        </div>
    </div>
  );
}
