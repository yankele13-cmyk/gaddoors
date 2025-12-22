import { useState, useEffect } from 'react';
import { getProducts, addProduct, updateProduct, deleteProduct, uploadProductImage } from '../../services/db';
import { Plus, Edit2, Trash2, X, Search, Package, Image as ImageIcon } from 'lucide-react';
import { useForm } from 'react-hook-form';

export default function ProductsPage() {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [uploading, setUploading] = useState(false);

  const { register, handleSubmit, reset, setValue } = useForm();

  useEffect(() => {
    fetchProducts();
  }, []);

  useEffect(() => {
    if (searchTerm === '') {
      setFilteredProducts(products);
    } else {
      const lower = searchTerm.toLowerCase();
      setFilteredProducts(products.filter(p => 
        p.name?.toLowerCase().includes(lower) || 
        p.category?.toLowerCase().includes(lower)
      ));
    }
  }, [searchTerm, products]);

  async function fetchProducts() {
    try {
      const data = await getProducts();
      setProducts(data);
      setFilteredProducts(data);
    } catch (error) {
      console.error("Error fetching products:", error);
    } finally {
      setLoading(false);
    }
  }

  const openModal = (product = null) => {
    setEditingProduct(product);
    if (product) {
      setValue('name', product.name);
      setValue('category', product.category);
      setValue('price', product.price);
      setValue('description', product.description || product.desc); // Handle both fields
      setValue('image', product.image);
    } else {
      reset();
    }
    setShowModal(true);
  };

  const onSubmit = async (data) => {
    try {
      setUploading(true);
      let imageUrl = data.image; // Keep existing URL if no new file

      // Handle File Upload
      if (data.imageFile && data.imageFile[0]) {
        imageUrl = await uploadProductImage(data.imageFile[0]);
      }

      const productData = {
        name: data.name,
        category: data.category,
        price: data.price,
        description: data.description,
        image: imageUrl || '' // Store the URL
      };

      if (editingProduct) {
        await updateProduct(editingProduct.id, productData);
      } else {
        await addProduct(productData);
      }

      await fetchProducts();
      setShowModal(false);
      reset();
    } catch (error) {
      console.error("Error saving product:", error);
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Êtes-vous sûr de vouloir supprimer ce produit ?")) {
      try {
        await deleteProduct(id);
        await fetchProducts();
      } catch (error) {
         console.error("Error deleting product:", error);
      }
    }
  };

  return (
    <div className="p-8 text-white min-h-screen">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold font-heading text-[#d4af37]">Gestion Produits</h1>
          <p className="text-gray-400 mt-1">Gérez votre catalogue de portes et poignées.</p>
        </div>
        <button 
          onClick={() => openModal()}
          className="bg-[#d4af37] text-black font-bold py-2 px-4 rounded-lg flex items-center gap-2 hover:bg-yellow-500 transition"
        >
          <Plus size={20} />
          Ajouter un Produit
        </button>
      </div>

      {/* Search Bar */}
      <div className="mb-6 relative max-w-md">
        <Search className="absolute left-3 top-3 text-gray-500 w-5 h-5" />
        <input 
          type="text" 
          placeholder="Rechercher un produit..." 
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full bg-zinc-900 border border-zinc-700 rounded-lg pl-10 pr-4 py-3 focus:outline-none focus:border-[#d4af37]"
        />
      </div>

      {/* Table */}
      <div className="bg-zinc-900 rounded-xl border border-zinc-800 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-zinc-950 text-gray-400 uppercase text-xs font-bold tracking-wider">
            <tr>
              <th className="p-4 w-24">Image</th>
              <th className="p-4">Nom</th>
              <th className="p-4">Catégorie</th>
              <th className="p-4">Prix</th>
              <th className="p-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-800">
            {loading ? (
              <tr><td colSpan="5" className="p-8 text-center text-gray-500">Chargement...</td></tr>
            ) : filteredProducts.length === 0 ? (
               <tr><td colSpan="5" className="p-8 text-center text-gray-500">Aucun produit trouvé.</td></tr>
            ) : (
              filteredProducts.map((product) => (
                <tr key={product.id} className="hover:bg-zinc-800/50 transition-colors group">
                  <td className="p-4">
                    {product.image ? (
                      <img src={product.image} alt={product.name} className="w-12 h-12 object-cover rounded border border-zinc-700" />
                    ) : (
                      <div className="w-12 h-12 bg-zinc-800 rounded flex items-center justify-center text-gray-600">
                        <ImageIcon size={20} />
                      </div>
                    )}
                  </td>
                  <td className="p-4 font-medium text-white">{product.name}</td>
                  <td className="p-4 text-gray-400 text-sm">
                    <span className="px-2 py-1 bg-zinc-800 rounded text-xs border border-zinc-700">
                      {product.category}
                    </span>
                  </td>
                  <td className="p-4 text-[#d4af37] font-bold">{product.price ? `${product.price} €` : '-'}</td>
                  <td className="p-4 text-right space-x-2">
                    <button 
                      onClick={() => openModal(product)} 
                      className="p-2 hover:bg-zinc-700 rounded-full text-gray-400 hover:text-white transition"
                    >
                      <Edit2 size={16} />
                    </button>
                    <button 
                      onClick={() => handleDelete(product.id)}
                      className="p-2 hover:bg-red-900/30 rounded-full text-gray-400 hover:text-red-500 transition"
                    >
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-zinc-900 border border-zinc-700 rounded-xl w-full max-w-lg p-6 relative">
             <button 
              onClick={() => setShowModal(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-white"
            >
              <X size={24} />
            </button>
            <h2 className="text-xl font-bold mb-6 font-heading flex items-center gap-2">
              <Package className="text-[#d4af37]" />
              {editingProduct ? 'Modifier Produit' : 'Ajouter Produit'}
            </h2>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div>
                <label className="block text-sm text-gray-400 mb-1">Nom du produit</label>
                <input 
                  {...register("name", { required: true })}
                  className="w-full bg-zinc-800 border border-zinc-700 rounded p-2 text-white focus:border-[#d4af37] outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                 <div>
                    <label className="block text-sm text-gray-400 mb-1">Catégorie</label>
                    <select 
                      {...register("category", { required: true })}
                      className="w-full bg-zinc-800 border border-zinc-700 rounded p-2 text-white focus:border-[#d4af37] outline-none"
                    >
                      <option value="Portes Blindées">Portes Blindées</option>
                      <option value="Portes Intérieures">Portes Intérieures</option>
                      <option value="Poignées">Poignées</option>
                      <option value="Accessoires">Accessoires</option>
                    </select>
                 </div>
                 <div>
                    <label className="block text-sm text-gray-400 mb-1">Prix (€)</label>
                    <input 
                      type="number"
                      {...register("price")}
                      className="w-full bg-zinc-800 border border-zinc-700 rounded p-2 text-white focus:border-[#d4af37] outline-none"
                    />
                 </div>
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-1">Image du produit</label>
                <div className="flex gap-2 items-center">
                  {/* Hidden file input */}
                  <input 
                    type="file"
                    accept="image/*"
                    {...register("imageFile")}
                    className="w-full bg-zinc-800 border border-zinc-700 rounded p-2 text-white focus:border-[#d4af37] outline-none text-sm file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-[#d4af37] file:text-black hover:file:bg-yellow-500"
                  />
                </div>
                {editingProduct && editingProduct.image && (
                   <div className="mt-2">
                     <p className="text-xs text-gray-500 mb-1">Actuelle :</p>
                     <img src={editingProduct.image} alt="Preview" className="h-16 rounded border border-zinc-700" />
                   </div>
                )}
              </div>

               <div>
                <label className="block text-sm text-gray-400 mb-1">Description</label>
                <textarea 
                  {...register("description")}
                  className="w-full bg-zinc-800 border border-zinc-700 rounded p-2 text-white focus:border-[#d4af37] outline-none h-24"
                />
              </div>

              <button 
                type="submit"
                disabled={uploading}
                className="w-full bg-[#d4af37] hover:bg-yellow-500 text-black font-bold py-3 rounded mt-4 transition disabled:opacity-50"
              >
                {uploading ? 'Téléchargement de l\'image...' : (editingProduct ? 'Mettre à jour' : 'Créer le produit')}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
