import React, { useEffect, useState, useContext } from 'react';
import api, { API_BASE } from '../api/api';
import { FileText, Wallet, SearchX, Store, Phone, Package, X, History as HistoryIcon, Clock } from "lucide-react";
import { SearchContext } from '../context/SearchContext';
import { AuthContext } from '../context/AuthContext';
import { formatDate } from '../utils/helpers';

export default function TodaysDeposits() {
  const [deposits, setDeposits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDeposit, setSelectedDeposit] = useState(null);
  const [showHistory, setShowHistory] = useState(false);
  const { searchQuery, searchType } = useContext(SearchContext);
  const { user } = useContext(AuthContext);

  useEffect(() => {
    const fetchDeposits = async () => {
      try {
        const response = await api.get('/deposits/today');
        setDeposits(response.data);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching today's deposits:", error);
        setLoading(false);
      }
    };
    fetchDeposits();
  }, []);

  const formatCurrency = (val) => {
    return new Intl.NumberFormat('en-KE', { style: 'currency', currency: 'KES', minimumFractionDigits: 0 }).format(val || 0);
  };

  const filteredDeposits = searchQuery 
    ? deposits.filter(p => {
        if (searchType === 'date') {
          return new Date(p.created_at).toISOString().split('T')[0] === searchQuery;
        }
        return (
          (p.shop_name && p.shop_name.toLowerCase().includes(searchQuery.toLowerCase())) ||
          p.item_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          p.buyer_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (p.buyer_phone && p.buyer_phone.includes(searchQuery))
        );
      })
    : deposits;

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
              <HistoryIcon size={20} className="text-indigo-600 dark:text-indigo-400" />
              Daily Collection Log
            </h2>
            <span className="bg-indigo-100 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-400 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest transition-colors">
              {filteredDeposits.length} {searchQuery ? 'Matching' : ''} Accounts
            </span>
          </div>
          
          <div className="overflow-x-auto max-h-[calc(100vh-300px)] overflow-y-auto custom-scrollbar">
            {loading ? (
              <div className="p-20 text-center text-gray-400 dark:text-gray-500 font-bold uppercase tracking-widest animate-pulse transition-colors">Loading data...</div>
            ) : filteredDeposits.length === 0 ? (
              <div className="p-20 text-center border-t border-gray-100 dark:border-gray-700 transition-colors">
                <SearchX size={48} className="mx-auto text-gray-300 dark:text-gray-600 mb-4 transition-colors" />
                <p className="text-gray-500 dark:text-gray-400 font-bold uppercase tracking-widest text-sm transition-colors">{searchQuery ? `No matches found for "${searchQuery}"` : 'No deposit payments recorded today.'}</p>
              </div>
            ) : (
              <table className="w-full relative border-collapse">
                <thead className="bg-gray-50/90 dark:bg-gray-900/90 transition-colors sticky top-0 z-10 backdrop-blur-sm">
                  <tr>
                    {(user?.role === 'manager' || user?.role === 'admin') && (
                      <th className="px-8 py-4 text-left text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest border-b border-gray-100 dark:border-gray-700">Shop</th>
                    )}
                    <th className="px-8 py-4 text-left text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest border-b border-gray-100 dark:border-gray-700">Customer</th>
                    <th className="px-8 py-4 text-left text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest border-b border-gray-100 dark:border-gray-700">Item Info</th>
                    <th className="px-8 py-4 text-right text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest border-b border-gray-100 dark:border-gray-700">Paid Today</th>
                    <th className="px-8 py-4 text-right text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest border-b border-gray-100 dark:border-gray-700">Total Paid</th>
                    <th className="px-8 py-4 text-center text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest border-b border-gray-100 dark:border-gray-700">History</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50 dark:divide-gray-700 bg-white dark:bg-gray-800 transition-colors">
                  {filteredDeposits.map((p, idx) => {
                    const isBuyerMatch = searchQuery && p.buyer_name.toLowerCase().includes(searchQuery.toLowerCase());
                    const isItemMatch = searchQuery && p.item_name.toLowerCase().includes(searchQuery.toLowerCase());
                    const isShopMatch = searchQuery && p.shop_name && p.shop_name.toLowerCase().includes(searchQuery.toLowerCase());
                    
                    // Calculate amount paid today
                    const today = new Date().toDateString();
                    const amountPaidToday = p.payments
                      .filter(pay => new Date(pay.paid_on).toDateString() === today)
                      .reduce((sum, pay) => sum + pay.amount, 0);

                    return (
                      <tr key={idx} className="hover:bg-indigo-50/50 dark:hover:bg-indigo-900/20 transition-colors">
                        {(user?.role === 'manager' || user?.role === 'admin') && (
                          <td className="px-8 py-4">
                            <div className={`flex items-center gap-1 text-sm font-bold transition-colors ${isShopMatch ? 'text-blue-600 dark:text-blue-400 font-black' : 'text-gray-500 dark:text-gray-400'}`}>
                              <Store size={14} className="text-gray-400" />
                              {p.shop_name}
                            </div>
                          </td>
                        )}
                        <td className="px-8 py-4">
                          <div className={`font-black transition-colors ${isBuyerMatch ? 'text-blue-600 dark:text-blue-400' : 'text-gray-900 dark:text-white'}`}>{p.buyer_name}</div>
                          <div className="flex items-center gap-1 text-[10px] text-gray-500 font-bold uppercase mt-1">
                            <Phone size={10} className="text-indigo-400" /> {p.buyer_phone}
                          </div>
                        </td>
                        <td className="px-8 py-4">
                          <div className={`text-xs uppercase font-black transition-colors ${isItemMatch ? 'text-blue-600 dark:text-blue-400' : 'text-gray-700 dark:text-gray-300'}`}>{p.item_name}</div>
                          <div className="text-[10px] text-gray-400 font-medium">Reserved: {formatDate(p.created_at)}</div>
                        </td>
                        <td className="px-8 py-4 text-right font-black text-indigo-600 dark:text-indigo-400 text-lg transition-colors">{formatCurrency(amountPaidToday)}</td>
                        <td className="px-8 py-4 text-right">
                          <div className="font-bold text-gray-900 dark:text-white">{formatCurrency(p.total_paid)}</div>
                          <div className="text-[10px] font-black text-red-500 uppercase tracking-tight">Due: {formatCurrency(p.balance)}</div>
                        </td>
                        <td className="px-8 py-4 text-center transition-colors">
                          <button
                            onClick={() => {
                                setSelectedDeposit(p);
                                setShowHistory(true);
                            }}
                            className="bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 px-4 py-2 rounded-lg hover:bg-indigo-600 hover:text-white transition-all font-black text-[10px] uppercase tracking-widest border border-indigo-100 dark:border-indigo-800"
                          >
                            VIEW ALL
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* HISTORY MODAL */}
        {showHistory && selectedDeposit && (
            <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden animate-in fade-in zoom-in duration-200 transition-colors">
                    <div className="bg-indigo-600 p-6 text-white flex justify-between items-center transition-colors">
                        <div>
                            <h3 className="text-xl font-bold flex items-center gap-2">
                                <HistoryIcon size={24} /> Payment History
                            </h3>
                            <p className="text-indigo-100 text-sm mt-1 font-medium">{selectedDeposit.buyer_name} - {selectedDeposit.item_name}</p>
                        </div>
                        <button onClick={() => setShowHistory(false)} className="text-white/80 hover:text-white transition-colors">
                            <X size={28} />
                        </button>
                    </div>
                    
                    <div className="p-8">
                        <div className="grid grid-cols-3 gap-4 mb-8">
                            <div className="bg-gray-50 dark:bg-gray-900/50 p-4 rounded-xl border border-gray-100 dark:border-gray-700 transition-colors">
                                <div className="text-[10px] font-black text-gray-400 uppercase mb-1">Total Price</div>
                                <div className="text-lg font-black text-gray-900 dark:text-white">{formatCurrency(selectedDeposit.selling_price)}</div>
                            </div>
                            <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-xl border border-green-100 dark:border-green-900/30 transition-colors">
                                <div className="text-[10px] font-black text-green-600 dark:text-green-400 uppercase mb-1">Total Paid</div>
                                <div className="text-lg font-black text-green-700 dark:text-green-400">{formatCurrency(selectedDeposit.total_paid)}</div>
                            </div>
                            <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-xl border border-red-100 dark:border-red-900/30 transition-colors">
                                <div className="text-[10px] font-black text-red-600 dark:text-red-400 uppercase mb-1">Balance</div>
                                <div className="text-lg font-black text-red-700 dark:text-red-400">{formatCurrency(selectedDeposit.balance)}</div>
                            </div>
                        </div>

                        <div className="max-h-60 overflow-y-auto custom-scrollbar border rounded-xl dark:border-gray-700">
                            <table className="w-full text-sm">
                                <thead className="bg-gray-50 dark:bg-gray-900/80 sticky top-0 transition-colors">
                                    <tr>
                                        <th className="px-4 py-3 text-left font-black text-gray-400 uppercase text-[10px]">Date & Time</th>
                                        <th className="px-4 py-3 text-right font-black text-gray-400 uppercase text-[10px]">Amount</th>
                                        <th className="px-4 py-3 text-center font-black text-gray-400 uppercase text-[10px]">Receipt</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100 dark:divide-gray-700 transition-colors">
                                    {selectedDeposit.payments.map((pay, i) => (
                                        <tr key={i} className="hover:bg-gray-50 dark:hover:bg-gray-900/30 transition-colors">
                                            <td className="px-4 py-3 text-gray-600 dark:text-gray-400 font-medium">
                                                <div>{formatDate(pay.paid_on)}</div>
                                                <div className="text-[10px] flex items-center gap-1 opacity-60"><Clock size={10} /> {new Date(pay.paid_on).toLocaleTimeString()}</div>
                                            </td>
                                            <td className="px-4 py-3 text-right font-black text-gray-900 dark:text-white">{formatCurrency(pay.amount)}</td>
                                            <td className="px-4 py-3 text-center">
                                                <a
                                                    href={`${API_BASE}/receipts/${pay.receipt_uuid}`}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="text-blue-600 hover:text-blue-800 font-bold text-[10px] underline tracking-widest"
                                                >
                                                    DOWNLOAD
                                                </a>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                        
                        <button 
                            onClick={() => setShowHistory(false)}
                            className="w-full mt-8 bg-gray-900 dark:bg-white text-white dark:text-gray-900 py-4 rounded-xl font-black text-sm uppercase tracking-widest hover:opacity-90 transition-all"
                        >
                            Close Details
                        </button>
                    </div>
                </div>
            </div>
        )}
    </>
  );
}
