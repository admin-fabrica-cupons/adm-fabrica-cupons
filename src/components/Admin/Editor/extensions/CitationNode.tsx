import { Node, mergeAttributes } from '@tiptap/core';
import { ReactNodeViewRenderer } from '@tiptap/react';
import { CitationNodeView } from '@/components/Admin/Editor/components/CitationNodeView';

export const CitationNode = Node.create({
  name: 'citation',
  group: 'block',
  atom: true,
  draggable: true,

  addAttributes() {
    return {
      id: { default: null },
      text: { default: '' },
      source: { default: '' },
      widgetType: { default: 'CitationWidget' },
    };
  },

  parseHTML() {
    return [
      {
        tag: 'citation-block',
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    return ['citation-block', mergeAttributes(HTMLAttributes)];
  },

  addNodeView() {
    return ReactNodeViewRenderer(CitationNodeView);
  },
});
