'use client';

import React, { useContext, useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { FiCalendar, FiClock, FiList, FiX, FiShare2 } from 'react-icons/fi';
import { Ghost, Home, ArrowLeft, Sun, Moon, ChevronRight } from 'lucide-react';
import { PostContext } from '@/contexts/PostContext';
import { BlogPost } from '@/types';
import { PostViewer } from '@/components/Admin/Editor/PostViewer';
import WidgetRenderer from '@/components/Widgets/WidgetRenderer';
import FabricLogo from '@/components/FabricLogo';
import { useCategoryIcons } from '@/hooks/useCategoryIcons';
import { useScrollToTop } from '@/hooks/useScrollToTop';

interface PostDetailClientProps {
  postId: string;
  initialPost?: BlogPost | null;
}

const normalizeDateTime = (value?: string) => {
  if (!value) return undefined;
  return value.includes('T') ? value : `${value}T00:00:00`;
};

const formatDate = (value?: string, options?: Intl.DateTimeFormatOptions) => {
  const normalized = normalizeDateTime(value);
  return normalized ? new Date(normalized).toLocaleDateString('pt-BR', options) : '';
};

const formatTime = (value?: string, options?: Intl.DateTimeFormatOptions) => {
  const normalized = normalizeDateTime(value);
  return normalized ? new Date(normalized).toLocaleTimeString('pt-BR', options) : '';
};

const extractTextFromTipTap = (node: any): string => {
  if (!node) return '';
  if (Array.isArray(node)) return node.map((item: any) => extractTextFromTipTap(item)).join(' ');
  if (node.type === 'text') return node.text || '';
  let text = '';
  if (typeof node.attrs?.text === 'string') text += ` ${node.attrs.text}`;
  if (typeof node.attrs?.title === 'string') text += ` ${node.attrs.title}`;
  if (typeof node.attrs?.content === 'string') text += ` ${node.attrs.content}`;
  if (typeof node.attrs?.description === 'string') text += ` ${node.attrs.description}`;
  if (Array.isArray(node.content)) {
    text += ` ${node.content.map((item: any) => extractTextFromTipTap(item)).join(' ')}`;
  }
  return text.trim();
};

const PostDetailClient: React.FC<PostDetailClientProps> = ({ postId, initialPost }) => {
  const postContext = useContext(PostContext);
  const posts = useMemo(() => (Array.isArray(postContext?.posts) ? postContext!.posts : []), [postContext?.posts]);
  const loading = postContext?.loading || false;
  const getPost = postContext?.getPost;
  const theme = postContext?.theme || 'light';
  const toggleTheme = postContext?.toggleTheme || (() => {});
  const router = useRouter();
  const { getCategoryIcon } = useCategoryIcons();

  const [post, setPost] = useState<BlogPost | undefined>(initialPost || undefined);
  const [isLoadingContent, setIsLoadingContent] = useState(!initialPost);
  const [copiedLink, setCopiedLink] = useState(false);
  const [readTime, setReadTime] = useState('');
  const [scrollProgress, setScrollProgress] = useState(0);
  const [isDataLoaded, setIsDataLoaded] = useState(!!initialPost);
  const [isAnimating, setIsAnimating] = useState(true);

  const scrollRef = useRef<number>(0);
  const rafRef = useRef<number | null>(null);

  // Scroll to top on mount (fix mobile scroll issue)
  useScrollToTop();

  useEffect(() => {
    const loadPostData = async () => {
      if (!postId) return;
      setIsLoadingContent(true);

      const localPost = posts.find(p => p.id === postId);
      if (localPost?.blocks?.length) {
        setPost(localPost);
        setIsLoadingContent(false);
        return;
      }
      if (initialPost?.blocks?.length) {
        setPost(initialPost);
        setIsLoadingContent(false);
        return;
      }
      if (getPost) {
        try {
          const fetched = await getPost(postId);
          if (fetched) {
            setPost(prev => ({ ...(localPost || prev || {}), ...fetched } as BlogPost));
          } else {
            setPost(localPost || initialPost || undefined);
          }
        } catch {
          setPost(localPost || initialPost || undefined);
        }
      } else {
        setPost(localPost || initialPost || undefined);
      }
      setIsLoadingContent(false);
    };
    loadPostData();
  }, [postId, posts, getPost, initialPost]);

  useEffect(() => {
    if (!isLoadingContent && post) {
      setIsDataLoaded(true);
      // Animação de entrada
      const timer = setTimeout(() => setIsAnimating(false), 50);
      return () => clearTimeout(timer);
    }
  }, [isLoadingContent, post]);

  useEffect(() => {
    const blocks = Array.isArray(post?.blocks) ? post!.blocks : [];
    let totalWords = 0;
    if (post?.excerpt) totalWords += post.excerpt.split(' ').length;
    blocks.forEach(block => {
      if ('content' in block && typeof (block as any).content === 'string') {
        totalWords += (block as any).content.split(' ').length;
      }
    });
    if (post?.content && typeof post.content === 'string') {
      totalWords += post.content.replace(/<[^>]*>/g, ' ').split(/\s+/).filter(Boolean).length;
    } else {
      const jsonContent = (post?.content && typeof post.content === 'object' ? post.content : (post as any)?.jsonContent) as any;
      if (jsonContent) {
        totalWords += extractTextFromTipTap(jsonContent).split(/\s+/).filter(Boolean).length;
      }
    }
    setReadTime(`${Math.max(1, Math.ceil(totalWords / 200))} min`);

    const updateScrollProgress = () => {
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
      const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
      const raw = scrollHeight > 0 ? (scrollTop / scrollHeight) * 100 : 0;
      const clamped = Math.max(0, Math.min(100, raw));
      scrollRef.current = scrollRef.current + (clamped - scrollRef.current) * 0.3;
      if (scrollTop + window.innerHeight >= document.documentElement.scrollHeight - 10) {
        setScrollProgress(100);
      } else if (scrollTop <= 10) {
        setScrollProgress(0);
      } else {
        setScrollProgress(scrollRef.current);
      }
      rafRef.current = null;
    };

    const handleScroll = () => {
      if (!rafRef.current) rafRef.current = requestAnimationFrame(updateScrollProgress);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    updateScrollProgress();
    return () => {
      window.removeEventListener('scroll', handleScroll);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [post, postId]);

  const blocks = Array.isArray(post?.blocks) ? post!.blocks : [];
  const indexPost = useMemo(() => posts.find(p => p.id === postId), [posts, postId]);
  const postDateTime = indexPost?.publishedAt || indexPost?.date || post?.publishedAt || post?.date;

  const getThemeColor = () => {
    if (post?.isInformativePost) return { gradient: 'from-blue-500 to-blue-600', text: 'text-blue-600', bg: 'bg-blue-50 dark:bg-blue-900/20', border: 'border-blue-200 dark:border-blue-800/50', progress: 'bg-gradient-to-r from-blue-400 to-cyan-400' };
    if (blocks.some(b => b.type === 'hot_product')) return { gradient: 'from-orange-500 to-orange-600', text: 'text-orange-600', bg: 'bg-orange-50 dark:bg-orange-900/20', border: 'border-orange-200 dark:border-orange-800/50', progress: 'bg-gradient-to-r from-orange-400 to-amber-400' };
    if (post?.isCouponPost || blocks.some(b => b.type === 'coupon' || b.type === 'coupon_list')) return { gradient: 'from-emerald-500 to-emerald-600', text: 'text-emerald-600', bg: 'bg-emerald-50 dark:bg-emerald-900/20', border: 'border-emerald-200 dark:border-emerald-800/50', progress: 'bg-gradient-to-r from-emerald-400 to-green-400' };
    return { gradient: 'from-indigo-500 to-indigo-600', text: 'text-indigo-600', bg: 'bg-indigo-50 dark:bg-indigo-900/20', border: 'border-indigo-200 dark:border-indigo-800/50', progress: 'bg-gradient-to-r from-indigo-400 to-purple-400' };
  };

  const tc = getThemeColor();

  if (!post || !isDataLoaded) {
    if (isLoadingContent || loading) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-slate-900">
          <div className="flex flex-col items-center gap-6">
            <div className="relative">
              <div className="w-20 h-20 border-4 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin" />
              <div className="absolute inset-0 w-20 h-20 border-4 border-pink-500/20 border-b-pink-500 rounded-full animate-spin" style={{ animationDirection: 'reverse', animationDuration: '1s' }} />
            </div>
            <div className="text-center">
              <p className="text-gray-700 dark:text-gray-300 font-bold text-lg mb-2 animate-pulse">
                Carregando publicação...
              </p>
              <p className="text-gray-500 dark:text-gray-400 text-sm">
                Aguarde um momento
              </p>
            </div>
          </div>
        </div>
      );
    }
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-4 py-12 bg-gray-50 dark:bg-slate-900">
        <div className="text-center max-w-2xl">
          <div className="relative inline-block mb-8">
            <div className="bg-white dark:bg-slate-800 p-8 rounded-3xl shadow-xl border border-gray-100 dark:border-slate-700">
              <div className="flex items-center gap-4">
                <Ghost size={64} className="text-blue-500 dark:text-blue-400 animate-bounce" />
                <div className="text-left">
                  <div className="text-6xl font-black text-gray-900 dark:text-white leading-none">404</div>
                  <div className="text-sm font-medium text-gray-500 dark:text-gray-400">Post Fantasma</div>
                </div>
              </div>
            </div>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">Ops! Oferta desaparecida...</h1>
          <p className="text-lg text-gray-600 dark:text-gray-400 mb-10">O post que você está procurando sumiu do mapa.</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/" className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition-all shadow-lg">
              <Home size={20} /> Ir para o Início
            </Link>
            <button onClick={() => window.history.back()} className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 text-gray-700 dark:text-gray-200 font-bold rounded-xl transition-all">
              <ArrowLeft size={20} /> Voltar
            </button>
          </div>
        </div>
      </div>
    );
  }

  const sharePost = () => {
    if (navigator.share) {
      navigator.share({ title: post.title, text: post.excerpt, url: window.location.href });
    } else {
      navigator.clipboard.writeText(window.location.href);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    }
  };

  return (
    <div className={`min-h-screen bg-white dark:bg-slate-900 transition-all duration-500 relative pb-20 overflow-x-hidden ${isAnimating ? 'opacity-0 translate-y-4' : 'opacity-100 translate-y-0'}`}>
      {/* Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 h-14 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md flex items-center justify-between px-4 border-b border-transparent shadow-lg transition-all duration-300">
        <button onClick={() => router.back()} className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 transition-all duration-200 hover:scale-110 active:scale-95">
          <ArrowLeft size={20} />
        </button>
        <div className="flex-1 mx-4 overflow-hidden">
          <div className="relative h-8 flex items-center">
            <Link href="/" className="absolute transition-all duration-500" style={{ opacity: scrollProgress > 2 ? 0 : 1, transform: scrollProgress > 2 ? 'translateY(-100%)' : 'translateY(0)' }}>
              <FabricLogo textClassName="hidden sm:inline" />
            </Link>
            <h1 className="text-base font-bold text-slate-800 dark:text-slate-200 truncate w-full absolute transition-all duration-500" style={{ opacity: scrollProgress > 2 ? 1 : 0, transform: scrollProgress > 2 ? 'translateY(0)' : 'translateY(100%)' }}>
              {post.title}
            </h1>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={toggleTheme} className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 transition-all duration-200 hover:scale-110 active:scale-95">
            {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
          </button>
          <button onClick={sharePost} className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 transition-all duration-200 hover:scale-110 active:scale-95 relative">
            <FiShare2 size={20} />
            {copiedLink && (
              <span className="absolute right-full mr-2 top-1/2 -translate-y-1/2 px-2 py-1 bg-black text-white text-xs rounded shadow-lg whitespace-nowrap animate-in fade-in slide-in-from-right-2 duration-200">
                Copiado!
              </span>
            )}
          </button>
        </div>
      </nav>

      {/* Progress bar */}
      <div className="fixed left-0 right-0 top-14 h-[3px] z-[49] bg-slate-200/30 dark:bg-slate-800/30">
        <div className={`h-full ${tc.progress} transition-all duration-150 ease-out shadow-lg`} style={{ width: `${scrollProgress}%` }} />
      </div>

      {/* Content */}
      <div className="w-full mx-auto pt-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Breadcrumb */}
          <nav aria-label="Breadcrumb" className="text-xs text-slate-500 dark:text-slate-400 mb-4">
            <ol className="flex items-center flex-wrap gap-2">
              <li><Link href="/" className="hover:text-slate-900 dark:hover:text-white transition-colors">Início</Link></li>
              <li className="flex items-center gap-2"><ChevronRight size={14} className="text-slate-400" /><Link href="/blog" className="hover:text-slate-900 dark:hover:text-white transition-colors">Blog</Link></li>
              <li className="flex items-center gap-2"><ChevronRight size={14} className="text-slate-400" /><span className="text-slate-700 dark:text-slate-200 font-semibold truncate max-w-[60vw]">{post.title}</span></li>
            </ol>
          </nav>

          {/* Category */}
          {post.category && (
            <div className="mb-4 animate-in fade-in slide-in-from-left-2 duration-500">
              <span className={`inline-flex items-center gap-1.5 px-3 py-1 ${tc.bg} ${tc.text} font-bold tracking-wide text-[10px] uppercase rounded-full`}>
                {getCategoryIcon(post.category, 14, tc.text)}
                {post.category}
              </span>
            </div>
          )}

          {/* Title */}
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-black text-slate-900 dark:text-white mb-4 leading-tight tracking-tight animate-in fade-in slide-in-from-left-4 duration-700">
            {post.title}
          </h1>

          {/* Excerpt */}
          {post.excerpt && (
            <p className="text-lg text-slate-600 dark:text-slate-300 leading-relaxed font-medium mb-6 animate-in fade-in slide-in-from-left-6 duration-700 delay-100">
              {post.excerpt}
            </p>
          )}

          {/* Author / Meta */}
          <div className="flex items-center gap-3 mb-8 animate-in fade-in slide-in-from-left-8 duration-700 delay-200">
            <div className="relative w-10 h-10 shrink-0">
              <Image src="/logo_3d.png" alt="Logo Fábrica de Cupons" fill className="object-contain" />
            </div>
            <div className="flex flex-col gap-0.5">
              <span className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wide">
                Equipe de redação da Fábrica de Cupons
              </span>
              <div className="flex items-center gap-2 text-xs font-medium text-slate-500 dark:text-slate-400">
                <FiCalendar size={12} />
                <span>{formatDate(postDateTime, { day: '2-digit', month: 'long', year: 'numeric' })}</span>
                <span className="w-1 h-1 rounded-full bg-slate-300 dark:bg-slate-600" />
                <FiClock size={12} />
                <span>{readTime} de leitura</span>
              </div>
            </div>
          </div>

          {/* Cover image */}
          {post.imageUrl && (
            <div className="relative w-full aspect-video rounded-2xl overflow-hidden mb-8 shadow-2xl animate-in fade-in zoom-in-95 duration-700 delay-300">
              <Image 
                src={post.imageUrl} 
                alt={post.title} 
                fill 
                className="object-cover" 
                priority
                unoptimized={post.imageUrl.includes('placehold.co') || post.imageUrl.endsWith('.svg')} 
              />
            </div>
          )}

          {/* Blocks */}
          {blocks.length > 0 ? (
            <div className="space-y-6 mb-10 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-400">
              {blocks.map((block, index) => (
                <div key={(block as any).id || index} className="animate-in fade-in slide-in-from-bottom-2 duration-500" style={{ animationDelay: `${400 + index * 50}ms` }}>
                  <WidgetRenderer block={block} />
                </div>
              ))}
            </div>
          ) : (
            post.content && (
              <div className="mb-10 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-400">
                <PostViewer content={post.content} postCategory={post.category} />
              </div>
            )
          )}
        </div>
      </div>
    </div>
  );
};

export default PostDetailClient;
