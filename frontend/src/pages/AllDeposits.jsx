import React, { useState, useEffect } from "react";
import api, { API_BASE } from "../api/api";
import Sidebar from "../components/Sidebar";
import Header from "../components/Header";
import { History, User, Store, FileText, Wallet } from "lucide-react";
import { formatDate } from "../utils/helpers";

export default function AllDeposits() {
  const [deposits, setDeposits] = useState([]);
  const [loading, setLoading] = useState(false);

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

  const formatCurrency = (val) => {
    return new Intl.NumberFormat('en-KE', { style: 'currency', currency: 'KES', minimumFractionDigits: 0 }).format(val || 0);
  };

  return (
    <div className="flex bg-[#f1f5f9] min-h-screen">
      <Sidebar role="admin" />
      <main className="flex-1 p-8 max-w-7xl mx-auto w-full">
        <Header />

        <div className="mb-8 flex items-center gap-3">
          <div className="bg-indigo-600 p-3 rounded-2xl text-white shadow-lg shadow-indigo-200">
            <History size={32} />
          </div>
          <div>
            <h1 className="text-3xl font-black text-gray-900 tracking-tight">Deposit Ledger</h1>
            <p className="text-gray-500 font-medium">Tracking historical lay-by payments and customer accounts</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="bg-indigo-50 px-8 py-4 border-b border-indigo-100 flex justify-between items-center">
            <h2 className="text-lg font-bold text-indigo-800 flex items-center gap-2">
              <Wallet size={20} className="text-indigo-600" />
              Deposit Records
            </h2>
            <span className="bg-indigo-100 text-indigo-700 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest">
              {deposits.length} Total Accounts
            </span>
          </div>
          
          <div className="overflow-x-auto">
            {loading ? (
              <div className="p-20 text-center text-gray-400 font-bold uppercase tracking-widest animate-pulse">Loading deposit data...</div>
            ) : (
              <table className="w-full">
                <thead className="bg-gray-50/50">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-widest">Customer / Shop</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-widest">Item Info</th>
                    <th className="px-6 py-4 text-right text-xs font-bold text-gray-500 uppercase tracking-widest">Financials</th>
                    <th className="px-6 py-4 text-center text-xs font-bold text-gray-500 uppercase tracking-widest">Status</th>
                    <th className="px-6 py-4 text-center text-xs font-bold text-gray-500 uppercase tracking-widest">Receipts</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50 bg-white">
                  {deposits.map((deposit) => (
                    <tr key={deposit.id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="font-black text-gray-900">{deposit.buyer_name}</div>
                        <div className="text-[10px] font-black text-indigo-600 uppercase tracking-tight mb-1 flex items-center gap-1">
                          <Store size={12} /> {deposit.shop_name}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="font-bold text-gray-700 text-sm">{deposit.item_name}</div>
                        <div className="text-xs text-gray-400">Date: {formatDate(deposit.created_at)}</div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="font-black text-gray-900">{formatCurrency(deposit.total_paid)} <span className="text-[10px] text-gray-400 font-medium">Paid</span></div>
                        <div className="font-bold text-red-600 text-sm">{formatCurrency(deposit.balance)} <span className="text-[10px] font-medium opacity-60">Due</span></div>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className={`px-2 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${deposit.status === 'complete' ? 'bg-green-50 text-green-600 border-green-100' : 'bg-orange-50 text-orange-600 border-orange-100'}`}>
                          {deposit.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <a
                          href={`${API_BASE}/receipts/deposit/${deposit.id}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="bg-indigo-50 text-indigo-600 p-2 rounded-lg hover:bg-indigo-600 hover:text-white transition-all inline-flex items-center gap-1 font-bold text-xs"
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
      </main>
    </div>
  );
}
