import React, { useEffect, useState, useContext } from 'react';
import api, { API_BASE } from '../api/api';
import { FileText, Wallet, Clock, History, SearchX } from "lucide-react";
import { SearchContext } from '../context/SearchContext';

export default function TodaysDeposits() {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const { searchQuery } = useContext(SearchContext);

  useEffect(() => {
    const fetchPayments = async () => {
      try {
        const response = await api.get('/deposits/today');
        setPayments(response.data);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching today's deposits:", error);
        setLoading(false);
      }
    };
    fetchPayments();
  }, []);

  const formatCurrency = (val) => {
    return new Intl.NumberFormat('en-KE', { style: 'currency', currency: 'KES', minimumFractionDigits: 0 }).format(val || 0);
  };

  const filteredPayments = searchQuery 
    ? payments.filter(p => 
        p.item_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.buyer_name.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : payments;

  return (
    <>
        <div className="mb-8 flex items-center gap-3">
          <div className="bg-indigo-600 p-3 rounded-2xl text-white shadow-lg shadow-indigo-200 transition-colors">
            <Wallet size={32} />
          </div>
          <div>
            <h1 className="text-3xl font-black text-gray-900 dark:text-white tracking-tight transition-colors">Today's Deposit Collections</h1>
            <p className="text-gray-500 dark:text-gray-400 font-medium transition-colors">Tracking all installment payments received today</p>
            {searchQuery && <p className="text-sm text-blue-500 font-bold mt-1 transition-all">Searching for: "{searchQuery}"</p>}
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden transition-colors">
          <div className="bg-indigo-50 dark:bg-indigo-900/30 px-8 py-4 border-b border-indigo-100 dark:border-indigo-900/50 flex justify-between items-center transition-colors">
            <h2 className="text-lg font-bold text-indigo-800 dark:text-indigo-400 flex items-center gap-2 transition-colors">
              <History size={20} className="text-indigo-600 dark:text-indigo-400" />
              Daily Collection Log
            </h2>
            <span className="bg-indigo-100 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-400 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest transition-colors">
              {filteredPayments.length} {searchQuery ? 'Matching' : ''} Payments
            </span>
          </div>
          
          <div className="overflow-x-auto">
            {loading ? (
              <div className="p-20 text-center text-gray-400 dark:text-gray-500 font-bold uppercase tracking-widest animate-pulse transition-colors">Loading data...</div>
            ) : filteredPayments.length === 0 ? (
              <div className="p-20 text-center border-t border-gray-100 dark:border-gray-700 transition-colors">
                <SearchX size={48} className="mx-auto text-gray-300 dark:text-gray-600 mb-4 transition-colors" />
                <p className="text-gray-500 dark:text-gray-400 font-bold uppercase tracking-widest text-sm transition-colors">{searchQuery ? `No matches found for "${searchQuery}"` : 'No deposit payments recorded today.'}</p>
              </div>
            ) : (
              <table className="w-full">
                <thead className="bg-gray-50/50 dark:bg-gray-900/50 transition-colors">
                  <tr>
                    <th className="px-8 py-4 text-left text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest">Customer</th>
                    <th className="px-8 py-4 text-left text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest">Item Info</th>
                    <th className="px-8 py-4 text-right text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest">Amount Paid</th>
                    <th className="px-8 py-4 text-center text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest">Time</th>
                    <th className="px-8 py-4 text-center text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest">Receipt</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50 dark:divide-gray-700 bg-white dark:bg-gray-800 transition-colors">
                  {filteredPayments.map((p) => {
                    const isBuyerMatch = searchQuery && p.buyer_name.toLowerCase().includes(searchQuery.toLowerCase());
                    const isItemMatch = searchQuery && p.item_name.toLowerCase().includes(searchQuery.toLowerCase());
                    return (
                      <tr key={p.id} className="hover:bg-indigo-50/50 dark:hover:bg-indigo-900/20 transition-colors">
                        <td className="px-8 py-4">
                          <div className={`font-bold transition-colors ${isBuyerMatch ? 'text-blue-600 dark:text-blue-400 font-black' : 'text-gray-900 dark:text-white'}`}>{p.buyer_name}</div>
                        </td>
                        <td className="px-8 py-4">
                          <div className={`text-xs uppercase font-black transition-colors ${isItemMatch ? 'text-blue-600 dark:text-blue-400' : 'text-gray-700 dark:text-gray-300'}`}>{p.item_name}</div>
                        </td>
                        <td className="px-8 py-4 text-right font-black text-indigo-600 dark:text-indigo-400 text-lg transition-colors">{formatCurrency(p.amount)}</td>
                        <td className="px-8 py-4 text-center text-gray-500 dark:text-gray-400 font-medium transition-colors">
                          <div className="flex items-center justify-center gap-1 text-sm">
                            <Clock size={14} />
                            {new Date(p.paid_on).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </div>
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
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        </div>
    </>
  );
}
