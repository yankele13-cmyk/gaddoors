import { APP_CONFIG } from '../../../config/constants';
import { Phone, Mail, MapPin } from 'lucide-react';

export default function QuoteDocument({ data }) {
  if (!data) return null;
  const { client, items, logistics, financials, humanId, createdAt } = data;
  
  // Date formatting helper
  const formatDate = (ts) => {
    if (!ts) return new Date().toLocaleDateString();
    // Handle Firestore Timestamp or serialized date
    return ts.seconds ? new Date(ts.seconds * 1000).toLocaleDateString() : new Date(ts).toLocaleDateString();
  };

  return (
    <div className="bg-white text-black p-10 max-w-[210mm] mx-auto min-h-[297mm] printable-content relative hidden-on-screen">
      {/* HEADER */}
      <div className="flex justify-between items-start border-b-2 border-black pb-6 mb-8">
        <div>
           <h1 className="text-4xl font-bold font-heading uppercase tracking-widest mb-2">{APP_CONFIG.COMPANY_NAME}</h1>
           <div className="text-sm space-y-1">
              <p><a href="https://www.google.com/maps/search/?api=1&query=Aaron+Eshkoli+115+Jerusalem" target="_blank" rel="noopener noreferrer" style={{color: 'inherit', textDecoration: 'none'}}>Aaron Eshkoli 115, Jerusalem</a></p>
              <p>Tel: +972 55 278 3693</p>
              <p>Email: contact@gaddoors.com</p>
           </div>
        </div>
        <div className="text-right">
           <h2 className="text-2xl font-bold text-gray-800">DEVIS / PROFORMA</h2>
           <p className="font-mono text-xl mt-2">{humanId || 'BROUILLON'}</p>
           <p className="text-sm text-gray-500 mt-1">Date: {formatDate(createdAt)}</p>
        </div>
      </div>

      {/* CLIENT INFO */}
      <div className="bg-gray-100 p-6 rounded-lg mb-8 flex justify-between">
         <div>
            <h3 className="font-bold uppercase text-xs text-gray-500 mb-2">Destinataire</h3>
            <div className="font-bold text-lg">{client.name}</div>
            <div>{client.address}</div>
            <div>{logistics.zone}</div>
         </div>
         <div className="text-right">
            <h3 className="font-bold uppercase text-xs text-gray-500 mb-2">Contact</h3>
            <div>{client.phone}</div>
            <div>{client.email}</div>
         </div>
      </div>

      {/* ITEMS TABLE */}
      <table className="w-full mb-8">
        <thead className="border-b-2 border-black">
           <tr className="text-left text-sm uppercase font-bold">
             <th className="py-3">Désignation</th>
             <th className="py-3 text-center">Qté</th>
             <th className="py-3 text-right">P.U. HT</th>
             <th className="py-3 text-right">Total HT</th>
           </tr>
        </thead>
        <tbody className="divide-y divide-gray-300">
           {items.map((item, idx) => (
             <tr key={idx} className="text-sm">
                <td className="py-4">
                   <div className="font-bold">{item.name}</div>
                   {item.specs && (
                     <div className="text-xs text-gray-500 mt-1 space-x-2">
                        <span>{item.specs.width}cm</span>
                        <span>• {item.specs.opening === 'droit' ? 'Droit' : 'Gauche'}</span>
                        {item.roomLabel && <span>• ({item.roomLabel})</span>}
                     </div>
                   )}
                </td>
                <td className="py-4 text-center">{item.quantity}</td>
                <td className="py-4 text-right">{item.priceSnapshot?.toLocaleString()} ₪</td>
                <td className="py-4 text-right font-bold">{(item.priceSnapshot * item.quantity).toLocaleString()} ₪</td>
             </tr>
           ))}
        </tbody>
      </table>

      {/* FOOTER TOTALS */}
      <div className="flex justify-end mb-12">
         <div className="w-1/2 space-y-3">
             <div className="flex justify-between text-sm">
                <span>Sous-Total HT</span>
                <span className="font-mono">{(financials.subTotal - financials.logisticsCost).toLocaleString()} ₪</span>
             </div>
             <div className="flex justify-between text-sm">
                <span>Livraison {logistics.floor > 0 ? `(Étage ${logistics.floor})` : ''}</span>
                <span className="font-mono">{financials.logisticsCost.toLocaleString()} ₪</span>
             </div>
             <div className="flex justify-between text-sm pt-2 border-t border-gray-300">
                <span>TVA ({financials.vatRate * 100}%)</span>
                <span className="font-mono">{financials.vatAmount.toLocaleString()} ₪</span>
             </div>
             <div className="flex justify-between text-xl font-bold bg-black text-white p-3 rounded">
                <span>TOTAL TTC</span>
                <span>{financials.totalGt.toLocaleString()} ₪</span>
             </div>
         </div>
      </div>

      {/* TERMS */}
      <div className="text-xs text-gray-500 border-t border-gray-300 pt-4 absolute bottom-10 inset-x-10">
         <p className="mb-1 font-bold uppercase">Conditions Générales :</p>
         <ul className="list-disc pl-4 space-y-1">
            <li>Ce devis est valable 14 jours.</li>
            <li>Un acompte de 30% est requis pour valider la commande.</li>
            <li>Les délais de livraison sont donnés à titre indicatif.</li>
         </ul>
      </div>
    </div>
  );
}
