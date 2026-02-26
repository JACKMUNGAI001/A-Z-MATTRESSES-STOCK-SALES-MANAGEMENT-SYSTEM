import React, { useState, useEffect } from "react";
import api, { API_BASE } from "../api/api";
import Sidebar from "../components/Sidebar";
import Header from "../components/Header";
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
    <div className="flex bg-[#f1f5f9] min-h-screen">
      <Sidebar role="admin" />
      <main className="flex-1 p-8 max-w-7xl mx-auto w-full">
        <Header />

        <div className="mb-8 flex items-center gap-3">
          <div className="bg-red-600 p-3 rounded-2xl text-white shadow-lg shadow-red-200">
            <AlertCircle size={32} />
          </div>
          <div>
            <h1 className="text-3xl font-black text-gray-900 tracking-tight">Outstanding Balances</h1>
            <p className="text-gray-500 font-medium">Monitoring active lay-by accounts with pending payments</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="bg-red-50 px-8 py-4 border-b border-red-100 flex justify-between items-center">
            <h2 className="text-lg font-bold text-red-800 flex items-center gap-2">
              <Wallet size={20} className="text-red-600" />
              Active Collections
            </h2>
            <span className="bg-red-100 text-red-700 px-3 py-1 rounded-full text-xs font-black uppercase tracking-widest">
              {deposits.length} Pending
            </span>
          </div>
          
          <div className="overflow-x-auto">
            {loading ? (
              <div className="p-20 text-center text-gray-400 font-bold uppercase tracking-widest animate-pulse">Scanning accounts...</div>
            ) : deposits.length === 0 ? (
              <div className="p-20 text-center text-green-600 font-medium italic">No outstanding balances found. All accounts are settled!</div>
            ) : (
              <table className="w-full">
                <thead className="bg-gray-50/50">
                  <tr>
                    <th className="px-8 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-widest">Customer / Contact</th>
                    <th className="px-8 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-widest">Item / Shop</th>
                    <th className="px-8 py-4 text-right text-xs font-bold text-gray-500 uppercase tracking-widest">Amount Due</th>
                    <th className="px-8 py-4 text-center text-xs font-bold text-gray-500 uppercase tracking-widest">Receipts</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50 bg-white">
                  {deposits.map((deposit) => (
                    <tr key={deposit.id} className="hover:bg-red-50/10 transition-colors">
                      <td className="px-8 py-4">
                        <div className="font-black text-gray-900">{deposit.buyer_name}</div>
                        <div className="text-xs text-gray-500 font-medium">{deposit.buyer_phone}</div>
                      </td>
                      <td className="px-8 py-4">
                        <div className="font-bold text-gray-700 text-sm">{deposit.item_name}</div>
                        <div className="text-[10px] font-black text-blue-600 uppercase tracking-tight flex items-center gap-1">
                          <Store size={12} /> {deposit.shop_name}
                        </div>
                      </td>
                      <td className="px-8 py-4 text-right">
                        <div className="text-xs text-gray-400">Total Price: {formatCurrency(deposit.selling_price)}</div>
                        <div className="font-black text-red-600 text-lg">{formatCurrency(deposit.balance)}</div>
                      </td>
                      <td className="px-8 py-4 text-center">
                        <a
                          href={`${API_BASE}/receipts/deposit/${deposit.id}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="bg-gray-50 text-gray-600 p-2 rounded-lg hover:bg-gray-900 hover:text-white transition-all inline-flex items-center gap-1 font-bold text-xs"
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
