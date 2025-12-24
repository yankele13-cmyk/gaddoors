import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate, useParams } from 'react-router-dom';
import { ProductService } from '../../../services/product.service';
import { Save, ArrowLeft, Image as ImageIcon, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { Link } from 'react-router-dom';

const CATEGORIES = [
    "Porte Intérieure",
    "Porte Blindée", 
    "Porte Extérieure",
    "Poignée",
    "Serrure",
    "Accessoire"
];

export default function ProductFormPage() {
  const { id } = useParams();
  const isEditMode = !!id;
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [imagePreview, setImagePreview] = useState(null);

  const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm();

  useEffect(() => {
    if (isEditMode) {
      loadProduct();
    }
  }, [id]);

  const loadProduct = async () => {
    setLoading(true);
    console.log("Loading Product ID:", id); // DEBUG

    const response = await ProductService.getProductById(id);
    console.log("Load Response:", response); // DEBUG

    if (response.success) {
      const product = response.data;
      reset(product);
      if (product.imageUrl) {
        setImagePreview(product.imageUrl);
      }
    } else {
        toast.error("Erreur: " + response.error);
        // Delay redirect slightly so user can see the error
        setTimeout(() => navigate('/admin/products'), 2000);
    }
    setLoading(false);
  };
  
  if (loading) return <div className="flex flex-col justify-center items-center h-96 gap-4">
      <Loader2 className="animate-spin text-[#d4af37]" size={48} />
      <p className="text-gray-400">Chargement du produit...</p>
  </div>;

  const onImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImagePreview(URL.createObjectURL(file)); // Local preview
    }
  };

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      const imageFile = (data.image && data.image[0]) ? data.image[0] : null;
      
      let response;
      if (isEditMode) {
        // Update
        // Note: data.image might be FileList or empty if not changed. 
        // We handle the file in Service. If no new file, imageFile is undefined/null.
        const { image, ...updates } = data; // separate file from text data
        response = await ProductService.updateProduct(id, updates, imageFile);
      } else {
        // Create
        response = await ProductService.uploadAndCreate(data, imageFile);
      }

      if (response.success) {
        toast.success(isEditMode ? "Produit mis à jour !" : "Produit créé !");
        navigate('/admin/products');
      } else {
        toast.error("Erreur: " + response.error);
      }
    } catch (err) {
      console.error(err);
      toast.error("Erreur inattendue.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link to="/admin/products" className="p-2 bg-zinc-900 rounded-lg text-gray-400 hover:text-white transition-colors">
            <ArrowLeft size={20} />
        </Link>
        <div>
           <h1 className="text-2xl font-bold font-heading text-white">
             {isEditMode ? 'Modifier le Produit' : 'Nouveau Produit'}
           </h1>
        </div>
      </div>

      <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 shadow-lg">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Image Upload Area */}
                <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-400">Image du Produit</label>
                    <div className="flex flex-col items-center justify-center border-2 border-dashed border-zinc-700 rounded-xl p-6 hover:border-[#d4af37] transition-colors relative group">
                        {imagePreview ? (
                            <img src={imagePreview} alt="Preview" className="h-48 w-full object-contain rounded-lg" />
                        ) : (
                            <div className="text-center text-gray-500">
                                <ImageIcon size={48} className="mx-auto mb-2 opacity-50" />
                                <p>Cliquez pour uploader</p>
                            </div>
                        )}
                        <input 
                            type="file" 
                            accept="image/*"
                            className="absolute inset-0 opacity-0 cursor-pointer"
                            {...register("image", { onChange: onImageChange })} 
                        />
                    </div>
                </div>

                {/* Main Fields */}
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-400 mb-1">Nom du Produit *</label>
                        <input 
                            {...register("name", { required: "Le nom est requis" })}
                            className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-3 text-white focus:border-[#d4af37] outline-none"
                            placeholder="Ex: Porte Galaxy"
                        />
                        {errors.name && <span className="text-red-500 text-xs">{errors.name.message}</span>}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-400 mb-1">Catégorie</label>
                        <select 
                            {...register("category")}
                            className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-3 text-white focus:border-[#d4af37] outline-none"
                        >
                            {CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                        </select>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-400 mb-1">Prix (₪) *</label>
                            <input 
                                type="number"
                                step="0.01"
                                {...register("price", { required: true, min: 0 })}
                                className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-3 text-white focus:border-[#d4af37] outline-none"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-400 mb-1">Stock</label>
                            <input 
                                type="number"
                                {...register("stock", { min: 0 })}
                                defaultValue={0}
                                className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-3 text-white focus:border-[#d4af37] outline-none"
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* Description */}
            <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Description</label>
                <textarea 
                    rows="4"
                    {...register("description")}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-3 text-white focus:border-[#d4af37] outline-none resize-none"
                ></textarea>
            </div>

            {/* Actions */}
            <div className="flex justify-end pt-4 border-t border-zinc-800">
                <button 
                    type="submit" 
                    disabled={loading}
                    className="flex items-center gap-2 bg-[#d4af37] hover:bg-yellow-500 text-black font-bold py-3 px-8 rounded-lg transition disabled:opacity-50"
                >
                    {loading ? <Loader2 className="animate-spin" /> : <Save size={20} />}
                    {loading ? 'Enregistrement...' : 'Enregistrer'}
                </button>
            </div>

        </form>
      </div>
    </div>
  );
}
