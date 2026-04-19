'use client';

import React, { useState } from 'react';
import { Shield, Lock, Eye, Database, UserCheck, Bell, ChevronDown, ExternalLink, Heart, CheckCircle } from 'lucide-react';
import Link from 'next/link';
import Accordion from '../components/Common/Accordion';

const Privacy: React.FC = () => {
  const sections = [
    {
      icon: Database,
      color: "blue",
      title: "1. Informações que Coletamos",
      content: (
        <>
          <div className="mb-4">
            <h4 className="font-semibold text-gray-900 dark:text-white mb-2 text-base">Informações fornecidas por você:</h4>
            <ul className="space-y-2">
              {["Nome e endereço de email (ao enviar formulários)", "Dados de navegação e interação com o site", "Preferências de cookies e configurações"].map((item, i) => (
                <li key={i} className="flex items-start gap-3">
                  <div className="p-1 bg-blue-100 dark:bg-blue-900/20 rounded-full mt-1">
                    <div className="w-1.5 h-1.5 bg-blue-600 dark:bg-blue-400 rounded-full"></div>
                  </div>
                  <span className="text-gray-600 dark:text-gray-300 text-sm">{item}</span>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-gray-900 dark:text-white mb-2 text-base">Informações coletadas automaticamente:</h4>
            <ul className="space-y-2">
              {["Endereço IP e tipo de dispositivo", "Páginas visitadas e tempo de permanência", "Cliques em links e cupons", "Dados de localização aproximada (baseado em IP)"].map((item, i) => (
                <li key={i} className="flex items-start gap-3">
                  <div className="p-1 bg-blue-100 dark:bg-blue-900/20 rounded-full mt-1">
                    <div className="w-1.5 h-1.5 bg-blue-600 dark:bg-blue-400 rounded-full"></div>
                  </div>
                  <span className="text-gray-600 dark:text-gray-300 text-sm">{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </>
      )
    },
    {
      icon: Eye,
      color: "green",
      title: "2. Como Usamos Suas Informações",
      content: (
        <ul className="space-y-3">
          {[
            "Personalizar sua experiência no site",
            "Enviar ofertas e cupons relevantes",
            "Melhorar nossos serviços e funcionalidades",
            "Analisar tendências e comportamento dos usuários",
            "Prevenir fraudes e atividades maliciosas",
            "Cumprir obrigações legais"
          ].map((item, i) => (
            <li key={i} className="flex items-start gap-3">
              <div className="p-1 bg-green-100 dark:bg-green-900/20 rounded-full mt-1">
                <div className="w-1.5 h-1.5 bg-green-600 dark:bg-green-400 rounded-full"></div>
              </div>
              <span className="text-gray-600 dark:text-gray-300 text-sm">{item}</span>
            </li>
          ))}
        </ul>
      )
    },
    {
      icon: Lock,
      color: "purple",
      title: "3. Segurança dos Dados",
      content: (
        <>
          <p className="text-gray-600 dark:text-gray-300 mb-3 text-sm">
            Implementamos medidas de segurança técnicas e organizacionais para proteger suas informações pessoais.
          </p>
          <ul className="space-y-2">
            {[
              "Criptografia SSL/TLS para transmissão de dados",
              "Firewalls e sistemas de detecção de intrusão",
              "Acesso restrito aos dados apenas para pessoal autorizado",
              "Monitoramento contínuo de segurança"
            ].map((item, i) => (
              <li key={i} className="flex items-start gap-3">
                <div className="p-1 bg-purple-100 dark:bg-purple-900/20 rounded-full mt-1">
                  <div className="w-1.5 h-1.5 bg-purple-600 dark:bg-purple-400 rounded-full"></div>
                </div>
                <span className="text-gray-600 dark:text-gray-300 text-sm">{item}</span>
              </li>
            ))}
          </ul>
        </>
      )
    },
    {
      icon: UserCheck,
      color: "yellow",
      title: "4. Seus Direitos",
      content: (
        <>
          <p className="text-gray-600 dark:text-gray-300 mb-3 text-sm">
            De acordo com a LGPD, você tem os seguintes direitos:
          </p>
          <ul className="space-y-2">
            {[
              "Acesso: Solicitar cópia dos seus dados pessoais",
              "Correção: Retificar dados incompletos ou inexatos",
              "Exclusão: Solicitar a eliminação dos seus dados",
              "Portabilidade: Receber seus dados em formato estruturado",
              "Revogação: Retirar consentimento a qualquer momento",
              "Oposição: Opor-se ao tratamento de dados"
            ].map((item, i) => (
              <li key={i} className="flex items-start gap-3">
                <div className="p-1 bg-yellow-100 dark:bg-yellow-900/20 rounded-full mt-1">
                  <div className="w-1.5 h-1.5 bg-yellow-600 dark:bg-yellow-400 rounded-full"></div>
                </div>
                <span className="text-gray-600 dark:text-gray-300 text-sm">{item}</span>
              </li>
            ))}
          </ul>
        </>
      )
    },
    {
      icon: Bell,
      color: "orange",
      title: "5. Cookies e Tecnologias Similares",
      content: (
        <>
          <p className="text-gray-600 dark:text-gray-300 mb-4 text-sm">
            Utilizamos cookies para melhorar sua experiência. Cookies são pequenos arquivos de texto armazenados no seu dispositivo.
          </p>
          <div className="grid sm:grid-cols-2 gap-3">
            {[
              { title: "Cookies Essenciais", desc: "Necessários para o funcionamento básico", color: "blue" },
              { title: "Cookies de Análise", desc: "Ajudam a entender uso do site", color: "green" },
              { title: "Cookies de Funcionalidade", desc: "Lembram suas preferências", color: "purple" },
              { title: "Cookies de Marketing", desc: "Mostram ofertas relevantes", color: "orange" }
            ].map((cookie, i) => (
              <div key={i} className="bg-white dark:bg-slate-800 p-3 rounded-lg border border-gray-100 dark:border-slate-700">
                <div className="font-semibold text-gray-900 dark:text-white text-sm mb-1">{cookie.title}</div>
                <p className="text-xs text-gray-500 dark:text-gray-400">{cookie.desc}</p>
              </div>
            ))}
          </div>
        </>
      )
    },
    {
      icon: CheckCircle,
      color: "indigo",
      title: "6. Alterações nesta Política",
      content: (
        <p className="text-gray-600 dark:text-gray-300 text-sm">
          Podemos atualizar esta política periodicamente. Notificaremos sobre mudanças significativas publicando a nova política em nosso site. 
          Recomendamos que revise esta política regularmente.
        </p>
      )
    },
    {
      icon: Shield,
      color: "red",
      title: "7. Contato do Encarregado de Dados",
      content: (
        <>
          <p className="text-gray-600 dark:text-gray-300 mb-2 text-sm">
            Para exercer seus direitos ou esclarecer dúvidas sobre esta política:
          </p>
          <div className="bg-blue-50 dark:bg-blue-900/10 p-4 rounded-lg border border-blue-100 dark:border-blue-800/30">
            <p className="text-blue-800 dark:text-blue-300 text-sm">
              <strong>Email:</strong> privacidade@fabricadecupons.com.br
            </p>
            <p className="text-blue-800 dark:text-blue-300 mt-1 text-sm">
              <strong>Prazo de resposta:</strong> Até 15 dias úteis
            </p>
          </div>
        </>
      )
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="text-center mb-12 animate-fade-in">
          <div className="inline-flex items-center justify-center w-24 h-24 bg-white dark:bg-slate-800 rounded-2xl mb-6 shadow-sm border border-gray-100 dark:border-slate-700">
            <Shield className="text-blue-600 dark:text-blue-400" size={40} />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Política de Privacidade
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Sua privacidade é importante para nós. Saiba como coletamos, usamos e protegemos seus dados.
          </p>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-700 p-6 md:p-8">
          
          <div className="mb-8 p-4 bg-blue-50 dark:bg-blue-900/10 border-l-4 border-blue-500 dark:border-blue-400 rounded-r-lg">
            <p className="text-blue-800 dark:text-blue-300 text-sm leading-relaxed">
              A Fábrica de Cupons valoriza sua privacidade e está comprometida em proteger seus dados pessoais. 
              Esta política explica nossas práticas de forma transparente e clara.
            </p>
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

          <div className="mt-8 pt-8 border-t border-gray-100 dark:border-slate-700">
            <div className="bg-gray-50 dark:bg-slate-700/30 p-6 rounded-xl border border-gray-200 dark:border-slate-600 text-center">
              <p className="text-gray-600 dark:text-gray-300 text-sm mb-4">
                Ao usar nosso site, você concorda com os termos desta Política de Privacidade.
              </p>
              <div className="flex flex-wrap justify-center gap-4 text-sm">
                <Link href="/termos" className="text-blue-600 dark:text-blue-400 font-semibold hover:underline flex items-center gap-2">
                  <ExternalLink size={14} />
                  Termos de Uso
                </Link>
                <span className="text-gray-300 dark:text-gray-600">|</span>
                <Link href="/isencao" className="text-blue-600 dark:text-blue-400 font-semibold hover:underline flex items-center gap-2">
                  <ExternalLink size={14} />
                  Isenção de Responsabilidade
                </Link>
              </div>
            </div>
            
            <div className="mt-8 text-center">
              <p className="text-gray-500 dark:text-gray-400 text-xs" suppressHydrationWarning>
                Última atualização: {new Date().toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })}
              </p>
              <div className="inline-flex items-center gap-2 mt-3 px-3 py-1 bg-gray-50 dark:bg-slate-800 rounded-full border border-gray-100 dark:border-slate-700">
                <Heart size={12} className="text-red-500" />
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  Protegemos seus dados com carinho
                </span>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default Privacy;
