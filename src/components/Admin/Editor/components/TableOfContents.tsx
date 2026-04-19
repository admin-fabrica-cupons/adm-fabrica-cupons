import React, { useEffect, useState } from 'react';
import { Editor } from '@tiptap/react';
import { List } from 'lucide-react';

interface TableOfContentsProps {
  editor: Editor;
}

export const TableOfContents: React.FC<TableOfContentsProps> = ({ editor }) => {
  const [items, setItems] = useState<any[]>([]);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (!editor) return;

    const updateItems = () => {
      const headings: any[] = [];
      const transaction = editor.state.tr;

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

  if (items.length === 0) {
    return null;
  }

  const handleItemClick = (pos: number) => {
    editor.chain().focus().setTextSelection(pos).run();
    const domElement = editor.view.domAtPos(pos).node as HTMLElement;
    if (domElement && domElement.scrollIntoView) {
      domElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center gap-2 px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
          isOpen 
            ? 'bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400' 
            : 'text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800'
        }`}
        title="Índice"
      >
        <List size={16} />
        <span className="hidden sm:inline">Índice</span>
      </button>

      {isOpen && (
        <div className="absolute top-full right-0 mt-2 w-64 max-h-80 overflow-y-auto bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg shadow-xl z-50 p-2">
          <div className="text-xs font-semibold text-slate-500 uppercase mb-2 px-2">Nesta página</div>
          <div className="space-y-0.5">
            {items.map((item, index) => (
              <button
                key={index}
                onClick={() => handleItemClick(item.pos)}
                className={`w-full text-left px-2 py-1.5 text-sm rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 transition-colors truncate
                  ${item.level === 1 ? 'font-medium' : ''}
                  ${item.level === 2 ? 'pl-4 text-xs' : ''}
                  ${item.level === 3 ? 'pl-6 text-xs text-slate-500' : ''}
                `}
              >
                {item.text}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
