// components/Widgets/TableWidget.tsx
import React from 'react';
import Image from 'next/image';
import { TableBlock } from '../../types';
import { HiOutlineTable } from 'react-icons/hi';

interface TableWidgetProps {
  data: TableBlock;
}

const TableWidget: React.FC<TableWidgetProps> = ({ data }) => {
  const rows = data.rows || [];
  const headers = data.headers || [];
  const caption = data.caption;
  const showBorders = data.showBorders !== false;
  const striped = data.striped || false;

  if (rows.length === 0) {
    return null;
  }

  return (
    <div className="not-prose my-6 slide-in-from-bottom-4 duration-200">
      <div className="relative overflow-hidden bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-500 shadow-sm rounded-sm">
        {/* Cabeçalho Decorativo / Caption */}
        {caption && (
          <div className="px-6 py-4 bg-slate-50 dark:bg-slate-800/70 border-b border-slate-300 dark:border-slate-600 flex items-center gap-3">
            <h3 className="text-sm font-black text-slate-800 dark:text-white uppercase tracking-wider">
              {caption}
            </h3>
          </div>
        )}

        {/* Wrapper do Scroll */}
        <div className="overflow-x-auto scrollbar-thin scrollbar-thumb-slate-200 dark:scrollbar-thumb-slate-800">
          <table className="w-full text-left border-collapse">
            {/* Headers da Tabela */}
            {headers.some(h => h.trim()) && (
              <thead className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-300 dark:border-slate-600">
                <tr>
                  {headers.map((header, index) => (
                    <th
                      key={index}
                      className={`
                        px-6 py-4 text-xs font-black text-slate-600 dark:text-slate-200 uppercase tracking-wider
                        ${showBorders ? 'border-r border-slate-300 dark:border-slate-600 last:border-r-0' : ''}
                      `}
                    >
                      {header}
                    </th>
                  ))}
                </tr>
              </thead>
            )}

            {/* Corpo da Tabela */}
            <tbody className="divide-y divide-slate-300 dark:divide-slate-600">
              {rows.map((row, rowIndex) => (
                <tr
                  key={row.id}
                  className={`
                    group transition-colors duration-200
                    ${striped && rowIndex % 2 !== 0 ? 'bg-slate-50/70 dark:bg-slate-800/50' : 'bg-transparent'}
                    hover:bg-blue-50/50 dark:hover:bg-blue-900/20
                  `}
                >
                  {row.cells.map((cell, cellIndex) => {
                    const isRowHeader = cell.isHeader;
                    const alignX = cell.alignX || 'left';
                    const alignY = cell.alignY || 'middle';
                    const alignXClass = alignX === 'center' ? 'items-center text-center' : alignX === 'right' ? 'items-end text-right' : 'items-start text-left';
                    const alignYClass = alignY === 'top' ? 'justify-start' : alignY === 'bottom' ? 'justify-end' : 'justify-center';
                    return (
                      <td
                        key={cell.id}
                        className={`
                          px-6 py-4 text-sm transition-all duration-200
                          ${showBorders ? 'border-r border-slate-300 dark:border-slate-600 last:border-0' : ''}
                          ${isRowHeader
                            ? 'font-semibold text-slate-900 dark:text-white bg-slate-50/60 dark:bg-slate-800/50'
                            : 'text-slate-700 dark:text-slate-200 font-medium'
                          }
                        `}
                      >
                        <div className={`flex flex-col gap-2 ${alignXClass} ${alignYClass}`}>
                          {cell.imageSrc && (
                            <Image
                              src={cell.imageSrc}
                              alt={cell.imageAlt || ''}
                              width={240}
                              height={160}
                              sizes="100vw"
                              className="max-w-full h-auto rounded-lg"
                            />
                          )}
                          {cell.content}
                        </div>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default TableWidget;
