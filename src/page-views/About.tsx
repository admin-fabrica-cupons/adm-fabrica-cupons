'use client';

import React from 'react';
import { Heart, Shield, TrendingUp, Users, Target, Globe, Sparkles, Award, Zap, MessageSquare, MessageCircle } from 'lucide-react';
import Link from 'next/link';
import Accordion from '../components/Common/Accordion';

const About: React.FC = () => {
  const faqs = [
    {
      question: "Como vocês selecionam os cupons?",
      answer: "Nossa equipe verifica manualmente cada cupom, testando sua validade e condições de uso antes de publicá-lo na plataforma."
    },
    {
      question: "É seguro usar os links do site?",
      answer: "Sim, todos os nossos links são seguros e direcionam apenas para lojas parceiras oficiais e verificadas."
    },
    {
      question: "Preciso pagar para usar?",
      answer: "Não! O Fábrica de Cupons é e sempre será 100% gratuito para os usuários."
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-950 py-16">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="text-center mb-16 animate-fade-in">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-6 tracking-tight">
            Sobre a <span className="text-blue-600 dark:text-blue-400">Fábrica de Cupons</span>
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto leading-relaxed">
            Conectamos consumidores inteligentes com as melhores ofertas do mercado, com transparência e confiança.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 mb-16">
          <div className="bg-white dark:bg-slate-900 p-8 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-800 hover:shadow-md transition-all group">
            <div className="inline-flex items-center justify-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-2xl mb-6 group-hover:scale-110 transition-transform duration-300">
              <Target className="text-blue-600 dark:text-blue-400" size={32} />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Nossa Missão</h3>
            <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
              Democratizar o acesso a descontos reais e cupons verificados, ajudando famílias brasileiras a economizar em suas compras do dia a dia com segurança e facilidade.
            </p>
          </div>

          <div className="bg-white dark:bg-slate-900 p-8 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-800 hover:shadow-md transition-all group">
            <div className="inline-flex items-center justify-center p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-2xl mb-6 group-hover:scale-110 transition-transform duration-300">
              <Globe className="text-yellow-600 dark:text-yellow-400" size={32} />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Nossa Visão</h3>
            <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
              Ser a plataforma de referência em economia para o consumidor brasileiro, reconhecida pela confiabilidade, qualidade das ofertas e inovação constante.
            </p>
          </div>
        </div>

        <div className="mb-16">
          <h2 className="text-3xl font-bold text-center text-gray-900 dark:text-white mb-12">
            Nossos Valores
          </h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { icon: Shield, color: "green", title: "Transparência", desc: "Todas as ofertas são verificadas e testadas pela nossa equipe." },
              { icon: Heart, color: "red", title: "Paixão pelo Cliente", desc: "Colocamos o consumidor em primeiro lugar em todas as decisões." },
              { icon: TrendingUp, color: "blue", title: "Inovação", desc: "Buscamos sempre novas formas de trazer mais economia." },
              { icon: Award, color: "purple", title: "Qualidade", desc: "Selecionamos apenas cupons que realmente funcionam." },
              { icon: Zap, color: "yellow", title: "Agilidade", desc: "Atualizamos ofertas em tempo real para você não perder nada." },
              { icon: Users, color: "indigo", title: "Comunidade", desc: "Construímos uma comunidade de consumidores inteligentes." }
            ].map((value, index) => (
              <div 
                key={index} 
                className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-gray-100 dark:border-slate-800 hover:border-blue-200 dark:hover:border-blue-800 transition-all hover:-translate-y-1 group"
              >
                <div className={`p-3 rounded-xl w-fit mb-4 ${
                  value.color === 'green' ? 'bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400' :
                  value.color === 'red' ? 'bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400' :
                  value.color === 'blue' ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400' :
                  value.color === 'purple' ? 'bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400' :
                  value.color === 'yellow' ? 'bg-yellow-50 dark:bg-yellow-900/20 text-yellow-600 dark:text-yellow-400' :
                  'bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400'
                }`}>
                  <value.icon size={24} />
                </div>
                <h4 className="font-bold text-gray-900 dark:text-white mb-2 text-lg">{value.title}</h4>
                <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">{value.desc}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="mb-16">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Dúvidas Frequentes</h2>
            <p className="text-gray-600 dark:text-gray-400">Entenda melhor como trabalhamos</p>
          </div>
          
          <div className="space-y-4 max-w-4xl mx-auto">
            {faqs.map((faq, index) => (
              <Accordion
                key={index}
                title={faq.question}
                icon={MessageCircle}
                color="blue"
                items={[{ content: faq.answer }]}
              />
            ))}
          </div>
        </div>

        <div className="text-center bg-gradient-to-r from-blue-600 to-indigo-700 rounded-3xl p-10 md:p-12 text-white shadow-xl">
          <h3 className="text-3xl font-bold mb-4">
            Quer falar conosco?
          </h3>
          <p className="text-blue-100 mb-8 max-w-2xl mx-auto text-lg">
            Estamos sempre abertos a sugestões, parcerias e feedback para melhorar ainda mais nossa plataforma.
          </p>
          <Link
            href="/contato"
            className="inline-flex items-center gap-2 bg-white text-blue-700 hover:bg-blue-50 font-bold py-3 px-8 rounded-xl transition-all hover:scale-105 shadow-lg"
          >
            <MessageSquare size={20} />
            Entre em Contato
          </Link>
        </div>

      </div>
    </div>
  );
};

export default About;
