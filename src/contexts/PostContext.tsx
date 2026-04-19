'use client';

import React, { createContext, useState, useEffect, ReactNode, useContext } from 'react';
import { BlogPost, Theme } from '../types';
import { useNotifications } from '../components/Common/NotificationContext';

// Tipo do Contexto
interface PostContextType {
  posts: BlogPost[];
  loading: boolean;
  addPost: (post: BlogPost, sendPush?: boolean) => Promise<void>;
  deletePost: (id: string) => Promise<void>;
  updatePost: (post: BlogPost, sendPush?: boolean) => Promise<void>;
  getPost: (id: string) => BlogPost | undefined | Promise<BlogPost | null>; // Adaptado para lidar com sync/async
  reloadPosts: () => Promise<BlogPost[]>;
  categories: string[];
  updateCategories: (categories: string[]) => void;
  categoryIcons: Record<string, string>;
  updateCategoryIcon: (category: string, iconName: string) => void;
  theme: Theme;
  toggleTheme: () => void;
  
  // Novos campos do AppContent
  isSyncing: boolean;
  syncStatus: 'idle' | 'success' | 'error';
}

export const PostContext = createContext<PostContextType | undefined>(undefined);

export const usePost = () => {
  const context = useContext(PostContext);
  return context;
};

const fetchIndexFromApi = async (): Promise<BlogPost[]> => {
  const resp = await fetch(`/api/get-posts?type=index&status=published&t=${Date.now()}`, {
    cache: 'no-store',
    headers: {
      'Cache-Control': 'no-cache'
    }
  });

  if (!resp.ok) {
    console.error('❌ Falha ao carregar posts:', resp.status);
    return [];
  }
  const data = await resp.json();
  if (Array.isArray(data)) return data;
  if (data && Array.isArray(data.posts)) return data.posts;
  console.error('❌ Formato inválido ao carregar posts:', data);
  return [];
};

const loadPosts = async (): Promise<BlogPost[]> => {
  try {
    // Agora priorizamos a API que usa o cache do servidor/Next.js
    // Evitamos chamadas diretas ao Supabase client-side para listagem
    return await fetchIndexFromApi();
  } catch (error) {
    console.error('❌ Erro ao carregar posts:', error);
    return [];
  }
};

export const PostProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { addNotification, updateNotification } = useNotifications();

  const normalizeCategories = (items: string[]) =>
    Array.from(new Set(items.map(item => item.trim()).filter(Boolean)));

  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncStatus, setSyncStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [theme, setTheme] = useState<Theme>('light');

  // Estado para categorias
  const [categories, setCategories] = useState<string[]>(['Tecnologia', 'Moda', 'Casa', 'Beleza', 'Viagem', 'Saúde', 'Esportes', 'Educação', 'Gastronomia', 'Entretenimento']);
  
  // Estado para ícones de categorias
  const [categoryIcons, setCategoryIcons] = useState<Record<string, string>>({});

  // Efeitos de inicialização (Client-side apenas)
  useEffect(() => {
    // Carregar categorias do localStorage
    const savedCategories = localStorage.getItem('fabrica-cupons-categories');
    if (savedCategories) {
      setCategories(normalizeCategories(JSON.parse(savedCategories)));
    }

    // Carregar ícones
    const savedIcons = localStorage.getItem('fabrica-cupons-category-icons');
    if (savedIcons) {
      setCategoryIcons(JSON.parse(savedIcons));
    }

    // Carregar tema
    const savedTheme = localStorage.getItem('theme') as Theme;
    if (savedTheme) {
      setTheme(savedTheme);
      document.documentElement.classList.toggle('dark', savedTheme === 'dark');
    } else {
      // Verificar preferência do sistema
      const darkModePreference = window.matchMedia('(prefers-color-scheme: dark)');
      if (darkModePreference.matches) {
        setTheme('dark');
        document.documentElement.classList.add('dark');
      }
    }

    // Carregar posts iniciais
    const loadInitialPosts = async () => {
      setLoading(true);
      const loadedPosts = await loadPosts();
      setPosts(loadedPosts);
      setLoading(false);
    };

    loadInitialPosts();
  }, []);

  // Monitorar tema
  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };

  // Helper para salvar post
  const savePostToStorage = async (post: any, action: 'publish' | 'draft' | 'delete', sendPush?: boolean): Promise<boolean> => {
    setIsSyncing(true);
    setSyncStatus('idle');
    const notifId = addNotification({
      type: 'loading',
      message:
        action === 'publish'
          ? 'Publicando post...'
          : action === 'draft'
            ? 'Salvando rascunho...'
            : 'Excluindo post...',
      duration: 0,
    });

    try {
      const response = await fetch('/api/posts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ post, action, sendPush: sendPush || false }),
      });
      const result = await response.json();

      if (result.success) {
        console.log(`✅ Ação '${action}' bem-sucedida! URL:`, result.url);
        
        // Feedback sobre notificação push
        if (result.pushNotification) {
          if (result.pushNotification.sent) {
            if (result.pushNotification.recipients > 0) {
              console.log(`✅ Notificação push enviada para ${result.pushNotification.recipients} usuário(s)!`);
            } else {
              console.log('ℹ️ Notificação preparada, mas nenhum usuário inscrito ainda');
            }
          } else if (result.pushNotification.error) {
            console.warn('⚠️ Falha ao enviar notificação push:', result.pushNotification.error);
          }
        }
        
        setIsSyncing(false);
        setSyncStatus('success');
        updateNotification(notifId, {
          type: 'success',
          message:
            action === 'publish'
              ? 'Post publicado com sucesso!'
              : action === 'draft'
                ? 'Rascunho salvo!'
                : 'Post excluído!',
          duration: 4000,
        });
        return true;
      } else {
        console.warn('⚠️ Falha ao salvar:', result.error);
        setIsSyncing(false);
        setSyncStatus('error');
        updateNotification(notifId, {
          type: 'error',
          message: result.error || 'Falha ao salvar. Tente novamente.',
          duration: 6000,
        });
        return false;
      }
    } catch (error) {
      console.error('❌ Erro na operação:', error);
      setIsSyncing(false);
      setSyncStatus('error');
      updateNotification(notifId, {
        type: 'error',
        message: 'Erro ao salvar. Verifique sua conexão e tente novamente.',
        duration: 6000,
      });
      return false;
    }
  };

  const addPost = async (post: BlogPost, sendPush: boolean = false) => {
    setPosts(prev => {
      // Evita duplicação se o ID já existir
      if (prev.some(p => p.id === post.id)) return prev;
      return [post, ...prev];
    });
    await savePostToStorage(post, 'publish', sendPush);
  };

  const deletePost = async (id: string) => {
    setPosts(prev => prev.filter(p => p.id !== id));
    await savePostToStorage({ id }, 'delete');
  };

  const updatePost = async (updatedPost: BlogPost, sendPush: boolean = false) => {
    setPosts(prev => prev.map(p => p.id === updatedPost.id ? updatedPost : p));
    await savePostToStorage(updatedPost, 'publish', sendPush);
  };

  const getPost = async (id: string): Promise<BlogPost | null> => {
     // 1. Tentar encontrar nos posts carregados SE tiver blocos (conteúdo completo)
     const existing = posts.find(p => p.id === id);
     if (existing && existing.blocks && existing.blocks.length > 0) {
       return existing;
     }
 
     try {
       const response = await fetch(`/api/get-posts?type=detail&id=${id}&status=published`, {
         cache: 'no-store'
       });
       if (response.ok) {
         const detail = await response.json();
         if (detail) return detail;
       }
     } catch (e) {
       console.warn('Erro ao buscar detalhe do post:', e);
     }
 
     // 3. Se falhar, retornar o existente (metadado) ou null
     return existing || null;
  };
  
  // Versão síncrona para compatibilidade com hooks que esperam retorno imediato (pode retornar undefined se não carregado)
  // Mas a interface original do Contexto espera Promise<void> ou similar para ações, e getPost síncrono.
  // Vamos manter compatibilidade com a interface definida: getPost(id) -> BlogPost | undefined | Promise...
  
  const reloadPosts = async (): Promise<BlogPost[]> => {
    try {
      setLoading(true);
      const loadedPosts = await loadPosts();
      setPosts(loadedPosts);
      setLoading(false);
      return loadedPosts;
    } catch (error) {
      setLoading(false);
      return posts;
    }
  };

  const updateCategories = (newCategories: string[]) => {
    const normalized = normalizeCategories(newCategories);
    setCategories(normalized);
    localStorage.setItem('fabrica-cupons-categories', JSON.stringify(normalized));
  };

  const updateCategoryIcon = (category: string, iconName: string) => {
    setCategoryIcons(prev => {
      const newIcons = { ...prev, [category]: iconName };
      localStorage.setItem('fabrica-cupons-category-icons', JSON.stringify(newIcons));
      return newIcons;
    });
  };

  return (
    <PostContext.Provider value={{
      posts,
      loading,
      addPost,
      deletePost,
      updatePost,
      getPost: getPost as any, // Cast necessário pois a implementação agora é async para detalhes
      reloadPosts,
      categories,
      updateCategories,
      categoryIcons,
      updateCategoryIcon,
      theme,
      toggleTheme,
      isSyncing,
      syncStatus
    }}>
      {children}
    </PostContext.Provider>
  );
};
