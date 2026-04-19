import React from 'react';
import InputWithClear from '../Util/InputWithClear';

interface CitationBlock {
  id?: string;
  text?: string;
  source?: string;
}

interface CitationWidgetEditorProps {
  block: CitationBlock;
  onUpdate: (field: string, value: any) => void;
}

const CitationWidgetEditor: React.FC<CitationWidgetEditorProps> = ({ block, onUpdate }) => {
  return (
    <div className="space-y-6">
      <InputWithClear
        label="Texto da citação"
        value={block.text || ''}
        onChange={(e) => onUpdate('text', e.target.value)}
        onClear={() => onUpdate('text', '')}
        placeholder="Digite a citação"
        className="text-sm min-h-[120px]"
        as="textarea"
      />
      <InputWithClear
        label="Fonte (opcional)"
        value={block.source || ''}
        onChange={(e) => onUpdate('source', e.target.value)}
        onClear={() => onUpdate('source', '')}
        placeholder="Ex: Autor, site, referência"
        className="text-sm"
      />
    </div>
  );
};

export default CitationWidgetEditor;
