import React, { useEffect, useState } from 'react';
import api from '../api/api';
import { AlertTriangle, Package, Info } from "lucide-react";

export default function LowStockItems() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchItems = async () => {
      try {
        const response = await api.get('/stocks/low_stock_items');
        setItems(response.data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching low stock items:', error);
        setLoading(false);
      }
    };
    fetchItems();
  }, []);

  return (
    <>
        <div className="mb-8 flex items-center gap-3 transition-colors">
          <div className="bg-orange-600 p-3 rounded-2xl text-white shadow-lg shadow-orange-200 dark:shadow-none transition-colors">
            <AlertTriangle size={32} />
          </div>
          <div>
            <h1 className="text-3xl font-black text-gray-900 dark:text-white tracking-tight transition-colors">Inventory Alerts</h1>
            <p className="text-gray-500 dark:text-gray-400 font-medium transition-colors">Items that require immediate restocking (Quantity ≤ 2)</p>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden transition-colors">
          <div className="bg-orange-50 dark:bg-orange-900/30 px-8 py-4 border-b border-orange-100 dark:border-orange-900/50 flex justify-between items-center transition-colors">
            <h2 className="text-lg font-bold text-orange-800 dark:text-orange-400 flex items-center gap-2 transition-colors">
              <Package size={20} />
              Low Stock List
            </h2>
            <span className="bg-orange-200 dark:bg-orange-900/50 text-orange-900 dark:text-orange-400 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest transition-colors">
              {items.length} Items
            </span>
          </div>
          
          <div className="overflow-x-auto">
            {loading ? (
              <div className="p-20 text-center text-gray-400 dark:text-gray-500 font-bold uppercase tracking-widest animate-pulse transition-colors">Checking inventory...</div>
            ) : items.length === 0 ? (
              <div className="p-20 text-center text-green-600 dark:text-green-400 font-medium flex flex-col items-center gap-2 transition-colors">
                <div className="bg-green-100 dark:bg-green-900/30 p-4 rounded-full transition-colors">🎉</div>
                All items are currently well stocked!
              </div>
            ) : (
              <table className="w-full">
                <thead className="bg-gray-50/50 dark:bg-gray-900/50 transition-colors">
                  <tr>
                    <th className="px-8 py-4 text-left text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest">Product Name</th>
                    <th className="px-8 py-4 text-center text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest">Current Qty</th>
                    <th className="px-8 py-4 text-center text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50 dark:divide-gray-700 bg-white dark:bg-gray-800 transition-colors">
                  {items.map((item) => (
                    <tr key={item.id} className="hover:bg-orange-50/10 dark:hover:bg-orange-900/10 transition-colors">
                      <td className="px-8 py-4 font-black text-gray-900 dark:text-white transition-colors">{item.item_name}</td>
                      <td className="px-8 py-4 text-center transition-colors">
                        <span className="text-2xl font-black text-red-600 dark:text-red-400">{item.qty}</span>
                      </td>
                      <td className="px-8 py-4 text-center transition-colors">
                        <span className="inline-flex items-center gap-1 text-xs font-black uppercase tracking-widest text-orange-600 dark:text-orange-400 bg-orange-50 dark:bg-orange-900/30 px-3 py-1 rounded-full border border-orange-100 dark:border-orange-900 transition-colors">
                          <Info size={14} /> Reorder Soon
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
    </>
  );
}
