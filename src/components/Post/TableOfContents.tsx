// components/TableOfContents.tsx
import React, { useEffect, useState, useRef } from 'react';
import { Block, BlockType, HeadingBlock } from '../../types';
import { LuTableOfContents } from 'react-icons/lu';
import { cn } from '@/lib/utils';

interface TableOfContentsProps {
  blocks: Block[];
  variant?: 'default' | 'sidebar';
}

const TableOfContents: React.FC<TableOfContentsProps> = ({ blocks, variant = 'default' }) => {
  const [activeId, setActiveId] = useState<number | null>(null);

  // Extrair apenas os blocos do tipo heading
  const headings = blocks
    .map((block, index) => ({ block, index }))
    .filter(
      (item): item is { block: HeadingBlock; index: number } =>
        item.block.type === BlockType.HEADING &&
        'content' in item.block &&
        typeof item.block.content === 'string' &&
        item.block.content.trim().length > 0
    );

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const id = parseInt(entry.target.id.replace('heading-', ''));
            setActiveId(id);
          }
        });
      },
      { rootMargin: '-100px 0px -70% 0px' }
    );

    headings.forEach(({ index }) => {
      const element = document.getElementById(`heading-${index}`);
      if (element) observer.observe(element);
    });

    return () => observer.disconnect();
  }, [headings]);

  if (headings.length === 0) {
    return null;
  }

  const isSidebar = variant === 'sidebar';

  const scrollToHeading = (index: number) => {
    const element = document.getElementById(`heading-${index}`);
    if (element) {
      const offset = 120;
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - offset;

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
      setActiveId(index);
    }
  };

  if (isSidebar) {
    return (
      <div className="sticky top-24 p-5 bg-white dark:bg-slate-900 rounded-xl border border-slate-100 dark:border-slate-800 transition-all duration-300 shadow-sm">
        <div className="flex items-center gap-2 mb-4 pb-3 border-b border-slate-100 dark:border-slate-800">
          <div className="p-1.5 bg-blue-100 dark:bg-blue-900/30 rounded-lg text-blue-600 dark:text-blue-400">
             <LuTableOfContents size={18} />
          </div>
          <h3 className="text-sm font-bold text-slate-700 dark:text-slate-200 uppercase tracking-wide">
            Navegue pelo conteúdo
          </h3>
        </div>
        <nav className="space-y-1 relative pl-3">
          {/* Linha vertical contínua */}
          <div className="absolute left-[31px] top-2 bottom-2 w-[2px] bg-slate-100 dark:bg-slate-800" />
          
          {headings.map((item, index) => {
            const isActive = activeId === item.index;
            return (
              <button
                key={`${item.index}-${index}`}
                onClick={() => scrollToHeading(item.index)}
                title={item.block.content?.replace(/<[^>]*>/g, '')}
                className={cn(
                  "relative flex items-center gap-3 w-full text-left py-2 px-2 rounded-lg transition-all duration-300 group z-10",
                  isActive 
                    ? "bg-blue-50 dark:bg-blue-900/10" 
                    : "hover:bg-slate-50 dark:hover:bg-slate-800/50"
                )}
              >
                <div className={cn(
                  "relative z-20 flex items-center justify-center w-6 h-6 rounded-full text-[10px] font-bold transition-all duration-300 border-2",
                  isActive 
                    ? "bg-blue-600 border-blue-600 text-white scale-110 shadow-md shadow-blue-500/20" 
                    : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-400 group-hover:border-blue-400 group-hover:text-blue-500"
                )}>
                  {index + 1}
                </div>
                <span className={cn(
                  "flex-1 min-w-0 text-xs transition-colors line-clamp-2",
                  isActive 
                    ? "text-blue-700 dark:text-blue-300 font-bold" 
                    : "text-slate-500 dark:text-slate-400 font-medium group-hover:text-slate-900 dark:group-hover:text-white"
                )}>
                  {item.block.content?.replace(/<[^>]*>/g, '')}
                </span>
              </button>
            );
          })}
        </nav>
      </div>
    );
  }

  return (
    <div className="mb-8 p-4 bg-white dark:bg-slate-900 rounded-xl border border-slate-100 dark:border-slate-800">
      <div className="flex items-center gap-2 mb-4 pb-3 border-b border-slate-50 dark:border-slate-800/50">
        <h3 className="text-sm font-bold text-slate-700 dark:text-slate-200">Índice do Conteúdo</h3>
      </div>
      <nav className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2">
        {headings.map((item, index) => (
          <button
            key={`${item.index}-${index}`}
            onClick={() => scrollToHeading(item.index)}
            className="flex items-start gap-3 w-full text-left py-1.5 group"
          >
            <span className="flex-shrink-0 text-xs font-mono text-slate-300 dark:text-slate-600 group-hover:text-blue-500 transition-colors mt-0.5">
              {(index + 1).toString().padStart(2, '0')}
            </span>
            <span className="text-sm font-medium text-slate-600 dark:text-slate-400 group-hover:text-slate-900 dark:group-hover:text-white transition-colors line-clamp-1">
              {item.block.content?.replace(/<[^>]*>/g, '')}
            </span>
          </button>
        ))}
      </nav>
    </div>
  );
};

export default TableOfContents;
