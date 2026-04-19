import React, { useMemo, useState, useEffect } from 'react';
import Image from 'next/image';
import { useMediaQuery } from 'react-responsive';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { ProductListItem } from '../../types';
import {
  ShoppingCart,
  Crown,
  Medal,
  Trophy,
  Sparkles,
  Store,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import CouponOfProduct from './CouponOfProduct';
import AffiliateButton from './AffiliateButton';
import PriceOfProduct from './PriceOfProduct';
import Stars from '../Common/Stars';
import { STORE_THEMES, PARTNER_STORES } from '../../constants';

// ------------------------------------------------------------
// Utilitários
// ------------------------------------------------------------
function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const shouldUnoptimize = (src?: string) =>
  !!src && (src.includes('placehold.co') || src.endsWith('.svg'));

const resolveStoreLogo = (item: ProductListItem) =>
  (item.showStoreLogo &&
    item.storeName &&
    PARTNER_STORES[item.storeName as keyof typeof PARTNER_STORES]?.logoUrl) ||
  item.affiliateLogo;

const isValidProduct = (item: ProductListItem) => {
  return !!(item.title || item.productName);
};

const numberBadgeStyles = [
  'bg-blue-500 text-white shadow-blue-500/30',
  'bg-blue-600 text-white shadow-blue-600/30',
  'bg-blue-700 text-white shadow-blue-700/30',
  'bg-indigo-500 text-white shadow-indigo-500/30',
  'bg-indigo-600 text-white shadow-indigo-600/30',
  'bg-indigo-700 text-white shadow-indigo-700/30',
  'bg-violet-500 text-white shadow-violet-500/30',
  'bg-violet-600 text-white shadow-violet-600/30',
  'bg-violet-700 text-white shadow-violet-700/30',
  'bg-slate-800 text-white shadow-slate-800/30',
];

const getCategoryStyle = (category: string = '') => {
  const cat = category.toLowerCase();
  if (cat.includes('cupom') || cat.includes('desconto')) {
    return 'bg-emerald-500 text-white shadow-emerald-500/20';
  }
  if (cat.includes('imperdível') || cat.includes('imperdivel') || cat.includes('oferta')) {
    return 'bg-orange-500 text-white shadow-orange-500/20';
  }
  if (cat.includes('informativo') || cat.includes('artigo') || cat.includes('blog') || cat.includes('notícia')) {
    return 'bg-cyan-500 text-white shadow-cyan-500/20';
  }
  return 'bg-blue-500 text-white shadow-blue-500/20';
};

const renderStackedPrice = (item: ProductListItem, size: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' = 'md', className?: string) => (
  <div className={cn("flex flex-col", className)}>
    {item.originalPrice && (
      <PriceOfProduct price={item.originalPrice} type="original" className="mb-0.5" />
    )}
    <PriceOfProduct price={item.price || '0,00'} size={size} />
  </div>
);

// ------------------------------------------------------------
// Subcomponentes Internos
// ------------------------------------------------------------
const resolveStoreTheme = (storeName?: string) => {
  if (!storeName) return STORE_THEMES.Default;
  if (STORE_THEMES[storeName]) return STORE_THEMES[storeName];
  const match = Object.keys(STORE_THEMES).find(
    key => key.toLowerCase() === storeName.toLowerCase()
  );
  return match ? STORE_THEMES[match] : STORE_THEMES.Default;
};
const StoreBadge: React.FC<{ storeName?: string }> = ({ storeName }) => {
  if (!storeName) return null;
  const theme = resolveStoreTheme(storeName);
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider border w-fit",
        theme.storeBadge
      )}
    >
      <Store size={8} />
      {storeName}
    </span>
  );
};

interface ProductImageProps {
  src?: string;
  alt: string;
  priority?: boolean;
}

const ProductImage: React.FC<ProductImageProps> = ({ src, alt, priority }) => {
  if (!src) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-slate-100 dark:bg-slate-800">
        <ShoppingCart size={40} className="text-slate-300 dark:text-slate-600" />
      </div>
    );
  }

  return (
    <div className="relative w-full h-full">
      <Image
        src={src}
        alt={alt}
        fill
        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
        className="object-contain p-3 transition-transform duration-500 group-hover:scale-105"
        unoptimized={shouldUnoptimize(src)}
        priority={priority}
      />
    </div>
  );
};

// ------------------------------------------------------------
// Componente Principal
// ------------------------------------------------------------
interface ShowListOfProductsProps {
  products: ProductListItem[];
  listType: 'grid' | 'vertical' | 'list' | 'rank' | 'podium' | 'carousel';
  columns?: number;
  rankSize?: number;
}

const ShowListOfProducts: React.FC<ShowListOfProductsProps> = ({ 
  products, 
  listType, 
  columns = 3,
  rankSize = 3
}) => {
  const [showAll, setShowAll] = useState(false);
  const [carouselPage, setCarouselPage] = useState(0);
  const isDesktop = useMediaQuery({ minWidth: 768 });
  const isSm = useMediaQuery({ minWidth: 640 });
  const isLarge = useMediaQuery({ minWidth: 1280 });

  // Filtra e prepara os itens a serem exibidos
  const items = useMemo(() => products.filter(isValidProduct), [products]);
  const maxColumns = Math.min(columns, 4);
  const itemsPerPage = useMemo(() => {
    if (listType !== 'carousel') return 0;
    const responsiveCount = isLarge ? 4 : isDesktop ? 3 : isSm ? 2 : 1;
    return Math.min(maxColumns, responsiveCount);
  }, [listType, isLarge, isDesktop, isSm, maxColumns]);
  const totalPages = useMemo(() => {
    if (listType !== 'carousel' || itemsPerPage === 0) return 1;
    return Math.max(1, Math.ceil(items.length / itemsPerPage));
  }, [items.length, itemsPerPage, listType]);

  useEffect(() => {
    if (listType !== 'carousel') return;
    setCarouselPage((prev) => Math.min(prev, totalPages - 1));
  }, [listType, totalPages, itemsPerPage]);
  
  const displayItems = useMemo(() => {
    if (items.length === 0) return [];

    if (listType === 'rank') {
      return items.slice(0, rankSize);
    }

    if (listType === 'podium') {
      return items.slice(0, 3);
    }

    if (listType === 'carousel') {
      return items;
    }

    // Para Grid e Vertical/List, mostra 5 inicialmente, ou todos se showAll for true
    if (!showAll && items.length > 5 && listType !== 'vertical' && listType !== 'list') {
       return items.slice(0, 5);
    }
    
    // Vertical/List também pode ter "ver mais" se desejar, mas o código original tinha lógica específica
    // Vamos padronizar: se não showAll e > 5, mostra 5
    if (!showAll && items.length > 5) {
       return items.slice(0, 5);
    }

    return items;
  }, [items, listType, rankSize, showAll]);

  const carouselItems = useMemo(() => {
    if (listType !== 'carousel') return [];
    const start = carouselPage * itemsPerPage;
    return items.slice(start, start + itemsPerPage);
  }, [items, listType, carouselPage, itemsPerPage]);

  // ------------------------------------------------------------
  // Renderizadores
  // ------------------------------------------------------------
  
  // 1. Grid Card
  const renderGridItem = (item: ProductListItem, index: number) => {
    const title = item.title || item.productName;
    const numberStyle = numberBadgeStyles[index % numberBadgeStyles.length];
    const category = item.category || item.originPostCategory || item.badge;
    const categoryStyle = getCategoryStyle(category);

    return (
      <div
        key={item.id}
        className="group bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-md transition-all duration-300 flex flex-col h-full overflow-hidden w-full"
      >
        <div className="relative aspect-[4/3] w-full bg-slate-50 dark:bg-slate-800/50">
          <div className={`absolute top-3 left-3 z-10 w-8 h-8 rounded-full flex items-center justify-center text-xs font-black shadow-lg ${numberStyle}`}>
            {index + 1}
          </div>
          {category && (
            <div className={`absolute top-3 right-3 z-10 px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider ${categoryStyle}`}>
              {category}
            </div>
          )}
          <ProductImage src={item.image} alt={title || 'Produto'} />
        </div>

        <div className="p-4 flex flex-col flex-1">
          <StoreBadge storeName={item.storeName} />
          {title && (
            <h3 className="text-sm font-bold text-slate-800 dark:text-white mt-3 mb-2 leading-tight">
              {title}
            </h3>
          )}

          <div className="flex flex-wrap items-center gap-2 text-xs ">
            <Stars rating={item.rating || 0} size={12} showNumber />
            {item.soldCount && (
              <span className="text-gray-500 dark:text-gray-400">
                • {item.soldCount} vendidos
              </span>
            )}
            {item.ranking && (
              <span className="text-[10px] font-bold text-orange-600 bg-orange-100 dark:bg-orange-900/30 px-1.5 py-0.5 rounded-md">
                #{item.ranking}
              </span>
            )}
          </div>

          <div className="mt-4 space-y-3">
            {renderStackedPrice(item, 'sm', 'items-start')}

            {item.couponCode && (
              <CouponOfProduct
                couponCode={item.couponCode}
                couponName={item.couponName || ''}
                variant="blue"
                align="start"
                hideCode={item.hideCode}
              />
            )}

            <AffiliateButton
              href={item.affiliateLink || '#'}
              logo={resolveStoreLogo(item)}
              text={item.affiliateButtonText || 'VER OFERTA'}
              variant="blue"
            />
          </div>
        </div>
      </div>
    );
  };

  // 2. Vertical Item
  const renderVerticalItem = (item: ProductListItem, index: number) => {
    const title = item.title || item.productName;
    const numberStyle = numberBadgeStyles[index % numberBadgeStyles.length];
    const category = item.category || item.originPostCategory || item.badge;
    const categoryStyle = getCategoryStyle(category);

    return (
      <div
        key={item.id}
        className="group bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-md transition-all duration-300 flex flex-col sm:flex-row overflow-hidden w-full"
      >
        <div className="relative w-full h-48 sm:w-48 sm:h-48 shrink-0 bg-slate-50 dark:bg-slate-800/50">
          <div className={`absolute top-3 left-3 z-10 w-8 h-8 rounded-full flex items-center justify-center text-xs font-black shadow-lg ${numberStyle}`}>
            {index + 1}
          </div>
          {category && (
            <div className={`absolute top-3 right-3 z-10 px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider ${categoryStyle}`}>
              {category}
            </div>
          )}
          <ProductImage src={item.image} alt={title || 'Produto'} />
        </div>

        <div className="p-4 sm:p-5 flex flex-col flex-1">
          <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4 h-full">
            <div className="flex-1">
              <StoreBadge storeName={item.storeName} />
              {title && (
                <h3 className="text-base font-bold text-slate-800 dark:text-white mt-2 mb-2 line-clamp-2">
                  {title}
                </h3>
              )}

              <div className="flex flex-wrap items-center gap-2 text-sm mb-3">
                <Stars rating={item.rating || 0} size={14} showNumber />
                {item.soldCount && (
                  <span className="text-gray-500 dark:text-gray-400">
                    • {item.soldCount} vendidos
                  </span>
                )}
                {item.ranking && (
                  <span className="text-[10px] font-bold text-orange-600 bg-orange-100 dark:bg-orange-900/30 px-1.5 py-0.5 rounded-md">
                    #{item.ranking}
                  </span>
                )}
              </div>

              {item.description && (
                <p className="text-sm text-slate-500 dark:text-slate-400 line-clamp-2 max-w-md hidden sm:block">
                  {item.description}
                </p>
              )}
            </div>

            <div className="flex flex-col items-start text-left shrink-0 w-full sm:w-48 space-y-3 h-full justify-end">
              {renderStackedPrice(item, 'md', 'items-start')}

              {item.couponCode && (
                <CouponOfProduct
                  couponCode={item.couponCode}
                  couponName={item.couponName || ''}
                  variant="blue"
                  align="start"
                  hideCode={item.hideCode}
                />
              )}

              <AffiliateButton
                href={item.affiliateLink || '#'}
                logo={resolveStoreLogo(item)}
                text={item.affiliateButtonText || 'VER OFERTA'}
                variant="blue"
              />
            </div>
          </div>
        </div>
      </div>
    );
  };

  // 3. Rank Item
  const renderRankItem = (item: ProductListItem, index: number) => {
    const isFirst = index === 0;
    const title = item.title || item.productName;
    const rankConfigs = [
      {
        bg: 'bg-amber-500',
        border: 'border-amber-400 dark:border-amber-500/50',
        icon: <Crown className="text-white" size={14} />,
      },
      {
        bg: 'bg-slate-400',
        border: 'border-slate-200 dark:border-slate-700',
        icon: <Medal className="text-white" size={14} />,
      },
      {
        bg: 'bg-orange-400',
        border: 'border-orange-200 dark:border-orange-800/50',
        icon: <Trophy className="text-white" size={14} />,
      },
    ];

    const config = rankConfigs[index] || {
      bg: 'bg-slate-200',
      border: 'border-slate-100',
      icon: null,
    };

    return (
      <div
        key={item.id}
        className={cn(
          "group relative bg-white dark:bg-slate-900 rounded-2xl border-2 shadow-sm hover:shadow-md transition-all duration-300 flex flex-col overflow-hidden w-full",
          config.border
        )}
      >
        <div className={cn("absolute top-3 left-3 z-10 inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-[10px] font-black uppercase tracking-widest text-white", config.bg)}>
          {config.icon}
          <span>{index + 1}º</span>
        </div>
        {isFirst && (
          <div className="absolute top-3 right-3 z-10 bg-amber-500 text-white p-1.5 rounded-full shadow-lg">
            <Sparkles size={14} />
          </div>
        )}
        <div className="flex flex-col flex-1">
          <div className="relative aspect-[4/3] w-full bg-slate-50 dark:bg-slate-800/50 overflow-hidden">
            <ProductImage src={item.image} alt={title || 'Produto'} />
          </div>
          <div className="p-4 flex flex-col flex-1">
            <StoreBadge storeName={item.storeName} />
            {title && (
              <h3 className="text-sm font-bold text-slate-800 dark:text-white mt-2 mb-2 line-clamp-2 leading-tight min-h-[2.5em]">
                {title}
              </h3>
            )}
            <div className="flex flex-wrap items-center gap-2 text-xs mb-3">
              <Stars rating={item.rating || 0} size={12} showNumber />
              {item.soldCount && (
                <span className="text-gray-500 dark:text-gray-400">
                  • {item.soldCount} vendidos
                </span>
              )}
            </div>
            <div className="mt-4 space-y-3">
              {renderStackedPrice(item, 'sm', 'items-start')}

              {item.couponCode && (
                <CouponOfProduct
                  couponCode={item.couponCode}
                  couponName={item.couponName || ''}
                  variant={isFirst ? 'orange' : 'blue'}
                  align="start"
                  hideCode={item.hideCode}
                />
              )}

              <AffiliateButton
                href={item.affiliateLink || '#'}
                logo={resolveStoreLogo(item)}
                text={item.affiliateButtonText || 'VER OFERTA'}
                variant={isFirst ? 'orange' : 'blue'}
              />
            </div>
          </div>
        </div>
      </div>
    );
  };

  // 4. Podium Item
  const renderPodiumItem = (item: ProductListItem, position: number) => {
    const title = item.title || item.productName;
    const configs = [
      {
        bg: 'bg-amber-400',
        border: 'border-amber-300',
        label: '1º LUGAR'
      },
      {
        bg: 'bg-slate-300',
        border: 'border-slate-200',
        label: '2º LUGAR'
      },
      {
        bg: 'bg-orange-300',
        border: 'border-orange-200',
        label: '3º LUGAR'
      },
    ];

    const config = configs[position];

    return (
      <div
        key={item.id}
        className="relative w-full h-full"
      >
        <div className={cn("bg-white dark:bg-slate-900 rounded-2xl border-2 shadow-sm hover:shadow-md flex flex-col h-full overflow-hidden w-full", config.border)}>
          <div className={cn("relative h-10 flex items-center justify-center shrink-0", config.bg)}>
            <div className="text-white font-black uppercase tracking-widest text-xs">
              <span>{config.label}</span>
            </div>
          </div>
          <div className="relative aspect-[4/3] w-full bg-slate-50 dark:bg-slate-800/30 overflow-hidden">
            <ProductImage src={item.image} alt={title || 'Produto'} />
          </div>
          <div className="p-4 flex flex-col items-start text-left flex-1">
            <StoreBadge storeName={item.storeName} />
            {title && (
              <h3 className="text-sm font-bold text-slate-800 dark:text-white mt-2 mb-2 line-clamp-2 min-h-[2.5em]">
                {title}
              </h3>
            )}
            <div className="mb-3">
              <Stars rating={item.rating || 0} size={12} showNumber />
            </div>
            <div className="mt-4 w-full space-y-3">
              {renderStackedPrice(item, 'sm', 'items-start')}
              {item.couponCode && (
                <CouponOfProduct
                  couponCode={item.couponCode}
                  couponName={item.couponName || ''}
                  variant={position === 0 ? 'orange' : 'blue'}
                  align="start"
                  hideCode={item.hideCode}
                  compact
                />
              )}
              <AffiliateButton
                href={item.affiliateLink || '#'}
                logo={resolveStoreLogo(item)}
                text={item.affiliateButtonText || 'VER OFERTA'}
                variant={position === 0 ? 'orange' : 'blue'}
                compact
              />
            </div>
          </div>
        </div>
      </div>
    );
  };

  // ------------------------------------------------------------
  // Switch de Renderização
  // ------------------------------------------------------------

  if (listType === 'podium') {
    const first = items[0];
    const second = items[1];
    const third = items[2];

    if (!first) return null;

    return (
      <div className="w-full">
        <div className={cn("grid grid-cols-1 gap-6 items-stretch", isDesktop ? "md:grid-cols-3" : "")}>
          {renderPodiumItem(first, 0)}
          {second && renderPodiumItem(second, 1)}
          {third && renderPodiumItem(third, 2)}
        </div>
      </div>
    );
  }

  if (listType === 'rank') {
    return (
      <div className="w-full">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch">
          {displayItems.map((item, index) => renderRankItem(item, index))}
        </div>
      </div>
    );
  }

  if (listType === 'carousel') {
    const baseIndex = carouselPage * itemsPerPage;
    const canGoPrev = carouselPage > 0;
    const canGoNext = carouselPage < totalPages - 1;
    return (
      <div className="w-full">
        <div className="flex items-center justify-between mb-5">
          <button
            type="button"
            onClick={() => setCarouselPage((prev) => Math.max(0, prev - 1))}
            disabled={!canGoPrev}
            className={`w-10 h-10 rounded-full border flex items-center justify-center transition-all ${
              canGoPrev
                ? 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-200 hover:border-blue-500 hover:text-blue-600 dark:hover:text-blue-400 hover:shadow'
                : 'border-slate-100 dark:border-slate-800 text-slate-300 dark:text-slate-600 cursor-not-allowed'
            }`}
          >
            <ChevronLeft size={18} />
          </button>
          <div className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">
            Página {carouselPage + 1} de {totalPages}
          </div>
          <button
            type="button"
            onClick={() => setCarouselPage((prev) => Math.min(totalPages - 1, prev + 1))}
            disabled={!canGoNext}
            className={`w-10 h-10 rounded-full border flex items-center justify-center transition-all ${
              canGoNext
                ? 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-200 hover:border-blue-500 hover:text-blue-600 dark:hover:text-blue-400 hover:shadow'
                : 'border-slate-100 dark:border-slate-800 text-slate-300 dark:text-slate-600 cursor-not-allowed'
            }`}
          >
            <ChevronRight size={18} />
          </button>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-[repeat(auto-fit,minmax(240px,1fr))] gap-3 md:gap-6">
          {carouselItems.map((item, index) => renderGridItem(item, baseIndex + index))}
        </div>
      </div>
    );
  }

  if (listType === 'vertical' || listType === 'list') {
    return (
      <div className="w-full">
        <div className="flex flex-col gap-6">
          {displayItems.map((item, index) => renderVerticalItem(item, index))}
        </div>
        {!showAll && items.length > 5 && (
          <div className="mt-8 flex justify-center">
             <button
              onClick={() => setShowAll(true)}
              className="group flex items-center gap-2 px-6 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-full text-sm font-medium text-slate-600 dark:text-slate-300 hover:border-blue-500 hover:text-blue-600 dark:hover:text-blue-400 transition-all shadow-sm"
            >
              <span>Ver mais ofertas</span>
              <ChevronDown size={16} className="group-hover:translate-y-0.5 transition-transform" />
            </button>
          </div>
        )}
      </div>
    );
  }

  // Grid View (Default)
  return (
    <div className="w-full">
      <div className={cn("grid grid-cols-2 md:grid-cols-[repeat(auto-fit,minmax(240px,1fr))] gap-3 md:gap-6")}>
        {displayItems.map((item, index) => renderGridItem(item, index))}
      </div>

      {!showAll && items.length > 5 && (
        <div className="mt-10 flex justify-center">
          <button
            onClick={() => setShowAll(true)}
            className="group flex items-center gap-2 px-6 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-full text-sm font-medium text-slate-600 dark:text-slate-300 hover:border-blue-500 hover:text-blue-600 dark:hover:text-blue-400 transition-all shadow-sm"
          >
            <span>Mostrar mais {items.length - displayItems.length} produtos</span>
            <ChevronDown size={16} className="group-hover:translate-y-0.5 transition-transform" />
          </button>
        </div>
      )}
    </div>
  );
};

export default ShowListOfProducts;
