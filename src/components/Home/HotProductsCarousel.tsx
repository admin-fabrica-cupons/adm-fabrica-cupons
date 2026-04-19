'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { ChevronLeft, ChevronRight, Flame } from 'lucide-react';
import { useRouter } from 'next/navigation';
import HotProductWidget from '../Widgets/HotProductWidget';

// Não recebe mais posts via props, busca direto do índice
interface HotProductsCarouselProps {}

const HotProductsCarousel: React.FC<HotProductsCarouselProps> = () => {
  const router = useRouter();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [autoplay, setAutoplay] = useState(true);
  const [touchStart, setTouchStart] = useState(0);
  const [touchEnd, setTouchEnd] = useState(0);
  const [hotProducts, setHotProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Carregar produtos imperdíveis do índice
  useEffect(() => {
    const fetchHotProducts = async () => {
      try {
        const response = await fetch('/api/get-posts?type=products', { cache: 'no-store' });
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        const data = await response.json();
        const products = Array.isArray(data) ? data : data.posts || [];
        if (!Array.isArray(products)) {
          console.error('Formato inesperado em /api/get-posts?type=products', data);
          setHotProducts([]);
          return;
        }
        
        // Filtrar hot_products ou categoria Escolha da Fábrica
        const hot = products.filter((p: any) => 
          p.type === 'hot_product' || 
          p.postCategory === 'Escolha da Fábrica' || 
          p.originPostCategory === 'Escolha da Fábrica'
        );
        
        // Mapear para garantir compatibilidade se necessário
        const mappedHot = hot.map((item: any) => ({
          ...item,
          postId: item.originPostId || item.postId,
          postCategory: item.originPostCategory || item.postCategory,
          // Garantir imagem (com trim para remover espaços extras se houver)
          src: item.src ? item.src.trim() : (item.image || item.thumbnail),
          
          // Garantir nome do produto
          productName: item.productName || item.title || item.name,
          
          // Garantir outros campos vitais
          storeName: item.storeName,
          soldCount: item.soldCount,
          ranking: item.ranking
        }));

        setHotProducts(mappedHot);
      } catch (error) {
        console.error('Erro ao carregar produtos imperdíveis:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchHotProducts();
  }, []);

  const getProductsPerSlide = useCallback(() => {
    if (typeof window === 'undefined') return 3; // Default to desktop for SSR
    if (window.innerWidth < 640) return 1.15; // Mobile pequeno: espiada menor para caber texto
    if (window.innerWidth < 768) return 1.25;
    if (window.innerWidth < 1024) return 2.25;
    return 3;
  }, []);

  const [productsPerSlide, setProductsPerSlide] = useState(3); // Initialize with default

  useEffect(() => {
    setProductsPerSlide(getProductsPerSlide()); // Update on client mount
    const handleResize = () => setProductsPerSlide(getProductsPerSlide());
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [getProductsPerSlide]);

  const isDesktop = productsPerSlide >= 3;
  const slideWidth = 100 / productsPerSlide;
  const offset = !isDesktop ? (100 - slideWidth) / 2 : 0;
  
  const itemsPerSlide = isDesktop ? 3 : 1;
  const totalPages = Math.ceil(hotProducts.length / itemsPerSlide);
  const currentPage = Math.floor(currentIndex / itemsPerSlide) + 1;

  const nextSlide = useCallback(() => {
    setCurrentIndex(prev => {
      const step = isDesktop ? 3 : 1;
      if (prev + step >= hotProducts.length) return 0;
      return prev + step;
    });
  }, [hotProducts.length, isDesktop]);

  const prevSlide = useCallback(() => {
    setCurrentIndex(prev => {
      const step = isDesktop ? 3 : 1;
      if (prev - step < 0) return Math.max(0, hotProducts.length - step);
      return prev - step;
    });
  }, [hotProducts.length, isDesktop]);

  useEffect(() => {
    if (!autoplay || hotProducts.length <= Math.floor(productsPerSlide)) return;
    const interval = setInterval(nextSlide, 5000);
    return () => clearInterval(interval);
  }, [autoplay, nextSlide, productsPerSlide, hotProducts.length]);

  const handleProductClick = (product: any) => {
    // Se o produto tem um link direto (produto independente), abre em nova aba
    if (product.affiliateLink) {
      window.open(product.affiliateLink, '_blank');
      return;
    }
    
    // Se o produto tem originPostId, significa que está dentro de um post
    if (product.originPostId) {
      router.push(`/post/${product.originPostId}`);
      return;
    }
    
    // Se tem postId e não tem originPostId, é um produto standalone
    if (product.postId) {
      router.push(`/DetailsOfProduct/${product.postId}`);
      return;
    }
    
    // Fallback: tenta usar o ID do produto
    if (product.id) {
      router.push(`/DetailsOfProduct/${product.id}`);
    }
  };

  if (loading) return null; // Ou um skeleton loader se preferir
  if (hotProducts.length === 0) return null;

  return (
    <div className="w-full py-6 md:py-10 bg-gradient-to-br from-orange-50 via-amber-50/30 to-red-50/50 dark:from-slate-900 dark:via-orange-950/20 dark:to-slate-900 transition-all duration-700 relative overflow-hidden">
      <div className="absolute inset-0 opacity-[0.04] dark:opacity-[0.06]" style={{ backgroundImage: 'radial-gradient(circle, #f97316 1px, transparent 1px)', backgroundSize: '32px 32px' }} />
      <div className="absolute inset-0 bg-gradient-to-t from-transparent via-orange-100/10 to-transparent dark:from-transparent dark:via-orange-500/5 dark:to-transparent" />
      
      <div className="mx-auto px-4 sm:px-6 lg:px-8 relative z-10 w-full md:w-11/12 lg:w-5/6 xl:w-3/4">
        <div
          className="w-full max-w-7xl mx-auto relative"
          onMouseEnter={() => setAutoplay(false)}
          onMouseLeave={() => setAutoplay(true)}
        >
          {/* Header Responsivo */}
          <div className="flex flex-row items-center justify-between mb-6 md:mb-8 px-2 gap-4">
            <div className="flex items-center gap-3 min-w-0">
              <div className="p-2 bg-gradient-to-br from-orange-500 to-amber-500 rounded-xl text-white shadow-lg shadow-orange-500/20 flex-shrink-0">
                <Flame size={20} className="md:w-6 md:h-6" fill="currentColor" />
              </div>
              <div className="flex flex-col">
                <h2 className="text-xl md:text-3xl font-black text-gray-900 dark:text-white uppercase tracking-tight italic leading-none">
                  Ofertas em Chamas
                </h2>
                <span className="text-xs font-bold text-orange-500 dark:text-orange-400 uppercase tracking-widest mt-1">
                  Oportunidades Relâmpago
                </span>
              </div>
            </div>

            {/* Controles de Navegação */}
            {totalPages > 1 && (
              <div className="flex items-center gap-4 flex-shrink-0">
                <div className="hidden sm:flex items-center gap-1 text-xs font-black text-gray-400 dark:text-gray-500 bg-gray-100 dark:bg-slate-800 px-3 py-1.5 rounded-full">
                  <span className="text-gray-900 dark:text-white">{currentPage}</span>
                  <span className="opacity-50">/</span>
                  <span>{totalPages}</span>
                </div>
                
                <div className="flex gap-2">
                  <button
                    onClick={prevSlide}
                    className="group relative p-3 rounded-xl bg-gradient-to-br from-white to-orange-50 dark:from-slate-800 dark:to-orange-950/30 border-2 border-orange-200 dark:border-orange-800/50 hover:border-orange-400 dark:hover:border-orange-600 hover:shadow-xl hover:shadow-orange-500/20 transition-all duration-300 active:scale-95 overflow-hidden"
                    aria-label="Anterior"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-orange-500/0 via-orange-500/10 to-orange-500/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    <ChevronLeft size={20} className="relative z-10 text-orange-600 dark:text-orange-400 group-hover:-translate-x-1 transition-transform duration-300" strokeWidth={3} />
                  </button>
                  <button
                    onClick={nextSlide}
                    className="group relative p-3 rounded-xl bg-gradient-to-br from-white to-orange-50 dark:from-slate-800 dark:to-orange-950/30 border-2 border-orange-200 dark:border-orange-800/50 hover:border-orange-400 dark:hover:border-orange-600 hover:shadow-xl hover:shadow-orange-500/20 transition-all duration-300 active:scale-95 overflow-hidden"
                    aria-label="Próximo"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-orange-500/0 via-orange-500/10 to-orange-500/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    <ChevronRight size={20} className="relative z-10 text-orange-600 dark:text-orange-400 group-hover:translate-x-1 transition-transform duration-300" strokeWidth={3} />
                  </button>
                </div>
              </div>
            )}
          </div>

      {/* Viewport do Carrossel */}
      <div
        className="relative overflow-hidden cursor-grab active:cursor-grabbing"
        onTouchStart={e => setTouchStart(e.targetTouches[0].clientX)}
        onTouchMove={e => setTouchEnd(e.targetTouches[0].clientX)}
        onTouchEnd={() => {
          const distance = touchStart - touchEnd;
          if (distance > 50) nextSlide();
          if (distance < -50) prevSlide();
          setTouchStart(0);
          setTouchEnd(0);
        }}
      >
        <div
          className="flex transition-transform duration-700 ease-[cubic-bezier(0.25,1,0.5,1)]"
          style={{
            transform: `translateX(calc(-${currentIndex * slideWidth}% + ${offset}%))`
          }}
        >
          {hotProducts.map((product, index) => {
            const isActive = isDesktop
              ? (index >= currentIndex && index < currentIndex + 3)
              : (currentIndex === index);

            return (
              <div
                key={`${product.postId}-${index}`} // postId garantido pelo map acima
                style={{ minWidth: `${slideWidth}%` }}
                className="px-1.5 md:px-2 pb-10 transition-all duration-500"
              >
                <div className={`h-fit rounded-2xl transition-all duration-500 flex flex-col ${isActive
                  ? 'scale-100 opacity-100'
                  : 'scale-[0.92] opacity-40 blur-[0.3px]'
                  }`}>
                  <HotProductWidget
                    data={product}
                    onClick={() => handleProductClick(product)}
                    layout="vertical"
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Dots de Navegação */}
      <div className="flex justify-center gap-2 md:gap-2.5">
        {Array.from({ length: Math.ceil(hotProducts.length / (isDesktop ? 3 : 1)) }).map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrentIndex(i * (isDesktop ? 3 : 1))}
            className={`transition-all duration-500 rounded-full ${Math.floor(currentIndex / (isDesktop ? 3 : 1)) === i
              ? 'w-10 md:w-12 h-2 md:h-2.5 bg-gradient-to-r from-orange-500 via-amber-500 to-orange-500 shadow-lg shadow-orange-500/40'
              : 'w-2 md:w-2.5 h-2 md:h-2.5 bg-orange-200 dark:bg-orange-900/40 hover:bg-orange-300 dark:hover:bg-orange-800/60'
              }`}
            aria-label={`Ir para página ${i + 1}`}
          />
        ))}
      </div>
    </div>
    </div>
    </div>
  );
};

export default HotProductsCarousel;
