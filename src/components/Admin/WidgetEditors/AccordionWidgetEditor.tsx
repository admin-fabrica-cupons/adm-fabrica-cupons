import React from 'react';
import { Block, ListItem } from '../../../types';
import { useAppSounds } from '../../../hooks/useAppSounds';
import { BiDetail, BiTrashAlt } from 'react-icons/bi';
import { RiListSettingsLine } from 'react-icons/ri';
import { MdOutlineTitle } from 'react-icons/md';
import { ChevronDown, ChevronUp, Plus } from 'lucide-react';
import InputWithClear from '../Util/InputWithClear';

interface AccordionWidgetEditorProps {
  block: Block;
  onUpdate: (field: keyof Block, value: any) => void;
}

const AccordionWidgetEditor: React.FC<AccordionWidgetEditorProps> = ({ block, onUpdate }) => {
  const { playClick, playAdd, playDelete } = useAppSounds();
  const items: ListItem[] = 'items' in block ? (block as any).items || [] : [];

  const handleAddItem = () => {
    const newItem: ListItem = {
      id: crypto.randomUUID(),
      title: 'Novo Item',
      description: ''
    };
    onUpdate('items' as any, [...items, newItem]);
    playAdd();
  };

  const handleUpdateItem = (index: number, field: keyof ListItem, value: any) => {
    const newItems = [...items];
    newItems[index] = { ...newItems[index], [field]: value };
    onUpdate('items' as any, newItems);
  };

  const handleRemoveItem = (index: number) => {
    const newItems = items.filter((_: ListItem, i: number) => i !== index);
    onUpdate('items' as any, newItems);
    playDelete();
  };

  const handleMoveItem = (index: number, direction: 'up' | 'down') => {
    if (direction === 'up' && index === 0) return;
    if (direction === 'down' && index === items.length - 1) return;

    const newItems = [...items];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    [newItems[index], newItems[targetIndex]] = [newItems[targetIndex], newItems[index]];
    onUpdate('items' as any, newItems);
    playClick();
  };

  const sectionHeaderStyles = "flex items-center gap-2 mb-4 font-bold border-b pb-2";
  const inputLabelStyles = "block text-[10px] font-black text-slate-500 dark:text-slate-400 mb-1.5 uppercase tracking-widest";
  const baseInputStyles = "w-full px-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-offset-0 transition-all dark:text-white text-sm hover:border-gray-300 dark:hover:border-slate-600";
  const getRingClass = (color: string) => `focus:border-${color}-500 focus:ring-${color}-500/20`;

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="bg-cyan-50/50 dark:bg-cyan-900/10 p-6 rounded-2xl border border-cyan-100 dark:border-cyan-800 shadow-sm transition-all hover:shadow-md group hover:border-cyan-200 dark:hover:border-cyan-700">
        <div className={`${sectionHeaderStyles} text-cyan-800 dark:text-cyan-200 border-cyan-200 dark:border-cyan-800`}>
          <RiListSettingsLine size={20} className="text-cyan-600 dark:text-cyan-400" />
          <span>Itens do Acordeão</span>
        </div>

        <div className="space-y-4">
          {items.map((item: ListItem, index: number) => (
            <div key={item.id || index} className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 p-4 shadow-sm group/item hover:border-cyan-300 dark:hover:border-cyan-700 transition-all">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <span className="flex items-center justify-center w-6 h-6 rounded-full bg-cyan-100 dark:bg-cyan-900/30 text-cyan-600 dark:text-cyan-400 text-xs font-bold">
                    {index + 1}
                  </span>
                  <span className="text-sm font-bold text-slate-700 dark:text-slate-300 truncate max-w-[200px]">
                    {item.title}
                  </span>
                </div>
                <div className="flex items-center gap-1">
                   <button
                    onClick={() => handleMoveItem(index, 'up')}
                    disabled={index === 0}
                    className="p-1.5 text-slate-400 hover:text-cyan-600 hover:bg-cyan-50 dark:hover:bg-cyan-900/20 rounded-lg transition disabled:opacity-30"
                  >
                    <ChevronUp size={16} />
                  </button>
                  <button
                    onClick={() => handleMoveItem(index, 'down')}
                    disabled={index === items.length - 1}
                    className="p-1.5 text-slate-400 hover:text-cyan-600 hover:bg-cyan-50 dark:hover:bg-cyan-900/20 rounded-lg transition disabled:opacity-30"
                  >
                    <ChevronDown size={16} />
                  </button>
                  <div className="w-px h-4 bg-slate-200 dark:bg-slate-700 mx-1" />
                  <button
                    onClick={() => handleRemoveItem(index)}
                    className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition"
                  >
                    <BiTrashAlt size={16} />
                  </button>
                </div>
              </div>

              <div className="space-y-3">
                <div>
                  <label className={inputLabelStyles}>Título</label>
                  <InputWithClear
                    value={item.title}
                    onChange={(e) => handleUpdateItem(index, 'title', e.target.value)}
                    onClear={() => handleUpdateItem(index, 'title', '')}
                    className={`${baseInputStyles} ${getRingClass('cyan')}`}
                    placeholder="Pergunta ou Título"
                    icon={<MdOutlineTitle size={18} className="text-cyan-500" />}
                  />
                </div>
                <div>
                  <label className={inputLabelStyles}>Conteúdo</label>
                  <InputWithClear
                    as="textarea"
                    value={item.description || ''}
                    onChange={(e) => handleUpdateItem(index, 'description', e.target.value)}
                    onClear={() => handleUpdateItem(index, 'description', '')}
                    className={`${baseInputStyles} h-24 resize-none ${getRingClass('cyan')}`}
                    placeholder="Resposta ou Conteúdo detalhado..."
                    icon={<BiDetail size={18} className="text-cyan-500" />}
                  />
                </div>
              </div>
            </div>
          ))}

          <button
            onClick={handleAddItem}
            className="w-full py-3 border-2 border-dashed border-cyan-200 dark:border-cyan-800/50 rounded-xl flex items-center justify-center gap-2 text-cyan-600 dark:text-cyan-400 font-bold hover:bg-cyan-50 dark:hover:bg-cyan-900/20 transition-all group"
          >
            <div className="p-1 bg-cyan-100 dark:bg-cyan-900/30 rounded-full group-hover:scale-110 transition-transform">
              <Plus size={16} />
            </div>
            Adicionar Item
          </button>
        </div>
      </div>
    </div>
  );
};

export default AccordionWidgetEditor;
