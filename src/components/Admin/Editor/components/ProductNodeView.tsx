import React from 'react';
import { NodeViewProps } from '@tiptap/react';
import ProductWidget from '../../../Widgets/ProductWidget';
import ProductWidgetEditor from '../../WidgetEditors/ProductWidgetEditor';
import { WidgetNodeViewWrapper } from './WidgetNodeViewWrapper';

export const ProductNodeView: React.FC<NodeViewProps> = (props) => {
  return (
    <WidgetNodeViewWrapper
      {...props}
      component={ProductWidget}
      editorComponent={ProductWidgetEditor}
      title="Editar Produto"
      description="Ajuste os dados do produto e detalhes de exibição."
    />
  );
};
