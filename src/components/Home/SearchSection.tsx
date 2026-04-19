'use client';

import React, { useRef, useState, useEffect, useCallback } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { FiFilter } from 'react-icons/fi';

interface SearchSectionProps {
  viewMode: 'grid' | 'cupons' | 'list' | 'informativo';
  getCategoryIcon: (category: string, isActive?: boolean) => React.ReactNode;
  activeCategory: string;
  allCategories: string[];
  setActiveCategory: (category: string) => void;
  setSelectedPostId: (id: string | null) => void;
  setCurrentPage: (page: number) => void;
  getCategoryContainerStyles: () => string;
  getCategoryButtonStyles: (isActive: boolean) => string;
  getCategoryTextStyles: (isActive: boolean) => string;
}

const SearchSection: React.FC<SearchSectionProps> = ({
  viewMode,
  getCategoryIcon,
  activeCategory,
  allCategories,
  setActiveCategory,
  setSelectedPostId,
  setCurrentPage,
  getCategoryContainerStyles,
  getCategoryButtonStyles,
  getCategoryTextStyles
}) => {
  const sliderRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const updateScrollButtons = useCallback(() => {
    if (!sliderRef.current) return;
    const { scrollLeft, scrollWidth, clientWidth } = sliderRef.current;
    setCanScrollLeft(scrollLeft > 5);
    setCanScrollRight(scrollLeft + clientWidth < scrollWidth - 5);
  }, []);

  useEffect(() => {
    const el = sliderRef.current;
    if (!el) return;
    updateScrollButtons();
    el.addEventListener('scroll', updateScrollButtons, { passive: true });
    window.addEventListener('resize', updateScrollButtons);
    return () => {
      el.removeEventListener('scroll', updateScrollButtons);
      window.removeEventListener('resize', updateScrollButtons);
    };
  }, [allCategories, updateScrollButtons]);

  const slideCategories = (direction: 'left' | 'right') => {
    if (!sliderRef.current) return;
    const amount = direction === 'left' ? -200 : 200;
    sliderRef.current.scrollBy({ left: amount, behavior: 'smooth' });
  };

  // Scroll active category into view on mount and change
  useEffect(() => {
    if (!sliderRef.current) return;
    const activeIndex = allCategories.indexOf(activeCategory);
    if (activeIndex < 0) return;
    const buttons = sliderRef.current.querySelectorAll('[data-category-btn]');
    const activeBtn = buttons[activeIndex] as HTMLElement;
    if (!activeBtn) return;
    const container = sliderRef.current;
    const btnLeft = activeBtn.offsetLeft;
    const btnWidth = activeBtn.offsetWidth;
    const containerWidth = container.clientWidth;
    const scrollLeft = container.scrollLeft;

    if (btnLeft < scrollLeft + 40) {
      container.scrollTo({ left: Math.max(0, btnLeft - 40), behavior: 'smooth' });
    } else if (btnLeft + btnWidth > scrollLeft + containerWidth - 40) {
      container.scrollTo({ left: btnLeft + btnWidth - containerWidth + 40, behavior: 'smooth' });
    }
  }, [activeCategory, allCategories]);

  const getAccentColors = () => {
    if (viewMode === 'cupons') return {
      headerText: 'text-emerald-800 dark:text-emerald-300',
      headerIcon: 'text-emerald-600 dark:text-emerald-400',
      activeDot: 'bg-emerald-400',
      arrow: 'bg-emerald-600 hover:bg-emerald-700 border-emerald-500',
      activeRing: 'ring-emerald-400/60 dark:ring-emerald-500/40',
      gradientFrom: 'from-white dark:from-slate-900',
      countBg: 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300',
    };
    if (viewMode === 'informativo') return {
      headerText: 'text-cyan-800 dark:text-cyan-300',
      headerIcon: 'text-cyan-600 dark:text-cyan-400',
      activeDot: 'bg-cyan-400',
      arrow: 'bg-cyan-600 hover:bg-cyan-700 border-cyan-500',
      activeRing: 'ring-cyan-400/60 dark:ring-cyan-500/40',
      gradientFrom: 'from-white dark:from-slate-900',
      countBg: 'bg-cyan-100 dark:bg-cyan-900/30 text-cyan-700 dark:text-cyan-300',
    };
    return {
      headerText: 'text-blue-800 dark:text-blue-300',
      headerIcon: 'text-blue-600 dark:text-blue-400',
      activeDot: 'bg-yellow-400',
      arrow: 'bg-blue-600 hover:bg-blue-700 border-blue-500',
      activeRing: 'ring-blue-400/60 dark:ring-blue-500/40',
      gradientFrom: 'from-white dark:from-slate-900',
      countBg: 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300',
    };
  };

  const colors = getAccentColors();

  return (
    <div className="mb-6">
      <div className={getCategoryContainerStyles()}>
        {/* Header row */}
        <div className="flex items-center justify-between gap-3 mb-3">
          <div className={`flex items-center gap-2 text-base font-bold ${colors.headerText}`}>
            <FiFilter size={17} className={colors.headerIcon} />
            <span>Filtrar por categoria</span>
          </div>

          <div className="flex items-center gap-2">
            {/* Category count */}
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${colors.countBg}`}>
              {allCategories.length}
            </span>

            {/* Desktop nav arrows */}
            <div className="hidden sm:flex items-center gap-1">
              <button
                onClick={() => slideCategories('left')}
                disabled={!canScrollLeft}
                className={`h-7 w-7 rounded-lg flex items-center justify-center text-white transition-all disabled:opacity-30 disabled:cursor-not-allowed ${colors.arrow}`}
                aria-label="Categorias anteriores"
              >
                <ChevronLeft size={14} />
              </button>
              <button
                onClick={() => slideCategories('right')}
                disabled={!canScrollRight}
                className={`h-7 w-7 rounded-lg flex items-center justify-center text-white transition-all disabled:opacity-30 disabled:cursor-not-allowed ${colors.arrow}`}
                aria-label="Próximas categorias"
              >
                <ChevronRight size={14} />
              </button>
            </div>
          </div>
        </div>

        {/* Slider */}
        <div className="relative rounded-xl overflow-hidden">
          {/* Left fade */}
          {canScrollLeft && (
            <div className={`absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r ${colors.gradientFrom} to-transparent z-10 pointer-events-none`} />
          )}

          <div
            ref={sliderRef}
            className="flex gap-2 overflow-x-auto pt-4 pb-2 scroll-smooth scrollbar-hide"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            {allCategories.map(category => {
              const isActive = activeCategory === category;
              
              return (
                <button
                  key={category}
                  data-category-btn
                  onClick={() => {
                    setActiveCategory(category);
                    setSelectedPostId(null);
                    setCurrentPage(1);
                  }}
                  className={`
                    group relative min-w-[80px] h-[80px] md:min-w-[96px] md:h-[96px] rounded-2xl text-xs font-semibold
                    flex shrink-0 items-center justify-center text-center
                    transition-all duration-200 ease-out
                    ${getCategoryButtonStyles(isActive)}
                    ${isActive 
                      ? `scale-[1.03]  ${colors.activeRing} shadow-lg` 
                      : 'hover:scale-[1.02] hover:shadow-md active:scale-95'}
                  `}
                >
                  <div className="flex flex-col items-center justify-center gap-1.5 px-1.5">
                    <span className="leading-none [&>svg]:h-6 [&>svg]:w-6 md:[&>svg]:h-7 md:[&>svg]:w-7 transition-transform group-hover:scale-110 duration-200">
                      {getCategoryIcon(category, isActive)}
                    </span>
                    <span className={`${getCategoryTextStyles(isActive)} leading-tight line-clamp-2 text-[10px] md:text-[11px]`}>
                      {category}
                    </span>
                  </div>
                  {isActive && (
                    <div className={`absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full ${colors.activeDot} ring-white dark:ring-slate-900`} />
                  )}
                </button>
              );
            })}
          </div>

          {/* Right fade */}
          {canScrollRight && (
            <div className={`absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l ${colors.gradientFrom} to-transparent z-10 pointer-events-none`} />
          )}
        </div>
      </div>
    </div>
  );
};

export default SearchSection;
