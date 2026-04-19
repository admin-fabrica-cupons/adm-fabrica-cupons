import React from 'react';
import { NodeViewProps } from '@tiptap/react';
import ProsAndCons from '../../../Widgets/ProsAndCons';
import ProsAndConsEditor from '../../WidgetEditors/ProsAndConsEditor';
import { WidgetNodeViewWrapper } from './WidgetNodeViewWrapper';

export const ProsConsNodeView: React.FC<NodeViewProps> = (props) => {
  return (
    <WidgetNodeViewWrapper
      {...props}
      component={ProsAndCons}
      editorComponent={ProsAndConsEditor}
      title="Editar Prós e Contras"
      description="Adicione pontos positivos e negativos."
      width="max-w-5xl"
    />
  );
};
