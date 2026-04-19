import React from 'react';
import { NodeViewProps } from '@tiptap/react';
import HotProductWidget from '../../../Widgets/HotProductWidget';
import HotProductWidgetEditor from '../../WidgetEditors/HotProductWidgetEditor';
import { WidgetNodeViewWrapper } from './WidgetNodeViewWrapper';

export const HotProductNodeView: React.FC<NodeViewProps> = (props) => {
  return (
    <WidgetNodeViewWrapper
      {...props}
      component={HotProductWidget}
      editorComponent={HotProductWidgetEditor}
      title="Editar Produto Destaque"
      description="Ajuste dados do produto e destaque visual."
      width="max-w-6xl"
    />
  );
};
