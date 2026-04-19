import { Node, mergeAttributes } from '@tiptap/core';
import { ReactNodeViewRenderer } from '@tiptap/react';
import { HotProductNodeView } from '@/components/Admin/Editor/components/HotProductNodeView';

export const HotProductNode = Node.create({
  name: 'hot_product',
  group: 'block',
  atom: true,
  draggable: true,

  addAttributes() {
    return {
      id: { default: null },
      productName: { default: '' },
      price: { default: '' },
      originalPrice: { default: '' },
      rating: { default: 0 },
      productLink: { default: '' },
      affiliateLink: { default: '' },
      affiliateButtonText: { default: '' },
      pros: { default: [] },
      cons: { default: [] },
      soldCount: { default: '' },
      ranking: { default: '' },
      category: { default: '' },
      description: { default: '' },
      badge: { default: '' },
      src: { default: '' },
      images: { default: [] },
      allImages: { default: [] },
      affiliateLogo: { default: '' },
      showStoreLogo: { default: true },
      storeName: { default: '' },
      manualStoreName: { default: '' },
      productLayout: { default: 'default' },
      couponCode: { default: '' },
      name: { default: '' },
      isExpired: { default: false },
      hideCode: { default: false },
      discount: { default: '' },
      widgetType: { default: 'HotProductWidget' }
    };
  },

  parseHTML() {
    return [
      {
        tag: 'hot-product-component',
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    return ['hot-product-component', mergeAttributes(HTMLAttributes)];
  },

  addNodeView() {
    return ReactNodeViewRenderer(HotProductNodeView);
  },
});
