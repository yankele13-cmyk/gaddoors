import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { productsService } from '../../../services/products.service';
import { Plus, Edit, Trash2, Search, ArrowDown, Package } from 'lucide-react';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';

export default function ProductListPage() {
  const { t } = useTranslation();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [lastDoc, setLastDoc] = useState(null);
  const [hasMore, setHasMore] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();

  const fetchProducts = async (isLoadMore = false) => {
    try {
      setLoading(true);
      const cursor = isLoadMore ? lastDoc : null;
      // Note: Search relies on client-side filtering for now as Firestore full-text search requires Algolia/Typesense.
      // Pagination works on the full dataset. Mixed usage (search + pagination) in Firestore is complex.
      // For this step, we prioritize Pagination on the main list.
      const { items, lastDoc: newLastDoc } = await productsService.getPage(cursor);
      
      if (isLoadMore) {
        setProducts(prev => [...prev, ...items]);
      } else {
        setProducts(items);
      }

      setLastDoc(newLastDoc);
      
      // If we got fewer items than requested (default 20), we reached the end
      if (items.length < 20) {
        setHasMore(false);
      } else {
          setHasMore(true);
      }

    } catch (error) {
      console.error(error);
      toast.error("Erreur chargement produits");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleDelete = async (id) => {
    if (window.confirm('Supprimer ce produit ?')) {
      try {
        await productsService.delete(id);
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

  const formatCurrency = (price) => {
    return new Intl.NumberFormat('he-IL', { style: 'currency', currency: 'ILS' }).format(price);
  };

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
           <h1 className="text-3xl font-bold font-heading text-white">Produits</h1>
           <p className="text-gray-400">Gérez votre catalogue</p>
        </div>
        <button 
          onClick={() => navigate('/admin/products/new')}
          className="flex items-center gap-2 bg-[#d4af37] text-black font-bold px-4 py-2 rounded-lg hover:bg-yellow-500 transition-colors"
        >
          <Plus size={20} />
          {t('admin.title.new')}
        </button>
      </div>

      {/* Filters */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
        <input 
          type="text" 
          placeholder="Rechercher un produit dans la liste chargée..." 
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
                <th className="px-6 py-4 font-medium">{t('admin.form.image')}</th>
                <th className="px-6 py-4 font-medium">{t('admin.form.name')}</th>
                <th className="px-6 py-4 font-medium">{t('admin.form.category')}</th>
                <th className="px-6 py-4 font-medium">{t('admin.form.price')}</th>
                <th className="px-6 py-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800">
              {filteredProducts.length === 0 && !loading ? (
                <tr>
                  <td colSpan="5" className="px-6 py-12 text-center text-gray-500">
                    <Package size={48} className="mx-auto mb-2 opacity-20" />
                    Aucun produit trouvé.
                  </td>
                </tr>
              ) : (
                filteredProducts.map((product) => (
                  <tr key={product.id} className="hover:bg-zinc-800/50 transition-colors">
                    <td className="px-6 py-4">
                      {product.image ? (
                        <img src={product.image} alt={product.name} className="h-10 w-10 object-cover rounded bg-zinc-800" />
                      ) : (
                        <div className="h-10 w-10 bg-zinc-800 rounded flex items-center justify-center text-gray-600">No Img</div>
                      )}
                    </td>
                    <td className="px-6 py-4 font-medium text-white">{product.name}</td>
                    <td className="px-6 py-4">
                        <span className="bg-zinc-800 text-gray-300 px-2 py-1 rounded text-xs border border-zinc-700">
                            {product.category ? t(`categories.${product.category}`, product.category) : 'N/A'}
                        </span>
                    </td>
                    <td className="px-6 py-4 text-[#d4af37] font-bold">{formatCurrency(product.price)}</td>
                    <td className="px-6 py-4 text-right space-x-2">
                      <button 
                        onClick={() => navigate(`/admin/products/edit/${product.id}`)}
                        className="inline-flex items-center justify-center p-2 text-blue-400 hover:bg-blue-400/10 rounded-lg transition-colors"
                        title="Modifier"
                      >
                        <Edit size={18} />
                      </button>
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
        
        {/* Load More Button */}
        {hasMore && !searchTerm && (
            <div className="p-4 border-t border-zinc-800 flex justify-center bg-zinc-950/50">
                <button 
                    onClick={() => fetchProducts(true)}
                    disabled={loading}
                    className="flex items-center gap-2 text-[#d4af37] hover:text-white transition disabled:opacity-50 font-medium text-sm"
                >
                    {loading ? 'Chargement...' : (
                        <>
                            <ArrowDown size={16} />
                            Voir plus de produits
                        </>
                    )}
                </button>
            </div>
        )}
      </div>
    </div>
  );
}
