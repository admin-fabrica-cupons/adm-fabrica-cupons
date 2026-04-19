import React, { useState } from 'react';
import { X, ExternalLink, Download } from 'lucide-react';
import Image from 'next/image';

interface ImageModalProps { isOpen: boolean;
  onClose: () => void;
  imageSrc: string;
  title?: string;
}

const ImageModal: React.FC<ImageModalProps> = ({ isOpen, onClose, imageSrc, title }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-300">
      <div 
        className="absolute inset-0" 
        onClick={onClose}
      />
      
      <div className="relative bg-white dark:bg-slate-900 rounded-3xl overflow-hidden shadow-2xl max-w-4xl w-full max-h-[90vh] flex flex-col animate-in zoom-in duration-300">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-slate-800">
          <div className="flex flex-col">
            <h3 className="font-bold text-slate-900 dark:text-white">
              {title || 'Prévia da Imagem'}
            </h3>
            <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">
              Visualização Ampliada
            </p>
          </div>
          <div className="flex items-center gap-2">
            <a 
              href={imageSrc} 
              target="_blank" 
              rel="noopener noreferrer"
              className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl text-slate-500 transition-colors"
              title="Abrir em nova aba"
            >
              <ExternalLink size={20} />
            </a>
            <button
              onClick={onClose}
              className="p-2 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl text-slate-500 hover:text-red-500 transition-colors"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Image Content */}
        <div className="relative aspect-video w-full bg-gray-100 dark:bg-slate-900 rounded-lg overflow-hidden border border-gray-200 dark:border-slate-700">
          <Image
            src={imageSrc}
            alt="Preview"
            fill
            className="object-contain"
          />
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 flex justify-between items-center">
          <span className="text-xs text-slate-500 truncate max-w-[200px]">
            {imageSrc}
          </span>
          <button
            onClick={onClose}
            className="px-6 py-2 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-xl text-sm font-bold hover:scale-105 transition-transform"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
};

export default ImageModal;
