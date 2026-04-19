import { Node, mergeAttributes } from '@tiptap/core';
import { ReactNodeViewRenderer } from '@tiptap/react';
import { ProductNodeView } from '../components/ProductNodeView';

export const ProductNode = Node.create({
  name: 'product',

  group: 'block',

  atom: true,

  draggable: true,

  addAttributes() {
    return {
      id: {
        default: null,
      },
      productName: {
        default: '',
      },
      price: {
        default: '',
      },
      originalPrice: {
        default: '',
      },
      rating: {
        default: 0,
      },
      productLink: {
        default: '',
      },
      affiliateLink: {
        default: '',
      },
      affiliateButtonText: {
        default: '',
      },
      pros: {
        default: [],
      },
      cons: {
        default: [],
      },
      productLayout: {
        default: 'default',
      },
      soldCount: {
        default: '',
      },
      ranking: {
        default: '',
      },
      category: {
        default: '',
      },
      description: {
        default: '',
      },
      affiliateLogo: {
        default: '',
      },
      showStoreLogo: {
        default: false,
      },
      src: {
        default: '',
      },
      images: {
        default: [],
      },
      storeName: {
        default: '',
      },
      badge: {
        default: '',
      },
      manualStoreName: {
        default: '',
      },
      couponCode: {
        default: '',
      },
      name: {
        default: '',
      },
      isExpired: {
        default: false,
      },
      hideCode: {
        default: false,
      },
      discount: {
        default: '',
      },
    };
  },

  parseHTML() {
    return [
      {
        tag: 'product-widget',
      },
      {
        tag: 'div[data-type="product-widget"]',
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    return ['div', mergeAttributes(HTMLAttributes, { 'data-type': 'product-widget' })];
  },

  addNodeView() {
    return ReactNodeViewRenderer(ProductNodeView);
  },
});
