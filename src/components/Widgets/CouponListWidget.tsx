import React, { useState, useMemo } from 'react';
import { calculateExpiryStatus } from '../../constants';
import { BlockType, CouponBlock, CouponListBlock } from '../../types';
import CouponWidget from './CouponWidget';

const CouponListWidget = ({ data }: { data: CouponListBlock }) => {
  const items = useMemo(() => data.items || [], [data.items]);
  const [filter, setFilter] = useState<'all' | 'active' | 'expired'>('all');

  const filteredItems = useMemo(() => {
    return items.filter((item: any) => {
      const status = calculateExpiryStatus(item.expiryDate, item.expiryTime);
      const isExpired = item.isExpired || (status?.expired || false);
      if (filter === 'active') return !isExpired;
      if (filter === 'expired') return isExpired;
      return true;
    });
  }, [items, filter]);

  const buildCouponData = (item: any): CouponBlock => ({
    id: item.id,
    type: BlockType.COUPON,
    name: item.title || item.name || 'Cupom',
    description: item.description || '',
    discount: item.discount || item.couponName || 'Cupom',
    couponCode: item.couponCode,
    hideCode: item.hideCode,
    affiliateLink: item.affiliateLink,
    affiliateButtonText: item.affiliateButtonText || data.affiliateButtonText || 'Ativar Cupom',
    affiliateLogo: item.affiliateLogo,
    showStoreLogo: item.showStoreLogo,
    isExpired: item.isExpired,
    expiryDate: item.expiryDate,
    expiryTime: item.expiryTime,
    storeName: item.storeName || data.storeName
  });

  return (
    <div className="not-prose my-4 bg-white dark:bg-slate-800 rounded-lg border border-gray-200 dark:border-slate-700 overflow-hidden shadow-[0_10px_30px_rgba(0,0,0,0.1)]">
      
      {/* HEADER E FILTROS */}
      <div className="p-4 border-b border-gray-200 dark:border-slate-700">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <h3 className="font-bold text-gray-900 dark:text-white text-lg">
            {data.content || 'Lista de Cupons'}
          </h3>
          <div className="flex bg-gray-100 dark:bg-slate-700 rounded-md p-1">
            {(['all', 'active', 'expired'] as const).map((t) => (
              <button
                key={t}
                onClick={() => setFilter(t)}
                className={`px-3 py-1 text-xs font-medium rounded-sm transition ${
                  filter === t 
                    ? 'bg-white dark:bg-slate-800 text-gray-900 dark:text-white shadow-sm' 
                    : 'text-gray-600 dark:text-gray-400'
                }`}
              >
                {t === 'all' ? 'Todos' : t === 'active' ? 'Ativos' : 'Expirados'}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* LISTAGEM */}
      <div className="p-4 sm:p-6 flex flex-col gap-6">
        {filteredItems.length === 0 ? (
          <div className="p-10 text-center text-gray-500">
            <div className="mx-auto mb-2 opacity-20 w-10 h-10 flex items-center justify-center border-2 border-dashed border-current rounded-full">
              <span className="font-bold text-xl">%</span>
            </div>
            Nenhum cupom nesta categoria.
          </div>
        ) : (
          filteredItems.map((item: any) => (
            <CouponWidget key={item.id} data={buildCouponData(item)} compact />
          ))
        )}
      </div>
    </div>
  );
};

export default CouponListWidget;
