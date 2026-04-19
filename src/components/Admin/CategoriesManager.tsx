import React, { useState, useMemo } from 'react';
import { BlogPost } from '../../types';
import { 
  Search, FolderTree, FolderPlus, FolderMinus, Edit, Check, XCircle, FileText, Tag, Calendar, AlertCircle, Image as ImageIcon,
  Loader2
} from 'lucide-react';
import { getDefaultCategoryIconName, lucideIcons } from '../../utils/icons';
import { validateCategoryIcons, checkMissingIcons } from '../../utils/validateIcons';
import { useCategoryIcons } from '../../hooks/useCategoryIcons';
import { IconPicker } from '../Common/IconPicker';
import { useAppSounds } from '../../hooks/useAppSounds';

interface CategoriesManagerProps {
  categories: string[];
  updateCategories: (categories: string[]) => void;
  categoryIcons?: Record<string, string>;
  updateCategoryIcon?: (category: string, icon: string) => void;
  posts: BlogPost[];
  onNotification: (type: 'success' | 'error' | 'warning' | 'info', message: string, title?: string) => void;
}

const CategoriesManager: React.FC<CategoriesManagerProps> = ({ 
  categories, 
  updateCategories,
  categoryIcons = {},
  updateCategoryIcon = () => {},
  posts,
  onNotification 
}) => {
  const { playClick, playAdd, playDelete, playSuccess, playError, playWarning } = useAppSounds();
  const { getCategoryIcon, getCategoryIconName } = useCategoryIcons();
  const [newCategory, setNewCategory] = useState('');
  const [newCategoryIcon, setNewCategoryIcon] = useState('Tag');
  const [searchTerm, setSearchTerm] = useState('');
  const [editingCategory, setEditingCategory] = useState<string | null>(null);
  const [editValue, setEditValue] = useState('');
  
  // States for icon management
  const [selectedCategoryForIcon, setSelectedCategoryForIcon] = useState<string | null>(null);
  const [isAddingNewCategoryIcon, setIsAddingNewCategoryIcon] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const defaultIconName = useMemo(() => {
    if (isAddingNewCategoryIcon) return 'Tag';
    if (!selectedCategoryForIcon) return null;
    return getDefaultCategoryIconName(selectedCategoryForIcon);
  }, [selectedCategoryForIcon, isAddingNewCategoryIcon]);

  const handleIconSelect = (iconName: string) => {
    if (isAddingNewCategoryIcon) {
      setNewCategoryIcon(iconName);
      setIsAddingNewCategoryIcon(false);
      playClick();
    } else if (selectedCategoryForIcon) {
      updateCategoryIcon(selectedCategoryForIcon, iconName);
      onNotification('success', `Ícone atualizado para ${selectedCategoryForIcon}`);
      setSelectedCategoryForIcon(null);
      playSuccess();
    }
  };

  const validationErrors = useMemo(() => validateCategoryIcons(categoryIcons), [categoryIcons]);
  const missingIcons = useMemo(() => checkMissingIcons(categories, categoryIcons), [categories, categoryIcons]);

  const filteredCategories = categories.filter(cat =>
    cat.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const addCategory = async () => {
    if (!newCategory.trim()) {
      onNotification('warning', 'Digite um nome para a nova categoria');
      playWarning();
      return;
    }

    if (categories.includes(newCategory.trim())) {
      onNotification('warning', 'Esta categoria já existe');
      playWarning();
      return;
    }

    setIsLoading(true);
    
    // Simular delay de rede para feedback visual
    await new Promise(resolve => setTimeout(resolve, 600));

    updateCategories([...categories, newCategory.trim()]);
    if (newCategoryIcon) {
      updateCategoryIcon(newCategory.trim(), newCategoryIcon);
    }
    
    setIsLoading(false);
    onNotification('success', `Categoria "${newCategory.trim()}" adicionada`);
    playAdd();
    setNewCategory('');
    setNewCategoryIcon('Tag');
  };

  const removeCategory = (catToRemove: string) => {
    if (catToRemove === 'Cupons') {
      onNotification('error', 'A categoria "Cupons" não pode ser removida');
      playError();
      return;
    }

    const postsUsingCategory = posts.filter(post => post.category === catToRemove);
    if (postsUsingCategory.length > 0) {
      onNotification('error', 
        `Não é possível remover a categoria "${catToRemove}" porque existem ${postsUsingCategory.length} post(s) usando ela`,
        'Categoria em uso'
      );
      playError();
      return;
    }

    updateCategories(categories.filter(cat => cat !== catToRemove));
    onNotification('success', `Categoria "${catToRemove}" removida`);
    playDelete();
  };

  const startEdit = (category: string) => {
    setEditingCategory(category);
    setEditValue(category);
    playClick();
  };

  const saveEdit = () => {
    if (!editValue.trim() || editValue.trim() === editingCategory) {
      setEditingCategory(null);
      return;
    }

    if (categories.includes(editValue.trim()) && editValue.trim() !== editingCategory) {
      onNotification('warning', 'Já existe uma categoria com este nome');
      playWarning();
      return;
    }

    const updatedPosts = posts.map(post =>
      post.category === editingCategory
        ? { ...post, category: editValue.trim() }
        : post
    );

    const updatedCategories = categories.map(cat =>
      cat === editingCategory ? editValue.trim() : cat
    );

    updateCategories(updatedCategories);
    onNotification('success', `Categoria atualizada para "${editValue.trim()}"`);
    playSuccess();
    setEditingCategory(null);
  };

  const cancelEdit = () => {
    setEditingCategory(null);
    setEditValue('');
    playClick();
  };

  const getCategoryStats = (category: string) => {
    const categoryPosts = posts.filter(post => post.category === category);
    const couponPosts = categoryPosts.filter(post => post.isCouponPost).length;
    const regularPosts = categoryPosts.length - couponPosts;

    return {
      total: categoryPosts.length,
      couponPosts,
      regularPosts,
    };
  };

  return (
    <div className="max-w-5xl mx-auto bg-white dark:bg-slate-800 rounded-xl shadow border border-gray-200 dark:border-slate-700 relative">
      
      {/* Icon Picker Component */}
      {(selectedCategoryForIcon || isAddingNewCategoryIcon) && (
        <IconPicker 
          onSelect={handleIconSelect}
          onClose={() => {
            setSelectedCategoryForIcon(null);
            setIsAddingNewCategoryIcon(false);
          }}
          selectedIcon={isAddingNewCategoryIcon ? newCategoryIcon : (selectedCategoryForIcon ? categoryIcons[selectedCategoryForIcon] : undefined)}
        />
      )}

      <div className="p-6 border-b border-gray-200 dark:border-slate-700">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">Gerenciar Categorias</h2>
            <p className="text-gray-600 dark:text-gray-300 mt-1">
              Total: {categories.length} categorias
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Buscar categorias..."
                className="pl-10 pr-4 py-2 border rounded-lg dark:bg-slate-700 dark:border-slate-600 dark:text-white w-full md:w-64"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Diagnostics */}
      {(validationErrors.length > 0 || missingIcons.length > 0) && (
        <div className="px-6 pt-6">
          <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4">
            <h4 className="font-bold text-amber-800 dark:text-amber-200 flex items-center gap-2 mb-2">
              <AlertCircle size={18} /> Diagnóstico de Ícones
            </h4>
            <div className="max-h-32 overflow-y-auto pr-2">
              <ul className="space-y-1 text-sm text-amber-700 dark:text-amber-300">
                {validationErrors.map((err, i) => (
                  <li key={`err-${i}`} className="flex items-start gap-2">
                    <span className="mt-1">•</span> {err}
                  </li>
                ))}
                {missingIcons.map((cat, i) => (
                  <li key={`miss-${i}`} className="flex items-start gap-2">
                    <span className="mt-1">•</span> 
                    <span>
                      A categoria <strong>{cat}</strong> não tem ícone personalizado. 
                      <button 
                        onClick={() => setSelectedCategoryForIcon(cat)}
                        className="ml-2 text-amber-900 dark:text-amber-100 underline hover:no-underline font-medium"
                      >
                        Resolver
                      </button>
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      <div className="p-6 border-b border-gray-200 dark:border-slate-700">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Adicionar Nova Categoria</h3>
        <div className="flex gap-2">
          <button
            onClick={() => setIsAddingNewCategoryIcon(true)}
            className="p-3 border-2 border-dashed border-gray-300 dark:border-slate-600 rounded-lg hover:border-blue-500 dark:hover:border-blue-400 transition-colors flex items-center justify-center min-w-[56px] bg-gray-50 dark:bg-slate-900/50 group"
            title="Selecionar ícone"
          >
            {(() => {
              const Icon = lucideIcons[newCategoryIcon] || Tag;
              return <Icon size={24} className="text-gray-500 group-hover:text-blue-500 transition-colors" />;
            })()}
          </button>
          <input
            type="text"
            value={newCategory}
            onChange={(e) => setNewCategory(e.target.value)}
            placeholder="Digite o nome da nova categoria"
            className="flex-1 p-3 border rounded-lg dark:bg-slate-700 dark:border-slate-600 dark:text-white focus:ring-2 focus:ring-blue-500"
            onKeyPress={(e) => e.key === 'Enter' && addCategory()}
          />
          <button
            onClick={addCategory}
            disabled={!newCategory.trim() || isLoading}
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 disabled:cursor-not-allowed text-white rounded-lg font-medium transition-colors flex items-center gap-2 min-w-[140px] justify-center"
          >
            {isLoading ? <Loader2 size={20} className="animate-spin" /> : <FolderPlus size={20} />}
            {isLoading ? 'Salvando...' : 'Adicionar'}
          </button>
        </div>
      </div>

      <div className="divide-y divide-gray-200 dark:divide-slate-700">
        {filteredCategories.length === 0 ? (
          <div className="p-8 text-center">
            <FolderTree className="w-12 h-12 text-gray-400 dark:text-gray-600 mx-auto mb-3" />
            <p className="text-gray-500 dark:text-gray-400">Nenhuma categoria encontrada</p>
          </div>
        ) : (
          filteredCategories.map((category) => {
            const stats = getCategoryStats(category);
            const isCuponsCategory = category === 'Cupons';

            return (
              <div key={category} className="p-6 hover:bg-gray-50 dark:hover:bg-slate-700/50 transition">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      {editingCategory === category ? (
                        <div className="flex items-center gap-2 flex-1">
                          <button 
                            onClick={() => setSelectedCategoryForIcon(category)}
                            className={`p-2 rounded-lg ${isCuponsCategory ? 'bg-green-100 dark:bg-green-900/30' : 'bg-blue-100 dark:bg-blue-900/30'} hover:opacity-80 transition-opacity group relative`}
                            title="Alterar ícone"
                          >
                            {getCategoryIcon(category, 20, isCuponsCategory ? 'text-green-600 dark:text-green-400' : 'text-blue-600 dark:text-blue-400')}
                            <div className="absolute inset-0 flex items-center justify-center bg-black/20 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity">
                              <Edit size={12} className="text-white" />
                            </div>
                          </button>
                          <input
                            type="text"
                            value={editValue}
                            onChange={(e) => setEditValue(e.target.value)}
                            className="flex-1 p-2 border rounded dark:bg-slate-800 dark:border-slate-600 dark:text-white"
                            autoFocus
                            onKeyPress={(e) => e.key === 'Enter' && saveEdit()}
                            disabled={isCuponsCategory}
                          />
                          <button
                            onClick={saveEdit}
                            className="p-2 text-green-600 hover:text-green-800 hover:bg-green-50 dark:hover:bg-green-900/30 rounded-lg transition-colors"
                            title="Salvar"
                          >
                            <Check size={18} />
                          </button>
                          <button
                            onClick={cancelEdit}
                            className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors"
                            title="Cancelar"
                          >
                            <XCircle size={18} />
                          </button>
                        </div>
                      ) : (
                        <>
                          <button 
                            onClick={() => setSelectedCategoryForIcon(category)}
                            className={`p-2 rounded-lg ${isCuponsCategory ? 'bg-green-100 dark:bg-green-900/30' : 'bg-blue-100 dark:bg-blue-900/30'} hover:opacity-80 transition-opacity group relative`}
                            title="Alterar ícone"
                          >
                            {getCategoryIcon(category, 20, isCuponsCategory ? 'text-green-600 dark:text-green-400' : 'text-blue-600 dark:text-blue-400')}
                            <div className="absolute inset-0 flex items-center justify-center bg-black/20 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity">
                              <Edit size={12} className="text-white" />
                            </div>
                          </button>
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <h4 className="font-bold text-gray-900 dark:text-white">{category}</h4>
                              {isCuponsCategory && (
                                <span className="text-xs font-bold bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 px-2 py-1 rounded">
                                  FIXA
                                </span>
                              )}
                            </div>
                            <div className="flex items-center gap-4 mt-2 text-sm text-gray-500 dark:text-gray-400">
                              <span className="flex items-center gap-1">
                                <FileText size={14} />
                                {stats.total} posts
                              </span>
                              {stats.couponPosts > 0 && (
                                <span className="flex items-center gap-1">
                                  <Tag size={14} />
                                  {stats.couponPosts} cupons
                                </span>
                              )}
                              <span className="flex items-center gap-1">
                                <Calendar size={14} />
                                Atualizado hoje
                              </span>
                            </div>
                          </div>
                        </>
                      )}
                    </div>
                  </div>

                  {editingCategory !== category && (
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => startEdit(category)}
                        className="p-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg transition-colors"
                        title="Editar categoria"
                        disabled={isCuponsCategory}
                      >
                        <Edit size={18} />
                      </button>
                      <button
                        onClick={() => removeCategory(category)}
                        className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors"
                        title="Remover categoria"
                        disabled={isCuponsCategory || stats.total > 0}
                      >
                        <FolderMinus size={18} />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default CategoriesManager;
