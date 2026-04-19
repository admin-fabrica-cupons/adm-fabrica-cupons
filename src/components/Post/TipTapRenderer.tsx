'use client';

import React from 'react';
import WidgetRenderer from '@/components/Widgets/WidgetRenderer';
import { BlockType } from '@/types';
import NoteOfEditor from '@/components/Widgets/NoteOfEditor';
import CitationWidget from '@/components/Widgets/CitationWidget';

type TipTapMark = {
  type: string;
  attrs?: Record<string, any>;
};

type TipTapNode = {
  type?: string;
  attrs?: Record<string, any>;
  content?: TipTapNode[];
  text?: string;
  marks?: TipTapMark[];
};

interface TipTapRendererProps {
  content: TipTapNode | TipTapNode[];
  postCategory?: string;
}

const getTextContent = (node: TipTapNode | TipTapNode[] | null | undefined): string => {
  if (!node) return '';
  if (Array.isArray(node)) return node.map(item => getTextContent(item)).join('');
  if (node.type === 'text') return node.text || '';
  if (Array.isArray(node.content)) return node.content.map(item => getTextContent(item)).join('');
  return '';
};

const applyMarks = (value: React.ReactNode, marks: TipTapMark[] | undefined, key: string) => {
  if (!marks || marks.length === 0) return value;
  return marks.reduce((acc, mark, index) => {
    const markKey = `${key}-mark-${index}`;
    switch (mark.type) {
      case 'bold':
        return <strong key={markKey}>{acc}</strong>;
      case 'italic':
        return <em key={markKey}>{acc}</em>;
      case 'underline':
        return <u key={markKey}>{acc}</u>;
      case 'strike':
        return <s key={markKey}>{acc}</s>;
      case 'code':
        return <code key={markKey}>{acc}</code>;
      case 'link': {
        const href = mark.attrs?.href || '#';
        const target = mark.attrs?.target || '_blank';
        const rel = target === '_blank' ? 'noopener noreferrer' : undefined;
        return (
          <a key={markKey} href={href} target={target} rel={rel} className="modern-underline text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 transition-colors">
            {acc}
          </a>
        );
      }
      case 'textStyle': {
        const style: React.CSSProperties = {};
        if (mark.attrs?.color) style.color = mark.attrs.color;
        if (mark.attrs?.fontSize) style.fontSize = mark.attrs.fontSize;
        if (mark.attrs?.fontFamily) style.fontFamily = mark.attrs.fontFamily;
        return (
          <span key={markKey} style={style}>
            {acc}
          </span>
        );
      }
      case 'highlight': {
        const style: React.CSSProperties = {};
        const color = mark.attrs?.color;
        if (color) {
          style.backgroundColor = color;
          // Ajuste automático de cor de texto para contraste
          // Se a cor de fundo for escura, texto branco. Se clara, texto preto.
          // Simplificação: cores claras de highlight geralmente pedem texto escuro
          style.color = '#1f2937'; // slate-800
        }
        return (
          <mark key={markKey} style={style} className="rounded px-0.5">
            {acc}
          </mark>
        );
      }
      default:
        return acc;
    }
  }, value);
};

const getTextAlignStyle = (node: TipTapNode) => {
  const align = node.attrs?.textAlign;
  return align ? ({ textAlign: align } as React.CSSProperties) : undefined;
};

const renderWidgetBlock = (type: BlockType, attrs: Record<string, any> | undefined, postCategory?: string, key?: string) => {
  const block = { type, ...(attrs || {}) } as any;
  return <WidgetRenderer key={key} block={block} postCategory={postCategory} />;
};

const getYouTubeId = (url?: string) => {
  if (!url) return '';
  const regExp = /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#&?]*).*/;
  const match = url.match(regExp);
  return match && match[7] && match[7].length === 11 ? match[7] : '';
};

const renderNode = (node: TipTapNode, key: string, postCategory?: string): React.ReactNode => {
  if (!node) return null;
  if (node.type === 'text') {
    const textValue = node.text || '';
    return <React.Fragment key={key}>{applyMarks(textValue, node.marks, key)}</React.Fragment>;
  }

  const children = Array.isArray(node.content) ? node.content.map((child, index) => renderNode(child, `${key}-${index}`, postCategory)) : null;

  switch (node.type) {
    case 'doc':
      return <React.Fragment key={key}>{children}</React.Fragment>;
    case 'paragraph':
      return (
        <p key={key} style={getTextAlignStyle(node)}>
          {children}
        </p>
      );
    case 'heading': {
      const level = Math.min(6, Math.max(1, node.attrs?.level || 2));
      return React.createElement(`h${level}`, { key, style: getTextAlignStyle(node) }, children);
    }
    case 'bulletList':
    case 'bullet_list':
      return (
        <ul key={key} className="list-disc pl-6 my-4">
          {children}
        </ul>
      );
    case 'orderedList':
    case 'ordered_list':
      return (
        <ol key={key} className="list-decimal pl-6 my-4">
          {children}
        </ol>
      );
    case 'listItem':
    case 'list_item':
      return <li key={key}>{children}</li>;
    case 'blockquote':
      return (
        <blockquote key={key} className="border-l-4 border-slate-200 dark:border-slate-700 pl-4 italic my-4">
          {children}
        </blockquote>
      );
    case 'horizontalRule':
    case 'horizontal_rule':
      return <hr key={key} className="my-8 border-slate-200 dark:border-slate-700" />;
    case 'hardBreak':
    case 'hard_break':
      return <br key={key} />;
    case 'codeBlock': {
      const code = getTextContent(node);
      return (
        <pre key={key} className="my-4 rounded-lg bg-slate-100 dark:bg-slate-800 p-4 overflow-x-auto">
          <code>{code}</code>
        </pre>
      );
    }
    case 'image':
      return renderWidgetBlock(BlockType.IMAGE, node.attrs, postCategory, key);
    case 'coupon-widget':
    case 'coupon':
      return renderWidgetBlock(BlockType.COUPON, node.attrs, postCategory, key);
    case 'product':
      return renderWidgetBlock(BlockType.PRODUCT, node.attrs, postCategory, key);
    case 'product_list':
      return renderWidgetBlock(BlockType.PRODUCT_LIST, node.attrs, postCategory, key);
    case 'coupon_list':
      return renderWidgetBlock(BlockType.COUPON_LIST, node.attrs, postCategory, key);
    case 'hot_product':
      return renderWidgetBlock(BlockType.HOT_PRODUCT, node.attrs, postCategory, key);
    case 'table':
      return renderWidgetBlock(BlockType.TABLE, node.attrs, postCategory, key);
    case 'pros_and_cons':
      return renderWidgetBlock(BlockType.PROS_AND_CONS, node.attrs, postCategory, key);
    case 'image_slides':
      return renderWidgetBlock(BlockType.IMAGE_SLIDES, node.attrs, postCategory, key);
    case 'accordion':
      return renderWidgetBlock(BlockType.ACCORDION, node.attrs, postCategory, key);
    case 'related_posts':
      return renderWidgetBlock(BlockType.RELATED_POSTS, node.attrs, postCategory, key);
    case 'note_of_editor':
      return <NoteOfEditor key={key} data={node.attrs || {}} />;
    case 'citation':
      return <CitationWidget key={key} data={node.attrs || {}} />;
    case 'youtube': {
      const videoId = getYouTubeId(node.attrs?.src);
      const width = node.attrs?.width || '100%';
      const height = node.attrs?.height || 480;
      const align = node.attrs?.align || 'center';
      return (
        <div key={key} className="my-6 flex w-full" style={{ justifyContent: align === 'left' ? 'flex-start' : align === 'right' ? 'flex-end' : 'center' }}>
          <div className="relative w-full max-w-full aspect-video rounded-lg overflow-hidden bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-800" style={{ width, height }}>
            {videoId ? (
              <iframe
                src={`https://www.youtube.com/embed/${videoId}`}
                className="absolute inset-0 h-full w-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                title="YouTube video player"
              />
            ) : null}
          </div>
        </div>
      );
    }
    default:
      return children ? <React.Fragment key={key}>{children}</React.Fragment> : null;
  }
};

const TipTapRenderer: React.FC<TipTapRendererProps> = ({ content, postCategory }) => {
  if (!content) return null;
  const nodes = Array.isArray(content) ? content : content.content;
  if (!Array.isArray(nodes)) return null;
  return <>{nodes.map((node, index) => renderNode(node, `node-${index}`, postCategory))}</>;
};

export default TipTapRenderer;
