import React, { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import { ProductBlock } from '../../../types';
import { Trash2, Check, X, ShieldCheck, Sparkles, ChevronLeft, ChevronRight, Upload } from 'lucide-react';
import { HiOutlineShoppingBag, HiOutlinePhotograph, HiOutlineExternalLink, HiOutlineBadgeCheck, HiOutlineUpload, HiOutlineEye } from 'react-icons/hi';
import { BiDetail, BiDollarCircle, BiTrashAlt, BiStore } from 'react-icons/bi';
import { FaStar } from 'react-icons/fa';
import { RiCoupon2Line, RiPlayListAddLine, RiCloseCircleLine, RiArrowDownSLine, RiRobot3Fill } from 'react-icons/ri';
import { TbCurrencyReal, TbWorldWww, TbTextPlus, TbWorldDollar } from 'react-icons/tb';
import { MdOutlineImageSearch, MdOutlineTitle } from 'react-icons/md';
import { BsFillStarFill } from 'react-icons/bs';
import { LuFileBadge2 } from 'react-icons/lu';
import { FaMoneyBillTrendUp, FaPercent } from 'react-icons/fa6';
import { IoTicket } from 'react-icons/io5';
import ProductImporter from '../Util/ProductImporter';
import InputWithClear from '../Util/InputWithClear';
import AIChatModal from '../Util/AIChatModal';
import { PARTNER_STORES, CATEGORIES } from '../../../constants';
import { useAppSounds } from '../../../hooks/useAppSounds';
import { usePost } from '../../../contexts/PostContext';
import { useCategoryIcons } from '../../../hooks/useCategoryIcons';

interface ProductWidgetEditorProps {
  block: ProductBlock;
  onUpdate: (field: string, value: any) => void;
  categories?: string[];
  defaultCategory?: string;
}

const STORE_LOGOS = Object.entries(PARTNER_STORES)
  .map(([name, data]: any) => ({ name, logoUrl: data.logoUrl }))
  .filter((item: any) => item.logoUrl);

const ALL_IMAGES = [
  'https://placehold.co/600x400?bg=white',
  'https://placehold.co/800x600?bg=gray',
  'https://placehold.co/1200x800?bg=blue',
  'https://placehold.co/400x400?bg=red',
  'https://placehold.co/600x800?bg=green',
  'https://placehold.co/1000x600?bg=yellow',
];

const ProductWidgetEditor: React.FC<ProductWidgetEditorProps> = ({ block, onUpdate, categories, defaultCategory }) => {
  const postContext = usePost();
  const { getCategoryIcon } = useCategoryIcons();
  const availableCategories = categories && categories.length > 0
    ? categories
    : postContext?.categories && postContext.categories.length > 0
      ? postContext.categories
      : CATEGORIES;
  const categoryValue = block.category || defaultCategory || '';
  const [showLogoDropdown, setShowLogoDropdown] = useState(false);
  const [showAllImages, setShowAllImages] = useState(false);
  const [newImageUrl, setNewImageUrl] = useState('');
  const [showJsonImport, setShowJsonImport] = useState(false);
  const [jsonInput, setJsonInput] = useState('');
  const [jsonError, setJsonError] = useState('');
  const { playClick, playError, playSuccess, playAdd, playDelete } = useAppSounds();
  
  // AI Generation State
  const [showAIGeneration, setShowAIGeneration] = useState(false);
  
  // JSON Import States
  const [previewData, setPreviewData] = useState<any>(null);
  const [availableImages, setAvailableImages] = useState<string[]>([]);
  const [selectedImages, setSelectedImages] = useState<string[]>([]);
  const [showPreviewModal, setShowPreviewModal] = useState(false);

  const dropdownRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!showLogoDropdown) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowLogoDropdown(false);
      }
    };

    const handleEsc = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setShowLogoDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEsc);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEsc);
    };
  }, [showLogoDropdown]);

  const handleJsonImport = () => {
    try {
      const json = JSON.parse(jsonInput);
      if (!json.success || !json.data) throw new Error('Formato inválido: success: true e data object são obrigatórios');
      
      const data = json.data;
      setPreviewData(data);
      setAvailableImages(data.allImages || (data.image ? [data.image] : []));
      setSelectedImages(data.image ? [data.image] : []);
      setJsonError('');
      setShowPreviewModal(true);
      setShowJsonImport(false); // Close text input modal
      playSuccess();
    } catch (e: any) {
      setJsonError(e.message || 'Erro ao ler JSON');
      playError();
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        setJsonInput(event.target.result as string);
      }
    };
    reader.readAsText(file);
  };

  const confirmImport = () => {
    if (!previewData) return;
    
    // Map all available props
    if (previewData.title || previewData.productName) onUpdate('productName', previewData.title || previewData.productName);
    if (previewData.price) onUpdate('price', previewData.price);
    if (previewData.originalPrice) onUpdate('originalPrice', previewData.originalPrice);
    if (previewData.discount) onUpdate('discount', previewData.discount);
    if (previewData.rating) onUpdate('rating', previewData.rating);
    if (previewData.soldCount) onUpdate('soldCount', previewData.soldCount);
    if (previewData.ranking) onUpdate('ranking', previewData.ranking);
    if (previewData.tagRanking) onUpdate('tagRanking', previewData.tagRanking);
    if (previewData.storeName) onUpdate('storeName', previewData.storeName);
    if (previewData.description || previewData.shortDescription) onUpdate('description', previewData.description || previewData.shortDescription);
    if (previewData.affiliateLink) onUpdate('affiliateLink', previewData.affiliateLink);
    if (previewData.affiliateButtonText) onUpdate('affiliateButtonText', previewData.affiliateButtonText);
    if (previewData.affiliateLogo) onUpdate('affiliateLogo', previewData.affiliateLogo);
    if (previewData.couponCode) onUpdate('couponCode', previewData.couponCode);
    if (previewData.name) onUpdate('name', previewData.name);
    if (previewData.allImages) onUpdate('allImages', previewData.allImages);
    if (Array.isArray(previewData.pros)) onUpdate('pros', previewData.pros);
    if (Array.isArray(previewData.cons)) onUpdate('cons', previewData.cons);
    
    // Handle images
    if (selectedImages.length > 0) {
      onUpdate('images', selectedImages);
      onUpdate('src', selectedImages[0]);
    }
    
    setShowPreviewModal(false);
    setPreviewData(null);
  };

  const addPro = () => {
    const newPros = [...(block.pros || []), ''];
    onUpdate('pros', newPros);
  };

  const updatePro = (index: number, value: string) => {
    const newPros = [...(block.pros || [])];
    newPros[index] = value;
    onUpdate('pros', newPros);
  };

  const removePro = (index: number) => {
    const newPros = [...(block.pros || [])];
    newPros.splice(index, 1);
    onUpdate('pros', newPros);
  };

  const addCon = () => {
    const newCons = [...(block.cons || []), ''];
    onUpdate('cons', newCons);
  };

  const updateCon = (index: number, value: string) => {
    const newCons = [...(block.cons || [])];
    newCons[index] = value;
    onUpdate('cons', newCons);
  };

  const removeCon = (index: number) => {
    const newCons = [...(block.cons || [])];
    newCons.splice(index, 1);
    onUpdate('cons', newCons);
  };

  const images = block.images && block.images.length > 0 ? block.images : (block.src ? [block.src] : []);

  const setImages = (nextImages: string[]) => {
    onUpdate('images', nextImages);
    onUpdate('src', nextImages[0] || '');
  };

  const addImage = (url: string) => {
    const normalized = url.trim();
    if (!normalized) return;
    setImages([...images, normalized]);
  };

  const removeImage = (index: number) => {
    const nextImages = images.filter((_, i) => i !== index);
    setImages(nextImages);
  };

  const addNewImage = () => {
    if (!newImageUrl.trim()) return;
    addImage(newImageUrl);
    setNewImageUrl('');
    playAdd();
  };

  const handlePrimaryImageChange = (value: string) => {
    onUpdate('src', value);
    if (images.length <= 1) {
      setImages(value ? [value] : []);
    }
  };

  const importFromJson = () => {
    try {
      const parsed = JSON.parse(jsonInput);
      const data = Array.isArray(parsed) ? parsed[0] : parsed;
      if (!data || typeof data !== 'object') {
        setJsonError('JSON inválido');
        return;
      }
      const imageArray = Array.isArray(data.images) ? data.images.filter(Boolean) : [];
      const singleImage = data.src || data.image;
      if (imageArray.length > 0) {
        setImages(imageArray);
      } else if (singleImage) {
        setImages([singleImage]);
      }
      if (data.productName || data.title) onUpdate('productName', data.productName || data.title);
      if (data.price) onUpdate('price', data.price);
      if (data.originalPrice) onUpdate('originalPrice', data.originalPrice);
      if (data.rating !== undefined) onUpdate('rating', data.rating);
      if (data.description) onUpdate('description', data.description);
      if (data.storeName) onUpdate('storeName', data.storeName);
      if (data.discount) onUpdate('discount', data.discount);
      if (data.soldCount) onUpdate('soldCount', data.soldCount);
      if (data.ranking) onUpdate('ranking', data.ranking);
      if (data.affiliateLink) onUpdate('affiliateLink', data.affiliateLink);
      if (data.affiliateButtonText) onUpdate('affiliateButtonText', data.affiliateButtonText);
      if (data.affiliateLogo) onUpdate('affiliateLogo', data.affiliateLogo);
      if (Array.isArray(data.pros)) onUpdate('pros', data.pros);
      if (Array.isArray(data.cons)) onUpdate('cons', data.cons);
      if (data.couponCode) onUpdate('couponCode', data.couponCode);
      if (data.name) onUpdate('name', data.name);
      setJsonError('');
      setJsonInput('');
      setShowJsonImport(false);
    } catch {
      setJsonError('JSON inválido');
    }
  };



  const sectionHeaderStyles = "flex items-center gap-2 mb-4 font-bold border-b pb-2";
  const inputLabelStyles = "block text-[10px] font-black text-slate-500 dark:text-slate-400 mb-1.5 uppercase tracking-widest";
  const baseInputStyles = "w-full px-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-offset-0 transition-all dark:text-white text-sm hover:border-gray-300 dark:hover:border-slate-600";
  const checkboxEmeraldStyles = "relative h-5 w-5 appearance-none rounded-md border border-emerald-200 dark:border-emerald-700 bg-white dark:bg-slate-900 transition-all focus:outline-none focus:ring-2 focus:ring-emerald-500/20 after:content-[''] after:absolute after:left-1/2 after:top-1/2 after:h-2 after:w-1 after:-translate-x-1/2 after:-translate-y-1/2 after:rotate-45 after:border-r-2 after:border-b-2 after:border-white after:opacity-0 checked:after:opacity-100 checked:bg-emerald-600 checked:border-emerald-600";
  
  // Helper to generate ring class
  const getRingClass = (color: string) => `focus:border-${color}-500 focus:ring-${color}-500/20`;

  return (
    <>
      <div className="space-y-8 animate-in fade-in duration-500">
      {/* Importação Inteligente (Redesenhado) */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl border-2 border-purple-100 dark:border-purple-900/30 shadow-lg shadow-purple-500/5 overflow-hidden relative group">
        <div className="absolute inset-0 bg-gradient-to-r from-purple-500/5 via-blue-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
        <div className="px-6 py-5 flex flex-col md:flex-row items-center justify-between gap-4 relative z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-100 to-blue-100 dark:from-purple-900/30 dark:to-blue-900/30 flex items-center justify-center text-purple-600 dark:text-purple-400">
              <Sparkles size={20} />
            </div>
            <div>
              <h3 className="text-sm font-black text-slate-800 dark:text-white uppercase tracking-wider">
                Importação Inteligente
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                Preencha automaticamente com dados do Mercado Livre ou JSON
              </p>
            </div>
          </div>
          <div className="flex gap-3 w-full md:w-auto">
            <ProductImporter compact onImport={(data: any) => {
              onUpdate('productName', data.title);
              onUpdate('price', data.price);
              onUpdate('originalPrice', data.originalPrice);
              onUpdate('src', data.image);
              onUpdate('discount', data.discount);
              onUpdate('rating', data.rating || 4.5);
              onUpdate('soldCount', data.soldCount || '');
              onUpdate('ranking', data.ranking || '');
              onUpdate('tagRanking', data.tagRanking || '');
              onUpdate('storeName', data.storeName);
              onUpdate('sellerType', data.sellerType || '');
              onUpdate('description', data.shortDescription || data.description || '');
              onUpdate('shortDescription', data.shortDescription || '');
              onUpdate('fullDescription', data.fullDescription || '');
              if (data.specifications && data.specifications.length > 0) {
                onUpdate('specifications', data.specifications);
              }
              if (data.allImages && data.allImages.length > 0) {
                onUpdate('allImages', data.allImages);
                // Se tiver imagens, adiciona ao array de imagens do bloco também, se estiver vazio
                if (!block.images || block.images.length === 0) {
                   onUpdate('images', data.allImages.slice(0, 5)); // Pega as 5 primeiras
                }
              }
            }} />
            <button
              type="button"
              onClick={() => setShowJsonImport(true)}
              className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold transition-all shadow-sm hover:shadow"
            >
              <HiOutlineUpload size={16} /> 
              <span>Importar JSON</span>
            </button>
          </div>
        </div>
      </div>

      {/* Opção de Layout */}
      <div className="bg-purple-50/50 dark:bg-purple-900/10 p-6 rounded-2xl border border-purple-100 dark:border-purple-800 shadow-sm transition-all hover:shadow-md group hover:border-purple-200 dark:hover:border-purple-700">
        <div className={`${sectionHeaderStyles} text-purple-800 dark:text-purple-200 border-purple-200 dark:border-purple-800`}>
          <RiPlayListAddLine size={20} className="text-purple-500" />
          <span>Layout do Widget</span>
        </div>
        <div className="flex items-center justify-between p-4 bg-white dark:bg-slate-900 rounded-xl border border-purple-100 dark:border-purple-800/50">
          <div className="flex flex-col">
            <span className="text-sm font-bold text-slate-700 dark:text-slate-200">Modo Compacto</span>
            <span className="text-xs text-slate-500">Exibir o produto em formato horizontal reduzido</span>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              className="sr-only peer"
              checked={block.productLayout === 'compact'}
              onChange={(e) => onUpdate('productLayout', e.target.checked ? 'compact' : 'default')}
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 dark:peer-focus:ring-purple-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-purple-600"></div>
          </label>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Informações Básicas */}
        <div className="bg-blue-50/50 dark:bg-blue-900/10 p-6 rounded-2xl border border-blue-100 dark:border-blue-800 shadow-sm transition-all hover:shadow-md group hover:border-blue-200 dark:hover:border-blue-700">
          <div className={`${sectionHeaderStyles} text-blue-800 dark:text-blue-200 border-blue-200 dark:border-blue-800`}>
            <HiOutlineShoppingBag size={20} className="text-blue-500" />
            <span>Produto</span>
          </div>

          <div className="space-y-4">
            <div>
              <label className={inputLabelStyles}>Nome do Produto</label>
              <InputWithClear
                value={block.productName || ''}
                onChange={(e) => onUpdate('productName', e.target.value)}
                onClear={() => onUpdate('productName', '')}
                className={`${baseInputStyles} ${getRingClass('blue')}`}
                placeholder="Ex: Cadeira de Escritório Ergonômica"
                icon={<MdOutlineTitle size={20} className="text-blue-500" />}
              />
            </div>

            <div>
              <label className={inputLabelStyles}>Categoria</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-blue-500 z-10">
                  {categoryValue ? getCategoryIcon(categoryValue, 18, 'text-blue-500') : <BiDetail size={18} />}
                </div>
                <select
                  value={categoryValue}
                  onChange={(e) => onUpdate('category', e.target.value)}
                  className={`${baseInputStyles} pl-10 ${getRingClass('blue')} font-bold text-blue-600 dark:text-blue-400 cursor-pointer appearance-none`}
                >
                  <option value="">Sem categoria</option>
                  {availableCategories.map((cat) => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
                <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none text-slate-400">
                  <RiArrowDownSLine size={20} />
                </div>
              </div>
            </div>

            <div>
              <label className={inputLabelStyles}>Loja Parceira (Opcional)</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-blue-500 z-10">
                  <BiStore size={20} />
                </div>
                <select
                  value={block.storeName || ''}
                  onChange={(e) => {
                    onUpdate('storeName', e.target.value);
                    playClick();
                  }}
                  className={`${baseInputStyles} pl-10 ${getRingClass('blue')} font-bold text-blue-600 dark:text-blue-400 cursor-pointer appearance-none`}
                >
                  <option value="">Selecione uma loja</option>
                  {Object.keys(PARTNER_STORES).map((storeName) => (
                    <option key={storeName} value={storeName}>{storeName}</option>
                  ))}
                </select>
                <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none text-slate-400">
                  <RiArrowDownSLine size={20} />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Precificação e Avaliação */}
        <div className="bg-emerald-50/50 dark:bg-emerald-900/10 p-6 rounded-2xl border border-emerald-100 dark:border-emerald-800 shadow-sm transition-all hover:shadow-md group hover:border-emerald-200 dark:hover:border-emerald-700">
          <div className={`${sectionHeaderStyles} text-emerald-800 dark:text-emerald-200 border-emerald-200 dark:border-emerald-800`}>
            <BiDollarCircle size={20} className="text-emerald-500" />
            <span>Precificação</span>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={inputLabelStyles}>Preço Atual (Apenas números)</label>
              <InputWithClear
                type="text"
                inputMode="decimal"
                value={block.price || ''}
                onChange={(e) => {
                  const value = e.target.value.replace(/[^\d,]/g, '');
                  onUpdate('price', value);
                }}
                onClear={() => onUpdate('price', '')}
                className={`${baseInputStyles} ${getRingClass('emerald')} font-bold text-emerald-600`}
                placeholder="199,90"
                icon={<TbCurrencyReal size={20} className="text-emerald-500" />}
              />
            </div>

            <div>
              <label className={inputLabelStyles}>Preço De (Apenas números)</label>
              <InputWithClear
                type="text"
                inputMode="decimal"
                value={block.originalPrice || ''}
                onChange={(e) => {
                  const value = e.target.value.replace(/[^\d,]/g, '');
                  onUpdate('originalPrice', value);
                }}
                onClear={() => onUpdate('originalPrice', '')}
                className={`${baseInputStyles} ${getRingClass('slate')} text-slate-400 line-through decoration-slate-400`}
                placeholder="299,90"
                icon={<TbCurrencyReal size={20} className="text-slate-400" />}
              />
            </div>

            <div>
              <label className={inputLabelStyles}>Avaliação (0-5)</label>
              <InputWithClear
                type="text"
                inputMode="decimal"
                value={block.rating || ''}
                onChange={(e) => {
                  let val = e.target.value.replace(/[^\d.,]/g, '');
                  val = val.replace(',', '.');
                  const parts = val.split('.');
                  if (parts.length > 2) val = parts[0] + '.' + parts.slice(1).join('');
                  if (val && parseFloat(val) > 5) val = '5';
                  onUpdate('rating', val);
                }}
                onClear={() => onUpdate('rating', '')}
                className={`${baseInputStyles} ${getRingClass('amber')}`}
                placeholder="4.5"
                icon={<BsFillStarFill size={18} className="text-amber-400" />}
              />
            </div>

            <div>
              <label className={inputLabelStyles}>Vendas (ex: +1000 vendidos)</label>
              <InputWithClear
                type="text"
                value={block.soldCount || ''}
                onChange={(e) => onUpdate('soldCount', e.target.value)}
                onClear={() => onUpdate('soldCount', '')}
                className={`${baseInputStyles} ${getRingClass('emerald')}`}
                placeholder="+1000 vendidos"
                icon={<FaMoneyBillTrendUp size={18} className="text-emerald-500" />}
              />
            </div>

            <div>
              <label className={inputLabelStyles}>Ranking (ex: 7º em Cadeiras)</label>
              <InputWithClear
                type="text"
                value={block.ranking || ''}
                onChange={(e) => onUpdate('ranking', e.target.value)}
                onClear={() => onUpdate('ranking', '')}
                className={`${baseInputStyles} ${getRingClass('orange')}`}
                placeholder="7º em Cadeiras para Escritório"
                icon={<LuFileBadge2 size={20} className="text-orange-500" />}
              />
            </div>

            <div>
              <label className={inputLabelStyles}>Tag de Ranking (ex: MAIS VENDIDO)</label>
              <InputWithClear
                type="text"
                value={block.tagRanking || ''}
                onChange={(e) => onUpdate('tagRanking', e.target.value)}
                onClear={() => onUpdate('tagRanking', '')}
                className={`${baseInputStyles} ${getRingClass('amber')} uppercase font-bold`}
                placeholder="MAIS VENDIDO, DESTAQUE, TOP 1"
                icon={<LuFileBadge2 size={20} className="text-amber-500" />}
              />
            </div>
          </div>
        </div>

        {/* Detalhes do Produto */}
        <div className="bg-amber-50/50 dark:bg-amber-900/10 p-6 rounded-2xl border border-amber-100 dark:border-amber-800 shadow-sm transition-all hover:shadow-md group hover:border-amber-200 dark:hover:border-amber-700 md:col-span-2">
          <div className="flex items-center justify-between gap-3 border-b border-amber-200 dark:border-amber-800 pb-2 mb-4">
            <div className="flex items-center gap-2 text-amber-800 dark:text-amber-200 font-bold">
              <BiDetail size={20} className="text-amber-600 dark:text-amber-400" />
              <span>Detalhes do Produto</span>
            </div>
            <button
              type="button"
              onClick={() => setShowAIGeneration(true)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest bg-gradient-to-r from-pink-500 via-rose-500 to-purple-600 text-white shadow-lg shadow-pink-500/20 hover:shadow-pink-500/40 hover:scale-105 transition-all"
            >
              <RiRobot3Fill size={14} />
              Texto de IA
            </button>
          </div>
          <div className="space-y-6">
            <div>
              <label className={inputLabelStyles}>Descrição</label>
              <InputWithClear
                as="textarea"
                value={block.description || ''}
                onChange={(e) => onUpdate('description', e.target.value)}
                onClear={() => onUpdate('description', '')}
                className={`${baseInputStyles} h-28 resize-none py-3 leading-relaxed ${getRingClass('orange')}`}
                placeholder="Destaque as principais qualidades deste produto..."
              />
            </div>

            <div>
              <label className={inputLabelStyles}>Imagens do Produto</label>
              <div className="space-y-3">
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <InputWithClear
                      type="text"
                      value={block.src || ''}
                      onChange={(e) => handlePrimaryImageChange(e.target.value)}
                      onClear={() => handlePrimaryImageChange('')}
                      className={`${baseInputStyles} ${getRingClass('blue')}`}
                      placeholder="https://imagem-do-produto.jpg"
                      icon={<MdOutlineImageSearch size={20} className="text-blue-400" />}
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => { setShowAllImages(!showAllImages); playClick(); }}
                    className="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold flex items-center gap-2 hover:bg-slate-200 dark:hover:bg-slate-700 transition-all"
                  >
                    <HiOutlineEye size={16} /> Galeria
                  </button>
                </div>
                <div className="flex gap-2">
                  <InputWithClear
                    type="text"
                    value={newImageUrl}
                    onChange={(e) => setNewImageUrl(e.target.value)}
                    onClear={() => setNewImageUrl('')}
                    className={`${baseInputStyles} ${getRingClass('blue')}`}
                    placeholder="Adicionar outra URL de imagem"
                    icon={<MdOutlineImageSearch size={20} className="text-blue-400" />}
                  />
                  <button
                    type="button"
                    onClick={addNewImage}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all"
                  >
                    Adicionar
                  </button>
                </div>
                {showAllImages && (
                  <div className="border border-slate-200 dark:border-slate-700 rounded-2xl p-4 bg-slate-50 dark:bg-slate-900">
                    <div className="grid grid-cols-3 gap-3">
                      {(block.allImages && block.allImages.length > 0 
                        ? block.allImages 
                        : ALL_IMAGES.map((src, i) => ({ id: `def-${i}`, src }))
                      ).map((img, index) => (
                        <button
                          key={index}
                          type="button"
                          onClick={() => addImage(img.src)}
                          className="relative group rounded-xl overflow-hidden border-2 border-transparent hover:border-blue-500 transition-all aspect-video bg-white dark:bg-slate-800"
                        >
                          <Image src={img.src} alt={`Imagem ${index + 1}`} fill className="object-contain" unoptimized />
                          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-all flex items-center justify-center">
                            <span className="text-white text-xs font-bold opacity-0 group-hover:opacity-100 transition-all">Adicionar</span>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
                {images.length > 0 && (
                  <div className="space-y-2">
                    {images.map((url, index) => (
                      <div key={`${url}-${index}`} className="flex items-center gap-3 p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700">
                        <div className="relative w-14 h-14 rounded-lg overflow-hidden border border-slate-200 dark:border-slate-700 bg-white">
                          <Image src={url} alt={`Imagem ${index + 1}`} fill className="object-contain" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-xs font-bold text-slate-600 dark:text-slate-300 truncate">{url}</div>
                        </div>
                        <button
                          type="button"
                          onClick={() => { removeImage(index); playDelete(); }}
                          className="p-2 text-slate-400 hover:text-red-500 transition-colors"
                        >
                          <BiTrashAlt size={16} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* SEÇÃO DE CUPOM */}
        <div className="bg-gradient-to-r from-emerald-500/5 to-teal-500/5 p-6 rounded-2xl border border-emerald-100 dark:border-emerald-800 shadow-sm transition-all hover:shadow-md group hover:border-emerald-200 dark:hover:border-emerald-700 md:col-span-2">
          <div className={`${sectionHeaderStyles} text-emerald-800 dark:text-emerald-200 border-emerald-200 dark:border-emerald-800`}>
            <RiCoupon2Line size={24} className="text-emerald-500" />
            <span className="text-lg">Configurar Cupom Relacionado</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className={inputLabelStyles}>Nome do Cupom</label>
              <InputWithClear
                type="text"
                value={block.name || ''}
                onChange={(e) => onUpdate('name', e.target.value)}
                onClear={() => onUpdate('name', '')}
                className={`${baseInputStyles} ${getRingClass('blue')}`}
                placeholder="Ex: CUPOM10"
                icon={<MdOutlineTitle size={20} className="text-blue-500" />}
              />
            </div>
            <div>
              <label className={inputLabelStyles}>Código (Mono)</label>
              <InputWithClear
                type="text"
                value={block.couponCode || ''}
                onChange={(e) => onUpdate('couponCode', e.target.value)}
                onClear={() => onUpdate('couponCode', '')}
                className={`${baseInputStyles} font-mono uppercase font-bold text-emerald-600 ${getRingClass('emerald')}`}
                placeholder="CÓDIGO"
                icon={<IoTicket size={20} className="text-emerald-500" />}
              />
            </div>
            <div className="flex items-end pb-1">
              <label className="flex items-center gap-3 p-3 w-full bg-white dark:bg-slate-900/50 rounded-xl border border-slate-200 dark:border-slate-800 cursor-pointer hover:bg-slate-50 transition-colors group">
                <input
                  type="checkbox"
                  checked={block.isExpired || false}
                  onChange={(e) => onUpdate('isExpired', e.target.checked)}
                  className={checkboxEmeraldStyles}
                />
                <span className="text-sm font-bold text-slate-700 dark:text-slate-300 group-hover:text-emerald-600 transition-colors">Marcar como Expirado</span>
              </label>
            </div>
          </div>
        </div>

        {/* Link e Botão */}
        <div className="bg-indigo-50/50 dark:bg-indigo-900/10 p-6 rounded-2xl border border-indigo-100 dark:border-indigo-800 shadow-sm transition-all hover:shadow-md group hover:border-indigo-200 dark:hover:border-indigo-700 md:col-span-2">
          <div className={`${sectionHeaderStyles} text-indigo-800 dark:text-indigo-200 border-indigo-200 dark:border-indigo-800`}>
            <HiOutlineExternalLink size={20} className="text-indigo-600 dark:text-indigo-400" />
            <span>Afiliado e CTA</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <label className={inputLabelStyles}>Link Final de Afiliado</label>
              <InputWithClear
                type="text"
                value={block.affiliateLink || ''}
                onChange={(e) => onUpdate('affiliateLink', e.target.value)}
                onClear={() => onUpdate('affiliateLink', '')}
                className={`${baseInputStyles} ${getRingClass('emerald')}`}
                placeholder="https://shope.ee/..."
                icon={<TbWorldDollar size={20} className="text-emerald-500" />}
              />
            </div>
            <div className="md:col-span-2">
              <label className={inputLabelStyles}>Texto do Botão</label>
              <InputWithClear
                type="text"
                value={block.affiliateButtonText || ''}
                onChange={(e) => onUpdate('affiliateButtonText', e.target.value)}
                onClear={() => onUpdate('affiliateButtonText', '')}
                className={`${baseInputStyles} font-bold text-blue-600 bg-blue-50/50 dark:bg-blue-900/10 border-blue-100 dark:border-blue-900/30 ${getRingClass('blue')}`}
                placeholder="VER OFERTA"
                icon={<MdOutlineTitle size={20} className="text-blue-500" />}
              />
            </div>
            <div className="md:col-span-2">
              <label className={inputLabelStyles}>Logo do Botão (Opcional)</label>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <InputWithClear
                    type="text"
                    value={block.affiliateLogo || ''}
                    onChange={(e) => onUpdate('affiliateLogo', e.target.value)}
                    onClear={() => onUpdate('affiliateLogo', '')}
                    className={`${baseInputStyles} ${getRingClass('blue')}`}
                    placeholder="https://logo-da-loja.png"
                    icon={<MdOutlineImageSearch size={20} className="text-blue-500" />}
                  />
                </div>
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setShowLogoDropdown(!showLogoDropdown)}
                    className="h-full px-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors flex items-center gap-2 text-sm font-medium text-slate-600 dark:text-slate-300"
                  >
                    {block.affiliateLogo ? (
                      <div className="relative w-5 h-5">
                        <Image src={block.affiliateLogo} alt="Logo" fill unoptimized sizes="20px" className="object-contain" />
                      </div>
                    ) : (
                      <RiArrowDownSLine size={20} />
                    )}
                    <span>Logos</span>
                  </button>
                  {showLogoDropdown && (
                    <div
                      ref={dropdownRef}
                      className="absolute right-0 bottom-full mb-2 w-64 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-2xl z-50 overflow-hidden animate-in fade-in slide-in-from-bottom-2 duration-200"
                    >
                      <div className="p-3 border-b border-slate-100 dark:border-slate-800 bg-gray-50 dark:bg-slate-800/50">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Selecione uma logo</span>
                      </div>
                      <div className="max-h-64 overflow-y-auto p-2 grid grid-cols-2 gap-2 custom-scrollbar">
                        {STORE_LOGOS.map((store) => (
                          <button
                            key={store.name}
                            type="button"
                            onClick={() => {
                              onUpdate('affiliateLogo', store.logoUrl);
                              setShowLogoDropdown(false);
                            }}
                            className="flex flex-col items-center gap-2 p-3 rounded-xl hover:bg-blue-50 dark:hover:bg-blue-900/20 border border-transparent hover:border-blue-100 dark:hover:border-blue-800/50 transition-all group"
                          >
                            <div className="relative w-10 h-10 bg-white dark:bg-white p-1.5 rounded-lg shadow-sm group-hover:shadow-md transition-all">
                              <Image src={store.logoUrl} alt={store.name} fill unoptimized sizes="40px" className="object-contain" />
                            </div>
                            <span className="text-[10px] font-medium text-slate-500 dark:text-slate-400 truncate w-full text-center">
                              {store.name}
                            </span>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Prós e Contras */}
        {block.productLayout !== 'compact' && (
          <div className="bg-white dark:bg-slate-800/50 p-6 rounded-2xl border border-slate-100 dark:border-slate-800 md:col-span-2 shadow-sm">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Pros */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2 font-bold text-emerald-600">
                    <HiOutlineBadgeCheck size={20} />
                    <span>Pontos Positivos</span>
                  </div>
                  <button
                    type="button"
                    onClick={addPro}
                    className="p-1 px-3 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 rounded-full text-xs font-bold flex items-center gap-1 hover:bg-emerald-200 transition-colors"
                  >
                    <RiPlayListAddLine size={14} />
                    ADICIONAR
                  </button>
                </div>
                <div className="space-y-3">
                  {(block.pros || []).map((pro, index) => (
                    <div key={index} className="flex items-center gap-3 p-2 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 group hover:border-emerald-400 transition-colors shadow-sm">
                      <div className="p-1.5 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg text-emerald-600">
                        <Check size={14} />
                      </div>
                      <input
                        type="text"
                        value={pro}
                        onChange={(e) => updatePro(index, e.target.value)}
                        className="flex-1 bg-transparent border-none outline-none text-sm text-slate-700 dark:text-slate-200 placeholder-slate-400"
                        placeholder="Digite um ponto positivo"
                      />
                      <button
                        onClick={() => removePro(index)}
                        className="p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all"
                        title="Remover"
                      >
                        <BiTrashAlt size={16} />
                      </button>
                    </div>
                  ))}
                  {(block.pros || []).length === 0 && (
                    <div className="text-center py-6 border-2 border-dashed border-slate-100 dark:border-slate-800 rounded-2xl text-slate-400 text-sm">
                      Nenhum ponto positivo adicionado
                    </div>
                  )}
                </div>
              </div>

              {/* Cons */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2 font-bold text-red-600">
                    <RiCloseCircleLine size={20} />
                    <span>Pontos Negativos</span>
                  </div>
                  <button
                    type="button"
                    onClick={addCon}
                    className="p-1 px-3 bg-red-100 dark:bg-red-900/30 text-red-600 rounded-full text-xs font-bold flex items-center gap-1 hover:bg-red-200 transition-colors"
                  >
                    <RiPlayListAddLine size={14} />
                    ADICIONAR
                  </button>
                </div>
                <div className="space-y-3">
                  {(block.cons || []).map((con, index) => (
                    <div key={index} className="flex items-center gap-3 p-2 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 group hover:border-red-400 transition-colors shadow-sm">
                      <div className="p-1.5 bg-red-100 dark:bg-red-900/30 rounded-lg text-red-600">
                        <X size={14} />
                      </div>
                      <input
                        type="text"
                        value={con}
                        onChange={(e) => updateCon(index, e.target.value)}
                        className="flex-1 bg-transparent border-none outline-none text-sm text-slate-700 dark:text-slate-200 placeholder-slate-400"
                        placeholder="Digite um ponto negativo"
                      />
                      <button
                        onClick={() => removeCon(index)}
                        className="p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all"
                        title="Remover"
                      >
                        <BiTrashAlt size={16} />
                      </button>
                    </div>
                  ))}
                  {(block.cons || []).length === 0 && (
                    <div className="text-center py-6 border-2 border-dashed border-slate-100 dark:border-slate-800 rounded-2xl text-slate-400 text-sm">
                      Nenhum ponto negativo adicionado
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
      {showJsonImport && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[100] flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-2xl max-w-lg w-full overflow-hidden">
            <div className="p-6 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center">
              <h3 className="text-lg font-bold text-slate-800 dark:text-white flex items-center gap-2">
                <HiOutlineUpload className="text-blue-500" />
                Importar Dados JSON
              </h3>
              <button onClick={() => setShowJsonImport(false)} className="text-slate-400 hover:text-slate-600">
                <X size={20} />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <InputWithClear
                as="textarea"
                value={jsonInput}
                onChange={(e) => setJsonInput(e.target.value)}
                onClear={() => setJsonInput('')}
                placeholder='Cole o JSON aqui...'
                className="w-full h-48 p-4 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-mono focus:ring-2 focus:ring-blue-500 outline-none dark:text-white"
              />
              {jsonError && (
                <div className="p-3 bg-red-50 text-red-600 text-xs rounded-lg flex items-center gap-2">
                  <X size={14} /> {jsonError}
                </div>
              )}
            </div>
            <div className="p-6 border-t border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 flex justify-end gap-3">
              <button
                onClick={() => setShowJsonImport(false)}
                className="px-4 py-2 text-slate-600 dark:text-slate-300 font-bold text-sm hover:bg-slate-100 dark:hover:bg-slate-700 rounded-xl transition"
              >
                Cancelar
              </button>
              <button
                onClick={handleJsonImport}
                className="px-4 py-2 bg-blue-600 text-white font-bold text-sm rounded-xl hover:bg-blue-700 transition shadow-lg shadow-blue-500/20"
              >
                Ler JSON
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Preview e Seleção */}
      {showPreviewModal && previewData && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-[101] flex items-center justify-center p-4 animate-in fade-in zoom-in-95">
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
            <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center bg-slate-50 dark:bg-slate-800/50">
              <div>
                <h3 className="text-xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
                  <Sparkles className="text-purple-500" />
                  Confirmar Importação
                </h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Selecione as imagens e revise os dados extraídos</p>
              </div>
              <button onClick={() => setShowPreviewModal(false)} className="p-2 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-full transition">
                <X size={24} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-8">
              {/* Preview Images Selection */}
              <div>
                <h4 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                  <HiOutlinePhotograph /> Seleção de Imagens ({selectedImages.length})
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 gap-4">
                  {availableImages.map((img, idx) => {
                    const isSelected = selectedImages.includes(img);
                    return (
                      <div 
                        key={idx}
                        onClick={() => {
                          if (isSelected) {
                            setSelectedImages(prev => prev.filter(i => i !== img));
                          } else {
                            setSelectedImages(prev => [...prev, img]);
                          }
                        }}
                        className={`relative aspect-square rounded-xl overflow-hidden cursor-pointer group border-2 transition-all ${isSelected ? 'border-purple-500 ring-2 ring-purple-500/20' : 'border-slate-200 dark:border-slate-700 opacity-70 hover:opacity-100'}`}
                      >
                        <Image src={img} alt="" fill className="object-cover" />
                        <div className={`absolute inset-0 bg-black/40 flex items-center justify-center transition-opacity ${isSelected ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}>
                          <Check className="text-white w-8 h-8 bg-purple-500 rounded-full p-1" />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Data Preview */}
              <div>
                <h4 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                  <ShieldCheck /> Dados Extraídos
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-700">
                    <span className="text-xs text-slate-400 uppercase font-bold">Produto</span>
                    <p className="font-medium text-slate-700 dark:text-slate-200 line-clamp-2">{previewData.title || '-'}</p>
                  </div>
                  <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-700">
                    <span className="text-xs text-slate-400 uppercase font-bold">Preço</span>
                    <p className="font-medium text-emerald-600 dark:text-emerald-400">{previewData.price || '-'}</p>
                  </div>
                  <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-700">
                    <span className="text-xs text-slate-400 uppercase font-bold">Loja</span>
                    <p className="font-medium text-blue-600 dark:text-blue-400">{previewData.storeName || '-'}</p>
                  </div>
                  <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-700">
                    <span className="text-xs text-slate-400 uppercase font-bold">Desconto</span>
                    <p className="font-medium text-pink-600 dark:text-pink-400">{previewData.discount || '-'}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-6 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 flex justify-end gap-3">
              <button
                onClick={() => setShowPreviewModal(false)}
                className="px-6 py-3 text-slate-600 dark:text-slate-300 font-bold text-sm hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl transition"
              >
                Cancelar
              </button>
              <button
                onClick={confirmImport}
                className="px-8 py-3 bg-purple-600 text-white font-bold text-sm rounded-xl hover:bg-purple-700 transition shadow-lg shadow-purple-500/20 flex items-center gap-2"
              >
                <Check size={18} />
                Confirmar e Preencher
              </button>
            </div>
          </div>
        </div>
      )}

      {showAIGeneration && (
        <AIChatModal
          isOpen={showAIGeneration}
          onClose={() => {
            setShowAIGeneration(false);
            playClick();
          }}
          onInsert={(text) => {
            onUpdate('description', block.description ? `${block.description}\n${text}` : text);
            setShowAIGeneration(false);
            playClick();
          }}
          initialPrompt="Escreva uma descrição persuasiva para este produto, destacando seus principais benefícios."
          productName={block.productName}
          storeName={block.storeName}
        />
      )}
    </>
  );
};

export default ProductWidgetEditor;
