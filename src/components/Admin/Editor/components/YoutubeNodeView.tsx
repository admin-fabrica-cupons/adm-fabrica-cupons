import { NodeViewWrapper, NodeViewProps } from '@tiptap/react';
import React, { useState, useRef, useEffect } from 'react';
import { AlignLeft, AlignCenter, AlignRight, Trash2, Edit2, Maximize2 } from 'lucide-react';
import * as ContextMenu from '@radix-ui/react-context-menu';

export const YoutubeNodeView: React.FC<NodeViewProps> = (props) => {
  const { node, updateAttributes, deleteNode, selected, editor, getPos } = props;
  const [url, setUrl] = useState(node.attrs.src);
  const [width, setWidth] = useState(node.attrs.width || '100%');
  const [height, setHeight] = useState(node.attrs.height || 480);
  const [align, setAlign] = useState(node.attrs.align || 'center');
  
  const isSelected = selected;

  useEffect(() => {
    setAlign(node.attrs.align || 'center');
    setWidth(node.attrs.width || '100%');
    setHeight(node.attrs.height || 480);
  }, [node.attrs]);

  const handleAlign = (newAlign: 'left' | 'center' | 'right') => {
    updateAttributes({ align: newAlign });
    setAlign(newAlign);
  };

  const handleResize = (newWidth: string) => {
    updateAttributes({ width: newWidth });
    setWidth(newWidth);
  };

  const handleEdit = () => {
    const newUrl = window.prompt('Nova URL do YouTube:', node.attrs.src);
    if (newUrl) {
      updateAttributes({ src: newUrl });
    }
  };

  const wrapperStyle = {
    display: 'flex',
    justifyContent: align === 'left' ? 'flex-start' : align === 'right' ? 'flex-end' : 'center',
    width: '100%',
    margin: '1rem 0',
  };

  return (
    <ContextMenu.Root>
      <ContextMenu.Trigger asChild>
        <NodeViewWrapper className="youtube-component" style={wrapperStyle}>
          <div 
            className={`relative group transition-all duration-200 ${isSelected ? 'ring-2 ring-blue-500 rounded-lg' : ''}`}
            style={{ width: width, maxWidth: '100%' }}
          >
            <div className="relative w-full aspect-video rounded-lg overflow-hidden bg-slate-100 dark:bg-slate-800 shadow-sm border border-slate-200 dark:border-slate-800">
              <iframe
                src={`https://www.youtube.com/embed/${getYouTubeID(node.attrs.src)}`}
                className="absolute top-0 left-0 w-full h-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                title="YouTube video player"
              />
              {!isSelected && (
                <div className="absolute inset-0 z-10 cursor-pointer" />
              )}
            </div>
          </div>
        </NodeViewWrapper>
      </ContextMenu.Trigger>
      <ContextMenu.Portal>
        <ContextMenu.Content className="z-[100010] min-w-[220px] rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xl p-2">
          <ContextMenu.Label className="px-2 py-1 text-[10px] font-semibold uppercase tracking-wide text-slate-400">
            Alinhamento
          </ContextMenu.Label>
          <ContextMenu.Item
            onSelect={() => handleAlign('left')}
            className="flex items-center gap-2 rounded-md px-2 py-1.5 text-xs text-slate-600 dark:text-slate-300 focus:bg-slate-100 dark:focus:bg-slate-800 outline-none"
          >
            <AlignLeft size={14} />
            Esquerda
          </ContextMenu.Item>
          <ContextMenu.Item
            onSelect={() => handleAlign('center')}
            className="flex items-center gap-2 rounded-md px-2 py-1.5 text-xs text-slate-600 dark:text-slate-300 focus:bg-slate-100 dark:focus:bg-slate-800 outline-none"
          >
            <AlignCenter size={14} />
            Centro
          </ContextMenu.Item>
          <ContextMenu.Item
            onSelect={() => handleAlign('right')}
            className="flex items-center gap-2 rounded-md px-2 py-1.5 text-xs text-slate-600 dark:text-slate-300 focus:bg-slate-100 dark:focus:bg-slate-800 outline-none"
          >
            <AlignRight size={14} />
            Direita
          </ContextMenu.Item>
          <ContextMenu.Separator className="my-1 h-px bg-slate-200 dark:bg-slate-800" />
          <ContextMenu.Label className="px-2 py-1 text-[10px] font-semibold uppercase tracking-wide text-slate-400">
            Largura
          </ContextMenu.Label>
          {['50%', '75%', '100%'].map(option => (
            <ContextMenu.Item
              key={option}
              onSelect={() => handleResize(option)}
              className={`flex items-center gap-2 rounded-md px-2 py-1.5 text-xs outline-none ${
                width === option
                  ? 'text-blue-600 dark:text-blue-400'
                  : 'text-slate-600 dark:text-slate-300'
              } focus:bg-slate-100 dark:focus:bg-slate-800`}
            >
              {option}
            </ContextMenu.Item>
          ))}
          <ContextMenu.Separator className="my-1 h-px bg-slate-200 dark:bg-slate-800" />
          <ContextMenu.Item
            onSelect={handleEdit}
            className="flex items-center gap-2 rounded-md px-2 py-1.5 text-xs text-slate-600 dark:text-slate-300 focus:bg-slate-100 dark:focus:bg-slate-800 outline-none"
          >
            <Edit2 size={14} />
            Editar link
          </ContextMenu.Item>
          <ContextMenu.Item
            onSelect={deleteNode}
            className="flex items-center gap-2 rounded-md px-2 py-1.5 text-xs text-rose-600 dark:text-rose-400 focus:bg-rose-50 dark:focus:bg-rose-900/20 outline-none"
          >
            <Trash2 size={14} />
            Remover
          </ContextMenu.Item>
        </ContextMenu.Content>
      </ContextMenu.Portal>
    </ContextMenu.Root>
  );
};

function getYouTubeID(url: string) {
  const regExp = /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#&?]*).*/;
  const match = url.match(regExp);
  return (match && match[7].length === 11) ? match[7] : false;
}
