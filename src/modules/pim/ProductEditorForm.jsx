
import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { productFormSchema } from '../../schemas/product.schema';
import { ProductServiceV2 } from '../../services/product.service.v2';
import { X, Save, Upload, Loader2, Image as ImageIcon } from 'lucide-react';
import toast from 'react-hot-toast';

export default function ProductEditorForm({ product, onClose, onSuccess }) {
    // Styles
    const styles = {
        label: "block text-xs font-bold uppercase text-gray-500 mb-1.5",
        input: "w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-white focus:border-[#d4af37] outline-none transition",
        error: "text-red-500 text-xs mt-1",
        btnSecondary: "bg-zinc-800 text-white px-4 py-2 rounded-lg hover:bg-zinc-700 transition text-sm font-medium"
    };

    const isEdit = !!product;

    const { 
        register, 
        handleSubmit, 
        setValue,
        watch,
        formState: { errors, isSubmitting } 
    } = useForm({
        resolver: zodResolver(productFormSchema),
        defaultValues: {
            name: product?.name || '',
            sku: product?.sku || '',
            category: product?.category || 'Portes',
            price: product?.price || 0,
            description: product?.description || '',
            visibility: product?.visibility ?? false,
            imageUrl: product?.imageUrl || null,
            status: product?.status || 'draft'
        }
    });

    const imageUrl = watch('imageUrl');

    // Handle Image Upload
    const handleImageUpload = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const toastId = toast.loading("Téléchargement de l'image...");
        const res = await ProductServiceV2.uploadImage(file);
        
        if (res.success) {
            setValue('imageUrl', res.url); // Update form state
            toast.success("Image téléchargée", { id: toastId });
        } else {
            toast.error("Erreur téléchargement: " + res.error, { id: toastId });
        }
    };

    const onSubmit = async (data) => {
        let res;
        if (isEdit) {
            res = await ProductServiceV2.updateProduct(product.id, data);
        } else {
            res = await ProductServiceV2.createProduct(data);
        }

        if (res.success) {
            toast.success(isEdit ? "Produit mis à jour" : "Produit créé");
            onSuccess();
        } else {
            toast.error(res.error || "Une erreur est survenue");
        }
    };

    return (
        <div className="fixed inset-0 bg-black/80 flex justify-end z-50 backdrop-blur-sm">
            <div className="w-full max-w-2xl bg-zinc-900 border-l border-zinc-800 h-full flex flex-col shadow-2xl animate-in slide-in-from-right duration-300">
                
                {/* Header */}
                <div className="p-6 border-b border-zinc-800 flex justify-between items-center bg-black/50">
                    <h2 className="text-xl font-bold font-heading text-white">
                        {isEdit ? `Modifier : ${product.name}` : "Nouveau Produit"}
                    </h2>
                    <button onClick={onClose} className="p-2 hover:bg-zinc-800 rounded-full text-gray-400 hover:text-white transition">
                        <X size={20} />
                    </button>
                </div>

                {/* Form Content */}
                <div className="flex-1 overflow-y-auto p-6">
                    <form id="product-form" onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                        
                        {/* Main Info */}
                        <div className="grid grid-cols-2 gap-4">
                            <div className="col-span-2">
                                <label className={styles.label}>Nom du produit <span className="text-red-500">*</span></label>
                                <input {...register('name')} className={styles.input} placeholder="Ex: Porte Modello Roma" />
                                {errors.name && <p className={styles.error}>{errors.name.message}</p>}
                            </div>
                            
                            <div>
                                <label className={styles.label}>SKU / Référence</label>
                                <input {...register('sku')} className={styles.input} placeholder="Ex: P-ROMA-001" />
                            </div>

                            <div>
                                <label className={styles.label}>Catégorie <span className="text-red-500">*</span></label>
                                <select {...register('category')} className={styles.input}>
                                    <option value="Portes">Portes</option>
                                    <option value="Poignées">Poignées</option>
                                    <option value="Accessoires">Accessoires</option>
                                </select>
                                {errors.category && <p className={styles.error}>{errors.category.message}</p>}
                            </div>
                        </div>

                        {/* Price & Status */}
                        <div className="grid grid-cols-2 gap-4">
                             <div>
                                <label className={styles.label}>Prix (₪) <span className="text-red-500">*</span></label>
                                <input type="number" step="0.01" {...register('price', { valueAsNumber: true })} className={styles.input + " font-mono"} />
                                {errors.price && <p className={styles.error}>{errors.price.message}</p>}
                             </div>

                             <div>
                                <label className={styles.label}>Statut</label>
                                <select {...register('status')} className={styles.input}>
                                    <option value="draft">Brouillon (Caché)</option>
                                    <option value="active">Actif (Visible)</option>
                                    <option value="archived">Archivé</option>
                                </select>
                             </div>
                        </div>

                        {/* Image Upload */}
                        <div className="bg-zinc-950 p-4 rounded-lg border border-zinc-800 border-dashed">
                             <label className={styles.label + " mb-2"}>Image Principale</label>
                             <div className="flex gap-4 items-center">
                                 <div className="w-24 h-24 bg-zinc-900 rounded border border-zinc-800 flex items-center justify-center overflow-hidden relative">
                                     {imageUrl ? (
                                         <img src={imageUrl} alt="Preview" className="w-full h-full object-cover" />
                                     ) : (
                                         <ImageIcon className="text-zinc-700" size={32} />
                                     )}
                                 </div>
                                 <div className="flex-1">
                                     <input 
                                        type="file" 
                                        id="img-upload" 
                                        className="hidden" 
                                        accept="image/*"
                                        onChange={handleImageUpload}
                                     />
                                     <label htmlFor="img-upload" className={styles.btnSecondary + " cursor-pointer inline-flex items-center gap-2"}>
                                         <Upload size={16} /> 
                                         {imageUrl ? "Changer l'image" : "Télécharger une image"}
                                     </label>
                                     <p className="text-xs text-gray-500 mt-2">Formats acceptés: JPG, PNG, WEBP. Max 5MB.</p>
                                 </div>
                             </div>
                        </div>

                        {/* Visibility Toggle */}
                        <div className="flex items-center gap-3 bg-zinc-900 p-4 rounded-lg">
                            <input type="checkbox" {...register('visibility')} className="w-5 h-5 rounded border-zinc-700 bg-zinc-950 text-[#d4af37] focus:ring-[#d4af37]" />
                            <div>
                                <div className="font-bold text-sm">Visible sur le catalogue</div>
                                <div className="text-xs text-gray-400">Si décoché, le produit ne sera accessible que via lien direct ou admin.</div>
                            </div>
                        </div>

                        {/* Description */}
                        <div>
                            <label className={styles.label}>Description</label>
                            <textarea {...register('description')} className={styles.input + " h-32 resize-none"} placeholder="Description détaillée..." />
                        </div>

                    </form>
                </div>

                {/* Footer Actions */}
                <div className="p-6 border-t border-zinc-800 bg-black/50 flex justify-end gap-3">
                    <button onClick={onClose} type="button" className="px-4 py-2 text-gray-400 hover:text-white transition">
                        Annuler
                    </button>
                    <button 
                        type="submit" 
                        form="product-form"
                        disabled={isSubmitting}
                        className="bg-[#d4af37] text-black font-bold px-6 py-2 rounded-lg hover:bg-yellow-500 disabled:opacity-50 flex items-center gap-2 transition"
                    >
                        {isSubmitting ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
                        {isEdit ? "Enregistrer" : "Créer le produit"}
                    </button>
                </div>

            </div>
            

        </div>
    );
}
