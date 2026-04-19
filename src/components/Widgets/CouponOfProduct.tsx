'use client';

import React, { useState } from 'react';
import { Copy, Check } from 'lucide-react';

interface CouponOfProductProps {
    couponCode: string;
    couponName?: string;
    isExpired?: boolean;
    variant?: 'blue' | 'orange';
    compact?: boolean;
    align?: 'start' | 'center' | 'end';
    hideCode?: boolean;
}

const CouponOfProduct: React.FC<CouponOfProductProps> = ({
    couponCode,
    couponName,
    isExpired = false,
    variant = 'blue',
    compact = false,
    align = 'start',
    hideCode = false
}) => {
    const [copied, setCopied] = useState(false);

    const handleCopyCoupon = (e: React.MouseEvent, code: string) => {
        e.preventDefault();
        e.stopPropagation();
        if (!code) return;
        navigator.clipboard.writeText(code);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const bgClass = variant === 'orange' ? 'bg-orange-50 dark:bg-orange-950/20' : 'bg-blue-50 dark:bg-blue-950/20';
    const textClass = variant === 'orange' ? 'text-orange-700 dark:text-orange-300' : 'text-blue-700 dark:text-blue-300';
    const borderClass = variant === 'orange' ? 'border-orange-100 dark:border-orange-900/30' : 'border-blue-100 dark:border-blue-900/30';
    
    const alignClass = align === 'start' ? 'items-start' : align === 'end' ? 'items-end' : 'items-center';

    if (!couponCode || hideCode || !couponName) return null;

    return (
        <div className={`flex flex-col w-full ${alignClass}`}>
            <div 
                onClick={(e) => handleCopyCoupon(e, couponCode)}
                className={`relative cursor-pointer group flex items-center justify-between px-3 py-1.5 ${bgClass} ${borderClass} border ${isExpired ? 'grayscale opacity-60' : ''} rounded-md transition-all hover:scale-[1.02] active:scale-95 w-fit ${align === 'center' ? 'mx-auto' : ''} shadow-sm my-1`}
            >
                {!copied ? (
                    <>
                        <span className={`text-[11px] font-black uppercase tracking-wider ${textClass}`}>
                            {isExpired ? 'Expirado' : couponName}
                        </span>
                        <div className={`ml-3 pl-3 border-l ${borderClass}`}>
                            <Copy size={12} className={`opacity-60 group-hover:opacity-100 transition-opacity ${textClass}`} />
                        </div>
                    </>
                ) : (
                    <div className="flex items-center gap-1.5 text-green-600 dark:text-green-400 font-bold text-[11px] animate-in fade-in zoom-in duration-200">
                        <Check size={14} /> Copiado!
                    </div>
                )}
            </div>
        </div>
    );
};

export default CouponOfProduct;
