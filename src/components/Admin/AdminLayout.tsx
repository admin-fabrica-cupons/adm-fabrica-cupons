import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import {
  FileText, FolderTree, LogOut, Menu, X, ChevronLeft,
  Home, ChevronsRight,
  Settings, Archive, HelpCircle, Moon, Sun,
  Shield, PanelLeftClose, PanelLeftOpen,
  Minimize2, Maximize2, Bell, Gift
} from 'lucide-react';
import { NotificationPill, NotificationHistoryPopup, useNotifications, NotificationStyles } from '../Common/NotificationContext';
import { RiRobot3Fill, RiDraftFill } from 'react-icons/ri';
import { useAppSounds } from '../../hooks/useAppSounds';

interface AdminLayoutProps {
  children: React.ReactNode;
  title?: string;
  onBack?: () => void;
  sidebarOpen?: boolean;
  setSidebarOpen?: (open: boolean) => void;
  activeSection?: string;
  setActiveSection?: (section: string) => void;
  onLogout?: () => void;
  onSaveDraft?: () => void;
  showSaveButton?: boolean;
  theme?: 'light' | 'dark';
  toggleTheme?: () => void;
  saveDraftDisabled?: boolean;
  rightSidebar?: React.ReactNode;
  rightSidebarOpen?: boolean;
  onRightSidebarClose?: () => void;
  onRightSidebarToggle?: () => void;
}

const AdminLayout: React.FC<AdminLayoutProps> = ({
  children,
  title,
  onBack,
  sidebarOpen: externalSidebarOpen,
  setSidebarOpen: externalSetSidebarOpen,
  activeSection = 'posts',
  setActiveSection,
  onLogout,
  onSaveDraft,
  showSaveButton = false,
  theme = 'light',
  toggleTheme,
  saveDraftDisabled = false,
  rightSidebar,
  rightSidebarOpen = false,
  onRightSidebarClose,
  onRightSidebarToggle
}) => {
  // Estados internos para controle da sidebar
  const [internalSidebarOpen, setInternalSidebarOpen] = useState(true);
  const [sidebarMode, setSidebarMode] = useState<'expanded' | 'collapsed' | 'hidden'>('expanded');
  const [sidebarWidth, setSidebarWidth] = useState(280);
  const [isResizing, setIsResizing] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [showSiteConfirmModal, setShowSiteConfirmModal] = useState(false);

  // Use estado externo se fornecido, senão use interno
  const sidebarOpen = externalSidebarOpen !== undefined ? externalSidebarOpen : internalSidebarOpen;
  const setSidebarOpen = externalSetSidebarOpen || setInternalSidebarOpen;

  // Hook para notificações
  const { currentNotification, removeCurrentNotification, unreadCount } = useNotifications();
  const { playExitConfirmed } = useAppSounds();

  const menuItems = [
    { icon: <FileText size={20} />, label: 'Posts', id: 'posts', description: 'Gerencie todos os posts do blog' },
    { icon: <Gift size={20} />, label: 'Adicionar Ofertas', id: 'offers', description: 'Crie produtos e cupons independentes' },
    { icon: <Archive size={20} />, label: 'Rascunhos', id: 'drafts', description: 'Posts salvos como rascunho' },
    { icon: <FolderTree size={20} />, label: 'Categorias', id: 'categories', description: 'Organize as categorias do blog' },
    { icon: <Settings size={20} />, label: 'Configurações', id: 'settings', description: 'Personalize o sistema' },
  ];

  // Função para detectar se o children é EditPostView
  const isEditPostView = () => {
    // Método 1: Verificar se há props específicas do EditPostView
    if (showSaveButton) {
      return true;
    }

    // Método 2: Verificar pelo título
    if (title === 'Editar Post' || title === 'Criar Novo Post') {
      return true;
    }

    // Método 3: Verificar pela estrutura dos children
    try {
      // Podemos tentar detectar por alguma propriedade específica
      if (React.isValidElement(children)) {
        const childType = (children as any).type;
        if (childType && (childType.name === 'EditPostView' || childType.displayName === 'EditPostView')) {
          return true;
        }
      }
    } catch (e) {
      // Ignorar erros
    }

    return false;
  };

  const handleDefaultLogout = () => {
    localStorage.removeItem('auth-token');
    window.location.href = '/';
  };

  // Obter ícone da seção ativa
  const getActiveSectionIcon = () => {
    const activeItem = menuItems.find(item => item.id === activeSection);
    return activeItem ? activeItem.icon : <FileText size={20} />;
  };

  // Efeito para sincronizar modos
  useEffect(() => {
    if (!sidebarOpen) {
      setSidebarMode('hidden');
    } else if (sidebarWidth <= 100) {
      setSidebarMode('collapsed');
    } else {
      setSidebarMode('expanded');
    }
  }, [sidebarOpen, sidebarWidth]);

  // Efeito para resize da sidebar
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isResizing) return;

      const newWidth = Math.max(80, Math.min(400, e.clientX));
      setSidebarWidth(newWidth);

      // Auto-ajuste de modo baseado na largura
      if (newWidth <= 100) {
        setSidebarMode('collapsed');
      } else {
        setSidebarMode('expanded');
      }
    };

    const handleMouseUp = () => {
      setIsResizing(false);
      document.body.classList.remove('select-none', 'cursor-col-resize');
    };

    if (isResizing) {
      document.body.classList.add('select-none', 'cursor-col-resize');
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isResizing]);

  const startResizing = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsResizing(true);
  };

  const toggleSidebarVisibility = () => {
    if (sidebarMode === 'hidden') {
      setSidebarOpen(true);
      setSidebarWidth(280);
      setSidebarMode('expanded');
    } else {
      setSidebarOpen(false);
      setSidebarMode('hidden');
    }
  };

  const toggleSidebarMode = () => {
    if (sidebarMode === 'expanded') {
      setSidebarWidth(80);
      setSidebarMode('collapsed');
    } else if (sidebarMode === 'collapsed') {
      setSidebarWidth(280);
      setSidebarMode('expanded');
    } else {
      setSidebarOpen(true);
      setSidebarWidth(280);
      setSidebarMode('expanded');
    }
  };

  // Conteúdo da ajuda
  const helpContent = {
    posts: 'Gerencie todos os posts do seu blog. Crie novos posts, edite existentes ou exclua posts antigos.',
    drafts: 'Aqui você encontra todos os seus rascunhos salvos. Os rascunhos são salvos automaticamente a cada 2 minutos.',
    categories: 'Organize seus posts em categorias. Crie, edite ou exclua categorias para melhor organização.',
    settings: 'Configure as preferências do sistema, incluindo tema visual e opções de exibição.',
    editor: 'No editor de posts, use a sidebar para navegar entre os blocos. Arraste para reordenar e clique para editar.',
    widgets: 'Cada widget tem uma pré-visualização disponível clicando no ícone de olho na sidebar.',
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900 overflow-x">
      <NotificationStyles />

      {/* Modal de Confirmação para Ver Site */}
      {showSiteConfirmModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-gray-200 dark:border-slate-700">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <Home size={20} className="text-blue-500" />
                Ir para o Site?
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                Você será redirecionado para a página inicial do site.
              </p>
            </div>

            <div className="p-6 flex gap-3 justify-end">
              <button
                onClick={() => setShowSiteConfirmModal(false)}
                className="px-4 py-2 bg-gray-100 dark:bg-slate-700 hover:bg-gray-200 dark:hover:bg-slate-600 text-gray-700 dark:text-gray-300 font-medium rounded-lg transition"
              >
                Cancelar
              </button>
              <button
                onClick={() => {
                  playExitConfirmed();
                  setTimeout(() => {
                    window.location.href = '/';
                  }, 500);
                }}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition shadow-lg shadow-blue-500/20"
              >
                Confirmar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Ajuda */}
      {showHelp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[80vh] flex flex-col">
            <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-slate-700">
              <div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                  <HelpCircle size={20} />
                  Ajuda do Sistema Administrativo
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  Guia rápido para usar todas as funcionalidades
                </p>
              </div>
              <button
                onClick={() => setShowHelp(false)}
                className="p-2 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg transition"
              >
                <X size={20} className="text-gray-500 dark:text-gray-400" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6">
              <div className="space-y-6">
                <div>
                  <h4 className="font-bold text-gray-900 dark:text-white mb-3">Seções Principais</h4>
                  <div className="grid gap-3">
                    {menuItems.map(item => (
                      <div key={item.id} className="p-3 bg-gray-50 dark:bg-slate-700/30 rounded-lg">
                        <div className="flex items-center gap-2 mb-1">
                          {item.icon}
                          <span className="font-medium text-gray-900 dark:text-white">{item.label}</span>
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">{item.description}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="font-bold text-gray-900 dark:text-white mb-3">Controles da Sidebar</h4>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-slate-700/30 rounded-lg">
                      <PanelLeftOpen size={20} className="text-blue-500" />
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">Abrir/Fechar Sidebar</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          Esconde ou mostra completamente a sidebar
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-slate-700/30 rounded-lg">
                      <Minimize2 size={20} className="text-green-500" />
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">Modo Compacto/Expandido</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          Alterna entre mostrar apenas ícones ou ícones com texto
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-bold text-gray-900 dark:text-white mb-3">Editor de Posts</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                    {helpContent.editor}
                  </p>
                  <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1 ml-4 list-disc">
                    <li>Use os botões superiores para adicionar novos blocos</li>
                    <li>Arraste os blocos na sidebar para reordenar</li>
                    <li>Clique no ícone de olho para pré-visualizar cada widget</li>
                    <li>Clique no número do bloco para navegar diretamente</li>
                  </ul>
                </div>

                <div>
                  <h4 className="font-bold text-gray-900 dark:text-white mb-3">Auto-save</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Os rascunhos são salvos automaticamente a cada 2 minutos de inatividade. Você verá uma notificação quando isso acontecer.
                  </p>
                </div>
              </div>
            </div>

            <div className="p-6 border-t border-gray-200 dark:border-slate-700">
              <button
                onClick={() => setShowHelp(false)}
                className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition"
              >
                Fechar Ajuda
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Mobile sidebar */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 flex md:hidden">
          <div className="fixed inset-0 bg-gray-600/75 dark:bg-gray-900/75 backdrop-blur-sm" onClick={() => setSidebarOpen(false)} />
          <div className="relative flex-1 flex flex-col max-w-xs w-full bg-white dark:bg-slate-800 shadow-2xl">
            <div className="flex-1 h-0 pt-5 pb-4 overflow-y-auto">
              <div className="flex items-center justify-between px-4">
                <h1 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                  <Shield size={20} />
                  Admin
                </h1>
                <button
                  onClick={() => setSidebarOpen(false)}
                  className="ml-1 flex items-center justify-center h-10 w-10 rounded-full hover:bg-gray-100 dark:hover:bg-slate-700 transition"
                >
                  <X className="h-6 w-6 text-gray-500 dark:text-gray-400" />
                </button>
              </div>

              <nav className="mt-6 px-2 space-y-1">
                {menuItems.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => {
                      setActiveSection?.(item.id);
                      setSidebarOpen(false);
                    }}
                    className={`group flex items-center px-3 py-3 text-base font-medium rounded-lg w-full text-left transition-all ${activeSection === item.id
                        ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg'
                        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-700 hover:text-gray-900 dark:hover:text-white'
                      }`}
                  >
                    <div className={`${activeSection === item.id ? 'text-white' : 'text-gray-500 dark:text-gray-400'}`}>
                      {item.icon}
                    </div>
                    <span className="ml-3">{item.label}</span>
                  </button>
                ))}
              </nav>

              <div className="mt-8 px-3">
                <div className="pt-4 border-t border-gray-200 dark:border-slate-700">
                  <button
                    onClick={() => setShowSiteConfirmModal(true)}
                    className="group flex items-center px-3 py-2 text-sm font-medium rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-700 transition w-full"
                  >
                    <Home size={18} className="mr-3" />
                    Ver Site
                  </button>
                  {toggleTheme && (
                    <button
                      onClick={toggleTheme}
                      className="group flex items-center px-3 py-2 text-sm font-medium rounded-lg w-full text-left text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-700 transition mt-2"
                    >
                      {theme === 'dark' ? (
                        <>
                          <Sun size={18} className="mr-3" />
                          Modo Claro
                        </>
                      ) : (
                        <>
                          <Moon size={18} className="mr-3" />
                          Modo Escuro
                        </>
                      )}
                    </button>
                  )}
                  <button
                    onClick={() => setShowHelp(true)}
                    className="group flex items-center px-3 py-2 text-sm font-medium rounded-lg w-full text-left text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-700 transition mt-2"
                  >
                    <HelpCircle size={18} className="mr-3" />
                    Ajuda
                  </button>
                  <button
                    onClick={onLogout || handleDefaultLogout}
                    className="group flex items-center px-3 py-2 text-sm font-medium rounded-lg w-full text-left text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition mt-2"
                  >
                    <LogOut size={18} className="mr-3" />
                    Sair
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Desktop sidebar */}
      {sidebarOpen && (
        <div
          className={`hidden md:flex md:flex-col md:fixed md:inset-y-0 transition-all duration-300 ease-in-out z-30`}
          style={{
            width: `${sidebarWidth}px`,
            minWidth: sidebarMode === 'collapsed' ? '80px' : '200px',
            maxWidth: '400px'
          }}
        >
          {/* Handle de redimensionamento */}
          <div
            className={`absolute right-0 top-0 bottom-0 w-2 flex items-center justify-center z-40 cursor-col-resize ${isResizing
                ? 'bg-blue-500/30'
                : 'hover:bg-blue-500/20'
              }`}
            onMouseDown={startResizing}
            title="Redimensionar sidebar"
          >
            <div className={`
              w-1 h-20 rounded-full transition-all duration-200
              ${isResizing
                ? 'bg-blue-500 w-2'
                : 'bg-gray-300 dark:bg-slate-600 hover:bg-blue-400 hover:w-2'
              }
            `} />
          </div>

          <div className="flex-1 flex flex-col min-h-0 border-r border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 shadow-lg">
            {/* Sidebar header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-100 dark:border-slate-700">
              {sidebarMode === 'expanded' ? (
                <>
                  <h1 className="text-lg font-bold text-gray-900 dark:text-white truncate">
                    <span className="truncate">Painel Admin</span>
                  </h1>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={toggleSidebarMode}
                      className="p-1.5 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg transition flex-shrink-0"
                      title="Modo compacto"
                    >
                      <Minimize2 size={18} className="text-gray-500 dark:text-gray-400" />
                    </button>
                    <button
                      onClick={toggleSidebarVisibility}
                      className="p-1.5 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg transition flex-shrink-0"
                      title="Fechar sidebar"
                    >
                      <PanelLeftClose size={18} className="text-gray-500 dark:text-gray-400" />
                    </button>
                  </div>
                </>
              ) : (
                <div className="flex flex-col items-center gap-3 w-full">
                  <button
                    onClick={toggleSidebarMode}
                    className="p-1.5 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg transition w-full flex justify-center"
                    title="Expandir sidebar"
                  >
                    <Maximize2 size={18} className="text-gray-500 dark:text-gray-400" />
                  </button>
                </div>
              )}
            </div>

            {/* Navigation */}
            <nav className="flex-1 px-3 py-4 overflow-y-auto">
              <div className="space-y-1">
                {menuItems.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => setActiveSection?.(item.id)}
                    className={`group flex items-center ${sidebarMode === 'collapsed' ? 'justify-center px-3' : 'px-3'
                      } py-2.5 text-sm font-medium rounded-lg w-full text-left transition-all ${activeSection === item.id
                        ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-md'
                        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-700 hover:text-gray-900 dark:hover:text-white'
                      }`}
                    title={sidebarMode === 'collapsed' ? item.label : undefined}
                  >
                    <div className={`flex-shrink-0 ${activeSection === item.id ? 'text-white' : 'text-gray-500 dark:text-gray-400'
                      }`}>
                      {item.icon}
                    </div>
                    {sidebarMode === 'expanded' && (
                      <>
                        <span className="ml-3 truncate">{item.label}</span>
                        {activeSection === item.id && (
                          <ChevronsRight size={14} className="ml-auto text-white/80 flex-shrink-0" />
                        )}
                      </>
                    )}
                  </button>
                ))}
              </div>

              {/* Ações rápidas - aparece em ambos os modos */}
              <div className="mt-8">
                {sidebarMode === 'expanded' ? (
                  <>
                    <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2 px-2">
                      Ações Rápidas
                    </h3>
                    <div className="space-y-1">
                      <button
                        onClick={() => setShowSiteConfirmModal(true)}
                        className="flex items-center px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg transition w-full"
                      >
                        <Home size={16} className="mr-3 flex-shrink-0" />
                        <span className="truncate">Ver Site</span>
                      </button>
                      {toggleTheme && (
                        <button
                          onClick={toggleTheme}
                          className="flex items-center px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg transition w-full"
                        >
                          {theme === 'dark' ? (
                            <>
                              <Sun size={16} className="mr-3 flex-shrink-0" />
                              <span className="truncate">Modo Claro</span>
                            </>
                          ) : (
                            <>
                              <Moon size={16} className="mr-3 flex-shrink-0" />
                              <span className="truncate">Modo Escuro</span>
                            </>
                          )}
                        </button>
                      )}
                      <button
                        onClick={() => setShowHelp(true)}
                        className="flex items-center px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg transition w-full"
                      >
                        <HelpCircle size={16} className="mr-3 flex-shrink-0" />
                        <span className="truncate">Ajuda</span>
                      </button>
                    </div>
                  </>
                ) : (
                  // Ações rápidas no modo compacto - mostradas normalmente
                  <div className="space-y-1">
                    <button
                      onClick={() => setShowSiteConfirmModal(true)}
                      className="flex items-center justify-center px-3 py-2.5 text-sm font-medium rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-700 transition w-full"
                      title="Ver Site"
                    >
                      <Home size={20} className="text-gray-500 dark:text-gray-400" />
                    </button>
                    {toggleTheme && (
                      <button
                        onClick={toggleTheme}
                        className="flex items-center justify-center px-3 py-2.5 text-sm font-medium rounded-lg w-full text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-700 transition"
                        title={theme === 'dark' ? 'Modo Claro' : 'Modo Escuro'}
                      >
                        {theme === 'dark' ? (
                          <Sun size={20} className="text-gray-500 dark:text-gray-400" />
                        ) : (
                          <Moon size={20} className="text-gray-500 dark:text-gray-400" />
                        )}
                      </button>
                    )}
                    <button
                      onClick={() => setShowHelp(true)}
                      className="flex items-center justify-center px-3 py-2.5 text-sm font-medium rounded-lg w-full text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-700 transition"
                      title="Ajuda"
                    >
                      <HelpCircle size={20} className="text-gray-500 dark:text-gray-400" />
                    </button>
                  </div>
                )}
              </div>
            </nav>

            {/* User section / Logout */}
            <div className="border-t border-gray-100 dark:border-slate-700 p-4">
              {sidebarMode === 'expanded' ? (
                <div className="flex items-center justify-between">
                  <div className="flex items-center min-w-0">
                    <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center flex-shrink-0">
                      <Shield size={18} className="text-white" />
                    </div>
                    <div className="ml-3 min-w-0">
                      <p className="text-sm font-medium text-gray-900 dark:text-white truncate">Admin</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 truncate">Sistema</p>
                    </div>
                  </div>
                  <button
                    onClick={onLogout || handleDefaultLogout}
                    className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition flex-shrink-0 ml-2"
                    title="Sair"
                  >
                    <LogOut size={18} />
                  </button>
                </div>
              ) : (
                <div className="flex justify-center">
                  <button
                    onClick={onLogout || handleDefaultLogout}
                    className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition"
                    title="Sair"
                  >
                    <LogOut size={18} />
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Right Sidebar (AIChat) */}
      {!isEditPostView() && (
        <div
          className={`hidden lg:block fixed right-0 z-30 bg-white dark:bg-slate-800 border-l border-gray-200 dark:border-slate-700 transition-transform duration-300 ease-in-out shadow-xl`}
          style={{
            width: '400px',
            transform: rightSidebarOpen ? 'translateX(0)' : 'translateX(100%)',
            top: '0',
            height: '100vh'
          }}
        >
          {rightSidebar || <div id="admin-right-sidebar-portal" className="h-full w-full" />}
        </div>
      )}

      {/* Main content */}
      <div
        className="flex flex-col flex-1 transition-all duration-300 ease-in-out max-w-full"
        style={{
          marginLeft: sidebarOpen ? `${sidebarWidth}px` : '0px',
          marginRight: rightSidebarOpen && !isEditPostView() ? '400px' : '0px'
        }}
      >
        {/* Mobile header */}
        <div className="sticky top-0 z-30 md:hidden bg-white dark:bg-slate-800 border-b border-gray-200 dark:border-slate-700">
          <div className="flex items-center justify-between px-4 py-3">
            <button
              type="button"
              onClick={() => setSidebarOpen(true)}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-700"
              title="Abrir menu"
            >
              <Menu className="h-5 w-5 text-gray-500 dark:text-gray-400" />
            </button>
            <div className="flex items-center gap-2 px-2">
              {/* Ícone da seção ativa aparece sempre no mobile */}
              <div className="text-gray-500 dark:text-gray-400">
                {getActiveSectionIcon()}
              </div>
              <h1 className="text-lg font-semibold text-gray-900 dark:text-white truncate">
                {title || 'Admin'}
              </h1>
            </div>
            <div className="w-9"></div> {/* Spacer for alignment */}
          </div>
        </div>

        {/* Desktop header - Layout de 3 colunas */}
        <div className="sticky top-0 z-20 hidden md:flex bg-white dark:bg-slate-800 border-b border-gray-200 dark:border-slate-700 shadow-sm">
          <div className="w-full px-6 py-3">
            <div className="flex items-center justify-between gap-4">
              {/* Coluna 1: Título/Logo */}
              <div className="flex items-center gap-4 min-w-0 flex-1">
                {!sidebarOpen && (
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => {
                        setSidebarOpen(true);
                        setSidebarMode('expanded');
                        setSidebarWidth(280);
                      }}
                      className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-700 flex-shrink-0"
                      title="Abrir sidebar"
                    >
                      <PanelLeftOpen className="h-5 w-5 text-gray-500 dark:text-gray-400" />
                    </button>
                    <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400">
                      {getActiveSectionIcon()}
                    </div>
                  </div>
                )}
                <div className="flex items-center gap-4 min-w-0">
                  {onBack && (
                    <button
                      onClick={onBack}
                      className="flex items-center gap-1 px-3 py-1.5 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg transition flex-shrink-0"
                    >
                      <ChevronLeft size={16} />
                      <span className="hidden sm:inline">Voltar</span>
                    </button>
                  )}
                  {title && (
                    <div className="min-w-0">
                      <h1 className="text-xl font-semibold text-gray-900 dark:text-white truncate">
                        {title}
                      </h1>
                    </div>
                  )}
                </div>
              </div>

              {/* Coluna 2: Espaço Central para Notificação */}
              <div className="flex-1 max-w-md mx-4">
                <div
                  onClick={() => setShowHistory(true)}
                  className="cursor-pointer h-full relative"
                >
                  {currentNotification ? (
                    <div className="flex items-center justify-center h-full">
                      <div className="w-full relative">
                        <NotificationPill
                          notification={currentNotification}
                          onClose={removeCurrentNotification}
                        />
                        {/* Badge vermelho com número de notificações não lidas */}
                        {unreadCount > 1 && (
                          <div className="absolute -top-2 -right-2">
                            <span className="flex items-center justify-center w-6 h-6 bg-red-500/70 text-white text-xs font-bold rounded-full shadow-sm ">
                              {unreadCount}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center gap-2 px-4 py-2 rounded-full border border-gray-300 dark:border-slate-600 bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm h-full">
                      <Bell className="w-4 h-4 text-gray-400" />
                      <span className="text-sm text-gray-500 dark:text-gray-400 truncate">
                        As notificações aparecerão aqui
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Coluna 3: Botões de Ação */}
              <div className="flex items-center gap-2 flex-1 justify-end">
                {rightSidebar && !rightSidebarOpen && (
                  <button
                    onClick={() => onRightSidebarToggle?.()}
                    className="flex items-center gap-2 px-3 py-2 text-sm font-bold rounded-lg transition-all duration-300 shadow-sm flex-shrink-0 bg-transparent text-white border border-white/40 hover:bg-white/10"
                    title="Lu"
                  >
                    <RiRobot3Fill size={18} className="text-white" />
                    <span className="hidden sm:inline">Lu</span>
                  </button>
                )}

                {showSaveButton && onSaveDraft && (
                  <button
                    onClick={onSaveDraft}
                    disabled={saveDraftDisabled}
                    className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition shadow-sm flex-shrink-0 ${saveDraftDisabled
                        ? 'opacity-50 cursor-not-allowed bg-blue-400'
                        : 'bg-blue-600 hover:bg-blue-700 text-white'
                      }`}
                  >
                    <RiDraftFill size={16} />
                    <span className="hidden sm:inline">Salvar Rascunho</span>
                  </button>
                )}

              </div>
            </div>
          </div>
        </div>

        {/* Main content area - CONDIÇÃO PARA EditPostView */}
        <main className="flex-1">
          {isEditPostView() ? (
            // Para EditPostView: SEM PADDING
            <div className="h-[calc(100vh-4rem)]">
              {children}
            </div>
          ) : (
            // Para outros componentes: COM PADDING NORMAL
            <div className="py-6">
              <div className="max-w-8xl mx-auto px-4 sm:px-6 md:px-8">
                {children}
              </div>
            </div>
          )}
        </main>
      </div>

      {/* Histórico de Notificações (popup) */}
      <NotificationHistoryPopup
        isOpen={showHistory}
        onClose={() => setShowHistory(false)}
      />
    </div>
  );
};

export default AdminLayout;
