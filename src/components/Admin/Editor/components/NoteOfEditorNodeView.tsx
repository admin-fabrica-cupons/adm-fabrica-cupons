import React from 'react';
import { NodeViewProps } from '@tiptap/react';
import NoteOfEditor from '../../../Widgets/NoteOfEditor';
import NoteOfEditorEditor from '../../WidgetEditors/NoteOfEditorEditor';
import { WidgetNodeViewWrapper } from './WidgetNodeViewWrapper';

export const NoteOfEditorNodeView: React.FC<NodeViewProps> = (props) => {
  return (
    <WidgetNodeViewWrapper
      {...props}
      component={NoteOfEditor}
      editorComponent={NoteOfEditorEditor}
      title="Editar Nota do Editor"
      description="Configure o estilo e a mensagem do callout."
      width="max-w-3xl"
    />
  );
};
