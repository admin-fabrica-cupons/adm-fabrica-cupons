import React from 'react';
import { NodeViewProps } from '@tiptap/react';
import TableWidget from '../../../Widgets/TableWidget';
import TableWidgetEditor from '../../WidgetEditors/TableWidgetEditor';
import { WidgetNodeViewWrapper } from './WidgetNodeViewWrapper';

export const TableNodeView: React.FC<NodeViewProps> = (props) => {
  return (
    <WidgetNodeViewWrapper
      {...props}
      component={TableWidget}
      editorComponent={TableWidgetEditor}
      title="Editar Tabela"
      description="Gerencie linhas, colunas e estilo da tabela."
      width="max-w-6xl"
    />
  );
};
