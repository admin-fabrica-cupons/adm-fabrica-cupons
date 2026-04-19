import React, { useState } from 'react';
import { useAppSounds } from '../../../hooks/useAppSounds';
import { BlogPost } from '../../../types';
import {
  FileText, RefreshCw, Plus, Trash2, Edit,
  Eye, Search, ChevronDown,
  Grid, List, X, Bell, Volume2, TrendingUp
} from 'lucide-react';
import { TbMinusVertical } from 'react-icons/tb';
import { BiSolidCategoryAlt } from 'react-icons/bi';
import { FaFilter, FaRegCalendarAlt, FaSortAlphaDown, FaSortAlphaUp, FaSortAmountDown, FaSortAmountUp } from 'react-icons/fa';
import Image from 'next/image';
import { useCategoryIcons } from '../../../hooks/useCategoryIcons';

interface PostsListViewProps {
  posts: BlogPost[];
  categories: string[];
  loading?: boolean;
  onEditPost: (post: BlogPost) => void;
  onDeletePost: (id: string) => void;
  onAddPost: () => void;
  onRefreshPosts: () => void;
  onPreviewPost?: (post: BlogPost) => void; // Nova prop
}

const PostsListView: React.FC<PostsListViewProps> = ({
  posts,
  categories,
  loading = false,
  onEditPost,
  onDeletePost,
  onAddPost,
  onRefreshPosts,
  onPreviewPost
}) => {
  const { getCategoryIcon } = useCategoryIcons();
  // Estados para filtros
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'date' | 'title'>('date');
  const [sortOrderDate, setSortOrderDate] = useState<'asc' | 'desc'>('desc');
  const [sortOrderTitle, setSortOrderTitle] = useState<'asc' | 'desc'>('asc');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list');
  const [quickPreviewPost, setQuickPreviewPost] = useState<BlogPost | null>(null);
  const { playClick, playNews, playFactsSectionOpen, playFactsSectionClose, playFact1, playFact2, playFact3 } = useAppSounds();
  const [isCategoryDropdownOpen, setIsCategoryDropdownOpen] = useState(false);
  const [showUpdates, setShowUpdates] = useState(false);
  const [showFacts, setShowFacts] = useState(false);
  const [showStats, setShowStats] = useState(false);

  // Filtrar e ordenar posts
  const filteredPosts = posts
    .filter(post => {
      // Filtro por busca
      if (searchTerm) {
        const query = searchTerm.toLowerCase();
        const titleMatch = (post.title || '').toLowerCase().includes(query);
        const excerptMatch = (post.excerpt || '').toLowerCase().includes(query);
        if (!titleMatch && !excerptMatch) return false;
      }

      // Filtro por categoria
      if (selectedCategory !== 'all' && post.category !== selectedCategory) {
        return false;
      }

      // Filtro por tipo
      if (selectedType !== 'all') {
        if (selectedType === 'coupon' && !post.isCouponPost) return false;
        if (selectedType === 'informative' && !post.isInformativePost) return false;
        if (selectedType === 'normal' && (post.isCouponPost || post.isInformativePost)) return false;
      }

      return true;
    })
    .sort((a, b) => {
      let comparison = 0;

      if (sortBy === 'date') {
        const dateA = new Date(a.date).getTime();
        const dateB = new Date(b.date).getTime();
        comparison = dateB - dateA; // Mais recente primeiro por padrão
      } else if (sortBy === 'title') {
        comparison = (a.title || '').localeCompare(b.title || '');
      }

      const sortOrder = sortBy === 'date' ? sortOrderDate : sortOrderTitle;
      return sortOrder === 'asc' ? comparison : -comparison;
    });

  // Estatísticas
  const stats = {
    total: posts.length,
    couponPosts: posts.filter(p => p.isCouponPost).length,
    informativePosts: posts.filter(p => p.isInformativePost).length,
    normalPosts: posts.filter(p => !p.isCouponPost && !p.isInformativePost).length,
    categoriesCount: categories.length,
    filteredCount: filteredPosts.length
  };

  // Formatar data corrigindo timezone
  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    // Tenta extrair YYYY-MM-DD diretamente para evitar conversão de timezone
    const match = dateString.match(/^(\d{4})-(\d{2})-(\d{2})/);
    if (match) {
      const [_, year, month, day] = match;
      return `${day}/${month}/${year}`;
    }
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  // Quick preview modal
  const renderQuickPreview = () => {
    if (!quickPreviewPost) return null;

    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col">
          <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-slate-700">
            <div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                Prévia Rápida: {quickPreviewPost.title}
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Visualização do post
              </p>
            </div>
            <button
              onClick={() => { setQuickPreviewPost(null); playClick(); }}
              className="p-2 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg transition"
            >
              <X size={20} className="text-gray-500 dark:text-gray-400" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-6">
            <div className="space-y-4">
              <div className="relative aspect-video rounded-lg overflow-hidden">
                <Image
                  src={quickPreviewPost.thumbnail || 'https://placehold.co/800x400'}
                  alt={quickPreviewPost.title}
                  fill
                  className="object-cover"
                />
              </div>

              <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                  {quickPreviewPost.title}
                </h2>
                <div className="flex items-center gap-3 mb-4">
                  <span className={`px-3 py-1 text-xs font-medium rounded-full ${quickPreviewPost.isCouponPost
                    ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300'
                    : 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300'
                    }`}>
                    {quickPreviewPost.category}
                  </span>
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    {formatDate(quickPreviewPost.date)}
                  </span>
                  {quickPreviewPost.isCouponPost && (
                    <span className="px-3 py-1 text-xs font-medium bg-green-500 text-white rounded-full">
                      Cupom
                    </span>
                  )}
                </div>

                <p className="text-gray-600 dark:text-gray-300 mb-6">
                  {quickPreviewPost.excerpt}
                </p>

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="bg-gray-50 dark:bg-slate-700/30 p-3 rounded-lg">
                    <div className="text-gray-500 dark:text-gray-400">Blocos</div>
                    <div className="font-medium">{quickPreviewPost.blocks?.length || 0}</div>
                  </div>
                  <div className="bg-gray-50 dark:bg-slate-700/30 p-3 rounded-lg">
                    <div className="text-gray-500 dark:text-gray-400">Tipo</div>
                    <div className="font-medium">{quickPreviewPost.isCouponPost ? 'Post de Cupom' : 'Post Normal'}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="p-6 border-t border-gray-200 dark:border-slate-700 flex gap-3">
            <button
              onClick={() => {
                onEditPost(quickPreviewPost);
                setQuickPreviewPost(null);
                playClick();
              }}
              className="flex-1 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition"
            >
              Editar Post
            </button>
            <button
              onClick={() => { setQuickPreviewPost(null); playClick(); }}
              className="flex-1 py-3 bg-gray-200 dark:bg-slate-700 hover:bg-gray-300 dark:hover:bg-slate-600 text-gray-800 dark:text-gray-200 font-medium rounded-lg transition"
            >
              Fechar
            </button>
          </div>
        </div>
      </div>
    );
  };

  const renderUpdatesPopup = () => {
    if (!showUpdates) return null;

    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden border border-gray-200 dark:border-slate-700">
          <div className="bg-gradient-to-r from-pink-500 via-rose-600 to-purple-700 px-6 py-4 text-white flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                <Bell size={20} className="text-white" />
              </div>
              <div>
                <h3 className="font-bold text-lg">Novidades do Admin</h3>
                <p className="text-xs text-white/90">Correções e melhorias recentes</p>
              </div>
            </div>
            <button
              onClick={() => { setShowUpdates(false); playClick(); }}
              className="p-2 rounded-lg hover:bg-white/20 transition"
            >
              <X size={18} />
            </button>
          </div>
          <div className="p-6">
            <ul className="space-y-3 text-sm text-gray-700 dark:text-gray-300">
              <li className="flex items-start gap-2">
                <span className="mt-1 h-2 w-2 rounded-full bg-pink-500"></span>
                Modal do bot Lu com avisos personalizados e ícone atualizado.
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-1 h-2 w-2 rounded-full bg-pink-500"></span>
                Sons de entrada no Admin e abertura do chat com efeitos dedicados.
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-1 h-2 w-2 rounded-full bg-pink-500"></span>
                Filtros e organização de posts com interface mais clara.
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-1 h-2 w-2 rounded-full bg-pink-500"></span>
                Melhorias de consistência visual nos widgets do blog.
              </li>
            </ul>
            <div className="mt-6 flex justify-end">
              <button
                onClick={() => { setShowUpdates(false); playClick(); }}
                className="px-4 py-2 rounded-lg bg-gradient-to-r from-pink-500 via-rose-600 to-purple-700 text-white font-semibold"
              >
                Entendi
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderFactsPopup = () => {
    if (!showFacts) return null;

    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-xl overflow-hidden border border-gray-200 dark:border-slate-700">
          <div className=" px-6 py-4 text-white flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                <Volume2 size={20} className="text-white" />
              </div>
              <div>
                <h3 className="font-bold text-lg">Fatos da Lu</h3>
                <p className="text-xs text-white/90">Escute os fatos disponíveis</p>
              </div>
            </div>
            <button
              onClick={() => {
                setShowFacts(false);
                playFactsSectionClose();
              }}
              className="p-2 rounded-lg hover:bg-white/20 transition"
            >
              <X size={18} />
            </button>
          </div>
          <div className="p-6 space-y-3">
            <button
              onClick={() => playFact1()}
              className="w-full flex items-center justify-between px-4 py-3 rounded-lg border border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-900 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-slate-700 transition"
            >
              <span>fact1</span>
              <Volume2 size={18} />
            </button>
            <button
              onClick={() => playFact2()}
              className="w-full flex items-center justify-between px-4 py-3 rounded-lg border border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-900 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-slate-700 transition"
            >
              <span>fact2</span>
              <Volume2 size={18} />
            </button>
            <button
              onClick={() => playFact3()}
              className="w-full flex items-center justify-between px-4 py-3 rounded-lg border border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-900 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-slate-700 transition"
            >
              <span>fact3</span>
              <Volume2 size={18} />
            </button>
            <div className="pt-2">
              <button
                onClick={() => {
                  setShowFacts(false);
                  playFactsSectionClose();
                }}
                className="w-full px-4 py-2 rounded-lg bg-gradient-to-r from-pink-500 via-rose-600 to-purple-700 text-white font-semibold"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderStatsPopup = () => {
    if (!showStats) return null;

    const couponRate = stats.total ? Math.round((stats.couponPosts / stats.total) * 100) : 0;
    const informativeRate = stats.total ? Math.round((stats.informativePosts / stats.total) * 100) : 0;
    const normalRate = stats.total ? Math.round((stats.normalPosts / stats.total) * 100) : 0;

    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-3xl overflow-hidden border border-gray-200 dark:border-slate-700">
          <div className="bg-gradient-to-r from-emerald-500 via-teal-600 to-cyan-700 px-6 py-4 text-white flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                <TrendingUp size={20} className="text-white" />
              </div>
              <div>
                <h3 className="font-bold text-lg">Estatísticas dos Posts</h3>
                <p className="text-xs text-white/90">Resumo geral e distribuição</p>
              </div>
            </div>
            <button
              onClick={() => { setShowStats(false); playClick(); }}
              className="p-2 rounded-lg hover:bg-white/20 transition"
            >
              <X size={18} />
            </button>
          </div>
          <div className="p-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 rounded-xl border border-emerald-100 dark:border-emerald-900/40 bg-emerald-50/70 dark:bg-emerald-900/20">
                <p className="text-[10px] uppercase tracking-widest text-emerald-600 dark:text-emerald-300 font-semibold">Total</p>
                <p className="text-2xl font-bold text-emerald-700 dark:text-emerald-200">{stats.total}</p>
                <p className="text-xs text-emerald-600/80 dark:text-emerald-200/80">{stats.filteredCount} filtrados</p>
              </div>
              <div className="p-4 rounded-xl border border-blue-100 dark:border-blue-900/40 bg-blue-50/70 dark:bg-blue-900/20">
                <p className="text-[10px] uppercase tracking-widest text-blue-600 dark:text-blue-300 font-semibold">Categorias</p>
                <p className="text-2xl font-bold text-blue-700 dark:text-blue-200">{stats.categoriesCount}</p>
                <p className="text-xs text-blue-600/80 dark:text-blue-200/80">Disponíveis</p>
              </div>
              <div className="p-4 rounded-xl border border-purple-100 dark:border-purple-900/40 bg-purple-50/70 dark:bg-purple-900/20">
                <p className="text-[10px] uppercase tracking-widest text-purple-600 dark:text-purple-300 font-semibold">Status</p>
                <p className="text-2xl font-bold text-purple-700 dark:text-purple-200">{loading ? 'Carregando' : 'Ativo'}</p>
                <p className="text-xs text-purple-600/80 dark:text-purple-200/80">Painel</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 rounded-xl border border-emerald-100 dark:border-emerald-900/40 bg-white dark:bg-slate-900/40">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">Cupons</span>
                  <span className="text-sm font-bold text-emerald-600">{stats.couponPosts}</span>
                </div>
                <div className="mt-3 h-2 rounded-full bg-emerald-100 dark:bg-emerald-900/40 overflow-hidden">
                  <div className="h-full bg-emerald-500" style={{ width: `${couponRate}%` }} />
                </div>
                <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">{couponRate}% do total</p>
              </div>
              <div className="p-4 rounded-xl border border-cyan-100 dark:border-cyan-900/40 bg-white dark:bg-slate-900/40">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">Informativos</span>
                  <span className="text-sm font-bold text-cyan-600">{stats.informativePosts}</span>
                </div>
                <div className="mt-3 h-2 rounded-full bg-cyan-100 dark:bg-cyan-900/40 overflow-hidden">
                  <div className="h-full bg-cyan-500" style={{ width: `${informativeRate}%` }} />
                </div>
                <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">{informativeRate}% do total</p>
              </div>
              <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900/40">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">Normais</span>
                  <span className="text-sm font-bold text-slate-700 dark:text-slate-200">{stats.normalPosts}</span>
                </div>
                <div className="mt-3 h-2 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
                  <div className="h-full bg-slate-600" style={{ width: `${normalRate}%` }} />
                </div>
                <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">{normalRate}% do total</p>
              </div>
            </div>

            <div className="flex justify-end">
              <button
                onClick={() => { setShowStats(false); playClick(); }}
                className="px-4 py-2 rounded-lg bg-gradient-to-r from-emerald-500 via-teal-600 to-cyan-700 text-white font-semibold"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Loading state
  if (loading) {
    return (
      <div className="space-y-8 animate-in fade-in duration-500">
        <div className="flex justify-between items-center">
          <div className="h-8 bg-gray-200 dark:bg-slate-700 rounded-lg w-1/3 animate-pulse"></div>
          <div className="h-10 bg-gray-200 dark:bg-slate-700 rounded-lg w-32 animate-pulse"></div>
        </div>

        <div className="flex flex-col items-center justify-center py-12">
          <div className="relative w-20 h-20">
            <div className="absolute top-0 left-0 w-full h-full border-4 border-blue-200 dark:border-blue-900/30 rounded-full"></div>
            <div className="absolute top-0 left-0 w-full h-full border-4 border-blue-600 dark:border-blue-500 rounded-full border-t-transparent animate-spin"></div>
          </div>
          <p className="mt-4 text-gray-500 dark:text-gray-400 font-medium animate-pulse">Carregando posts...</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 opacity-50 pointer-events-none">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white dark:bg-slate-800 rounded-xl shadow border border-gray-200 dark:border-slate-700 overflow-hidden h-96">
              <div className="h-48 bg-gray-200 dark:bg-slate-700"></div>
              <div className="p-4 space-y-4">
                <div className="h-6 bg-gray-200 dark:bg-slate-700 rounded w-3/4"></div>
                <div className="h-4 bg-gray-200 dark:bg-slate-700 rounded w-full"></div>
                <div className="h-4 bg-gray-200 dark:bg-slate-700 rounded w-1/2"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Renderizar em grid
  const renderGridView = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {filteredPosts.map((post, index) => (
        <div
          key={post.id}
          className={`bg-white dark:bg-slate-800 rounded-xl shadow border overflow-hidden hover:shadow-lg transition group animate-fade-in ${post.isInformativePost
              ? 'border-cyan-200 dark:border-cyan-800 ring-1 ring-cyan-500/20 shadow-cyan-500/10'
              : 'border-gray-200 dark:border-slate-700'
            }`}
          style={{ animationDelay: `${index * 60}ms` }}
        >
          <div className="relative w-full h-48">
            <Image
              src={post.thumbnail || 'https://placehold.co/600x400'}
              className="object-cover transition-transform duration-500 group-hover:scale-105"
              alt={post.title}
              fill
            />
            {post.isInformativePost && (
              <div className="absolute inset-0 bg-gradient-to-t from-cyan-900/60 to-transparent opacity-60"></div>
            )}
            <div className="absolute top-2 left-2">
              <span className={`px-2 py-1 text-xs font-bold rounded shadow-sm flex items-center gap-1 ${post.isInformativePost
                  ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white'
                  : post.isCouponPost
                    ? 'bg-green-500 text-white'
                    : 'bg-blue-500 text-white'
                }`}>
                {post.isInformativePost && <FileText size={12} />}
                {post.isInformativePost ? 'Informativo' : post.isCouponPost ? 'Cupom' : 'Post'}
              </span>
            </div>
            <div className="absolute top-2 right-2">
              <span className="px-2 py-1 text-xs font-medium bg-gray-800/70 text-white rounded">
                {post.category}
              </span>
            </div>
          </div>

          <div className="p-4">
            <h3 className="font-bold text-gray-900 dark:text-white text-lg mb-2 line-clamp-2">
              {post.title}
            </h3>
            <p className="text-gray-600 dark:text-gray-300 text-sm mb-4 line-clamp-2">
              {post.excerpt}
            </p>

            <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 mb-4">
              <span className="flex items-center gap-1">
                <FaRegCalendarAlt size={12} />
                {formatDate(post.date)}
              </span>
              <span>
                {post.blocks?.length || 0} blocos
              </span>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => setQuickPreviewPost(post)}
                className="flex-1 py-2 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 text-sm font-medium rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/50 transition flex items-center justify-center gap-1"
              >
                <Eye size={14} />
                Visualizar
              </button>
              <button
                onClick={() => onEditPost(post)}
                className="flex-1 py-2 bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-gray-300 text-sm font-medium rounded-lg hover:bg-gray-200 dark:hover:bg-slate-600 transition flex items-center justify-center gap-1"
              >
                <Edit size={14} />
                Editar
              </button>
              <button
                onClick={() => onDeletePost(post.id)}
                className="px-3 py-2 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-sm font-medium rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30 transition flex items-center justify-center gap-1"
              >
                <Trash2 size={14} />
                <span className="hidden sm:inline">Apagar</span>
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  // Renderizar em lista
  const renderListView = () => (
    <div className="bg-white dark:bg-slate-800 rounded-xl shadow border border-gray-200 dark:border-slate-700 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-slate-700">
          <thead className="bg-gray-50 dark:bg-slate-900">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Post
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Categoria
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Data
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Tipo
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Blocos
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Ações
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-slate-700">
            {filteredPosts.map((post, index) => (
              <tr
                key={post.id}
                className="hover:bg-gray-50 dark:hover:bg-slate-700/50 animate-fade-in"
                style={{ animationDelay: `${index * 40}ms` }}
              >
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="h-10 w-10 relative flex-shrink-0">
                      {post.thumbnail ? (
                      <div className="relative h-10 w-10">
                          <Image
                            className="rounded-full object-cover"
                            src={post.thumbnail}
                            alt=""
                            fill
                            sizes="40px"
                          />
                        </div>
                      ) : (
                        <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                          <span className="text-gray-500 text-xs">Sem img</span>
                        </div>
                      )}
                    </div>
                    <div className="ml-4">
                      <div className="text-sm font-medium text-gray-900 dark:text-white line-clamp-1 max-w-[200px]" title={post.title}>
                        {post.title}
                      </div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        {post.id}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-1 text-xs font-medium rounded ${post.category === 'Cupons' ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300' : 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300'}`}>
                    {post.category}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                  {formatDate(post.date)}
                </td>
                <td className="px-6 py-4">
                  {post.isInformativePost ? (
                    <span className="px-2.5 py-1 text-xs font-bold bg-gradient-to-r from-cyan-100 to-blue-100 dark:from-cyan-900/40 dark:to-blue-900/40 text-cyan-700 dark:text-cyan-300 rounded border border-cyan-200 dark:border-cyan-800 flex items-center gap-1 w-fit">
                      <FileText size={12} />
                      Informativo
                    </span>
                  ) : post.isCouponPost ? (
                    <span className="px-2 py-1 text-xs font-medium bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 rounded">
                      Cupom
                    </span>
                  ) : (
                    <span className="px-2 py-1 text-xs font-medium bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-gray-300 rounded">
                      Normal
                    </span>
                  )}
                </td>
                <td className="px-6 py-4 text-center">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    {post.blocks?.length || 0}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm font-medium">
                  <div className="flex items-center gap-6">
                    <button
                      onClick={() => {
                        setQuickPreviewPost(post);
                        playClick();
                      }}
                      className="text-blue-600 dark:text-blue-400 hover:text-blue-900 dark:hover:text-blue-300 bg-slate-100 dark:bg-slate-700/30 flex items-center gap-1 px-3 py-2 rounded"
                      title="Visualizar"
                    >
                      <Eye size={16} />
                      <span className="hidden sm:inline">Visualizar</span>
                    </button>
                    <TbMinusVertical size={30} className="text-slate-400" />

                    <button
                      onClick={() => {
                        onEditPost(post);
                        playClick();
                      }}
                      className="text-blue-600 dark:text-blue-400 hover:text-blue-900 dark:hover:text-blue-300 flex items-center bg-slate-100 dark:bg-slate-700/30 flex items-center gap-1 px-3 py-2 rounded"
                      title="Editar"
                    >
                      <Edit size={16} />
                      <span className="hidden sm:inline">Editar</span>
                    </button>
                    <TbMinusVertical size={30} className="text-slate-400" />
                    <button
                      onClick={() => {
                        onDeletePost(post.id);
                        playClick();
                      }}
                      className="text-red-600 dark:text-red-400 hover:text-red-900 dark:hover:text-red-300 flex items-center gap-1"
                      title="Apagar"
                    >
                      <Trash2 size={16} />
                      <span className="hidden sm:inline">Apagar</span>
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  return (
    <div>
      {renderQuickPreview()}
      {renderUpdatesPopup()}
      {renderFactsPopup()}
      {renderStatsPopup()}

      {/* Header com estatísticas e filtros */}
      <div className="mb-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-3">
            <Image src="/logo.svg" alt="Fábrica de Cupons" width={32} height={32} />
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Gerenciar Posts</h2>
              <p className="text-gray-600 dark:text-gray-300 mt-1">
                {stats.filteredCount} de {stats.total} posts • {stats.couponPosts} de cupons • {stats.normalPosts} normais
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                playNews();
                setShowUpdates(true);
              }}
              className="flex items-center gap-2 px-4 py-2 bg-pink-100 dark:bg-pink-900/30 text-pink-700 dark:text-pink-300 rounded-lg hover:bg-pink-200 dark:hover:bg-pink-900/50 transition"
            >
              <Bell size={18} />
              Atualizações
            </button>
            <button
              onClick={() => {
                playFactsSectionOpen();
                setShowFacts(true);
              }}
              className="flex items-center gap-2 px-4 py-2 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded-lg hover:bg-purple-200 dark:hover:bg-purple-900/50 transition"
            >
              <Volume2 size={18} />
              Fatos da Lu
            </button>
            <button
              onClick={() => {
                setShowStats(true);
                playClick();
              }}
              className="flex items-center gap-2 px-4 py-2 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 rounded-lg hover:bg-emerald-200 dark:hover:bg-emerald-900/50 transition"
            >
              <TrendingUp size={18} />
              Estatísticas
            </button>
            <button
              onClick={onRefreshPosts}
              className="flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-slate-600 transition"
            >
              <RefreshCw size={18} />
              Recarregar
            </button>
            <button
              onClick={onAddPost}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition"
            >
              <Plus size={20} />
              Novo Post
            </button>
          </div>
        </div>

        {/* Barra de filtros */}
        <div className="rounded-2xl bg-white/85 dark:bg-slate-900/70 backdrop-blur-xl border border-white/50 dark:border-slate-700/60 p-5 shadow-xl mb-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-pink-500 to-fuchsia-600 text-white flex items-center justify-center shadow-lg">
              <FaFilter size={16} />
            </div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-pink-600/80 dark:text-pink-300/80">Filtros avançados</p>
              <p className="text-sm text-slate-600 dark:text-slate-200">Refine a lista com precisão</p>
            </div>
          </div>
          <div className="flex flex-col xl:flex-row gap-4 items-stretch xl:items-center">
            {/* Busca */}
            <div className="flex-1 w-full">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-pink-600/70 dark:text-pink-300/70" size={18} />
                <input
                  type="text"
                  placeholder="Buscar posts por título ou resumo..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-white/60 dark:border-slate-700/60 bg-white/90 dark:bg-slate-900/80 focus:outline-none focus:ring-2 focus:ring-pink-500/60 text-slate-700 dark:text-slate-100 placeholder:text-slate-400 shadow-sm"
                />
              </div>
            </div>

            {/* Filtros */}
            <div className="flex flex-wrap gap-3">
              {/* Filtro por categoria */}
              <div className="relative">
                <button
                  onClick={() => {
                    setIsCategoryDropdownOpen(!isCategoryDropdownOpen);
                    playClick();
                  }}
                  className="flex items-center gap-2 pl-10 pr-8 py-2.5 rounded-xl border border-white/60 dark:border-slate-700/60 bg-white/90 dark:bg-slate-900/80 text-sm text-slate-700 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-pink-500/60 shadow-sm"
                >
                  <span>{selectedCategory === 'all' ? 'Todas categorias' : selectedCategory}</span>
                  <ChevronDown size={16} className="text-pink-500/70 ml-auto" />
                </button>
                <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
                  {selectedCategory !== 'all' ? getCategoryIcon(selectedCategory, 16, 'text-pink-500/80') : <BiSolidCategoryAlt className="text-pink-500/80" size={16} />}
                </div>
                {isCategoryDropdownOpen && (
                  <div className="absolute top-full left-0 mt-2 w-56 bg-white dark:bg-slate-800 border border-pink-200/60 dark:border-slate-700 rounded-xl shadow-xl z-20 overflow-hidden">
                    <button
                      onClick={() => {
                        setSelectedCategory('all');
                        setIsCategoryDropdownOpen(false);
                        playClick();
                      }}
                      className="w-full text-left px-3 py-2.5 text-sm hover:bg-pink-50 dark:hover:bg-slate-700 flex items-center gap-2"
                    >
                      <BiSolidCategoryAlt size={14} className="text-pink-500/80" />
                      Todas categorias
                    </button>
                    {categories.map(cat => (
                      <button
                        key={cat}
                        onClick={() => {
                          setSelectedCategory(cat);
                          setIsCategoryDropdownOpen(false);
                          playClick();
                        }}
                        className="w-full text-left px-3 py-2.5 text-sm hover:bg-pink-50 dark:hover:bg-slate-700 flex items-center gap-2"
                      >
                        {getCategoryIcon(cat, 14, 'text-pink-500/80')}
                        {cat}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Filtro por tipo */}
              {/* Ordenação */}
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    setSortBy('date');
                    setSortOrderDate((prev) => (sortBy === 'date' ? (prev === 'desc' ? 'asc' : 'desc') : prev));
                  }}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl border transition ${sortBy === 'date'
                    ? 'bg-gradient-to-r from-pink-500 to-fuchsia-600 text-white border-pink-500 shadow-lg shadow-pink-500/20'
                    : 'bg-white/90 dark:bg-slate-900/80 border-white/60 dark:border-slate-700/60 text-slate-700 dark:text-slate-100 hover:bg-pink-50 dark:hover:bg-slate-800'
                    }`}
                >
                  <FaRegCalendarAlt size={14} />
                  <span className="text-xs font-semibold">Data de postagem</span>
                  {sortBy === 'date' && (
                    sortOrderDate === 'desc' ? <FaSortAmountDown size={12} /> : <FaSortAmountUp size={12} />
                  )}
                </button>
                <button
                  onClick={() => {
                    setSortBy('title');
                    setSortOrderTitle((prev) => (sortBy === 'title' ? (prev === 'asc' ? 'desc' : 'asc') : prev));
                  }}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl border transition ${sortBy === 'title'
                    ? 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white border-emerald-500 shadow-lg shadow-emerald-500/20'
                    : 'bg-white/90 dark:bg-slate-900/80 border-white/60 dark:border-slate-700/60 text-slate-700 dark:text-slate-100 hover:bg-emerald-50 dark:hover:bg-slate-800'
                    }`}
                >
                  {sortOrderTitle === 'asc' ? <FaSortAlphaDown size={14} /> : <FaSortAlphaUp size={14} />}
                  <span className="text-xs font-semibold">Ordem alfabética</span>
                </button>
              </div>
            </div>
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            <button
              onClick={() => {
                setSelectedType('all');
                playClick();
              }}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition ${selectedType === 'all'
                ? 'bg-pink-600 text-white border-pink-600'
                : 'bg-white/80 dark:bg-slate-900/70 text-slate-700 dark:text-slate-200 border-white/60 dark:border-slate-700/60 hover:bg-pink-50 dark:hover:bg-slate-800'
                }`}
            >
              Todos
            </button>
            <button
              onClick={() => {
                setSelectedType('coupon');
                playClick();
              }}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition ${selectedType === 'coupon'
                ? 'bg-emerald-500 text-white border-emerald-500'
                : 'bg-white/80 dark:bg-slate-900/70 text-slate-700 dark:text-slate-200 border-white/60 dark:border-slate-700/60 hover:bg-emerald-50 dark:hover:bg-slate-800'
                }`}
            >
              Cupons
            </button>
            <button
              onClick={() => {
                setSelectedType('informative');
                playClick();
              }}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition ${selectedType === 'informative'
                ? 'bg-cyan-500 text-white border-cyan-500'
                : 'bg-white/80 dark:bg-slate-900/70 text-slate-700 dark:text-slate-200 border-white/60 dark:border-slate-700/60 hover:bg-cyan-50 dark:hover:bg-slate-800'
                }`}
            >
              Informativos
            </button>
            <button
              onClick={() => {
                setSelectedType('normal');
                playClick();
              }}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition ${selectedType === 'normal'
                ? 'bg-slate-700 text-white border-slate-700'
                : 'bg-white/80 dark:bg-slate-900/70 text-slate-700 dark:text-slate-200 border-white/60 dark:border-slate-700/60 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
            >
              Normais
            </button>
          </div>

          {/* Indicadores de filtro ativos */}
          {(searchTerm || selectedCategory !== 'all' || selectedType !== 'all') && (
            <div className="mt-4 flex flex-wrap gap-2">
              {searchTerm && (
                <span className="px-2 py-1 text-xs bg-pink-100/80 dark:bg-pink-900/30 text-pink-700 dark:text-pink-300 rounded">
                  Busca: &quot;{searchTerm}&quot;
                </span>
              )}
              {selectedCategory !== 'all' && (
                <span className="px-2 py-1 text-xs bg-emerald-100/80 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 rounded">
                  Categoria: {selectedCategory}
                </span>
              )}
              {selectedType !== 'all' && (
                <span className="px-2 py-1 text-xs bg-purple-100/80 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded">
                  Tipo: {selectedType === 'coupon' ? 'Cupons' : selectedType === 'informative' ? 'Informativos' : 'Normais'}
                </span>
              )}
              <button
                onClick={() => {
                  setSearchTerm('');
                  setSelectedCategory('all');
                  setSelectedType('all');
                }}
                className="px-2 py-1 text-xs bg-white/80 dark:bg-slate-900/70 text-slate-700 dark:text-slate-200 rounded hover:bg-pink-50 dark:hover:bg-slate-800 border border-white/60 dark:border-slate-700/60"
              >
                Limpar filtros
              </button>
            </div>
          )}
        </div>

        {/* Contador de resultados e modo de visualização */}
        <div className="flex justify-between items-center mb-4">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Mostrando <span className="font-medium">{filteredPosts.length}</span> de <span className="font-medium">{posts.length}</span> posts
          </p>
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600 dark:text-gray-400">Visualização:</span>
            <div className="flex bg-gray-100 dark:bg-slate-700 rounded-lg p-1">
              <button
                onClick={() => { setViewMode('list'); playClick(); }}
                className={`p-2 rounded-lg transition-colors ${viewMode === 'list'
                  ? 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400'
                  : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-300'
                  }`}
              >
                <List size={20} />
              </button>
              <button
                onClick={() => { setViewMode('grid'); playClick(); }}
                className={`p-2 rounded-lg transition-colors ${viewMode === 'grid'
                  ? 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400'
                  : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-300'
                  }`}
              >
                <Grid size={20} />
              </button>
            </div>
          </div>
        </div>

        {/* Conteúdo */}
        {filteredPosts.length === 0 ? (
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow border border-gray-200 dark:border-slate-700 p-8 text-center">
            <FileText className="w-16 h-16 text-gray-400 dark:text-gray-600 mx-auto mb-3" />
            <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-300 mb-2">
              {posts.length === 0 ? 'Nenhum post encontrado' : 'Nenhum post corresponde aos filtros'}
            </h3>
            <p className="text-gray-500 dark:text-gray-400 mb-6">
              {posts.length === 0
                ? 'Comece criando seu primeiro post'
                : 'Tente ajustar os filtros de busca'}
            </p>
            <button
              onClick={onAddPost}
              className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg"
            >
              {posts.length === 0 ? 'Criar Primeiro Post' : 'Criar Novo Post'}
            </button>
            {posts.length > 0 && (
              <button
                onClick={() => {
                  setSearchTerm('');
                  setSelectedCategory('all');
                  setSelectedType('all');
                }}
                className="ml-3 px-6 py-3 bg-gray-200 dark:bg-slate-700 text-gray-700 dark:text-gray-300 font-medium rounded-lg hover:bg-gray-300 dark:hover:bg-slate-600"
              >
                Limpar Filtros
              </button>
            )}
          </div>
        ) : (
          /* Lista de posts */
          viewMode === 'grid' ? renderGridView() : renderListView()
        )}
      </div>
    </div>
  );
};

export default PostsListView;
