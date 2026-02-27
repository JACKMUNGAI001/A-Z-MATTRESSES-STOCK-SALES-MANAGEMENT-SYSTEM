import React, { useEffect, useState } from 'react';
import api, { API_BASE } from '../api/api';
import { FileText, Wallet, Clock, History } from "lucide-react";

export default function WeeksDeposits() {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPayments = async () => {
      try {
        const response = await api.get('/deposits/week');
        setPayments(response.data);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching this week's deposits:", error);
        setLoading(false);
      }
    };
    fetchPayments();
  }, []);

  const formatCurrency = (val) => {
    return new Intl.NumberFormat('en-KE', { style: 'currency', currency: 'KES', minimumFractionDigits: 0 }).format(val || 0);
  };

  return (
    <>
        <div className="mb-8 flex items-center gap-3">
          <div className="bg-indigo-600 p-3 rounded-2xl text-white shadow-lg shadow-indigo-200 transition-colors">
            <Wallet size={32} />
          </div>
          <div>
            <h1 className="text-3xl font-black text-gray-900 dark:text-white tracking-tight transition-colors">This Week's Collections</h1>
            <p className="text-gray-500 dark:text-gray-400 font-medium transition-colors">Installment payments received during the current week</p>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden transition-colors">
          <div className="bg-indigo-50 dark:bg-indigo-900/30 px-8 py-4 border-b border-indigo-100 dark:border-indigo-900/50 flex justify-between items-center transition-colors">
            <h2 className="text-lg font-bold text-indigo-800 dark:text-indigo-400 flex items-center gap-2 transition-colors">
              <History size={20} className="text-indigo-600 dark:text-indigo-400" />
              Weekly Collection Log
            </h2>
            <span className="bg-indigo-100 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-400 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest transition-colors">
              {payments.length} Payments
            </span>
          </div>
          
          <div className="overflow-x-auto">
            {loading ? (
              <div className="p-20 text-center text-gray-400 dark:text-gray-500 font-bold uppercase tracking-widest animate-pulse transition-colors">Loading data...</div>
            ) : payments.length === 0 ? (
              <div className="p-20 text-center text-gray-400 dark:text-gray-500 italic transition-colors">No deposit payments recorded for this week.</div>
            ) : (
              <table className="w-full">
                <thead className="bg-gray-50/50 dark:bg-gray-900/50 transition-colors">
                  <tr>
                    <th className="px-8 py-4 text-left text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest">Customer</th>
                    <th className="px-8 py-4 text-left text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest">Item Info</th>
                    <th className="px-8 py-4 text-right text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest">Amount Paid</th>
                    <th className="px-8 py-4 text-center text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest">Date Info</th>
                    <th className="px-8 py-4 text-center text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest">Receipt</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50 dark:divide-gray-700 bg-white dark:bg-gray-800 transition-colors">
                  {payments.map((p) => (
                    <tr key={p.id} className="hover:bg-indigo-50/50 dark:hover:bg-indigo-900/20 transition-colors">
                      <td className="px-8 py-4">
                        <div className="font-bold text-gray-900 dark:text-white transition-colors">{p.buyer_name}</div>
                      </td>
                      <td className="px-8 py-4">
                        <div className="text-xs text-gray-700 dark:text-gray-300 uppercase font-black transition-colors">{p.item_name}</div>
                      </td>
                      <td className="px-8 py-4 text-right font-black text-indigo-600 dark:text-indigo-400 text-lg transition-colors">{formatCurrency(p.amount)}</td>
                      <td className="px-8 py-4 text-center text-gray-500 dark:text-gray-400 font-medium transition-colors">
                        <div className="text-sm font-bold transition-colors">{new Date(p.paid_on).toLocaleDateString()}</div>
                        <div className="text-[10px] uppercase font-black text-gray-400 dark:text-gray-500 transition-colors">{new Date(p.paid_on).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                      </td>
                      <td className="px-8 py-4 text-center transition-colors">
                        {p.receipt_uuid && (
                          <a
                            href={`${API_BASE}/receipts/${p.receipt_uuid}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 p-2 rounded-lg hover:bg-indigo-600 hover:text-white transition-all inline-flex items-center gap-1 font-bold text-xs"
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
