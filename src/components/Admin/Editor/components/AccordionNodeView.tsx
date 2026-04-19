import React from 'react';
import { NodeViewProps } from '@tiptap/react';
import AccordionWidget from '../../../Widgets/AccordionWidget';
import AccordionEditor from '../../WidgetEditors/AccordionEditor';
import { WidgetNodeViewWrapper } from './WidgetNodeViewWrapper';

export const AccordionNodeView: React.FC<NodeViewProps> = (props) => {
  return (
    <WidgetNodeViewWrapper
      {...props}
      component={AccordionWidget}
      editorComponent={AccordionEditor}
      title="Editar Accordion"
      description="Gerencie os itens e o estilo do seu accordion."
    />
  );
};
