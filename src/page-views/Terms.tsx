'use client';

import React, { useState } from 'react';
import { FileText, AlertTriangle, Scale, BookOpen, Shield, ExternalLink, CheckCircle, Globe, Users, Heart, ChevronDown } from 'lucide-react';
import Link from 'next/link';
import Accordion from '../components/Common/Accordion';

const Terms: React.FC = () => {
  const termsSections = [
    {
      icon: BookOpen,
      color: "blue",
      title: "1. Aceitação dos Termos",
      content: (
        <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
          Ao acessar ou usar o site Fábrica de Cupons, você concorda em cumprir e estar vinculado a estes Termos de Uso. 
          Se você não concordar com qualquer parte destes termos, não deverá acessar ou usar nosso site.
        </p>
      )
    },
    {
      icon: Scale,
      color: "purple",
      title: "2. Serviços Oferecidos",
      content: (
        <>
          <p className="text-gray-700 dark:text-gray-300 mb-3">
            O Fábrica de Cupons é um site de descoberta e divulgação de cupons de desconto e ofertas. Nossos serviços incluem:
          </p>
          <ul className="space-y-2">
            {[
              "Agregação e curadoria de cupons e ofertas",
              "Redirecionamento para sites de varejistas parceiros",
              "Informações sobre produtos e descontos",
              "Conteúdo educativo sobre economia e compras inteligentes"
            ].map((item, i) => (
              <li key={i} className="flex items-start gap-3">
                <div className="p-1 bg-purple-100 dark:bg-purple-900/20 rounded-full mt-1">
                  <div className="w-2 h-2 bg-purple-600 dark:bg-purple-400 rounded-full"></div>
                </div>
                <span className="text-gray-700 dark:text-gray-300">{item}</span>
              </li>
            ))}
          </ul>
        </>
      )
    },
    {
      icon: Shield,
      color: "green",
      title: "3. Responsabilidades do Usuário",
      content: (
        <>
          <p className="text-gray-700 dark:text-gray-300 mb-3">Ao usar nosso site, você concorda em:</p>
          <ul className="space-y-2">
            {[
              "Usar o site apenas para fins legítimos",
              "Não tentar burlar ou interferir no funcionamento do site",
              "Não usar robôs, scrapers ou métodos automatizados sem permissão",
              "Fornecer informações precisas quando solicitado",
              "Respeitar os direitos de propriedade intelectual",
              "Não realizar atividades fraudulentas ou enganosas"
            ].map((item, i) => (
              <li key={i} className="flex items-start gap-3">
                <div className="p-1 bg-green-100 dark:bg-green-900/20 rounded-full mt-1">
                  <div className="w-2 h-2 bg-green-600 dark:bg-green-400 rounded-full"></div>
                </div>
                <span className="text-gray-700 dark:text-gray-300">{item}</span>
              </li>
            ))}
          </ul>
        </>
      )
    },
    {
      icon: ExternalLink,
      color: "red",
      title: "4. Links para Sites de Terceiros",
      content: (
        <>
          <p className="text-gray-700 dark:text-gray-300 mb-3">
            Nosso site contém links para sites de varejistas e parceiros. Ao clicar nestes links, você será redirecionado para sites de terceiros.
          </p>
          <div className="bg-gradient-to-r from-red-50 to-orange-50 dark:from-red-900/10 dark:to-orange-900/10 p-4 rounded-xl border border-red-200 dark:border-red-800 mt-4">
            <p className="text-red-800 dark:text-red-300">
              <strong className="text-red-900 dark:text-red-200">Importante:</strong> Não somos responsáveis pelo conteúdo, políticas de privacidade ou práticas de sites de terceiros. 
              Recomendamos que leia os termos e políticas desses sites antes de realizar qualquer transação.
            </p>
          </div>
        </>
      )
    },
    {
      icon: AlertTriangle,
      color: "yellow",
      title: "5. Isenção de Garantias",
      content: (
        <>
          <p className="text-gray-700 dark:text-gray-300">
            O site é fornecido &quot;no estado em que se encontra&quot; e &quot;conforme disponível&quot;. 
            Não garantimos que:
          </p>
          <ul className="space-y-2 mt-3">
            {[
              "Os cupons estejam sempre disponíveis ou sejam válidos",
              "O site estará disponível ininterruptamente ou livre de erros",
              "As informações fornecidas sejam sempre precisas ou atualizadas",
              "Os resultados obtidos através do uso do site atenderão às suas expectativas"
            ].map((item, i) => (
              <li key={i} className="flex items-start gap-3">
                <div className="p-1 bg-yellow-100 dark:bg-yellow-900/20 rounded-full mt-1">
                  <div className="w-2 h-2 bg-yellow-600 dark:bg-yellow-400 rounded-full"></div>
                </div>
                <span className="text-gray-700 dark:text-gray-300">{item}</span>
              </li>
            ))}
          </ul>
        </>
      )
    },
    {
      icon: FileText,
      color: "blue",
      title: "6. Limitação de Responsabilidade",
      content: (
        <p className="text-gray-700 dark:text-gray-300">
          Em nenhuma circunstância seremos responsáveis por quaisquer danos diretos, indiretos, incidentais, 
          consequenciais ou punitivos decorrentes do uso ou incapacidade de usar nosso site, 
          mesmo se tivermos sido avisados da possibilidade de tais danos.
        </p>
      )
    },
    {
      icon: Scale,
      color: "purple",
      title: "7. Propriedade Intelectual",
      content: (
        <p className="text-gray-700 dark:text-gray-300">
          Todo o conteúdo do site (textos, gráficos, logos, ícones, imagens, clipes de áudio, downloads digitais, 
          compilações de dados e software) é propriedade do Fábrica de Cupons ou de seus provedores de conteúdo 
          e está protegido por leis de direitos autorais internacionais.
        </p>
      )
    },
    {
      icon: BookOpen,
      color: "green",
      title: "8. Alterações nos Termos",
      content: (
        <p className="text-gray-700 dark:text-gray-300">
          Reservamo-nos o direito de modificar estes termos a qualquer momento. 
          As alterações entrarão em vigor imediatamente após sua publicação no site. 
          O uso continuado do site após tais alterações constitui sua aceitação dos novos termos.
        </p>
      )
    },
    {
      icon: Globe,
      color: "indigo",
      title: "9. Lei Aplicável",
      content: (
        <p className="text-gray-700 dark:text-gray-300">
          Estes termos são regidos e interpretados de acordo com as leis da República Federativa do Brasil. 
          Qualquer disputa relacionada a estes termos será submetida à jurisdição exclusiva dos tribunais do estado de São Paulo.
        </p>
      )
    },
    {
      icon: Users,
      color: "blue",
      title: "10. Contato",
      content: (
        <p className="text-gray-700 dark:text-gray-300">
          Para questões sobre estes Termos de Uso, entre em contato conosco através da página de{' '}
          <Link href="/contato" className="text-blue-600 dark:text-blue-400 font-semibold hover:underline">
            Contato
          </Link>.
        </p>
      )
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="text-center mb-12 animate-fade-in">
          <div className="inline-flex items-center justify-center w-24 h-24 bg-white dark:bg-slate-800 rounded-2xl mb-6 shadow-sm border border-gray-100 dark:border-slate-700">
            <FileText className="text-blue-600 dark:text-blue-400" size={40} />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Termos de Uso
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Ao acessar e usar o Fábrica de Cupons, você concorda com estes termos. Leia atentamente para entender seus direitos e deveres.
          </p>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-700 p-6 md:p-8">
          
          <div className="mb-8 p-4 bg-yellow-50 dark:bg-yellow-900/10 border-l-4 border-yellow-500 dark:border-yellow-400 rounded-r-lg">
            <div className="flex items-start gap-3">
              <AlertTriangle className="text-yellow-600 dark:text-yellow-400 mt-1 flex-shrink-0" size={20} />
              <div>
                <h3 className="font-bold text-yellow-800 dark:text-yellow-300 mb-1">Aviso Importante</h3>
                <p className="text-sm text-yellow-700 dark:text-yellow-400">
                  Estes termos constituem um acordo legal entre você e o Fábrica de Cupons.
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            {termsSections.map((section, index) => (
              <Accordion
                key={index}
                title={section.title}
                icon={section.icon}
                color={section.color}
                items={[{ content: section.content }]}
              />
            ))}
          </div>

          <div className="mt-12 p-6 bg-gray-50 dark:bg-slate-700/30 rounded-xl border border-gray-200 dark:border-slate-600">
            <div className="flex items-center gap-3 mb-4">
              <CheckCircle className="text-green-600 dark:text-green-400" size={24} />
              <h3 className="font-bold text-gray-900 dark:text-white">Concordância</h3>
            </div>
            <p className="text-gray-600 dark:text-gray-300 text-sm mb-4">
              Ao continuar navegando em nosso site, você confirma que leu, compreendeu e concorda com todos os termos acima.
            </p>
            <div className="grid sm:grid-cols-2 gap-3 text-sm text-gray-500 dark:text-gray-400">
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-green-500"></div>
                <span>Maior de 18 anos ou supervisionado</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-green-500"></div>
                <span>Uso legítimo e responsável</span>
              </div>
            </div>
          </div>

          <div className="mt-8 pt-8 border-t border-gray-100 dark:border-slate-700">
            <h3 className="font-bold text-gray-900 dark:text-white mb-6">Documentos Relacionados</h3>
            <div className="grid sm:grid-cols-2 gap-4">
              <Link 
                href="/privacidade" 
                className="flex items-center gap-4 p-4 bg-gray-50 dark:bg-slate-700/50 rounded-xl hover:bg-gray-100 dark:hover:bg-slate-700 transition-all border border-transparent hover:border-gray-200 dark:hover:border-slate-600 group"
              >
                <div className="p-2 bg-white dark:bg-slate-800 rounded-lg shadow-sm group-hover:scale-110 transition-transform">
                  <Shield className="text-blue-600 dark:text-blue-400" size={20} />
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-gray-900 dark:text-white text-sm">Política de Privacidade</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Tratamento de dados</p>
                </div>
                <ExternalLink className="text-gray-400 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition" size={16} />
              </Link>
              
              <Link 
                href="/isencao" 
                className="flex items-center gap-4 p-4 bg-gray-50 dark:bg-slate-700/50 rounded-xl hover:bg-gray-100 dark:hover:bg-slate-700 transition-all border border-transparent hover:border-gray-200 dark:hover:border-slate-600 group"
              >
                <div className="p-2 bg-white dark:bg-slate-800 rounded-lg shadow-sm group-hover:scale-110 transition-transform">
                  <AlertTriangle className="text-red-600 dark:text-red-400" size={20} />
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-gray-900 dark:text-white text-sm">Isenção de Responsabilidade</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Limitações de uso</p>
                </div>
                <ExternalLink className="text-gray-400 group-hover:text-red-600 dark:group-hover:text-red-400 transition" size={16} />
              </Link>
            </div>
          </div>

          <div className="mt-8 text-center border-t border-gray-100 dark:border-slate-700 pt-8">
            <p className="text-gray-500 dark:text-gray-400 text-xs" suppressHydrationWarning>
              Atualizado em {new Date().toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })}
            </p>
            <div className="inline-flex items-center gap-2 mt-3 px-3 py-1 bg-gray-50 dark:bg-slate-800 rounded-full border border-gray-100 dark:border-slate-700">
              <Heart size={12} className="text-red-500" />
              <span className="text-xs text-gray-500 dark:text-gray-400">
                Fábrica de Cupons
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Terms;
