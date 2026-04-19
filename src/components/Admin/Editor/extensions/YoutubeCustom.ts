import Youtube from '@tiptap/extension-youtube';
import { ReactNodeViewRenderer } from '@tiptap/react';
import { YoutubeNodeView } from '../components/YoutubeNodeView';

export const YoutubeCustom = Youtube.extend({
  addAttributes() {
    return {
      ...this.parent?.(),
      width: {
        default: '100%',
        renderHTML: attributes => ({
          width: attributes.width,
        }),
      },
      height: {
        default: 480,
        renderHTML: attributes => ({
          height: attributes.height,
        }),
      },
      align: {
        default: 'center',
        renderHTML: attributes => ({
          'data-align': attributes.align,
          style: `text-align: ${attributes.align}; justify-content: ${attributes.align === 'left' ? 'flex-start' : attributes.align === 'right' ? 'flex-end' : 'center'}; display: flex;`,
        }),
        parseHTML: element => element.getAttribute('data-align'),
      },
    };
  },
  
  addNodeView() {
    return ReactNodeViewRenderer(YoutubeNodeView);
  },
});
