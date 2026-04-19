import { Node, mergeAttributes } from '@tiptap/core';
import { ReactNodeViewRenderer } from '@tiptap/react';
import { ImageSlidesNodeView } from '@/components/Admin/Editor/components/ImageSlidesNodeView';

export const ImageSlidesNode = Node.create({
  name: 'image_slides',
  group: 'block',
  atom: true,
  draggable: true,

  addAttributes() {
    return {
      id: { default: null },
      images: { default: [] },
      allImages: { default: [] },
      slideInterval: { default: 3000 },
      showNavigation: { default: true },
      showIndicators: { default: true },
      content: { default: '' },
      widgetType: { default: 'ImageSlidesWidget' }
    };
  },

  parseHTML() {
    return [
      {
        tag: 'image-slides-component',
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    return ['image-slides-component', mergeAttributes(HTMLAttributes)];
  },

  addNodeView() {
    return ReactNodeViewRenderer(ImageSlidesNodeView);
  },
});
