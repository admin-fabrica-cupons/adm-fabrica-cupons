import { Node, mergeAttributes } from '@tiptap/core';
import { ReactNodeViewRenderer } from '@tiptap/react';
import { TableNodeView } from '@/components/Admin/Editor/components/TableNodeView';

export const TableNode = Node.create({
  name: 'table',
  group: 'block',
  atom: true,
  draggable: true,

  addAttributes() {
    return {
      id: { default: null },
      rows: { default: [] },
      headers: { default: [] },
      caption: { default: '' },
      showBorders: { default: true },
      striped: { default: true },
      widgetType: { default: 'TableWidget' }
    };
  },

  parseHTML() {
    return [
      {
        tag: 'table-component',
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    return ['table-component', mergeAttributes(HTMLAttributes)];
  },

  addNodeView() {
    return ReactNodeViewRenderer(TableNodeView);
  },
});
