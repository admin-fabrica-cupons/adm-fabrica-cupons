'use client';

import React from 'react';
import TipTapRenderer from '@/components/Post/TipTapRenderer';
import TextView from '@/components/Admin/Util/TextView';

interface PostViewerProps {
  content?: string | object | null;
  postCategory?: string;
}

export const PostViewer: React.FC<PostViewerProps> = ({ content, postCategory }) => {
  if (!content) return null;

  if (typeof content === 'string') {
    return (
      <div className="prose dark:prose-invert max-w-none w-full post-viewer">
        <TextView content={content} />
      </div>
    );
  }

  return (
    <div className="prose dark:prose-invert max-w-none w-full post-viewer">
      <TipTapRenderer content={content} postCategory={postCategory} />
    </div>
  );
};
