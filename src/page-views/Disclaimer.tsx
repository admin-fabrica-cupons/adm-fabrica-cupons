'use client';

import React from 'react';
import { AlertTriangle, DollarSign, ShoppingBag, ThumbsUp, FileText, Shield, Info } from 'lucide-react';
import Link from 'next/link';
import Accordion from '../components/Common/Accordion';

const Disclaimer: React.FC = () => {
  const sections = [
    {
      title: "1. Natureza do Serviço",
      icon: DollarSign,
      color: "yellow",
      content: "Atuamos como um intermediário informativo entre consumidores e varejistas. Não realizamos vendas, não processamos pagamentos e não temos qualquer envolvimento nas transações comerciais realizadas nos sites dos varejistas."
    },
    {
      title: "2. Validade dos Cupons",
      icon: ShoppingBag,
      color: "blue",
      content: "Embora nos esforcemos para manter as informações atualizadas, não podemos garantir que todos os cupons estarão disponíveis no momento da sua compra, que os descontos serão aplicados corretamente ou que não haverá restrições adicionais."
    },
    {
      title: "3. Responsabilidade do Usuário",
      icon: ThumbsUp,
      color: "green",
      content: "É sua responsabilidade verificar a validade do cupom diretamente no site do varejista, ler todas as condições aplicáveis e confirmar se o produto desejado está elegível para o desconto."
    }
  ];

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950 py-12 md:py-20">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="text-center mb-12 md:mb-20 animate-fade-in">
          <div className="inline-flex items-center justify-center p-4 bg-orange-100 dark:bg-orange-900/30 rounded-3xl mb-6 ring-1 ring-orange-200 dark:ring-orange-800 transform hover:rotate-12 transition-transform duration-300">
            <AlertTriangle className="text-orange-600 dark:text-orange-400" size={40} />
          </div>
          <h1 className="text-4xl md:text-6xl font-black text-slate-900 dark:text-white mb-6 tracking-tight leading-tight">
            Isenção de <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-600 to-red-600">Responsabilidade</span>
          </h1>
          <div className="inline-flex items-center gap-2 px-6 py-3 bg-orange-50 dark:bg-orange-900/20 rounded-2xl border border-orange-100 dark:border-orange-800/50 shadow-sm">
            <Info size={18} className="text-orange-600 dark:text-orange-400" />
            <p className="text-sm md:text-base font-bold text-orange-700 dark:text-orange-300 uppercase tracking-wide">
              Leia atentamente antes de usar
            </p>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-xl shadow-slate-200/50 dark:shadow-none border border-slate-100 dark:border-slate-800 p-6 md:p-12">
          
          <div className="mb-12 p-8 bg-gradient-to-br from-orange-50 to-white dark:from-orange-900/10 dark:to-slate-900 border border-orange-100 dark:border-orange-900/30 rounded-3xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
              <AlertTriangle size={120} className="text-orange-600" />
            </div>
            <div className="flex flex-col md:flex-row items-start gap-6 relative z-10">
              <div className="p-4 bg-orange-500 rounded-2xl shadow-lg shadow-orange-500/20">
                <AlertTriangle className="text-white" size={28} />
              </div>
              <div>
                <h3 className="text-xl font-black text-orange-900 dark:text-orange-200 mb-3 uppercase tracking-tighter">AVISO CRÍTICO</h3>
                <p className="text-orange-800 dark:text-orange-300 leading-relaxed text-lg font-medium">
                  O Fábrica de Cupons é um serviço de agregação e divulgação. 
                  <span className="block mt-2 text-orange-950 dark:text-orange-100 font-black decoration-orange-500/30 underline decoration-4 underline-offset-4"> NÃO SOMOS VENDEDORES </span> 
                  e não temos controle sobre a validade ou condições dos cupons.
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            {sections.map((section, index) => (
              <Accordion
                key={index}
                title={section.title}
                icon={section.icon}
                color={section.color}
                items={[{ content: section.content }]}
              />
            ))}
          </div>

          <div className="mt-12 p-8 bg-slate-50 dark:bg-slate-800/50 rounded-3xl border border-slate-100 dark:border-slate-800 group">
            <h3 className="font-black text-slate-900 dark:text-white text-xl mb-4 flex items-center gap-3">
              <div className="p-2 bg-white dark:bg-slate-700 rounded-lg shadow-sm group-hover:rotate-12 transition-transform">
                <Shield size={22} className="text-orange-500" />
              </div>
              Recomendação Final
            </h3>
            <p className="text-slate-600 dark:text-slate-400 text-base md:text-lg leading-relaxed font-medium">
              Sempre verifique diretamente no site do varejista todas as condições antes de finalizar qualquer compra. 
              <span className="block mt-4 p-4 bg-orange-50 dark:bg-orange-900/20 rounded-xl text-orange-700 dark:text-orange-300 text-sm font-bold border border-orange-100 dark:border-orange-800/50">
                DICA: Se um cupom não funcionar, entre em contato diretamente com o suporte da loja.
              </span>
            </p>
          </div>

          <div className="mt-12 pt-12 border-t border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-center gap-6">
            <Link href="/termos" className="w-full sm:w-auto flex items-center justify-center gap-3 px-8 py-4 rounded-2xl bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 transition-all shadow-sm border border-slate-200 dark:border-slate-700 text-base font-black text-slate-700 dark:text-slate-300 hover:-translate-y-1">
              <FileText size={20} className="text-orange-500" />
              Termos de Uso
            </Link>
            <Link href="/privacidade" className="w-full sm:w-auto flex items-center justify-center gap-3 px-8 py-4 rounded-2xl bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 transition-all shadow-sm border border-slate-200 dark:border-slate-700 text-base font-black text-slate-700 dark:text-slate-300 hover:-translate-y-1">
              <Shield size={20} className="text-orange-500" />
              Política de Privacidade
            </Link>
          </div>

        </div>
      </div>
    </div>
  );
};

export default Disclaimer;
