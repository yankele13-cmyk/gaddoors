
import React, { useState, useEffect } from 'react';
import { ProductServiceV2 } from '../../../services/product.service.v2';
import { 
    Search, Plus, Filter, MoreVertical, 
    Edit, Archive, Trash, Eye, EyeOff, RotateCcw, AlertTriangle
} from 'lucide-react';
import toast from 'react-hot-toast';
import ProductEditorForm from '../../../modules/pim/ProductEditorForm';

// Status Badge Component
const StatusBadge = ({ status }) => {
    const styles = {
        active: 'bg-green-500/10 text-green-500 border-green-500/20',
        draft: 'bg-gray-500/10 text-gray-500 border-gray-500/20',
        archived: 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20',
        deleted: 'bg-red-500/10 text-red-500 border-red-500/20'
    };
    const labels = {
        active: 'Actif',
        draft: 'Brouillon',
        archived: 'Archivé',
        deleted: 'Supprimé'
    };
    return (
        <span className={`px-2 py-1 rounded text-xs border ${styles[status] || styles.draft}`}>
            {labels[status] || status}
        </span>
    );
};

export default function ProductManagerPage() {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    
    // Filters
    const [filters, setFilters] = useState({
        search: '',
        status: 'all', // all, active, draft, archived
        category: 'all'
    });

    // Editor (Placeholder for now)
    const [editingProduct, setEditingProduct] = useState(null);
    const [isEditorOpen, setIsEditorOpen] = useState(false);

    const [lastDoc, setLastDoc] = useState(null);
    const [hasMore, setHasMore] = useState(false);

    useEffect(() => {
        loadData(true);
    }, [filters.status, filters.category, filters.search]); // Reload when filters change

    const loadData = async (reset = false) => {
        setLoading(true);
        const currentLastDoc = reset ? null : lastDoc;
        const res = await ProductServiceV2.getProducts(filters, { lastDoc: currentLastDoc, pageSize: 20 });
        
        if (res.success) {
            if (reset) {
                setProducts(res.data);
            } else {
                setProducts(prev => [...prev, ...res.data]);
            }
            setLastDoc(res.lastDoc);
            setHasMore(!res.empty && res.data.length === 20); // Basic heuristic
            setError(null);
        } else {
            setError(res.error);
            toast.error("Erreur chargement produits");
        }
        setLoading(false);
    };

    const handleLoadMore = () => {
        loadData(false);
    };

    // Actions
    const handleToggleVisibility = async (product) => {
        // Optimistic UI
        const newVis = !product.visibility;
        setProducts(prev => prev.map(p => p.id === product.id ? { ...p, visibility: newVis } : p));
        
        const res = await ProductServiceV2.toggleVisibility(product.id, newVis);
        if (!res.success) {
            toast.error("Erreur mise à jour visibilité");
            loadData(); // Revert
        } else {
            toast.success(newVis ? "Produit visible" : "Produit caché");
        }
    };

    const handleDelete = async (id, isSoft = true) => {
        if (!window.confirm(isSoft ? "Mettre à la corbeille ?" : "Supprimer DÉFINITIVEMENT ?")) return;

        const res = isSoft 
            ? await ProductServiceV2.softDeleteProduct(id)
            : await ProductServiceV2.hardDeleteProduct(id);

        if (res.success) {
            toast.success("Produit supprimé");
            loadData();
        } else {
            toast.error(res.error);
        }
    };

    const handleRestore = async (id) => {
        const res = await ProductServiceV2.restoreProduct(id);
        if (res.success) {
            toast.success("Produit restauré");
            loadData();
        } else {
             toast.error(res.error);
        }
    };

    // List to display (already filtered by Service)
    const displayProducts = products;

    return (
        <div className="h-full flex flex-col bg-zinc-950 text-white">
            {/* Toolbar */}
            <div className="p-6 border-b border-zinc-800 bg-black flex flex-col md:flex-row gap-4 justify-between items-center">
                <div>
                   <h1 className="text-2xl font-bold font-heading text-[#d4af37]">Produits</h1>
                   <p className="text-gray-400 text-sm">Gestion avancée du catalogue ({displayProducts.length})</p>
                </div>

                <div className="flex gap-3 w-full md:w-auto">
                    {/* Search */}
                    <div className="relative flex-1 md:w-64">
                        <Search className="absolute left-3 top-2.5 text-gray-500" size={18} />
                        <input 
                            type="text" 
                            placeholder="Rechercher (Nom, SKU)..." 
                            value={filters.search}
                            onChange={e => setFilters({...filters, search: e.target.value})}
                            className="w-full pl-10 pr-4 py-2 bg-zinc-900 border border-zinc-700 rounded-lg text-sm focus:border-gold outline-none"
                        />
                    </div>

                    {/* Status Filter */}
                    <select 
                        value={filters.status} 
                        onChange={e => setFilters({...filters, status: e.target.value})}
                        className="bg-zinc-900 border border-zinc-700 rounded-lg px-3 text-sm focus:border-gold outline-none"
                    >
                        <option value="all">Tous (sauf supprimés)</option>
                        <option value="active">Actifs</option>
                        <option value="draft">Brouillons</option>
                        <option value="archived">Archivés</option>
                        <option value="deleted">Corbeille</option>
                    </select>

                    <button 
                        onClick={() => { setEditingProduct(null); setIsEditorOpen(true); }}
                        className="bg-[#d4af37] text-black font-bold px-4 py-2 rounded-lg hover:bg-yellow-500 flex items-center gap-2"
                    >
                        <Plus size={18} /> Nouveau
                    </button>
                </div>
            </div>

            {/* Table */}
            <div className="flex-1 overflow-auto p-6">
                {error && (
                    <div className="bg-red-900/20 border border-red-900 text-red-500 p-4 rounded-lg mb-4 flex items-center gap-2">
                        <AlertTriangle /> {error}
                    </div>
                )}

                <div className="bg-zinc-900/50 border border-zinc-800 rounded-lg overflow-hidden">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-zinc-900 text-gray-400 text-xs uppercase tracking-wider border-b border-zinc-800">
                                <th className="p-4">Produit</th>
                                <th className="p-4">Catégorie</th>
                                <th className="p-4 text-right">Prix</th>
                                <th className="p-4 text-center">Statut</th>
                                <th className="p-4 text-center">Visibilité</th>
                                <th className="p-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-zinc-800">
                            {loading ? (
                                <tr><td colSpan="6" className="p-8 text-center text-gray-500">Chargement...</td></tr>
                            ) : displayProducts.length === 0 ? (
                                <tr>
                                    <td colSpan="6" className="p-8 text-center text-gray-500">
                                        <div className="flex flex-col items-center gap-2">
                                            <p>Aucun produit trouvé.</p>
                                            <p className="text-xs text-gray-600">Vos produits ne s'affichent pas ? Ils ont peut-être besoin d'une mise à jour.</p>
                                            <button 
                                                onClick={async () => {
                                                    if(!window.confirm("Ceci va mettre à jour le format de vos anciens produits. Continuer ?")) return;
                                                    const toastId = toast.loading("Migration en cours...");
                                                    const res = await ProductServiceV2.migrateLegacyProducts();
                                                    if(res.success) {
                                                        toast.success(`${res.count} produits mis à jour !`, { id: toastId });
                                                        loadData();
                                                    } else {
                                                        toast.error("Erreur: " + res.error, { id: toastId });
                                                    }
                                                }}
                                                className="mt-2 text-[#d4af37] underline hover:text-yellow-400 text-sm"
                                            >
                                                Mettre à jour les anciennes données
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                displayProducts.map(product => (
                                    <tr key={product.id} className="hover:bg-zinc-800/50 transition group">
                                        <td className="p-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded bg-zinc-800 overflow-hidden flex-shrink-0 border border-zinc-700">
                                                    {product.imageUrl ? (
                                                        <img src={product.imageUrl} className="w-full h-full object-cover" alt="" />
                                                    ) : (
                                                        <div className="w-full h-full flex items-center justify-center text-zinc-600 text-xs">IMG</div>
                                                    )}
                                                </div>
                                                <div>
                                                    <div className="font-medium text-white">{product.name}</div>
                                                    <div className="text-xs text-gray-500">{product.sku || 'No SKU'}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="p-4 text-gray-400">{product.category}</td>
                                        <td className="p-4 text-right font-mono text-[#d4af37]">
                                            {product.price} ₪
                                        </td>
                                        <td className="p-4 text-center">
                                            <StatusBadge status={product.status} />
                                        </td>
                                        <td className="p-4 text-center">
                                            <button 
                                                onClick={() => handleToggleVisibility(product)}
                                                className={`p-1.5 rounded hover:bg-white/10 transition ${product.visibility ? 'text-green-500' : 'text-gray-600'}`}
                                                title={product.visibility ? "Visible sur le site" : "Caché du site"}
                                            >
                                                {product.visibility ? <Eye size={18} /> : <EyeOff size={18} />}
                                            </button>
                                        </td>
                                        <td className="p-4 text-right">
                                            <div className="flex justify-end gap-2 opacity-100 sm:opacity-0 group-hover:opacity-100 transition">
                                                {product.status === 'deleted' ? (
                                                     <>
                                                        <button 
                                                            onClick={() => handleRestore(product.id)}
                                                            className="p-2 text-green-500 hover:bg-green-500/10 rounded" title="Restaurer"
                                                        >
                                                            <RotateCcw size={16} />
                                                        </button>
                                                        <button 
                                                            onClick={() => handleDelete(product.id, false)}
                                                            className="p-2 text-red-500 hover:bg-red-500/10 rounded" title="Supprimer définitivement"
                                                        >
                                                            <Trash size={16} />
                                                        </button>
                                                     </>
                                                ) : (
                                                    <>
                                                        <button 
                                                            onClick={() => { setEditingProduct(product); setIsEditorOpen(true); }}
                                                            className="p-2 text-blue-400 hover:bg-blue-400/10 rounded" title="Modifier"
                                                        >
                                                            <Edit size={16} />
                                                        </button>
                                                        <button 
                                                            onClick={() => handleDelete(product.id, true)}
                                                            className="p-2 text-red-400 hover:bg-red-400/10 rounded" title="Supprimer"
                                                        >
                                                            <Trash size={16} />
                                                        </button>
                                                    </>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Load More */}
                {hasMore && !loading && (
                    <div className="flex justify-center mt-6 mb-8">
                        <button 
                            onClick={handleLoadMore}
                            className="bg-zinc-800 text-gray-300 hover:text-white px-6 py-2 rounded-full border border-zinc-700 hover:border-zinc-500 transition text-sm font-medium"
                        >
                            Charger plus de produits
                        </button>
                    </div>
                )}
                
                {loading && products.length > 0 && (
                     <div className="text-center py-4 text-gray-500 text-sm">Chargement de la suite...</div>
                )}
            </div>

            {/* Editor Drawer */}
            {isEditorOpen && (
                <ProductEditorForm 
                    product={editingProduct} 
                    onClose={() => setIsEditorOpen(false)}
                    onSuccess={() => {
                        setIsEditorOpen(false);
                        loadData();
                    }}
                />
            )}
        </div>
    );
}
