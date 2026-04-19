'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { Store, ThumbsUp, Check, X, ChevronLeft, ChevronRight } from 'lucide-react';
import { ImFire } from 'react-icons/im';
import { ProductBlock } from '../../types';
import AffiliateButton from './AffiliateButton';
import CouponOfProduct from './CouponOfProduct';
import Stars from '../Common/Stars';
import { PARTNER_STORES, STORE_THEMES } from '../../constants';
import PriceOfProduct from './PriceOfProduct';
import { useCategoryIcons } from '../../hooks/useCategoryIcons';

interface ProductWidgetProps {
  data: ProductBlock & { postCategory?: string; category?: string; originPostCategory?: string };
  layout?: 'vertical' | 'horizontal' | 'compact';
  onClick?: () => void;
  isPreview?: boolean;
}

const shouldUnoptimize = (src?: string) =>
  !!src && (src.includes('placehold.co') || src.endsWith('.svg'));

const sanitizeImageSrc = (value?: string) => (value || '').toString().trim();

const ProductWidget: React.FC<ProductWidgetProps> = ({ data, layout, onClick, isPreview = false }) => {
  const { getCategoryIcon } = useCategoryIcons();
  const baseLayout = (data.productLayout === 'compact') ? 'compact' : 'vertical';
  const resolvedLayout = (layout === 'horizontal' && baseLayout === 'compact') ? 'compact' : (layout ?? baseLayout);
  const isCompact = resolvedLayout === 'compact';
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isMobile, setIsMobile] = useState(false);

  // Support both single image (src) and multiple images (images array)
  const normalizedImages = (data.images || [])
    .map((value) => sanitizeImageSrc(value))
    .filter((value) => value.length > 0);
  const fallbackImage = sanitizeImageSrc(data.src);
  const images = normalizedImages.length > 0 ? normalizedImages : (fallbackImage ? [fallbackImage] : []);

  // Detectar mobile apenas no cliente
  React.useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const effectiveLayout = isMobile && !isCompact ? 'vertical' : resolvedLayout;

  // Resolve category for standalone display
  const productCategory = (data as any).postCategory || (data as any).category || (data as any).originPostCategory || '';

  const nextImage = () => {
    if (images.length <= 1) return;
    setCurrentImageIndex((prev) => (prev + 1) % images.length);
  };

  const prevImage = () => {
    if (images.length <= 1) return;
    setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  // Função para limpar strings de preço e converter em número para cálculo
  const parsePrice = (priceStr: string | undefined): number => {
    if (!priceStr) return 0;
    const cleaned = priceStr.replace(/[^\d,]/g, '').replace(',', '.');
    return parseFloat(cleaned) || 0;
  };

  const isValidProduct = () => {
    if (isPreview) return true;
    if (!data.productName) return false;
    if (!data.price) return false;
    if (parsePrice(data.price) === 0) return false;
    return true;
  };

  if (!isValidProduct()) return null;

  // Cálculo automático do desconto
  const getAutoDiscount = () => {
    const current = parsePrice(data.price);
    const original = parsePrice(data.originalPrice);

    if (original > current && current > 0) {
      const percentage = Math.round(((original - current) / original) * 100);
      return percentage;
    }
    return null;
  };

  const discount = getAutoDiscount();

  const resolvePartnerStoreName = (storeName?: string) => {
    if (!storeName) return undefined;
    const trimmed = String(storeName || '').trim();
    if (PARTNER_STORES[trimmed as keyof typeof PARTNER_STORES]) return trimmed;
    return Object.keys(PARTNER_STORES).find(key => key.toLowerCase() === trimmed.toLowerCase());
  };

  const resolveStoreTheme = (storeName?: string) => {
    if (!storeName) return STORE_THEMES['Default'];
    const trimmed = String(storeName || '').trim();
    if (STORE_THEMES[trimmed as keyof typeof STORE_THEMES]) return STORE_THEMES[trimmed as keyof typeof STORE_THEMES];
    const match = Object.keys(STORE_THEMES).find(key => key.toLowerCase() === trimmed.toLowerCase());
    return STORE_THEMES[(match || 'Default') as keyof typeof STORE_THEMES];
  };

  const partnerStoreName = resolvePartnerStoreName(data.storeName);
  const storeLogo = (data.showStoreLogo && partnerStoreName && PARTNER_STORES[partnerStoreName as keyof typeof PARTNER_STORES]?.logoUrl) || data.affiliateLogo;
  const sellerStoreName = data.manualStoreName || (!partnerStoreName && data.storeName ? data.storeName : undefined);
  const storeTheme = resolveStoreTheme(partnerStoreName);

  const renderMetaInfo = (size: 'sm' | 'md' = 'sm') => {
    if (!productCategory && !data.tagRanking && !partnerStoreName && !sellerStoreName && !data.soldCount) return null;
    const soldCountText = data.soldCount?.replace('vendidos', '').trim();
    return (
      <div className="flex flex-col gap-2 mb-3">
        {(productCategory || data.tagRanking) && (
          <div className="flex flex-wrap items-center gap-2">
            {productCategory && (
              <span className="inline-flex items-center gap-1 text-[9px] font-bold px-1.5 py-0.5 rounded-sm uppercase tracking-wider bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400">
                {getCategoryIcon(productCategory, 9, 'text-indigo-500 dark:text-indigo-400')}
                {productCategory}
              </span>
            )}
            {data.tagRanking && (
              <span className="inline-flex items-center text-[10px] font-black text-emerald-700 dark:text-emerald-300 uppercase tracking-wide">
                {data.tagRanking}
              </span>
            )}
          </div>
        )}
        {(partnerStoreName || sellerStoreName) && (
          <div className="flex flex-wrap items-center gap-2">
            {partnerStoreName && (
              <span className={`inline-flex items-center gap-1 text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider border ${storeTheme.storeBadge}`}>
                <Store size={size === 'sm' ? 9 : 10} />
                {partnerStoreName}
              </span>
            )}
            {sellerStoreName && !partnerStoreName && (
              <span className="inline-flex items-center gap-1 text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider truncate max-w-[150px]">
                <Store size={size === 'sm' ? 9 : 10} />
                <span className="truncate">{sellerStoreName}</span>
              </span>
            )}
            {soldCountText && (
              <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400">
                {soldCountText} vendidos
              </span>
            )}
          </div>
        )}
      </div>
    );
  };

  // Helper to render Pros and Cons
  const renderProsCons = () => {
    const hasPros = data.pros && data.pros.some(p => p.trim() !== '');
    const hasCons = data.cons && data.cons.some(c => c.trim() !== '');

    if (!hasPros && !hasCons) return null;

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-5 bg-gray-50/50 dark:bg-slate-800/50 border-t border-gray-100 dark:border-slate-700">
        {hasPros && (
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-green-600 uppercase tracking-widest flex items-center gap-2">
              <ThumbsUp size={16} /> Pontos positivos
            </h4>
            <ul className="space-y-2">
              {data.pros!.filter(pro => pro.trim() !== '').map((pro, i) => (
                <li key={i} className="flex items-start gap-3 text-sm text-slate-600 dark:text-slate-400">
                  <div className="mt-0.5 bg-green-100 dark:bg-green-900/30 p-1 rounded-full shrink-0">
                    <Check size={10} className="text-green-600 dark:text-green-400" />
                  </div>
                  <span className="leading-tight">{pro}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {hasCons && (
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest flex items-center gap-2">
              <X size={16} /> A se considerar
            </h4>
            <ul className="space-y-2">
              {data.cons!.filter(con => con.trim() !== '').map((con, i) => (
                <li key={i} className="flex items-start gap-3 text-sm text-gray-500 dark:text-gray-400">
                  <div className="mt-1.5 w-1.5 h-1.5 rounded-full bg-gray-300 dark:bg-gray-600 shrink-0" />
                  <span className="leading-tight">{con}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    );
  };

  if (isCompact) {
    return (
      <div
        onClick={onClick}
        className="group bg-white dark:bg-slate-800 rounded-sm border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-md transition-all duration-300 max-w-4xl w-full mx-auto overflow-hidden cursor-pointer"
      >
        <div className="flex flex-row items-center gap-2 sm:gap-4 p-2 sm:p-3">
          {/* Imagem do Produto com navegação */}
          <div className="relative w-28 h-28 sm:w-36 sm:h-36 shrink-0 flex items-center justify-center bg-white dark:bg-white overflow-hidden">
            {images.length > 0 ? (
              <>
                <Image
                  src={images[currentImageIndex] || ''}
                  alt={data.productName || 'Product'}
                  fill
                  sizes="(max-width: 640px) 144px, 200px"
                  unoptimized={shouldUnoptimize(images[currentImageIndex] || '')}
                  loader={({ src }) => src}
                  className="object-contain transition-transform duration-500 group-hover:scale-105"
                />
                {images.length > 1 && (
                  <>
                    <button
                      onClick={(e) => { e.stopPropagation(); prevImage(); }}
                      className="absolute left-1 top-1/2 -translate-y-1/2 w-5 h-5 bg-black/50 hover:bg-black/70 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <ChevronLeft size={12} />
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); nextImage(); }}
                      className="absolute right-1 top-1/2 -translate-y-1/2 w-5 h-5 bg-black/50 hover:bg-black/70 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <ChevronRight size={12} />
                    </button>
                    <div className="absolute bottom-1 left-1/2 -translate-x-1/2 flex gap-1">
                      {images.map((_, index) => (
                        <button
                          key={index}
                          onClick={(e) => { e.stopPropagation(); setCurrentImageIndex(index); }}
                          className={`w-1.5 h-1.5 rounded-full transition-colors ${index === currentImageIndex ? 'bg-white' : 'bg-white/50'
                            }`}
                        />
                      ))}
                    </div>
                  </>
                )}
              </>
            ) : (
              <div className="w-full h-full bg-white dark:bg-white animate-pulse" />
            )}
            {data.ranking && (
              <div className="absolute top-0 right-0 bg-orange-500 text-white text-[9px] font-black px-2 py-0.5 rounded-bl-lg shadow-sm z-10 flex items-center gap-1">
                <ImFire size={12} />
                {data.ranking}
              </div>
            )}
          </div>

          {/* Conteúdo Central */}
          <div className="flex-1 min-w-[160px] p-2 sm:p-3">
            <div className="flex flex-col gap-0.5">
              {renderMetaInfo('sm')}

              <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-slate-100 truncate mt-2">
                {data.productName}
              </h3>

              {data.description && (
                <p className="text-xs text-slate-500 dark:text-slate-400 truncate mb-1">
                  {data.description}
                </p>
              )}

              {data.rating && (
                <div className="mb-1 flex items-center gap-2">
                  <Stars rating={data.rating} size={12} showNumber={true} />
                  {data.soldCount && (
                    <span className="text-[10px] text-gray-500 dark:text-gray-400">
                      {data.soldCount}
                    </span>
                  )}
                </div>
              )}

              {/* Preço formatado */}
              <div className="flex flex-col">
                {data.originalPrice ? (
                  <PriceOfProduct price={data.originalPrice} type="original" className="mb-0.5" />
                ) : null}

                <div className="flex items-center gap-2 flex-wrap">
                  <PriceOfProduct price={data.price} size="md" />

                  {discount && (
                    <div className="bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400 text-[10px] font-bold px-1.5 py-0.5 rounded-sm whitespace-nowrap">
                      {discount}% OFF
                    </div>
                  )}
                </div>
              </div>

            </div>
          </div>

          {/* Botão de Compra */}
          <div className="shrink-0 w-full sm:w-auto ml-auto sm:ml-0 flex flex-col gap-1.5 pr-1">
            {data.couponCode && (
              <CouponOfProduct
                couponCode={data.couponCode}
                couponName={data.name}
                isExpired={data.isExpired}
                variant="blue"
                compact={true}
                align="start"
                hideCode={data.hideCode}
              />
            )}
            <div onClick={(e) => e.stopPropagation()}>
              <AffiliateButton
                href={data.affiliateLink || '#'}
                logo={storeLogo}
                text={data.affiliateButtonText || 'Comprar'}
                variant="blue"
                compact={true}
              />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (effectiveLayout === 'horizontal' && !isCompact) {
    return (
      <div
        onClick={onClick}
        className="group bg-white dark:bg-slate-800 rounded-sm shadow-xl hover:shadow-2xl border border-gray-100 dark:border-slate-700 overflow-hidden h-full transition-all duration-300 w-full max-w-xs mx-auto md:max-w-full flex flex-col cursor-pointer"
      >

        {/* Container Principal - Parte 1 (Imagem, Info, Preço, Botão) */}
        <div className="flex flex-col md:flex-row md:flex-1">
          {/* Lado Esquerdo: Imagem com navegação */}
          <div className="relative w-full md:w-1/2 aspect-[4/3] md:aspect-auto shrink-0 flex items-center justify-center bg-white dark:bg-white overflow-hidden">
            {images.length > 0 ? (
              <>
                <Image
                  src={images[currentImageIndex] || ''}
                  alt={data.productName || 'Product'}
                  fill
                  sizes="(max-width: 768px) 100vw, 50vw"
                  unoptimized={shouldUnoptimize(images[currentImageIndex] || '')}
                  loader={({ src }) => src}
                  className="object-contain p-3 transition-transform duration-500 group-hover:scale-105"
                />
                {images.length > 1 && (
                  <>
                    <button
                      onClick={(e) => { e.stopPropagation(); prevImage(); }}
                      className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-black/50 hover:bg-black/70 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <ChevronLeft size={16} />
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); nextImage(); }}
                      className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-black/50 hover:bg-black/70 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <ChevronRight size={16} />
                    </button>
                    <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1">
                      {images.map((_, index) => (
                        <button
                          key={index}
                          onClick={(e) => { e.stopPropagation(); setCurrentImageIndex(index); }}
                          className={`w-2 h-2 rounded-full transition-colors ${index === currentImageIndex ? 'bg-white' : 'bg-white/50'
                            }`}
                        />
                      ))}
                    </div>
                  </>
                )}
              </>
            ) : (
              <div className="w-full h-full bg-white dark:bg-white animate-pulse" />
            )}
            {data.ranking && (
              <div className="absolute top-0 right-0 bg-orange-500 text-white text-[10px] font-black px-2.5 py-0.5 rounded-bl-lg shadow-sm z-10 flex items-center gap-1">
                <ImFire size={12} />
                {data.ranking}
              </div>
            )}
          </div>

          {/* Lado Direito: Conteúdo */}
          <div className="flex-1 flex flex-col p-5">

            {/* 1. Ranking e Vendas */}
            {renderMetaInfo('md')}

            {data.productName && (
              <h3 className="mt-4 text-lg font-bold text-slate-800 dark:text-slate-100 mb-2 leading-tight max-w-md line-clamp-2">
                {data.productName}
              </h3>
            )}

            {data.description && (
              <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-2">
                {data.description}
              </p>
            )}

            {data.rating && (
              <div className="mt-2 mb-4 flex items-center gap-2">
                <Stars rating={data.rating} size={16} showNumber={true} />
              </div>
            )}

            {/* Preços */}
            <div className="flex-col">
              {/* Preço original formatado para layout padrão */}
              <div className="flex flex-col">
                {data.originalPrice && (
                  <PriceOfProduct price={data.originalPrice} type="original" className="mb-1" />
                )}

                <div className="flex items-center gap-3 flex-wrap">
                  <PriceOfProduct price={data.price} size="3xl" />

                  {discount && (
                    <div className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 text-[10px] font-bold px-1.5 py-0.5 rounded-sm whitespace-nowrap">
                      {discount}% OFF
                    </div>
                  )}
                </div>
              </div>

              {/* Cupom e Botão */}
              <div className="flex flex-col justify-end mt-3 gap-1">
                {data.couponCode && (
                  <CouponOfProduct
                    couponCode={data.couponCode}
                    couponName={data.name}
                    isExpired={data.isExpired}
                    variant="blue"
                    align="start"
                    hideCode={data.hideCode}
                  />
                )}
                <div onClick={(e) => e.stopPropagation()}>
                  <AffiliateButton
                    href={data.affiliateLink || '#'}
                    logo={storeLogo || undefined}
                    text={data.affiliateButtonText || 'Ver Oferta'}
                    variant="blue"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Container Parte 2 - Pontos Positivos (Linha debaixo) */}
        {!isCompact && renderProsCons()}
      </div>
    );
  }

  // Vertical Layout (Default)
  return (
    <div
      onClick={onClick}
      className="not-prose group relative bg-white dark:bg-gray-800 rounded-sm shadow-md hover:shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden h-full transition-all duration-200 w-full max-w-xs mx-auto flex flex-col cursor-pointer"
    >

      {/* Imagem com navegação */}
      <div className="relative w-full aspect-[1/1] md:aspect-[4/3] shrink-0 flex items-center justify-center bg-white dark:bg-white overflow-hidden">
        {images.length > 0 ? (
          <>
            <Image
              src={images[currentImageIndex] || ''}
              alt={data.productName || 'Product'}
              fill
              sizes="(max-width: 768px) 100vw, 33vw"
              unoptimized={shouldUnoptimize(images[currentImageIndex] || '')}
              loader={({ src }) => src}
              className="object-contain p-3 transition-transform duration-500 group-hover:scale-105"
            />
            {images.length > 1 && (
              <>
                <button
                  onClick={(e) => { e.stopPropagation(); prevImage(); }}
                  className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-black/50 hover:bg-black/70 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <ChevronLeft size={16} />
                </button>
                <button
                  onClick={(e) => { e.stopPropagation(); nextImage(); }}
                  className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-black/50 hover:bg-black/70 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <ChevronRight size={16} />
                </button>
                <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1">
                  {images.map((_, index) => (
                    <button
                      key={index}
                      onClick={(e) => { e.stopPropagation(); setCurrentImageIndex(index); }}
                      className={`w-2 h-2 rounded-full transition-colors ${index === currentImageIndex ? 'bg-white' : 'bg-white/50'
                        }`}
                    />
                  ))}
                </div>
              </>
            )}
          </>
        ) : (
          <div className="w-full h-full bg-white dark:bg-white animate-pulse" />
        )}
        {data.ranking && (
          <div className="absolute top-0 right-0 bg-orange-500 text-white text-[10px] font-black px-2.5 py-0.5 rounded-bl-lg shadow-sm z-10 flex items-center gap-1">
            <ImFire size={12} />
            {data.ranking}
          </div>
        )}
      </div>

      {/* Conteúdo */}
      <div className="flex-1 flex flex-col p-[clamp(0.65rem,2.4vw,1.25rem)]">

        {/* 1. Ranking e Vendas */}
        {renderMetaInfo('md')}

        {data.description && (
          <p className="text-[clamp(0.72rem,2.2vw,0.9rem)] md:text-[clamp(0.85rem,1vw,0.95rem)] text-gray-600 dark:text-gray-300 mb-2 md:mb-3 line-clamp-2">
            {data.description}
          </p>
        )}

        {data.rating && (
          <div className="flex items-center gap-2">
            <Stars rating={data.rating} size={14} showNumber={true} />
          </div>
        )}

        {/* Preços */}
        <div className="mt-2 pt-1 flex flex-col">
          <div className="flex flex-col">
            {data.originalPrice && <PriceOfProduct price={data.originalPrice} type="original" className="mb-0.5" />}

            <div className="flex items-center gap-2 flex-wrap">
              <PriceOfProduct price={data.price} size="lg" />
              {discount && (
                <div className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 text-[10px] font-bold px-1.5 py-0.5 rounded-sm whitespace-nowrap">
                  {discount}% OFF
                </div>
              )}
            </div>
          </div>

          {/* Cupom e Botão */}
          <div className="flex flex-col mt-3 gap-1.5">
            {data.couponCode && (
              <CouponOfProduct
                couponCode={data.couponCode}
                couponName={data.name}
                isExpired={data.isExpired}
                variant="blue"
                align="start"
                hideCode={data.hideCode}
                compact={isMobile}
              />
            )}
            <div className="w-full" onClick={(e) => e.stopPropagation()}>
              <AffiliateButton
                href={data.affiliateLink || '#'}
                logo={storeLogo || undefined}
                text={data.affiliateButtonText || 'Comprar Agora'}
                variant="blue"
                compact={isMobile}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductWidget;
