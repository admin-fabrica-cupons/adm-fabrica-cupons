import React, { useRef, useState } from 'react';
import Image from 'next/image';
import { ImageSlidesBlock } from '../../../types';
import { HiOutlinePlus, HiOutlineTrash, HiOutlineEye, HiOutlineCog, HiOutlinePhotograph } from 'react-icons/hi';
import { BiSlider, BiTimer, BiNavigation } from 'react-icons/bi';
import InputWithClear from '../Util/InputWithClear';
import ProductImporter from '../Util/ProductImporter';
import AIImageChat from '../Util/AIImageChat';
import { RiImageAiLine } from 'react-icons/ri';
import { FaCloudUploadAlt } from 'react-icons/fa';

interface ImageSlidesEditorProps {
  block: ImageSlidesBlock;
  onUpdate: (field: string, value: any) => void;
}

const ImageSlidesEditor: React.FC<ImageSlidesEditorProps> = ({ block, onUpdate }) => {
  const [showAllImages, setShowAllImages] = useState(false);
  const [newImageUrl, setNewImageUrl] = useState('');
  const [isImageChatOpen, setIsImageChatOpen] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const images = block.images || [];
  const allImages = block.allImages || [];
  const slideInterval = block.slideInterval || 5000;
  const showNavigation = block.showNavigation !== false;
  const showIndicators = block.showIndicators !== false;
  const checkboxBlueStyles = "relative h-4 w-4 appearance-none rounded border border-blue-200 dark:border-blue-700 bg-white dark:bg-slate-900 transition-all focus:outline-none focus:ring-2 focus:ring-blue-500/20 after:content-[''] after:absolute after:left-1/2 after:top-1/2 after:h-2 after:w-1 after:-translate-x-1/2 after:-translate-y-1/2 after:rotate-45 after:border-r-2 after:border-b-2 after:border-white after:opacity-0 checked:after:opacity-100 checked:bg-blue-600 checked:border-blue-600";

  const addImage = (url: string) => {
    const newImages = [...images, url];
    onUpdate('images', newImages);
    
    // Adiciona também ao allImages se não existir
    if (!allImages.some(img => img.src === url)) {
      onUpdate('allImages', [...allImages, { id: Date.now().toString(), src: url }]);
    }
  };

  const removeImage = (index: number) => {
    const newImages = images.filter((_, i) => i !== index);
    onUpdate('images', newImages);
  };

  const addNewImage = () => {
    if (newImageUrl.trim()) {
      addImage(newImageUrl.trim());
      setNewImageUrl('');
    }
  };

  const addImageFromAllImages = (url: string) => {
    addImage(url);
    setShowAllImages(false);
  };

  const moveImage = (index: number, direction: 'up' | 'down') => {
    const newImages = [...images];
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    
    if (newIndex >= 0 && newIndex < images.length) {
      [newImages[index], newImages[newIndex]] = [newImages[newIndex], newImages[index]];
      onUpdate('images', newImages);
    }
  };

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
        addImage(url);
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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
            <BiSlider className="w-5 h-5 text-blue-600 dark:text-blue-400" />
          </div>
          <h3 className="text-base font-bold text-gray-900 dark:text-white uppercase tracking-wide">
            Slides de Imagens
          </h3>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsImageChatOpen(true)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest bg-gradient-to-r from-cyan-400 via-sky-400 to-teal-400 text-slate-900 shadow-lg shadow-cyan-500/30 hover:shadow-cyan-500/50 hover:scale-105 transition-all"
          >
            <RiImageAiLine size={14} />
            Gerar com IA
          </button>
          <div className="text-xs font-medium px-2 py-1 bg-gray-100 dark:bg-gray-800 rounded-md text-gray-500 dark:text-gray-400">
            {images.length} imagem{images.length !== 1 ? 's' : ''}
          </div>
        </div>
      </div>

      {/* Importação de Imagens */}
      <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-4 border border-slate-200 dark:border-slate-700 flex items-center justify-between">
         <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 rounded-lg">
              <HiOutlinePhotograph size={20} />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase">Importar da Web</p>
              <p className="text-[10px] text-slate-500 dark:text-slate-400">Extrair imagens de um produto</p>
            </div>
         </div>
         <ProductImporter compact onImport={(data: any) => {
            if (data.allImages && data.allImages.length > 0) {
              onUpdate('allImages', data.allImages);
              // Opcional: Adicionar automaticamente as primeiras imagens
              // const currentImages = block.images || [];
              // const newImages = [...currentImages, ...data.allImages.filter(img => !currentImages.includes(img))];
              // onUpdate('images', newImages);
              setShowAllImages(true);
            } else if (data.image) {
              addImage(data.image);
            }
         }} />
      </div>

      {/* Image Management */}
      <div className="space-y-4">
        <div className="flex items-end gap-2">
          <InputWithClear
            type="text"
            value={newImageUrl}
            onChange={(e) => setNewImageUrl(e.target.value)}
            onClear={() => setNewImageUrl('')}
            onKeyPress={(e) => e.key === 'Enter' && addNewImage()}
            placeholder="https://..."
            containerClassName="flex-1"
          />
          <button
            onClick={addNewImage}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2 h-[42px] mb-[1px]"
          >
            <HiOutlinePlus className="w-4 h-4" />
            <span>Adicionar</span>
          </button>
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
            className={`px-4 py-2 border border-blue-300 dark:border-blue-700 text-blue-600 dark:text-blue-300 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors flex items-center space-x-2 h-[42px] mb-[1px] ${isUploading ? 'opacity-60 cursor-not-allowed' : ''}`}
            title="Upload de imagem"
          >
            <FaCloudUploadAlt className="w-4 h-4" />
            <span>{isUploading ? 'Enviando...' : 'Upload'}</span>
          </button>
          <button
            onClick={() => setShowAllImages(!showAllImages)}
            className={`px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors flex items-center space-x-2 h-[42px] mb-[1px] ${showAllImages ? 'bg-gray-100 dark:bg-gray-800' : ''}`}
            title="Ver galeria de imagens"
          >
            <HiOutlineEye className="w-4 h-4" />
          </button>
        </div>

        {/* All Images Gallery */}
        {showAllImages && (
          <div className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-gray-200 dark:border-gray-700 animate-in fade-in slide-in-from-top-2">
            <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">
              Galeria de Imagens ({allImages.length})
            </h4>
            {allImages.length > 0 ? (
              <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
                {allImages.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => addImageFromAllImages(img.src)}
                    className="relative aspect-square rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700 hover:ring-2 hover:ring-blue-500 transition-all group bg-white dark:bg-slate-800"
                  >
                    <Image 
                      src={img.src} 
                      alt="" 
                      fill
                      className="object-contain"
                      unoptimized
                    />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                      <HiOutlinePlus className="text-white w-6 h-6" />
                    </div>
                  </button>
                ))}
              </div>
            ) : (
              <p className="text-xs text-slate-400 text-center py-4 italic">
                Nenhuma imagem importada. Use a importação acima ou adicione manualmente.
              </p>
            )}
          </div>
        )}

        {/* Images List */}
        <div className="space-y-2 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
          {images.map((url, index) => (
            <div key={index} className="flex items-center gap-3 p-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg group hover:border-blue-300 dark:hover:border-blue-700 transition-colors">
              <div className="w-16 h-12 bg-gray-100 dark:bg-gray-900 rounded-md overflow-hidden flex-shrink-0 relative">
                <Image 
                  src={url} 
                  alt="" 
                  fill
                  className="object-cover"
                  unoptimized
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
              </div>
              
              <div className="flex-1 min-w-0">
                <p className="text-xs text-gray-500 truncate">{url}</p>
              </div>

              <div className="flex items-center gap-1">
                <div className="flex flex-col gap-1">
                  <button 
                    onClick={() => moveImage(index, 'up')}
                    disabled={index === 0}
                    className="p-1 text-gray-400 hover:text-blue-600 disabled:opacity-30 disabled:hover:text-gray-400"
                  >
                    <BiNavigation className="w-3 h-3 rotate-0" />
                  </button>
                  <button 
                    onClick={() => moveImage(index, 'down')}
                    disabled={index === images.length - 1}
                    className="p-1 text-gray-400 hover:text-blue-600 disabled:opacity-30 disabled:hover:text-gray-400"
                  >
                    <BiNavigation className="w-3 h-3 rotate-180" />
                  </button>
                </div>
                <button
                  onClick={() => removeImage(index)}
                  className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                >
                  <HiOutlineTrash className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
          {images.length === 0 && (
            <div className="text-center py-8 text-gray-400 border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-xl">
              Nenhuma imagem adicionada
            </div>
          )}
        </div>
      </div>

      {/* Settings */}
      <div className="pt-4 border-t border-gray-200 dark:border-gray-700 space-y-4">
        <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider flex items-center gap-2">
          <HiOutlineCog /> Configurações
        </h4>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="text-xs text-gray-600 dark:text-gray-300 mb-1.5 block flex items-center gap-1">
              <BiTimer /> Intervalo (ms)
            </label>
            <InputWithClear
              type="number"
              value={slideInterval}
              onChange={(e) => onUpdate('slideInterval', parseInt(e.target.value) || 5000)}
              onClear={() => onUpdate('slideInterval', 5000)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-sm"
            />
          </div>
          
          <div className="flex flex-col gap-2 pt-1">
            <label className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300 cursor-pointer">
              <input
                type="checkbox"
                checked={showNavigation}
                onChange={(e) => onUpdate('showNavigation', e.target.checked)}
                className={checkboxBlueStyles}
              />
              Mostrar Setas
            </label>
            <label className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300 cursor-pointer">
              <input
                type="checkbox"
                checked={showIndicators}
                onChange={(e) => onUpdate('showIndicators', e.target.checked)}
                className={checkboxBlueStyles}
              />
              Mostrar Indicadores
            </label>
          </div>
        </div>
      </div>
      <AIImageChat
        isOpen={isImageChatOpen}
        onClose={() => setIsImageChatOpen(false)}
        onApplyImage={(url) => addImage(url)}
        variant="modal"
        title="Lu Image"
      />
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFileChange}
      />
    </div>
  );
};

export default ImageSlidesEditor;
