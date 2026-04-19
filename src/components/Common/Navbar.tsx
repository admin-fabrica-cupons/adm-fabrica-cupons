import React, { useState, useContext, useEffect, useRef } from 'react';
import {
  Search, Moon, Sun, Menu, X, Settings, Home, Ticket,
  BookOpen,
  ChevronDown,
  RefreshCw
} from 'lucide-react';
import { LiaBlogSolid } from "react-icons/lia";
import Link from 'next/link';
import Image from 'next/image';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { usePost } from '../../contexts/PostContext';
import { useCategoryIcons } from '../../hooks/useCategoryIcons';
import Logo from '../../assets/logo.svg';
import { FaWhatsapp, FaFireAlt, FaStore, FaPercent } from 'react-icons/fa';
import { MdCategory } from 'react-icons/md';
import { SearchBar } from './SearchBar';

// --- COMPONENTE NAVBAR ---
interface NavbarProps {
  theme: 'light' | 'dark';
  toggleTheme: () => void;
  settings: {
    isWhatsAppVisible: boolean;
    setIsWhatsAppVisible: (v: boolean) => void;
    isNavbarSearchEnabled: boolean;
    setIsNavbarSearchEnabled: (v: boolean) => void;
  };
}

const Navbar: React.FC<NavbarProps> = ({ theme, toggleTheme, settings }) => {
  const { posts, categories, reloadPosts, categoryIcons } = usePost() || { posts: [], categories: [], reloadPosts: async () => [], categoryIcons: {} };
  const { getCategoryIcon: getCentralizedCategoryIcon } = useCategoryIcons();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [refreshStatus, setRefreshStatus] = useState<'idle' | 'loading' | 'success'>('idle');
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isCategoriesOpen, setIsCategoriesOpen] = useState(false);
  const [showAllCategories, setShowAllCategories] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const settingsRef = useRef<HTMLDivElement>(null);
  const sidebarRef = useRef<HTMLDivElement>(null);
  const navRef = useRef<HTMLElement>(null);
  const categoriesRef = useRef<HTMLDivElement>(null);
  const mobileCategoriesRef = useRef<HTMLDivElement>(null);

  const [activeSection, setActiveSection] = useState<string | null>(null);

  useEffect(() => {
    const section = searchParams?.get('section') || null;
    setActiveSection(section);
  }, [searchParams]);

  // Verificar se estamos na Home ou página de seções
  const isHomePage = pathname === '/';
  const isSectionsPage = pathname === '/sections';
  const isBlogPage = pathname === '/blog';
  const sectionParam = searchParams?.get('section') || '';

  // Obter categorias únicas dos posts
  const uniqueCategories = Array.from(new Set(posts.map((post: any) => post.category).filter(Boolean)));
  const availableCategories = [...new Set([...categories, ...uniqueCategories])]
    .filter(cat => cat && cat !== 'Todos' && cat !== 'Cupons' && cat !== 'Informativos');

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (settingsRef.current && !settingsRef.current.contains(event.target as Node)) setIsSettingsOpen(false);
      if (categoriesRef.current && !categoriesRef.current.contains(event.target as Node)) setIsCategoriesOpen(false);
      if (sidebarRef.current && !sidebarRef.current.contains(event.target as Node) &&
        !(event.target as Element).closest('[data-menu-button]')) {
        setIsMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (!navRef.current) return;

    const updateHeight = () => {
      if (navRef.current) {
        const height = navRef.current.offsetHeight;
        document.documentElement.style.setProperty('--navbar-height', `${height}px`);
      }
    };

    // Atualiza imediatamente e após um pequeno delay para garantir que a renderização terminou
    updateHeight();
    setTimeout(updateHeight, 100);

    // Observa mudanças no tamanho do elemento
    const resizeObserver = new ResizeObserver(() => {
      updateHeight();
    });

    resizeObserver.observe(navRef.current);

    return () => {
      resizeObserver.disconnect();
    };
  }, [pathname]);

  const handleCategorySelect = (category: string) => {
    if (isSectionsPage) {
      // Se estamos na página de seções, navega para a seção de ofertas com a categoria selecionada
      router.push(`/sections?section=ofertas&category=${category}`);
    } else {
      // Se estamos na home, faz scroll para a seção de posts e ativa a categoria
      router.push('/');
      setTimeout(() => {
        const postsSection = document.getElementById('posts-section');
        if (postsSection) {
          // Dispara evento para ativar a categoria
          const event = new CustomEvent('activate-category', { detail: { category } });
          window.dispatchEvent(event);

          // Faz scroll para a seção de posts
          postsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 100);
    }

    setIsMenuOpen(false);
    setIsCategoriesOpen(false);
  };

  const getCategoryIcon = (category: string) => {
    const iconClass = "w-3.5 h-3.5";
    return getCentralizedCategoryIcon(category, 14, `${iconClass} text-blue-500`);
  };

  const searchTone: 'blue' | 'emerald' | 'cyan' | 'pink' =
    sectionParam === 'cupons'
      ? 'emerald'
      : sectionParam === 'blog'
        ? 'cyan'
        : sectionParam === 'ofertas' || sectionParam === 'imperdiveis'
          ? 'pink'
          : 'blue';

  return (
    <>
      <nav ref={navRef} className="sticky top-0 z-[100] backdrop-blur-md bg-white/95 dark:bg-slate-900/95 border-b border-gray-200/50 dark:border-slate-800/50 transition-all duration-300">
        <div className="max-w-7xl mx-auto px-3 sm:px-5 lg:px-8">
          {/* Linha superior */}
          <div className="flex justify-between items-center h-14">

            <div className="flex-shrink-0">
              <Link href="/" className="flex items-center gap-2">
              
                  <Image src={Logo} width={30} alt="Logo" className="object-contain object-left" />
              
                <span className="font-bold text-base tracking-tight text-gray-900 dark:text-white hidden sm:block">
                  {isBlogPage ? (
                    <span className="flex items-center gap-2">
                      Fábrica de Cupons <span className="text-gray-300 dark:text-gray-600">|</span> <span className="text-blue-600 dark:text-blue-400">BLOG</span>
                    </span>
                  ) : (
                    "Fábrica de Cupons"
                  )}
                </span>
              </Link>
            </div>

            {/* Search Bar para Desktop */}
            {settings.isNavbarSearchEnabled && (
              <div className="hidden md:flex flex-1 items-center justify-center px-6">
                <SearchBar className="max-w-xl" variant="navbar" tone={searchTone} />
              </div>
            )}

            <div className="flex items-center gap-1.5">
              {/* Botão de Busca para Mobile */}
              {settings.isNavbarSearchEnabled && (
                <button
                  onClick={() => setIsSearchOpen(!isSearchOpen)}
                  className="md:hidden p-1.5 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                >
                  <Search size={18} />
                </button>
              )}

              <div className="relative flex flex-col items-center">
                <button
                  onClick={async () => {
                    if (isRefreshing) return;
                    setIsRefreshing(true);
                    setRefreshStatus('loading');
                    try {
                      await reloadPosts?.();
                      setRefreshStatus('success');
                    } finally {
                      setTimeout(() => setIsRefreshing(false), 1000);
                      setTimeout(() => setRefreshStatus('idle'), 2500);
                    }
                  }}
                  className={`p-1.5 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-lg transition-all duration-300 ${isRefreshing ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400' : ''}`}
                  title="Atualizar conteúdo"
                  disabled={isRefreshing}
                >
                  <RefreshCw size={18} className={`${isRefreshing ? 'animate-spin' : 'hover:rotate-180 transition-transform duration-500'}`} />
                </button>
                {refreshStatus !== 'idle' && (
                  <div className="absolute top-full mt-1 text-[10px] font-bold whitespace-nowrap bg-slate-200 dark:bg-slate-700 px-2 py-1 rounded-md shadow-sm z-50">
                    {refreshStatus === 'loading' ? (
                      <span className="text-gray-500 dark:text-gray-300">
                        Atualizando...
                        <span className="inline-flex ml-1">
                          <span className="animate-bounce" style={{ animationDelay: '0ms' }}>.</span>
                          <span className="animate-bounce" style={{ animationDelay: '120ms' }}>.</span>
                          <span className="animate-bounce" style={{ animationDelay: '240ms' }}>.</span>
                        </span>
                      </span>
                    ) : (
                      <span className="text-green-600 dark:text-green-400">Posts Atualizados!</span>
                    )}
                  </div>
                )}
              </div>

              <button
                onClick={toggleTheme}
                className="p-1.5 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
              >
                {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
              </button>

              {/* Configurações */}
              <div className="relative" ref={settingsRef}>
                <button
                  onClick={() => setIsSettingsOpen(!isSettingsOpen)}
                  className={`p-1.5 rounded-lg transition-all ${isSettingsOpen ? 'bg-blue-100 dark:bg-slate-800 text-blue-600 dark:text-blue-400' : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-800'}`}
                >
                  <Settings size={18} />
                </button>

                {isSettingsOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-gray-200 dark:border-slate-700 p-3 animate-in zoom-in-95 duration-150 z-50">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Configurações</h3>
                      <button onClick={() => setIsSettingsOpen(false)} className="p-0.5 hover:bg-gray-100 dark:hover:bg-slate-700 rounded">
                        <X size={12} className="text-gray-400" />
                      </button>
                    </div>

                    <div className="space-y-2">
                      {/* Switch WhatsApp */}
                      <div className="flex items-center justify-between p-1.5 rounded-lg bg-gray-50 dark:bg-slate-700/50">
                        <div className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                          <FaWhatsapp size={16} className="text-green-500" />
                          <span>WhatsApp</span>
                        </div>
                        <button
                          onClick={() => settings.setIsWhatsAppVisible(!settings.isWhatsAppVisible)}
                          className={`w-9 h-5 rounded-full relative transition-all duration-200 ${settings.isWhatsAppVisible ? 'bg-blue-600' : 'bg-gray-300 dark:bg-slate-600'}`}
                        >
                          <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full transition-all shadow-sm ${settings.isWhatsAppVisible ? 'translate-x-4' : 'translate-x-0'} left-0.5`} />
                        </button>
                      </div>

                      {/* Switch Busca */}
                      <div className="flex items-center justify-between p-1.5 rounded-lg bg-gray-50 dark:bg-slate-700/50">
                        <div className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                          <Search size={16} className="text-blue-500" />
                          <span>Busca</span>
                        </div>
                        <button
                          onClick={() => settings.setIsNavbarSearchEnabled(!settings.isNavbarSearchEnabled)}
                          className={`w-9 h-5 rounded-full relative transition-all duration-200 ${settings.isNavbarSearchEnabled ? 'bg-blue-600' : 'bg-gray-300 dark:bg-slate-600'}`}
                        >
                          <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full transition-all shadow-sm ${settings.isNavbarSearchEnabled ? 'translate-x-4' : 'translate-x-0'} left-0.5`} />
                        </button>
                      </div>

                      {/* Grupo WhatsApp */}
                      <a
                        href="https://wa.me/seu-numero"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-between p-2 rounded-lg bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 group"
                      >
                        <div className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                          <FaWhatsapp size={16} className="text-green-500" />
                          <span>Grupo VIP</span>
                        </div>
                        <span className="text-xs font-bold text-green-600 dark:text-green-400 group-hover:text-green-700 dark:group-hover:text-green-300">
                          Entrar →
                        </span>
                      </a>
                    </div>
                  </div>
                )}
              </div>

              <button
                data-menu-button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="md:hidden p-1.5 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
              >
                {isMenuOpen ? <X size={22} /> : <Menu size={22} />}
              </button>
            </div>
          </div>

          {/* Segunda linha - Menu de navegação */}
          <div className="hidden md:flex items-center justify-center py-2 border-t border-gray-100 dark:border-slate-800">
            <div className="flex items-center gap-4">

                {/* Grupo: Ofertas, Imperdíveis, Cupons, Escolhas */}
                <div className="flex items-center gap-1">
                  {[
                    { id: 'ofertas', label: 'Ofertas', icon: FaStore, color: 'text-pink-500' },
                    { id: 'imperdiveis', label: 'Imperdíveis', icon: FaFireAlt, color: 'text-orange-500' },
                    { id: 'cupons', label: 'Cupons', icon: FaPercent, color: 'text-emerald-500' },
                    { id: 'blog', label: 'Blog', icon: LiaBlogSolid, color: 'text-blue-500', isLink: true },
                    { id: 'escolhas', label: 'Escolhas da fábrica', icon: Logo, isImage: true },
                  ].map((item) => {
                    const isActive = activeSection === item.id || (item.id === 'blog' && isBlogPage);
                    
                    if (item.isLink) {
                        return (
                            <Link
                                key={item.id}
                                href="/blog"
                                className={`
                                  relative flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-bold transition-all duration-300
                                  ${isActive
                                    ? 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20'
                                    : 'text-gray-500 dark:text-slate-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-slate-800/50'
                                  }
                                `}
                            >
                                <item.icon size={20} className={item.color} />
                                <span>{item.label}</span>
                            </Link>
                        );
                    }

                    return (
                      <button
                        key={item.id}
                        onClick={() => router.push(`/sections?section=${item.id}`)}
                        className={`
                          relative flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-bold transition-all duration-300
                          ${isActive
                            ? 'text-gray-900 dark:text-white bg-gray-100/80 dark:bg-slate-800/80'
                            : 'text-gray-500 dark:text-slate-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-slate-800/50'
                          }
                        `}
                      >
                        {item.isImage ? (
                          <div className="relative w-3 h-3">
                            <Image src={item.icon as string} alt="Logo" fill className="object-contain" />
                          </div>
                        ) : (
                          <item.icon size={14} className={item.color} />
                        )}
                        <span>{item.label}</span>
                      </button>
                    );
                  })}
                </div>

                {/* Categorias Dropdown */}
                <div className="relative" ref={categoriesRef}>
                  <button
                    onClick={() => setIsCategoriesOpen(!isCategoriesOpen)}
                    className={`
                      flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-bold transition-all duration-300
                      ${isCategoriesOpen
                        ? 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20'
                        : 'text-gray-500 dark:text-slate-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-slate-800/50'
                      }
                    `}
                  >
                    <MdCategory size={16} className="text-blue-500" />
                    <span>Categorias</span>
                    <ChevronDown size={14} className={`transition-transform duration-300 ${isCategoriesOpen ? 'rotate-180' : ''}`} />
                  </button>

                  {/* Dropdown de Categorias */}
                  {isCategoriesOpen && (
                    <div className="absolute top-full left-0 mt-2 w-80 bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-gray-100 dark:border-slate-700 p-4 animate-in zoom-in-95 duration-200 z-50">
                      <div className="grid grid-cols-2 gap-2">
                        {(showAllCategories ? availableCategories : availableCategories.slice(0, 8)).map((category) => (
                          <button
                            key={category}
                            onClick={() => handleCategorySelect(category)}
                            className="flex items-center gap-2.5 p-2 rounded-xl text-xs font-bold text-gray-600 dark:text-gray-300 hover:bg-blue-50 dark:hover:bg-slate-700/50 hover:text-blue-600 dark:hover:text-blue-400 transition-all group"
                          >
                            <div className="p-1.5 rounded-lg bg-gray-50 dark:bg-slate-900 group-hover:bg-white dark:group-hover:bg-slate-800 shadow-sm transition-colors">
                              {getCategoryIcon(category)}
                            </div>
                            <span className="font-medium truncate">{category}</span>
                          </button>
                        ))}
                        {!showAllCategories && availableCategories.length > 8 && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setShowAllCategories(true);
                            }}
                            className="col-span-2 text-center text-xs font-bold text-blue-500 py-2 hover:bg-blue-50 dark:hover:bg-slate-700/50 rounded-lg transition-colors"
                          >
                            Ver mais ({availableCategories.length - 8})
                          </button>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                <button
                  onClick={() => {
                    if (isHomePage) {
                      const postsSection = document.getElementById('posts-section');
                      if (postsSection) postsSection.scrollIntoView({ behavior: 'smooth' });
                    } else {
                      // Usar URLSearchParams para passar scrollTo e garantir que o useEffect na Home capture
                      router.push('/?view=informativo&scrollTo=posts-section');
                    }
                  }}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all duration-200 hover:text-blue-600 dark:hover:text-blue-400"
                >
                  <BookOpen size={14} className="text-cyan-500" />
                  <span>Artigos</span>
                </button>

                <a
                  href="https://wa.me/seu-numero"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 px-3 py-1.5 ml-1 rounded-lg text-sm font-medium text-white bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 transition-all duration-200 shadow-sm"
                >
                  <FaWhatsapp size={14} />
                  <span>Grupo WhatsApp</span>
                </a>
            </div>
          </div>

          {/* Search Bar para Mobile (quando aberto) */}
          {isSearchOpen && settings.isNavbarSearchEnabled && (
            <div className="md:hidden py-3 border-t border-gray-100 dark:border-slate-800 animate-in slide-in-from-top duration-300">
              <SearchBar isMobile={true} variant="navbar" tone={searchTone} />
            </div>
          )}
        </div>
      </nav>

      {/* Sidebar Menu */}
      <div className={`fixed inset-0 z-[110] md:hidden transition-all duration-300 ease-in-out ${isMenuOpen ? 'visible' : 'invisible'}`}>
        {/* Overlay */}
        <div
          className={`absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity duration-300 ${isMenuOpen ? 'opacity-100' : 'opacity-0'}`}
          onClick={() => setIsMenuOpen(false)}
        />

        {/* Menu Sidebar */}
        <div
          ref={sidebarRef}
          className={`absolute right-0 top-0 h-full w-64 bg-white dark:bg-slate-900 shadow-xl transition-transform duration-300 ease-in-out ${isMenuOpen ? 'translate-x-0' : 'translate-x-full'}`}
        >
          <div className="flex flex-col h-full">
            {/* Header fixo */}
            <div className="p-4 border-b border-gray-200 dark:border-slate-800">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="relative h-7 w-24">
                  <Image src={Logo} alt="Logo" fill className="object-contain object-left" />
                  </div>
                  <h2 className="text-lg font-bold text-gray-900 dark:text-white">Menu</h2>
                </div>
                <button onClick={() => setIsMenuOpen(false)} className="p-1.5 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-lg transition-colors">
                  <X size={18} className="text-gray-600 dark:text-gray-300" />
                </button>
              </div>
            </div>

            {/* Conteúdo com scroll */}
            <div className="flex-1 overflow-y-auto">
              <nav className="p-4 space-y-1">
                <button
                  onClick={() => { router.push('/'); setIsMenuOpen(false); }}
                  className="flex items-center gap-3 p-3 w-full text-left rounded-lg hover:bg-gray-100 dark:hover:bg-slate-800 transition-all group"
                >
                  <div className="p-1.5 rounded-lg bg-blue-100 dark:bg-blue-900/30">
                    <Home size={18} className="text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <span className="font-semibold text-gray-900 dark:text-white">Início</span>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Página principal</p>
                  </div>
                </button>

                <button
                  onClick={() => { router.push('/sections?section=ofertas'); setIsMenuOpen(false); }}
                  className="flex items-center gap-3 p-3 w-full text-left rounded-lg hover:bg-gray-100 dark:hover:bg-slate-800 transition-all group"
                >
                  <div className="p-1.5 rounded-lg bg-pink-100 dark:bg-pink-900/30">
                    <FaStore size={18} className="text-pink-600 dark:text-pink-400" />
                  </div>
                  <div>
                    <span className="font-semibold text-gray-900 dark:text-white">Ofertas</span>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Produtos em destaque</p>
                  </div>
                </button>

                <button
                  onClick={() => { router.push('/sections?section=imperdiveis'); setIsMenuOpen(false); }}
                  className="flex items-center gap-3 p-3 w-full text-left rounded-lg hover:bg-gray-100 dark:hover:bg-slate-800 transition-all group"
                >
                  <div className="p-1.5 rounded-lg bg-orange-100 dark:bg-orange-900/30">
                    <FaFireAlt size={18} className="text-orange-600 dark:text-orange-400" />
                  </div>
                  <div>
                    <span className="font-semibold text-gray-900 dark:text-white">Imperdíveis</span>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Ofertas especiais</p>
                  </div>
                </button>

                <button
                  onClick={() => { router.push('/sections?section=cupons'); setIsMenuOpen(false); }}
                  className="flex items-center gap-3 p-3 w-full text-left rounded-lg hover:bg-gray-100 dark:hover:bg-slate-800 transition-all group"
                >
                  <div className="p-1.5 rounded-lg bg-emerald-100 dark:bg-emerald-900/30">
                    <FaPercent size={18} className="text-emerald-600 dark:text-emerald-400" />
                  </div>
                  <div>
                    <span className="font-semibold text-gray-900 dark:text-white">Cupons</span>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Descontos exclusivos</p>
                  </div>
                </button>

                <button
                  onClick={() => { router.push('/blog'); setIsMenuOpen(false); }}
                  className="flex items-center gap-3 p-3 w-full text-left rounded-lg hover:bg-gray-100 dark:hover:bg-slate-800 transition-all group"
                >
                  <div className="p-1.5 rounded-lg bg-blue-100 dark:bg-blue-900/30">
                    <LiaBlogSolid size={18} className="text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <span className="font-semibold text-gray-900 dark:text-white">Blog</span>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Conteúdo do blog</p>
                  </div>
                </button>

                <button
                  onClick={() => { router.push('/sections?section=escolhas'); setIsMenuOpen(false); }}
                  className="flex items-center gap-3 p-3 w-full text-left rounded-lg hover:bg-gray-100 dark:hover:bg-slate-800 transition-all group"
                >
                  <div className="p-1.5 rounded-lg bg-blue-100 dark:bg-blue-900/30">
                    <div className="relative w-[18px] h-[18px]">
                      <Image src={Logo} alt="Logo" fill className="object-contain" />
                    </div>
                  </div>
                  <div>
                    <span className="font-semibold text-gray-900 dark:text-white">Escolhas da fábrica</span>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Seleção especial</p>
                  </div>
                </button>

                {/* Categorias no mobile */}
                <div ref={mobileCategoriesRef}>
                  <button
                    onClick={() => setIsCategoriesOpen(!isCategoriesOpen)}
                    className="flex items-center justify-between w-full p-3 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-800 transition-all"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-1.5 rounded-lg bg-blue-100 dark:bg-blue-900/30">
                        <MdCategory size={18} className="text-blue-600 dark:text-blue-400" />
                      </div>
                      <div>
                        <span className="font-semibold text-gray-900 dark:text-white">Categorias</span>
                        <p className="text-xs text-gray-500 dark:text-gray-400">Navegar por categoria</p>
                      </div>
                    </div>
                    <ChevronDown size={16} className={`transition-transform ${isCategoriesOpen ? 'rotate-180' : ''}`} />
                  </button>

                  {/* Submenu de Categorias com scroll */}
                  {isCategoriesOpen && (
                    <div className="ml-8 mt-1 mb-2 max-h-60 overflow-y-auto rounded-lg border border-gray-200 dark:border-slate-700">
                      {availableCategories.map(category => (
                        <button
                          key={category}
                          onClick={() => handleCategorySelect(category)}
                          className="flex items-center gap-2 p-2.5 w-full text-left hover:bg-gray-50 dark:hover:bg-slate-800 transition-all border-b border-gray-100 dark:border-slate-700 last:border-0"
                        >
                          <div className="p-1 bg-gray-100 dark:bg-slate-700 rounded">
                            {getCategoryIcon(category)}
                          </div>
                          <span className="text-sm text-gray-700 dark:text-gray-300">{category}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                <button
                  onClick={() => {
                    if (isHomePage) {
                      const postsSection = document.getElementById('posts-section');
                      if (postsSection) postsSection.scrollIntoView({ behavior: 'smooth' });
                    } else {
                      router.push('/?view=informativo&scrollTo=posts-section');
                    }
                    setIsMenuOpen(false);
                  }}
                  className="flex items-center gap-3 p-3 w-full text-left rounded-lg hover:bg-gray-100 dark:hover:bg-slate-800 transition-all group"
                >
                  <div className="p-1.5 rounded-lg bg-cyan-100 dark:bg-cyan-900/30">
                    <BookOpen size={18} className="text-cyan-600 dark:text-cyan-400" />
                  </div>
                  <div>
                    <span className="font-semibold text-gray-900 dark:text-white">Artigos</span>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Conteúdo educativo</p>
                  </div>
                </button>

                <a
                  href="https://wa.me/seu-numero"
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => setIsMenuOpen(false)}
                  className="flex items-center gap-3 p-3 w-full text-left rounded-lg bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 hover:shadow-md transition-all group"
                >
                  <div className="p-1.5 rounded-lg bg-green-100 dark:bg-green-900/30">
                    <FaWhatsapp size={18} className="text-green-600 dark:text-green-400" />
                  </div>
                  <div>
                    <span className="font-semibold text-gray-900 dark:text-white">Grupo WhatsApp</span>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Comunidade VIP</p>
                  </div>
                </a>
              </nav>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Navbar;
