import React, { useEffect, useState } from 'react';
import api, { API_BASE } from '../api/api';
import { FileText, Trophy, Clock, Receipt } from "lucide-react";
import { formatDate } from "../utils/helpers";

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

  const formatCurrency = (val) => {
    return new Intl.NumberFormat('en-KE', { style: 'currency', currency: 'KES', minimumFractionDigits: 0 }).format(val || 0);
  };

  return (
    <>
        <div className="mb-8 flex items-center gap-3">
          <div className="bg-green-600 p-3 rounded-2xl text-white shadow-lg shadow-green-200 transition-colors">
            <Trophy size={32} />
          </div>
          <div>
            <h1 className="text-3xl font-black text-gray-900 dark:text-white tracking-tight transition-colors">Annual Sales Summary</h1>
            <p className="text-gray-500 dark:text-gray-400 font-medium transition-colors">Detailed performance for the year {new Date().getFullYear()}</p>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden transition-colors">
          <div className="bg-gray-50 dark:bg-gray-900/50 px-8 py-4 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center transition-colors">
            <h2 className="text-lg font-bold text-gray-800 dark:text-white flex items-center gap-2 transition-colors">
              <Receipt size={20} className="text-green-600 dark:text-green-400" />
              Yearly Transactions
            </h2>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <div className="text-[10px] text-gray-400 dark:text-gray-500 font-black uppercase tracking-widest transition-colors">Total Revenue</div>
                <div className="text-lg font-black text-gray-900 dark:text-white transition-colors">{formatCurrency(sales.reduce((acc, s) => acc + s.total_amount, 0))}</div>
              </div>
              <span className="bg-green-100 dark:bg-green-900/50 text-green-700 dark:text-green-400 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest transition-colors">
                {sales.length} Sales
              </span>
            </div>
          </div>
          
          <div className="overflow-x-auto">
            {loading ? (
              <div className="p-20 text-center text-gray-400 dark:text-gray-500 font-bold uppercase tracking-widest animate-pulse transition-colors">Loading data...</div>
            ) : sales.length === 0 ? (
              <div className="p-20 text-center text-gray-400 dark:text-gray-500 italic transition-colors">No sales recorded for this year yet.</div>
            ) : (
              <table className="w-full">
                <thead className="bg-gray-50/50 dark:bg-gray-900/50 transition-colors">
                  <tr>
                    <th className="px-8 py-4 text-left text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest">ID</th>
                    <th className="px-8 py-4 text-right text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest">Amount</th>
                    <th className="px-8 py-4 text-center text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest">Date Info</th>
                    <th className="px-8 py-4 text-center text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest">Receipt</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50 dark:divide-gray-700 bg-white dark:bg-gray-800 transition-colors">
                  {sales.map((sale) => (
                    <tr key={sale.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-900/50 transition-colors">
                      <td className="px-8 py-4 font-bold text-gray-400 dark:text-gray-500 transition-colors">#{sale.id}</td>
                      <td className="px-8 py-4 text-right font-black text-gray-900 dark:text-white text-lg transition-colors">{formatCurrency(sale.total_amount)}</td>
                      <td className="px-8 py-4 text-center text-gray-500 dark:text-gray-400 font-medium transition-colors">
                        <div className="text-sm font-bold text-gray-700 dark:text-gray-300 transition-colors">{formatDate(sale.created_at)}</div>
                        <div className="text-[10px] uppercase font-black text-gray-400 dark:text-gray-500 transition-colors">{new Date(sale.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                      </td>
                      <td className="px-8 py-4 text-center transition-colors">
                        {sale.receipt_uuid && (
                          <a
                            href={`${API_BASE}/receipts/${sale.receipt_uuid}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="bg-green-50 dark:bg-green-900/30 text-green-600 dark:text-green-400 p-2 rounded-lg hover:bg-green-600 hover:text-white transition-all inline-flex items-center gap-1 font-bold text-xs"
                          >
                            <FileText size={16} /> VIEW
                          </a>
                        )}
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
