import React, { useRef, useState, useEffect, useId } from 'react';
import { NodeViewWrapper, NodeViewProps } from '@tiptap/react';
import { PencilLine, Link2, Link2Off, Trash2, AlignLeft, AlignCenter, AlignRight, Maximize2 } from 'lucide-react';
import * as Dialog from '@radix-ui/react-dialog';
import * as ContextMenu from '@radix-ui/react-context-menu';
import { Check, X } from 'lucide-react';
import Image from 'next/image';

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

const getWidthFromSize = (size?: string) => {
  switch (size) {
    case 'small': return 45;
    case 'medium': return 60;
    case 'large': return 80;
    case 'full': return 100;
    default: return 100;
  }
};

const getAspectRatioValue = (ratio?: string) => {
  switch (ratio) {
    case '1:1': return '1 / 1';
    case '4:3': return '4 / 3';
    case '16:9': return '16 / 9';
    default: return '';
  }
};

export const ImageNodeView: React.FC<NodeViewProps> = (props) => {
  const { node, selected, updateAttributes, deleteNode } = props;
  const attrs = node.attrs as Record<string, any>;
  
  const widthValue = typeof attrs.imageWidth === 'number' ? attrs.imageWidth : getWidthFromSize(attrs.imageSize);
  const ratioValue = attrs.imageRatio || 'auto';
  const alignValue = attrs.imageAlign || 'center';
  const aspectRatio = getAspectRatioValue(ratioValue);
  const alignClass = alignValue === 'center' ? 'mx-auto' : alignValue === 'right' ? 'ml-auto' : 'mr-auto';
  
  const containerRef = useRef<HTMLDivElement | null>(null);
  const dragState = useRef<{ startX: number; startWidth: number } | null>(null);
  const linkDescriptionId = useId();
  const detailsDescriptionId = useId();

  // Modal states
  const [isLinkModalOpen, setIsLinkModalOpen] = useState(false);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  
  // Temp states for modals
  const [tempLink, setTempLink] = useState('');
  const [tempAlt, setTempAlt] = useState('');
  const [tempCaption, setTempCaption] = useState('');

  useEffect(() => {
    if (isLinkModalOpen) {
      setTempLink(attrs.imageLink || '');
    }
  }, [isLinkModalOpen, attrs.imageLink]);

  useEffect(() => {
    if (isDetailsModalOpen) {
      setTempAlt(attrs.alt || '');
      setTempCaption(attrs.imageCaption || '');
    }
  }, [isDetailsModalOpen, attrs.alt, attrs.imageCaption]);

  const startResize = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    event.stopPropagation();
    const startX = event.clientX;
    const startWidth = widthValue;
    dragState.current = { startX, startWidth };

    const handleMove = (moveEvent: MouseEvent) => {
      if (!dragState.current) return;
      const containerWidth = containerRef.current?.parentElement?.offsetWidth || 1;
      const delta = moveEvent.clientX - dragState.current.startX;
      // Adjust direction based on alignment? Assuming standard resize from right edge
      const deltaPercent = (delta / containerWidth) * 100;
      const nextWidth = clamp(dragState.current.startWidth + deltaPercent, 20, 100);
      updateAttributes({ imageWidth: Math.round(nextWidth) });
    };

    const handleUp = () => {
      dragState.current = null;
      window.removeEventListener('mousemove', handleMove);
      window.removeEventListener('mouseup', handleUp);
    };

    window.addEventListener('mousemove', handleMove);
    window.addEventListener('mouseup', handleUp);
  };

  const handleSaveLink = () => {
    updateAttributes({ imageLink: tempLink.trim() || null });
    setIsLinkModalOpen(false);
  };

  const handleSaveDetails = () => {
    updateAttributes({ 
      alt: tempAlt,
      imageCaption: tempCaption 
    });
    setIsDetailsModalOpen(false);
  };

  return (
    <ContextMenu.Root>
      <ContextMenu.Trigger asChild>
        <NodeViewWrapper className="my-8 not-prose group/image-wrapper">
          <div className="relative w-full" ref={containerRef}>
            <div className={`relative ${alignClass} group/image-container`} style={{ width: `${widthValue}%` }}>
          <div
            className={`relative overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 transition-all duration-300 ${selected ? 'ring-2 ring-blue-500 shadow-lg shadow-blue-500/10' : 'hover:shadow-md'}`}
            style={aspectRatio ? { aspectRatio } : undefined}
          >
            {attrs.src ? (
              <>
                {attrs.imageLink ? (
                  <a href={attrs.imageLink} target="_blank" rel="noopener noreferrer" className="block h-full w-full cursor-pointer relative">
                    {aspectRatio ? (
                      <Image
                        src={attrs.src}
                        alt={attrs.alt || ''}
                        fill
                        sizes="100vw"
                        className="object-cover"
                      />
                    ) : (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={attrs.src}
                        alt={attrs.alt || ''}
                        className="w-full h-auto object-cover block"
                      />
                    )}
                    <div className="absolute inset-0 flex items-center justify-center bg-black/0 hover:bg-black/10 transition-colors pointer-events-none">
                       <Link2 className="text-white opacity-0 group-hover/image-container:opacity-100 drop-shadow-md" size={24} />
                    </div>
                  </a>
                ) : (
                  aspectRatio ? (
                    <Image
                      src={attrs.src}
                      alt={attrs.alt || ''}
                      fill
                      sizes="100vw"
                      className="object-cover"
                    />
                  ) : (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={attrs.src}
                      alt={attrs.alt || ''}
                      className="w-full h-auto object-cover block"
                    />
                  )
                )}
              </>
            ) : (
              <div className="h-40 flex items-center justify-center text-xs text-slate-400 dark:text-slate-500 bg-slate-100 dark:bg-slate-800/50">
                Selecione uma imagem
              </div>
            )}

            {/* Resize Handle */}
            {selected && (
              <div className="absolute bottom-3 right-3 z-10">
                 <button
                  type="button"
                  onMouseDown={startResize}
                  className="h-8 w-8 rounded-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-blue-600 dark:text-blue-400 shadow-lg flex items-center justify-center cursor-se-resize hover:scale-110 transition-transform active:scale-95"
                  title="Redimensionar"
                >
                  <Maximize2 size={14} className="rotate-90" />
                </button>
                <div className="absolute bottom-full right-0 mb-2 px-2 py-1 bg-black/75 text-white text-[10px] font-bold rounded opacity-0 group-hover/image-wrapper:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                  {Math.round(widthValue)}%
                </div>
              </div>
            )}
          </div>
          
          {/* Caption */}
              {(attrs.imageCaption || attrs.alt) && (
                <div className="mt-3 text-center">
                  <span className="inline-block px-3 py-1 text-xs text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800/50 rounded-full border border-slate-200 dark:border-slate-800/50">
                    {attrs.imageCaption || attrs.alt}
                  </span>
                </div>
              )}
            </div>

            <Dialog.Root open={isLinkModalOpen} onOpenChange={setIsLinkModalOpen}>
              <Dialog.Portal>
                <Dialog.Overlay className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 animate-in fade-in duration-200" />
                <Dialog.Content
                  className="fixed left-1/2 top-1/2 z-50 w-full max-w-md -translate-x-1/2 -translate-y-1/2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl p-6 animate-in zoom-in-95 duration-200"
                  aria-describedby={linkDescriptionId}
                >
                  <Dialog.Title className="text-lg font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                    <Link2 size={20} className="text-blue-500" />
                    Editar Link da Imagem
                  </Dialog.Title>
                  <Dialog.Description id={linkDescriptionId} className="sr-only">
                    Ajuste o link da imagem
                  </Dialog.Description>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
                        URL de Destino
                      </label>
                      <input
                        type="url"
                        value={tempLink}
                        onChange={(e) => setTempLink(e.target.value)}
                        placeholder="https://exemplo.com"
                        className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:text-white text-sm"
                        autoFocus
                      />
                    </div>
                    <div className="flex justify-end gap-2 pt-2">
                      <button
                        onClick={() => setIsLinkModalOpen(false)}
                        className="px-4 py-2 text-sm font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                      >
                        Cancelar
                      </button>
                      <button
                        onClick={handleSaveLink}
                        className="px-4 py-2 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-md shadow-blue-500/20 transition-all flex items-center gap-2"
                      >
                        <Check size={16} />
                        Salvar
                      </button>
                    </div>
                  </div>
                </Dialog.Content>
              </Dialog.Portal>
            </Dialog.Root>

            <Dialog.Root open={isDetailsModalOpen} onOpenChange={setIsDetailsModalOpen}>
              <Dialog.Portal>
                <Dialog.Overlay className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 animate-in fade-in duration-200" />
                <Dialog.Content
                  className="fixed left-1/2 top-1/2 z-50 w-full max-w-md -translate-x-1/2 -translate-y-1/2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl p-6 animate-in zoom-in-95 duration-200"
                  aria-describedby={detailsDescriptionId}
                >
                  <Dialog.Title className="text-lg font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                    <PencilLine size={20} className="text-blue-500" />
                    Detalhes da Imagem
                  </Dialog.Title>
                  <Dialog.Description id={detailsDescriptionId} className="sr-only">
                    Ajuste o texto alternativo e a legenda
                  </Dialog.Description>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
                        Texto Alternativo (Alt)
                      </label>
                      <input
                        type="text"
                        value={tempAlt}
                        onChange={(e) => setTempAlt(e.target.value)}
                        placeholder="Descrição para acessibilidade..."
                        className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:text-white text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
                        Legenda
                      </label>
                      <input
                        type="text"
                        value={tempCaption}
                        onChange={(e) => setTempCaption(e.target.value)}
                        placeholder="Texto exibido abaixo da imagem..."
                        className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:text-white text-sm"
                      />
                    </div>
                    <div className="flex justify-end gap-2 pt-2">
                      <button
                        onClick={() => setIsDetailsModalOpen(false)}
                        className="px-4 py-2 text-sm font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                      >
                        Cancelar
                      </button>
                      <button
                        onClick={handleSaveDetails}
                        className="px-4 py-2 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-md shadow-blue-500/20 transition-all flex items-center gap-2"
                      >
                        <Check size={16} />
                        Salvar
                      </button>
                    </div>
                  </div>
                </Dialog.Content>
              </Dialog.Portal>
            </Dialog.Root>
          </div>
        </NodeViewWrapper>
      </ContextMenu.Trigger>
      <ContextMenu.Portal>
        <ContextMenu.Content className="z-[100010] min-w-[220px] rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xl p-2">
          <ContextMenu.Item
            onSelect={() => setIsDetailsModalOpen(true)}
            className="flex items-center gap-2 rounded-md px-2 py-1.5 text-xs text-slate-600 dark:text-slate-300 focus:bg-slate-100 dark:focus:bg-slate-800 outline-none"
          >
            <PencilLine size={14} />
            Editar detalhes
          </ContextMenu.Item>
          <ContextMenu.Item
            onSelect={() => setIsLinkModalOpen(true)}
            className="flex items-center gap-2 rounded-md px-2 py-1.5 text-xs text-slate-600 dark:text-slate-300 focus:bg-slate-100 dark:focus:bg-slate-800 outline-none"
          >
            <Link2 size={14} />
            {attrs.imageLink ? 'Editar link' : 'Adicionar link'}
          </ContextMenu.Item>
          {attrs.imageLink && (
            <ContextMenu.Item
              onSelect={() => updateAttributes({ imageLink: null })}
              className="flex items-center gap-2 rounded-md px-2 py-1.5 text-xs text-rose-600 dark:text-rose-400 focus:bg-rose-50 dark:focus:bg-rose-900/20 outline-none"
            >
              <Link2Off size={14} />
              Remover link
            </ContextMenu.Item>
          )}
          <ContextMenu.Separator className="my-1 h-px bg-slate-200 dark:bg-slate-800" />
          <ContextMenu.Label className="px-2 py-1 text-[10px] font-semibold uppercase tracking-wide text-slate-400">
            Alinhamento
          </ContextMenu.Label>
          <ContextMenu.Item
            onSelect={() => updateAttributes({ imageAlign: 'left' })}
            className="flex items-center gap-2 rounded-md px-2 py-1.5 text-xs text-slate-600 dark:text-slate-300 focus:bg-slate-100 dark:focus:bg-slate-800 outline-none"
          >
            <AlignLeft size={14} />
            Esquerda
          </ContextMenu.Item>
          <ContextMenu.Item
            onSelect={() => updateAttributes({ imageAlign: 'center' })}
            className="flex items-center gap-2 rounded-md px-2 py-1.5 text-xs text-slate-600 dark:text-slate-300 focus:bg-slate-100 dark:focus:bg-slate-800 outline-none"
          >
            <AlignCenter size={14} />
            Centro
          </ContextMenu.Item>
          <ContextMenu.Item
            onSelect={() => updateAttributes({ imageAlign: 'right' })}
            className="flex items-center gap-2 rounded-md px-2 py-1.5 text-xs text-slate-600 dark:text-slate-300 focus:bg-slate-100 dark:focus:bg-slate-800 outline-none"
          >
            <AlignRight size={14} />
            Direita
          </ContextMenu.Item>
          <ContextMenu.Separator className="my-1 h-px bg-slate-200 dark:bg-slate-800" />
          <ContextMenu.Label className="px-2 py-1 text-[10px] font-semibold uppercase tracking-wide text-slate-400">
            Proporção
          </ContextMenu.Label>
          {['auto', '1:1', '4:3', '16:9'].map(option => (
            <ContextMenu.Item
              key={option}
              onSelect={() => updateAttributes({ imageRatio: option })}
              className={`flex items-center gap-2 rounded-md px-2 py-1.5 text-xs outline-none ${
                ratioValue === option
                  ? 'text-blue-600 dark:text-blue-400'
                  : 'text-slate-600 dark:text-slate-300'
              } focus:bg-slate-100 dark:focus:bg-slate-800`}
            >
              {option === 'auto' ? 'Auto' : option}
            </ContextMenu.Item>
          ))}
          <ContextMenu.Separator className="my-1 h-px bg-slate-200 dark:bg-slate-800" />
          <ContextMenu.Item
            onSelect={deleteNode}
            className="flex items-center gap-2 rounded-md px-2 py-1.5 text-xs text-rose-600 dark:text-rose-400 focus:bg-rose-50 dark:focus:bg-rose-900/20 outline-none"
          >
            <Trash2 size={14} />
            Remover imagem
          </ContextMenu.Item>
        </ContextMenu.Content>
      </ContextMenu.Portal>
    </ContextMenu.Root>
  );
};
