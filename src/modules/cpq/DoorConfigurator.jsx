import { useState } from 'react';
import { X, Check } from 'lucide-react';

export default function DoorConfigurator({ product, onClose, onConfirm }) {
  const [specs, setSpecs] = useState({
    width: '80',
    opening: 'droit_poussant',
    frame: 'standard',
    lock: 'magnetique',
    color: 'blanc'
  });
  
  const [quantity, setQuantity] = useState(1);
  const [roomLabel, setRoomLabel] = useState('');
  const [manualPrice, setManualPrice] = useState(null); // Allow override

  const getExtraCost = () => {
    let extra = 0;
    if (specs.lock === 'magnetique') extra += 150;
    // if (specs.frame === 'mamad') extra += 200; // Example
    return extra;
  };

  // Base calculation
  const calculatedBase = (Number(product.price) || 0) + getExtraCost();
  
  // Final price is manual override OR calculated base
  const finalUnitPrice = manualPrice !== null ? Number(manualPrice) : calculatedBase;

  const handleConfirm = () => {
    onConfirm({
      productId: product.id,
      name: product.name,
      priceSnapshot: finalUnitPrice,
      quantity: Number(quantity),
      roomLabel,
      specs // Full technical object
    });
  };

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl w-full max-w-lg flex flex-col max-h-[90vh]">
        <div className="p-4 border-b border-zinc-800 flex justify-between items-center bg-zinc-950 rounded-t-xl">
           <h3 className="font-bold text-white flex flex-col">
             <span>{product.name}</span>
             <span>{product.name}</span>
             <span className="text-xs text-[#d4af37] font-mono">{finalUnitPrice.toLocaleString()} ₪ / unité</span>
           </h3>
           <button onClick={onClose}><X className="text-gray-400 hover:text-white" /></button>
        </div>

        <div className="p-6 space-y-6 overflow-y-auto">
            {/* Dimensions */}
            <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Dimensions (Largeur)</label>
                <div className="flex gap-2">
                    {['60', '70', '80', '90'].map(w => (
                        <button 
                            key={w}
                            onClick={() => setSpecs({...specs, width: w})}
                            className={`flex-1 py-2 rounded border text-sm ${specs.width === w ? 'border-[#d4af37] bg-[#d4af37]/10 text-[#d4af37]' : 'border-zinc-700 bg-zinc-800 text-gray-400'}`}
                        >
                            {w}
                        </button>
                    ))}
                </div>
            </div>

            {/* Opening */}
            <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Sens d'ouverture</label>
                <select 
                    value={specs.opening}
                    onChange={(e) => setSpecs({...specs, opening: e.target.value})}
                    className="w-full bg-zinc-800 border border-zinc-700 rounded p-2 text-white outline-none"
                >
                    <option value="droit_poussant">Droit Poussant</option>
                    <option value="gauche_poussant">Gauche Poussant</option>
                    <option value="droit_tirant">Droit Tirant</option>
                    <option value="gauche_tirant">Gauche Tirant</option>
                </select>
            </div>

            {/* Lock Upgrade */}
            <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Serrure</label>
                <div className="grid grid-cols-2 gap-2">
                     <button 
                        onClick={() => setSpecs({...specs, lock: 'canard'})}
                        className={`p-2 rounded border text-xs ${specs.lock === 'canard' ? 'border-[#d4af37] text-[#d4af37]' : 'border-zinc-700 text-gray-400'}`}
                     >
                        Bec de Canard (Std)
                     </button>
                     <button 
                        onClick={() => setSpecs({...specs, lock: 'magnetique'})}
                        className={`p-2 rounded border text-xs ${specs.lock === 'magnetique' ? 'border-[#d4af37] text-[#d4af37]' : 'border-zinc-700 text-gray-400'}`}
                     >
                        Magnétique (+150₪)
                     </button>
                </div>
            </div>

            {/* Context */}
            <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Pièce / Étiquette</label>
                <input 
                    type="text" 
                    placeholder="Ex: Chambre Parents"
                    value={roomLabel}
                    onChange={(e) => setRoomLabel(e.target.value)}
                    className="w-full bg-zinc-800 border-b border-zinc-700 p-2 text-white outline-none focus:border-[#d4af37]"
                />
            </div>
            
            <div className="flex items-center gap-4 pt-4 border-t border-zinc-800">
                <div className="flex flex-col">
                    <span className="text-xs text-gray-500">Quantité</span>
                    <input 
                        type="number" 
                        min="1"
                        value={quantity}
                        onChange={(e) => setQuantity(e.target.value)}
                        className="w-16 bg-zinc-800 border border-zinc-700 rounded p-2 text-white text-center"
                    />
                    <div className="flex flex-col">
                        <span className="text-xs text-gray-500">Prix Unitaire (HT)</span>
                        <input 
                            type="number" 
                            min="0"
                            value={manualPrice !== null ? manualPrice : calculatedBase}
                            onChange={(e) => setManualPrice(e.target.value)}
                            className="w-24 bg-zinc-800 border border-zinc-700 rounded p-2 text-white text-center focus:border-[#d4af37] outline-none"
                        />
                    </div>
                </div>
                <div className="flex-1 text-right">
                    <div className="text-2xl font-mono font-bold text-[#d4af37]">{(finalUnitPrice * quantity).toLocaleString()} ₪</div>
                    <div className="text-xs text-gray-500">Total Ligne HT</div>
                </div>
            </div>
        </div>

        <div className="p-4 bg-zinc-950 rounded-b-xl border-t border-zinc-800">
            <button onClick={handleConfirm} className="w-full bg-[#d4af37] hover:bg-yellow-500 text-black font-bold py-3 rounded-lg flex items-center justify-center gap-2">
                <Check size={20} /> Ajouter au Devis
            </button>
        </div>
      </div>
    </div>
  );
}
