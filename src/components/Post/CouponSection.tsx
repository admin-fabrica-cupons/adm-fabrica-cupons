import React, { useState, useMemo } from 'react';
import { Copy, CheckCircle } from 'lucide-react';
import { STORE_THEMES, calculateExpiryStatus } from '../../constants';

const CouponWidget = ({ data }: { data: any }) => {
  const [copied, setCopied] = useState(false);
  const storeName = data.storeName || 'Parceiro';
  const theme = STORE_THEMES[storeName] || STORE_THEMES['Default'];
  const expiryStatus = useMemo(
    () => calculateExpiryStatus(data.expiryDate, data.expiryTime),
    [data.expiryDate, data.expiryTime]
  );
  const isExpired = data.isExpired || expiryStatus?.expired;

  return (
    <div className={`relative my-4 transition-all duration-300 ${isExpired ? 'opacity-60 grayscale-[0.8]' : ''}`}>
      {/* Container Principal: Flex-row para manter a estrutura de cupom destacável */}
      <div className={`relative flex flex-row w-full rounded-[18px] bg-gradient-to-br shadow-xl overflow-hidden min-h-[160px] ${theme.container}`}>
        
        {/* LADO ESQUERDO: Conteúdo */}
        <div className="flex-[1.5] p-4 sm:p-6 relative flex flex-col justify-between min-w-0">
          <div>
            {/* AJUSTE DE RESPONSIVIDADE: 
                - flex-wrap: Permite quebra de linha em telas < 320px
                - gap-y-2: Espaçamento vertical quando houver quebra
            */}
            <div className="flex flex-wrap items-center justify-between mb-2 gap-x-2 gap-y-2">
              <div className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider whitespace-nowrap ${theme.badge}`}>
                {storeName}
              </div>
              
              {expiryStatus && (
                <div className={`flex items-center gap-1.5 px-2 py-1 rounded-full text-[9px] font-black uppercase tracking-tight shrink-0 ${expiryStatus.className}`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${expiryStatus.dot}`}></span>
                  <span className="truncate">{expiryStatus.text}</span>
                </div>
              )}
            </div>

            <h3 className="text-lg sm:text-xl font-black leading-tight mb-1 truncate">{data.name}</h3>
            {/* Escondemos a descrição em telas pequenas para manter o foco no desconto */}
            <div className="text-xs opacity-80 mb-2 font-medium line-clamp-2 hidden sm:block" dangerouslySetInnerHTML={{ __html: data.description }} />
          </div>
          
          <div className="text-2xl sm:text-4xl font-black italic tracking-tighter drop-shadow-md">{data.discount}</div>
        </div>

        {/* DIVISOR VERTICAL COM CORTES */}
        <div className="relative flex flex-col items-center justify-center w-4 sm:w-6 shrink-0">
          <div className="absolute -top-3 w-6 h-6 bg-white dark:bg-gray-900 rounded-full shadow-inner z-10"></div>
          <div className="h-[80%] w-px border-l-2 border-dashed border-black/20 dark:border-white/40"></div>
          <div className="absolute -bottom-3 w-6 h-6 bg-white dark:bg-gray-900 rounded-full shadow-inner z-10"></div>
        </div>

        {/* LADO DIREITO: Ações */}
        <div className="flex-1 max-w-[130px] sm:max-w-[220px] p-3 sm:p-4 flex flex-col justify-center gap-2 bg-black/5 dark:bg-black/5 backdrop-blur-sm">
          <button
            onClick={() => {
              navigator.clipboard.writeText(data.couponCode || '');
              setCopied(true);
              setTimeout(() => setCopied(false), 2000);
            }}
            disabled={isExpired}
            className={`w-full flex items-center justify-between px-2 py-2 sm:py-3 rounded-xl border-2 border-dashed transition-all font-mono text-[9px] sm:text-sm font-bold ${theme.code} ${copied ? 'border-green-500 scale-95 text-green-600' : ''}`}
          >
            <span className="truncate uppercase">{data.couponCode || 'PROMO'}</span>
            {copied ? <CheckCircle size={14} /> : <Copy size={14} className="opacity-40" />}
          </button>

          <a
            href={isExpired ? undefined : data.affiliateLink}
            target="_blank"
            className={`w-full flex items-center justify-center gap-2 py-2.5 sm:py-3.5 rounded-xl font-black text-[9px] sm:text-[11px] uppercase tracking-widest transition-all shadow-lg active:scale-95 text-center ${isExpired ? 'bg-gray-500/50 cursor-not-allowed text-white/50' : theme.button}`}
          >
            {data.affiliateButtonText || 'Ativar'}
          </a>
        </div>
      </div>
    </div>
  );
};

export default CouponWidget;
