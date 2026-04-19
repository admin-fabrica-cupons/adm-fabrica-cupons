import React, { useState } from 'react';
import { CouponBlock } from '../../../types';
import Image from 'next/image';
import { HiOutlineTicket, HiOutlineExternalLink, HiOutlineCalendar, HiOutlineClock } from 'react-icons/hi';
import { BiStore, BiDetail, BiTimer } from 'react-icons/bi';
import { RiCoupon2Line, RiErrorWarningLine, RiRobot3Fill } from 'react-icons/ri';
import { PARTNER_STORES } from '../../../constants';
import ImageModal from '../Util/ImageModal';
import InputWithClear from '../Util/InputWithClear';
import { FaPercent } from "react-icons/fa6";
import { MdOutlineTitle } from 'react-icons/md';
import { IoTicket } from 'react-icons/io5';
import { TbWorldDollar } from 'react-icons/tb';
import AIChatModal from '../Util/AIChatModal';
import { useAppSounds } from '../../../hooks/useAppSounds';

interface CouponWidgetEditorProps {
  block: CouponBlock;
  onUpdate: (field: string, value: any) => void;
}

const COUPON_STORES = Object.keys(PARTNER_STORES);

export const CouponWidgetEditor: React.FC<CouponWidgetEditorProps> = ({ block, onUpdate }) => {
  const { playClick, playAdd } = useAppSounds();
  const [previewImage, setPreviewImage] = useState<{ src: string, title: string } | null>(null);
  const [showAIGeneration, setShowAIGeneration] = useState(false);

  // Fix: Use local date for min attribute to avoid timezone issues blocking "today" selection
  const today = (() => {
    const d = new Date();
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  })();

  const isExpiredByDate = (() => {
    if (!block.expiryDate) return false;
    const [year, month, day] = block.expiryDate.split('-').map(Number);
    const hasTime = Boolean(block.expiryTime && /^\d{2}:\d{2}$/.test(block.expiryTime));
    if (hasTime) {
      const [hours, minutes] = block.expiryTime!.split(':').map(Number);
      const targetDateTime = new Date(year, month - 1, day, hours, minutes, 0, 0);
      return targetDateTime.getTime() < Date.now();
    }
    const targetDateTime = new Date(year, month - 1, day, 23, 59, 0, 0);
    return targetDateTime.getTime() < Date.now();
  })();

  const sectionHeaderStyles = "flex items-center gap-2 mb-4 font-bold border-b pb-2";
  const inputLabelStyles = "block text-[10px] font-black text-slate-500 dark:text-slate-400 mb-1.5 uppercase tracking-widest";
  const baseInputStyles = "w-full px-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-offset-0 transition-all dark:text-white text-sm hover:border-gray-300 dark:hover:border-slate-600";
  const dateTimeInputStyles = `${baseInputStyles} pr-10 appearance-none bg-white/80 dark:bg-slate-900/70 text-slate-700 dark:text-slate-200 shadow-sm focus:shadow-none`;
  const selectStyles = "w-full px-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-offset-0 transition-all dark:text-white text-sm hover:border-gray-300 dark:hover:border-slate-600 cursor-pointer appearance-none";

  // Helper to generate ring class
  const getRingClass = (color: string) => `focus:border-${color}-500 focus:ring-${color}-500/20`;

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Detalhes do Cupom */}
        <div className="bg-emerald-50/50 dark:bg-emerald-900/10 p-6 rounded-2xl border border-emerald-100 dark:border-emerald-800 shadow-sm transition-all hover:shadow-md group hover:border-emerald-200 dark:hover:border-emerald-700">
          <div className={`${sectionHeaderStyles} text-emerald-800 dark:text-emerald-200 border-emerald-200 dark:border-emerald-800`}>
            <RiCoupon2Line size={20} className="text-emerald-600 dark:text-emerald-400" />
            <span>Identificação do Cupom</span>
          </div>

          <div className="space-y-4">
            <div>
              <label className={inputLabelStyles}>Título da oferta *</label>
              <InputWithClear
                type="text"
                value={block.name || ''}
                onChange={(e) => onUpdate('name', e.target.value)}
                onClear={() => onUpdate('name', '')}
                className={`${baseInputStyles} ${getRingClass('emerald')}`}
                placeholder="Ex: Cupom Black Friday"
                icon={<MdOutlineTitle size={20} className="text-emerald-500" />}
              />
            </div>

            <div className="grid grid-cols-1 gap-4">
              <div>
                <label className={inputLabelStyles}>Desconto ou Oferta oferecida *</label>
                <InputWithClear
                  type="text"
                  value={block.discount || ''}
                  onChange={(e) => onUpdate('discount', e.target.value)}
                  onClear={() => onUpdate('discount', '')}
                  className={`${baseInputStyles} ${getRingClass('pink')}`}
                  placeholder="Ex: 50% OFF, R$ 100 OFF"
                  icon={<FaPercent size={18} className="text-pink-500" />}
                />
              </div>

              <div>
                <label className={inputLabelStyles}>Código (O que será copiado) *</label>
                <InputWithClear
                  type="text"
                  value={block.couponCode || ''}
                  onChange={(e) => onUpdate('couponCode', e.target.value)}
                  onClear={() => onUpdate('couponCode', '')}
                  className={`${baseInputStyles} font-mono font-bold tracking-wider text-emerald-600 ${getRingClass('emerald')}`}
                  placeholder="Ex: BLACKFRIDAY50"
                  icon={<IoTicket size={20} className="text-emerald-500" />}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Loja e Validade */}
        <div className="bg-blue-50/50 dark:bg-blue-900/10 p-6 rounded-2xl border border-blue-100 dark:border-blue-800 shadow-sm transition-all hover:shadow-md group hover:border-blue-200 dark:hover:border-blue-700">
          <div className={`${sectionHeaderStyles} text-blue-800 dark:text-blue-200 border-blue-200 dark:border-blue-800`}>
            <BiStore size={20} className="text-blue-600 dark:text-blue-400" />
            <span>Loja e Prazo</span>
          </div>

          <div className="space-y-4">
            <div>
              <label className={inputLabelStyles}>Loja Parceira</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none z-10 text-blue-500">
                  <BiStore size={20} />
                </div>
                <select
                  value={block.storeName || ''}
                  onChange={(e) => {
                    onUpdate('storeName', e.target.value);
                    playClick();
                  }}
                  className={`${selectStyles} pl-10 font-bold text-blue-600 dark:text-blue-400 ${getRingClass('blue')}`}
                >
                  <option value="">Selecione uma loja</option>
                  {COUPON_STORES.map(store => (
                    <option key={store} value={store}>{store}</option>
                  ))}
                  <option value="outra">Outra loja</option>
                </select>
              </div>

              {/* Preview da logo da loja */}
              {block.storeName && PARTNER_STORES[block.storeName as keyof typeof PARTNER_STORES]?.logoUrl && (
                <div className="mt-3 p-3 bg-white dark:bg-slate-900 rounded-xl border border-blue-100 dark:border-blue-900 shadow-sm flex items-center gap-4">
                  <div className="relative h-12 w-12 bg-white rounded-lg border border-slate-100 dark:border-slate-800 overflow-hidden shrink-0 p-1">
                    <Image
                      src={PARTNER_STORES[block.storeName as keyof typeof PARTNER_STORES].logoUrl}
                      alt={`Logo ${block.storeName}`}
                      fill
                      sizes="48px"
                      className="object-contain"
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
                    value={block.storeName || ''}
                    onChange={(e) => onUpdate('storeName', e.target.value)}
                    onClear={() => onUpdate('storeName', '')}
                    className={`${baseInputStyles} ${getRingClass('blue')}`}
                    placeholder="Nome da loja personalizada"
                    icon={<BiStore size={20} className="text-blue-500" />}
                  />
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className={inputLabelStyles}>Data de Validade</label>
                <InputWithClear
                  type="date"
                  value={block.expiryDate || ''}
                  onChange={(e) => {
                    const value = e.target.value;
                    onUpdate('expiryDate', value);
                    if (value && !block.expiryTime) {
                      onUpdate('expiryTime', '23:59');
                    }
                    if (!value) {
                      onUpdate('expiryTime', '');
                    }
                  }}
                  onClear={() => {
                    onUpdate('expiryDate', '');
                    onUpdate('expiryTime', '');
                  }}
                  min={today}
                  className={`${dateTimeInputStyles} ${getRingClass('orange')}`}
                />
              </div>
              <div>
                <label className={inputLabelStyles}>Horário</label>
                <InputWithClear
                  type="time"
                  value={block.expiryTime || ''}
                  onChange={(e) => onUpdate('expiryTime', e.target.value)}
                  onClear={() => {
                    if (block.expiryDate) {
                      onUpdate('expiryTime', '23:59');
                      return;
                    }
                    onUpdate('expiryTime', '');
                  }}
                  className={`${dateTimeInputStyles} ${getRingClass('orange')}`}
                />
              </div>
            </div>
            <p className="text-[10px] text-slate-400 dark:text-slate-500 flex items-center gap-1 italic">
              <RiErrorWarningLine size={12} />
              Vazio = Sem expiração definida
            </p>
          </div>
        </div>

        {/* Descrição e Condições */}
        <div className="bg-amber-50/50 dark:bg-amber-900/10 p-6 rounded-2xl border border-amber-100 dark:border-amber-800 shadow-sm transition-all hover:shadow-md group hover:border-amber-200 dark:hover:border-amber-700 md:col-span-2">
          <div className="flex items-center justify-between gap-3 border-b border-amber-200 dark:border-amber-800 pb-2 mb-4">
            <div className="flex items-center gap-2 text-amber-800 dark:text-amber-200 font-bold">
              <BiDetail size={20} className="text-amber-600 dark:text-amber-400" />
              <span>Descrição e Condições</span>
            </div>
            <button
              type="button"
              onClick={() => {
                setShowAIGeneration(true);
                playClick();
              }}
              className="flex items-center gap-2 px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest bg-gradient-to-r from-pink-500 via-rose-500 to-purple-600 text-white shadow-lg shadow-pink-500/20 hover:shadow-pink-500/40 hover:scale-105 transition-all"
            >
              <RiRobot3Fill size={14} />
              Texto de IA
            </button>
          </div>
          <div className="relative">
            <InputWithClear
              as="textarea"
              value={block.description || ''}
              onChange={(e) => onUpdate('description', e.target.value)}
              onClear={() => onUpdate('description', '')}
              className={`${baseInputStyles} h-28 resize-none ${getRingClass('amber')}`}
              placeholder="Descreva as condições de uso do cupom (ex: Válido para itens selecionados, Primeira compra, etc)"
              icon={<BiDetail size={20} className="text-amber-500" />}
            />
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
              <label className={inputLabelStyles}>Link de Afiliado</label>
              <InputWithClear
                type="text"
                value={block.affiliateLink || ''}
                onChange={(e) => onUpdate('affiliateLink', e.target.value)}
                onClear={() => onUpdate('affiliateLink', '')}
                className={`${baseInputStyles} ${getRingClass('indigo')}`}
                placeholder="https://exemplo.com/cupom"
                icon={<TbWorldDollar size={20} className="text-indigo-500" />}
              />
            </div>

            <div className="md:col-span-2">
              <label className={inputLabelStyles}>Texto do Botão</label>
              <InputWithClear
                type="text"
                value={block.affiliateButtonText || ''}
                onChange={(e) => onUpdate('affiliateButtonText', e.target.value)}
                onClear={() => onUpdate('affiliateButtonText', '')}
                className={`${baseInputStyles} font-bold text-indigo-600 bg-white dark:bg-slate-900 ${getRingClass('indigo')}`}
                placeholder="Ex: Usar Cupom Agora"
                icon={<MdOutlineTitle size={20} className="text-indigo-500" />}
              />
            </div>
          </div>
        </div>

        {/* Status de Expiração */}
        <div className={`md:col-span-2 p-6 rounded-2xl border shadow-sm transition-all ${
          isExpiredByDate 
            ? 'border-red-200 bg-red-50 dark:border-red-900/50 dark:bg-red-900/20' 
            : 'border-slate-200 bg-slate-50 dark:border-slate-700 dark:bg-slate-800/50'
        }`}>
          <div className="flex items-start gap-4">
            <div className={`p-3 rounded-xl ${isExpiredByDate ? 'bg-red-100 text-red-600' : 'bg-white dark:bg-slate-900 text-slate-500'}`}>
              <BiTimer size={24} />
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className={`text-sm font-bold ${isExpiredByDate ? 'text-red-700 dark:text-red-400' : 'text-slate-700 dark:text-slate-300'}`}>
                    {isExpiredByDate ? 'Cupom Expirado (Data)' : 'Status do Cupom'}
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    {isExpiredByDate 
                      ? 'Expirado automaticamente pela data de validade.' 
                      : 'O cupom está ativo e será exibido normalmente.'}
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input 
                    type="checkbox" 
                    className="sr-only peer"
                    checked={block.isExpired || false}
                    onChange={(e) => {
                      onUpdate('isExpired', e.target.checked);
                      playClick();
                    }}
                  />
                  <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-red-600"></div>
                  <span className="ml-3 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">
                    Forçar Expirado
                  </span>
                </label>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Image Modal Pop-up */}
      <ImageModal 
        isOpen={!!previewImage} 
        onClose={() => setPreviewImage(null)} 
        imageSrc={previewImage?.src || ''} 
        title={previewImage?.title} 
      />

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
          initialPrompt="Escreva uma descrição para um cupom de desconto."
          couponName={block.name}
          discount={block.discount}
          storeName={block.storeName}
        />
      )}
    </div>
  );
};

export default CouponWidgetEditor;
