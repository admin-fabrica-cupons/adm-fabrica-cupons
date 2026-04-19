import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { 
  Star, Copy, Check, Award, ShoppingCart,
  Clock, Zap, TrendingUp, Percent, ChevronRight,
  Heart, ExternalLink, Ticket
} from 'lucide-react';
import { STORE_THEMES } from '../../constants';

interface ProductOfSectionProps {
  item: {
    id: string;
    type: 'product' | 'hot_product' | 'product_list' | 'coupon';
    data?: any;
    postId?: string;
    postTitle: string;
    postCategory: string;
    date: string;
    price: number;
    originalPrice?: number;
    discount?: number;
    rating?: number;
    storeName?: string;
    badge?: string;
    isCoupon?: boolean;
    image?: string;
    title?: string;
    description?: string;
    couponCode?: string;
    affiliateLink?: string;
    soldCount?: string; // Novo
    ranking?: string;   // Novo
    standaloneOffer?: boolean;
  };
  compact?: boolean;
}

const ProductOfSection: React.FC<ProductOfSectionProps> = ({ item, compact = false }) => {
  const router = useRouter();
  const [copiedCoupon, setCopiedCoupon] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);

  // Calcular desconto se não tiver vindo calculado
  const calculateDiscount = () => {
    if (item.discount) return item.discount;
    
    if (item.originalPrice && item.originalPrice > 0 && item.price && item.originalPrice > item.price) {
      return Math.round(((item.originalPrice - item.price) / item.originalPrice) * 100);
    }
    return null;
  };

  const discount = calculateDiscount();
  
  // Pegar tema da loja
  const storeTheme = item.storeName ? (STORE_THEMES[item.storeName] || STORE_THEMES['Default']) : STORE_THEMES['Default'];
  const isHotProduct = item.type === 'hot_product';

  const formatPrice = (price: number) => {
    if (price === 0) return 'Grátis';
    
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(price);
  };

  const handleCopyCoupon = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (item.couponCode || item.data?.couponCode) {
      const code = item.couponCode || item.data.couponCode;
      navigator.clipboard.writeText(code);
      setCopiedCoupon(true);
      setTimeout(() => setCopiedCoupon(false), 2000);
    }
  };

  const handleFavorite = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsFavorite(!isFavorite);
    
    // Salvar no localStorage (Simples, sem sincronia complexa aqui)
    const favorites = JSON.parse(localStorage.getItem('section-favorites') || '[]');
    if (!isFavorite) {
      favorites.push(item.id);
    } else {
      const index = favorites.indexOf(item.id);
      if (index > -1) {
        favorites.splice(index, 1);
      }
    }
    localStorage.setItem('section-favorites', JSON.stringify(favorites));
  };

  const handleAffiliateClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    const link = item.affiliateLink || item.data?.affiliateLink;
    if (link) {
      window.open(link, '_blank', 'noopener,noreferrer');
    } else {
      // Fallback para o post se não tiver link direto
      router.push(`/post/${item.postId}`);
    }
  };

  const handleClick = () => {
    const target = item.standaloneOffer ? `/DetailsOfProduct/${item.id}` : `/post/${item.postId}`;
    router.push(target);
  };

  // Renderização de Cupom (Design Moderno estilo Mercado Livre)
  if (item.isCoupon || item.type === 'coupon') {
    return (
      <div 
        onClick={handleClick}
        className="group relative bg-white dark:bg-slate-800 rounded-2xl border border-gray-200 dark:border-slate-700 shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden cursor-pointer flex flex-col h-full"
      >
        {/* Parte Superior: Logo e Valor */}
        <div className={`p-5 relative overflow-hidden bg-gradient-to-br ${storeTheme.bg} flex-shrink-0`}>
          {/* Círculos decorativos de cupom */}
          <div className="absolute -left-3 top-1/2 -translate-y-1/2 w-6 h-6 bg-gray-50 dark:bg-slate-900 rounded-full" />
          <div className="absolute -right-3 top-1/2 -translate-y-1/2 w-6 h-6 bg-gray-50 dark:bg-slate-900 rounded-full" />
          
          <div className="flex flex-col items-center justify-center text-center relative z-10">
            <div className="relative w-14 h-14 bg-white rounded-full flex items-center justify-center shadow-md mb-3 overflow-hidden">
              {storeTheme.logo ? (
                <Image
                  src={storeTheme.logo || ''}
                  alt={item.storeName || 'Store Logo'}
                  fill
                  unoptimized
                  sizes="56px"
                  className="object-contain p-3"
                />
              ) : (
                <Ticket className={storeTheme.color} size={24} />
              )}
            </div>
            
            {discount && (
              <span className="text-3xl font-black text-gray-800 dark:text-white drop-shadow-sm">
                {discount}% OFF
              </span>
            )}
            {!discount && (
              <span className="text-xl font-bold text-gray-800 dark:text-white">
                CUPOM
              </span>
            )}
          </div>
        </div>

        {/* Parte Inferior: Detalhes */}
        <div className="p-4 flex flex-col flex-grow">
          <div className="mb-auto">
            <h3 className="font-bold text-gray-900 dark:text-white line-clamp-2 mb-2 group-hover:text-blue-600 transition-colors">
              {item.title || item.description || 'Cupom de Desconto'}
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-3 flex items-center gap-1">
              <Clock size={12} />
              Válido por tempo limitado
            </p>
          </div>

          {/* Código do Cupom */}
          <div 
            onClick={handleCopyCoupon}
            className="mt-3 relative bg-gray-100 dark:bg-slate-700 border border-dashed border-gray-300 dark:border-slate-600 rounded-lg p-3 flex items-center justify-between cursor-copy hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:border-blue-300 transition-colors group/code"
          >
            <span className="font-mono font-bold text-gray-700 dark:text-gray-200 text-sm tracking-wider uppercase truncate max-w-[70%]">
              {item.couponCode || item.data?.couponCode || 'VER CÓDIGO'}
            </span>
            <div className="flex items-center gap-1.5 text-blue-600 dark:text-blue-400 text-xs font-bold">
              {copiedCoupon ? (
                <>
                  <Check size={14} />
                  <span>Copiado!</span>
                </>
              ) : (
                <>
                  <Copy size={14} />
                  <span>Copiar</span>
                </>
              )}
            </div>
          </div>
          
          <button 
            onClick={handleAffiliateClick}
            className="mt-3 w-full py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold rounded-lg transition-colors flex items-center justify-center gap-2"
          >
            Usar no Site <ExternalLink size={14} />
          </button>
        </div>
      </div>
    );
  }

  // Renderização de Produto (Card Padrão)
  return (
    <div 
      onClick={handleClick}
      className={`group relative bg-white dark:bg-slate-800 rounded-2xl border border-gray-200 dark:border-slate-700 shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden cursor-pointer flex flex-col h-full ${compact ? 'text-sm' : ''}`}
    >
      {/* Imagem */}
      <div className="relative aspect-square w-full overflow-hidden bg-white dark:bg-white/5">
        {item.image ? (
          <Image 
            src={item.image || ''} 
            alt={item.title || 'Product Image'} 
            fill
            className="object-contain p-4 group-hover:scale-110 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-300">
            <ShoppingCart size={48} />
          </div>
        )}

        {/* Badges e Ações */}
        <div className="absolute top-2 left-2 flex flex-col gap-1">
          {discount && (
            <span className="bg-green-500 text-white text-[10px] font-bold px-2 py-1 rounded-full shadow-md">
              -{discount}%
            </span>
          )}
          {isHotProduct && (
            <span className="bg-orange-500 text-white text-[10px] font-bold px-2 py-1 rounded-full shadow-md flex items-center gap-1">
              <Zap size={10} /> HOT
            </span>
          )}
          {item.ranking && (
            <span className="bg-blue-600 text-white text-[10px] font-bold px-2 py-1 rounded-full shadow-md flex items-center gap-1">
              <Award size={10} /> {item.ranking.split(' ')[0]}
            </span>
          )}
        </div>

        <button
          onClick={handleFavorite}
          className="absolute top-2 right-2 p-2 bg-white/90 dark:bg-slate-800/90 rounded-full shadow-md text-gray-400 hover:text-red-500 transition-colors z-10"
        >
          <Heart size={16} className={isFavorite ? 'fill-red-500 text-red-500' : ''} />
        </button>
      </div>

      {/* Conteúdo */}
      <div className="p-4 flex flex-col flex-grow">
        {/* Info Extra: Vendidos */}
        {item.soldCount && (
          <p className="text-[10px] text-gray-500 dark:text-gray-400 mb-1 font-medium">
            {item.soldCount}
          </p>
        )}

        {/* Título */}
        <h3 className="font-medium text-gray-900 dark:text-white line-clamp-2 mb-2 group-hover:text-blue-600 transition-colors flex-grow" title={item.title}>
          {item.title}
        </h3>

        {/* Avaliação */}
        {item.rating && (
          <div className="flex items-center gap-1 mb-2">
            <div className="flex text-yellow-400">
              {[...Array(5)].map((_, i) => (
                <Star key={i} size={12} className={i < Math.floor(item.rating!) ? 'fill-current' : 'text-gray-300 dark:text-gray-600'} />
              ))}
            </div>
            <span className="text-xs text-gray-500 dark:text-gray-400">({item.rating})</span>
          </div>
        )}

        {/* Preço */}
        <div className="mt-auto">
          {item.originalPrice && item.originalPrice > item.price && (
            <span className="text-xs text-gray-400 line-through block">
              {formatPrice(item.originalPrice)}
            </span>
          )}
          <div className="flex items-center justify-between gap-2">
            <span className="text-lg font-bold text-gray-900 dark:text-white">
              {formatPrice(item.price)}
            </span>
            {item.storeName && (
              <span className={`text-[10px] px-2 py-0.5 rounded-full bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-gray-300 font-medium truncate max-w-[80px]`}>
                {item.storeName}
              </span>
            )}
          </div>
        </div>

        {/* Botão de Ação (Afiliado) */}
        <button
          onClick={handleAffiliateClick}
          className="mt-3 w-full py-2 bg-gray-900 dark:bg-white text-white dark:text-gray-900 text-sm font-bold rounded-xl opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-2 group-hover:translate-y-0 flex items-center justify-center gap-2 hover:bg-blue-600 dark:hover:bg-blue-50 dark:hover:text-blue-600"
        >
          Ver Oferta <ExternalLink size={14} />
        </button>
      </div>
    </div>
  );
};

export default ProductOfSection;
