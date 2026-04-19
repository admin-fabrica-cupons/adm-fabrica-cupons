/**
 * Utilitários para otimização de imagens
 */

export const getOptimizedImageUrl = (url: string, width: number, quality: number = 75): string => {
  // Se for uma URL do Supabase, adicionar parâmetros de transformação
  if (url.includes('supabase.co')) {
    const urlObj = new URL(url);
    urlObj.searchParams.set('width', width.toString());
    urlObj.searchParams.set('quality', quality.toString());
    return urlObj.toString();
  }
  
  return url;
};

export const getResponsiveSizes = (breakpoints: {
  mobile?: number;
  tablet?: number;
  desktop?: number;
}) => {
  const { mobile = 100, tablet = 50, desktop = 33 } = breakpoints;
  return `(max-width: 640px) ${mobile}vw, (max-width: 1024px) ${tablet}vw, ${desktop}vw`;
};

export const preloadCriticalImages = (images: string[]) => {
  if (typeof window === 'undefined') return;
  
  images.forEach(src => {
    const link = document.createElement('link');
    link.rel = 'preload';
    link.as = 'image';
    link.href = src;
    link.fetchPriority = 'high';
    document.head.appendChild(link);
  });
};
