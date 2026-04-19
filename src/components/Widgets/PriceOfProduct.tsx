import React from 'react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface PriceOfProductProps {
  price: string | number | undefined;
  originalPrice?: string | number | undefined;
  type?: 'current' | 'original';
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl';
}

const PriceOfProduct: React.FC<PriceOfProductProps> = ({
  price,
  originalPrice,
  type = 'current',
  className,
  size = 'md'
}) => {
  if (!price) return null;

  if (originalPrice && type === 'current') {
    return (
      <div className={cn("flex items-center gap-2", className)}>
        <PriceOfProduct price={originalPrice} type="original" size={size} />
        <PriceOfProduct price={price} type="current" size={size} />
      </div>
    );
  }

  const formatPriceParts = (priceString: string | number) => {
    const stringPrice = priceString.toString();
    const cleanPrice = stringPrice.replace(/^R\$\s?/, '').trim();
    const parts = cleanPrice.split(',');

    const value = parts[0];
    const cents = parts.length > 1 ? parts[1] : '00';

    return { symbol: 'R$', value, cents: (cents === '00' || cents === '') ? '' : cents };
  };

  if (type === 'original') {
    const formattedPrice = price.toString().replace(/^R\$\s?/, '').trim();
    const displayPrice = formattedPrice.startsWith('R$') ? formattedPrice : `R$ ${formattedPrice}`;

    return (
      <div className={cn("text-xs font-medium text-gray-400 line-through", className)}>
        {displayPrice}
      </div>
    );
  }

  // Current price
  const { value, cents } = formatPriceParts(price);

  const sizeClasses = {
    sm: { symbol: 'text-[10px]', value: 'text-xs', cents: 'text-[8px]' },
    md: { symbol: 'text-xs', value: 'text-base sm:text-lg', cents: 'text-[10px] sm:text-xs' },
    lg: { symbol: 'text-sm', value: 'text-lg sm:text-xl', cents: 'text-xs sm:text-sm' },
    xl: { symbol: 'text-base', value: 'text-xl sm:text-2xl', cents: 'text-sm sm:text-base' },
    '2xl': { symbol: 'text-lg', value: 'text-2xl sm:text-3xl', cents: 'text-base sm:text-lg' },
    '3xl': { symbol: 'text-xl', value: 'text-3xl sm:text-4xl', cents: 'text-lg sm:text-xl' },
  };

  const sizes = sizeClasses[size];

  return (
    <div className={cn("flex text-gray-900 dark:text-gray-100 gap-0 items-baseline", className)}>
      <span className={cn("font-medium mr-1", sizes.value)}>R$</span>
      <span className={cn("font-medium", sizes.value)}>{value}</span>
      {cents && cents !== '' && (
        <span className={cn("font-medium self-start ml-0.5 mt-0.5", sizes.cents)}>{cents}</span>
      )}
    </div>
  );
};

export default PriceOfProduct;
