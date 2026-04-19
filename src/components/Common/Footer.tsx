import React from 'react';
import { Facebook, Instagram, Twitter, ShieldCheck } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import Logo from '../../assets/logo.svg'; // Importação padrão

const Footer: React.FC = () => {
  return (
    <footer className="bg-white dark:bg-slate-950 border-t border-gray-200 dark:border-slate-800 pt-12 pb-6 mt-auto">
      <div className="max-w-7xl mx-auto px-2 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          <div className="col-span-1 md:col-span-1">
            <Link href="/" className="flex items-center gap-2">
            
                <Image
                  src={Logo}
                  alt="Fábrica de Cupons"
                  className="object-contain"
                  width={30}
                />
             
              <span className="font-bold text-xl tracking-tight text-gray-900 dark:text-white">
                Fábrica de Cupons</span>
            </Link>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              Sua fonte confiável de descontos reais em lojas oficiais. Economize com segurança e inteligência.
            </p>
            <div className="flex items-center gap-2 text-green-600 dark:text-green-400 text-xs font-semibold">
              <ShieldCheck size={16} /> Site 100% Seguro
            </div>
          </div>

          <div>
            <h4 className="font-semibold text-gray-900 dark:text-white mb-4">Institucional</h4>
            <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
              <li><Link href="/sobre" className="hover:text-blue-600 dark:hover:text-blue-400">Sobre nós</Link></li>
              <li><Link href="/contato" className="hover:text-blue-600 dark:hover:text-blue-400">Contato</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-gray-900 dark:text-white mb-4">Legal</h4>
            <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
              <li><Link href="/privacidade" className="hover:text-blue-600 dark:hover:text-blue-400">Política de Privacidade</Link></li>
              <li><Link href="/termos" className="hover:text-blue-600 dark:hover:text-blue-400">Termos de Uso</Link></li>
              <li><Link href="/isencao" className="hover:text-blue-600 dark:hover:text-blue-400">Isenção de Responsabilidade</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-gray-900 dark:text-white mb-4">Redes Sociais</h4>
            <div className="flex space-x-4">
              <a href="#" className="text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                <Facebook size={20} />
              </a>
              <a href="#" className="text-gray-400 hover:text-pink-600 dark:hover:text-pink-400 transition-colors">
                <Instagram size={20} />
              </a>
              <a href="#" className="text-gray-400 hover:text-sky-500 dark:hover:text-sky-400 transition-colors">
                <Twitter size={20} />
              </a>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-200 dark:border-slate-800 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-xs text-gray-500 text-center md:text-left">
            © {new Date().getFullYear()} Fábrica de Cupons. Todos os direitos reservados.
          </p>
          <p className="text-xs text-gray-500 text-center md:text-right">
            As promoções podem sofrer alteração de preço ou esgotar a qualquer momento.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
