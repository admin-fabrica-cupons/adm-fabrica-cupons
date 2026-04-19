import { Node, mergeAttributes } from '@tiptap/core';
import { ReactNodeViewRenderer } from '@tiptap/react';
import { NoteOfEditorNodeView } from '@/components/Admin/Editor/components/NoteOfEditorNodeView';

export const NoteOfEditorNode = Node.create({
  name: 'note_of_editor',
  group: 'block',
  atom: true,
  draggable: true,

  addAttributes() {
    return {
      id: { default: null },
      variant: { default: 'info' },
      title: { default: '' },
      content: { default: '' },
      widgetType: { default: 'NoteOfEditorWidget' },
    };
  },

  parseHTML() {
    return [
      {
        tag: 'note-of-editor',
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    return ['note-of-editor', mergeAttributes(HTMLAttributes)];
  },

  addNodeView() {
    return ReactNodeViewRenderer(NoteOfEditorNodeView);
  },
});
