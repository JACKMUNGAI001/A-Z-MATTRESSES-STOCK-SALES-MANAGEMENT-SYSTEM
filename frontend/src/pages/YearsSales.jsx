import React, { useEffect, useState } from 'react';
import api, { API_BASE } from '../api/api';

export default function YearsSales() {
  const [sales, setSales] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSales = async () => {
      try {
        const response = await api.get('/sales/year');
        setSales(response.data);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching this year's sales:", error);
        setLoading(false);
      }
    };
    fetchSales();
  }, []);

  return (
    <>
      <h1 className="text-2xl font-bold mb-4">This Year's Sales</h1>
      {loading ? (
        <p>Loading...</p>
      ) : sales.length === 0 ? (
        <p>No sales found for this year.</p>
      ) : (
        <div className="bg-white p-4 rounded-xl shadow">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Sale ID</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Amount</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-500 uppercase tracking-wider">Payment Type</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date & Time</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Receipt</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {sales.map((sale) => (
                <tr key={sale.id}>
                  <td className="px-6 py-4 whitespace-nowrap">{sale.id}</td>
                  <td className="px-6 py-4 whitespace-nowrap">KES {sale.total_amount.toFixed(2)}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{sale.payment_type}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{new Date(sale.created_at).toLocaleString()}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {sale.receipt_uuid && (
                      <a
                        href={`${API_BASE}/receipts/${sale.receipt_uuid}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline"
                      >
                        View Receipt
                      </a>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}
