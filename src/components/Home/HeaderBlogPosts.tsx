'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { BlogPost } from '@/types';
import { useCategoryIcons } from '@/hooks/useCategoryIcons';
import { getPostTimeAgo } from '@/utils/dateUtils';
import { Clock, ArrowRight, Zap } from 'lucide-react';
import { cn } from '@/lib/utils';

interface HeaderBlogPostsProps {
  posts: BlogPost[];
}

const HeaderPostCard = ({ 
  post, 
  size = 'small', 
  className 
}: { 
  post: BlogPost; 
  size?: 'large' | 'medium' | 'small' | 'tall';
  className?: string;
}) => {
  const { getCategoryIcon } = useCategoryIcons();
  const timeAgo = getPostTimeAgo(post.publishedAt, post.date);

  // Helper logic from PostCard.tsx
  const couponCount = post.totalCoupons ?? (post.blocks?.filter(b => b.type === 'coupon' || b.type === 'coupon_list').length || 0);
  const hasHotProduct = post.hasHotProduct ?? (post.blocks?.some((b: any) => b.type === 'hot_product') || false);
  const isInformative = post.isInformativePost || false;

  // Determine theme colors based on post type
  const getThemeStyles = () => {
    const base = 'backdrop-blur-md shadow-sm border border-white/10 relative overflow-hidden group/tag transition-all duration-300';
    
    if (isInformative) {
      return {
        tag: `${base} text-cyan-100 bg-cyan-900/40 border-cyan-500/30`,
        gradient: 'from-cyan-900/80 via-transparent to-transparent',
        hoverBorder: 'group-hover:border-cyan-500/50',
        hoverShadow: 'group-hover:shadow-cyan-500/20',
        accent: 'bg-cyan-500'
      };
    }
    if (hasHotProduct) {
      return {
        tag: `${base} text-orange-100 bg-orange-900/40 border-orange-500/30`,
        gradient: 'from-orange-900/80 via-transparent to-transparent',
        hoverBorder: 'group-hover:border-orange-500/50',
        hoverShadow: 'group-hover:shadow-orange-500/20',
        accent: 'bg-orange-500'
      };
    }
    if (couponCount > 0) {
      return {
        tag: `${base} text-emerald-100 bg-emerald-900/40 border-emerald-500/30`,
        gradient: 'from-emerald-900/80 via-transparent to-transparent',
        hoverBorder: 'group-hover:border-emerald-500/50',
        hoverShadow: 'group-hover:shadow-emerald-500/20',
        accent: 'bg-emerald-500'
      };
    }
    return {
      tag: `${base} text-blue-100 bg-blue-900/40 border-blue-500/30`,
      gradient: 'from-blue-900/80 via-transparent to-transparent',
      hoverBorder: 'group-hover:border-blue-500/50',
      hoverShadow: 'group-hover:shadow-blue-500/20',
      accent: 'bg-blue-500'
    };
  };

  const theme = getThemeStyles();

  return (
    <Link 
      href={`/post/${post.id}`} 
      className={cn(
        "group relative w-full h-full block overflow-hidden rounded-3xl shadow-lg transition-all duration-500 border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900",
        theme.hoverBorder,
        theme.hoverShadow,
        "hover:shadow-2xl hover:-translate-y-1",
        className
      )}
    >
      {/* Background Image with Zoom Effect */}
      <div className="absolute inset-0 z-0">
         {post.thumbnail ? (
            <Image
              src={post.thumbnail}
              alt={post.title}
              fill
              className="object-cover transition-transform duration-700 group-hover:scale-110"
              sizes={size === 'large' ? "(max-width: 768px) 100vw, 66vw" : "(max-width: 768px) 100vw, 33vw"}
              priority={size === 'large'}
            />
         ) : (
            <div className="w-full h-full bg-gradient-to-br from-slate-800 to-slate-900" />
         )}
         
         {/* Gradient Overlay - Always legible text */}
         <div className={cn(
           "absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent opacity-80 transition-opacity duration-300 group-hover:opacity-90",
           size === 'large' ? "via-black/40" : "via-black/60"
         )} />
         
         {/* Accent Gradient for visual flair */}
         <div className={cn(
            "absolute inset-0 bg-gradient-to-tr opacity-0 group-hover:opacity-30 transition-opacity duration-500 mix-blend-overlay",
            theme.gradient
         )} />
      </div>
      
      {/* Content Container */}
      <div className="absolute inset-0 p-5 sm:p-6 md:p-8 flex flex-col justify-between z-10 h-full">
        
        {/* Top: Badges */}
        <div className="flex flex-wrap items-start gap-2">
            <span className={cn(
              "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] sm:text-xs font-bold uppercase tracking-wide backdrop-blur-md",
              theme.tag
            )}>
              {getCategoryIcon(post.category, 14, "text-current")}
              {post.category}
            </span>
            
            {hasHotProduct && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] sm:text-xs font-bold uppercase tracking-wide bg-orange-500/20 text-orange-200 border border-orange-500/30 backdrop-blur-md">
                <Zap size={12} className="text-orange-400" />
                Oferta
              </span>
            )}
        </div>

        {/* Bottom: Title & Meta */}
        <div className="flex flex-col gap-3">
            {/* Date */}
            <span className="flex items-center gap-1.5 text-xs text-slate-300 font-medium" suppressHydrationWarning>
              <Clock size={12} />
              {timeAgo}
            </span>

            {/* Title */}
            <h3 className={cn(
              "font-bold text-white leading-tight group-hover:text-white transition-colors drop-shadow-sm line-clamp-3",
              size === 'large' ? "text-2xl sm:text-3xl md:text-4xl lg:text-5xl tracking-tight mb-2" : 
              size === 'medium' || size === 'tall' ? "text-xl sm:text-2xl" :
              "text-lg sm:text-xl"
            )}>
              {post.title}
            </h3>

            {/* View Button (Visible on Hover for Large, always for others if needed) */}
            <div className={cn(
              "flex items-center gap-2 text-sm font-semibold text-white/90 opacity-0 transform translate-y-4 transition-all duration-300 group-hover:opacity-100 group-hover:translate-y-0",
              size === 'small' && "hidden sm:flex"
            )}>
              <span>Ler artigo completo</span>
              <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
            </div>
        </div>
      </div>
    </Link>
  );
};

const HeaderBlogPosts: React.FC<HeaderBlogPostsProps> = ({ posts }) => {
  if (!posts || posts.length === 0) return null;

  // Distribute posts based on count
  const mainPost = posts[0];
  const post2 = posts[1];
  const post3 = posts[2];
  const post4 = posts[3];

  return (
    <div className="w-full mx-auto mt-8 mb-12">
      {/* Grid Layout Logic */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 auto-rows-[300px] lg:auto-rows-[280px]">
        
        {/* Main Post: Always takes significant space */}
        {/* If 4 posts: 2x2 cols (Large square) */}
        {mainPost && (
            <div className={cn(
              "col-span-1 md:col-span-2 lg:col-span-2 row-span-2 h-full",
              !post2 && "lg:col-span-4", // If only 1 post, full width
              post2 && !post3 && "lg:col-span-2", // If 2 posts, half/half
            )}>
                <HeaderPostCard post={mainPost} size="large" />
            </div>
        )}

        {/* Post 2 */}
        {post2 && (
            <div className={cn(
              "col-span-1 md:col-span-1 lg:col-span-1 h-full",
              !post3 ? "row-span-2 lg:col-span-2" : "row-span-2", // If 2 posts, take other half. If 3+, standard column
              post4 && "lg:row-span-2" // If 4 posts, make this one tall (1x2)
            )}>
               <HeaderPostCard 
                 post={post2} 
                 size={!post3 ? "medium" : post4 ? "tall" : "medium"} 
               />
            </div>
        )}

        {/* Post 3 & 4 Container or Individual Cells */}
        {/* If 3 posts: Post 3 takes last slot (1x2) */}
        {post3 && !post4 && (
             <div className="col-span-1 md:col-span-1 lg:col-span-1 row-span-2 h-full">
                <HeaderPostCard post={post3} size="medium" />
             </div>
        )}

        {/* If 4 posts: Post 3 (Top Right) and Post 4 (Bottom Right) */}
        {post3 && post4 && (
            <div className="col-span-1 lg:col-span-1 row-span-2 flex flex-col gap-4 md:gap-6 h-full">
                <div className="flex-1 h-full">
                    <HeaderPostCard post={post3} size="small" />
                </div>
                <div className="flex-1 h-full">
                    <HeaderPostCard post={post4} size="small" />
                </div>
            </div>
        )}
      </div>

      {/* Decorative Element below header */}
      <div className="mt-12 flex items-center gap-4">
        <div className="h-px flex-1 bg-gradient-to-r from-transparent via-gray-200 dark:via-gray-700 to-transparent" />
        <span className="text-xs font-medium text-gray-400 uppercase tracking-widest">Destaques</span>
        <div className="h-px flex-1 bg-gradient-to-r from-transparent via-gray-200 dark:via-gray-700 to-transparent" />
      </div>
    </div>
  );
};

export default HeaderBlogPosts;
