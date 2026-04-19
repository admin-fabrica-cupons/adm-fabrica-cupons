'use client';

import React from 'react';
import {
  Mail,
  Phone,
  MapPin,
  MessageSquare,
  Clock,
  HelpCircle
} from 'lucide-react';
import Link from 'next/link';
import Accordion from '../components/Common/Accordion';

const Contact: React.FC = () => {
  const [openFaq, setOpenFaq] = React.useState<number | null>(null);

  const faqs = [
    {
      question: "Como funcionam os cupons?",
      answer: "Basta clicar no botão 'Pegar Cupom' e o código será copiado automaticamente. Depois, é só colar no carrinho de compras da loja parceira."
    },
    {
      question: "Os cupons são gratuitos?",
      answer: "Sim! Todos os cupons e ofertas disponibilizados no Fábrica de Cupons são 100% gratuitos para uso."
    },
    {
      question: "O cupom não funcionou, o que fazer?",
      answer: "Verifique se o cupom ainda está dentro do prazo de validade e se as regras de uso (valor mínimo, produtos selecionados) foram atendidas. Se o problema persistir, entre em contato conosco."
    }
  ];

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950 py-12 md:py-20">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="text-center mb-12 md:mb-20 animate-fade-in">
          <div className="inline-flex items-center justify-center p-4 bg-orange-100 dark:bg-orange-900/30 rounded-3xl mb-6 ring-1 ring-orange-200 dark:ring-orange-800 transform hover:scale-110 transition-transform duration-300">
            <MessageSquare className="text-orange-600 dark:text-orange-400" size={36} />
          </div>
          <h1 className="text-4xl md:text-6xl font-black text-slate-900 dark:text-white mb-6 tracking-tight">
            Fale <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-600 to-red-600">Conosco</span>
          </h1>
          <p className="text-lg md:text-xl text-slate-600 dark:text-slate-400 max-w-2xl mx-auto leading-relaxed font-medium">
            Estamos aqui para ajudar você a economizar mais. Entre em contato para dúvidas, parcerias ou suporte técnico.
          </p>
        </div>

        <div className="grid lg:grid-cols-12 gap-8 md:gap-12 items-start">
          
          <div className="lg:col-span-5 space-y-4 md:space-y-6">
            <a 
              href="mailto:contato@fabricadecupons.com.br"
              className="block bg-white dark:bg-slate-900 p-6 md:p-8 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-800 hover:border-orange-200 dark:hover:border-orange-800 hover:shadow-xl hover:shadow-orange-500/5 transition-all duration-300 group"
            >
              <div className="flex items-center gap-6">
                <div className="p-4 bg-orange-50 dark:bg-orange-900/20 rounded-2xl group-hover:bg-orange-100 dark:group-hover:bg-orange-900/40 transition-colors">
                  <Mail className="text-orange-600 dark:text-orange-400" size={28} />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 dark:text-white text-xl mb-1">Email</h3>
                  <p className="text-slate-600 dark:text-slate-400 text-sm md:text-base font-medium mb-1">Suporte e parcerias</p>
                  <span className="text-orange-600 dark:text-orange-400 font-bold break-all">
                    contato@fabricadecupons.com.br
                  </span>
                  <div className="flex items-center gap-2 mt-3 text-xs font-bold text-slate-400 uppercase tracking-wider">
                    <Clock size={14} />
                    <span>Resposta em até 24h</span>
                  </div>
                </div>
              </div>
            </a>

            <div className="bg-white dark:bg-slate-900 p-6 md:p-8 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-800 hover:border-emerald-200 dark:hover:border-emerald-800 hover:shadow-xl hover:shadow-emerald-500/5 transition-all duration-300 group">
              <div className="flex items-center gap-6">
                <div className="p-4 bg-emerald-50 dark:bg-emerald-900/20 rounded-2xl group-hover:bg-emerald-100 dark:group-hover:bg-emerald-900/40 transition-colors">
                  <Phone className="text-emerald-600 dark:text-emerald-400" size={28} />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 dark:text-white text-xl mb-1">WhatsApp</h3>
                  <p className="text-slate-600 dark:text-slate-400 text-sm md:text-base font-medium mb-1">Atendimento rápido</p>
                  <p className="font-black text-slate-900 dark:text-white text-lg">(32) 98478-0795</p>
                  <div className="flex items-center gap-2 mt-3 text-xs font-bold text-slate-400 uppercase tracking-wider">
                    <Clock size={14} />
                    <span>Segunda a Sexta, 9h–18h</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-slate-900 p-6 md:p-8 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-800 hover:border-blue-200 dark:hover:border-blue-800 hover:shadow-xl hover:shadow-blue-500/5 transition-all duration-300 group">
              <div className="flex items-center gap-6">
                <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-2xl group-hover:bg-blue-100 dark:group-hover:bg-blue-900/40 transition-colors">
                  <MapPin className="text-blue-600 dark:text-blue-400" size={28} />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 dark:text-white text-xl mb-1">Localização</h3>
                  <p className="text-slate-600 dark:text-slate-400 text-sm md:text-base font-medium">Minas Gerais, Brasil</p>
                  <p className="text-xs font-bold text-slate-400 mt-3 uppercase tracking-wider">Atendimento 100% Digital</p>
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-7 self-start">
            <div className="bg-white dark:bg-slate-900 rounded-[2rem] shadow-sm border border-slate-100 dark:border-slate-800 overflow-hidden mb-6">
              <div className="p-8 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-white dark:bg-slate-700 rounded-lg shadow-sm">
                    <HelpCircle className="text-orange-500" size={20} />
                  </div>
                  <h3 className="font-black text-slate-900 dark:text-white text-xl uppercase tracking-tight">Perguntas Frequentes</h3>
                </div>
              </div>
              <div className="p-6">
                <div className="space-y-4">
                  {faqs.map((faq, index) => (
                    <Accordion
                      key={index}
                      title={faq.question}
                      icon={HelpCircle}
                      color="orange"
                      items={[{ content: faq.answer }]}
                    />
                  ))}
                </div>
              </div>
            </div>
            
            <div className="p-8 bg-slate-50/50 dark:bg-slate-800/50 rounded-[2rem] border border-slate-100 dark:border-slate-800 text-center">
              <p className="text-slate-500 dark:text-slate-400 font-medium mb-4">Não encontrou o que procura?</p>
              <Link 
                href="/sobre" 
                className="inline-flex items-center gap-2 px-6 py-3 bg-white dark:bg-slate-800 text-orange-600 dark:text-orange-400 font-bold rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 hover:shadow-md hover:-translate-y-0.5 transition-all"
              >
                Central de Ajuda Completa
                <span className="text-xl">→</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contact;
