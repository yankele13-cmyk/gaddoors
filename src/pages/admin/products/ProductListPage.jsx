import { useState, useEffect } from 'react';
import { ProductService } from '../../../services/product.service'; // NEW Service
import { Plus, Search, Filter, RefreshCw, Edit, Trash2, ArrowDown, Package } from 'lucide-react';
import ProductForm from '../../../modules/pim/ProductForm';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';

export default function ProductListPage() {
  const { t } = useTranslation();
  const [products, setProducts] = useState([]);
  const [lastDoc, setLastDoc] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Modal State
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);

  useEffect(() => {
    loadProducts();
  }, []);

  // Pagination & Filtering
  const loadProducts = async (isRefresh = false) => {
    setLoading(true);
    try {
      // If refresh, clear lastDoc
      const cursor = isRefresh ? null : null; 
      const { items, lastDoc: last } = await ProductService.getPage(cursor, 20);
      setProducts(items);
      setLastDoc(last);
      setHasMore(items.length === 20);
    } catch (error) {
       console.error(error);
       toast.error(t('admin.products.loadError') || "Erreur chargement");
    } finally {
      setLoading(false);
    }
  };

  const loadMore = async () => {
    if (!lastDoc) return;
    setLoadingMore(true);
    try {
      const { items, lastDoc: last } = await ProductService.getPage(lastDoc, 20);
      setProducts(prev => [...prev, ...items]);
      setLastDoc(last);
      if (items.length < 20) setHasMore(false);
    } catch (error) {
      toast.error("Erreur chargement suite");
    } finally {
      setLoadingMore(false);
    }
  };

  const handleDelete = async (id) => {
    if(window.confirm(t('admin.common.confirmDelete') || "Supprimer ?")) {
        try {
            await ProductService.deleteProduct(id);
            setProducts(products.filter(p => p.id !== id));
            toast.success(t('admin.common.deleted') || "Supprimé");
        } catch (error) {
            toast.error(t('admin.common.error') || "Erreur");
        }
    }
  };

  const formatCurrency = (price) => {
    return new Intl.NumberFormat('he-IL', { style: 'currency', currency: 'ILS', minimumFractionDigits: 0 }).format(price);
  };

  const filteredProducts = products.filter(p => 
    p.name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    p.category?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
           <h1 className="text-3xl font-bold font-heading text-white">Produits</h1>
           <p className="text-gray-400">Gérez votre catalogue</p>
        </div>
        <button 
          onClick={() => {
            setEditingProduct(null); // Create mode
            setIsFormOpen(true);
          }}
          className="flex items-center gap-2 bg-[#d4af37] text-black font-bold px-4 py-2 rounded-lg hover:bg-yellow-500 transition-colors"
        >
          <Plus size={20} />
          {t('admin.title.new') || "Nouveau"}
        </button>
      </div>

      {/* Filters */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
        <input 
          type="text" 
          placeholder="Rechercher..." 
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
                <th className="px-6 py-4 font-medium">{t('admin.form.image') || "Image"}</th>
                <th className="px-6 py-4 font-medium">{t('admin.form.name') || "Nom"}</th>
                <th className="px-6 py-4 font-medium">{t('admin.form.category') || "Catégorie"}</th>
                <th className="px-6 py-4 font-medium">{t('admin.form.price') || "Prix"}</th>
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
                            {product.category || 'N/A'}
                        </span>
                    </td>
                    <td className="px-6 py-4 text-[#d4af37] font-bold">{formatCurrency(product.price)}</td>
                    <td className="px-6 py-4 text-right space-x-2">
                      <button 
                        onClick={() => {
                            setEditingProduct(product);
                            setIsFormOpen(true);
                        }}
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
                    onClick={loadMore}
                    disabled={loadingMore}
                    className="flex items-center gap-2 text-[#d4af37] hover:text-white transition disabled:opacity-50 font-medium text-sm"
                >
                    {loadingMore ? 'Chargement...' : (
                        <>
                            <ArrowDown size={16} />
                            Voir plus
                        </>
                    )}
                </button>
            </div>
        )}
      </div>

      {/* Product Modal */}
      {isFormOpen && (
        <ProductForm 
            product={editingProduct}
            onClose={() => setIsFormOpen(false)} 
            onSuccess={() => {
                setIsFormOpen(false);
                loadProducts(true); // Refresh list
            }} 
        />
      )}
    </div>
  );
}
