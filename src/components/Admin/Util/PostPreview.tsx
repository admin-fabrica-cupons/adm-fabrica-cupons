// components/Admin/PostPreview.tsx
import React, { useState } from 'react';
import { BlogPost } from '../../../types';
import { ArrowLeft, Smartphone, Monitor } from 'lucide-react';
import WidgetRenderer from '../../Widgets/WidgetRenderer';
import Image from 'next/image';

interface PostPreviewProps {
  post: BlogPost;
  onBack: () => void;
}

const PostPreview: React.FC<PostPreviewProps> = ({ post, onBack }) => {
  const [viewMode, setViewMode] = useState<'desktop' | 'mobile'>('desktop');
  const normalizedDate = post.date ? (post.date.includes('T') ? post.date : `${post.date}T00:00:00`) : undefined;

  return (
    <div>
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Prévia do Post</h2>
          <p className="text-gray-600 dark:text-gray-300 mt-1">
            Visualize como o post será exibido para os visitantes
          </p>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="flex items-center bg-gray-100 dark:bg-slate-800 rounded-lg p-1">
            <button
              onClick={() => setViewMode('desktop')}
              className={`px-3 py-2 rounded-md flex items-center gap-2 ${viewMode === 'desktop' ? 'bg-white dark:bg-slate-700 shadow' : ''}`}
            >
              <Monitor size={16} />
              Desktop
            </button>
            <button
              onClick={() => setViewMode('mobile')}
              className={`px-3 py-2 rounded-md flex items-center gap-2 ${viewMode === 'mobile' ? 'bg-white dark:bg-slate-700 shadow' : ''}`}
            >
              <Smartphone size={16} />
              Mobile
            </button>
          </div>
          
          <button
            onClick={onBack}
            className="flex items-center gap-2 px-4 py-2 bg-gray-200 dark:bg-slate-700 hover:bg-gray-300 dark:hover:bg-slate-600 text-gray-800 dark:text-white rounded-lg transition"
          >
            <ArrowLeft size={16} />
            Voltar
          </button>
        </div>
      </div>

      <div className={`${viewMode === 'mobile' ? 'max-w-md mx-auto' : ''} bg-white dark:bg-slate-900 rounded-xl shadow-lg border border-gray-200 dark:border-slate-700 overflow-hidden`}>
        {/* Header do Post (simulado) */}
        <div className="p-6 border-b border-gray-200 dark:border-slate-700">
          <div className="flex items-center gap-3 text-sm text-gray-500 dark:text-gray-400 mb-4">
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-medium rounded-full">
              {post.category}
            </span>
            <span>
              {normalizedDate ? new Date(normalizedDate).toLocaleDateString('pt-BR') : ''}
            </span>
          </div>

          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
            {post.title}
          </h1>

          <p className="text-xl text-gray-600 dark:text-gray-300 mb-6">
            {post.excerpt}
          </p>

          {/* Thumbnail */}
          {post.thumbnail && (
            <div className="relative h-64 md:h-80 w-full">
              <Image
                src={post.thumbnail}
                alt={post.title}
                fill
                className="object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
              <div className="absolute bottom-0 left-0 p-6 text-white">
                <span className="inline-block px-3 py-1 bg-blue-600 rounded-full text-xs font-bold uppercase tracking-wider mb-2 shadow-lg">
                  {post.category || 'Geral'}
                </span>
                <h1 className="text-2xl md:text-4xl font-bold leading-tight drop-shadow-lg">
                  {post.title}
                </h1>
              </div>
            </div>
          )}
        </div>

        {/* Conteúdo dos Blocos */}
        <div className="p-6">
          {post.blocks.map((block, index) => (
            <div key={block.id || index} className="mb-8">
              <WidgetRenderer block={block} />
            </div>
          ))}
        </div>

        {/* Footer do Post (simulado) */}
        <div className="p-6 border-t border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-800">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-500 dark:text-gray-400">
              Prévia do post • Não publicado
            </div>
            <div className="flex items-center gap-4">
              {post.isCouponPost && (
                <span className="px-3 py-1 bg-gradient-to-r from-green-500 to-green-600 text-white text-sm font-bold rounded">
                  OFERTA COM CUPOM
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="mt-6 p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-900/30 rounded-lg">
        <p className="text-sm text-yellow-800 dark:text-yellow-300">
          <strong>Nota:</strong> Esta é apenas uma prévia. O post será exibido de forma diferente quando publicado.
        </p>
      </div>
    </div>
  );
};

export default PostPreview;
