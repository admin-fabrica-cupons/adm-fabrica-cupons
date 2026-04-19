import React, { createContext, useContext, useState, ReactNode, useRef, useEffect, useCallback, useMemo } from 'react';
import { CheckCircle, XCircle, AlertCircle, Info, X, Clock, Trash2, Check, Bell, RefreshCw } from 'lucide-react';
import { useAppSounds } from '../../hooks/useAppSounds';

export type NotificationType = 'success' | 'error' | 'warning' | 'info' | 'sync' | 'loading' | 'progress';

export interface Notification {
  id: string;
  type: NotificationType;
  message: string;
  duration?: number;
  timestamp: Date;
  read: boolean;
  progress?: number; // 0-100 para tipo 'progress'
}

interface NotificationContextType {
  notifications: Notification[];
  currentNotification: Notification | null;
  addNotification: (notification: Omit<Notification, 'id' | 'timestamp' | 'read'>) => string;
  updateNotification: (id: string, updates: Partial<Omit<Notification, 'id' | 'timestamp'>>) => void;
  removeCurrentNotification: () => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  clearHistory: () => void;
  unreadCount: number;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

const NOTIFICATIONS_STORAGE_KEY = 'fabrica-cupons-notifications';

export const NotificationProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { playSuccess, playError, playWarning, playNotification } = useAppSounds();

  const [notifications, setNotifications] = useState<Notification[]>([]);

  const [currentNotification, setCurrentNotification] = useState<Notification | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(NOTIFICATIONS_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        const restored = parsed.map((n: any) => ({
          ...n,
          timestamp: new Date(n.timestamp)
        }));
        setNotifications(prev => (prev.length > 0 ? prev : restored));
      }
    } catch (error) {
      console.error('Erro ao restaurar notificações:', error);
    }
  }, []);

  // Salvar notificações no localStorage
  useEffect(() => {
    localStorage.setItem(NOTIFICATIONS_STORAGE_KEY, JSON.stringify(notifications));
  }, [notifications]);

  // Todas as funções memoizadas com useCallback para manter referência estável
  const markAsRead = useCallback((id: string) => {
    setNotifications(prev => 
      prev.map(n => n.id === id ? { ...n, read: true } : n)
    );
  }, []);

  const removeCurrentNotification = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }

    if (currentNotification) {
      // Marcar como lida ao ser removida
      markAsRead(currentNotification.id);
      setCurrentNotification(null);
    }
  }, [currentNotification, markAsRead]);

  const markAllAsRead = useCallback(() => {
    setNotifications(prev => 
      prev.map(n => ({ ...n, read: true }))
    );
  }, []);

  // Cleanup do timeout
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
    };
  }, []);

  // Processar fila de notificações - memoizado para evitar loops
  useEffect(() => {
    if (notifications.length === 0) {
      setCurrentNotification(null);
      return;
    }

    // Encontrar a notificação mais recente não lida
    const latestUnread = notifications.find(n => !n.read);
    const nextNotification = latestUnread || notifications[0];
    
    // Se não há notificação atual OU se a nova é diferente da atual
    if (!currentNotification || currentNotification.id !== nextNotification.id) {
      // Limpar timeout anterior
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }

      // Definir nova notificação
      setCurrentNotification(nextNotification);

      // Configurar timeout para remover automaticamente (exceto para durações 0 e tipos de progresso)
      if (nextNotification.duration !== 0 && nextNotification.type !== 'progress') {
        timeoutRef.current = setTimeout(() => {
          removeCurrentNotification();
        }, nextNotification.duration || 4000);
      }
    }
  }, [notifications, currentNotification, removeCurrentNotification]);

  const addNotification = useCallback((notification: Omit<Notification, 'id' | 'timestamp' | 'read'>): string => {
    // Play sound based on type
    if (notification.type === 'error') {
      playError();
    }
    // Other sounds removed as requested to avoid repetition
    
    const id = Math.random().toString(36).substring(2, 9);
    const newNotification: Notification = {
      ...notification,
      id,
      timestamp: new Date(),
      read: false
    };

    setNotifications(prev => [newNotification, ...prev]);
    
    return id;
  }, [playError]);

  const updateNotification = useCallback((id: string, updates: Partial<Omit<Notification, 'id' | 'timestamp'>>) => {
    setNotifications(prev => 
      prev.map(n => n.id === id ? { ...n, ...updates } : n)
    );

    // Se a notificação atualizada é a que está sendo exibida, atualizar também
    if (currentNotification?.id === id) {
      setCurrentNotification(prev => prev ? { ...prev, ...updates } : null);
      
      // Se a notificação foi atualizada para um tipo que não é progresso e tem duração, configurar timeout
      if (updates.type && updates.type !== 'progress' && updates.duration !== 0) {
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
        }
        timeoutRef.current = setTimeout(() => {
          removeCurrentNotification();
        }, updates.duration || 4000);
      }
    }
  }, [currentNotification, removeCurrentNotification]);

  const clearHistory = useCallback(() => {
    setNotifications([]);
    if (currentNotification) {
      removeCurrentNotification();
    }
  }, [currentNotification, removeCurrentNotification]);

  const unreadCount = useMemo(() => 
    notifications.filter(n => !n.read).length, 
    [notifications]
  );

  // Valor do contexto memoizado para manter referência estável
  const contextValue = useMemo((): NotificationContextType => ({
    notifications,
    currentNotification,
    addNotification,
    updateNotification,
    removeCurrentNotification,
    markAsRead,
    markAllAsRead,
    clearHistory,
    unreadCount
  }), [
    notifications,
    currentNotification,
    addNotification,
    updateNotification,
    removeCurrentNotification,
    markAsRead,
    markAllAsRead,
    clearHistory,
    unreadCount
  ]);

  return (
    <NotificationContext.Provider value={contextValue}>
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within NotificationProvider');
  }
  return context;
};

// Componente da notificação individual (estilo pílula)
export const NotificationPill: React.FC<{
  notification: Notification;
  onClose?: () => void;
  compact?: boolean;
}> = ({ notification, onClose, compact = false }) => {
  const getIcon = (notification: Notification) => {
    const { type, progress } = notification;
    
    switch (type) {
      case 'success': return <CheckCircle className="w-4 h-4" />;
      case 'error': return <XCircle className="w-4 h-4" />;
      case 'warning': return <AlertCircle className="w-4 h-4" />;
      case 'info': return <Info className="w-4 h-4" />;
      case 'sync': 
        return <RefreshCw className="w-4 h-4" />;
      case 'loading': 
        return <div className="w-4 h-4 animate-spin rounded-full border-2 border-white border-t-transparent" />;
      case 'progress':
        return (
          <div className="relative w-4 h-4">
            <div className="absolute inset-0 rounded-full border-2 border-white/30" />
            <div 
              className="absolute inset-0 rounded-full border-2 border-white border-t-transparent"
              style={{
                transform: `rotate(${360 * (progress || 0) / 100}deg)`,
                transition: 'transform 0.3s ease'
              }}
            />
          </div>
        );
      default: return <Info className="w-4 h-4" />;
    }
  };

  const getStyles = (type: NotificationType, read: boolean) => {
    const base = "rounded-full px-4 py-2 border transition-all";
    const readStyle = read ? "opacity-60 saturate-0 grayscale" : "";
    const shakeStyle = (type === 'error' || type === 'warning') && !read ? "animate-shake" : "";
    
    switch (type) {
      case 'success':
        return `${base} ${readStyle} ${shakeStyle} bg-green-100/80 border-green-200 dark:bg-green-900/20 dark:border-green-800`;
      case 'error':
        return `${base} ${readStyle} ${shakeStyle} bg-red-100/80 border-red-200 dark:bg-red-900/20 dark:border-red-800`;
      case 'warning':
        return `${base} ${readStyle} ${shakeStyle} bg-yellow-100/80 border-yellow-200 dark:bg-yellow-900/20 dark:border-yellow-800`;
      case 'info':
        return `${base} ${readStyle} ${shakeStyle} bg-blue-100/80 border-blue-200 dark:bg-blue-900/20 dark:border-blue-800`;
      case 'sync':
        return `${base} ${readStyle} ${shakeStyle} bg-indigo-100/80 border-indigo-200 dark:bg-indigo-900/20 dark:border-indigo-800`;
      case 'loading':
        return `${base} ${readStyle} ${shakeStyle} bg-purple-100/80 border-purple-200 dark:bg-purple-900/20 dark:border-purple-800`;
      case 'progress':
        return `${base} ${readStyle} ${shakeStyle} bg-gradient-to-r from-indigo-100/80 to-purple-100/80 border-indigo-200 dark:from-indigo-900/20 dark:to-purple-900/20 dark:border-indigo-800`;
      default:
        return `${base} ${readStyle} ${shakeStyle} bg-blue-100/80 border-blue-200 dark:bg-blue-900/20 dark:border-blue-800`;
    }
  };

  const getIconColor = (type: NotificationType, read: boolean) => {
    if (read) return "text-gray-500 dark:text-gray-400";
    
    switch (type) {
      case 'success': return "text-green-600 dark:text-green-400";
      case 'error': return "text-red-600 dark:text-red-400";
      case 'warning': return "text-yellow-600 dark:text-yellow-400";
      case 'info': return "text-blue-600 dark:text-blue-400";
      case 'sync': return "text-indigo-600 dark:text-indigo-400";
      case 'loading': return "text-purple-600 dark:text-purple-400";
      case 'progress': return "text-indigo-600 dark:text-indigo-400";
      default: return "text-blue-600 dark:text-blue-400";
    }
  };

  return (
    <div className={`flex items-center gap-3 ${getStyles(notification.type, notification.read)}`}>
      <div className={`flex-shrink-0 ${getIconColor(notification.type, notification.read)}`}>
        {getIcon(notification)}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm text-gray-800 dark:text-gray-200 truncate">
          {notification.message}
          {notification.type === 'progress' && notification.progress !== undefined && (
            <span className="ml-2 font-medium">
              {Math.round(notification.progress)}%
            </span>
          )}
        </p>
      </div>
      {onClose && (
        <button
          onClick={onClose}
          className="flex-shrink-0 p-1 hover:bg-white/30 dark:hover:bg-black/20 rounded-full transition"
          aria-label="Fechar notificação"
        >
          <X className="w-3 h-3 text-gray-500" />
        </button>
      )}
    </div>
  );
};

// Componente do popup de histórico
export const NotificationHistoryPopup: React.FC<{
  isOpen: boolean;
  onClose: () => void;
}> = ({ isOpen, onClose }) => {
  const { notifications, markAllAsRead, clearHistory, unreadCount } = useNotifications();

  if (!isOpen) return null;

  const formatTime = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (minutes < 1) return 'Agora';
    if (minutes < 60) return `${minutes} min atrás`;
    if (hours < 24) return `${hours}h atrás`;
    return date.toLocaleDateString('pt-BR');
  };

  const getIcon = (notification: Notification) => {
    const { type, progress } = notification;
    
    switch (type) {
      case 'success': return <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />;
      case 'error': return <XCircle className="w-5 h-5 text-red-600 dark:text-red-400" />;
      case 'warning': return <AlertCircle className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />;
      case 'info': return <Info className="w-5 h-5 text-blue-600 dark:text-blue-400" />;
      case 'sync': return <RefreshCw className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />;
      case 'loading': return <div className="w-5 h-5 animate-spin rounded-full border-2 border-purple-600 border-t-transparent" />;
      case 'progress':
        return (
          <div className="relative w-5 h-5">
            <div className="absolute inset-0 rounded-full border-2 border-indigo-600/30 dark:border-indigo-400/30" />
            <div 
              className="absolute inset-0 rounded-full border-2 border-indigo-600 dark:border-indigo-400 border-t-transparent"
              style={{
                transform: `rotate(${360 * (progress || 0) / 100}deg)`,
                transition: 'transform 0.3s ease'
              }}
            />
          </div>
        );
      default: return <Info className="w-5 h-5 text-blue-600 dark:text-blue-400" />;
    }
  };

  return (
    <>
      <div 
        className="fixed inset-0 z-50 bg-black/30 transition-opacity"
        onClick={onClose}
      />
      
      <div className="fixed left-1/2 top-1/2 z-[60] w-full max-w-lg -translate-x-1/2 -translate-y-1/2 px-4">
        <div className="bg-white/95 dark:bg-slate-800/95 rounded-2xl shadow-2xl border border-gray-200 dark:border-slate-700 overflow-hidden max-h-[80vh] flex flex-col">
          <div className="p-6 border-b border-gray-200 dark:border-slate-700 flex-shrink-0">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Bell className="text-gray-600 dark:text-gray-300" />
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Histórico de Notificações
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {notifications.length} notificações • {unreadCount} não lidas
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-full"
              >
                <X className="w-5 h-5 text-gray-500 dark:text-gray-400" />
              </button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="py-8 text-center">
                <Bell className="mx-auto w-12 h-12 text-gray-400 dark:text-gray-500 mb-4 opacity-30" />
                <p className="text-gray-500 dark:text-gray-400">
                  As notificações aparecerão aqui
                </p>
              </div>
            ) : (
              <div className="p-4 space-y-2">
                {notifications.map(notification => (
                  <div key={notification.id} className={`group p-3 rounded-lg transition ${notification.read ? 'bg-gray-50 dark:bg-slate-800/50' : 'bg-white dark:bg-slate-800'}`}>
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0 mt-0.5">
                        <div className={notification.read ? 'opacity-60 saturate-0 grayscale' : ''}>
                          {getIcon(notification)}
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className={`text-sm mb-1 ${notification.read ? 'text-gray-600 dark:text-gray-400' : 'text-gray-800 dark:text-gray-200'}`}>
                          {notification.message}
                          {notification.type === 'progress' && notification.progress !== undefined && (
                            <span className="ml-2 font-medium">
                              {Math.round(notification.progress)}%
                            </span>
                          )}
                        </p>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                            <Clock className="w-3 h-3" />
                            {formatTime(notification.timestamp)}
                          </div>
                          {notification.read && (
                            <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
                              <Check className="w-3 h-3" />
                              <span>LIDA</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {notifications.length > 0 && (
            <div className="p-4 border-t border-gray-200 dark:border-slate-700 flex gap-3 flex-shrink-0">
              {unreadCount > 0 && (
                <button
                  onClick={markAllAsRead}
                  className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition"
                >
                  Marcar todas como lidas
                </button>
              )}
              <button
                onClick={clearHistory}
                className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-medium rounded-lg transition flex items-center justify-center gap-2"
              >
                <Trash2 className="w-4 h-4" />
                Limpar Histórico
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

// Estilos CSS para animações
export const NotificationStyles = () => (
  <style>{`
    @keyframes shake {
      0%, 100% { transform: translateX(0); }
      10%, 30%, 50%, 70%, 90% { transform: translateX(-2px); }
      20%, 40%, 60%, 80% { transform: translateX(2px); }
    }
    
    .animate-shake {
      animation: shake 0.5s cubic-bezier(.36,.07,.19,.97) both;
    }
    
    @keyframes spin {
      from { transform: rotate(0deg); }
      to { transform: rotate(360deg); }
    }
    
    .animate-spin {
      animation: spin 1s linear infinite;
    }
  `}</style>
);
