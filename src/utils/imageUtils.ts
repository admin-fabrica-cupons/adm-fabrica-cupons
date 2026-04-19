/**
 * Utilitários para lidar com imagens externas
 */

/**
 * Verifica se uma URL é externa (não local)
 */
export const isExternalImage = (src: string): boolean => {
  if (!src) return false;
  return src.startsWith('http') && !src.startsWith('/');
};

/**
 * Verifica se uma imagem deve usar unoptimized
 * - URLs externas sempre usam unoptimized
 * - SVGs sempre usam unoptimized
 * - placehold.co sempre usa unoptimized
 */
export const shouldUnoptimize = (src?: string): boolean => {
  if (!src) return false;
  
  return (
    isExternalImage(src) ||
    src.endsWith('.svg') ||
    src.includes('placehold.co') ||
    src.includes('cloudfront.net') ||
    src.includes('logodownload.org') ||
    src.includes('wikimedia.org') ||
    src.includes('mlstatic.com') ||
    src.includes('postimg.cc')
  );
};

/**
 * Obtém props padrão para imagens externas
 */
export const getExternalImageProps = (src: string, alt: string) => {
  return {
    src,
    alt,
    unoptimized: shouldUnoptimize(src)
  };
};
