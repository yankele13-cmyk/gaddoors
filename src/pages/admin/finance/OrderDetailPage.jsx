import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { FinanceService } from '../../../services/finance.service';
import { OpsService } from '../../../services/ops.service';
import { PDFDownloadLink } from '@react-pdf/renderer';
import { InvoiceDocument } from '../../../components/documents/InvoiceDocument';
import PaymentModal from './components/PaymentModal';
import { CheckCircle, Clock, AlertTriangle, FileText, UserCog, Hammer, Download, Eye } from 'lucide-react';
import toast from 'react-hot-toast';

const STATUS_OPTIONS = [
    { value: 'pending_payment', label: 'En attente paiement' },
    { value: 'partial_payment', label: 'Payé Partiellement' },
    { value: 'paid', label: 'Payé (A planifier)' },
    { value: 'installation_scheduled', label: 'Installation Planifiée' },
    { value: 'installed', label: 'Installé' },
    { value: 'closed', label: 'Clôturé' },
];

import PDFConfigModal from './components/PDFConfigModal';
import PDFPreviewModal from './components/PDFPreviewModal';
import { Settings } from 'lucide-react';

export default function OrderDetailPage() {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [installers, setInstallers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  
  // PDF Customization State
  const [isPDFConfigOpen, setIsPDFConfigOpen] = useState(false);
  const [previewDoc, setPreviewDoc] = useState(null);
  const [pdfCustomTexts, setPdfCustomTexts] = useState(null);

  useEffect(() => {
    loadData();
  }, [id]);

  // ... (existing loadData and handlers) ...
  const loadData = async () => {
    setLoading(true);
    const orderRes = await FinanceService.getOrderById(id);
    const opsRes = await OpsService.getAllInstallers(); 

    if (orderRes.success) setOrder(orderRes.data);
    else toast.error("Commande introuvable");

    if (opsRes.success) setInstallers(opsRes.data);
    
    setLoading(false);
  };

  const handleStatusChange = async (newStatus) => {
      const res = await FinanceService.updateOrder(id, { status: newStatus });
      if (res.success) {
          setOrder(prev => ({ ...prev, status: newStatus }));
          toast.success("Status mis à jour");
      } else {
          toast.error("Erreur mise à jour");
      }
  };

  const handleInstallerChange = async (installerId) => {
      const res = await FinanceService.updateOrder(id, { installerId });
      if (res.success) {
          setOrder(prev => ({ ...prev, installerId }));
          toast.success("Installateur assigné");
      } else {
          toast.error("Erreur assignation");
      }
  };

  const handlePayment = async (paymentData) => {
      const res = await FinanceService.addPayment(id, paymentData);
      if (res.success) {
          toast.success("Paiement enregistré");
          loadData(); // Reload to refresh totals and status
      } else {
          toast.error("Erreur paiement: " + res.error);
      }
  };

  if (loading) return <div className="p-12 text-center text-[#d4af37]">Chargement de la commande...</div>;
  if (!order) return <div className="p-12 text-center text-red-500">Commande introuvable.</div>;

  const total = Number(order.total) || 0;
  const amountPaid = Number(order.amountPaid) || 0;
  const remaining = total - amountPaid;
  const progress = Math.min(100, Math.max(0, (amountPaid / total) * 100));

  return (
    <div className="space-y-6">
       
       {/* Top Header */}
       <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
                <h1 className="text-3xl font-bold font-heading text-white flex items-center gap-3">
                    Commande #{order.id.substring(0,6)}
                    <span className={`text-sm px-3 py-1 rounded-full border ${
                        order.status === 'paid' || order.status === 'installed' ? 'bg-green-500/10 text-green-500 border-green-500/20' : 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20'
                    }`}>
                        {STATUS_OPTIONS.find(o => o.value === order.status)?.label || order.status}
                    </span>
                </h1>
                <p className="text-gray-400 mt-1">Client: <span className="text-white font-medium">{order.clientName}</span> - {order.city}</p>
            </div>
            
            <div className="flex flex-wrap gap-2">
                {/* PDF Configuration */}
                <button
                    onClick={() => setIsPDFConfigOpen(true)}
                    className="bg-zinc-800 hover:bg-zinc-700 text-gray-300 hover:text-white px-3 py-2 rounded-lg border border-zinc-700 transition"
                    title="Personnaliser les textes PDF"
                >
                    <Settings size={20} />
                </button>

                {/* WORK ORDER ACTIONS */}
                <div className="flex bg-zinc-800 rounded-lg p-1 gap-1 border border-zinc-700">
                    <button 
                        onClick={() => setPreviewDoc({
                            doc: <InvoiceDocument data={order} language="he" isWorkOrder={true} customTexts={pdfCustomTexts} />,
                            name: `ordre_travail_${order.id}.pdf`
                        })}
                        className="text-gray-400 hover:text-white hover:bg-zinc-700 p-2 rounded transition"
                        title="Aperçu Fiche Travail"
                    >
                        <Eye size={18} />
                    </button>
                    <PDFDownloadLink
                        document={<InvoiceDocument data={order} language="he" isWorkOrder={true} customTexts={pdfCustomTexts} />}
                        fileName={`ordre_travail_${order.id}.pdf`}
                        className="text-white hover:bg-zinc-700 px-3 py-2 rounded flex items-center gap-2 transition text-sm font-medium"
                    >
                        <Hammer size={16} /> Fiche Travail
                    </PDFDownloadLink>
                </div>

                {/* QUOTE/INVOICE ACTIONS */}
                <div className="flex bg-[#d4af37] rounded-lg p-1 gap-1 text-black shadow-lg shadow-[#d4af37]/10">
                    <button 
                        onClick={() => setPreviewDoc({
                            doc: <InvoiceDocument data={order} language="he" isWorkOrder={false} customTexts={pdfCustomTexts} />,
                            name: `devis_${order.humanId || order.id}.pdf`
                        })}
                        className="text-black/70 hover:text-black hover:bg-white/20 p-2 rounded transition"
                        title="Aperçu Devis/Facture"
                    >
                        <Eye size={18} />
                    </button>
                    <PDFDownloadLink
                        document={<InvoiceDocument data={order} language="he" isWorkOrder={false} customTexts={pdfCustomTexts} />}
                        fileName={`devis_${order.humanId || order.id}.pdf`}
                        className="text-black font-bold hover:bg-white/20 px-3 py-2 rounded flex items-center gap-2 transition text-sm"
                    >
                        <FileText size={16} /> Devis/Facture
                    </PDFDownloadLink>
                </div>
            </div>
       </div>

       {/* PDF PREVIEW MODAL */}
       <PDFPreviewModal 
          isOpen={!!previewDoc}
          onClose={() => setPreviewDoc(null)}
          document={previewDoc?.doc}
          fileName={previewDoc?.name}
       />

       {/* PDF Config Modal */}
       <PDFConfigModal 
          isOpen={isPDFConfigOpen}
          onClose={() => setIsPDFConfigOpen(false)}
          onSave={setPdfCustomTexts}
          initialConfig={pdfCustomTexts}
       />

       {/* Control Panel (Status & Installer) */}
       <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-xl flex flex-col gap-4">
                <h3 className="text-[#d4af37] font-bold flex items-center gap-2"><CheckCircle size={18}/> Status de la commande</h3>
                <select 
                    value={order.status} 
                    onChange={(e) => handleStatusChange(e.target.value)}
                    className="bg-zinc-950 border border-zinc-700 rounded p-3 text-white outline-none focus:border-[#d4af37]"
                >
                    {STATUS_OPTIONS.map(opt => (
                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                </select>
            </div>
            
            <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-xl flex flex-col gap-4">
                <h3 className="text-[#d4af37] font-bold flex items-center gap-2"><UserCog size={18}/> Installateur (Kablan)</h3>
                <div className="flex gap-2">
                    <select 
                        value={order.installerId || ''} 
                        onChange={(e) => handleInstallerChange(e.target.value)}
                        className="flex-1 bg-zinc-950 border border-zinc-700 rounded p-3 text-white outline-none focus:border-[#d4af37]"
                    >
                        <option value="">-- Non assigné --</option>
                        {installers.map(inst => (
                            <option key={inst.id} value={inst.id}>{inst.name} ({inst.phone})</option>
                        ))}
                    </select>
                </div>
            </div>
       </div>

       {/* Financial Dashboard */}
       <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
            <div className="p-6 border-b border-zinc-800 flex justify-between items-center">
                 <h2 className="text-xl font-bold text-white flex items-center gap-2"><FileText className="text-[#d4af37]" /> Suivi Financier</h2>
                 <button 
                    onClick={() => setIsPaymentModalOpen(true)}
                    className="bg-[#d4af37] hover:bg-yellow-500 text-black font-bold px-4 py-2 rounded flex items-center gap-2 transition shadow-lg"
                 >
                     + Ajouter un Paiement
                 </button>
            </div>

            <div className="p-8 grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
                <div>
                    <div className="text-gray-500 text-sm mb-1 uppercase tracking-wider">Total TTC</div>
                    <div className="text-3xl font-bold text-white">{total.toLocaleString()} ₪</div>
                </div>
                <div>
                    <div className="text-gray-500 text-sm mb-1 uppercase tracking-wider">Déjà Payé</div>
                    <div className="text-3xl font-bold text-green-500">{amountPaid.toLocaleString()} ₪</div>
                </div>
                <div>
                    <div className="text-gray-500 text-sm mb-1 uppercase tracking-wider">Reste à Payer</div>
                    <div className="text-3xl font-bold text-red-500">{remaining.toLocaleString()} ₪</div>
                </div>
            </div>

            {/* Progress Bar */}
            <div className="px-8 pb-8">
                <div className="h-4 bg-zinc-950 rounded-full overflow-hidden border border-zinc-800">
                    <div 
                        className={`h-full transition-all duration-1000 ease-out ${progress === 100 ? 'bg-green-500' : 'bg-gradient-to-r from-red-500 to-yellow-500'}`}
                        style={{ width: `${progress}%` }} 
                    />
                </div>
                <div className="text-right text-xs text-gray-500 mt-2">{progress.toFixed(1)}% Réglé</div>
            </div>

            {/* Payment History Table */}
            <div className="border-t border-zinc-800">
                <table className="w-full text-left text-sm text-gray-400">
                    <thead className="bg-zinc-950 text-gray-200 uppercase">
                        <tr>
                            <th className="px-6 py-4">Date</th>
                            <th className="px-6 py-4">Moyen</th>
                            <th className="px-6 py-4">Réf / Chèque</th>
                            <th className="px-6 py-4 text-right">Montant</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-800">
                        {order.payments && order.payments.length > 0 ? (
                            order.payments.map((pay, idx) => (
                                <tr key={idx} className="hover:bg-zinc-800/50">
                                    <td className="px-6 py-4">{new Date(pay.date).toLocaleDateString()}</td>
                                    <td className="px-6 py-4 capitalize text-white">{pay.type}</td>
                                    <td className="px-6 py-4">
                                        {pay.type === 'check' 
                                            ? `Chq #${pay.reference} (${pay.bankName})` 
                                            : pay.reference || '-'
                                        }
                                    </td>
                                    <td className="px-6 py-4 text-right font-bold text-green-500">
                                        {pay.amount.toLocaleString()} ₪
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="4" className="px-6 py-8 text-center text-gray-600 italic">Aucun paiement enregistré</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
       </div>

       <PaymentModal 
         isOpen={isPaymentModalOpen}
         onClose={() => setIsPaymentModalOpen(false)}
         remainingAmount={remaining}
         onSubmit={handlePayment}
       />

    </div>
  );
}
