import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { productSchema } from '../../schemas/product.schema';
// import { productsService } from '../../services/products.service'; // REMOVED (Legacy)
import { ProductService } from '../../services/product.service'; // Added for Robust CRUD
import { Save, X, Upload, Image as ImageIcon } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import toast from 'react-hot-toast';

export default function ProductForm({ product, onClose, onSuccess }) {
  const { t } = useTranslation();
  
  const { register, handleSubmit, formState: { errors } } = useForm({
    // resolver: zodResolver(productSchema), // TEMPORARILY DISABLED FOR REACT 19 COMPATIBILITY
    defaultValues: {
      name: '',
      name: '',
      category: 'Portes',
      price: 0,
      description: '',
      ...product 
    }
  });

  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(product?.image || null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [saving, setSaving] = useState(false);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const onSubmit = async (data) => {
    setSaving(true);
    try {
      // 1. Validation Logic
      // We explicitly rely on ProductService.updateProduct to check uniqueness to avoid double-call/race conditions
      if (!product?.id) {
         await ProductService.checkNameUnique(data.name); 
      }

      let imageUrl = product?.image || '';

      // 2. Upload Logic
      if (imageFile) {
        imageUrl = await ProductService.uploadImage(imageFile, (progress) => {
          setUploadProgress(progress);
        });
      }

      const finalData = {
        ...data,
        price: Number(data.price),
        image: imageUrl
      };

      // 3. Save Logic
      if (product?.id) {
          const updateResult = await ProductService.updateProduct(product.id, { 
              ...finalData, 
              imageUrl: imageUrl 
          }, null);
          
          if (!updateResult.success) throw new Error(updateResult.error);
          toast.success("Produit mis à jour");
      } else {
          const createResult = await ProductService.uploadAndCreate({
              ...finalData,
              imageUrl: imageUrl
          }, null); 

          if (!createResult.success) throw new Error(createResult.error);
          toast.success("Produit créé");
      }

      onSuccess();
    } catch (error) {
      console.error(error);
      toast.error(error.message || "Erreur sauvegarde");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-zinc-800 flex justify-between items-center bg-zinc-950 sticky top-0 z-10">
          <h2 className="text-xl font-bold font-heading text-white">
            {product ? 'Modifier Produit' : 'Nouveau Produit'}
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white"><X size={24} /></button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-6">
          {/* Image Upload */}
          <div className="flex justify-center">
             <div className="relative group w-32 h-32 rounded-xl overflow-hidden border-2 border-dashed border-zinc-700 hover:border-[#d4af37] bg-zinc-800 transition cursor-pointer">
                {imagePreview ? (
                    <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center text-gray-500">
                        <ImageIcon size={24} />
                        <span className="text-xs mt-2">Image</span>
                    </div>
                )}
                
                <input 
                    type="file" 
                    accept="image/*" 
                    onChange={handleImageChange}
                    className="absolute inset-0 opacity-0 cursor-pointer"
                />

                {/* Overlay on hover */}
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white transition">
                    <Upload size={20} />
                </div>
             </div>
          </div>
          {/* Progress Bar */}
          {uploadProgress > 0 && uploadProgress < 100 && (
             <div className="w-full bg-zinc-800 rounded-full h-2">
                <div className="bg-[#d4af37] h-2 rounded-full transition-all" style={{ width: `${uploadProgress}%` }}></div>
             </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">{t('admin.form.name')}</label>
                <input 
                  {...register("name")}
                  className={`w-full bg-zinc-950 border ${errors.name ? 'border-red-500' : 'border-zinc-800'} rounded-lg p-3 text-white focus:border-[#d4af37] outline-none`}
                  placeholder={t('admin.form.namePlaceholder')}
                />
                {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>}
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">{t('admin.form.category')}</label>
                <select 
                   {...register("category")}
                   className={`w-full bg-zinc-950 border ${errors.category ? 'border-red-500' : 'border-zinc-800'} rounded-lg p-3 text-white focus:border-[#d4af37] outline-none`}
                >
                    <option value="Portes">Portes</option>
                    <option value="Poignées">Poignées</option>
                    <option value="Accessoires">Accessoires</option>
                </select>
                {errors.category && <p className="text-red-500 text-xs mt-1">{errors.category.message}</p>}
            </div>
          </div>

          <div>
             <label className="block text-sm font-medium text-gray-400 mb-2">{t('admin.form.price')}</label>
             <input 
                type="number"
                {...register("price", { valueAsNumber: true })}
                className={`w-full bg-zinc-950 border ${errors.price ? 'border-red-500' : 'border-zinc-800'} rounded-lg p-3 text-white focus:border-[#d4af37] outline-none font-mono`}
             />
             {errors.price && <p className="text-red-500 text-xs mt-1">{errors.price.message}</p>}
          </div>

          <div>
             <label className="block text-sm font-medium text-gray-400 mb-2">{t('admin.form.description')}</label>
             <textarea 
                {...register("description")}
                rows={4}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-3 text-white focus:border-[#d4af37] outline-none resize-none"
                placeholder={t('admin.form.description')}
             />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-zinc-800">
             <button type="button" onClick={onClose} className="px-6 py-3 rounded-lg text-gray-400 hover:text-white hover:bg-zinc-800 transition">Annuler</button>
             <button 
                type="submit" 
                disabled={saving}
                className="px-6 py-3 bg-[#d4af37] hover:bg-yellow-500 text-black font-bold rounded-lg transition flex items-center gap-2 disabled:opacity-50"
             >
                <Save size={20} />
                {saving ? 'Enregistrement...' : 'Enregistrer'}
             </button>
          </div>
        </form>
      </div>
    </div>
  );
}
