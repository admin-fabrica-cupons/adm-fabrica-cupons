'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { BlogPost } from '../../types';
import { Heart, ArrowRight } from 'lucide-react';

interface PostCardHorizontalProps {
  post: BlogPost;
  variant?: 'default' | 'compact';
}

const PostCardHorizontal: React.FC<PostCardHorizontalProps> = ({ post, variant = 'default' }) => {
  const [isFavorite, setIsFavorite] = useState(false);
  const [showFavoriteAnimation, setShowFavoriteAnimation] = useState(false);

  useEffect(() => {
    const favorites = JSON.parse(localStorage.getItem('favorites') || '[]');
    setIsFavorite(favorites.includes(post.id));
  }, [post.id]);

  const toggleFavorite = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const favorites = JSON.parse(localStorage.getItem('favorites') || '[]');
    let newFavorites;

    if (isFavorite) {
      newFavorites = favorites.filter((id: string) => id !== post.id);
      setIsFavorite(false);
    } else {
      newFavorites = [...favorites, post.id];
      setIsFavorite(true);
      setShowFavoriteAnimation(true);
      setTimeout(() => setShowFavoriteAnimation(false), 1000);
    }

    localStorage.setItem('favorites', JSON.stringify(newFavorites));
    window.dispatchEvent(new CustomEvent('favoritesUpdated'));
  };

  const couponCount = post.blocks?.filter(b => b.type === 'coupon' || b.type === 'coupon_list').length || 0;
  const hasHotProduct = post.blocks?.some((b: any) => b.type === 'hot_product') || false;
  const isInformative = post.isInformativePost || false;
  const normalizedDate = post.date ? (post.date.includes('T') ? post.date : `${post.date}T00:00:00`) : undefined;

  // Determine theme colors based on post type
  const getThemeColor = () => {
    if (isInformative) return 'border-cyan-400 dark:border-cyan-500';
    if (hasHotProduct) return 'border-orange-500 dark:border-orange-500';
    if (couponCount > 0) return 'border-emerald-500 dark:border-emerald-500';
    return 'border-blue-600 dark:border-blue-500';
  };

  const getHoverColor = () => {
    if (isInformative) return 'group-hover:text-cyan-600 dark:group-hover:text-cyan-400';
    if (hasHotProduct) return 'group-hover:text-orange-600 dark:group-hover:text-orange-400';
    if (couponCount > 0) return 'group-hover:text-emerald-600 dark:group-hover:text-emerald-400';
    return 'group-hover:text-blue-600 dark:group-hover:text-blue-400';
  };

  return (
    <div className="relative group w-full">

      <Link
        href={`/post/${post.id}`}
        prefetch={true}
        className={`flex flex-col ${variant === 'default' ? 'sm:flex-row' : ''} gap-5 bg-transparent transition-all duration-300 group-hover:bg-gray-50 dark:group-hover:bg-slate-800/30 rounded-xl p-3 sm:p-0 hover:scale-[1.005] active:scale-[0.995]`}
        onClick={(e) => {
          // Show loading indicator
          const target = e.currentTarget;
          target.style.opacity = '0.6';
          target.style.pointerEvents = 'none';
        }}
      >
        {/* Left Side: Image */}
        <div className={`relative w-full ${variant === 'default' ? 'sm:w-[280px] md:w-[320px] aspect-[16/9] sm:aspect-[4/3]' : 'aspect-video'} shrink-0 overflow-hidden rounded-lg bg-gray-100 dark:bg-slate-800`}>
          <Image
            src={post.thumbnail}
            alt={post.title}
            fill
            priority={false}
            unoptimized={post.thumbnail?.includes('placehold.co')}
            className="object-cover object-center transition-transform duration-500 ease-out group-hover:scale-110"
          />
          
          {/* Favorite Button */}
          <button
            onClick={toggleFavorite}
            className={`absolute top-2 left-2 z-20 p-2 rounded-full bg-white/90 dark:bg-slate-900/90 backdrop-blur-sm text-gray-400 hover:text-red-500 transition-all shadow-sm opacity-0 group-hover:opacity-100 focus:opacity-100 ${isFavorite ? 'opacity-100' : ''} active:scale-90`}
            title={isFavorite ? "Remover dos favoritos" : "Adicionar aos favoritos"}
          >
            <Heart size={16} className={`transition-transform duration-300 ${isFavorite ? "fill-red-500 text-red-500 scale-110" : "scale-100"}`} />
          </button>

          {/* Favorite Animation Overlay */}
          {showFavoriteAnimation && (
            <div className="absolute inset-0 z-30 flex items-center justify-center bg-black/10 backdrop-blur-[1px] rounded-lg animate-in fade-in duration-200">
              <Heart size={64} className="text-red-500 fill-red-500 animate-heart-pop drop-shadow-2xl filter" />
            </div>
          )}
        </div>

        {/* Right Side: Content */}
        <div className="flex-1 flex flex-col py-1 sm:py-2 pr-2 min-w-0">
          {/* Header: Category & Date */}
          <div className="flex items-center justify-between mb-2">
            <span className={`text-xs font-black uppercase tracking-wider text-gray-900 dark:text-white border-b-[3px] ${getThemeColor()} pb-0.5 leading-none`}>
              {post.category}
            </span>
            <span className="text-[10px] sm:text-xs font-mono font-medium text-gray-400 dark:text-gray-500 uppercase tracking-widest">
              {normalizedDate ? new Date(normalizedDate).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: '2-digit' }) : ''}
            </span>
          </div>

          {/* Title */}
          <h3 className={`text-lg sm:text-xl md:text-2xl font-bold text-gray-900 dark:text-white mb-2 leading-tight transition-colors ${getHoverColor()}`}>
            {post.title}
          </h3>

          {/* Description */}
          <p className={`text-sm text-gray-600 dark:text-gray-400 mb-3 leading-relaxed ${variant === 'compact' ? 'line-clamp-1 sm:line-clamp-2' : 'line-clamp-2'}`}>
            {post.excerpt || "Confira os detalhes desta oferta incrível e aproveite para economizar!"}
          </p>

          {/* Footer: Author/Brand & CTA */}
          <div className="mt-auto flex items-end justify-between border-t border-gray-100 dark:border-slate-800 pt-3">
            <div className="flex flex-col">
              <span className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-[0.2em]">
                Fábrica de Cupons
              </span>
            </div>

            <div className={`flex items-center gap-1 text-[10px] sm:text-xs font-bold uppercase tracking-wider transition-transform group-hover:translate-x-1 ${getHoverColor().replace('group-hover:', '')}`}>
              {isInformative ? 'Ler Artigo' : couponCount > 0 ? 'Pegar Cupom' : 'Ver Oferta'}
              <ArrowRight size={14} />
            </div>
          </div>
        </div>
      </Link>

      <style jsx global>{`
        @keyframes heart-pop {
          0% { transform: scale(0); opacity: 0; }
          50% { transform: scale(1.2); opacity: 1; }
          100% { transform: scale(1); opacity: 0; }
        }
        .animate-heart-pop { animation: heart-pop 0.8s cubic-bezier(0, 0, 0.2, 1); }
      `}</style>
    </div>
  );
};

export default PostCardHorizontal;
