import { Node, mergeAttributes } from '@tiptap/core';
import { ReactNodeViewRenderer } from '@tiptap/react';
import { RelatedPostsNodeView } from '../components/RelatedPostsNodeView';

export const RelatedPostsNode = Node.create({
    name: 'related_posts',

    group: 'block',

    atom: true,

    draggable: true,

    addAttributes() {
        return {
            id: {
                default: null,
            },
            posts: {
                default: [],
                parseHTML: (element) => {
                    const raw = element.getAttribute('data-posts');
                    if (!raw) return [];
                    try { return JSON.parse(raw); } catch { return []; }
                },
                renderHTML: (attributes) => {
                    return { 'data-posts': JSON.stringify(attributes.posts || []) };
                },
            },
        };
    },

    parseHTML() {
        return [
            { tag: 'related-posts-widget' },
            { tag: 'div[data-type="related-posts-widget"]' },
        ];
    },

    renderHTML({ HTMLAttributes }) {
        return ['div', mergeAttributes(HTMLAttributes, { 'data-type': 'related-posts-widget' })];
    },

    addNodeView() {
        return ReactNodeViewRenderer(RelatedPostsNodeView);
    },
});
