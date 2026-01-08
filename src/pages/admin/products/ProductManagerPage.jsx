import React, { useState, useEffect } from 'react';
import { ProductService as ProductServiceV2 } from '../../../services/product.service'; // Aliased for compatibility
import { 
    Search, Plus, Filter, MoreVertical, 
    Edit, Archive, Trash, Eye, EyeOff, RotateCcw, AlertTriangle, CheckSquare, Square, Save, X
} from 'lucide-react';
import toast from 'react-hot-toast';
import ProductEditorForm from '../../../modules/pim/ProductEditorForm';
import ProductActionsBar from '../../../modules/pim/ProductActionsBar';

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

// Inline Editable Cell
const EditableCell = ({ value, type = "text", onSave, disabled = false }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [tempValue, setTempValue] = useState(value);

    useEffect(() => { setTempValue(value); }, [value]);

    const handleSave = () => {
        if (tempValue != value) {
            onSave(tempValue);
        }
        setIsEditing(false);
    };

    if (disabled) return <span className="text-gray-500/50 cursor-not-allowed">{value}</span>;

    if (isEditing) {
        return (
            <div className="flex items-center gap-1">
                <input 
                    type={type}
                    value={tempValue} 
                    onChange={e => setTempValue(e.target.value)}
                    className="w-20 bg-black border border-[#d4af37] px-1 py-0.5 rounded text-sm focus:outline-none"
                    autoFocus
                    onBlur={handleSave}
                    onKeyDown={(e) => e.key === 'Enter' && handleSave()}
                />
            </div>
        );
    }

    return (
        <div 
            onClick={() => setIsEditing(true)} 
            className="cursor-pointer hover:text-[#d4af37] hover:bg-white/5 py-1 px-2 rounded -mx-2 transition border border-transparent hover:border-zinc-700"
        >
            {value}
        </div>
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

    // Selection
    const [selectedIds, setSelectedIds] = useState([]);

    // Editor
    const [editingProduct, setEditingProduct] = useState(null);
    const [isEditorOpen, setIsEditorOpen] = useState(false);

    const [lastDoc, setLastDoc] = useState(null);
    const [hasMore, setHasMore] = useState(false);

    useEffect(() => {
        loadData(true);
        setSelectedIds([]); // Reset selection on filter change
    }, [filters.status, filters.category, filters.search]); 

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
            setHasMore(!res.empty && res.data.length === 20); 
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

    // --- Actions ---

    const handleToggleVisibility = async (product) => {
        const newVis = !product.visibility;
        // Optimistic UI
        setProducts(prev => prev.map(p => p.id === product.id ? { ...p, visibility: newVis } : p));
        
        const res = await ProductServiceV2.toggleVisibility(product.id, newVis);
        if (!res.success) {
            toast.error("Erreur mise à jour visibilité");
            loadData(true); // Revert
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
            setProducts(prev => prev.filter(p => p.id !== id));
            setSelectedIds(prev => prev.filter(pid => pid !== id));
        } else {
            toast.error(res.error);
        }
    };

    const handleRestore = async (id) => {
        const res = await ProductServiceV2.restoreProduct(id);
        if (res.success) {
            toast.success("Produit restauré");
            loadData(true);
        } else {
             toast.error(res.error);
        }
    };

    // --- Inline Editing ---

    const handleInlineUpdate = async (id, field, value) => {
        // Optimistic Update
        const oldProducts = [...products];
        setProducts(prev => prev.map(p => p.id === id ? { ...p, [field]: Number(value) } : p));

        const res = await ProductServiceV2.updateProduct(id, { [field]: Number(value) });
        
        if (!res.success) {
            toast.error("Échec de la mise à jour");
            setProducts(oldProducts); // Revert
        } else {
            toast.success(`${field === 'price' ? 'Prix' : 'Stock'} mis à jour`);
        }
    };

    // --- Bulk Actions ---

    const toggleSelection = (id) => {
        setSelectedIds(prev => 
            prev.includes(id) ? prev.filter(p => p !== id) : [...prev, id]
        );
    };

    const toggleAll = () => {
        if (selectedIds.length === products.length) {
            setSelectedIds([]);
        } else {
            setSelectedIds(products.map(p => p.id));
        }
    };

    const handleBulkAction = async (actionType, ids) => {
        if (!window.confirm(`Appliquer l'action "${actionType}" sur ${ids.length} produits ?`)) return;

        const toastId = toast.loading("Traitement en cours...");
        let successCount = 0;
        let errors = 0;

        // Note: Ideally move this loop to Service for batching, 
        // but for Firestore 500 items limit, loop is acceptable for MVP.
        for (const id of ids) {
            let res;
            switch(actionType) {
                case 'soft_delete':
                    res = await ProductServiceV2.softDeleteProduct(id);
                    break;
                case 'archive':
                    res = await ProductServiceV2.updateProduct(id, { status: 'archived', visibility: false });
                    break;
                case 'visible':
                    res = await ProductServiceV2.toggleVisibility(id, true);
                    break;
                case 'hidden':
                    res = await ProductServiceV2.toggleVisibility(id, false);
                    break;
            }
            if (res.success) successCount++;
            else errors++;
        }

        toast.dismiss(toastId);
        if (errors > 0) toast.warning(`${successCount} réussis, ${errors} échecs.`);
        else toast.success("Action groupée terminée !");

        setSelectedIds([]);
        loadData(true);
    };

    const displayProducts = products;

    return (
        <div className="h-full flex flex-col bg-zinc-950 text-white relative">
            
            <ProductActionsBar 
                selectedIds={selectedIds} 
                onClearSelection={() => setSelectedIds([])} 
                onAction={handleBulkAction}
            />

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
            <div className="flex-1 overflow-auto p-6 pb-24"> 
                {error && (
                    <div className="bg-red-900/20 border border-red-900 text-red-500 p-4 rounded-lg mb-4 flex items-center gap-2">
                        <AlertTriangle /> {error}
                    </div>
                )}

                <div className="bg-zinc-900/50 border border-zinc-800 rounded-lg overflow-hidden">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-zinc-900 text-gray-400 text-xs uppercase tracking-wider border-b border-zinc-800">
                                <th className="p-4 w-10">
                                    <button onClick={toggleAll} className="hover:text-white transition">
                                        {selectedIds.length === products.length && products.length > 0 ? (
                                            <CheckSquare size={18} className="text-[#d4af37]" />
                                        ) : (
                                            <Square size={18} />
                                        )}
                                    </button>
                                </th>
                                <th className="p-4">Produit</th>
                                <th className="p-4">Catégorie</th>
                                <th className="p-4 text-right cursor-help" title="Cliquez sur le prix pour modifier">Prix</th>
                                <th className="p-4 text-right cursor-help" title="Cliquez sur le stock pour modifier">Stock</th>
                                <th className="p-4 text-center">Statut</th>
                                <th className="p-4 text-center">Visibilité</th>
                                <th className="p-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-zinc-800">
                            {loading && products.length === 0 ? (
                                <tr><td colSpan="8" className="p-8 text-center text-gray-500">Chargement...</td></tr>
                            ) : displayProducts.length === 0 ? (
                                <tr>
                                    <td colSpan="8" className="p-8 text-center text-gray-500">
                                        Aucun produit trouvé.
                                    </td>
                                </tr>
                            ) : (
                                displayProducts.map(product => (
                                    <tr key={product.id} className={`hover:bg-zinc-800/50 transition group ${selectedIds.includes(product.id) ? 'bg-[#d4af37]/5' : ''}`}>
                                        <td className="p-4">
                                            <button onClick={() => toggleSelection(product.id)} className="text-gray-500 hover:text-white transition">
                                                {selectedIds.includes(product.id) ? (
                                                    <CheckSquare size={18} className="text-[#d4af37]" />
                                                ) : (
                                                    <Square size={18} />
                                                )}
                                            </button>
                                        </td>
                                        <td className="p-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded bg-zinc-800 overflow-hidden flex-shrink-0 border border-zinc-700 relative">
                                                    {product.imageUrl ? (
                                                        <img src={product.imageUrl} className="w-full h-full object-cover" alt="" />
                                                    ) : (
                                                        <div className="w-full h-full flex items-center justify-center text-zinc-600 text-xs">IMG</div>
                                                    )}
                                                    {product.hasVariants && (
                                                        <div className="absolute bottom-0 right-0 bg-blue-500 text-[8px] px-1 font-bold text-white">VAR</div>
                                                    )}
                                                </div>
                                                <div>
                                                    <div className="font-medium text-white">{product.name}</div>
                                                    <div className="text-xs text-gray-500">{product.sku || 'No SKU'}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="p-4 text-gray-400">{product.category}</td>
                                        
                                        {/* Editable Price */}
                                        <td className="p-4 text-right font-mono text-[#d4af37]">
                                            <EditableCell 
                                                value={product.price} 
                                                type="number" 
                                                onSave={(val) => handleInlineUpdate(product.id, 'price', val)} 
                                            />
                                        </td>

                                        {/* Editable Stock */}
                                        <td className="p-4 text-right font-mono text-gray-300">
                                            <EditableCell 
                                                value={product.stock} 
                                                type="number" 
                                                disabled={product.hasVariants} // Disable global stock edit if variants
                                                onSave={(val) => handleInlineUpdate(product.id, 'stock', val)} 
                                            />
                                        </td>

                                        <td className="p-4 text-center">
                                            <StatusBadge status={product.status} />
                                        </td>
                                        <td className="p-4 text-center">
                                            <button 
                                                onClick={() => handleToggleVisibility(product)}
                                                className={`p-1.5 rounded hover:bg-white/10 transition ${product.visibility ? 'text-green-500' : 'text-gray-600'}`}
                                            >
                                                {product.visibility ? <Eye size={18} /> : <EyeOff size={18} />}
                                            </button>
                                        </td>
                                        <td className="p-4 text-right">
                                            <div className="flex justify-end gap-2 opacity-100 sm:opacity-0 group-hover:opacity-100 transition">
                                                {product.status === 'deleted' ? (
                                                     <>
                                                        <button onClick={() => handleRestore(product.id)} className="p-2 text-green-500 hover:bg-green-500/10 rounded">
                                                            <RotateCcw size={16} />
                                                        </button>
                                                        <button onClick={() => handleDelete(product.id, false)} className="p-2 text-red-500 hover:bg-red-500/10 rounded">
                                                            <Trash size={16} />
                                                        </button>
                                                     </>
                                                ) : (
                                                    <>
                                                        <button onClick={() => { setEditingProduct(product); setIsEditorOpen(true); }} className="p-2 text-blue-400 hover:bg-blue-400/10 rounded">
                                                            <Edit size={16} />
                                                        </button>
                                                        <button onClick={() => handleDelete(product.id, true)} className="p-2 text-red-400 hover:bg-red-400/10 rounded">
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
                        <button onClick={handleLoadMore} className="bg-zinc-800 text-gray-300 hover:text-white px-6 py-2 rounded-full border border-zinc-700 hover:border-zinc-500 transition text-sm font-medium">
                            Charger plus de produits
                        </button>
                    </div>
                )}
            </div>

            {/* Editor Drawer */}
            {isEditorOpen && (
                <ProductEditorForm 
                    product={editingProduct} 
                    onClose={() => setIsEditorOpen(false)}
                    onSuccess={() => {
                        setIsEditorOpen(false);
                        loadData(true);
                    }}
                />
            )}
        </div>
    );
}
