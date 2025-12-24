import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm, useFieldArray } from 'react-hook-form';
import { CRMService } from '../../../services/crm.service';
import { ProductService } from '../../../services/product.service';
import { FinanceService } from '../../../services/finance.service';
import { PDFDownloadLink } from '@react-pdf/renderer';
import InvoiceDocument from '../../../components/documents/InvoiceDocument';
import { Plus, Trash2, Save, FileText, Calculator } from 'lucide-react';
import toast from 'react-hot-toast';

export default function QuoteBuilder() {
  const navigate = useNavigate();
  const [leads, setLeads] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [quoteData, setQuoteData] = useState(null); // For PDF Generation

  // Form Setup
  const { register, control, handleSubmit, watch, setValue } = useForm({
    defaultValues: {
      items: [{ productId: "", name: "", price: 0, quantity: 1, description: "" }]
    }
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "items"
  });

  // Watchers for calculations
  const items = watch("items");
  const selectedLeadId = watch("leadId");

  const subtotal = items.reduce((acc, item) => acc + (Number(item.price) * Number(item.quantity)), 0);
  const tax = subtotal * 0.17;
  const total = subtotal + tax;

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    const [leadsRes, productsRes] = await Promise.all([
        CRMService.getAllLeads(),
        ProductService.getAllProducts()
    ]);
    
    if (leadsRes.success) setLeads(leadsRes.data);
    if (productsRes.success) setProducts(productsRes.data);
    setLoading(false);
  };

  const handleProductSelect = (index, productId) => {
      const product = products.find(p => p.id === productId);
      if (product) {
          setValue(`items.${index}.name`, product.name);
          setValue(`items.${index}.price`, product.price);
          setValue(`items.${index}.description`, product.description || ""); // Pre-fill desc but allow edit
          // Snapshot Logic: We just set the values. The user can override them, 
          // but if they don't, these values are what gets saved.
      }
  };

  const onSubmit = async (data) => {
    if (!data.leadId) {
        toast.error("Veuillez sélectionner un client");
        return;
    }

    try {
        const response = await FinanceService.createQuote(data.leadId, data.items);
        if (response.success) {
            toast.success("Devis créé avec succès !");
            
            // Prepare PDF Data
            const selectedLead = leads.find(l => l.id === data.leadId);
            setQuoteData({
                id: response.data.id,
                createdAt: { seconds: Date.now() / 1000 },
                clientName: selectedLead?.name,
                clientPhone: selectedLead?.phone,
                items: data.items.map(item => ({...item, priceAtCreation: item.price})), // Ensure mapping matches PDF expectation
                subtotal,
                tax,
                total,
                currency: 'ILS'
            });
            
            // Optional: Redirect after delay or let user download PDF first
            // navigate('/admin/finance'); 
        } else {
            toast.error("Erreur: " + response.error);
        }
    } catch (error) {
        console.error(error);
        toast.error("Erreur technique");
    }
  };

  return (
    <div className="space-y-6">
       <div className="flex justify-between items-center">
            <div>
                <h1 className="text-3xl font-bold font-heading text-white">Créateur de Devis</h1>
                <p className="text-gray-400">Nouvelle proposition commerciale</p>
            </div>
            {quoteData && (
                 <PDFDownloadLink
                    document={<InvoiceDocument data={quoteData} language="he" />}
                    fileName={`devis_${quoteData.id}.pdf`}
                    className="flex items-center gap-2 bg-red-600 text-white px-4 py-2 rounded font-bold hover:bg-red-700 transition"
                 >
                    {({ loading }) => (loading ? 'Génération PDF...' : 'Télécharger PDF (Hébreu)')}
                 </PDFDownloadLink>
            )}
       </div>

       <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
           
           {/* Left: Configuration */}
           <div className="lg:col-span-2 space-y-6">
                
                {/* Client Selection */}
                <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
                    <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                        <FileText className="text-[#d4af37]" /> Informations Client
                    </h2>
                    <select 
                        {...register("leadId")} 
                        className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-3 text-white focus:border-[#d4af37] outline-none"
                    >
                        <option value="">-- Sélectionner un prospect (CRM) --</option>
                        {leads.map(lead => (
                            <option key={lead.id} value={lead.id}>{lead.name} - {lead.city}</option>
                        ))}
                    </select>
                </div>

                {/* Items Builder */}
                <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
                    <h2 className="text-lg font-bold text-white mb-4">Articles & Prestations</h2>
                    
                    <div className="space-y-4">
                        {fields.map((field, index) => (
                            <div key={field.id} className="bg-zinc-950 p-4 rounded-lg border border-zinc-800 relative group">
                                <button 
                                    type="button" 
                                    onClick={() => remove(index)}
                                    className="absolute top-2 right-2 text-zinc-600 hover:text-red-500 transition-colors"
                                >
                                    <Trash2 size={18} />
                                </button>

                                <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                                    {/* Product Select */}
                                    <div className="md:col-span-4">
                                        <label className="text-xs text-gray-500 mb-1 block">Produit</label>
                                        <select 
                                            {...register(`items.${index}.productId`)}
                                            onChange={(e) => handleProductSelect(index, e.target.value)}
                                            className="w-full bg-zinc-900 border border-zinc-800 rounded p-2 text-white outline-none"
                                        >
                                            <option value="">Sélection libre</option>
                                            {products.map(p => (
                                                <option key={p.id} value={p.id}>{p.name}</option>
                                            ))}
                                        </select>
                                    </div>
                                    
                                    {/* Name/Desc Editing */}
                                    <div className="md:col-span-8">
                                         <label className="text-xs text-gray-500 mb-1 block">Désignation (Editable)</label>
                                         <input 
                                            {...register(`items.${index}.name`)}
                                            className="w-full bg-zinc-900 border border-zinc-800 rounded p-2 text-white font-medium outline-none mb-2"
                                            placeholder="Nom du produit"
                                         />
                                         <textarea 
                                            {...register(`items.${index}.description`)}
                                            rows="2"
                                            className="w-full bg-zinc-900 border border-zinc-800 rounded p-2 text-gray-400 text-sm outline-none resize-none"
                                            placeholder="Détails techniques, options..."
                                         ></textarea>
                                    </div>

                                    {/* Price & Qty */}
                                    <div className="md:col-span-4">
                                         <label className="text-xs text-gray-500 mb-1 block">Prix U. (₪)</label>
                                         <input 
                                            type="number" 
                                            step="0.01"
                                            {...register(`items.${index}.price`)}
                                            className="w-full bg-zinc-900 border border-zinc-800 rounded p-2 text-white outline-none"
                                         />
                                    </div>
                                    <div className="md:col-span-4">
                                         <label className="text-xs text-gray-500 mb-1 block">Quantité</label>
                                         <input 
                                            type="number" 
                                            {...register(`items.${index}.quantity`)}
                                            className="w-full bg-zinc-900 border border-zinc-800 rounded p-2 text-white outline-none"
                                         />
                                    </div>
                                    <div className="md:col-span-4 flex items-end justify-end pb-2">
                                         <span className="text-[#d4af37] font-bold">
                                             {(items[index]?.price * items[index]?.quantity || 0).toFixed(2)} ₪
                                         </span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    <button 
                        type="button"
                        onClick={() => append({ productId: "", name: "", price: 0, quantity: 1, description: "" })}
                        className="mt-4 flex items-center gap-2 text-[#d4af37] hover:text-yellow-400 font-medium transition-colors"
                    >
                        <Plus size={18} /> Ajouter une ligne
                    </button>
                </div>

           </div>

           {/* Right: Totals & Actions */}
           <div className="space-y-6">
                <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 sticky top-6">
                     <h2 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
                         <Calculator className="text-[#d4af37]" /> Totaux
                     </h2>

                     <div className="space-y-4 text-sm">
                         <div className="flex justify-between text-gray-400">
                             <span>Sous-total HT</span>
                             <span>{subtotal.toFixed(2)} ₪</span>
                         </div>
                         <div className="flex justify-between text-gray-400">
                             <span>TVA (17%)</span>
                             <span>{tax.toFixed(2)} ₪</span>
                         </div>
                         <div className="pt-4 border-t border-zinc-800 flex justify-between text-xl font-bold text-white">
                             <span>Total TTC</span>
                             <span className="text-[#d4af37]">{total.toFixed(2)} ₪</span>
                         </div>
                     </div>

                     <button 
                        onClick={handleSubmit(onSubmit)}
                        className="w-full mt-8 bg-[#d4af37] hover:bg-yellow-500 text-black font-bold py-4 rounded-lg flex items-center justify-center gap-2 transition shadow-[0_0_20px_rgba(212,175,55,0.2)]"
                     >
                         <Save size={20} />
                         Enregistrer le Devis
                     </button>
                </div>
           </div>

       </div>
    </div>
  );
}
