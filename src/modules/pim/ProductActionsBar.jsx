import React from 'react';
import { Trash2, Archive, Eye, EyeOff, X } from 'lucide-react';

/**
 * ProductActionsBar
 * Floating bar for bulk actions
 * @param {string[]} selectedIds - Array of selected product IDs
 * @param {function} onClearSelection - Callback to clear selection
 * @param {function} onAction - Callback (actionType, ids) => void
 */
export default function ProductActionsBar({ selectedIds, onClearSelection, onAction }) {
    if (selectedIds.length === 0) return null;

    return (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-zinc-900 border border-zinc-700 text-white px-6 py-4 rounded-full shadow-2xl shadow-black flex items-center gap-6 z-50 animate-in slide-in-from-bottom-4 fade-in duration-300">
            <div className="flex items-center gap-4 border-r border-zinc-700 pr-4">
                <span className="font-bold text-[#d4af37]">{selectedIds.length}</span>
                <span className="text-sm text-gray-400 hidden sm:inline">sélectionnés</span>
                <button onClick={onClearSelection} className="text-gray-500 hover:text-white transition">
                    <X size={18} />
                </button>
            </div>

            <div className="flex items-center gap-2">
                <button 
                    onClick={() => onAction('soft_delete', selectedIds)}
                    className="p-2 hover:bg-red-500/20 text-red-400 rounded-full transition flex flex-col items-center gap-1 group"
                    title="Supprimer (Corbeille)"
                >
                    <Trash2 size={20} />
                </button>
                
                <button 
                    onClick={() => onAction('archive', selectedIds)}
                    className="p-2 hover:bg-yellow-500/20 text-yellow-400 rounded-full transition flex flex-col items-center gap-1"
                    title="Archiver"
                >
                    <Archive size={20} />
                </button>

                <div className="w-px h-8 bg-zinc-700 mx-2"></div>

                <button 
                    onClick={() => onAction('visible', selectedIds)}
                    className="p-2 hover:bg-green-500/20 text-green-400 rounded-full transition flex flex-col items-center gap-1"
                    title="Mettre en Ligne"
                >
                    <Eye size={20} />
                </button>

                <button 
                    onClick={() => onAction('hidden', selectedIds)}
                    className="p-2 hover:bg-gray-500/20 text-gray-400 rounded-full transition flex flex-col items-center gap-1"
                    title="Mettre Hors Ligne"
                >
                    <EyeOff size={20} />
                </button>
            </div>
        </div>
    );
}
