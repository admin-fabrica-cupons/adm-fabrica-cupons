'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { BlogPost } from '../../types';
// Mantendo lucide-react pois já estava no seu projeto, mas usando ícones mais modernos
import { Calendar, Ticket, Copy, Check, ExternalLink, ArrowRight } from 'lucide-react';

interface CouponPostCardProps {
  post: BlogPost;
}

const CouponPostCard: React.FC<CouponPostCardProps> = ({ post }) => {
  const [copied, setCopied] = useState(false);
  
  const coupons = post.blocks?.filter(b => b.type === 'coupon') || [];
  const couponLists = post.blocks?.filter(b => b.type === 'coupon_list') || [];
  const mainCoupon = coupons[0];
  
  const totalCoupons = coupons.length + couponLists.reduce((acc, list) => 
    acc + (list.items?.length || 0), 0
  );

  const handleCopy = (e: React.MouseEvent, code: string) => {
    e.preventDefault();
    e.stopPropagation();
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Link
      href={`/post/${post.id}`}
      prefetch={true}
      // CONTAINER PRINCIPAL:
      // - backdrop-blur-md: Cria o desfoque
      // - bg-white/40: Fundo branco com 40% de opacidade (transparente)
      // - border-emerald-500/20: Borda sutil verde
      // - hover:border-emerald-500: Apenas a borda muda no hover, sem pular/crescer
      className="group flex flex-col h-full rounded-2xl overflow-hidden transition-all duration-300
                 bg-white/40 dark:bg-slate-900/40 backdrop-blur-md 
                 border border-emerald-500/20 hover:border-emerald-500/60
                 shadow-sm hover:shadow-emerald-500/10 hover:scale-[1.02] active:scale-[0.98]"
      onClick={(e) => {
        // Show loading indicator
        const target = e.currentTarget;
        target.style.opacity = '0.6';
        target.style.pointerEvents = 'none';
      }}
    >
      {/* Efeito degradê verde suave no fundo do card (bem sutil) */}
      <div className="absolute inset-0 bg-gradient-to-b from-emerald-500/5 to-transparent pointer-events-none" />

      {/* Conteúdo do Card */}
      <div className="p-5 flex-1 flex flex-col relative z-10">
        
        {/* Topo: Categoria e Data */}
        <div className="flex justify-between items-start mb-3">
          <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-500/10 px-2 py-1 rounded-md">
            {post.category}
          </span>
          <div className="flex items-center text-xs text-gray-500 dark:text-gray-400">
            <Calendar size={12} className="mr-1.5" />
            {new Date(post.date).toLocaleDateString('pt-BR')}
          </div>
        </div>

        {/* Título */}
        <h3 className="text-lg font-bold text-gray-800 dark:text-gray-100 mb-2 leading-snug group-hover:text-emerald-700 dark:group-hover:text-emerald-400 transition-colors">
          {post.title}
        </h3>

        {/* Resumo */}
        <p className="text-sm text-gray-600 dark:text-gray-300 mb-5 line-clamp-2">
          {post.excerpt}
        </p>

        {/* --- ÁREA DO CUPOM (Estilo Ticket Horizontal) --- */}
        <div className="mt-auto">
          {mainCoupon && mainCoupon.couponCode ? (
            // Container do Cupom
            <div className="flex flex-col sm:flex-row items-stretch rounded-lg border-2 border-dashed border-emerald-500/40 bg-emerald-50/50 dark:bg-emerald-900/10 overflow-hidden">
              
              {/* Lado Esquerdo: Ícone + Código */}
              <div className="flex-1 flex items-center gap-3 p-3 border-b sm:border-b-0 sm:border-r border-emerald-500/20 border-dashed">
                <div className="p-2 bg-white dark:bg-slate-800 rounded-md shadow-sm text-emerald-600">
                  <Ticket size={18} />
                </div>
                <div className="flex flex-col min-w-0">
                  <span className="text-[10px] uppercase font-bold text-emerald-600 dark:text-emerald-400 truncate">
                    {mainCoupon.discount || 'CUPOM DISPONÍVEL'}
                  </span>
                  <span className="font-mono font-bold text-gray-800 dark:text-gray-200 text-sm truncate select-all">
                    {mainCoupon.couponCode}
                  </span>
                </div>
              </div>

              {/* Lado Direito: Botão Copiar */}
              <button
                onClick={(e) => handleCopy(e, mainCoupon.couponCode!)}
                className={`
                  sm:w-20 flex items-center justify-center p-2 transition-colors duration-200
                  ${copied 
                    ? 'bg-emerald-500 text-white' 
                    : 'bg-white/50 dark:bg-slate-800/50 hover:bg-emerald-100 dark:hover:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400'
                  }
                `}
              >
                {copied ? <Check size={18} /> : <Copy size={18} />}
              </button>
            </div>
          ) : (
            // Fallback se não houver código principal visível
            <div className="p-3 rounded-lg border border-gray-200 dark:border-slate-700 bg-gray-50/50 dark:bg-slate-800/50 text-center">
              <span className="text-xs text-gray-500 flex items-center justify-center gap-2">
                <Ticket size={14} /> {totalCoupons} {totalCoupons > 1 ? 'ofertas disponíveis' : 'oferta disponível'}
              </span>
            </div>
          )}

          {/* Botão Acessar Oferta - Centralizado e Moderno */}
          <div className="mt-4 flex justify-center">
            <button className="flex items-center gap-2 px-6 py-2 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold uppercase tracking-wide shadow-sm hover:shadow-md transition-all duration-200 w-full sm:w-auto justify-center">
              Acessar Oferta
              <ArrowRight size={14} />
            </button>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default CouponPostCard;
