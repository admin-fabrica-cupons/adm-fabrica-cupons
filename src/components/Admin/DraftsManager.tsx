// components/Admin/DraftsManager.tsx
import React, { useState, useEffect } from 'react';
import { BlogPost } from '../../types';
import { Save, Trash2, Edit, FileText, Calendar, X } from 'lucide-react';

interface DraftsManagerProps {
  onLoadDraft: (draft: BlogPost) => void;
  onDeleteDraft: (id: string) => Promise<void> | void;
}

const DraftsManager: React.FC<DraftsManagerProps> = ({ onLoadDraft, onDeleteDraft }) => {
  const [drafts, setDrafts] = useState<BlogPost[]>([]);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDrafts();
  }, []);

  const loadDrafts = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/posts?action=drafts', { cache: 'no-store' });
      if (!response.ok) {
        setDrafts([]);
        return;
      }
      const data = await response.json();
      setDrafts(Array.isArray(data?.drafts) ? data.drafts : []);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteDraft = async (id: string) => {
    await onDeleteDraft(id);
    setConfirmDelete(null);
    await loadDrafts();
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Rascunhos</h2>
          <p className="text-gray-600 dark:text-gray-300 mt-1">
            {drafts.length} rascunhos salvos • Última atualização: {new Date().toLocaleTimeString('pt-BR')}
          </p>
        </div>
      </div>

      {loading ? (
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow border border-gray-200 dark:border-slate-700 p-8 text-center">
          <p className="text-gray-500 dark:text-gray-400">Carregando rascunhos...</p>
        </div>
      ) : drafts.length === 0 ? (
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow border border-gray-200 dark:border-slate-700 p-8 text-center">
          <FileText className="w-16 h-16 text-gray-400 dark:text-gray-600 mx-auto mb-3" />
          <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-300 mb-2">
            Nenhum rascunho salvo
          </h3>
          <p className="text-gray-500 dark:text-gray-400">
            Os rascunhos serão salvos automaticamente enquanto você edita
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {drafts.map(draft => (
            <div
              key={draft.id}
              className="bg-white dark:bg-slate-800 rounded-xl shadow border border-gray-200 dark:border-slate-700 p-4 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <h3 className="font-bold text-gray-900 dark:text-white line-clamp-2 mb-1">
                    {draft.title || 'Rascunho sem título'}
                  </h3>
                  <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                    <Calendar size={12} />
                    <span>
                      {draft.lastModified 
                        ? new Date(draft.lastModified).toLocaleDateString('pt-BR')
                        : 'Sem data'}
                    </span>
                    <span className="px-2 py-0.5 bg-gray-100 dark:bg-slate-700 rounded text-xs">
                      {draft.category || 'Sem categoria'}
                    </span>
                  </div>
                </div>
                
                {(draft as any).lastModified && (
                  <span className="text-xs text-gray-500">
                    {new Date((draft as any).lastModified).toLocaleTimeString('pt-BR', { 
                      hour: '2-digit', 
                      minute: '2-digit' 
                    })}
                  </span>
                )}
              </div>
              
              <p className="text-gray-600 dark:text-gray-300 text-sm line-clamp-2 mb-4">
                {draft.excerpt || 'Sem descrição'}
              </p>
              
              <div className="flex items-center gap-2 pt-3 border-t border-gray-100 dark:border-slate-700">
                <button
                  onClick={() => onLoadDraft(draft)}
                  className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition"
                >
                  <Edit size={14} />
                  Continuar
                </button>
                <button
                  onClick={() => setConfirmDelete(draft.id)}
                  className="p-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition"
                  title="Excluir rascunho"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Confirmação de exclusão */}
      {confirmDelete && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-slate-800 rounded-xl p-6 max-w-md w-full mx-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Excluir Rascunho</h3>
              <button
                onClick={() => setConfirmDelete(null)}
                className="p-1 hover:bg-gray-100 dark:hover:bg-slate-700 rounded"
              >
                <X size={20} />
              </button>
            </div>
            
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              Tem certeza que deseja excluir este rascunho? Esta ação não pode ser desfeita.
            </p>
            
            <div className="flex gap-3">
              <button
                onClick={() => handleDeleteDraft(confirmDelete)}
                className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-medium rounded"
              >
                Excluir
              </button>
              <button
                onClick={() => setConfirmDelete(null)}
                className="flex-1 px-4 py-2 bg-gray-200 dark:bg-slate-700 hover:bg-gray-300 dark:hover:bg-slate-600 text-gray-800 dark:text-white font-medium rounded"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DraftsManager;
