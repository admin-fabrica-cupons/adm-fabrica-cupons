'use client';

import React, { useState, useContext, useEffect, useMemo, lazy, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import dynamic from 'next/dynamic';
import { PostContext } from '@/contexts/PostContext';
import { CATEGORIES as DEFAULT_CATEGORIES } from '@/constants';
import { BlogPost, ViewMode } from '@/types';
import { useUI } from '@/contexts/UIContext';

// Lazy load de componentes pesados
const Hero = dynamic(() => import('@/components/Home/Hero'), {
  loading: () => <div className="h-[600px] bg-[#FCEE21] animate-pulse" />
});

const HotProductsCarousel = dynamic(() => import('@/components/Home/HotProductsCarousel'), {
  loading: () => <div className="h-[400px] bg-gray-100 animate-pulse" />,
  ssr: false
});

const PostCard = dynamic(() => import('@/components/Post/PostCard'));
const WhatsAppBanner = dynamic(() => import('@/components/Common/WhatsAppBanner'), { ssr: false });
const SearchSection = dynamic(() => import('@/components/Home/SearchSection'), { ssr: false });

interface OptimizedHomeClientProps {
  initialPosts: BlogPost[];
}

const OptimizedHomeClient: React.FC<OptimizedHomeClientProps> = ({ initialPosts }) => {
  const searchParams = useSearchParams();
  const { searchQuery: globalSearchQuery } = useUI();
  const postContext = useContext(PostContext);
  const contextPosts = useMemo(() => postContext?.posts || [], [postContext?.posts]);
  const contextCategories = useMemo(() => postContext?.categories || [], [postContext?.categories]);

  const [postsData, setPostsData] = useState<BlogPost[]>(initialPosts || []);
  const [activeCategory, setActiveCategory] = useState('Todos');
  const [showBanner, setShowBanner] = useState(true);
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [sortBy, setSortBy] = useState<'date' | 'title' | 'category'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [selectedPostId, setSelectedPostId] = useState<string | null>(null);
  const postsPerPage = 12;

  // Carregar favoritos apenas no cliente
  useEffect(() => {
    const savedFavorites = localStorage.getItem('favorites');
    if (savedFavorites) {
      setFavorites(JSON.parse(savedFavorites));
    }
  }, []);

  // Sincronizar com context
  useEffect(() => {
    if (contextPosts && contextPosts.length > 0) {
      setPostsData(contextPosts);
    }
  }, [contextPosts]);

  // Helpers de filtro
  const postHasCoupons = (post: BlogPost) => {
    if (post.isCouponPost) return true;
    if (post.blocks) {
      return post.blocks.some((block: any) => {
        if (block.type === 'coupon' || block.type === 'coupon_list') return true;
        if (block.type === 'product' || block.type === 'hot_product') {
          return !!block.couponCode;
        }
        return false;
      });
    }
    return false;
  };

  const postIsInformative = (post: BlogPost) => {
    return post.isInformativePost || false;
  };

  // Filtrar e ordenar posts (memoizado)
  const filteredAndSortedPosts = useMemo(() => {
    if (!Array.isArray(postsData)) return [];

    const query = (globalSearchQuery || '').toLowerCase();

    let filtered = postsData.filter(post => {
      if (!query.trim()) return true;

      const titleMatch = (post.title || '').toLowerCase().includes(query);
      const excerptMatch = (post.excerpt || '').toLowerCase().includes(query);
      const categoryMatch = (post.category || '').toLowerCase().includes(query);
      return titleMatch || excerptMatch || categoryMatch;
    });

    if (activeCategory === 'Cupons') {
      filtered = filtered.filter(
        post => post.isCouponPost || post.category === 'Cupons' || postHasCoupons(post)
      );
    } else if (activeCategory === 'Informativos') {
      filtered = filtered.filter(post => postIsInformative(post));
    } else if (activeCategory !== 'Todos') {
      filtered = filtered.filter(post => post.category === activeCategory);
    }

    filtered.sort((a, b) => {
      let compareA: any, compareB: any;

      switch (sortBy) {
        case 'title':
          compareA = (a.title || '').toLowerCase();
          compareB = (b.title || '').toLowerCase();
          break;
        case 'category':
          compareA = a.category?.toLowerCase() || '';
          compareB = b.category?.toLowerCase() || '';
          break;
        case 'date':
        default:
          compareA = new Date(a.date).getTime();
          compareB = new Date(b.date).getTime();
          break;
      }

      if (typeof compareA === 'string' && typeof compareB === 'string') {
        return sortOrder === 'asc' ? compareA.localeCompare(compareB) : compareB.localeCompare(compareA);
      }
      return sortOrder === 'asc' ? compareA - compareB : compareB - compareA;
    });

    return filtered;
  }, [postsData, activeCategory, globalSearchQuery, sortBy, sortOrder]);

  const allPostsForCurrentMode = useMemo(() => {
    if (!Array.isArray(filteredAndSortedPosts)) return [];
    let filtered = filteredAndSortedPosts;

    if (viewMode === 'cupons') {
      filtered = filtered.filter(post => post.isCouponPost || post.category === 'Cupons' || postHasCoupons(post));
    } else if (viewMode === 'informativo') {
      filtered = filtered.filter(post => postIsInformative(post));
    } else if (viewMode === 'grid' || viewMode === 'list') {
      filtered = filtered.filter(post => !postIsInformative(post));
    }

    return filtered;
  }, [filteredAndSortedPosts, viewMode]);

  const postsToRender = useMemo(() => {
    return allPostsForCurrentMode.slice(0, currentPage * postsPerPage);
  }, [allPostsForCurrentMode, currentPage]);

  const allCategories = contextCategories.length > 0 ? contextCategories : DEFAULT_CATEGORIES;

  const getCategoryIcon = () => null;
  
  const getCategoryContainerStyles = () => "flex flex-wrap gap-2 mt-4";
  
  const getCategoryButtonStyles = (isActive: boolean) => isActive 
    ? "px-4 py-2 bg-blue-600 text-white rounded-lg transition-colors duration-200"
    : "px-4 py-2 bg-white/80 dark:bg-slate-800/80 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-blue-50 dark:hover:bg-slate-700 transition-colors duration-200";
  
  const getCategoryTextStyles = (isActive: boolean) => isActive
    ? "text-white"
    : "text-gray-700 dark:text-gray-300";

  return (
    <main className="min-h-screen bg-gray-50 dark:bg-slate-900">
      <Hero />
      
      <Suspense fallback={<div className="h-[400px]" />}>
        <HotProductsCarousel />
      </Suspense>

      <div className="w-full py-8 bg-gradient-to-br from-sky-50 via-blue-50 to-cyan-50 dark:from-blue-900/40 dark:via-cyan-900/35 dark:to-sky-900/45">
        <div className="mx-auto px-4 sm:px-6 lg:px-8 relative z-10 w-full sm:w-[90%] md:w-[85%] lg:w-[80%] xl:w-[75%]">
          {showBanner && (
            <Suspense fallback={null}>
              <div className="mb-6">
                <WhatsAppBanner onClose={() => setShowBanner(false)} closable={true} />
              </div>
            </Suspense>
          )}

          <Suspense fallback={<div className="h-20 bg-white/50 rounded-xl animate-pulse mb-6" />}>
            <SearchSection
              activeCategory={activeCategory}
              setActiveCategory={setActiveCategory}
              viewMode={viewMode}
              getCategoryIcon={getCategoryIcon}
              allCategories={allCategories}
              setSelectedPostId={setSelectedPostId}
              setCurrentPage={setCurrentPage}
              getCategoryContainerStyles={getCategoryContainerStyles}
              getCategoryButtonStyles={getCategoryButtonStyles}
              getCategoryTextStyles={getCategoryTextStyles}
            />
          </Suspense>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
            {postsToRender.map((post) => (
              <Suspense key={post.id} fallback={<div className="h-[400px] bg-white rounded-xl animate-pulse" />}>
                <PostCard post={post} />
              </Suspense>
            ))}
          </div>

          {postsToRender.length < allPostsForCurrentMode.length && (
            <div className="flex justify-center mt-8">
              <button
                onClick={() => setCurrentPage(prev => prev + 1)}
                className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors"
              >
                Carregar Mais
              </button>
            </div>
          )}
        </div>
      </div>
    </main>
  );
};

export default OptimizedHomeClient;
