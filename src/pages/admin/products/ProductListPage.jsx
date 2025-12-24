import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ProductService } from '../../../services/product.service';
import { Plus, Pencil, Trash2, Search, Package } from 'lucide-react';
import toast from 'react-hot-toast';

export default function ProductListPage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    setLoading(true);
    const response = await ProductService.getAllProducts();
    if (response.success) {
      setProducts(response.data);
    } else {
      toast.error(response.error);
    }
    setLoading(false);
  };

  const handleDelete = async (id) => {
    if (window.confirm("Êtes-vous sûr de vouloir supprimer ce produit ? Cette action est irréversible.")) {
      const response = await ProductService.deleteProduct(id);
      if (response.success) {
        toast.success("Produit supprimé");
        loadProducts(); // Refresh list
      } else {
        toast.error("Erreur: " + response.error);
      }
    }
  };

  const formatCurrency = (price) => {
    return new Intl.NumberFormat('he-IL', { style: 'currency', currency: 'ILS' }).format(price);
  };

  // Filter logic
  const filteredProducts = products.filter(p => 
    p.name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    p.category?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
           <h1 className="text-3xl font-bold font-heading text-white">Produits</h1>
           <p className="text-gray-400">Gérez votre catalogue</p>
        </div>
        <Link 
          to="/admin/products/new"
          className="flex items-center gap-2 bg-[#d4af37] text-black font-bold px-4 py-2 rounded-lg hover:bg-yellow-500 transition-colors"
        >
          <Plus size={20} />
          Nouveau Produit
        </Link>
        <button 
            onClick={async () => {
                if(confirm("Lancer le renommage automatique (Modello Villes) ?")) {
                    const res = await ProductService.renameDoorsToItalianCities();
                    if(res.success) {
                        toast.success(res.message);
                        loadProducts();
                    } else {
                        toast.error(res.error);
                    }
                }
            }}
            className="flex items-center gap-2 bg-zinc-800 text-gray-300 font-bold px-4 py-2 rounded-lg hover:bg-zinc-700 transition-colors"
        >
            🇮🇹 Rename Doors
        </button>
        <button 
            onClick={async () => {
                if(confirm("Lancer le renommage Poignées (Maniglia Design) ?")) {
                    const res = await ProductService.renameHandlesToItalianDesign();
                    if(res.success) {
                        toast.success(res.message);
                        loadProducts();
                    } else {
                        toast.error(res.error);
                    }
                }
            }}
            className="flex items-center gap-2 bg-zinc-800 text-gray-300 font-bold px-4 py-2 rounded-lg hover:bg-zinc-700 transition-colors"
        >
            🎨 Rename Handles
        </button>
      </div>

      {/* Filters */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
        <input 
          type="text" 
          placeholder="Rechercher un produit..." 
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full bg-zinc-900 border border-zinc-800 rounded-lg pl-10 pr-4 py-3 text-white focus:outline-none focus:border-[#d4af37] transition-colors"
        />
      </div>

      {/* Table */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden shadow-lg">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-gray-400">
            <thead className="bg-zinc-950 text-gray-200 uppercase tracking-wider">
              <tr>
                <th className="px-6 py-4 font-medium">Image</th>
                <th className="px-6 py-4 font-medium">Nom</th>
                <th className="px-6 py-4 font-medium">Catégorie</th>
                <th className="px-6 py-4 font-medium">Prix</th>
                <th className="px-6 py-4 font-medium">Stock</th>
                <th className="px-6 py-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800">
              {loading ? (
                 // Loading Skeleton
                 [...Array(5)].map((_, i) => (
                    <tr key={i} className="animate-pulse">
                      <td className="px-6 py-4"><div className="h-10 w-10 bg-zinc-800 rounded"></div></td>
                      <td className="px-6 py-4"><div className="h-4 w-32 bg-zinc-800 rounded"></div></td>
                      <td className="px-6 py-4"><div className="h-4 w-24 bg-zinc-800 rounded"></div></td>
                      <td className="px-6 py-4"><div className="h-4 w-16 bg-zinc-800 rounded"></div></td>
                      <td className="px-6 py-4"><div className="h-4 w-12 bg-zinc-800 rounded"></div></td>
                      <td className="px-6 py-4"></td>
                    </tr>
                 ))
              ) : filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-6 py-12 text-center text-gray-500">
                    <Package size={48} className="mx-auto mb-2 opacity-20" />
                    Aucun produit trouvé.
                  </td>
                </tr>
              ) : (
                filteredProducts.map((product) => (
                  <tr key={product.id} className="hover:bg-zinc-800/50 transition-colors">
                    <td className="px-6 py-4">
                      {product.imageUrl ? (
                        <img src={product.imageUrl} alt={product.name} className="h-10 w-10 object-cover rounded bg-zinc-800" />
                      ) : (
                        <div className="h-10 w-10 bg-zinc-800 rounded flex items-center justify-center text-gray-600">No Img</div>
                      )}
                    </td>
                    <td className="px-6 py-4 font-medium text-white">{product.name}</td>
                    <td className="px-6 py-4">
                        <span className="bg-zinc-800 text-gray-300 px-2 py-1 rounded text-xs border border-zinc-700">
                            {product.category || 'N/A'}
                        </span>
                    </td>
                    <td className="px-6 py-4 text-[#d4af37] font-bold">{formatCurrency(product.price)}</td>
                    <td className="px-6 py-4">
                        <span className={`px-2 py-1 rounded text-xs font-bold ${
                            Number(product.stock) > 0 ? 'text-green-400 bg-green-400/10' : 'text-red-400 bg-red-400/10'
                        }`}>
                            {product.stock || 0}
                        </span>
                    </td>
                    <td className="px-6 py-4 text-right space-x-2">
                      <Link 
                        to={`/admin/products/edit/${product.id}`}
                        className="inline-flex items-center justify-center p-2 text-blue-400 hover:bg-blue-400/10 rounded-lg transition-colors"
                        title="Modifier"
                      >
                        <Pencil size={18} />
                      </Link>
                      <button 
                        onClick={() => handleDelete(product.id)}
                        className="inline-flex items-center justify-center p-2 text-red-400 hover:bg-red-400/10 rounded-lg transition-colors"
                        title="Supprimer"
                      >
                        <Trash2 size={18} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
