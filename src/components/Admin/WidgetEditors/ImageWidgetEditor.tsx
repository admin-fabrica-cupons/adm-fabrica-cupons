// ImageWidgetEditor.tsx
import React, { useRef, useState } from 'react';
import { ImageBlock } from '../../../types';
import Image from 'next/image';
import { HiOutlinePhotograph, HiOutlineExternalLink, HiOutlineInformationCircle } from 'react-icons/hi';
import { BiExpand, BiCollapse, BiSquare, BiVideo, BiBox } from 'react-icons/bi';
import { RiAspectRatioLine, RiFocus2Line, RiImageAiLine } from 'react-icons/ri';
import { FaCloudUploadAlt } from 'react-icons/fa';
import InputWithClear from '../Util/InputWithClear';
import AIImageChat from '../Util/AIImageChat';

interface ImageWidgetEditorProps {
  block: ImageBlock;
  onUpdate: (field: string, value: any) => void;
}

const ImageWidgetEditor: React.FC<ImageWidgetEditorProps> = ({ block, onUpdate }) => {
  const [isImageChatOpen, setIsImageChatOpen] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const imageRatios = [
    { value: '16:9', label: '16:9 (Vídeo)', icon: <BiVideo size={20} /> },
    { value: '3:4', label: '3:4 (Social)', icon: <RiAspectRatioLine size={20} /> },
    { value: '1:1', label: '1:1 (Square)', icon: <BiSquare size={20} /> },
    { value: 'auto', label: 'Auto (Original)', icon: <BiBox size={20} /> },
  ];

  const imageSizes = [
    { value: 'small', label: 'Compacta', icon: <BiCollapse size={20} /> },
    { value: 'medium', label: 'Padrão', icon: <HiOutlinePhotograph size={20} /> },
    { value: 'large', label: 'Destaque', icon: <BiExpand size={20} /> },
    { value: 'full', label: 'Total Largura', icon: <RiFocus2Line size={20} /> },
  ];

  const sectionHeaderStyles = "flex items-center gap-2 mb-4 text-slate-800 dark:text-slate-200 font-bold border-b border-slate-200 dark:border-slate-700 pb-2";
  const inputGroupStyles = "bg-white dark:bg-slate-800/50 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm";
  const inputLabelStyles = "block text-xs font-bold text-slate-500 dark:text-slate-400 mb-1.5 uppercase tracking-wider";
  const inputStyles = "w-full px-4 py-2.5 bg-gray-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-600 focus:ring-offset-0 focus:bg-white dark:focus:bg-slate-800 transition-all dark:text-white text-sm hover:border-gray-300 dark:hover:border-slate-600";
  const selectStyles = "w-full px-4 py-2.5 bg-gray-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-600 focus:ring-offset-0 focus:bg-white dark:focus:bg-slate-800 transition-all dark:text-white text-sm hover:border-gray-300 dark:hover:border-slate-600";

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append('image', file);
      formData.append('name', file.name);
      const response = await fetch('/api/admin/imgbb', { method: 'POST', body: formData });
      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data?.error || 'Falha ao enviar imagem');
      }
      const data = await response.json();
      const url = String(data?.url || '');
      if (url) {
        onUpdate('src', url);
      } else {
        throw new Error('URL inválida retornada');
      }
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Origem e Dados */}
        <div className={inputGroupStyles}>
          <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-700 pb-2 mb-4">
            <div className="flex items-center gap-2 text-slate-800 dark:text-slate-200 font-bold">
              <HiOutlinePhotograph size={20} className="text-blue-500" />
              <span>Base da Imagem</span>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setIsImageChatOpen(true)}
                className="flex items-center gap-2 px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest bg-gradient-to-r from-cyan-400 via-sky-400 to-teal-400 text-slate-900 shadow-lg shadow-cyan-500/30 hover:shadow-cyan-500/50 hover:scale-105 transition-all"
              >
                <RiImageAiLine size={14} />
                Gerar com IA
              </button>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest border border-blue-400/60 text-blue-600 dark:text-blue-300 hover:bg-blue-500/10 transition-all ${isUploading ? 'opacity-60 cursor-not-allowed' : ''}`}
              >
                <FaCloudUploadAlt size={14} />
                {isUploading ? 'Enviando...' : 'Upload'}
              </button>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className={inputLabelStyles}>URL da Imagem *</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-3 flex items-center text-slate-400">
                  <HiOutlineExternalLink size={18} />
                </div>
                <InputWithClear
                  type="text"
                  value={block.src || ''}
                  onChange={(e) => onUpdate('src', e.target.value)}
                  onClear={() => onUpdate('src', '')}
                  className={`${inputStyles} pl-10`}
                  placeholder="https://exemplo.com/imagem.jpg"
                />
              </div>
            </div>

            <div>
              <label className={inputLabelStyles}>Texto Alternativo (Alt)</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-3 flex items-center text-slate-400">
                  <HiOutlineInformationCircle size={18} />
                </div>
                <InputWithClear
                  type="text"
                  value={block.alt || ''}
                  onChange={(e) => onUpdate('alt', e.target.value)}
                  onClear={() => onUpdate('alt', '')}
                  className={`${inputStyles} pl-10`}
                  placeholder="Descreva a imagem para acessibilidade"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Configurações de Exibição */}
        <div className={inputGroupStyles}>
          <div className={sectionHeaderStyles}>
            <RiAspectRatioLine size={20} className="text-purple-500" />
            <span>Ajustes de Proporção</span>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {imageRatios.map((ratio) => (
              <button
                key={ratio.value}
                type="button"
                onClick={() => onUpdate('imageRatio', ratio.value)}
                className={`flex flex-col items-center justify-center p-3 rounded-xl border-2 transition-all ${block.imageRatio === ratio.value
                  ? 'border-blue-500 bg-blue-50/50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 shadow-md ring-2 ring-blue-500/20'
                  : 'border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/30 text-slate-400 hover:border-slate-300 dark:hover:border-slate-700'
                  }`}
              >
                <div className={`${block.imageRatio === ratio.value ? 'scale-110' : ''} transition-transform`}>
                  {ratio.icon}
                </div>
                <span className="text-[10px] font-bold mt-2 uppercase tracking-wide">{ratio.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Dimensionamento */}
        <div className={`${inputGroupStyles} md:col-span-2`}>
          <div className={sectionHeaderStyles}>
            <HiOutlinePhotograph size={20} className="text-blue-500" />
            <span>Escalonamento de Largura</span>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {imageSizes.map((size) => (
              <button
                key={size.value}
                type="button"
                onClick={() => onUpdate('imageSize', size.value)}
                className={`flex items-center gap-3 p-4 rounded-xl border-2 transition-all ${block.imageSize === size.value
                  ? 'border-blue-500 bg-blue-50/50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 shadow-md ring-2 ring-blue-500/20'
                  : 'border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/30 text-slate-400 hover:border-slate-300 dark:hover:border-slate-700'
                  }`}
              >
                <div className={`${block.imageSize === size.value ? 'scale-110' : ''} transition-transform`}>
                  {size.icon}
                </div>
                <span className="text-xs font-bold uppercase tracking-wide">{size.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Seção de Prévia Otimizada */}
        {block.src && (
          <div className={`${inputGroupStyles} md:col-span-2 bg-gradient-to-b from-slate-50 to-slate-100/50 dark:from-slate-900 dark:to-slate-800/10`}>
            <div className={sectionHeaderStyles}>
              <HiOutlinePhotograph size={20} className="text-blue-500" />
              <span>Prévia no Conteúdo</span>
            </div>

            <div className="flex flex-col items-center">
              <div className={`
                border-4 border-white dark:border-slate-800 shadow-2xl rounded-2xl overflow-hidden transition-all duration-500 ring-1 ring-slate-200 dark:ring-slate-700
                ${block.imageSize === 'small' ? 'max-w-sm' : block.imageSize === 'medium' ? 'max-w-md' : block.imageSize === 'large' ? 'max-w-lg' : 'w-full'}
              `}>
                <div className={`bg-slate-200 dark:bg-slate-800 relative group ${block.imageRatio === '16:9' ? 'aspect-video' :
                  block.imageRatio === '3:4' ? 'aspect-[3/4]' :
                    block.imageRatio === '1:1' ? 'aspect-square' :
                      ''
                  }`}>
                  <div className="relative w-full h-full">
                    <Image
                      src={block.src}
                      alt={block.alt || 'Preview'}
                      fill
                      className="object-contain"
                    />
                  </div>

                  {/* Overlay Informativo na Hover da Preview */}
                  <div className="absolute inset-x-0 bottom-0 p-4 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                    <p className="text-white text-xs font-bold uppercase tracking-widest flex items-center gap-2">
                      <BiSquare size={14} />
                      {block.imageRatio?.replace(':', ' por ')} | {block.imageSize}
                    </p>
                  </div>
                </div>

                {block.alt && (
                  <div className="p-3 bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800">
                    <p className="text-xs text-slate-500 dark:text-slate-400 font-medium italic flex items-center gap-2">
                      <HiOutlineInformationCircle size={14} />
                      Acessibilidade: &quot;{block.alt}&quot;
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFileChange}
      />
      <AIImageChat
        isOpen={isImageChatOpen}
        onClose={() => setIsImageChatOpen(false)}
        onApplyImage={(url) => onUpdate('src', url)}
        variant="modal"
        title="Lu Image"
      />
    </div>
  );
};

export default ImageWidgetEditor;
