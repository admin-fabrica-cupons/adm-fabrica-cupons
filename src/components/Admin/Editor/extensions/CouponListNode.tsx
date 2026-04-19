import { Node, mergeAttributes } from '@tiptap/core';
import { ReactNodeViewRenderer } from '@tiptap/react';
import { CouponListNodeView } from '@/components/Admin/Editor/components/CouponListNodeView';

export const CouponListNode = Node.create({
  name: 'coupon_list',
  group: 'block',
  atom: true,
  draggable: true,

  addAttributes() {
    return {
      id: { default: null },
      items: { default: [] },
      listType: { default: 'list' },
      columns: { default: 3 },
      showDescriptions: { default: true },
      showStoreInfo: { default: true },
      storeName: { default: '' },
      customStoreName: { default: '' },
      affiliateButtonText: { default: '' },
      content: { default: '' },
      title: { default: '' },
      widgetType: { default: 'CouponListWidget' }
    };
  },

  parseHTML() {
    return [
      {
        tag: 'coupon-list-component',
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    return ['coupon-list-component', mergeAttributes(HTMLAttributes)];
  },

  addNodeView() {
    return ReactNodeViewRenderer(CouponListNodeView);
  },
});
