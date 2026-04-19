import React, { useState, useMemo } from 'react';
import Image from 'next/image';
import { Copy, CheckCircle, Clock, Calendar } from 'lucide-react';
import { STORE_THEMES, calculateExpiryStatus, PARTNER_STORES } from '../../constants';
import { CouponBlock } from '../../types';

interface CouponWidgetProps {
  data: CouponBlock;
  compact?: boolean;
  className?: string;
  layout?: 'horizontal' | 'vertical';
}

const CouponWidget: React.FC<CouponWidgetProps> = ({ data, compact = false, className, layout = 'horizontal' }) => {
  const [copied, setCopied] = useState(false);
  const storeName = data.storeName || 'Parceiro';
  const resolvedThemeKey = STORE_THEMES[storeName]
    ? storeName
    : Object.keys(STORE_THEMES).find(key => key.toLowerCase() === storeName.toLowerCase());
  const theme = STORE_THEMES[resolvedThemeKey || 'Default'];
  const partnerKey = (Object.keys(PARTNER_STORES) as Array<keyof typeof PARTNER_STORES>)
    .find(key => key.toLowerCase() === storeName.toLowerCase());
  const partnerLogo = partnerKey ? PARTNER_STORES[partnerKey].logoUrl : undefined;
  
  const expiryStatus = useMemo(
    () => calculateExpiryStatus(data.expiryDate, data.expiryTime),
    [data.expiryDate, data.expiryTime]
  );
  
  const isExpired = data.isExpired || expiryStatus?.expired;
  const expiryBadge = isExpired
    ? {
        text: 'Expirado',
        className: 'bg-gray-100 text-gray-600 dark:bg-slate-900/80 dark:text-slate-200 border border-gray-200 dark:border-slate-700',
        urgent: false,
        icon: 'calendar'
      }
    : expiryStatus;
  const isVerticalLayout = layout === 'vertical';

  const handleCopy = () => {
    navigator.clipboard.writeText(data.couponCode || '');
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  };

  return (
    <div className={`not-prose relative transition-all duration-300 ${isExpired ? 'opacity-60 grayscale-[0.8]' : ''} ${compact ? '' : 'my-10'} ${className || ''}`}>
      {isExpired && (
        <div className="absolute inset-0 z-20 flex items-center justify-center pointer-events-none">
          <span className="text-4xl sm:text-5xl font-black text-red-600/80 border-4 sm:border-8 border-red-600/80 px-4 py-1 rounded-xl uppercase tracking-tighter -rotate-12 bg-white/10 backdrop-blur-sm">
            Expirado
          </span>
        </div>
      )}
      
      <div className={`${compact ? 'w-full' : 'max-w-4xl mx-auto w-full'}`}>
        <div className={`relative flex ${isVerticalLayout ? 'flex-col' : 'flex-col lg:flex-row'} w-full rounded-[18px] bg-gradient-to-br overflow-hidden min-h-[130px] border-transparent ${theme.container}`}>
          {partnerLogo && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-0">
              <div className="relative w-[40%] h-[40%] opacity-[0.07]">
                <Image
                  src={partnerLogo}
                  alt=""
                  fill
                  unoptimized
                  sizes="40vw"
                  className="object-contain"
                />
              </div>
            </div>
          )}
          
          {/* LADO ESQUERDO / TOPO: Conteúdo */}
          <div className="w-full lg:flex-[1.5] p-4 sm:p-6 relative flex flex-col justify-between min-w-0 z-10">
            <div>
              <div className="flex flex-wrap items-center justify-between mb-2 gap-x-2 gap-y-2">
                <div className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider whitespace-nowrap ${theme.badge}`}>
                  {storeName}
                </div>
                
                {expiryBadge && (
                  <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-tight shrink-0 shadow-sm border ${expiryBadge.className}`}>
                    {expiryBadge.icon === 'calendar' ? (
                      <Calendar size={12} className={`${expiryBadge.urgent ? 'animate-bounce' : ''}`} />
                    ) : (
                      <Clock size={12} className={`${expiryBadge.urgent ? 'animate-bounce' : ''}`} />
                    )}
                    <span className="truncate">{expiryBadge.text}</span>
                  </div>
                )}
              </div>

              <h4 className="text-lg sm:text-xl font-black leading-tight mb-1 truncate">{data.name}</h4>
              <div className="text-xs opacity-80 mb-2 font-medium line-clamp-2" dangerouslySetInnerHTML={{ __html: data.description || '' }} />
            </div>
            
            <div className="text-2xl sm:text-4xl font-black italic tracking-tighter drop-shadow-md mt-2">{data.discount}</div>
          </div>

          {isVerticalLayout ? (
            <div className="relative flex items-center justify-center h-4 w-full shrink-0 z-10">
              <div className="absolute -left-3 w-6 h-6 bg-white dark:bg-slate-800 rounded-full z-10"></div>
              <div className="absolute -right-3 w-6 h-6 bg-white dark:bg-slate-800 rounded-full z-10"></div>
              <div className="w-[80%] h-px border-t-2 border-dashed border-black/20 dark:border-white/40"></div>
            </div>
          ) : (
            <div className="relative flex flex-row lg:flex-col items-center justify-center h-4 lg:h-auto w-full lg:w-6 shrink-0 z-10">
              <div className="absolute -left-3 lg:hidden w-6 h-6 bg-white dark:bg-slate-800 rounded-full z-10"></div>
              <div className="absolute -right-3 lg:hidden w-6 h-6 bg-white dark:bg-slate-800 rounded-full z-10"></div>
              <div className="hidden lg:block absolute -top-3 w-6 h-6 bg-white dark:bg-slate-800 rounded-full shadow-inner z-10"></div>
              <div className="hidden lg:block absolute -bottom-3 w-6 h-6 bg-white dark:bg-slate-800 rounded-full shadow-inner z-10"></div>
              <div className="w-[80%] lg:w-px h-px lg:h-[80%] border-t-2 lg:border-t-0 lg:border-l-2 border-dashed border-black/20 dark:border-white/40"></div>
            </div>
          )}

          {/* LADO DIREITO / BAIXO: Ações */}
          <div className={`w-full ${isVerticalLayout ? '' : 'lg:w-[220px]'} p-4 sm:p-6 flex ${isVerticalLayout ? 'flex-col' : 'flex-row lg:flex-col'} justify-center items-center gap-3 bg-black/5 dark:bg-black/5 overflow-hidden z-10`}>
            <button
              onClick={handleCopy}
              disabled={isExpired}
              className={`w-fit lg:w-full flex items-center justify-between px-4 py-3 rounded-xl border-2 border-dashed transition-all font-mono text-xs sm:text-sm font-medium ${theme.code} ${copied ? 'border-green-500 text-green-600' : ''}`}
            >
              <span className="truncate uppercase mr-2">{data.couponCode || 'PROMO'}</span>
              {copied ? <CheckCircle size={16} /> : <Copy size={16} className="opacity-40" />}
            </button>

            <a
              href={isExpired ? undefined : data.affiliateLink}
              target="_blank"
              className={`flex-1 lg:flex-none lg:w-full flex items-center justify-center gap-2 py-3.5 rounded-xl font-semibold text-xs sm:text-[11px] uppercase tracking-widest transition-all shadow-lg active:scale-95 text-center ${isExpired ? 'bg-gray-500/50 cursor-not-allowed text-white/50' : theme.button}`}
            >
              {data.affiliateButtonText || 'Ativar Cupom'}
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CouponWidget;
