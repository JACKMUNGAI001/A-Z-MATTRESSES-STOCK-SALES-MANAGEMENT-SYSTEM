import React, { useEffect, useState } from 'react';
import api from '../api/api';

export default function TodaysSales() {
  const [sales, setSales] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSales = async () => {
      try {
        const response = await api.get('/sales/today');
        setSales(response.data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching today\'s sales:', error);
        setLoading(false);
      }
    };
    fetchSales();
  }, []);

  return (
    <>
      <h1 className="text-2xl font-bold mb-4">Today's Sales</h1>
              {loading ? (
                <p>Loading...</p>
              ) : sales.length === 0 ? (
                <p>No sales found for today.</p>
              ) : (        <div className="bg-white p-4 rounded-xl shadow">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Sale ID</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Amount</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-500 uppercase tracking-wider">Payment Type</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Time</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {sales.map((sale) => (
                <tr key={sale.id}>
                  <td className="px-6 py-4 whitespace-nowrap">{sale.id}</td>
                  <td className="px-6 py-4 whitespace-nowrap">KES {sale.total_amount.toFixed(2)}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{sale.payment_type}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{new Date(sale.created_at).toLocaleTimeString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}
