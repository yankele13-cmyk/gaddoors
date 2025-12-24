import { useState, useEffect } from 'react';
import { productsService } from '../../services/products.service';
import { ordersService } from '../../services/orders.service';
import DoorConfigurator from './DoorConfigurator';
import { Plus, Save, Truck, Package, Trash2, Calculator } from 'lucide-react';
import toast from 'react-hot-toast';
import QuoteDocument from '../../components/admin/quotes/QuoteDocument';
import { Printer } from 'lucide-react';

export default function QuoteBuilder({ onSuccess }) {
  const [products, setProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Quote State
  const [client, setClient] = useState({ name: '', phone: '', address: '', email: '' });
  const [items, setItems] = useState([]);
  const [logistics, setLogistics] = useState({ zone: 'Jerusalem', floor: 0, hasElevator: false });
  
  // UI State
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadCatalog();
  }, []);

  const loadCatalog = async () => {
    const data = await productsService.getAll();
    setProducts(data);
  };

  const addItem = (item) => {
    setItems([...items, { ...item, id: Date.now() }]); // Add temp ID for UI
    setSelectedProduct(null);
    toast.success("Ajouté !");
  };

  const removeItem = (index) => {
    const newItems = [...items];
    newItems.splice(index, 1);
    setItems(newItems);
  };

  // Calculations
  const itemsTotal = items.reduce((sum, i) => sum + (i.priceSnapshot * i.quantity), 0);
  
  let deliveryCost = 250; // Base from config CONSTANTS usually
  if (logistics.floor > 2 && !logistics.hasElevator) {
      deliveryCost += (logistics.floor - 2) * 50;
  }
  
  const subTotal = itemsTotal + deliveryCost;
  const vat = subTotal * 0.17;
  const totalTTC = subTotal + vat;

  const handleSave = async () => {
    if (!client.name || items.length === 0) {
        return toast.error("Client et Panier requis");
    }
    setSaving(true);
    try {
        await ordersService.create({
            client,
            items,
            logistics
        });
        toast.success("Devis Créé !");
        if(onSuccess) onSuccess();
    } catch (e) {
        console.error(e);
        toast.error("Erreur Sauvegarde");
    } finally {
        setSaving(false);
    }
  };


  const handlePrint = () => {
    window.print();
  };

  const filteredProducts = products.filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase()));

  // LIVE PREVIEW DATA FOR PRINT
  const printData = {
    client, items, logistics,
    financials: { subTotal, logisticsCost: deliveryCost, vatRate: 0.17, vatAmount: vat, totalGt: totalTTC },
    humanId: 'BROUILLON',
    createdAt: new Date().toISOString()
  };

  return (
    <>
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-140px)]">
        {/* LEFT: CATALOG & CONFIG */}
        <div className="lg:col-span-2 bg-zinc-900 border border-zinc-800 rounded-xl flex flex-col overflow-hidden">
            <div className="p-4 border-b border-zinc-800 bg-zinc-950">
                <input 
                    type="text" 
                    placeholder="Chercher un produit..." 
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full bg-zinc-900 border border-zinc-700 rounded-lg p-3 text-white focus:border-[#d4af37] outline-none"
                />
            </div>
            
            <div className="flex-1 overflow-y-auto p-4">
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {filteredProducts.map(product => (
                        <div 
                            key={product.id} 
                            onClick={() => setSelectedProduct(product)}
                            className="bg-black border border-zinc-800 rounded-lg p-4 cursor-pointer hover:border-[#d4af37] transition group"
                        >
                            <div className="h-24 bg-zinc-800 rounded mb-3 flex items-center justify-center overflow-hidden">
                                {product.image ? <img src={product.image} className="w-full h-full object-cover" /> : <Package className="text-gray-600" />}
                            </div>
                            <h4 className="font-bold text-white text-sm truncate">{product.name}</h4>
                            <div className="text-[#d4af37] font-mono text-xs mt-1">{product.price} ₪</div>
                        </div>
                    ))}
                </div>
            </div>
        </div>

        {/* RIGHT: CART & CLIENT */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl flex flex-col h-full">
            <div className="p-4 border-b border-zinc-800 bg-zinc-950">
                <h3 className="font-bold text-white mb-3">Informations Client</h3>
                <div className="space-y-2">
                    <input 
                        placeholder="Nom du Client" 
                        value={client.name}
                        onChange={(e) => setClient({...client, name: e.target.value})}
                        className="w-full bg-zinc-900 border border-zinc-700 rounded p-2 text-sm text-white"
                    />
                    <div className="grid grid-cols-2 gap-2">
                        <input 
                            placeholder="Tél" 
                            value={client.phone}
                            onChange={(e) => setClient({...client, phone: e.target.value})}
                            className="w-full bg-zinc-900 border border-zinc-700 rounded p-2 text-sm text-white"
                        />
                        <input 
                            placeholder="Ville/Zone" 
                            value={logistics.zone}
                            onChange={(e) => setLogistics({...logistics, zone: e.target.value})}
                            className="w-full bg-zinc-900 border border-zinc-700 rounded p-2 text-sm text-white"
                        />
                    </div>
                </div>
            </div>
            
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {items.length === 0 && <div className="text-center text-gray-500 text-sm py-10">Le panier est vide.</div>}
                
                {items.map((item, idx) => (
                    <div key={idx} className="bg-zinc-950 p-3 rounded border border-zinc-800 flex justify-between items-start">
                        <div>
                            <div className="font-bold text-white text-sm">{item.name}</div>
                            <div className="text-xs text-gray-500">Qté: {item.quantity} x {item.priceSnapshot} ₪</div>
                            {item.specs && (
                                <div className="text-[10px] text-gray-400 mt-1">
                                    Config: {item.specs.width}cm • {item.specs.lock}
                                </div>
                            )}
                        </div>
                        <div className="flex flex-col items-end gap-2">
                            <span className="font-mono text-[#d4af37] text-sm">{(item.priceSnapshot * item.quantity).toLocaleString()} ₪</span>
                            <button onClick={() => removeItem(idx)} className="text-red-500 hover:text-red-400"><Trash2 size={14} /></button>
                        </div>
                    </div>
                ))}

                {/* Logistics */}
                <div className="bg-zinc-800/50 p-3 rounded border border-zinc-700">
                    <div className="flex justify-between items-center mb-2">
                        <span className="text-xs font-bold text-gray-400 flex items-center gap-1"><Truck size={12} /> Livraison</span>
                        <span className="text-xs font-mono text-white">{deliveryCost} ₪</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="flex items-center gap-1 bg-zinc-900 rounded p-1">
                            <span className="text-[10px] text-gray-500 px-1">Étage</span>
                            <input 
                                type="number" 
                                value={logistics.floor} 
                                onChange={(e) => setLogistics({...logistics, floor: Number(e.target.value)})}
                                className="w-8 bg-transparent text-white text-center text-xs outline-none" 
                            />
                        </div>
                        <label className="flex items-center gap-1 text-[10px] text-gray-400 cursor-pointer">
                            <input 
                                type="checkbox" 
                                checked={logistics.hasElevator}
                                onChange={(e) => setLogistics({...logistics, hasElevator: e.target.checked})}
                            /> Ascenseur ?
                        </label>
                    </div>
                </div>
            </div>

            <div className="p-4 bg-zinc-950 border-t border-zinc-800">
                <div className="flex justify-between text-sm text-gray-400 mb-1">
                    <span>Sous-Total</span>
                    <span>{subTotal.toLocaleString()} ₪</span>
                </div>
                <div className="flex justify-between text-sm text-gray-400 mb-3">
                    <span>TVA (17%)</span>
                    <span>{vat.toLocaleString()} ₪</span>
                </div>
                <div className="flex justify-between text-lg font-bold text-white mb-4">
                    <span>Total TTC</span>
                    <span className="text-[#d4af37]">{totalTTC.toLocaleString()} ₪</span>
                </div>

            </div>

            <div className="p-4 bg-zinc-950 border-t border-zinc-800 flex gap-2">
                <button 
                  onClick={handlePrint}
                  className="bg-zinc-800 hover:bg-zinc-700 text-white p-3 rounded-lg"
                  title="Imprimer Devis"
                >
                    <Printer size={18} />
                </button>
                <button 
                  onClick={handleSave}
                  disabled={saving}
                  className="flex-1 bg-green-600 hover:bg-green-700 text-white font-bold py-3 rounded-lg flex items-center justify-center gap-2 disabled:opacity-50"
                >
                    <Save size={18} /> {saving ? '...' : 'Valider le Devis'}
                </button>
            </div>
        </div>

        {/* MODAL CONFIGURATOR */}
        {selectedProduct && (
            <DoorConfigurator 
                product={selectedProduct}
                onClose={() => setSelectedProduct(null)}
                onConfirm={addItem}
            />
        )}
    </div>

    {/* PRINTABLE HIDDEN SECTION */}
    <QuoteDocument data={printData} />
    </>
  );
}
