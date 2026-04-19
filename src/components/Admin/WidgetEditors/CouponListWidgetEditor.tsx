import React, { useState, useRef } from 'react';
import { CouponListBlock, CouponListItem } from '../../../types';
import { useAppSounds } from '../../../hooks/useAppSounds';
import Image from 'next/image';
import { HiOutlineTicket, HiOutlineExternalLink, HiOutlineCalendar, HiOutlinePlus, HiOutlinePlusCircle, HiOutlineClock } from 'react-icons/hi';
import { BiStore, BiDetail, BiTimer, BiTrashAlt } from 'react-icons/bi';
import { RiCoupon2Line, RiDiscountPercentLine, RiPlayListAddLine, RiSettings4Line, RiRobot3Fill } from 'react-icons/ri';
import { AiOutlineWarning } from 'react-icons/ai';
import { PARTNER_STORES } from '../../../constants';
import ImageModal from '../Util/ImageModal';
import AIChatModal from '../Util/AIChatModal';
import { MdOutlineTitle } from 'react-icons/md';
import InputWithClear from '../Util/InputWithClear';
import { FaPercent } from "react-icons/fa6";
import { IoTicket } from 'react-icons/io5';
import { TbWorldDollar } from 'react-icons/tb';

interface CouponListWidgetEditorProps {
  block: CouponListBlock;
  onUpdate: (field: string, value: any) => void;
  onUpdateListItem: (itemId: string, field: string, value: any) => void;
  onAddListItem: () => void;
  onRemoveListItem: (itemId: string) => void;
}

const COUPON_STORES = Object.keys(PARTNER_STORES);
const STORE_LOGOS = Object.entries(PARTNER_STORES)
  .map(([name, data]: any) => ({ name, logoUrl: data.logoUrl }))
  .filter((item: any) => item.logoUrl);

const CouponListWidgetEditor: React.FC<CouponListWidgetEditorProps> = ({
  block,
  onUpdate,
  onUpdateListItem,
  onAddListItem,
  onRemoveListItem,
}) => {
  const { playClick } = useAppSounds();
  const [previewImage, setPreviewImage] = useState<{ src: string, title: string } | null>(null);
  const [showAIGeneration, setShowAIGeneration] = useState<string | null>(null);
  const items = block.items || [];
  const itemRefs = useRef<Record<string, HTMLDivElement | null>>({});
  // Fix: Use local date for min attribute to avoid timezone issues blocking "today" selection
  const today = (() => {
    const d = new Date();
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  })();

  const sectionHeaderStyles = "flex items-center gap-2 mb-4 font-bold border-b pb-2";
  const inputLabelStyles = "block text-[10px] font-black text-slate-500 dark:text-slate-400 mb-1.5 uppercase tracking-widest";
  const baseInputStyles = "w-full px-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-offset-0 transition-all dark:text-white text-sm hover:border-gray-300 dark:hover:border-slate-600";
  const dateTimeInputStyles = `${baseInputStyles} pr-10 appearance-none bg-white/80 dark:bg-slate-900/70 text-slate-700 dark:text-slate-200 shadow-sm focus:shadow-none`;
  const checkboxEmeraldStyles = "relative h-5 w-5 appearance-none rounded-md border border-emerald-200 dark:border-emerald-700 bg-white dark:bg-slate-900 transition-all focus:outline-none focus:ring-2 focus:ring-emerald-500/20 after:content-[''] after:absolute after:left-1/2 after:top-1/2 after:h-2 after:w-1 after:-translate-x-1/2 after:-translate-y-1/2 after:rotate-45 after:border-r-2 after:border-b-2 after:border-white after:opacity-0 checked:after:opacity-100 checked:bg-emerald-600 checked:border-emerald-600";
  const checkboxRedStyles = "relative h-5 w-5 appearance-none rounded-md border border-red-200 dark:border-red-700 bg-white dark:bg-slate-900 transition-all focus:outline-none focus:ring-2 focus:ring-red-500/20 after:content-[''] after:absolute after:left-1/2 after:top-1/2 after:h-2 after:w-1 after:-translate-x-1/2 after:-translate-y-1/2 after:rotate-45 after:border-r-2 after:border-b-2 after:border-white after:opacity-0 checked:after:opacity-100 checked:bg-red-600 checked:border-red-600";
  const selectStyles = "w-full px-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-offset-0 transition-all dark:text-white text-sm cursor-pointer hover:border-gray-300 dark:hover:border-slate-600 appearance-none";

  // Helper to generate ring class
  const getRingClass = (color: string) => `focus:border-${color}-500 focus:ring-${color}-500/20`;

  const scrollToItem = (itemId: string) => {
    const element = itemRefs.current[itemId];
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Configuração Global da Lista */}
      <div className="bg-emerald-50/30 dark:bg-emerald-900/10 p-6 rounded-2xl border border-emerald-100 dark:border-emerald-800 shadow-sm">
        <div className={`${sectionHeaderStyles} text-emerald-800 dark:text-emerald-200 border-emerald-200 dark:border-emerald-800`}>
          <RiSettings4Line size={20} className="text-emerald-500" />
          <span>Configuração da Lista de Cupons</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="md:col-span-2">
            <label className={inputLabelStyles}>Título da Lista (H3)</label>
            <InputWithClear
              type="text"
              value={block.content || ''}
              onChange={(e) => onUpdate('content', e.target.value)}
              onClear={() => onUpdate('content', '')}
              className={`${baseInputStyles} ${getRingClass('emerald')}`}
              placeholder="Ex: Cupons Mercado Livre 2024"
              icon={<MdOutlineTitle size={20} className="text-emerald-500" />}
            />
          </div>

          <div>
              <label className={inputLabelStyles}>Loja Parceira da Lista</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none z-10 text-emerald-500">
                  <BiStore size={20} />
                </div>
                <select
                  value={block.storeName || ''}
                  onChange={(e) => onUpdate('storeName', e.target.value)}
                  className={`${selectStyles} pl-10 ${getRingClass('emerald')}`}
                >
                  <option value="">Selecione uma loja (opcional)</option>
                  {COUPON_STORES.map(store => (
                    <option key={store} value={store}>{store}</option>
                  ))}
                  <option value="outra">Outra loja</option>
                </select>
              </div>

              {/* Preview da logo da loja selecionada */}
              {block.storeName && block.storeName !== 'outra' && PARTNER_STORES[block.storeName as keyof typeof PARTNER_STORES]?.logoUrl && (
                <div className="mt-3 p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm flex items-center gap-4">
                  <div 
                    className="relative h-12 w-12 bg-white rounded-lg border border-slate-100 dark:border-slate-800 overflow-hidden shrink-0 p-1 cursor-pointer hover:border-emerald-500 transition-all group"
                    onClick={() => setPreviewImage({ 
                      src: PARTNER_STORES[block.storeName as keyof typeof PARTNER_STORES].logoUrl, 
                      title: `Logo ${block.storeName}` 
                    })}
                  >
                    <Image 
                      src={PARTNER_STORES[block.storeName as keyof typeof PARTNER_STORES].logoUrl} 
                      alt={`Logo ${block.storeName}`}
                      fill
                      sizes="48px"
                      className="object-contain transition-transform group-hover:scale-110"
                      unoptimized
                    />
                  </div>
                   <div>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Logo Selecionada</p>
                    <p className="text-sm font-bold text-slate-700 dark:text-slate-200">{block.storeName}</p>
                  </div>
                </div>
              )}

              {block.storeName === 'outra' && (
                <div className="mt-2">
                  <InputWithClear
                    type="text"
                    value={block.customStoreName || ''}
                    onChange={(e) => onUpdate('customStoreName', e.target.value)}
                    onClear={() => onUpdate('customStoreName', '')}
                    className={`${baseInputStyles} ${getRingClass('emerald')}`}
                    placeholder="Nome da loja personalizada"
                    icon={<BiStore size={20} className="text-emerald-500" />}
                  />
                </div>
              )}
            </div>

          <div>
            <label className={inputLabelStyles}>Texto Padrão do Botão</label>
            <InputWithClear
              type="text"
              value={block.affiliateButtonText || ''}
              onChange={(e) => onUpdate('affiliateButtonText', e.target.value)}
              onClear={() => onUpdate('affiliateButtonText', '')}
              className={`${baseInputStyles} ${getRingClass('blue')}`}
              placeholder="Ex: PEGAR CUPOM"
              icon={<MdOutlineTitle size={20} className="text-blue-500" />}
            />
          </div>

          <div className="md:col-span-2 flex items-center gap-6 p-4 bg-white dark:bg-slate-900 rounded-2xl border border-emerald-100 dark:border-emerald-800">
            <label className="flex items-center gap-3 cursor-pointer group">
              <input
                type="checkbox"
                checked={block.showDescriptions !== false}
                onChange={(e) => onUpdate('showDescriptions', e.target.checked)}
                className={checkboxEmeraldStyles}
              />
              <span className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wide group-hover:text-emerald-600 transition-colors">Exibir Descrições</span>
            </label>

            <label className="flex items-center gap-3 cursor-pointer group">
              <input
                type="checkbox"
                checked={block.showStoreInfo !== false}
                onChange={(e) => onUpdate('showStoreInfo', e.target.checked)}
                className={checkboxEmeraldStyles}
              />
              <span className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wide group-hover:text-emerald-600 transition-colors">Exibir Loja Individ.</span>
            </label>
          </div>
        </div>
      </div>

      {/* Cabeçalho da Lista de Cupons */}
      <div className="flex items-center justify-between bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-emerald-500/10 text-emerald-600 rounded-lg">
            <RiCoupon2Line size={20} />
          </div>
          <div>
            <h3 className="font-bold text-slate-800 dark:text-white">Gerenciamento de Cupons</h3>
            <p className="text-[10px] text-slate-400 uppercase font-black tracking-widest">{items.length} CUPONS ATIVOS</p>
          </div>
        </div>
        <button
          onClick={() => onAddListItem()}
          className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2.5 rounded-xl text-sm font-bold shadow-lg shadow-emerald-500/20 transition-all active:scale-95"
        >
          <HiOutlinePlus size={18} />
          ADICIONAR CUPOM
        </button>
      </div>

      {items.length > 0 && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-3 shadow-sm">
          <div className="flex flex-wrap gap-2">
            {items.map((item, index) => (
              <button
                key={item.id}
                type="button"
                onClick={() => scrollToItem(item.id)}
                className="flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 text-xs font-bold hover:border-emerald-400 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors"
              >
                <span className="flex items-center justify-center w-5 h-5 rounded-full bg-emerald-600 text-white text-[10px] font-black">
                  {index + 1}
                </span>
                <span className="truncate max-w-[180px]">{item.title || 'Novo Cupom'}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Itens da Lista */}
      <div className="space-y-6">
        {items.map((item, index) => {
          const isExpiredByDate = (() => {
            if (!item.expiryDate) return false;
            const [year, month, day] = item.expiryDate.split('-').map(Number);
            const hasTime = Boolean(item.expiryTime && /^\d{2}:\d{2}$/.test(item.expiryTime));
            if (hasTime) {
              const [hours, minutes] = item.expiryTime!.split(':').map(Number);
              const targetDateTime = new Date(year, month - 1, day, hours, minutes, 0, 0);
              return targetDateTime.getTime() < Date.now();
            }
            const target = new Date(year, month - 1, day);
            target.setHours(0, 0, 0, 0);
            const todayStart = new Date();
            todayStart.setHours(0, 0, 0, 0);
            return target.getTime() < todayStart.getTime();
          })();

          return (
            <div
              key={item.id}
              ref={(el) => {
                itemRefs.current[item.id] = el;
              }}
              className="group animate-in slide-in-from-top-4 duration-300"
            >
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                {/* Header do Item */}
                <div className="bg-slate-50 dark:bg-slate-800/80 px-6 py-3 flex items-center justify-between border-b border-slate-200 dark:border-slate-700">
                  <div className="flex items-center gap-3">
                    <span className="flex items-center justify-center w-6 h-6 bg-slate-200 dark:bg-slate-700 rounded-full text-[10px] font-black text-slate-500 dark:text-slate-400">
                      {index + 1}
                    </span>
                    <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">
                      {item.title || "Novo Cupom"}
                    </span>
                  </div>
                  <button
                    onClick={() => onRemoveListItem(item.id)}
                    className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all"
                  >
                    <BiTrashAlt size={18} />
                  </button>
                </div>

                <div className="p-6 space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Dados Primários */}
                    <div className="md:col-span-2 bg-emerald-50/50 dark:bg-emerald-900/10 p-6 rounded-2xl border border-emerald-100 dark:border-emerald-800">
                      <div className={`${sectionHeaderStyles} text-emerald-800 dark:text-emerald-200 border-emerald-200 dark:border-emerald-800`}>
                        <RiCoupon2Line size={20} className="text-emerald-600 dark:text-emerald-400" />
                        <span>Identificação</span>
                      </div>
                      <div className="space-y-4">
                        <div>
                          <label className={inputLabelStyles}>Título da Oferta</label>
                          <InputWithClear
                            type="text"
                            value={item.title || ''}
                            onChange={(e) => onUpdateListItem(item.id, 'title', e.target.value)}
                            onClear={() => onUpdateListItem(item.id, 'title', '')}
                            className={`${baseInputStyles} ${getRingClass('blue')}`}
                            placeholder="Ex: 30% OFF em Eletrônicos"
                            icon={<MdOutlineTitle size={20} className="text-blue-500" />}
                          />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className={inputLabelStyles}>Código</label>
                            <InputWithClear
                              type="text"
                              value={item.couponCode || ''}
                              onChange={(e) => onUpdateListItem(item.id, 'couponCode', e.target.value)}
                              onClear={() => onUpdateListItem(item.id, 'couponCode', '')}
                              className={`${baseInputStyles} font-mono uppercase font-bold text-emerald-600 ${getRingClass('emerald')}`}
                              placeholder="CUPOM30"
                              icon={<IoTicket size={20} className="text-emerald-500" />}
                            />
                          </div>
                          <div>
                            <label className={inputLabelStyles}>Desconto ou Oferta oferecida</label>
                            <InputWithClear
                              type="text"
                              value={item.discount || ''}
                              onChange={(e) => onUpdateListItem(item.id, 'discount', e.target.value)}
                              onClear={() => onUpdateListItem(item.id, 'discount', '')}
                              className={`${baseInputStyles} ${getRingClass('pink')}`}
                              placeholder="30% OFF, R$ 100 OFF..."
                              icon={<FaPercent size={18} className="text-pink-500" />}
                            />
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Descrição e Condições */}
                    <div className="bg-amber-50/50 dark:bg-amber-900/10 p-6 rounded-2xl border border-amber-100 dark:border-amber-800 md:col-span-2">
                        <div className="flex items-center justify-between gap-3 border-b border-amber-200 dark:border-amber-800 pb-2 mb-4">
                            <div className="flex items-center gap-2 text-amber-800 dark:text-amber-200 font-bold">
                              <BiDetail size={20} className="text-amber-600 dark:text-amber-400" />
                              <span>Descrição e Condições</span>
                            </div>
                            <button
                              type="button"
                              onClick={() => setShowAIGeneration(item.id)}
                              className="flex items-center gap-2 px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest bg-gradient-to-r from-pink-500 via-rose-500 to-purple-600 text-white shadow-lg shadow-pink-500/20 hover:shadow-pink-500/40 hover:scale-105 transition-all"
                            >
                              <RiRobot3Fill size={14} />
                              Texto de IA
                            </button>
                        </div>
                        <div className="relative">
                            <InputWithClear
                                as="textarea"
                                value={item.description || ''}
                                onChange={(e) => onUpdateListItem(item.id, 'description', e.target.value)}
                                onClear={() => onUpdateListItem(item.id, 'description', '')}
                                className={`${baseInputStyles} h-28 resize-none ${getRingClass('amber')}`}
                                placeholder="Descreva as condições de uso do cupom (ex: Válido para itens selecionados, Primeira compra, etc)"
                                icon={<BiDetail size={20} className="text-amber-500" />}
                            />
                        </div>
                    </div>

                    {/* Loja e Validade */}
                    <div className="md:col-span-2 bg-blue-50/50 dark:bg-blue-900/10 p-6 rounded-2xl border border-blue-100 dark:border-blue-800">
                      <div className={`${sectionHeaderStyles} text-blue-800 dark:text-blue-200 border-blue-200 dark:border-blue-800`}>
                        <BiStore size={20} className="text-blue-600 dark:text-blue-400" />
                        <span>Loja e Prazo</span>
                      </div>
                      <div className="space-y-4">
                        <div>
                          <label className={inputLabelStyles}>Loja Individual (Sobrescreve a global)</label>
                          <div className="relative">
                            <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none z-10 text-blue-500">
                              <BiStore size={20} />
                            </div>
                            <select
                              value={item.storeName || ''}
                              onChange={(e) => onUpdateListItem(item.id, 'storeName', e.target.value)}
                              className={`${selectStyles} pl-10 ${getRingClass('blue')}`}
                            >
                              <option value="">Usar loja da lista</option>
                              {COUPON_STORES.map(store => (
                                <option key={store} value={store}>{store}</option>
                              ))}
                            </select>
                          </div>

                          {/* Preview da logo da loja individual selecionada */}
                          {item.storeName && PARTNER_STORES[item.storeName as keyof typeof PARTNER_STORES]?.logoUrl && (
                            <div className="mt-3 p-3 bg-white dark:bg-slate-900 rounded-xl border border-blue-100 dark:border-blue-900 shadow-sm flex items-center gap-4">
                              <div className="relative h-12 w-12 bg-white rounded-lg border border-slate-100 dark:border-slate-800 overflow-hidden shrink-0 p-1">
                                <Image
                                  src={PARTNER_STORES[item.storeName as keyof typeof PARTNER_STORES].logoUrl}
                                  alt={`Logo ${item.storeName}`}
                                  fill
                                  className="object-contain"
                                  unoptimized
                                />
                              </div>
                              <div>
                                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Logo Selecionada</p>
                                <p className="text-sm font-bold text-slate-700 dark:text-slate-200">{item.storeName}</p>
                              </div>
                            </div>
                          )}
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className={inputLabelStyles}>Data de Validade</label>
                            <InputWithClear
                              type="date"
                              value={item.expiryDate || ''}
                              onChange={(e) => onUpdateListItem(item.id, 'expiryDate', e.target.value)}
                              onClear={() => onUpdateListItem(item.id, 'expiryDate', '')}
                              min={today}
                              className={`${dateTimeInputStyles} ${getRingClass('orange')}`}
                            />
                          </div>
                          <div>
                            <label className={inputLabelStyles}>Horário de Expiração</label>
                            <InputWithClear
                              type="time"
                              value={item.expiryTime || ''}
                              onChange={(e) => onUpdateListItem(item.id, 'expiryTime', e.target.value)}
                              onClear={() => onUpdateListItem(item.id, 'expiryTime', '')}
                              className={`${dateTimeInputStyles} ${getRingClass('orange')}`}
                            />
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Link e Status */}
                    <div className="md:col-span-2 bg-indigo-50/50 dark:bg-indigo-900/10 p-6 rounded-2xl border border-indigo-100 dark:border-indigo-800">
                      <div className={`${sectionHeaderStyles} text-indigo-800 dark:text-indigo-200 border-indigo-200 dark:border-indigo-800`}>
                        <HiOutlineExternalLink size={20} className="text-indigo-600 dark:text-indigo-400" />
                        <span>Afiliado e Status</span>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                        <div className="md:col-span-3">
                          <label className={inputLabelStyles}>Link de Afiliado</label>
                          <InputWithClear
                            type="text"
                            value={item.affiliateLink || ''}
                            onChange={(e) => onUpdateListItem(item.id, 'affiliateLink', e.target.value)}
                            onClear={() => onUpdateListItem(item.id, 'affiliateLink', '')}
                            className={`${baseInputStyles} ${getRingClass('indigo')}`}
                            placeholder="https://exemplo.com/link-afiliado"
                            icon={<TbWorldDollar size={20} className="text-indigo-500" />}
                          />
                        </div>
                        <div>
                          <label className={`flex items-center gap-3 p-2.5 w-full bg-white dark:bg-slate-900 rounded-xl border border-indigo-100 dark:border-indigo-800 cursor-pointer ${isExpiredByDate ? 'border-red-200 bg-red-50/20' : ''}`}>
                            <input
                              type="checkbox"
                              checked={item.isExpired || false}
                              onChange={(e) => {
                                onUpdateListItem(item.id, 'isExpired', e.target.checked);
                              }}
                              className={checkboxRedStyles}
                            />
                            <div className="flex flex-col">
                              <span className={`text-[10px] font-bold uppercase transition-colors ${isExpiredByDate ? 'text-red-600' : 'text-slate-500'}`}>Expirado?</span>
                              {isExpiredByDate && <span className="text-[8px] text-red-400 font-black uppercase tracking-tighter">DATA VENCIDA</span>}
                            </div>
                          </label>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}

        {items.length === 0 && (
          <div className="text-center py-20 bg-slate-50 dark:bg-slate-900/50 rounded-[40px] border-4 border-dashed border-slate-100 dark:border-slate-800">
            <div className="flex flex-col items-center gap-4">
              <div className="p-6 bg-slate-200 dark:bg-slate-800 rounded-full text-slate-400">
                <RiCoupon2Line size={48} />
              </div>
              <p className="font-bold text-slate-500 uppercase tracking-widest text-sm text-center">Nenhum cupom nesta lista no momento</p>
              <button onClick={onAddListItem} className="mt-2 text-emerald-600 font-bold hover:underline">Adicionar Primeiro Cupom</button>
            </div>
          </div>
        )}
      </div>

      {previewImage && (
        <ImageModal
          isOpen={!!previewImage}
          imageSrc={previewImage.src}
          title={previewImage.title}
          onClose={() => setPreviewImage(null)}
        />
      )}

      <AIChatModal
        isOpen={!!showAIGeneration}
        onClose={() => setShowAIGeneration(null)}
        onInsert={(text) => {
          if (showAIGeneration) {
            onUpdateListItem(showAIGeneration, 'description', text);
          }
          setShowAIGeneration(null);
        }}
        initialPrompt=""
      />
    </div>
  );
};

export default CouponListWidgetEditor;
