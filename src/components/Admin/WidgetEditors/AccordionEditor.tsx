import React, { useState } from 'react';
import { AccordionBlock, AccordionItem } from '../../../types';
import { HiOutlinePlus, HiOutlineTrash, HiOutlineChevronDown, HiOutlineChevronUp } from 'react-icons/hi';
import { RiLayoutBottom2Line, RiPaletteLine } from 'react-icons/ri';
import TextEditor from '../Editors/TextEditor';
import InputWithClear from '../Util/InputWithClear';

interface AccordionEditorProps {
  block: AccordionBlock;
  onUpdate: (field: string, value: any) => void;
}

const AccordionEditor: React.FC<AccordionEditorProps> = ({ block, onUpdate }) => {
  const items: AccordionItem[] = block.accordionItems || [];
  const color = block.accordionColor || 'blue';
  
  const [expandedItem, setExpandedItem] = useState<string | null>(items.length > 0 ? items[0].id : null);

  const handleAddItem = () => {
    const newItem: AccordionItem = {
      id: Date.now().toString(),
      title: 'Novo Item',
      content: 'Conteúdo do item...',
      isOpen: false
    };
    onUpdate('accordionItems', [...items, newItem]);
    setExpandedItem(newItem.id);
  };

  const handleRemoveItem = (id: string) => {
    onUpdate('accordionItems', items.filter((item: AccordionItem) => item.id !== id));
    if (expandedItem === id) setExpandedItem(null);
  };

  const handleUpdateItem = (id: string, field: keyof AccordionItem, value: any) => {
    onUpdate('accordionItems', items.map((item: AccordionItem) => 
      item.id === id ? { ...item, [field]: value } : item
    ));
  };

  const sectionHeaderStyles = "flex items-center gap-2 mb-4 text-slate-800 dark:text-slate-200 font-bold border-b border-slate-200 dark:border-slate-700 pb-2";
  const inputGroupStyles = "bg-white dark:bg-slate-800/50 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm mb-6";
  const inputLabelStyles = "block text-xs font-bold text-slate-500 dark:text-slate-400 mb-1.5 uppercase tracking-wider";
  const inputStyles = "w-full px-4 py-2 bg-gray-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-600 focus:ring-offset-0 focus:bg-white dark:focus:bg-slate-800 transition-all dark:text-white text-sm hover:border-gray-300 dark:hover:border-slate-600";

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Configuração de Cor */}
      <div className={inputGroupStyles}>
        <div className={sectionHeaderStyles}>
          <RiPaletteLine size={20} className="text-blue-500" />
          <span>Estilo e Cores</span>
        </div>
        
        <div>
          <label className={inputLabelStyles}>Cor do Accordion</label>
          <div className="flex gap-3 flex-wrap">
            {[
              { id: 'blue', label: 'Azul', bg: 'bg-blue-500' },
              { id: 'green', label: 'Verde', bg: 'bg-emerald-500' },
              { id: 'orange', label: 'Laranja', bg: 'bg-orange-500' },
              { id: 'purple', label: 'Roxo', bg: 'bg-purple-500' },
              { id: 'slate', label: 'Cinza', bg: 'bg-slate-500' }
            ].map((option) => (
              <button
                key={option.id}
                onClick={() => onUpdate('accordionColor', option.id)}
                className={`flex items-center gap-2 px-3 py-2 rounded-xl border transition-all ${
                  color === option.id 
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 ring-1 ring-blue-500' 
                    : 'border-slate-200 dark:border-slate-700 hover:bg-gray-50 dark:hover:bg-slate-800'
                }`}
              >
                <div className={`w-4 h-4 rounded-full ${option.bg}`} />
                <span className="text-sm font-medium text-slate-700 dark:text-slate-300">{option.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Lista de Itens */}
      <div className={inputGroupStyles}>
        <div className="flex items-center justify-between mb-4 border-b border-slate-200 dark:border-slate-700 pb-2">
          <div className="flex items-center gap-2">
            <RiLayoutBottom2Line size={20} className="text-blue-500" />
            <span className="text-slate-800 dark:text-slate-200 font-bold">Itens do Accordion</span>
          </div>
          <button
            onClick={handleAddItem}
            className="flex items-center gap-1 text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded-lg transition-colors shadow-sm"
          >
            <HiOutlinePlus size={14} /> Adicionar Item
          </button>
        </div>

        <div className="space-y-3">
          {items.map((item: AccordionItem, index: number) => (
            <div 
              key={item.id} 
              className={`border rounded-xl overflow-hidden transition-all ${
                expandedItem === item.id 
                  ? 'border-blue-500 ring-1 ring-blue-500 shadow-md bg-white dark:bg-slate-800' 
                  : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 bg-gray-50 dark:bg-slate-900/50'
              }`}
            >
              <div 
                className="flex items-center justify-between p-3 cursor-pointer select-none"
                onClick={() => setExpandedItem(expandedItem === item.id ? null : item.id)}
              >
                <div className="flex items-center gap-3 flex-1">
                  <span className="flex items-center justify-center w-6 h-6 bg-slate-200 dark:bg-slate-700 rounded-full text-xs font-bold text-slate-600 dark:text-slate-400">
                    {index + 1}
                  </span>
                  <span className="font-bold text-sm text-slate-700 dark:text-slate-200 truncate">
                    {item.title || 'Sem título'}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRemoveItem(item.id);
                    }}
                    className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                    title="Remover item"
                  >
                    <HiOutlineTrash size={16} />
                  </button>
                  {expandedItem === item.id ? (
                    <HiOutlineChevronUp size={18} className="text-slate-400" />
                  ) : (
                    <HiOutlineChevronDown size={18} className="text-slate-400" />
                  )}
                </div>
              </div>

              {expandedItem === item.id && (
                <div className="p-4 border-t border-slate-100 dark:border-slate-700 bg-white dark:bg-slate-800 animate-in slide-in-from-top-2 duration-200">
                  <div className="space-y-4">
                    <div>
                      <label className={inputLabelStyles}>Título do Item</label>
                      <InputWithClear
                        type="text"
                        value={item.title}
                        onChange={(e) => handleUpdateItem(item.id, 'title', e.target.value)}
                        onClear={() => handleUpdateItem(item.id, 'title', '')}
                        className={inputStyles}
                        placeholder="Ex: Características Técnicas"
                      />
                    </div>
                    
                    <div>
                      <label className={inputLabelStyles}>Conteúdo (com suporte a formatação)</label>
                      <div className="border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden">
                        <TextEditor
                          content={item.content}
                          onContentChange={(content) => handleUpdateItem(item.id, 'content', content)}
                          placeholder="Digite a descrição, crie listas, adicione links..."
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}

          {items.length === 0 && (
            <div className="text-center py-8 text-slate-400 border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-xl">
              <p className="text-sm font-medium">Nenhum item adicionado</p>
              <button 
                onClick={handleAddItem}
                className="mt-2 text-xs font-bold text-blue-600 hover:underline"
              >
                Adicionar primeiro item
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AccordionEditor;