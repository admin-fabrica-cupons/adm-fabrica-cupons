import React, { useState, useEffect, useId } from 'react';
import { NodeViewWrapper, NodeViewProps } from '@tiptap/react';
import * as Dialog from '@radix-ui/react-dialog';
import * as ContextMenu from '@radix-ui/react-context-menu';
import { PencilLine, Trash2, X, Check } from 'lucide-react';
import { MdOutlineDragIndicator } from 'react-icons/md';

interface WidgetNodeViewWrapperProps extends NodeViewProps {
  component: React.ComponentType<any>;
  editorComponent: React.ComponentType<any>;
  title: string;
  description?: string;
  width?: string;
}

export const WidgetNodeViewWrapper: React.FC<WidgetNodeViewWrapperProps> = (props) => {
  const [isEditing, setIsEditing] = useState(false);
  const [tempAttrs, setTempAttrs] = useState(props.node.attrs);
  const descriptionId = useId();
  const Component = props.component;
  const EditorComponent = props.editorComponent;

  // Reset tempAttrs when modal opens or node attrs change
  useEffect(() => {
    if (isEditing) {
      setTempAttrs(props.node.attrs);
    }
  }, [isEditing, props.node.attrs]);

  const handleLocalUpdate = (field: string, value: any) => {
    setTempAttrs((prev: any) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleApply = () => {
    props.updateAttributes(tempAttrs);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setTempAttrs(props.node.attrs);
    setIsEditing(false);
  };

  const handleDelete = () => {
    props.deleteNode();
  };

  return (
    <NodeViewWrapper className="relative group my-3 not-prose" data-drag-handle>
      <ContextMenu.Root>
        <ContextMenu.Trigger asChild>
          <div
            className={`${props.selected ? 'ring-2 ring-blue-500/70 dark:ring-blue-400/70 rounded-xl' : ''} transition-all cursor-context-menu relative`}
            onDoubleClick={(event) => {
              event.stopPropagation();
              setIsEditing(true);
            }}
          >
            <div 
              className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 opacity-70 group-hover:opacity-100 transition-all duration-150 cursor-grab active:cursor-grabbing z-10 p-1.5 rounded-lg bg-white/80 dark:bg-slate-900/70 shadow-sm"
              data-drag-handle
            >
              <MdOutlineDragIndicator size={24} className="text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300" />
            </div>
            <Component data={props.node.attrs} isPreview={true} />
          </div>
        </ContextMenu.Trigger>
        <ContextMenu.Portal>
          <ContextMenu.Content className="z-[100010] min-w-[220px] rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xl p-2 animate-in fade-in zoom-in-95 duration-200">
            <ContextMenu.Item
              onSelect={() => setIsEditing(true)}
              className="flex items-center gap-2 rounded-md px-2 py-1.5 text-xs text-slate-600 dark:text-slate-300 focus:bg-slate-100 dark:focus:bg-slate-800 outline-none cursor-pointer"
            >
              <PencilLine size={14} />
              Editar
            </ContextMenu.Item>
            <ContextMenu.Separator className="my-1 h-px bg-slate-100 dark:bg-slate-800" />
            <ContextMenu.Item
              onSelect={handleDelete}
              className="flex items-center gap-2 rounded-md px-2 py-1.5 text-xs text-rose-600 dark:text-rose-400 focus:bg-rose-50 dark:focus:bg-rose-900/20 outline-none cursor-pointer"
            >
              <Trash2 size={14} />
              Remover
            </ContextMenu.Item>
          </ContextMenu.Content>
        </ContextMenu.Portal>
      </ContextMenu.Root>

      <Dialog.Root open={isEditing} onOpenChange={(open) => {
        if (!open) handleCancel();
        else setIsEditing(true);
      }}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 bg-black/60 z-[100010] animate-in fade-in duration-75" />
          <Dialog.Content 
            className={`fixed left-1/2 top-1/2 z-[100011] w-[95vw] ${props.width || 'max-w-4xl'} max-h-[90vh] -translate-x-1/2 -translate-y-1/2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl flex flex-col animate-in zoom-in-95 duration-75`}
            aria-describedby={descriptionId}
          >
            <div className="flex items-center justify-between p-6 border-b border-slate-100 dark:border-slate-800">
              <div>
                <Dialog.Title className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                  {props.title}
                </Dialog.Title>
                <Dialog.Description id={descriptionId} className={`text-sm text-slate-500 dark:text-slate-400 mt-1 ${!props.description ? 'sr-only' : ''}`}>
                  {props.description || props.title}
                </Dialog.Description>
              </div>
              <button
                onClick={handleCancel}
                className="p-2 text-slate-400 hover:text-slate-500 dark:hover:text-slate-300 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6">
              <EditorComponent block={tempAttrs} onUpdate={handleLocalUpdate} />
            </div>

            <div className="p-6 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 flex justify-end gap-3 rounded-b-xl">
              <button
                onClick={handleCancel}
                className="px-5 py-2.5 text-sm font-semibold text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors shadow-sm"
              >
                Cancelar
              </button>
              <button
                onClick={handleApply}
                className="px-5 py-2.5 text-sm font-semibold text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-600 hover:to-blue-700 rounded-xl shadow-md shadow-blue-500/30 transition-all flex items-center gap-2"
              >
                <Check size={16} />
                Aplicar Alterações
              </button>
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </NodeViewWrapper>
  );
};
