import React, { useState } from 'react';
import { Search, X, ChevronLeft, ChevronRight } from 'lucide-react';
import { lucideIcons } from '../../utils/icons';

interface IconPickerProps {
  onSelect: (iconName: string) => void;
  selectedIcon?: string;
  onClose: () => void;
}

const ICONS_PER_PAGE = 24;

export const IconPicker: React.FC<IconPickerProps> = ({ onSelect, selectedIcon, onClose }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  const allIconNames = Object.keys(lucideIcons);
  const filteredIconNames = allIconNames.filter(name => 
    name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalPages = Math.ceil(filteredIconNames.length / ICONS_PER_PAGE);
  const startIndex = (currentPage - 1) * ICONS_PER_PAGE;
  const visibleIcons = filteredIconNames.slice(startIndex, startIndex + ICONS_PER_PAGE);

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-md overflow-hidden border border-gray-200 dark:border-slate-700 animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="p-4 border-b border-gray-100 dark:border-slate-700 flex items-center justify-between bg-gray-50/50 dark:bg-slate-900/50">
          <h3 className="font-bold text-gray-900 dark:text-white flex items-center gap-2">
            Escolher Ícone
          </h3>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-gray-200 dark:hover:bg-slate-700 rounded-full transition-colors"
          >
            <X size={20} className="text-gray-500" />
          </button>
        </div>

        {/* Search */}
        <div className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="Buscar ícone (em inglês)..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full pl-10 pr-4 py-2 bg-gray-100 dark:bg-slate-900 border-none rounded-xl focus:ring-2 focus:ring-blue-500 dark:text-white transition-all"
              autoFocus
            />
          </div>
        </div>

        {/* Icons Grid */}
        <div className="px-4 pb-4 h-[300px] overflow-y-auto custom-scrollbar">
          {visibleIcons.length > 0 ? (
            <div className="grid grid-cols-4 gap-3">
              {visibleIcons.map((name) => {
                const Icon = lucideIcons[name];
                const isSelected = selectedIcon === name;
                return (
                  <button
                    key={name}
                    onClick={() => {
                      onSelect(name);
                      onClose();
                    }}
                    className={`p-4 rounded-xl flex flex-col items-center justify-center gap-2 transition-all border-2 ${
                      isSelected 
                        ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-500 text-blue-600 dark:text-blue-400' 
                        : 'bg-gray-50 dark:bg-slate-900 border-transparent hover:border-gray-200 dark:hover:border-slate-600 text-gray-600 dark:text-gray-400'
                    }`}
                    title={name}
                  >
                    <Icon size={24} />
                    <span className="text-[10px] truncate w-full text-center">{name}</span>
                  </button>
                );
              })}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-gray-500 dark:text-gray-400">
              <Search size={40} className="mb-2 opacity-20" />
              <p>Nenhum ícone encontrado</p>
            </div>
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="p-4 border-t border-gray-100 dark:border-slate-700 flex items-center justify-between bg-gray-50/50 dark:bg-slate-900/50">
            <button
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="p-2 disabled:opacity-30 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-slate-700 rounded-lg transition-colors"
            >
              <ChevronLeft size={20} />
            </button>
            <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
              Página {currentPage} de {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="p-2 disabled:opacity-30 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-slate-700 rounded-lg transition-colors"
            >
              <ChevronRight size={20} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
