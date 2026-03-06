import React, { useState, useEffect } from "react";
import api, { API_BASE } from "../api/api";
import { History as HistoryIcon, User, Store, FileText, Wallet, AlertCircle, Phone, X, Clock } from "lucide-react";
import { formatDate } from "../utils/helpers";

export default function OutstandingDeposits() {
  const [deposits, setDeposits] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedDeposit, setSelectedDeposit] = useState(null);
  const [showHistory, setShowHistory] = useState(false);

  useEffect(() => {
    fetchDeposits();
  }, []);

  const fetchDeposits = async () => {
    setLoading(true);
    try {
      // Use the main /deposits endpoint because it returns full _serialize_deposit with payments array
      const response = await api.get("/deposits");
      // Filter for active ones (outstanding)
      setDeposits(response.data.filter(d => d.status === 'active'));
    } catch (err) {
      console.error("Error fetching outstanding deposits");
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (val) => {
    return new Intl.NumberFormat('en-KE', { style: 'currency', currency: 'KES', minimumFractionDigits: 0 }).format(val || 0);
  };

  return (
    <>
        <div className="mb-8 flex items-center gap-3 transition-colors">
          <div className="bg-red-600 p-3 rounded-2xl text-white shadow-lg shadow-red-200 dark:shadow-none transition-colors">
            <AlertCircle size={32} />
          </div>
          <div>
            <h1 className="text-3xl font-black text-gray-900 dark:text-white tracking-tight transition-colors">Outstanding Balances</h1>
            <p className="text-gray-500 dark:text-gray-400 font-medium transition-colors">Monitoring active lay-by accounts with pending payments</p>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden transition-colors">
          <div className="bg-red-50 dark:bg-red-900/30 px-8 py-4 border-b border-red-100 dark:border-red-900/50 flex justify-between items-center transition-colors">
            <h2 className="text-lg font-bold text-red-800 dark:text-red-400 flex items-center gap-2 transition-colors">
              <Wallet size={20} className="text-red-600 dark:text-red-400" />
              Active Collections
            </h2>
            <span className="bg-red-100 dark:bg-red-900/50 text-red-700 dark:text-red-400 px-3 py-1 rounded-full text-xs font-black uppercase tracking-widest transition-colors">
              {deposits.length} Pending
            </span>
          </div>
          
          <div className="overflow-x-auto max-h-[calc(100vh-300px)] overflow-y-auto custom-scrollbar">
            {loading ? (
              <div className="p-20 text-center text-gray-400 dark:text-gray-500 font-bold uppercase tracking-widest animate-pulse transition-colors">Scanning accounts...</div>
            ) : deposits.length === 0 ? (
              <div className="p-20 text-center text-green-600 dark:text-green-400 font-medium italic transition-colors">No outstanding balances found. All accounts are settled!</div>
            ) : (
              <table className="w-full relative border-collapse">
                <thead className="bg-gray-50/50 dark:bg-gray-900/50 transition-colors sticky top-0 z-10 backdrop-blur-sm">
                  <tr>
                    <th className="px-8 py-4 text-left text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest border-b border-gray-100 dark:border-gray-700">Customer / Contact</th>
                    <th className="px-8 py-4 text-left text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest border-b border-gray-100 dark:border-gray-700">Item Info</th>
                    <th className="px-8 py-4 text-left text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest border-b border-gray-100 dark:border-gray-700">Shop</th>
                    <th className="px-8 py-4 text-right text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest border-b border-gray-100 dark:border-gray-700">Amount Due</th>
                    <th className="px-8 py-4 text-center text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest border-b border-gray-100 dark:border-gray-700">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50 dark:divide-gray-700 bg-white dark:bg-gray-800 transition-colors">
                  {deposits.map((deposit) => (
                    <tr key={deposit.id} className="hover:bg-red-50/10 dark:hover:bg-red-900/10 transition-colors">
                      <td className="px-8 py-4">
                        <div className="font-black text-gray-900 dark:text-white transition-colors">{deposit.buyer_name}</div>
                        <div className="flex items-center gap-1 text-[10px] text-gray-500 font-bold uppercase mt-1 transition-colors">
                          <Phone size={10} className="text-red-400" /> {deposit.buyer_phone}
                        </div>
                      </td>
                      <td className="px-8 py-4">
                        <div className="font-bold text-gray-700 dark:text-gray-300 text-sm transition-colors">{deposit.item_name}</div>
                      </td>
                      <td className="px-8 py-4">
                        <div className="text-[10px] font-black text-blue-600 dark:text-blue-400 uppercase tracking-tight flex items-center gap-1 transition-colors">
                          <Store size={12} /> {deposit.shop_name}
                        </div>
                      </td>
                      <td className="px-8 py-4 text-right">
                        <div className="text-[10px] text-gray-400 dark:text-gray-500 font-bold transition-colors uppercase">Total Price: {formatCurrency(deposit.selling_price)}</div>
                        <div className="font-black text-red-600 dark:text-red-400 text-lg transition-colors">{formatCurrency(deposit.balance)}</div>
                      </td>
                      <td className="px-8 py-4 text-center transition-colors">
                        <button
                          onClick={() => {
                            setSelectedDeposit(deposit);
                            setShowHistory(true);
                          }}
                          className="bg-gray-50 dark:bg-gray-700 text-gray-600 dark:text-gray-300 px-4 py-2 rounded-lg hover:bg-gray-900 hover:text-white transition-all inline-flex items-center gap-1 font-bold text-[10px] uppercase tracking-widest border border-gray-200 dark:border-gray-600"
                        >
                          <HistoryIcon size={14} /> VIEW ALL
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* HISTORY MODAL */}
        {showHistory && selectedDeposit && (
            <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden animate-in fade-in zoom-in duration-200 transition-colors">
                    <div className="bg-red-600 p-6 text-white flex justify-between items-center transition-colors">
                        <div>
                            <h3 className="text-xl font-bold flex items-center gap-2">
                                <HistoryIcon size={24} /> Payment History
                            </h3>
                            <p className="text-red-100 text-sm mt-1 font-medium">{selectedDeposit.buyer_name} - {selectedDeposit.item_name}</p>
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
                                    {selectedDeposit.payments && selectedDeposit.payments.map((pay, i) => (
                                        <tr key={i} className="hover:bg-gray-50 dark:hover:bg-gray-900/30 transition-colors">
                                            <td className="px-4 py-3 text-gray-600 dark:text-gray-400 font-medium transition-colors">
                                                <div>{formatDate(pay.paid_on)}</div>
                                                <div className="text-[10px] flex items-center gap-1 opacity-60"><Clock size={10} /> {new Date(pay.paid_on).toLocaleTimeString()}</div>
                                            </td>
                                            <td className="px-4 py-3 text-right font-black text-gray-900 dark:text-white transition-colors">{formatCurrency(pay.amount)}</td>
                                            <td className="px-4 py-3 text-center transition-colors">
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
