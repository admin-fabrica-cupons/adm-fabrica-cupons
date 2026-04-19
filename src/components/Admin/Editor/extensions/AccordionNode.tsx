import { Node, mergeAttributes } from '@tiptap/core';
import { ReactNodeViewRenderer } from '@tiptap/react';
import { AccordionNodeView } from '../components/AccordionNodeView';

export const AccordionNode = Node.create({
  name: 'accordion',

  group: 'block',

  atom: true,

  draggable: true,

  addAttributes() {
    return {
      id: {
        default: null,
      },
      accordionItems: {
        default: [],
      },
      accordionColor: {
        default: 'blue',
      },
    };
  },

  parseHTML() {
    return [
      {
        tag: 'accordion-widget',
      },
      {
        tag: 'div[data-type="accordion-widget"]',
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    return ['div', mergeAttributes(HTMLAttributes, { 'data-type': 'accordion-widget' })];
  },

  addNodeView() {
    return ReactNodeViewRenderer(AccordionNodeView);
  },
});
