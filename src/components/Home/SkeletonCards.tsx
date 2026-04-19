import React from 'react';

export const ProductSkeleton: React.FC = () => (
  <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden h-full flex flex-col">
    <div className="relative aspect-square bg-gray-200 dark:bg-slate-700/50 animate-pulse"></div>
    <div className="p-4 flex flex-col flex-1 gap-3">
      <div className="flex items-center gap-2">
         <div className="w-6 h-6 rounded-full bg-gray-200 dark:bg-slate-700/50 animate-pulse"></div>
         <div className="h-3 w-20 bg-gray-200 dark:bg-slate-700/50 rounded animate-pulse"></div>
      </div>
      <div className="h-4 w-full bg-gray-200 dark:bg-slate-700/50 rounded animate-pulse"></div>
      <div className="h-4 w-2/3 bg-gray-200 dark:bg-slate-700/50 rounded animate-pulse"></div>
      <div className="mt-auto pt-2">
        <div className="h-8 w-1/2 bg-gray-200 dark:bg-slate-700/50 rounded animate-pulse"></div>
      </div>
    </div>
  </div>
);

export const CouponSkeleton: React.FC = () => (
  <div className="relative w-full h-[140px] flex rounded-[18px] overflow-hidden border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 shadow-sm">
    {/* Left Part */}
    <div className="flex-[1.5] p-6 flex flex-col justify-between">
      <div className="flex gap-2 mb-2">
        <div className="h-4 w-16 bg-gray-200 dark:bg-slate-700/50 rounded-full animate-pulse"></div>
        <div className="h-4 w-20 bg-gray-200 dark:bg-slate-700/50 rounded-full animate-pulse"></div>
      </div>
      <div className="h-6 w-3/4 bg-gray-200 dark:bg-slate-700/50 rounded animate-pulse mb-2"></div>
      <div className="h-8 w-1/3 bg-gray-200 dark:bg-slate-700/50 rounded animate-pulse"></div>
    </div>

    {/* Divider */}
    <div className="relative w-6 h-full flex flex-col items-center justify-center">
      <div className="absolute -top-3 w-6 h-6 bg-gray-50 dark:bg-slate-900 rounded-full z-10 border-b border-gray-200 dark:border-slate-700"></div>
      <div className="h-full border-l-2 border-dashed border-gray-200 dark:border-slate-700"></div>
      <div className="absolute -bottom-3 w-6 h-6 bg-gray-50 dark:bg-slate-900 rounded-full z-10 border-t border-gray-200 dark:border-slate-700"></div>
    </div>

    {/* Right Part */}
    <div className="flex-1 bg-gray-50 dark:bg-slate-800/50 p-6 flex flex-col items-center justify-center gap-3">
      <div className="w-full h-10 bg-gray-200 dark:bg-slate-700/50 rounded-xl animate-pulse"></div>
      <div className="w-full h-10 bg-gray-200 dark:bg-slate-700/50 rounded-xl animate-pulse"></div>
    </div>
  </div>
);

const SkeletonCards: React.FC<{ count?: number; type?: 'product' | 'coupon' }> = ({ count = 6, type = 'product' }) => {
  return (
    <div className={type === 'coupon' 
      ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8" 
      : "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 md:gap-8"
    }>
      {Array.from({ length: count }).map((_, index) => (
        type === 'coupon' ? <CouponSkeleton key={index} /> : <ProductSkeleton key={index} />
      ))}
    </div>
  );
};

export default SkeletonCards;