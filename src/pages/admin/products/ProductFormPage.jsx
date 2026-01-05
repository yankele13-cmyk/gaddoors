import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate, useParams } from 'react-router-dom';
import { ProductService } from '../../../services/product.service';
import { Save, ArrowLeft, Image as ImageIcon, Loader2, Layers, Box } from 'lucide-react';
import toast from 'react-hot-toast';
import { Link } from 'react-router-dom';
import { v4 as uuidv4 } from 'uuid'; // Import uuid
import VariantManager from '../../../modules/pim/VariantManager'; // Import VariantManager
import ImageGallery from '../../../modules/pim/ImageGallery'; // Import ImageGallery

import { SettingsService } from '../../../services/settings.service';

const DEFAULT_CATEGORIES = [
    "Porte Intérieure",
    "Porte Blindée", 
    "Porte Extérieure",
    "Poignée",
    "Serrure",
    "Accessoire"
];

export default function ProductFormPage() {
  const { t } = useTranslation();
  const { id } = useParams();
  const [docId, setDocId] = useState(id); 
  const isEditMode = !!id;
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState(DEFAULT_CATEGORIES);
  
  // Media State
  const [images, setImages] = useState([]); // Array of URLs (existing)
  const [filesToUpload, setFilesToUpload] = useState([]); // Array of Files (new)
  
  // Variants State
  const [hasVariants, setHasVariants] = useState(false);
  const [variantData, setVariantData] = useState({ variantOptions: [], variants: [] });

  const { register, handleSubmit, reset, watch, formState: { errors } } = useForm();
  
  // Watch for base Price/Stock to pass to VariantManager defaults
  const basePrice = watch('price');
  const baseStock = watch('stock');
  
  useEffect(() => {
    loadSettings();
    if (isEditMode) {
      loadProduct();
    }
  }, [id]);

  const loadSettings = async () => {
    const response = await SettingsService.getGeneralSettings();
    if (response.success && response.data.productCategories) {
        setCategories(response.data.productCategories);
    }
  };

  const loadProduct = async () => {
    setLoading(true);
    const response = await ProductService.getProductById(id);
    if (response.success) {
      const product = response.data;
      setDocId(product.id);
      reset(product);

      // Load Images
      // Compatibility: use 'images' array if exists, else 'imageUrl' wrapped, else empty
      const loadedImages = product.images || (product.imageUrl ? [product.imageUrl] : []);
      setImages(loadedImages);
      
      // Load Variants Data
      if (product.hasVariants) {
          setHasVariants(true);
          setVariantData({
              variantOptions: product.variantOptions || [],
              variants: product.variants || []
          });
      }
    } else {
        toast.error("Erreur: " + response.error);
        setTimeout(() => navigate('/admin/products'), 2000);
    }
    setLoading(false);
  };
  
  if (loading) return <div className="flex flex-col justify-center items-center h-96 gap-4">
      <Loader2 className="animate-spin text-[#d4af37]" size={48} />
      <p className="text-gray-400">{t('product.loading')}</p>
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
      // Merge Variant Data
      const finalData = {
          ...data,
          images: images, // Persist current order of existing images
          hasVariants,
          variantOptions: hasVariants ? variantData.variantOptions : [],
          variants: hasVariants ? variantData.variants : []
      };

      // Auto-calculate global stock if variants exist ?
      if (hasVariants) {
          finalData.stock = variantData.variants.reduce((acc, v) => acc + (v.stock || 0), 0);
      }
      
      let response;
      if (isEditMode) {
        const { image, ...updates } = finalData; // 'image' field from hook-form is ignored
        response = await ProductService.updateProduct(docId || id, updates, filesToUpload);
      } else {
        response = await ProductService.uploadAndCreate(finalData, filesToUpload);
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
             {isEditMode ? t('admin.title.edit') : t('admin.title.new')}
           </h1>
        </div>
      </div>

      <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 shadow-lg">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Image Upload Area */}
                <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-400">Galerie Photos</label>
                    <ImageGallery 
                        images={images}
                        onChange={setImages}
                        onFilesAdded={(files) => setFilesToUpload(prev => [...prev, ...files])}
                    />
                </div>

                {/* Main Fields */}
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-400 mb-1">{t('admin.form.name')}</label>
                        <input 
                            {...register("name", { required: t('admin.form.nameRequired') })}
                            className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-3 text-white focus:border-[#d4af37] outline-none"
                            placeholder={t('admin.form.namePlaceholder')}
                        />
                        {errors.name && <span className="text-red-500 text-xs">{errors.name.message}</span>}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-400 mb-1">{t('admin.form.category')}</label>
                        <select 
                            {...register("category")}
                            className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-3 text-white focus:border-[#d4af37] outline-none"
                        >
                            {categories.map(cat => <option key={cat} value={cat}>{t(cat)}</option>)}
                        </select>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-400 mb-1">{t('admin.form.price')}</label>
                            <input 
                                type="number"
                                step="0.01"
                                {...register("price", { required: true, min: 0 })}
                                className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-3 text-white focus:border-[#d4af37] outline-none"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-400 mb-1">{t('admin.form.stock')}</label>
                            <input 
                                type="number"
                                {...register("stock", { min: 0 })}
                                defaultValue={0}
                                disabled={hasVariants} // Disable global stock if variants are active
                                className={`w-full bg-zinc-950 border border-zinc-800 rounded-lg p-3 text-white focus:border-[#d4af37] outline-none ${hasVariants ? 'opacity-50' : ''}`}
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* VARIANT SECTION */}
            <div className="border-t border-zinc-800 pt-6">
                <div className="flex items-center justify-between mb-4">
                    <div>
                        <h3 className="text-lg font-bold text-white flex items-center gap-2">
                            <Layers size={20} className={hasVariants ? "text-[#d4af37]" : "text-gray-500"} />
                            Gestion des Variantes
                        </h3>
                        <p className="text-gray-400 text-sm">Activez pour gérer tailles, couleurs, ouvertures...</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                        <input 
                            type="checkbox" 
                            className="sr-only peer" 
                            checked={hasVariants}
                            onChange={(e) => setHasVariants(e.target.checked)}
                        />
                        <div className="w-11 h-6 bg-zinc-700 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#d4af37]"></div>
                    </label>
                </div>

                {hasVariants ? (
                    <VariantManager 
                        value={variantData}
                        onChange={setVariantData}
                        basePrice={basePrice || 0}
                        baseStock={baseStock || 0}
                    />
                ) : (
                   <div className="bg-zinc-900/50 p-8 rounded-xl border border-zinc-800 border-dashed text-center text-gray-500">
                       <Box size={40} className="mx-auto mb-2 opacity-30" />
                       <p>Ce produit est simple (pas de déclinaisons).</p>
                   </div>
                )}
            </div>

            {/* Description */}
            <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">{t('admin.form.description')}</label>
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
                    {loading ? t('admin.form.saving') : t('admin.form.save')}
                </button>
            </div>

        </form>
      </div>
    </div>
  );
}
