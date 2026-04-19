import React from 'react';
import { NodeViewProps } from '@tiptap/react';
import CitationWidget from '../../../Widgets/CitationWidget';
import CitationWidgetEditor from '../../WidgetEditors/CitationWidgetEditor';
import { WidgetNodeViewWrapper } from './WidgetNodeViewWrapper';

export const CitationNodeView: React.FC<NodeViewProps> = (props) => {
  return (
    <WidgetNodeViewWrapper
      {...props}
      component={CitationWidget}
      editorComponent={CitationWidgetEditor}
      title="Editar Citação"
      description="Defina o texto e a fonte da citação."
      width="max-w-3xl"
    />
  );
};
