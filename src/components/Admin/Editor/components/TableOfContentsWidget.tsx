import React, { useEffect, useState } from 'react';
import { NodeViewWrapper, NodeViewProps } from '@tiptap/react';
import { List } from 'lucide-react';

export const TableOfContentsWidget: React.FC<NodeViewProps> = ({ editor, node, updateAttributes }) => {
  const [items, setItems] = useState<any[]>([]);

  useEffect(() => {
    if (!editor) return;

    const updateItems = () => {
      const headings: any[] = [];
      editor.state.doc.descendants((node, pos) => {
        if (node.type.name === 'heading') {
          headings.push({
            level: node.attrs.level,
            text: node.textContent,
            pos,
          });
        }
      });
      setItems(headings);
    };

    updateItems();
    editor.on('update', updateItems);
    return () => {
      editor.off('update', updateItems);
    };
  }, [editor]);

  const handleJump = (pos: number) => {
    if (!editor) return;
    editor.chain().focus().setTextSelection(pos).run();
    // Tenta encontrar o elemento no DOM para scrollar
    // Nota: isso pode não ser perfeito se o conteúdo não estiver renderizado, mas funciona na maioria dos casos
    setTimeout(() => {
        const element = editor.view.dom.querySelector(`[data-toc-id="${pos}"]`); // Placeholder logic
        // Como não temos IDs nos headings por padrão, vamos confiar no scroll do focus ou implementar IDs
        // O focus() geralmente traz para a viewport.
        // Se quisermos IDs, precisaríamos de uma extensão de Heading que adiciona IDs únicos.
    }, 50);
  };

  return (
    <NodeViewWrapper className="my-6 not-prose">
      <div className="bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
        <div className="flex items-center gap-2 mb-4 border-b border-slate-200 dark:border-slate-800 pb-3">
           <List className="text-blue-600 dark:text-blue-400" size={20} />
           <input 
             value={node.attrs.title} 
             onChange={e => updateAttributes({ title: e.target.value })}
             className="bg-transparent text-lg font-bold text-slate-800 dark:text-slate-100 focus:outline-none placeholder:text-slate-400 w-full"
             placeholder="Título do Sumário"
           />
        </div>
        <div className="space-y-2">
          {items.length === 0 ? (
             <p className="text-sm text-slate-400 italic py-2">Adicione títulos ao seu texto para vê-los aqui.</p>
          ) : (
            items.map((item, index) => (
              <button
                key={index}
                onClick={() => handleJump(item.pos)}
                className={`block w-full text-left text-sm hover:text-blue-600 dark:hover:text-blue-400 transition-colors py-1 leading-relaxed ${
                  item.level === 1 
                    ? 'font-bold text-slate-700 dark:text-slate-200' 
                    : item.level === 2 
                      ? 'pl-4 text-slate-600 dark:text-slate-300' 
                      : 'pl-8 text-xs text-slate-500 dark:text-slate-400'
                }`}
              >
                {item.text || '(Sem título)'}
              </button>
            ))
          )}
        </div>
      </div>
    </NodeViewWrapper>
  );
};
