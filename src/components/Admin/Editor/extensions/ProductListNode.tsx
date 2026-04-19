import { Node, mergeAttributes } from '@tiptap/core';
import { ReactNodeViewRenderer } from '@tiptap/react';
import { ProductListNodeView } from '@/components/Admin/Editor/components/ProductListNodeView';

export const ProductListNode = Node.create({
  name: 'product_list',
  group: 'block',
  atom: true,
  draggable: true,

  addAttributes() {
    return {
      id: { default: null },
      items: { default: [] },
      listType: { default: 'list' },
      columns: { default: 3 },
      rankSize: { default: 3 },
      showImages: { default: true },
      showPrices: { default: true },
      showCoupons: { default: true },
      content: { default: '' },
      title: { default: '' },
      description: { default: '' },
      name: { default: '' },
      widgetType: { default: 'ProductListWidget' }
    };
  },

  parseHTML() {
    return [
      {
        tag: 'product-list-component',
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    return ['product-list-component', mergeAttributes(HTMLAttributes)];
  },

  addNodeView() {
    return ReactNodeViewRenderer(ProductListNodeView);
  },
});
