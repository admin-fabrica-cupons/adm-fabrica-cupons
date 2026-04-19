import React from 'react';
import { ProductListBlock } from '../../types';
import ShowListOfProducts from './ShowListOfProducts';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

interface ProductListWidgetProps {
  data: ProductListBlock;
  className?: string;
  isPreview?: boolean;
}

const ProductListWidget: React.FC<ProductListWidgetProps> = ({ data, className, isPreview = false }) => {
  const items = data.items || [];
  
  // Determina o tipo de lista
  let listType: 'grid' | 'vertical' | 'list' | 'rank' | 'podium' | 'carousel' = 'grid';
  if (data.listType === 'rank' || data.listType === 'podium' || data.listType === 'vertical' || data.listType === 'list' || data.listType === 'carousel') {
    listType = data.listType;
  }

  // Se não houver itens, não renderiza nada, a menos que seja preview
  if ((!items || items.length === 0) && !isPreview) return null;

  return (
    <div className={twMerge(clsx(
      "not-prose w-full bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden",
      className
    ))}>
      {/* Cabeçalho condicional - só renderiza se tiver título */}
      {data.title && (
        <div className="flex items-center justify-between p-6 mb-6 bg-blue-600">
          <div>
            <h2 className="text-lg sm:text-xl font-black text-white leading-tight">
              {data.title}
            </h2>
            {data.description && (
              <p className="text-xs text-blue-100 font-bold uppercase tracking-widest mt-1">
                {data.description}
              </p>
            )}
          </div>
        </div>
      )}

      {/* Lista de Produtos */}
      <div className={data.title ? "p-6 pt-0" : "p-6"}>
        <ShowListOfProducts 
          products={items} 
          listType={listType} 
          columns={data.columns} 
          rankSize={data.rankSize} 
        />
      </div>
    </div>
  );
};

export default ProductListWidget;
