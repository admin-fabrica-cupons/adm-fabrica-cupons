import React from 'react';
import InputWithClear from '../Util/InputWithClear';

type NoteVariant = 'info' | 'tip' | 'warning';

interface NoteOfEditorBlock {
  id?: string;
  variant?: NoteVariant;
  title?: string;
  content?: string;
}

interface NoteOfEditorEditorProps {
  block: NoteOfEditorBlock;
  onUpdate: (field: string, value: any) => void;
}

const NoteOfEditorEditor: React.FC<NoteOfEditorEditorProps> = ({ block, onUpdate }) => {
  const variants: { value: NoteVariant; label: string; styles: string }[] = [
    { value: 'info', label: 'Info', styles: 'border-blue-200 text-blue-700 bg-blue-50 dark:border-blue-800/50 dark:text-blue-300 dark:bg-blue-900/20' },
    { value: 'tip', label: 'Dica', styles: 'border-orange-200 text-orange-700 bg-orange-50 dark:border-orange-800/50 dark:text-orange-300 dark:bg-orange-900/20' },
    { value: 'warning', label: 'Aviso', styles: 'border-red-200 text-red-700 bg-red-50 dark:border-red-800/50 dark:text-red-300 dark:bg-red-900/20' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <div className="text-xs font-semibold text-slate-500 dark:text-slate-400 mb-2">Variante</div>
        <div className="flex flex-wrap gap-2">
          {variants.map(variant => (
            <button
              key={variant.value}
              type="button"
              onClick={() => onUpdate('variant', variant.value)}
              className={`px-3 py-2 rounded-lg text-xs font-bold border transition-all ${variant.styles} ${block.variant === variant.value ? 'ring-2 ring-offset-2 ring-blue-500 dark:ring-offset-slate-900' : ''}`}
            >
              {variant.label}
            </button>
          ))}
        </div>
      </div>

      <InputWithClear
        label="Título"
        value={block.title || ''}
        onChange={(e) => onUpdate('title', e.target.value)}
        onClear={() => onUpdate('title', '')}
        placeholder="Ex: Dica rápida"
        className="text-sm"
      />

      <InputWithClear
        label="Conteúdo"
        value={block.content || ''}
        onChange={(e) => onUpdate('content', e.target.value)}
        onClear={() => onUpdate('content', '')}
        placeholder="Digite a mensagem do callout"
        className="text-sm min-h-[120px]"
        as="textarea"
      />
    </div>
  );
};

export default NoteOfEditorEditor;
