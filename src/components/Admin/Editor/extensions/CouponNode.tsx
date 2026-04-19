import { Node, mergeAttributes } from '@tiptap/core';
import { ReactNodeViewRenderer } from '@tiptap/react';
import { CouponNodeView } from '../components/CouponNodeView';

export const CouponNode = Node.create({
  name: 'coupon',

  group: 'block',

  atom: true,

  draggable: true,

  addAttributes() {
    return {
      id: {
        default: null,
      },
      name: {
        default: '',
      },
      discount: {
        default: '',
      },
      couponCode: {
        default: '',
      },
      storeName: {
        default: '',
      },
      affiliateLink: {
        default: '',
      },
      expiryDate: {
        default: '',
      },
      isExpired: {
        default: false,
      },
      hideCode: {
        default: false,
      },
      affiliateButtonText: {
        default: '',
      },
      affiliateLogo: {
        default: '',
      },
      showStoreLogo: {
        default: true,
      },
      description: {
        default: '',
      },
      items: {
        default: [],
      },
      customStoreName: {
        default: '',
      },
    };
  },

  parseHTML() {
    return [
      {
        tag: 'coupon-widget',
      },
      {
        tag: 'div[data-type="coupon-widget"]',
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    return ['div', mergeAttributes(HTMLAttributes, { 'data-type': 'coupon-widget' })];
  },

  addNodeView() {
    return ReactNodeViewRenderer(CouponNodeView);
  },
});
