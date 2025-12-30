import React from 'react';
import { X } from 'lucide-react';
import { PDFViewer } from '@react-pdf/renderer';

export default function PDFPreviewModal({ isOpen, onClose, document, fileName }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl w-full max-w-5xl h-[90vh] shadow-2xl flex flex-col">
        
        {/* Header */}
        <div className="flex justify-between items-center p-4 border-b border-zinc-800 shrink-0 bg-zinc-950 rounded-t-xl">
          <div>
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
               Aperçu du Document
            </h2>
            <p className="text-xs text-gray-500">{fileName || 'Document.pdf'}</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-white transition">
            <X size={24} />
          </button>
        </div>

        {/* PDF Viewer */}
        <div className="flex-1 overflow-hidden bg-gray-500/10 relative">
            <PDFViewer width="100%" height="100%" className="w-full h-full border-none">
                {document}
            </PDFViewer>
        </div>
        
      </div>
    </div>
  );
}
