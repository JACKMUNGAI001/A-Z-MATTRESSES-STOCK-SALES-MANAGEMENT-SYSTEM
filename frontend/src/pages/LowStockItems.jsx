import React, { useEffect, useState } from 'react';
import api from '../api/api';

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
      <h1 className="text-2xl font-bold mb-4">Low Stock Items</h1>
              {loading ? (
                <p>Loading...</p>
              ) : items.length === 0 ? (
                <p>No low stock items found.</p>
              ) : (        <div className="bg-white p-4 rounded-xl shadow">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Item ID</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Quantity</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Sell Price</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {items.map((item) => (
                <tr key={item.id}>
                  <td className="px-6 py-4 whitespace-nowrap">{item.item_id}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{item.qty}</td>
                  <td className="px-6 py-4 whitespace-nowrap">KES {item.sell_price.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}