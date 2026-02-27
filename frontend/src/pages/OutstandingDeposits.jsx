import React, { useState, useEffect } from "react";
import api, { API_BASE } from "../api/api";
import { History, User, Store, FileText, Wallet, AlertCircle } from "lucide-react";

export default function OutstandingDeposits() {
  const [deposits, setDeposits] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchDeposits();
  }, []);

  const fetchDeposits = async () => {
    setLoading(true);
    try {
      const response = await api.get("/deposits/customers");
      setDeposits(response.data);
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
          
          <div className="overflow-x-auto">
            {loading ? (
              <div className="p-20 text-center text-gray-400 dark:text-gray-500 font-bold uppercase tracking-widest animate-pulse transition-colors">Scanning accounts...</div>
            ) : deposits.length === 0 ? (
              <div className="p-20 text-center text-green-600 dark:text-green-400 font-medium italic transition-colors">No outstanding balances found. All accounts are settled!</div>
            ) : (
              <table className="w-full">
                <thead className="bg-gray-50/50 dark:bg-gray-900/50 transition-colors">
                  <tr>
                    <th className="px-8 py-4 text-left text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest">Customer / Contact</th>
                    <th className="px-8 py-4 text-left text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest">Item Info</th>
                    <th className="px-8 py-4 text-left text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest">Shop</th>
                    <th className="px-8 py-4 text-right text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest">Amount Due</th>
                    <th className="px-8 py-4 text-center text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest">Receipts</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50 dark:divide-gray-700 bg-white dark:bg-gray-800 transition-colors">
                  {deposits.map((deposit) => (
                    <tr key={deposit.id} className="hover:bg-red-50/10 dark:hover:bg-red-900/10 transition-colors">
                      <td className="px-8 py-4">
                        <div className="font-black text-gray-900 dark:text-white transition-colors">{deposit.buyer_name}</div>
                        <div className="text-xs text-gray-500 dark:text-gray-400 font-medium transition-colors">{deposit.buyer_phone}</div>
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
                        <div className="text-xs text-gray-400 dark:text-gray-500 transition-colors">Total Price: {formatCurrency(deposit.selling_price)}</div>
                        <div className="font-black text-red-600 dark:text-red-400 text-lg transition-colors">{formatCurrency(deposit.balance)}</div>
                      </td>
                      <td className="px-8 py-4 text-center transition-colors">
                        <a
                          href={`${API_BASE}/receipts/deposit/${deposit.id}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="bg-gray-50 dark:bg-gray-700 text-gray-600 dark:text-gray-300 p-2 rounded-lg hover:bg-gray-900 hover:text-white transition-all inline-flex items-center gap-1 font-bold text-xs"
                        >
                          <FileText size={16} /> VIEW ALL
                        </a>
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
