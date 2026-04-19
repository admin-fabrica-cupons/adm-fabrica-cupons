import React, { useState } from 'react';
import { AccordionBlock } from '../../types';
import { ChevronDown } from 'lucide-react';
import TextView from '../Admin/Util/TextView';

interface AccordionWidgetProps {
  data: AccordionBlock;
  isPreview?: boolean;
}

const colorMap: Record<string, { activeBg: string; activeText: string; iconBg: string; iconText: string }> = {
  blue: {
    activeBg: 'bg-blue-50 dark:bg-blue-900/20',
    activeText: 'text-blue-600 dark:text-blue-400',
    iconBg: 'bg-blue-100 dark:bg-blue-900/30',
    iconText: 'text-blue-600 dark:text-blue-400',
  },
  green: {
    activeBg: 'bg-emerald-50 dark:bg-emerald-900/20',
    activeText: 'text-emerald-600 dark:text-emerald-400',
    iconBg: 'bg-emerald-100 dark:bg-emerald-900/30',
    iconText: 'text-emerald-600 dark:text-emerald-400',
  },
  orange: {
    activeBg: 'bg-orange-50 dark:bg-orange-900/20',
    activeText: 'text-orange-600 dark:text-orange-400',
    iconBg: 'bg-orange-100 dark:bg-orange-900/30',
    iconText: 'text-orange-600 dark:text-orange-400',
  },
  purple: {
    activeBg: 'bg-purple-50 dark:bg-purple-900/20',
    activeText: 'text-purple-600 dark:text-purple-400',
    iconBg: 'bg-purple-100 dark:bg-purple-900/30',
    iconText: 'text-purple-600 dark:text-purple-400',
  },
  slate: {
    activeBg: 'bg-slate-100 dark:bg-slate-700/50',
    activeText: 'text-slate-700 dark:text-slate-300',
    iconBg: 'bg-slate-200 dark:bg-slate-600',
    iconText: 'text-slate-600 dark:text-slate-400',
  }
};

const AccordionWidget: React.FC<AccordionWidgetProps> = ({ data, isPreview = false }) => {
  const [openItems, setOpenItems] = useState<string[]>([]);
  const items = data.accordionItems || [];
  const color = data.accordionColor || 'blue';
  const styles = colorMap[color] || colorMap.blue;

  const toggleItem = (id: string) => {
    setOpenItems(prev => 
      prev.includes(id) 
        ? prev.filter(itemId => itemId !== id)
        : [...prev, id]
    );
  };

  if ((!items || items.length === 0) && !isPreview) return null;
  const displayItems = isPreview && items.length === 0
    ? [{ id: 'preview', title: 'Título do Acordeão', content: 'Conteúdo do acordeão...' }]
    : items;

  return (
    <div className="not-prose w-full space-y-3 my-6">
      {displayItems.map((item, index) => {
        const itemId = item.id || index.toString();
        const isOpen = openItems.includes(itemId);

        return (
          <div 
            key={itemId}
            className="border border-gray-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 overflow-hidden transition-all duration-300 shadow-sm hover:shadow-md"
          >
            <button
              onClick={() => toggleItem(itemId)}
              className={`w-full px-5 py-4 flex items-center justify-between text-left transition-colors ${
                isOpen 
                  ? styles.activeBg + ' ' + styles.activeText
                  : 'bg-white dark:bg-slate-800 text-gray-800 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-slate-700/30'
              }`}
            >
              <span className="font-bold text-base md:text-lg pr-4">{item.title}</span>
              <div className={`flex-shrink-0 p-1 rounded-full transition-transform duration-300 ${
                isOpen 
                  ? 'rotate-180 ' + styles.iconBg 
                  : 'bg-gray-100 dark:bg-slate-700'
              }`}>
                <ChevronDown size={20} className={isOpen ? styles.iconText : 'text-gray-500 dark:text-gray-400'} />
              </div>
            </button>
            
            <div 
              className={`transition-all duration-300 ease-in-out overflow-hidden ${
                isOpen ? 'max-h-[2000px] opacity-100' : 'max-h-0 opacity-0'
              }`}
            >
              <div className="p-5 pt-2 border-t border-gray-100 dark:border-slate-700/50 bg-white dark:bg-slate-800">
                <TextView content={item.content || ''} />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default AccordionWidget;
