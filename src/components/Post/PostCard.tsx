// PostCard.tsx
'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { BlogPost } from '../../types';
import { Clock, Ticket, ShoppingBag, Tag, Flame, Heart, BookOpen, ArrowRight, Sparkles, Zap, Gift, TrendingUp, Lightbulb } from 'lucide-react';
import { HiOutlineBookOpen } from 'react-icons/hi';
import { useCategoryIcons } from '../../hooks/useCategoryIcons';
import { getPostTimeAgo } from '../../utils/dateUtils';

interface PostCardProps {
  post: BlogPost;
}

const PostCard: React.FC<PostCardProps> = ({ post }) => {
  const [isFavorite, setIsFavorite] = useState(false);
  const [touchCount, setTouchCount] = useState(0);
  const [showFavoriteAnimation, setShowFavoriteAnimation] = useState(false);
  const [isDarkImage] = useState<boolean | null>(null);
  const { getCategoryIcon } = useCategoryIcons();

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchCount(prev => prev + 1);
  };

  useEffect(() => {
    const favorites = JSON.parse(localStorage.getItem('favorites') || '[]');
    setIsFavorite(favorites.includes(post.id));
  }, [post.id]);

  // Observação: a análise de luminosidade via canvas por card custava CPU e piorava a interação no mobile.
  // Mantemos o visual usando o modo "auto" (classes com suporte a light/dark).

  const toggleFavorite = (e: React.MouseEvent | React.TouchEvent) => {
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
      setTimeout(() => setShowFavoriteAnimation(false), 800);
    }

    localStorage.setItem('favorites', JSON.stringify(newFavorites));
    window.dispatchEvent(new CustomEvent('favoritesUpdated'));
  };

  const couponCount = post.totalCoupons ?? (post.blocks?.filter(b => b.type === 'coupon' || b.type === 'coupon_list').length || 0);
  const hasHotProduct = post.hasHotProduct ?? (post.blocks?.some((b: any) => b.type === 'hot_product') || false);
  const isInformative = post.isInformativePost || false;
  const favoriteParticles = useMemo(() => {
    const base = String(post.id || '').split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return Array.from({ length: 6 }, (_, i) => {
      const seed = base + i * 97;
      const rand = (offset: number) => {
        const x = Math.sin(seed + offset) * 10000;
        return x - Math.floor(x);
      };
      return {
        tx: (rand(1) - 0.5) * 100,
        ty: -rand(2) * 100 - 20,
        rot: (rand(3) - 0.5) * 60,
        delay: i * 0.05,
        size: rand(4) * 10 + 10
      };
    });
  }, [post.id]);

  // Determinar tema do card
  let borderColor, shadowEffect, buttonColor, badgeBg, badgeIcon;
  
  if (isInformative) {
    borderColor = 'border-cyan-400 dark:border-cyan-600';
    shadowEffect = 'shadow-lg shadow-cyan-500/20 hover:shadow-xl hover:shadow-cyan-500/30';
    buttonColor = 'bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 border-cyan-400 dark:border-cyan-600';
    badgeBg = 'bg-gradient-to-r from-cyan-500 to-blue-600';
    badgeIcon = <Lightbulb size={12} className="text-cyan-100" />;
  } else if (hasHotProduct) {
    borderColor = 'border-orange-500/70 dark:border-orange-600/70';
    shadowEffect = 'shadow-lg shadow-orange-500/20 hover:shadow-xl hover:shadow-orange-500/30';
    buttonColor = 'bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 border-orange-400 dark:border-orange-600';
    badgeBg = 'bg-gradient-to-r from-orange-500 via-orange-600 to-orange-500';
    badgeIcon = <Flame size={12} className="text-orange-100" />;
  } else if (couponCount > 0) {
    borderColor = 'border-emerald-500/70 dark:border-emerald-600/70';
    shadowEffect = 'shadow-lg shadow-emerald-500/20 hover:shadow-xl hover:shadow-emerald-500/30';
    buttonColor = 'bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 border-emerald-400 dark:border-emerald-600';
    badgeBg = 'bg-gradient-to-r from-emerald-500 to-emerald-600';
    badgeIcon = <Ticket size={12} className="text-emerald-100" />;
  } else {
    borderColor = 'border-blue-600/70 dark:border-blue-500/70';
    shadowEffect = 'shadow-lg shadow-blue-700/20 dark:shadow-blue-500/30 hover:shadow-xl hover:shadow-blue-700/30 dark:hover:shadow-blue-500/40';
    buttonColor = 'bg-gradient-to-r from-blue-700 to-blue-800 hover:from-blue-800 hover:to-blue-900 border-blue-600 dark:border-blue-700';
    badgeBg = 'bg-gradient-to-r from-blue-700 to-blue-800';
    badgeIcon = <ShoppingBag size={12} className="text-blue-100" />;
  }

  // Função para obter cor da categoria baseada no tema
  const getCategoryColor = () => {
    const variant = isDarkImage === null ? 'auto' : isDarkImage ? 'onDark' : 'onLight';
    const base = 'border border-white/10 shadow-sm';

    if (isInformative) {
      if (variant === 'onLight') {
        return `${base} text-cyan-900 bg-gradient-to-r from-cyan-100/95 to-blue-100/95`;
      }
      if (variant === 'onDark') {
        return `${base} text-cyan-100 bg-gradient-to-r from-cyan-600/80 to-blue-600/80`;
      }
      return `${base} text-cyan-900 dark:text-cyan-100 bg-gradient-to-r from-cyan-100/95 to-blue-100/95 dark:from-cyan-600/70 dark:to-blue-600/70`;
    }

    if (hasHotProduct) {
      if (variant === 'onLight') {
        return `${base} text-orange-900 bg-gradient-to-r from-orange-100/95 to-amber-100/95`;
      }
      if (variant === 'onDark') {
        return `${base} text-orange-100 bg-gradient-to-r from-orange-600/80 to-amber-600/80`;
      }
      return `${base} text-orange-900 dark:text-orange-100 bg-gradient-to-r from-orange-100/95 to-amber-100/95 dark:from-orange-600/70 dark:to-amber-600/70`;
    }

    if (couponCount > 0) {
      if (variant === 'onLight') {
        return `${base} text-emerald-900 bg-gradient-to-r from-emerald-100/95 to-green-100/95`;
      }
      if (variant === 'onDark') {
        return `${base} text-emerald-100 bg-gradient-to-r from-emerald-600/80 to-green-600/80`;
      }
      return `${base} text-emerald-900 dark:text-emerald-100 bg-gradient-to-r from-emerald-100/95 to-green-100/95 dark:from-emerald-600/70 dark:to-green-600/70`;
    }

    if (variant === 'onLight') {
      return `${base} text-blue-900 bg-gradient-to-r from-blue-100/95 to-indigo-100/95`;
    }
    if (variant === 'onDark') {
      return `${base} text-blue-100 bg-gradient-to-r from-blue-700/80 to-indigo-700/80`;
    }
    return `${base} text-blue-900 dark:text-blue-100 bg-gradient-to-r from-blue-100/95 to-indigo-100/95 dark:from-blue-700/70 dark:to-indigo-700/70`;
  };

  return (
    <div className="relative group" onTouchStart={handleTouchStart}>
      {showFavoriteAnimation && (
        <div className="absolute inset-0 z-40 pointer-events-none overflow-hidden rounded-2xl">
          {/* Main Burst */}
          <div className="absolute top-3 left-3 w-8 h-8 -translate-x-1/4 -translate-y-1/4 bg-pink-500/30 rounded-full animate-fav-burst"></div>
          
          {/* Floating Hearts Particles */}
          {favoriteParticles.map((particle, i) => (
            <div
              key={i}
              className="absolute top-3 left-3 text-pink-500 animate-fav-particle"
              style={{
                '--tx': `${particle.tx}px`,
                '--ty': `${particle.ty}px`,
                '--rot': `${particle.rot}deg`,
                '--delay': `${particle.delay}s`,
                fontSize: `${particle.size}px`
              } as React.CSSProperties}
            >
              <Heart fill="currentColor" />
            </div>
          ))}
        </div>
      )}
      {(hasHotProduct || couponCount > 0 || isInformative) && (
        <div className={`absolute inset-0 rounded-2xl -z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-500 ${
          isInformative ? 'bg-gradient-to-r from-cyan-500/10 via-cyan-400/5 to-cyan-500/10' :
          hasHotProduct ? 'bg-gradient-to-r from-orange-500/10 via-orange-400/5 to-orange-500/10' : 
          'bg-gradient-to-r from-emerald-500/10 via-emerald-400/5 to-emerald-500/10'
        }`}></div>
      )}

      <Link
        href={`/post/${post.id}`}
        prefetch={true}
        className={`group flex flex-col h-full relative bg-transparent rounded-lg bg-white dark:bg-transparent border ${borderColor} ${shadowEffect} overflow-hidden transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]`}
        onClick={(e) => {
          // Show loading indicator
          const target = e.currentTarget;
          target.style.opacity = '0.6';
          target.style.pointerEvents = 'none';
        }}
      >
        <button
          onClick={toggleFavorite}
          className={`absolute top-3 left-3 z-30 p-2 rounded-full backdrop-blur-md transition-all duration-300 shadow-lg group/fav ${
            isFavorite 
              ? 'bg-red-50 dark:bg-red-950/30 scale-110' 
              : 'bg-white/90 dark:bg-slate-800/90 hover:bg-white dark:hover:bg-slate-700'
          }`}
          title={isFavorite ? 'Remover dos favoritos' : 'Adicionar aos favoritos'}
        >
          {isFavorite ? (
            <Heart className="w-4 h-4 text-red-500 fill-current animate-fav-pop" />
          ) : (
            <Heart className="w-4 h-4 text-gray-500 group-hover/fav:text-red-400 group-hover/fav:scale-110 transition-transform" />
          )}
        </button>

        {(couponCount > 0 || hasHotProduct || isInformative) && (
          <div className="absolute top-3 right-3 z-20 flex flex-col gap-2 items-end">
            {hasHotProduct && (
              <div className="relative">
                <div className="flex items-center gap-1.5 bg-gradient-to-r from-orange-500 via-orange-600 to-orange-500 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-lg border border-orange-400 animate-pulse shadow-orange-500/30">
                  <Flame size={12} className="text-orange-100" />
                  <span className="bg-gradient-to-r from-orange-50 to-orange-100 bg-clip-text text-transparent">
                    IMPERDÍVEL
                  </span>
                </div>
                <div className="absolute inset-0 rounded-full bg-orange-400/30 blur-sm -z-10 animate-ping" style={{ animationDuration: '1.5s' }}></div>
              </div>
            )}

            {couponCount > 0 && (
              <div className="flex items-center gap-1.5 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-lg border border-emerald-400 shadow-emerald-500/30">
                <Ticket size={12} className="text-emerald-100" />
                <span className="bg-gradient-to-r from-emerald-50 to-emerald-100 bg-clip-text text-transparent">
                  {couponCount > 1 ? `${couponCount} CUPONS` : 'CUPOM'}
                </span>
              </div>
            )}

            {isInformative && (
              <div className="flex items-center gap-1.5 bg-gradient-to-r from-cyan-500 to-blue-600 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-lg border border-cyan-400 shadow-cyan-500/30">
                <Lightbulb size={12} className="text-cyan-100" />
                <span className="bg-gradient-to-r from-cyan-50 to-blue-100 bg-clip-text text-transparent">
                  INFORMATIVO
                </span>
              </div>
            )}
          </div>
        )}

        <div className="relative w-full aspect-[4/3] overflow-hidden bg-gray-100 dark:bg-slate-700 group">
          <Image
            src={post.thumbnail}
            alt={post.title}
            width={400}
            height={300}
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            unoptimized={post.thumbnail?.includes('placehold.co')}
            loading="lazy"
            priority={false}
            className="object-cover object-center transition-transform duration-500 ease-out group-hover:scale-110 w-full h-full"
          />

          <div className="absolute bottom-3 left-3">
            <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wide backdrop-blur-md shadow-sm 
      transition-all duration-300 group-hover:bg-white/90 dark:group-hover:bg-black/60 
      group-hover:backdrop-blur- relative overflow-hidden ${getCategoryColor()}`}>

              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent 
        -translate-x-full transition-transform duration-700 ease-out group-hover:translate-x-full">
              </div>

              <span className="relative z-10 flex items-center gap-1.5">
                {getCategoryIcon(post.category, 14, "")}
                {post.category}
              </span>
            </span>
          </div>
        </div>

        <div className="p-6 flex-1 flex flex-col">

          <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400" suppressHydrationWarning>
            <Clock size={12} />
            <span>
              {getPostTimeAgo(post.publishedAt, post.date)}
            </span>
          </div>

          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-3 leading-snug transition-colors line-clamp-2">
            {post.title}
          </h3>

          <p className="text-gray-600 dark:text-gray-300 text-sm line-clamp-3 mb-6 flex-1">
            {post.excerpt}
          </p>

          <div className="mt-auto pt-4 border-t border-slate-800/40 dark:border-slate-500/80">
            <div className={`w-full flex items-center justify-center gap-2 py-2.5 rounded-xl font-bold text-sm transition-all duration-300 ${buttonColor} text-white hover:shadow-md group/cta`}>
              {isInformative ? (
                <>
                  Ler Artigo <BookOpen className="w-4 h-4 text-white/90 group-hover/cta:animate-pulse" />
                </>
              ) : couponCount > 0 ? (
                <>
                  Pegar Cupom <Gift className="w-4 h-4 text-white/90 group-hover/cta:animate-bounce" />
                </>
              ) : hasHotProduct ? (
                <>
                  Ver Oferta <Zap className="w-4 h-4 text-white/90 group-hover/cta:animate-pulse" />
                </>
              ) : (
                <>
                  Ver Oferta <TrendingUp className="w-4 h-4 text-white/90 group-hover/cta:animate-pulse" />
                </>
              )}
            </div>
          </div>
        </div>
      </Link>

      <style>{`
    @keyframes fav-burst {
      0% { transform: scale(0); opacity: 0.8; }
      100% { transform: scale(4); opacity: 0; }
    }
    @keyframes fav-particle {
      0% { transform: translate(0, 0) scale(1) rotate(0); opacity: 1; }
      100% { transform: translate(var(--tx), var(--ty)) scale(0) rotate(var(--rot)); opacity: 0; }
    }
    @keyframes fav-pop {
      0% { transform: scale(1); }
      50% { transform: scale(1.4); }
      100% { transform: scale(1.1); }
    }
    .animate-fav-burst { animation: fav-burst 0.6s ease-out forwards; }
    .animate-fav-particle { animation: fav-particle 0.8s ease-out var(--delay) forwards; }
    .animate-fav-pop { animation: fav-pop 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275); }
  `}</style>
    </div>
  );
};

export default PostCard;
