import { useState, useEffect } from 'react';
import { ProductService } from '../../services/product.service'; // NEW
import { Plus, Search, Edit, Trash2, Package } from 'lucide-react';
import toast from 'react-hot-toast';

export default function ProductList({ onEdit }) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      const { data } = await ProductService.getAllProducts();
      setProducts(data || []);
    } catch (error) {
      console.error(error);
      toast.error("Erreur chargement produits");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if(window.confirm("Supprimer ce produit ?")) {
      try {
        await ProductService.deleteProduct(id);
        setProducts(products.filter(p => p.id !== id));
        toast.success("Produit supprimé");
      } catch (error) {
        toast.error("Erreur suppression");
      }
    }
  };

  const filteredProducts = products.filter(p => 
    p.name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    p.category?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) return <div className="text-center p-8 text-gray-500">Chargement...</div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
         <div className="relative w-full max-w-sm">
            <Search className="absolute left-3 top-2.5 text-gray-500 w-4 h-4" />
            <input 
              type="text" 
              placeholder="Rechercher..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-zinc-900 border border-zinc-800 rounded-lg pl-10 pr-4 py-2 text-white focus:border-[#d4af37] outline-none"
            />
         </div>
         <button 
           onClick={() => onEdit(null)} // null = New Product
           className="flex items-center gap-2 bg-[#d4af37] hover:bg-yellow-500 text-black font-bold py-2 px-4 rounded-lg transition"
         >
            <Plus size={20} />
            Nouveau Produit
         </button>
      </div>

      <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-zinc-950 text-gray-500 uppercase text-xs">
            <tr>
              <th className="p-4">Image</th>
              <th className="p-4">Nom</th>
              <th className="p-4">Catégorie</th>
              <th className="p-4 text-right">Prix (NIS)</th>
              <th className="p-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-800">
            {filteredProducts.length === 0 ? (
                <tr><td colSpan="5" className="p-8 text-center text-gray-500">Aucun produit trouvé.</td></tr>
            ) : filteredProducts.map(product => (
              <tr key={product.id} className="hover:bg-zinc-800/50 transition">
                <td className="p-4">
                  {product.image ? (
                    <img src={product.image} alt={product.name} className="w-12 h-12 object-cover rounded bg-zinc-800" />
                  ) : (
                    <div className="w-12 h-12 bg-zinc-800 rounded flex items-center justify-center text-gray-600">
                        <Package size={20} />
                    </div>
                  )}
                </td>
                <td className="p-4 font-bold text-white">{product.name}</td>
                <td className="p-4 text-gray-400">
                    <span className="px-2 py-1 bg-zinc-800 rounded text-xs">{product.category}</span>
                </td>
                <td className="p-4 text-right font-mono text-[#d4af37]">{product.price?.toLocaleString()}</td>
                <td className="p-4 text-right">
                  <div className="flex justify-end gap-2">
                    <button onClick={() => onEdit(product)} className="p-2 text-blue-400 hover:bg-blue-900/20 rounded">
                      <Edit size={18} />
                    </button>
                    <button onClick={() => handleDelete(product.id)} className="p-2 text-red-400 hover:bg-red-900/20 rounded">
                      <Trash2 size={18} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
