import React, { useState } from 'react';
import Image, { ImageProps } from 'next/image';

interface SafeImageProps extends Omit<ImageProps, 'onError'> {
  fallbackSrc?: string;
}

/**
 * Componente SafeImage - Wrapper do Next.js Image com fallback automático
 * 
 * Resolve problemas de imagens quebradas do Supabase ou outras fontes externas
 * fornecendo uma imagem de fallback quando o carregamento falha.
 */
const SafeImage: React.FC<SafeImageProps> = ({ 
  src, 
  fallbackSrc = 'https://placehold.co/600x400/e2e8f0/64748b?text=Imagem+Indisponivel',
  alt,
  ...props 
}) => {
  // Garantir que src seja sempre uma string válida
  const initialSrc = src || fallbackSrc;
  const [imgSrc, setImgSrc] = useState(initialSrc);
  const [hasError, setHasError] = useState(false);

  const handleError = () => {
    if (!hasError && imgSrc !== fallbackSrc) {
      console.warn(`Falha ao carregar imagem: ${imgSrc}`);
      setHasError(true);
      setImgSrc(fallbackSrc);
    }
  };

  // Validar se a URL é válida antes de tentar carregar
  const isValidUrl = (url: string | undefined): boolean => {
    if (!url || typeof url !== 'string' || url.trim() === '') return false;
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  };

  // Se a URL não for válida, usar fallback imediatamente
  const finalSrc = isValidUrl(imgSrc) ? imgSrc : fallbackSrc;

  return (
    <Image
      {...props}
      src={finalSrc}
      alt={alt || 'Imagem'}
      onError={handleError}
    />
  );
};

export default SafeImage;
