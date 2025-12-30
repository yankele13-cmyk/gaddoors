import React, { useState, useEffect } from 'react';
import { X, Save, RotateCcw } from 'lucide-react';

const DEFAULT_CONFIG = {
  // En-têtes
  quoteTitle: "DEVIS",
  invoiceTitle: "FACTURE",
  quoteInvoiceTitle: "DEVIS / FACTURE",
  workOrderTitle: "FICHE DE TRAVAIL",
  
  // Labels Client
  clientLabel: "Client :",
  
  // Colonnes Tableau
  colDescription: "Description",
  colQty: "Qté",
  colUnitPrice: "P.U.",
  colTotal: "Total",
  
  // Totaux
  subTotalLabel: "Sous-total HT :",
  vatLabel: "TVA (17%) :",
  totalLabel: "Total TTC :",
  
  // Pied de page
  footerText: "Merci de votre confiance - Gad Doors",
  internalDocWarning: "DOCUMENT INTERNE - NE PAS REMETTRE AU CLIENT (KABLAN)"
};

const InputField = ({ label, value, onChange }) => (
    <div>
        <label className="block text-xs font-medium text-gray-500 mb-1 uppercase">{label}</label>
        <input 
            type="text" 
            value={value || ''}
            onChange={onChange}
            className="w-full bg-zinc-950 border border-zinc-800 rounded p-2 text-sm text-white focus:border-[#d4af37] outline-none transition-colors"
        />
    </div>
);

export default function PDFConfigModal({ isOpen, onClose, onSave, initialConfig }) {
  const [config, setConfig] = useState(DEFAULT_CONFIG);

  useEffect(() => {
    if (isOpen) {
        setConfig(initialConfig || DEFAULT_CONFIG);
    }
  }, [isOpen, initialConfig]);

  const handleChange = (key, value) => {
    setConfig(prev => ({ ...prev, [key]: value }));
  };

  const handleReset = () => {
    setConfig(DEFAULT_CONFIG);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl w-full max-w-2xl shadow-2xl flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-zinc-800 shrink-0">
          <div>
            <h2 className="text-xl font-bold text-white">Personnaliser les Textes PDF</h2>
            <p className="text-xs text-gray-500 mt-1">Modifiez tous les labels visibles sur les documents</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-white transition">
            <X size={24} />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto flex-1 custom-scrollbar">
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                
                {/* Column 1 */}
                <div className="space-y-6">
                    <section className="space-y-3">
                        <h3 className="text-[#d4af37] font-bold text-sm border-b border-zinc-800 pb-2">Titres des Documents</h3>
                        <InputField label="Titre Devis" value={config.quoteTitle} onChange={(e) => handleChange('quoteTitle', e.target.value)} />
                        <InputField label="Titre Facture" value={config.invoiceTitle} onChange={(e) => handleChange('invoiceTitle', e.target.value)} />
                        <InputField label="Titre Devis/Facture" value={config.quoteInvoiceTitle} onChange={(e) => handleChange('quoteInvoiceTitle', e.target.value)} />
                        <InputField label="Titre Fiche Travail" value={config.workOrderTitle} onChange={(e) => handleChange('workOrderTitle', e.target.value)} />
                    </section>

                    <section className="space-y-3">
                        <h3 className="text-[#d4af37] font-bold text-sm border-b border-zinc-800 pb-2">Tableau des Articles</h3>
                        <div className="grid grid-cols-2 gap-3">
                            <InputField label="Col. Description" value={config.colDescription} onChange={(e) => handleChange('colDescription', e.target.value)} />
                            <InputField label="Col. Qté" value={config.colQty} onChange={(e) => handleChange('colQty', e.target.value)} />
                            <InputField label="Col. Prix Unit." value={config.colUnitPrice} onChange={(e) => handleChange('colUnitPrice', e.target.value)} />
                            <InputField label="Col. Total" value={config.colTotal} onChange={(e) => handleChange('colTotal', e.target.value)} />
                        </div>
                    </section>
                </div>

                {/* Column 2 */}
                <div className="space-y-6">
                    <section className="space-y-3">
                        <h3 className="text-[#d4af37] font-bold text-sm border-b border-zinc-800 pb-2">Finances & Client</h3>
                        <InputField label="Label Client" value={config.clientLabel} onChange={(e) => handleChange('clientLabel', e.target.value)} />
                        <InputField label="Label Sous-total" value={config.subTotalLabel} onChange={(e) => handleChange('subTotalLabel', e.target.value)} />
                        <InputField label="Label TVA" value={config.vatLabel} onChange={(e) => handleChange('vatLabel', e.target.value)} />
                        <InputField label="Label Total TTC" value={config.totalLabel} onChange={(e) => handleChange('totalLabel', e.target.value)} />
                    </section>

                    <section className="space-y-3">
                        <h3 className="text-[#d4af37] font-bold text-sm border-b border-zinc-800 pb-2">Pied de Page & Divers</h3>
                        <div>
                            <label className="block text-xs font-medium text-gray-500 mb-1 uppercase">Pied de Page</label>
                            <textarea 
                                rows="2"
                                value={config.footerText}
                                onChange={(e) => handleChange('footerText', e.target.value)}
                                className="w-full bg-zinc-950 border border-zinc-800 rounded p-2 text-sm text-white focus:border-[#d4af37] outline-none resize-none"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-gray-500 mb-1 uppercase">Alerte Doc Interne</label>
                            <textarea 
                                rows="2"
                                value={config.internalDocWarning}
                                onChange={(e) => handleChange('internalDocWarning', e.target.value)}
                                className="w-full bg-zinc-950 border border-zinc-800 rounded p-2 text-sm text-red-400 focus:border-red-500 outline-none resize-none"
                            />
                        </div>
                    </section>
                </div>

            </div>

        </div>

        {/* Footer */}
        <div className="p-6 border-t border-zinc-800 flex justify-between items-center shrink-0 bg-zinc-900 rounded-b-xl">
            <button 
                onClick={handleReset}
                className="text-gray-500 hover:text-white text-sm flex items-center gap-1 transition"
            >
                <RotateCcw size={14} /> Rétablir défaut
            </button>
            <div className="flex gap-3">
                <button 
                    onClick={onClose}
                    className="px-4 py-2 text-gray-300 hover:text-white transition"
                >
                    Annuler
                </button>
                <button 
                    onClick={() => { onSave(config); onClose(); }}
                    className="bg-[#d4af37] hover:bg-yellow-500 text-black font-bold px-6 py-2 rounded-lg transition flex items-center gap-2"
                >
                    <Save size={18} />
                    Appliquer au PDF
                </button>
            </div>
        </div>

      </div>
    </div>
  );
}
