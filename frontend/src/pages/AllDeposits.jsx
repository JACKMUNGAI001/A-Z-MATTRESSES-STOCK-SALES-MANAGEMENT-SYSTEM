import React, { useState, useEffect, useContext } from "react";
import api, { API_BASE } from "../api/api";
import { History, Store, FileText, Wallet, Trash2, SearchX } from "lucide-react";
import { formatDate } from "../utils/helpers";
import { AuthContext } from "../context/AuthContext";
import { SearchContext } from "../context/SearchContext";

export default function AllDeposits() {
  const [deposits, setDeposits] = useState([]);
  const [loading, setLoading] = useState(false);
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
        deposit.buyer_name.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : deposits;

  return (
    <>
        <div className="mb-8 flex items-center gap-3 transition-colors">
          <div className="bg-indigo-600 p-3 rounded-2xl text-white shadow-lg shadow-indigo-200 dark:shadow-none transition-colors">
            <History size={32} />
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
          
          <div className="overflow-x-auto">
            {loading ? (
              <div className="p-20 text-center text-gray-400 dark:text-gray-500 font-bold uppercase tracking-widest animate-pulse transition-colors">Loading deposit data...</div>
            ) : filteredDeposits.length === 0 ? (
              <div className="p-20 text-center border-t border-gray-100 dark:border-gray-700 transition-colors">
                <SearchX size={48} className="mx-auto text-gray-300 dark:text-gray-600 mb-4 transition-colors" />
                <p className="text-gray-500 dark:text-gray-400 font-bold uppercase tracking-widest text-sm transition-colors">No matches found for "{searchQuery}"</p>
                {searchQuery && <p className="text-xs text-gray-400 mt-2 transition-colors">Try searching for a different product or customer name</p>}
              </div>
            ) : (
              <table className="w-full">
                <thead className="bg-gray-50/50 dark:bg-gray-900/50 transition-colors">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest">Customer / Shop</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest">Item Info</th>
                    <th className="px-6 py-4 text-right text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest">Financials</th>
                    <th className="px-6 py-4 text-center text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest">Status</th>
                    <th className="px-6 py-4 text-center text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50 dark:divide-gray-700 bg-white dark:bg-gray-800 transition-colors">
                  {filteredDeposits.map((deposit) => (
                    <tr key={deposit.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-900/50 transition-colors">
                      <td className="px-6 py-4">
                        <div className={`font-black transition-colors ${searchQuery && deposit.buyer_name.toLowerCase().includes(searchQuery.toLowerCase()) ? 'text-blue-600 dark:text-blue-400' : 'text-gray-900 dark:text-white'}`}>{deposit.buyer_name}</div>
                        <div className="text-[10px] font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-tight mb-1 flex items-center gap-1 transition-colors">
                          <Store size={12} /> {deposit.shop_name}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className={`font-bold text-sm transition-colors ${searchQuery && deposit.item_name.toLowerCase().includes(searchQuery.toLowerCase()) ? 'text-blue-600 dark:text-blue-400' : 'text-gray-700 dark:text-gray-300'}`}>{deposit.item_name}</div>
                        <div className="text-xs text-gray-400 dark:text-gray-500 transition-colors">Date: {formatDate(deposit.created_at)}</div>
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
                          <a
                            href={`${API_BASE}/receipts/deposit/${deposit.id}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 p-2 rounded-lg hover:bg-indigo-600 hover:text-white transition-all inline-flex items-center gap-1 font-bold text-xs"
                          >
                            <FileText size={16} /> VIEW
                          </a>
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
    </>
  );
}
