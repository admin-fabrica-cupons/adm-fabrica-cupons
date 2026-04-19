import { Node, mergeAttributes } from '@tiptap/core';
import { ReactNodeViewRenderer } from '@tiptap/react';
import { ProsConsNodeView } from '@/components/Admin/Editor/components/ProsConsNodeView';

export const ProsConsNode = Node.create({
  name: 'pros_and_cons',
  group: 'block',
  atom: true,
  draggable: true,

  addAttributes() {
    return {
      id: { default: null },
      pros: { default: [] },
      cons: { default: [] },
      widgetType: { default: 'ProsAndConsWidget' }
    };
  },

  parseHTML() {
    return [
      {
        tag: 'pros-cons-component',
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    return ['pros-cons-component', mergeAttributes(HTMLAttributes)];
  },

  addNodeView() {
    return ReactNodeViewRenderer(ProsConsNodeView);
  },
});
