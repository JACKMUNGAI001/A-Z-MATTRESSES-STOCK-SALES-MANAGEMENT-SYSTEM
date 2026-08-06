import React from 'react';
import { Store, User } from 'lucide-react';
import { formatCurrency, formatDate, formatPaymentMethod, formatSaleType } from '../utils/helpers';

/**
 * Compact transaction presentation for phone screens.  The desktop table is
 * deliberately kept by each page; this component is only rendered below md.
 */
export default function MobileSaleCard({ sale, searchQuery, showShop = true, additionalDetails, actions }) {
  const total = Number(sale.total_amount || 0);
  const paid = sale.paid_amount == null ? total : Number(sale.paid_amount || 0);
  const due = Math.max(0, total - paid);

  return (
    <article className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-800">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="font-black text-blue-600 dark:text-blue-400">Sale #{sale.id}</h3>
          <p className="mt-0.5 text-sm font-medium text-gray-500 dark:text-gray-400">{formatDate(sale.created_at)}</p>
        </div>
        <div className="shrink-0 text-right">
          <span className="inline-flex rounded-md border border-blue-200 bg-blue-50 px-2.5 py-1 text-xs font-black uppercase tracking-wide text-blue-700 dark:border-blue-700 dark:bg-blue-900/40 dark:text-blue-300">
            {formatPaymentMethod(sale.payment_type)}
          </span>
          <p className="mt-1 text-[10px] font-bold uppercase tracking-wide text-amber-600 dark:text-amber-400">{formatSaleType(sale.sale_type)}</p>
        </div>
      </div>

      <div className="mt-4 space-y-3 text-sm">
        <div className="grid grid-cols-[auto_1fr] gap-x-3">
          <span className="font-medium text-gray-500 dark:text-gray-400">Total/Paid/Due:</span>
          <span className="text-right font-black text-gray-900 dark:text-white">
            {formatCurrency(total)} / {formatCurrency(paid)} / <span className={due > 0 ? 'text-amber-500' : 'text-emerald-600 dark:text-emerald-400'}>{formatCurrency(due)}</span>
          </span>
        </div>

        {(sale.items || sale.products)?.length > 0 && (
          <div className="grid grid-cols-[auto_1fr] gap-x-3">
            <span className="font-medium text-gray-500 dark:text-gray-400">Items:</span>
            <div className="flex flex-wrap justify-end gap-1">
              {(sale.items || sale.products).map((item, index) => {
                const isMatch = searchQuery && item.item_name?.toLowerCase().includes(searchQuery.toLowerCase());
                return (
                  <span key={index} className={`rounded px-2 py-0.5 text-[10px] font-bold uppercase ${isMatch ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-200'}`}>
                    {item.item_name} × {item.qty}
                  </span>
                );
              })}
            </div>
          </div>
        )}

        {additionalDetails}

        {(showShop || sale.attendant_name) && (
          <div className="grid grid-cols-[auto_1fr] gap-x-3">
            <span className="font-medium text-gray-500 dark:text-gray-400">Branch/Sold By:</span>
            <span className="flex flex-wrap justify-end gap-x-1 text-right font-semibold text-gray-800 dark:text-gray-100">
              {showShop && sale.shop_name && <><Store size={15} className="mt-0.5 text-gray-400" />{sale.shop_name}</>}
              {showShop && sale.shop_name && sale.attendant_name && <span className="text-gray-400">/</span>}
              {sale.attendant_name && <><User size={15} className="mt-0.5 text-gray-400" />{sale.attendant_name}</>}
            </span>
          </div>
        )}
      </div>

      {actions && <div className="mt-4 flex flex-wrap gap-2 border-t border-gray-100 pt-3 dark:border-gray-700">{actions}</div>}
    </article>
  );
}
