import React from 'react';
import Image from 'next/image';
import { Block, BlockType, HeadingBlock, ImageBlock, ParagraphBlock } from '../../types';
import CouponWidget from './CouponWidget';
import ProductWidget from './ProductWidget';
import ProductListWidget from './ProductListWidget';
import CouponListWidget from './CouponListWidget';
import HotProductWidget from './HotProductWidget';
import TableWidget from './TableWidget';
import ProsAndCons from './ProsAndCons';
import ImageSlides from './ImageSlides';
import AccordionWidget from './AccordionWidget';
import RelatedPostsWidget from './RelatedPostsWidget';
import TextView from '../Admin/Util/TextView';

interface WidgetRendererProps {
  block: Block;
  postCategory?: string;
  layout?: 'vertical' | 'horizontal';
  index?: number;
}

const shouldUnoptimize = (src?: string) =>
  !!src && (src.includes('placehold.co') || src.endsWith('.svg'));

const WidgetRenderer: React.FC<WidgetRendererProps> = ({ block, postCategory, layout, index }) => {
  switch (block.type) {
    case BlockType.COUPON:
      return <CouponWidget data={block} />;

    case BlockType.PRODUCT:
      return <ProductWidget data={block} layout={layout} />;

    case BlockType.PRODUCT_LIST:
      return <ProductListWidget data={block} />;

    case BlockType.COUPON_LIST:
      return <CouponListWidget data={block} />;

    case BlockType.HOT_PRODUCT:
      // Aqui injetamos a postCategory no objeto data do widget
      return <HotProductWidget data={{ ...block, postCategory } as any} layout={layout} />;

    case BlockType.TABLE:
      return <TableWidget data={block} />;

    case BlockType.PROS_AND_CONS:
      return <ProsAndCons data={block} />;

    case BlockType.IMAGE_SLIDES:
      return <ImageSlides data={block} />;

    case BlockType.ACCORDION:
      return <AccordionWidget data={block} />;

    case BlockType.RELATED_POSTS:
      return <RelatedPostsWidget data={block} />;

    case BlockType.HEADING: {
      const headingBlock = block as HeadingBlock;
      const content = headingBlock.content || '';
      const isHTMLHeading = /^<h[1-4]>.*<\/h[1-4]>$/i.test(content);

      if (isHTMLHeading) {
        return (
          <div className="my-10" id={index !== undefined ? `heading-${index}` : undefined}>
            <TextView content={content} />
          </div>
        );
      } else {
        return (
          <div className="relative my-8 group" id={index !== undefined ? `heading-${index}` : undefined}>
            <h2 className="text-2xl md:text-2xl font-black text-slate-800 dark:text-white leading-tight tracking-tighter">
              {content}
            </h2>
            <div className="absolute -left-3 top-0 bottom-0 w-0 bg-gradient-to-b from-blue-600 to-indigo-600 rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="mt-1 h-1 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full opacity-20" />
          </div>
        );
      }
    }

    case BlockType.PARAGRAPH: {
      const paragraphBlock = block as ParagraphBlock;
      return (
        <TextView
          content={paragraphBlock.content}
          className="my-8 text-slate-600 dark:text-slate-300 leading-relaxed text-lg"
        />
      );
    }

    case BlockType.IMAGE: {
      const imageBlock = block as ImageBlock;
      const ratioClasses: Record<string, string> = {
        '16:9': 'aspect-video',
        '3:4': 'aspect-[3/4]',
        '1:1': 'aspect-square',
        'auto': ''
      };

      const sizeClasses: Record<string, string> = {
        'small': 'max-w-md mx-auto',
        'medium': 'max-w-2xl mx-auto',
        'large': 'max-w-4xl mx-auto',
        'full': 'w-full'
      };

      return (
        <div className={`my-12 ${sizeClasses[imageBlock.imageSize || 'medium']} px-4`}>
          <div className={`
             relative rounded-[32px] overflow-hidden 
             border-4 border-white dark:border-slate-800 
             shadow-2xl shadow-slate-200 dark:shadow-none
             ${ratioClasses[imageBlock.imageRatio || 'auto']}
          `}>
            <Image
              src={imageBlock.src || ''}
              alt={imageBlock.alt || 'Imagem'}
              fill
              className="object-cover transition-transform duration-700 hover:scale-105"
              unoptimized={shouldUnoptimize(imageBlock.src)}
            />
            {/* Overlay sutil para destacar a imagem */}
            <div className="absolute inset-0 ring-1 ring-inset ring-black/5 dark:ring-white/5 pointer-events-none rounded-[28px]" />
          </div>
          {imageBlock.alt && (
            <div className="mt-4 flex flex-col items-center">
              <span className="h-0.5 w-8 bg-slate-200 dark:bg-slate-700 rounded-full mb-2" />
              <p className="text-center text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em]">
                {imageBlock.alt}
              </p>
            </div>
          )}
        </div>
      );
    }

    default: {
      const fallbackBlock = block as Block;
      return (
        <div className="my-4 p-4 bg-yellow-100 dark:bg-yellow-900/20 border border-yellow-300 dark:border-yellow-800 rounded">
          <p className="text-yellow-800 dark:text-yellow-300">
            Widget não suportado: {fallbackBlock.type}
          </p>
        </div>
      );
    }
  }
};

export default WidgetRenderer;
