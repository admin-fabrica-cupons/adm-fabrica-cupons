import React, { useState, useRef, useEffect } from 'react';
import { ProductListBlock, ProductListItem } from '../../../types';
import Image from 'next/image';
import { HiOutlineViewGrid, HiOutlineViewList, HiOutlinePlus, HiOutlinePhotograph, HiOutlineStar, HiOutlineExternalLink, HiOutlineUpload, HiOutlineX } from 'react-icons/hi';
import { BiColumns, BiDetail, BiDollarCircle, BiTrashAlt, BiTrophy, BiStore } from 'react-icons/bi';
import { RiCoupon2Line, RiLayoutGridLine, RiPlayListAddLine, RiNumbersLine, RiArrowDownSLine, RiRobot3Fill } from 'react-icons/ri';
import { TbCurrencyReal, TbWorldWww, TbTextPlus, TbWorldDollar } from 'react-icons/tb';
import { MdOutlineImageSearch, MdOutlineTitle } from 'react-icons/md';
import { BsFillStarFill } from 'react-icons/bs';
import { LuFileBadge2 } from 'react-icons/lu';
import { FaMoneyBillTrendUp, FaPercent } from 'react-icons/fa6';
import { IoTicket } from 'react-icons/io5';
import { AiOutlineWarning } from 'react-icons/ai';
import { Sparkles } from 'lucide-react';
import ProductImporter from '../Util/ProductImporter';
import AIChatModal from '../Util/AIChatModal';
import InputWithClear from '../Util/InputWithClear';
import { PARTNER_STORES } from '../../../constants';
import { useAppSounds } from '../../../hooks/useAppSounds';

interface ProductListWidgetEditorProps {
  block: ProductListBlock;
  onUpdate: (field: string, value: any) => void;
  onUpdateListItem: (itemId: string, field: string, value: any) => void;
  onAddListItem: () => void;
  onRemoveListItem: (itemId: string) => void;
}

const STORE_LOGOS = Object.entries(PARTNER_STORES)
  .map(([name, data]: any) => ({ name, logoUrl: data.logoUrl }))
  .filter((item: any) => item.logoUrl);

const ProductListWidgetEditor: React.FC<ProductListWidgetEditorProps> = ({
  block,
  onUpdate,
  onUpdateListItem,
  onAddListItem,
  onRemoveListItem,
}) => {
  const { playAdd } = useAppSounds();
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [showJsonImport, setShowJsonImport] = useState(false);
  const [jsonInput, setJsonInput] = useState('');
  const [jsonError, setJsonError] = useState('');
  const [showAIGeneration, setShowAIGeneration] = useState<string | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const itemRefs = useRef<Record<string, HTMLDivElement | null>>({});

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setActiveDropdown(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const items = block.items || [];

  const scrollToItem = (itemId: string) => {
    const element = itemRefs.current[itemId];
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const generateId = () => `${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;

  const handleImportItem = (itemId: string, data: any) => {
    if (!onUpdateListItem) return;
    if (data.title || data.productName) onUpdateListItem(itemId, 'title', data.title || data.productName);
    if (data.image) onUpdateListItem(itemId, 'image', data.image);
    if (data.price) onUpdateListItem(itemId, 'price', data.price);
    if (data.originalPrice) onUpdateListItem(itemId, 'originalPrice', data.originalPrice);
    if (data.rating) onUpdateListItem(itemId, 'rating', data.rating);
    if (data.description || data.shortDescription) onUpdateListItem(itemId, 'description', data.description || data.shortDescription);
    if (data.storeName) onUpdateListItem(itemId, 'storeName', data.storeName);
    if (data.sellerType) onUpdateListItem(itemId, 'sellerType', data.sellerType);
    if (data.soldCount) onUpdateListItem(itemId, 'soldCount', data.soldCount);
    if (data.ranking) onUpdateListItem(itemId, 'ranking', data.ranking);
    if (data.tagRanking) onUpdateListItem(itemId, 'tagRanking', data.tagRanking);
    if (data.discount) onUpdateListItem(itemId, 'discount', data.discount);
    if (data.affiliateLink) onUpdateListItem(itemId, 'affiliateLink', data.affiliateLink);
    if (data.affiliateButtonText) onUpdateListItem(itemId, 'affiliateButtonText', data.affiliateButtonText);
    if (data.affiliateLogo) onUpdateListItem(itemId, 'affiliateLogo', data.affiliateLogo);
    if (data.couponCode) onUpdateListItem(itemId, 'couponCode', data.couponCode);
    if (data.name) onUpdateListItem(itemId, 'couponName', data.name);
    if (data.shortDescription) onUpdateListItem(itemId, 'shortDescription', data.shortDescription);
    if (data.fullDescription) onUpdateListItem(itemId, 'fullDescription', data.fullDescription);
    if (data.specifications && data.specifications.length > 0) {
      onUpdateListItem(itemId, 'specifications', data.specifications);
    }
    if (data.allImages && data.allImages.length > 0) {
      onUpdateListItem(itemId, 'allImages', data.allImages);
    }
  };

  const normalizeItem = (item: any): ProductListItem => {
    const images = Array.isArray(item?.images) ? item.images.filter(Boolean) : [];
    return {
      id: item.id || generateId(),
      title: item.title || item.productName || 'Produto',
      description: item.description,
      price: item.price,
      originalPrice: item.originalPrice,
      discount: item.discount,
      rating: item.rating,
      storeName: item.storeName,
      affiliateLink: item.affiliateLink,
      image: item.image || item.src || images[0],
      affiliateButtonText: item.affiliateButtonText,
      affiliateLogo: item.affiliateLogo,
      showStoreLogo: item.showStoreLogo,
      pros: item.pros,
      cons: item.cons,
      soldCount: item.soldCount,
      ranking: item.ranking,
      tagRanking: item.tagRanking,
      category: item.category,
      originPostId: item.originPostId,
      originPostCategory: item.originPostCategory,
      originPostTitle: item.originPostTitle,
      originPostDate: item.originPostDate,
      originPostSlug: item.originPostSlug,
    };
  };

  const importFromJson = () => {
    try {
      const parsed = JSON.parse(jsonInput);
      const data = Array.isArray(parsed) ? { items: parsed } : parsed;
      if (!data || typeof data !== 'object' || !Array.isArray(data.items)) {
        setJsonError('JSON inválido');
        return;
      }
      const normalizedItems = data.items.map((item: any) => normalizeItem(item));
      onUpdate('items', normalizedItems);
      if (data.name) onUpdate('name', data.name);
      if (data.listType) onUpdate('listType', data.listType);
      if (data.columns) onUpdate('columns', data.columns);
      if (data.rankSize) onUpdate('rankSize', data.rankSize);
      setJsonError('');
      setJsonInput('');
      setShowJsonImport(false);
    } catch {
      setJsonError('JSON inválido');
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      setJsonInput(String(reader.result || ''));
      setJsonError('');
    };
    reader.onerror = () => {
      setJsonError('Erro ao ler arquivo');
    };
    reader.readAsText(file);
    event.target.value = '';
  };

  const handleAiInsert = (text: string) => {
    if (showAIGeneration) {
      onUpdateListItem(showAIGeneration, 'description', text);
      setShowAIGeneration(null);
    }
  };

  const sectionHeaderStyles = "flex items-center gap-2 mb-4 text-slate-800 dark:text-slate-200 font-bold border-b border-slate-200 dark:border-slate-700 pb-2";
  const inputGroupStyles = "bg-white dark:bg-slate-800/50 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm transition-all hover:shadow-md";
  const inputLabelStyles = "block text-[10px] font-black text-slate-500 dark:text-slate-400 mb-1.5 uppercase tracking-widest";
  const baseInputStyles = "w-full px-4 py-2 bg-gray-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-offset-0 focus:bg-white dark:focus:bg-slate-800 transition-all dark:text-white text-sm hover:border-gray-300 dark:hover:border-slate-600";
  const selectStyles = "w-full px-4 py-2 bg-gray-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-offset-0 focus:bg-white dark:focus:bg-slate-800 transition-all dark:text-white text-sm cursor-pointer hover:border-gray-300 dark:hover:border-slate-600 appearance-none";
  const checkboxRedStyles = "relative h-5 w-5 appearance-none rounded-md border border-red-200 dark:border-red-700 bg-white dark:bg-slate-900 transition-all focus:outline-none focus:ring-2 focus:ring-red-500/20 after:content-[''] after:absolute after:left-1/2 after:top-1/2 after:h-2 after:w-1 after:-translate-x-1/2 after:-translate-y-1/2 after:rotate-45 after:border-r-2 after:border-b-2 after:border-white after:opacity-0 checked:after:opacity-100 checked:bg-red-600 checked:border-red-600";
  
  // Helper to generate ring class
  const getRingClass = (color: string) => `focus:border-${color}-500 focus:ring-${color}-500/20`;

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Configurações Globais da Lista */}
      <div className={`${inputGroupStyles} bg-gradient-to-br from-slate-50 to-blue-50/30 dark:from-slate-800/50 dark:to-blue-900/10`}>
        <div className={sectionHeaderStyles}>
          <RiLayoutGridLine size={20} className="text-blue-500" />
          <span>Configuração da Exibição</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div className="md:col-span-2">
            <label className={inputLabelStyles}>Nome da Lista (Opcional)</label>
            <InputWithClear
              type="text"
              value={block.name || ''}
              onChange={(e) => onUpdate('name', e.target.value)}
              onClear={() => onUpdate('name', '')}
              placeholder="Ex: Melhores SmartPhones de 2025"
              className={`${baseInputStyles} ${getRingClass('blue')}`}
              icon={<MdOutlineTitle size={20} className="text-blue-500" />}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <label className={inputLabelStyles}>Modo de Layout</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-3 flex items-center text-slate-400 pointer-events-none z-10">
                {block.listType === 'rank' ? <BiTrophy size={18} /> : block.listType === 'vertical' ? <HiOutlineViewList size={18} /> : <HiOutlineViewGrid size={18} />}
              </div>
              <select
                value={block.listType || 'grid'}
                onChange={(e) => onUpdate('listType', e.target.value)}
                className={`${selectStyles} pl-10 ${getRingClass('blue')}`}
              >
                <option value="grid">Grade de Produtos</option>
                <option value="list">Lista Vertical</option>
                <option value="carousel">Carrossel (Novo)</option>
                <option value="podium">Modo Podium (Top 3)</option>
              </select>
            </div>
          </div>

          {block.listType === 'grid' && (
            <div>
              <label className={inputLabelStyles}>Colunas (Desktop)</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-3 flex items-center text-slate-400 pointer-events-none z-10">
                  <BiColumns size={18} />
                </div>
                <select
                  value={block.columns || 3}
                  onChange={(e) => onUpdate('columns', parseInt(e.target.value))}
                  className={`${selectStyles} pl-10 ${getRingClass('blue')}`}
                >
                  <option value={1}>1 Coluna</option>
                  <option value={2}>2 Colunas</option>
                  <option value={3}>3 Colunas</option>
                  <option value={4}>4 Colunas</option>
                </select>
              </div>
            </div>
          )}

          {(block.listType === 'rank' || block.listType === 'podium') && (
            <div>
              <label className={inputLabelStyles}>Tamanho do Ranking</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-3 flex items-center text-slate-400 pointer-events-none z-10">
                  <RiNumbersLine size={18} />
                </div>
                <select
                  value={block.rankSize || 3}
                  onChange={(e) => onUpdate('rankSize', parseInt(e.target.value))}
                  className={`${selectStyles} pl-10 ${getRingClass('blue')}`}
                >
                  <option value={3}>Top 3</option>
                  <option value={5}>Top 5</option>
                </select>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Cabeçalho da Lista de Produtos */}
      <div className="flex items-center justify-between bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-500/10 text-blue-600 rounded-lg">
            <RiPlayListAddLine size={20} />
          </div>
          <div>
            <h3 className="font-bold text-slate-800 dark:text-white">Gerenciar Itens</h3>
            <p className="text-[10px] text-slate-400 uppercase font-black tracking-widest">{items.length} PRODUTOS</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowJsonImport(true)}
            className="flex items-center gap-2 bg-blue-50 dark:bg-blue-900/20 hover:bg-blue-100 dark:hover:bg-blue-900/30 text-blue-600 dark:text-blue-300 px-4 py-2.5 rounded-xl text-xs font-bold border border-blue-200 dark:border-blue-700 transition-all"
          >
            <HiOutlineUpload size={16} />
            IMPORTAR JSON
          </button>
          <button
            onClick={() => {
              onAddListItem();
              playAdd();
            }}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl text-sm font-bold shadow-lg shadow-blue-500/20 transition-all active:scale-95"
          >
            <HiOutlinePlus size={18} />
            ADICIONAR PRODUTO
          </button>
        </div>
      </div>

      {items.length > 0 && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-3 shadow-sm">
          <div className="flex flex-wrap gap-2">
            {items.map((item, index) => (
              <button
                key={item.id}
                type="button"
                onClick={() => scrollToItem(item.id)}
                className="flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 text-xs font-bold hover:border-blue-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
              >
                <span className="flex items-center justify-center w-5 h-5 rounded-full bg-blue-600 text-white text-[10px] font-black">
                  {index + 1}
                </span>
                <span className="truncate max-w-[180px]">{item.title || 'Novo Produto'}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="space-y-6">
        {items.map((item, index) => (
          <div
            key={item.id}
            ref={(el) => {
              itemRefs.current[item.id] = el;
            }}
            className="group animate-in slide-in-from-top-4 duration-300"
          >
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl overflow-hidden shadow-sm hover:shadow-md transition-shadow">
              {/* Header do Item */}
              <div className="bg-slate-50 dark:bg-slate-800/80 px-6 py-3 flex items-center justify-between border-b dark:border-slate-800">
                <div className="flex items-center gap-3">
                  <span className="flex items-center justify-center w-8 h-8 bg-blue-600 text-white rounded-full text-xs font-black">
                    {index + 1}
                  </span>
                  <span className="text-sm font-bold text-slate-700 dark:text-slate-200">
                    {item.title || 'Novo Produto'}
                  </span>
                </div>
                <button
                  onClick={() => onRemoveListItem(item.id)}
                  className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all"
                  title="Remover este produto"
                >
                  <BiTrashAlt size={18} />
                </button>
              </div>

              <div className="p-6 space-y-6">
                {/* Importer Otimizado */}
                <div className="bg-blue-500/5 p-4 rounded-2xl border border-dashed border-blue-200 dark:border-blue-800/50">
                  <label className={inputLabelStyles}>Importação Automática</label>
                  <ProductImporter onImport={(data) => handleImportItem(item.id, data)} compact={true} />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Informações Principais */}
                  <div className="md:col-span-2 space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="md:col-span-1">
                        <label className={inputLabelStyles}>Título do Produto</label>
                        <InputWithClear
                          type="text"
                          value={item.title || ''}
                          onChange={(e) => onUpdateListItem(item.id, 'title', e.target.value)}
                          onClear={() => onUpdateListItem(item.id, 'title', '')}
                          className={`${baseInputStyles} ${getRingClass('blue')}`}
                          placeholder="Ex: Teclado Mecânico RGB"
                          icon={<MdOutlineTitle size={20} className="text-blue-500" />}
                        />
                      </div>
                      <div className="md:col-span-1">
                        <label className={inputLabelStyles}>Loja Parceira</label>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-blue-500 z-10">
                            <BiStore size={20} />
                          </div>
                          <select
                            value={item.storeName || ''}
                            onChange={(e) => onUpdateListItem(item.id, 'storeName', e.target.value)}
                            className={`${selectStyles} pl-10 font-bold text-blue-600 dark:text-blue-400 ${getRingClass('blue')}`}
                          >
                            <option value="">Selecione uma loja</option>
                            {Object.keys(PARTNER_STORES).map((storeName) => (
                              <option key={storeName} value={storeName}>{storeName}</option>
                            ))}
                          </select>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className={inputLabelStyles}>Preço Atual</label>
                        <InputWithClear
                          type="text"
                          inputMode="decimal"
                          value={item.price || ''}
                          onChange={(e) => {
                            const value = e.target.value.replace(/[^\d,]/g, '');
                            onUpdateListItem(item.id, 'price', value);
                          }}
                          onClear={() => onUpdateListItem(item.id, 'price', '')}
                          className={`${baseInputStyles} ${getRingClass('emerald')} font-bold text-emerald-600`}
                          placeholder="199,90"
                          icon={<TbCurrencyReal size={20} className="text-emerald-500" />}
                        />
                      </div>

                      <div>
                        <label className={inputLabelStyles}>Preço Original</label>
                        <InputWithClear
                          type="text"
                          inputMode="decimal"
                          value={item.originalPrice || ''}
                          onChange={(e) => {
                            const value = e.target.value.replace(/[^\d,]/g, '');
                            onUpdateListItem(item.id, 'originalPrice', value);
                          }}
                          onClear={() => onUpdateListItem(item.id, 'originalPrice', '')}
                          className={`${baseInputStyles} ${getRingClass('slate')} text-slate-400 line-through decoration-slate-400`}
                          placeholder="299,90"
                          icon={<TbCurrencyReal size={20} className="text-slate-400" />}
                        />
                      </div>

                      <div>
                        <label className={inputLabelStyles}>Avaliação</label>
                        <InputWithClear
                          type="text"
                          inputMode="decimal"
                          value={item.rating || ''}
                          onChange={(e) => {
                            const value = e.target.value.replace(/[^\d.]/g, '');
                            if (value === '' || (parseFloat(value) >= 0 && parseFloat(value) <= 5)) {
                              onUpdateListItem(item.id, 'rating', value === '' ? '' : parseFloat(value));
                            }
                          }}
                          onClear={() => onUpdateListItem(item.id, 'rating', '')}
                          className={`${baseInputStyles} ${getRingClass('amber')}`}
                          placeholder="4.5"
                          icon={<BsFillStarFill size={18} className="text-amber-400" />}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Descrição e Imagem */}
                  <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <div className="flex items-center justify-between gap-3">
                        <label className={inputLabelStyles}>Descrição Curta</label>
                        <button
                          type="button"
                          onClick={() => setShowAIGeneration(item.id)}
                          className="flex items-center gap-2 px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest text-white bg-gradient-to-r from-pink-500 via-rose-500 to-purple-600 shadow-lg shadow-pink-500/20 hover:shadow-pink-500/40 hover:scale-105 transition-all"
                        >
                          <RiRobot3Fill size={12} className="text-white" />
                          Texto de IA
                        </button>
                      </div>
                      <InputWithClear
                        type="textarea"
                        value={item.description || ''}
                        onChange={(e) => onUpdateListItem(item.id, 'description', e.target.value)}
                        onClear={() => onUpdateListItem(item.id, 'description', '')}
                        className={`${baseInputStyles} h-24 resize-none ${getRingClass('orange')}`}
                        placeholder="Breve resumo das especificações..."
                        icon={<BiDetail size={20} className="text-orange-500" />}
                      />
                    </div>
                    <div>
                      <label className={inputLabelStyles}>URL da Imagem</label>
                      <InputWithClear
                        type="text"
                        value={item.image || ''}
                        onChange={(e) => onUpdateListItem(item.id, 'image', e.target.value)}
                        onClear={() => onUpdateListItem(item.id, 'image', '')}
                        className={`${baseInputStyles} ${getRingClass('blue')}`}
                        placeholder="https://imagem.jpg"
                        icon={<MdOutlineImageSearch size={20} className="text-blue-400" />}
                      />
                      {item.image && (
                        <div className="mt-2 h-16 w-16 relative rounded-xl overflow-hidden border-2 border-slate-100 dark:border-slate-800 shadow-sm">
                          <Image
                            src={item.image}
                            alt={item.title || 'Preview'}
                            fill
                            className="object-contain bg-white"
                          />
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Cupom do Item */}
                  <div className="md:col-span-2 p-4 bg-emerald-500/5 rounded-2xl border border-emerald-100 dark:border-emerald-900/20 grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="col-span-full flex items-center gap-2 mb-1">
                      <RiCoupon2Line className="text-emerald-500" />
                      <span className="text-[10px] font-black uppercase text-emerald-600 tracking-widest">Informações de Cupom</span>
                    </div>
                    <div>
                      <label className={inputLabelStyles}>Código</label>
                      <InputWithClear
                        type="text"
                        value={item.couponCode || ''}
                        onChange={(e) => onUpdateListItem(item.id, 'couponCode', e.target.value)}
                        onClear={() => onUpdateListItem(item.id, 'couponCode', '')}
                        className={`${baseInputStyles} font-mono uppercase font-bold text-emerald-600 ${getRingClass('emerald')}`}
                        placeholder="EX: CUPOM10"
                        icon={<IoTicket size={20} className="text-emerald-500" />}
                      />
                    </div>
                    <div>
                      <label className={inputLabelStyles}>Texto do Cupom</label>
                      <InputWithClear
                        type="text"
                        value={item.couponName || ''}
                        onChange={(e) => onUpdateListItem(item.id, 'couponName', e.target.value)}
                        onClear={() => onUpdateListItem(item.id, 'couponName', '')}
                        className={`${baseInputStyles} ${getRingClass('pink')}`}
                        placeholder="Ex: 5% OFF"
                        icon={<FaPercent size={16} className="text-pink-500" />}
                      />
                    </div>
                    <div className="flex items-end">
                      <label className="flex items-center gap-3 p-2.5 px-4 w-full bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                        <input
                          type="checkbox"
                          checked={item.isExpired || false}
                          onChange={(e) => onUpdateListItem(item.id, 'isExpired', e.target.checked)}
                          className={checkboxRedStyles}
                        />
                        <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Expirado</span>
                      </label>
                    </div>
                  </div>

                  {/* Link e CTA */}
                  <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="md:col-span-2 grid grid-cols-2 gap-4">
                      <div>
                        <label className={inputLabelStyles}>Vendas</label>
                        <InputWithClear
                          type="text"
                          value={item.soldCount || ''}
                          onChange={(e) => onUpdateListItem(item.id, 'soldCount', e.target.value)}
                          onClear={() => onUpdateListItem(item.id, 'soldCount', '')}
                          className={`${baseInputStyles} ${getRingClass('emerald')}`}
                          placeholder="+1000 vendidos"
                          icon={<FaMoneyBillTrendUp size={18} className="text-emerald-500" />}
                        />
                      </div>
                      <div>
                        <label className={inputLabelStyles}>Ranking</label>
                        <InputWithClear
                          type="text"
                          value={item.ranking || ''}
                          onChange={(e) => onUpdateListItem(item.id, 'ranking', e.target.value)}
                          onClear={() => onUpdateListItem(item.id, 'ranking', '')}
                          className={`${baseInputStyles} ${getRingClass('orange')}`}
                          placeholder="7º em Cadeiras"
                          icon={<LuFileBadge2 size={20} className="text-orange-500" />}
                        />
                      </div>
                      <div>
                        <label className={inputLabelStyles}>Tag de Ranking</label>
                        <InputWithClear
                          type="text"
                          value={item.tagRanking || ''}
                          onChange={(e) => onUpdateListItem(item.id, 'tagRanking', e.target.value)}
                          onClear={() => onUpdateListItem(item.id, 'tagRanking', '')}
                          className={`${baseInputStyles} ${getRingClass('amber')} uppercase font-bold`}
                          placeholder="MAIS VENDIDO"
                          icon={<LuFileBadge2 size={20} className="text-amber-500" />}
                        />
                      </div>
                    </div>

                    <div className="md:col-span-2">
                      <label className={inputLabelStyles}>Link de Afiliado</label>
                      <InputWithClear
                        type="text"
                        value={item.affiliateLink || ''}
                        onChange={(e) => onUpdateListItem(item.id, 'affiliateLink', e.target.value)}
                        onClear={() => onUpdateListItem(item.id, 'affiliateLink', '')}
                        className={`${baseInputStyles} ${getRingClass('emerald')}`}
                        placeholder="https://..."
                        icon={<TbWorldDollar size={20} className="text-emerald-500" />}
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className={inputLabelStyles}>Texto do Botão</label>
                      <InputWithClear
                        type="text"
                        value={item.affiliateButtonText || ''}
                        onChange={(e) => onUpdateListItem(item.id, 'affiliateButtonText', e.target.value)}
                        onClear={() => onUpdateListItem(item.id, 'affiliateButtonText', '')}
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
                            value={item.affiliateLogo || ''}
                            onChange={(e) => onUpdateListItem(item.id, 'affiliateLogo', e.target.value)}
                            onClear={() => onUpdateListItem(item.id, 'affiliateLogo', '')}
                            className={`${baseInputStyles} ${getRingClass('blue')}`}
                            placeholder="https://logo-da-loja.png"
                            icon={<MdOutlineImageSearch size={20} className="text-blue-500" />}
                          />
                        </div>
                        <div className="relative">
                          <button
                            type="button"
                            onClick={() => setActiveDropdown(activeDropdown === item.id ? null : item.id)}
                            className="h-full px-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors flex items-center gap-2 text-sm font-medium text-slate-600 dark:text-slate-300"
                          >
                            {item.affiliateLogo ? (
                              <div className="relative w-5 h-5">
                                <Image 
                                  src={item.affiliateLogo} 
                                  alt="Logo" 
                                  fill 
                                  className="object-contain"
                                />
                              </div>
                            ) : (
                              <RiArrowDownSLine size={20} />
                            )}
                            <span>Logos</span>
                          </button>

                          {activeDropdown === item.id && (
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
                                      onUpdateListItem(item.id, 'affiliateLogo', store.logoUrl);
                                      setActiveDropdown(null);
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
              </div>
            </div>
          </div>
        ))}

        {items.length === 0 && (
          <div className="text-center py-20 bg-slate-50 dark:bg-slate-900/50 rounded-[40px] border-4 border-dashed border-slate-100 dark:border-slate-800">
            <div className="flex flex-col items-center gap-4">
              <div className="p-6 bg-slate-200 dark:bg-slate-800 rounded-full text-slate-400">
                <RiPlayListAddLine size={48} />
              </div>
              <p className="font-bold text-slate-500 uppercase tracking-widest text-sm">Nenhum produto cadastrado</p>
              <button onClick={() => onAddListItem()} className="mt-2 text-blue-600 font-bold hover:underline">Adicionar Primeiro Produto</button>
            </div>
          </div>
        )}
      </div>
      <AIChatModal
        isOpen={!!showAIGeneration}
        onClose={() => setShowAIGeneration(null)}
        onInsert={handleAiInsert}
        initialPrompt="Gere uma descrição curta e persuasiva para este produto, destacando seus principais benefícios e diferenciais."
      />
      {showJsonImport && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-2xl max-w-2xl w-full max-h-[80vh] overflow-hidden">
            <div className="p-6 border-b border-slate-200 dark:border-slate-700">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-500/10 text-blue-600 rounded-xl">
                    <HiOutlineUpload size={24} />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-800 dark:text-white">Importar Lista via JSON</h3>
                    <p className="text-xs text-slate-400 font-black uppercase tracking-wider">Cole o JSON da lista abaixo</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowJsonImport(false)}
                  className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-all"
                >
                  <BiTrashAlt size={18} />
                </button>
              </div>
            </div>
            <div className="p-6 space-y-4 max-h-[50vh] overflow-y-auto">
              <div className="bg-slate-50 dark:bg-slate-900 rounded-2xl p-4 border border-slate-200 dark:border-slate-700">
                <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-2 uppercase tracking-wider">
                  JSON da Lista
                </label>
                <div className="flex justify-end mb-2">
                  <input
                    type="file"
                    accept=".json"
                    ref={fileInputRef}
                    className="hidden"
                    onChange={handleFileUpload}
                  />
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1"
                  >
                    <HiOutlineUpload size={14} /> Carregar Arquivo
                  </button>
                </div>
                <InputWithClear
                  as="textarea"
                  value={jsonInput}
                  onChange={(e) => setJsonInput(e.target.value)}
                  onClear={() => setJsonInput('')}
                  className="w-full h-64 px-4 py-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-600 focus:ring-offset-0 transition-all text-sm font-mono dark:text-white"
                  placeholder='{"items":[{"title":"Produto","price":"R$ 199,90","image":"https://..."}]}'
                />
                {jsonError && (
                  <div className="mt-2 text-xs font-bold text-red-500">{jsonError}</div>
                )}
              </div>
              <div className="flex gap-3">
                <button
                  onClick={importFromJson}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl px-6 py-3 font-black text-sm uppercase tracking-wider shadow-lg shadow-blue-500/20 transition-all active:scale-95 flex items-center justify-center gap-2"
                >
                  <HiOutlineUpload size={18} />
                  Importar JSON
                </button>
                <button
                  onClick={() => setShowJsonImport(false)}
                  className="px-6 py-3 text-slate-600 dark:text-slate-300 hover:text-slate-800 dark:hover:text-slate-100 font-bold text-sm uppercase tracking-wider transition-all"
                >
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductListWidgetEditor;
