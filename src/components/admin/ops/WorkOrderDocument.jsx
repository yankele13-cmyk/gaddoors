import { MapPin, Phone, Calendar } from 'lucide-react';

export default function WorkOrderDocument({ data }) {
  if (!data) return null;
  const { client, items, logistics, humanId, createdAt } = data; // Note: No financials here

  return (
    <div className="bg-white text-black p-10 max-w-[210mm] mx-auto min-h-[297mm] printable-content relative hidden-on-screen font-mono">
       {/* HEADER */}
      <div className="border-b-4 border-black pb-4 mb-8 flex justify-between items-end">
        <div>
           <h1 className="text-3xl font-bold uppercase">Ordre de Travail</h1>
           <h2 className="text-xl">TEOUDAT AVODA</h2>
           <p className="mt-2 text-sm">Réf: {humanId}</p>
        </div>
        <div className="text-right border-2 border-black p-2 rounded">
           <div className="text-sm font-bold uppercase">Date Création</div>
           <div>{new Date().toLocaleDateString()}</div>
        </div>
      </div>

      {/* SITE INFO */}
      <div className="grid grid-cols-2 gap-8 mb-8">
          <div className="border border-black p-4">
              <h3 className="font-bold border-b border-black mb-2 uppercase flex items-center gap-2"><MapPin size={16} /> Adresse Chantier</h3>
              <div className="text-lg">{client.address}</div>
              <div className="text-lg font-bold">{logistics.zone}</div>
              <div className="mt-2">Étage: {logistics.floor} | Ascenseur: {logistics.hasElevator ? "OUI" : "NON"}</div>
          </div>
          <div className="border border-black p-4">
              <h3 className="font-bold border-b border-black mb-2 uppercase flex items-center gap-2"><Phone size={16} /> Contact Client</h3>
              <div className="text-lg font-bold">{client.name}</div>
              <div className="text-lg">{client.phone}</div>
          </div>
      </div>

      {/* TECHNICAL TABLE */}
      <h3 className="font-bold text-xl uppercase mb-4 border-b-2 border-black inline-block">Liste des Éléments à poser</h3>
      <table className="w-full mb-8 border-collapse border border-black">
        <thead className="bg-gray-200">
           <tr>
             <th className="border border-black p-2 text-center w-16">Qté</th>
             <th className="border border-black p-2 text-left">Description Élément</th>
             <th className="border border-black p-2 text-left">Dimensions</th>
             <th className="border border-black p-2 text-center">Ouverture</th>
             <th className="border border-black p-2 text-left">Pièce</th>
           </tr>
        </thead>
        <tbody>
           {items.map((item, idx) => (
             <tr key={idx}>
                <td className="border border-black p-2 text-center font-bold text-lg">{item.quantity}</td>
                <td className="border border-black p-2 font-bold">{item.name}</td>
                <td className="border border-black p-2">{item.specs?.width || '-'} cm</td>
                <td className="border border-black p-2 text-center uppercase">{item.specs?.opening?.replace('_', ' ') || '-'}</td>
                <td className="border border-black p-2">{item.roomLabel || '-'}</td>
             </tr>
           ))}
        </tbody>
      </table>

      {/* NOTES AREA */}
      <div className="border border-black p-4 h-48 mb-6">
          <h3 className="font-bold uppercase text-xs mb-2">Notes Installateur / Réserves :</h3>
          {/* Empty space for writing */}
      </div>

      {/* SIGNATURES */}
      <div className="flex justify-between mt-12 bg-gray-50 p-6 border border-gray-300">
         <div className="w-1/3 border-t border-black pt-2 text-center text-sm font-bold uppercase">Signature Installateur</div>
         <div className="w-1/3 border-t border-black pt-2 text-center text-sm font-bold uppercase">Signature Client (Fin de Chantier)</div>
      </div>
    </div>
  );
}
