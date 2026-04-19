import React from 'react';
import { NodeViewProps } from '@tiptap/react';
import ProductListWidget from '../../../Widgets/ProductListWidget';
import ProductListWidgetEditor from '../../WidgetEditors/ProductListWidgetEditor';
import { WidgetNodeViewWrapper } from './WidgetNodeViewWrapper';

export const ProductListNodeView: React.FC<NodeViewProps> = (props) => {
  return (
    <WidgetNodeViewWrapper
      {...props}
      component={ProductListWidget}
      editorComponent={ProductListWidgetEditor}
      title="Editar Lista de Produtos"
      description="Configure itens, layout e exibição da lista."
      width="max-w-6xl"
    />
  );
};
