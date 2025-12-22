import { useState } from 'react';
import { PDFDownloadLink, PDFViewer } from '@react-pdf/renderer';
import InvoiceDocument from '../../components/admin/finance/InvoiceDocument';
import { Plus, Trash2, FileText, Download, RefreshCw } from 'lucide-react';
import { useForm, useFieldArray } from 'react-hook-form';

export default function FinancePage() {
  const [invoiceData, setInvoiceData] = useState({
    invoiceNumber: 'INV-' + new Date().getFullYear() + '-001',
    date: new Date().toISOString().split('T')[0],
    sender: {
        name: 'GAD DOORS',
        subline: 'Excellence & Sécurité',
        address: 'Aaron Eshkoli 115',
        city: 'Jerusalem',
        phone: '+972 55 278 3693',
        email: 'yankele13@gmail.com',
        footer: 'GAD DOORS - Jerusalem'
    },
    client: { name: 'Client Name', address: '123 Rue...', email: 'client@email.com' },
    items: [{ description: 'Porte Blindée Modèle X', quantity: 1, price: 1500 }],
    taxRate: 20
  });

  const { register, control, watch, handleSubmit } = useForm({
    defaultValues: invoiceData
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "items"
  });

  // Watch for changes to update preview
  const watchedData = watch();

  const handleUpdatePreview = (data) => {
    setInvoiceData(data);
  };

  return (
    <div className="flex flex-col lg:flex-row h-full lg:h-[calc(100vh-64px)] overflow-auto lg:overflow-hidden bg-black text-white">
      {/* LEFT: FORM Formulaire configuration */}
      <div className="w-full lg:w-1/3 border-r border-zinc-800 flex flex-col p-6 bg-zinc-950 overflow-y-auto">
        <div className="mb-6 flex items-center justify-between">
            <h1 className="text-2xl font-bold font-heading text-[#d4af37]">Générateur Facture</h1>
            <button 
                onClick={handleSubmit(handleUpdatePreview)}
                className="p-2 bg-zinc-800 rounded hover:bg-zinc-700 text-gold"
                title="Rafraîchir l'aperçu"
            >
                <RefreshCw size={20} />
            </button>
        </div>

        <form className="space-y-6">
          {/* Section Info Émetteur (NEW) */}
          <div className="space-y-4 border-b border-zinc-800 pb-6">
            <h3 className="font-bold text-gray-400 uppercase text-xs tracking-wider">VOTRE ENTREPRISE</h3>
            <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                    <label className="text-xs text-gray-500 block mb-1">Nom Entreprise</label>
                    <input {...register("sender.name")} className="w-full bg-zinc-900 border border-zinc-700 rounded p-2 text-sm" />
                </div>
                 <div className="col-span-2">
                    <label className="text-xs text-gray-500 block mb-1">Slogan / Sous-titre</label>
                    <input {...register("sender.subline")} className="w-full bg-zinc-900 border border-zinc-700 rounded p-2 text-sm" />
                </div>
                <div className="col-span-2">
                    <label className="text-xs text-gray-500 block mb-1">Adresse</label>
                    <input {...register("sender.address")} className="w-full bg-zinc-900 border border-zinc-700 rounded p-2 text-sm" />
                </div>
                 <div>
                    <label className="text-xs text-gray-500 block mb-1">Ville / CP</label>
                    <input {...register("sender.city")} className="w-full bg-zinc-900 border border-zinc-700 rounded p-2 text-sm" />
                </div>
                <div>
                    <label className="text-xs text-gray-500 block mb-1">Téléphone</label>
                    <input {...register("sender.phone")} className="w-full bg-zinc-900 border border-zinc-700 rounded p-2 text-sm" />
                </div>
                 <div className="col-span-2">
                    <label className="text-xs text-gray-500 block mb-1">Email</label>
                    <input {...register("sender.email")} className="w-full bg-zinc-900 border border-zinc-700 rounded p-2 text-sm" />
                </div>
                 <div className="col-span-2">
                    <label className="text-xs text-gray-500 block mb-1">Pied de page (SIRET, etc)</label>
                    <input {...register("sender.footer")} className="w-full bg-zinc-900 border border-zinc-700 rounded p-2 text-sm" />
                </div>
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
                <input {...register("client.name")} className="w-full bg-zinc-900 border border-zinc-700 rounded p-2 text-sm" />
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
                <button type="button" onClick={() => append({ description: '', quantity: 1, price: 0 })} className="text-[#d4af37] text-xs hover:underline flex items-center gap-1">
                    <Plus size={14} /> Ajouter
                </button>
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
                 <label className="text-xs text-gray-500 block mb-1">Taux TVA (%)</label>
                 <input type="number" {...register("taxRate")} className="w-20 bg-zinc-900 border border-zinc-700 rounded p-2 text-sm" />
           </div>

           <button 
             type="button" 
             onClick={handleSubmit(handleUpdatePreview)}
             className="w-full bg-zinc-800 hover:bg-zinc-700 text-white font-bold py-3 rounded transition flex items-center justify-center gap-2"
           >
             <RefreshCw size={18} /> Mettre à jour l'aperçu
           </button>
        </form>
      </div>

      {/* RIGHT: PREVIEW */}
      <div className="w-full lg:flex-1 bg-zinc-900 flex flex-col items-center justify-center p-8 relative min-h-[500px]">
        <div className="absolute top-4 right-4 z-10">
             <PDFDownloadLink document={<InvoiceDocument data={invoiceData} />} fileName={`facture-${invoiceData.invoiceNumber}.pdf`}>
                {({ loading }) => (
                    <button className="bg-[#d4af37] hover:bg-yellow-500 text-black font-bold py-2 px-6 rounded-lg shadow-lg flex items-center gap-2 transition">
                        <Download size={20} />
                        {loading ? 'Génération...' : 'Télécharger PDF'}
                    </button>
                )}
            </PDFDownloadLink>
        </div>
        
        <div className="w-full h-full shadow-2xl rounded-xl overflow-hidden border border-zinc-700">
            <PDFViewer width="100%" height="100%" className="w-full h-full" showToolbar={true}>
                <InvoiceDocument data={invoiceData} />
            </PDFViewer>
        </div>
      </div>
    </div>
  );
}
