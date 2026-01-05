import React, { useState, useEffect } from 'react';
import { useDropzone } from 'react-dropzone';
import { X, Star, Upload, Image as ImageIcon } from 'lucide-react';

/**
 * ImageGallery
 * @param {string[]} images - Array of current image URLs
 * @param {function} onChange - Callback (newImages) => void
 * @param {function} onFilesAdded - Callback (files[]) => void (to handle uploads)
 */
export default function ImageGallery({ images = [], onChange, onFilesAdded }) {
    const [localImages, setLocalImages] = useState(images);
    const [newFiles, setNewFiles] = useState([]);

    useEffect(() => {
        setLocalImages(images || []);
    }, [images]);

    const onDrop = (acceptedFiles) => {
        // Create local previews for new files
        const filePreviews = acceptedFiles.map(file => Object.assign(file, {
            preview: URL.createObjectURL(file)
        }));
        
        setNewFiles(prev => [...prev, ...filePreviews]);
        
        // Notify parent to prepare for upload
        if (onFilesAdded) {
            onFilesAdded(acceptedFiles);
        }
    };

    const { getRootProps, getInputProps, isDragActive } = useDropzone({ 
        onDrop, 
        accept: { 'image/*': [] } 
    });

    const removeImage = (index) => {
        const newImgs = localImages.filter((_, i) => i !== index);
        setLocalImages(newImgs);
        onChange(newImgs);
        // Note: We don't delete from storage immediately, just update the list.
    };

    const removeNewFile = (index) => {
        const updatedNewFiles = newFiles.filter((_, i) => i !== index);
        setNewFiles(updatedNewFiles);
        // We probably need to tell parent to remove this file from the upload queue?
        // This is tricky. Simplified: onFilesAdded just passes *batches*. 
        // If we want to remove a pending file, parent needs to manage 'filesToUpload' state.
        // For 'Vendeur Pressé', let's stick to simple Append logic. 
        // Or re-emit the whole file list? No, files are Blobs.
        // Let's just visually remove it here, but actually managing the sync with parent 'files' state is harder without a strict 'files' prop.
        // Compromise: We only show "Saved" images in the main grid. New files are shown in a separate "Pending" area.
        // For simplicity: We won't allow removing pending files individually easily without syncing state up.
        // Let's just assume we upload EVERYTHING dropped.
    };

    const setMain = (index) => {
        // Move to index 0
        const item = localImages[index];
        const newImgs = localImages.filter((_, i) => i !== index);
        newImgs.unshift(item); // Add to start
        setLocalImages(newImgs);
        onChange(newImgs);
    };

    return (
        <div className="space-y-4">
            {/* GRID OF EXISTING IMAGES */}
            {localImages.length > 0 && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                    {localImages.map((url, idx) => (
                        <div key={url + idx} className={`group relative aspect-square rounded-xl overflow-hidden border-2 ${idx === 0 ? 'border-[#d4af37]' : 'border-zinc-800'}`}>
                            <img src={url} alt="" className="w-full h-full object-cover" />
                            
                            {/* Overlay Actions */}
                            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition flex items-center justify-center gap-2">
                                <button 
                                    onClick={() => setMain(idx)} 
                                    className={`p-2 rounded-full ${idx === 0 ? 'bg-yellow-500 text-black' : 'bg-white/20 text-white hover:bg-[#d4af37] hover:text-black'}`}
                                    title="Définir comme principale"
                                >
                                    <Star size={16} fill={idx === 0 ? "black" : "none"} />
                                </button>
                                <button 
                                    onClick={() => removeImage(idx)} 
                                    className="p-2 rounded-full bg-red-500/20 text-red-500 hover:bg-red-500 hover:text-white"
                                    title="Supprimer"
                                >
                                    <X size={16} />
                                </button>
                            </div>
                            
                            {idx === 0 && <div className="absolute top-2 left-2 bg-[#d4af37] text-black text-[10px] font-bold px-2 py-0.5 rounded">PRINCIPALE</div>}
                        </div>
                    ))}
                </div>
            )}

            {/* PENDING UPLOADS PREVIEW */}
            {newFiles.length > 0 && (
                <div className="mb-4">
                     <p className="text-xs text-green-500 mb-2">Prêts à être envoyés ({newFiles.length}) :</p>
                     <div className="flex gap-2 overflow-x-auto pb-2">
                         {newFiles.map((f, idx) => (
                             <div key={idx} className="w-20 h-20 flex-shrink-0 relative rounded overflow-hidden border border-green-500/50">
                                 <img src={f.preview} className="w-full h-full object-cover opacity-80" />
                             </div>
                         ))}
                     </div>
                </div>
            )}

            {/* DROPZONE */}
            <div 
                {...getRootProps()} 
                className={`border-2 border-dashed rounded-xl p-8 flex flex-col items-center justify-center cursor-pointer transition-colors ${
                    isDragActive ? 'border-[#d4af37] bg-yellow-500/10' : 'border-zinc-700 hover:border-zinc-500 hover:bg-zinc-900'
                }`}
            >
                <input {...getInputProps()} />
                <Upload size={32} className={`mb-4 ${isDragActive ? 'text-[#d4af37]' : 'text-gray-500'}`} />
                <p className="text-gray-400 text-center text-sm">
                    {isDragActive 
                        ? "Déposez les images ici..." 
                        : "Glissez-déposez des images ici, ou cliquez pour sélectionner"}
                </p>
                <p className="text-gray-600 text-xs mt-2">JPG, PNG supportés.</p>
            </div>
        </div>
    );
}
