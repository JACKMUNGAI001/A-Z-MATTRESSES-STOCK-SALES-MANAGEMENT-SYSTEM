import React, { useState, useEffect, useContext } from "react";
import api, { API_BASE } from "../api/api";
import { History, Store, FileText, Wallet, Trash2, SearchX, Phone, X, History as HistoryIcon, Clock } from "lucide-react";
import { formatDate } from "../utils/helpers";
import { AuthContext } from "../context/AuthContext";
import { SearchContext } from "../context/SearchContext";

export default function AllDeposits() {
  const [deposits, setDeposits] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedDeposit, setSelectedDeposit] = useState(null);
  const [showHistory, setShowHistory] = useState(false);
  const { user } = useContext(AuthContext);
  const { searchQuery } = useContext(SearchContext);

  useEffect(() => {
    fetchDeposits();
  }, []);

  const fetchDeposits = async () => {
    setLoading(true);
    try {
      const response = await api.get("/deposits");
      setDeposits(response.data);
    } catch (err) {
      console.error("Error fetching deposits");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this deposit record? This will also remove all associated payment history.")) return;
    try {
      await api.delete(`/deposits/${id}`);
      alert("Deposit record deleted successfully");
      fetchDeposits();
    } catch (err) {
      alert(`Error deleting record: ${err.response?.data?.msg || err.message}`);
    }
  };

  const formatCurrency = (val) => {
    return new Intl.NumberFormat('en-KE', { style: 'currency', currency: 'KES', minimumFractionDigits: 0 }).format(val || 0);
  };

  const filteredDeposits = searchQuery 
    ? deposits.filter(deposit => 
        deposit.item_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        deposit.buyer_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (deposit.buyer_phone && deposit.buyer_phone.includes(searchQuery))
      )
    : deposits;

  return (
    <>
        <div className="mb-8 flex items-center gap-3 transition-colors">
          <div className="bg-indigo-600 p-3 rounded-2xl text-white shadow-lg shadow-indigo-200 dark:shadow-none transition-colors">
            <HistoryIcon size={32} />
          </div>
          <div>
            <h1 className="text-3xl font-black text-gray-900 dark:text-white tracking-tight transition-colors">Deposit Ledger</h1>
            <p className="text-gray-500 dark:text-gray-400 font-medium transition-colors">Tracking historical lay-by payments and customer accounts</p>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden transition-colors">
          <div className="bg-indigo-50 dark:bg-indigo-900/30 px-8 py-4 border-b border-indigo-100 dark:border-indigo-900/50 flex justify-between items-center transition-colors">
            <h2 className="text-lg font-bold text-indigo-800 dark:text-indigo-400 flex items-center gap-2 transition-colors">
              <Wallet size={20} className="text-indigo-600 dark:text-indigo-400" />
              Deposit Records {searchQuery && <span className="text-xs font-medium text-indigo-500 bg-indigo-50 dark:bg-indigo-900/30 px-2 py-0.5 rounded-full ml-2 transition-all">Searching: "{searchQuery}"</span>}
            </h2>
            <span className="bg-indigo-100 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-400 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest transition-colors">
              {filteredDeposits.length} {searchQuery ? 'Matching' : 'Total'} Accounts
            </span>
          </div>
          
          <div className="overflow-x-auto max-h-[calc(100vh-300px)] overflow-y-auto custom-scrollbar">
            {loading ? (
              <div className="p-20 text-center text-gray-400 dark:text-gray-500 font-bold uppercase tracking-widest animate-pulse transition-colors">Loading deposit data...</div>
            ) : filteredDeposits.length === 0 ? (
              <div className="p-20 text-center border-t border-gray-100 dark:border-gray-700 transition-colors">
                <SearchX size={48} className="mx-auto text-gray-300 dark:text-gray-600 mb-4 transition-colors" />
                <p className="text-gray-500 dark:text-gray-400 font-bold uppercase tracking-widest text-sm transition-colors">No matches found for "{searchQuery}"</p>
                {searchQuery && <p className="text-xs text-gray-400 mt-2 transition-colors">Try searching for a different product or customer name</p>}
              </div>
            ) : (
              <table className="w-full relative border-collapse">
                <thead className="bg-gray-50/90 dark:bg-gray-900/90 transition-colors sticky top-0 z-10 backdrop-blur-sm">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest border-b border-gray-100 dark:border-gray-700">Customer / Shop</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest border-b border-gray-100 dark:border-gray-700">Item Info</th>
                    <th className="px-6 py-4 text-right text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest border-b border-gray-100 dark:border-gray-700">Financials</th>
                    <th className="px-6 py-4 text-center text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest border-b border-gray-100 dark:border-gray-700">Status</th>
                    <th className="px-6 py-4 text-center text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest border-b border-gray-100 dark:border-gray-700">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50 dark:divide-gray-700 bg-white dark:bg-gray-800 transition-colors">
                  {filteredDeposits.map((deposit) => (
                    <tr key={deposit.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-900/50 transition-colors">
                      <td className="px-6 py-4">
                        <div className={`font-black transition-colors ${searchQuery && deposit.buyer_name.toLowerCase().includes(searchQuery.toLowerCase()) ? 'text-blue-600 dark:text-blue-400' : 'text-gray-900 dark:text-white'}`}>{deposit.buyer_name}</div>
                        <div className="flex items-center gap-1 text-[10px] text-gray-500 font-bold uppercase mt-1">
                          <Phone size={10} className="text-indigo-400" /> {deposit.buyer_phone}
                        </div>
                        <div className="text-[10px] font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-tight mb-1 flex items-center gap-1 transition-colors">
                          <Store size={12} /> {deposit.shop_name}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className={`font-bold text-sm transition-colors ${searchQuery && deposit.item_name.toLowerCase().includes(searchQuery.toLowerCase()) ? 'text-blue-600 dark:text-blue-400' : 'text-gray-700 dark:text-gray-300'}`}>{deposit.item_name}</div>
                        <div className="text-[10px] text-gray-400 dark:text-gray-500 font-medium transition-colors">Reserved: {formatDate(deposit.created_at)}</div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="font-black text-gray-900 dark:text-white transition-colors">{formatCurrency(deposit.total_paid)} <span className="text-[10px] text-gray-400 dark:text-gray-500 font-medium">Paid</span></div>
                        <div className="font-bold text-red-600 dark:text-red-400 text-sm transition-colors">{formatCurrency(deposit.balance)} <span className="text-[10px] font-medium opacity-60">Due</span></div>
                      </td>
                      <td className="px-6 py-4 text-center transition-colors">
                        <span className={`px-2 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border transition-colors ${deposit.status === 'complete' ? 'bg-green-50 dark:bg-green-900/30 text-green-600 dark:text-green-400 border-green-100 dark:border-green-900' : 'bg-orange-50 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 border-orange-100 dark:border-orange-900'}`}>
                          {deposit.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center transition-colors">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => {
                                setSelectedDeposit(deposit);
                                setShowHistory(true);
                            }}
                            className="bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 px-4 py-2 rounded-lg hover:bg-indigo-600 hover:text-white transition-all font-black text-[10px] uppercase tracking-widest border border-indigo-100 dark:border-indigo-800"
                          >
                            VIEW ALL
                          </button>
                          {user?.role === 'admin' && (
                            <button
                              onClick={() => handleDelete(deposit.id)}
                              className="bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 p-2 rounded-lg hover:bg-red-600 hover:text-white transition-all"
                              title="Delete Transaction"
                            >
                              <Trash2 size={16} />
                            </button>
                          )}
                        </div>
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
