'use client';

import React from 'react';
import Image, { ImageProps } from 'next/image';

interface ExternalImageProps extends ImageProps {
  src: string;
  alt: string;
  // Sempre unoptimized para imagens externas
}

const ExternalImage: React.FC<ExternalImageProps> = ({ src, alt, ...props }) => {
  const normalizedSrc = src.trim();
  const isExternal = normalizedSrc.startsWith('http://') || normalizedSrc.startsWith('https://');

  return (
    <Image
      {...props}
      src={normalizedSrc}
      alt={alt}
      loader={({ src: imageSrc }) => imageSrc}
      unoptimized={isExternal ? true : props.unoptimized}
    />
  );
};

export default ExternalImage;
