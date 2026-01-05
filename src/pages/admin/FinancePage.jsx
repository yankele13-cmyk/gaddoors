import { useState, useEffect } from 'react';
import { PDFDownloadLink, PDFViewer } from '@react-pdf/renderer';
import { InvoiceDocument } from '../../modules/finance/components/InvoiceDocument';
import { createInvoice, getInvoices, updateInvoiceStatus } from '../../services/invoiceService';
import { ProductService } from '../../services/product.service'; // Added for Picker
import { Plus, Trash2, FileText, Download, RefreshCw, Save, CheckCircle, Clock, ShoppingBag } from 'lucide-react';
import { useForm, useFieldArray } from 'react-hook-form';
import { format } from 'date-fns';
import toast from 'react-hot-toast';

export default function FinancePage() {
  const [invoiceData, setInvoiceData] = useState({
    invoiceNumber: 'INV-' + new Date().getFullYear() + '-' + String(Math.floor(Math.random() * 1000)).padStart(3, '0'),
    date: new Date().toISOString().split('T')[0],
    sender: {
        name: 'GAD DOORS',
        subline: 'Excellence & Sécurité',
        address: 'Aaron Eshkoli 115',
        city: 'Jerusalem',
        phone: '+972 55 278 3693',
        email: 'contact@gaddoors.com',
        footer: 'GAD DOORS - Jerusalem'
    },
    client: { name: '', address: '', email: '' },
    items: [{ description: 'Porte Blindée', quantity: 1, price: 0 }],
    taxRate: 17
  });

  const [invoicesHistory, setInvoicesHistory] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(true);
  const [saving, setSaving] = useState(false);
  const [pdfLanguage, setPdfLanguage] = useState('fr'); // Default language

  // Product Picker State
  const [isPickerOpen, setIsPickerOpen] = useState(false);
  const [availableProducts, setAvailableProducts] = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(false);

  useEffect(() => {
      // Preload products for picker
      const loadProds = async () => {
          setLoadingProducts(true);
          const res = await ProductService.getAllProducts();
          if (res.success) setAvailableProducts(res.data);
          setLoadingProducts(false);
      };
      if (isPickerOpen && availableProducts.length === 0) loadProds();
  }, [isPickerOpen]);
  
  const handleAddProduct = (product) => {
      append({
          description: product.name,
          quantity: 1,
          price: product.price || 0,
          image: product.imageUrl || product.image || null // Pass Image
      });
      setIsPickerOpen(false);
      toast.success("Produit ajouté !");
  };

  const { register, control, watch, handleSubmit, setValue } = useForm({
    defaultValues: invoiceData
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "items"
  });

  // Watch for changes to update preview
  const watchedData = watch();
  
  // Real-time Calculation
  const items = watchedData.items || invoiceData.items;
  const taxRate = watchedData.taxRate || invoiceData.taxRate;
  
  const totalHT = items.reduce((acc, item) => acc + (Number(item.quantity || 0) * Number(item.price || 0)), 0);
  const maam = totalHT * (Number(taxRate) / 100);
  const totalTTC = totalHT + maam;

  // Merge watched data with default structure to ensure PDF has valid data AND calculated totals
  const pdfData = { 
    ...invoiceData, 
    ...watchedData, 
    client: { ...invoiceData.client, ...watchedData.client }, 
    sender: { ...invoiceData.sender, ...watchedData.sender }, 
    items: items,
    totals: { totalHT, maam, totalTTC } // Pass calculated totals
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  async function fetchHistory() {
    try {
      const data = await getInvoices();
      setInvoicesHistory(data);
    } catch (error) {
      console.error("Failed to load history", error);
    } finally {
      setLoadingHistory(false);
    }
  }

  const handleSaveInvoice = async (data) => {
    try {
      setSaving(true);
      // Calculate totals
      const totalHT = data.items.reduce((acc, item) => acc + (Number(item.quantity) * Number(item.price)), 0);
      const maam = totalHT * (Number(data.taxRate) / 100);
      const totalTTC = totalHT + maam;

      const completeData = {
        ...data,
        totals: {
          totalHT,
          maam,
          totalTTC
        }
      };

      await createInvoice(completeData);
      
      // Refresh history
      await fetchHistory();
      
      // Reset invoice number for next one
      const nextNum = 'INV-' + new Date().getFullYear() + '-' + String(Math.floor(Math.random() * 1000)).padStart(3, '0');
      setValue('invoiceNumber', nextNum);
      
      toast.success("Facture enregistrée avec succès !");
    } catch (error) {
      console.error("Error saving invoice:", error);
      toast.error("Erreur lors de l'enregistrement.");
    } finally {
      setSaving(false);
    }
  };

  const handleStatusUpdate = async (id, newStatus) => {
      try {
          await updateInvoiceStatus(id, newStatus);
          setInvoicesHistory(prev => prev.map(inv => inv.id === id ? { ...inv, status: newStatus } : inv));
      } catch (error) {
          console.error("Update failed", error);
      }
  };

  return (
    <div className="flex flex-col lg:flex-row h-full lg:h-[calc(100vh-64px)] overflow-auto lg:overflow-hidden bg-black text-white">
      {/* LEFT: FORM (Scrollable) */}
      <div className="w-full lg:w-1/3 border-r border-zinc-800 flex flex-col bg-zinc-950 overflow-hidden">
        <div className="p-6 border-b border-zinc-800 flex items-center justify-between bg-zinc-950 z-10">
             <h1 className="text-2xl font-bold font-heading text-[#d4af37]">Nouvelle Facture</h1>
        </div>
        
        <div className="flex-1 overflow-y-auto p-6 scrollbar-thin">
            <form className="space-y-6" onSubmit={handleSubmit(handleSaveInvoice)}>
            {/* Section Info Émetteur (Hidden by default or minimized to save space?) - Kept for now */}
            <div className="space-y-4 border-b border-zinc-800 pb-6">
                <h3 className="font-bold text-gray-400 uppercase text-xs tracking-wider">VOTRE ENTREPRISE</h3>
                <div className="grid grid-cols-2 gap-4">
                    <div className="col-span-2">
                        <label className="text-xs text-gray-500 block mb-1">Nom Entreprise</label>
                        <input {...register("sender.name")} className="w-full bg-zinc-900 border border-zinc-700 rounded p-2 text-sm" />
                    </div>
                    {/* Collapsed other sender fields for cleaner UI, assuming defaults are good */}
                </div>
            </div>

            {/* Section Info Facture */}
            <div className="space-y-4 border-b border-zinc-800 pb-6">
                <h3 className="font-bold text-gray-400 uppercase text-xs tracking-wider">Infos Facture</h3>
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="text-xs text-gray-500 block mb-1">N° Facture</label>
                        <input {...register("invoiceNumber")} className="w-full bg-zinc-900 border border-zinc-700 rounded p-2 text-sm" />
                    </div>
                    <div>
                        <label className="text-xs text-gray-500 block mb-1">Date</label>
                        <input type="date" {...register("date")} className="w-full bg-zinc-900 border border-zinc-700 rounded p-2 text-sm" />
                    </div>
                </div>
            </div>

            {/* Section Client */}
            <div className="space-y-4 border-b border-zinc-800 pb-6">
                <h3 className="font-bold text-gray-400 uppercase text-xs tracking-wider">Client</h3>
                <div>
                    <label className="text-xs text-gray-500 block mb-1">Nom / Entreprise</label>
                    <input {...register("client.name", { required: true })} className="w-full bg-zinc-900 border border-zinc-700 rounded p-2 text-sm focus:border-gold" placeholder="Nom du client..." />
                </div>
                <div>
                    <label className="text-xs text-gray-500 block mb-1">Adresse</label>
                    <input {...register("client.address")} className="w-full bg-zinc-900 border border-zinc-700 rounded p-2 text-sm" />
                </div>
                 <div>
                    <label className="text-xs text-gray-500 block mb-1">Email</label>
                    <input {...register("client.email")} className="w-full bg-zinc-900 border border-zinc-700 rounded p-2 text-sm" />
                </div>
            </div>

            {/* Section Items */}
            <div className="space-y-4">
                <div className="flex justify-between items-center">
                    <h3 className="font-bold text-gray-400 uppercase text-xs tracking-wider">Lignes de Produits</h3>
                    <div className="flex gap-2">
                        <button type="button" onClick={() => setIsPickerOpen(true)} className="text-white text-xs bg-zinc-800 px-2 py-1 rounded hover:bg-zinc-700 flex items-center gap-1 border border-zinc-700">
                             <ShoppingBag size={14} /> Catalogue
                        </button>
                        <button type="button" onClick={() => append({ description: '', quantity: 1, price: 0 })} className="text-[#d4af37] text-xs hover:underline flex items-center gap-1">
                            <Plus size={14} /> Manuel
                        </button>
                    </div>
                </div>
                
                <div className="space-y-3">
                    {fields.map((item, index) => (
                        <div key={item.id} className="flex gap-2 items-start bg-zinc-900/50 p-2 rounded">
                            <div className="flex-1">
                                <input {...register(`items.${index}.description`)} placeholder="Description" className="w-full bg-transparent border-b border-zinc-700 p-1 text-sm focus:border-gold outline-none" />
                                <div className="flex gap-2 mt-2">
                                    <input type="number" {...register(`items.${index}.quantity`)} placeholder="Qté" className="w-16 bg-zinc-800 rounded p-1 text-xs text-center" />
                                    <input type="number" step="0.01" {...register(`items.${index}.price`)} placeholder="Prix" className="w-24 bg-zinc-800 rounded p-1 text-xs text-center" />
                                </div>
                            </div>
                            <button type="button" onClick={() => remove(index)} className="text-red-500 hover:text-red-400 p-1">
                                <Trash2 size={16} />
                            </button>
                        </div>
                    ))}
                </div>
            </div>

             {/* Section Tax */}
             <div className="border-t border-zinc-800 pt-6">
                 <div className="flex justify-between items-center mb-2">
                    <label className="text-xs text-gray-500">Taux TVA (%)</label>
                    <input type="number" {...register("taxRate")} className="w-16 bg-zinc-900 border border-zinc-700 rounded p-1 text-sm text-center" />
                 </div>
                 
                 <div className="space-y-2 bg-zinc-900/50 p-3 rounded text-sm">
                    <div className="flex justify-between text-gray-400">
                        <span>Total HT</span>
                        <span>{totalHT.toFixed(2)} ₪</span>
                    </div>
                    <div className="flex justify-between text-gray-400">
                        <span>TVA ({(taxRate)}%)</span>
                        <span>{maam.toFixed(2)} ₪</span>
                    </div>
                     <div className="flex justify-between font-bold text-white border-t border-zinc-700 pt-2 mt-2">
                        <span>Total TTC</span>
                        <span className="text-[#d4af37]">{totalTTC.toFixed(2)} ₪</span>
                    </div>
                 </div>
           </div>

            {/* Actions */}
            <div className="pt-4 flex gap-3">
                 <button 
                    type="submit"
                    disabled={saving}
                    className="flex-1 bg-[#d4af37] hover:bg-yellow-500 text-black font-bold py-3 rounded transition flex items-center justify-center gap-2 disabled:opacity-50"
                 >
                    {saving ? 'Enregistrement...' : <> <Save size={18} /> Enregistrer la Facture </>}
                 </button>
            </div>
            </form>
        </div>
      </div>

      {/* PRODUCT PICKER MODAL */}
      {isPickerOpen && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-zinc-900 border border-zinc-700 rounded-xl w-full max-w-lg p-6 max-h-[80vh] flex flex-col">
            <h2 className="text-xl font-bold mb-4 font-heading text-white">Choisir un Produit</h2>
            <div className="flex-1 overflow-y-auto space-y-2 pr-2">
                {loadingProducts ? <div className="text-center p-4">Chargement...</div> : (
                    availableProducts.map(p => (
                        <div key={p.id} onClick={() => handleAddProduct(p)} className="p-3 bg-zinc-800 hover:bg-zinc-700 rounded cursor-pointer flex gap-3 items-center transition border border-zinc-700 hover:border-[#d4af37]">
                            {p.imageUrl || p.image ? (
                                <img src={p.imageUrl || p.image} className="w-12 h-12 object-cover rounded bg-black" />
                            ) : <div className="w-12 h-12 bg-black rounded flex items-center justify-center text-xs">No Img</div>}
                            <div>
                                <div className="font-bold text-white">{p.name}</div>
                                <div className="text-xs text-gray-400">{p.category}</div>
                            </div>
                            <div className="ml-auto font-mono text-[#d4af37]">{p.price} ₪</div>
                        </div>
                    ))
                )}
            </div>
             <button onClick={() => setIsPickerOpen(false)} className="mt-4 w-full bg-zinc-800 text-gray-400 py-2 rounded hover:text-white">Fermer</button>
          </div>
        </div>
      )}

      {/* CENTER/RIGHT: HISTORY & PREVIEW */}
      <div className="w-full lg:w-2/3 flex flex-col bg-zinc-900">
        
        {/* Top: PDF Preview Area */}
        <div className="flex-1 p-8 relative min-h-[400px] border-b border-zinc-800">
            <div className="absolute top-4 right-4 z-10 flex gap-2">
                 {/* Language Switcher */}
                <div className="flex bg-zinc-900 rounded border border-zinc-800 p-1">
                    <button onClick={() => setPdfLanguage('fr')} className={`px-3 py-1 text-xs font-bold rounded ${pdfLanguage === 'fr' ? 'bg-[#d4af37] text-black' : 'text-gray-400'}`}>FR</button>
                    <button onClick={() => setPdfLanguage('en')} className={`px-3 py-1 text-xs font-bold rounded ${pdfLanguage === 'en' ? 'bg-[#d4af37] text-black' : 'text-gray-400'}`}>EN</button>
                    <button onClick={() => setPdfLanguage('he')} className={`px-3 py-1 text-xs font-bold rounded ${pdfLanguage === 'he' ? 'bg-[#d4af37] text-black' : 'text-gray-400'}`}>HE</button>
                </div>

                <PDFDownloadLink document={<InvoiceDocument data={pdfData} language={pdfLanguage} docType="invoice" />} fileName={`facture-${pdfData.invoiceNumber}.pdf`}>
                    {({ loading }) => (
                        <button className="bg-zinc-800 hover:bg-zinc-700 text-white font-bold py-2 px-6 rounded-lg shadow-lg flex items-center gap-2 transition border border-zinc-700">
                            <Download size={20} />
                            {loading ? '...' : 'Télécharger le PDF'}
                        </button>
                    )}
                </PDFDownloadLink>
            </div>
            <div className="w-full h-full shadow-2xl rounded-xl overflow-hidden border border-zinc-700 bg-zinc-800">
                <PDFViewer width="100%" height="100%" className="w-full h-full" showToolbar={true}>
                    <InvoiceDocument data={pdfData} language={pdfLanguage} docType="invoice" />
                </PDFViewer>
            </div>
        </div>

        {/* Bottom: Invoice History */}
        <div className="h-1/3 bg-zinc-950 p-6 overflow-hidden flex flex-col">
            <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                <Clock className="text-[#d4af37]" size={20} />
                Historique des Factures
            </h2>
            <div className="flex-1 overflow-y-auto border border-zinc-800 rounded-lg">
                <table className="w-full text-left text-sm">
                    <thead className="bg-zinc-900 text-gray-400 sticky top-0">
                        <tr>
                            <th className="p-3">N° Facture</th>
                            <th className="p-3">Date</th>
                            <th className="p-3">Client</th>
                            <th className="p-3">Montant TTC</th>
                            <th className="p-3">Statut</th>
                            <th className="p-3 text-right">Action</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-800">
                        {loadingHistory ? (
                             <tr><td colSpan="6" className="p-4 text-center text-gray-500">Chargement...</td></tr>
                        ) : invoicesHistory.map(inv => (
                            <tr key={inv.id} className="hover:bg-zinc-900/50">
                                <td className="p-3 font-mono text-zinc-300">{inv.invoiceNumber}</td>
                                <td className="p-3 text-gray-400">{format(new Date(inv.date), 'dd/MM/yyyy')}</td>
                                <td className="p-3 font-medium">{inv.client.name}</td>
                                <td className="p-3 text-[#d4af37] font-bold">{inv.totals?.totalTTC?.toFixed(2)} ₪</td>
                                <td className="p-3">
                                    <button 
                                      onClick={() => handleStatusUpdate(inv.id, inv.status === 'paid' ? 'pending' : 'paid')}
                                      className={`px-2 py-1 rounded text-xs border ${
                                        inv.status === 'paid' 
                                            ? 'border-green-800 bg-green-900/20 text-green-400' 
                                            : 'border-yellow-800 bg-yellow-900/20 text-yellow-400'
                                      }`}
                                    >
                                        {inv.status === 'paid' ? 'Payée' : 'En attente'}
                                    </button>
                                </td>
                                <td className="p-3 text-right">
                                    {/* Ideally we would load this invoice back into the editor or re-generate PDF */}
                                    <button 
                                        onClick={() => {
                                            setInvoiceData({ ...inv, sender: invoiceData.sender }); // Load into preview, keeping current sender settings to avoid override issues if schema differs
                                            setValue('invoiceNumber', inv.invoiceNumber);
                                            // ... other sets
                                            toast.success("Facture chargée dans l'aperçu (Lecture seule)");
                                        }}
                                        className="text-blue-400 hover:underline"
                                    >
                                        Voir
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
      </div>
    </div>
  );
}
