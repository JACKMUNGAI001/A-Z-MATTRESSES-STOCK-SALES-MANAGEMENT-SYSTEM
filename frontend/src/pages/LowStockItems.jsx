import React, { useEffect, useState } from 'react';
import api from '../api/api';
import Sidebar from "../components/Sidebar";
import Header from "../components/Header";
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
    <div className="flex bg-[#f1f5f9] min-h-screen">
      <Sidebar />
      <main className="flex-1 p-8 max-w-7xl mx-auto w-full">
        <Header />

        <div className="mb-8 flex items-center gap-3">
          <div className="bg-orange-600 p-3 rounded-2xl text-white shadow-lg shadow-orange-200">
            <AlertTriangle size={32} />
          </div>
          <div>
            <h1 className="text-3xl font-black text-gray-900 tracking-tight">Inventory Alerts</h1>
            <p className="text-gray-500 font-medium">Items that require immediate restocking (Quantity ≤ 2)</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="bg-orange-50 px-8 py-4 border-b border-orange-100 flex justify-between items-center">
            <h2 className="text-lg font-bold text-orange-800 flex items-center gap-2">
              <Package size={20} />
              Low Stock List
            </h2>
            <span className="bg-orange-200 text-orange-900 px-3 py-1 rounded-full text-xs font-black uppercase tracking-widest">
              {items.length} Items
            </span>
          </div>
          
          <div className="overflow-x-auto">
            {loading ? (
              <div className="p-20 text-center text-gray-400 font-bold uppercase tracking-widest animate-pulse">Checking inventory...</div>
            ) : items.length === 0 ? (
              <div className="p-20 text-center text-green-600 font-medium flex flex-col items-center gap-2">
                <div className="bg-green-100 p-4 rounded-full">🎉</div>
                All items are currently well stocked!
              </div>
            ) : (
              <table className="w-full">
                <thead className="bg-gray-50/50">
                  <tr>
                    <th className="px-8 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-widest">Product Name</th>
                    <th className="px-8 py-4 text-center text-xs font-bold text-gray-500 uppercase tracking-widest">Current Qty</th>
                    <th className="px-8 py-4 text-center text-xs font-bold text-gray-500 uppercase tracking-widest">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50 bg-white">
                  {items.map((item) => (
                    <tr key={item.id} className="hover:bg-orange-50/10 transition-colors">
                      <td className="px-8 py-4 font-black text-gray-900">{item.item_name}</td>
                      <td className="px-8 py-4 text-center">
                        <span className="text-2xl font-black text-red-600">{item.qty}</span>
                      </td>
                      <td className="px-8 py-4 text-center">
                        <span className="inline-flex items-center gap-1 text-xs font-black uppercase tracking-widest text-orange-600 bg-orange-50 px-3 py-1 rounded-full border border-orange-100">
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
      </main>
    </div>
  );
}
