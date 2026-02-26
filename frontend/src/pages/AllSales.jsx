import React, { useState, useEffect } from "react";
import api, { API_BASE } from "../api/api";
import Sidebar from "../components/Sidebar";
import Header from "../components/Header";
import { History, ShoppingBag, Store, User, FileText } from "lucide-react";
import { formatDate } from "../utils/helpers";

export default function AllSales() {
  const [sales, setSales] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchSales();
  }, []);

  const fetchSales = async () => {
    setLoading(true);
    try {
      const response = await api.get("/sales/all");
      setSales(response.data);
    } catch (err) {
      console.error("Error fetching sales");
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
          <div className="bg-blue-600 p-3 rounded-2xl text-white shadow-lg shadow-blue-200">
            <History size={32} />
          </div>
          <div>
            <h1 className="text-3xl font-black text-gray-900 tracking-tight">Sales Ledger</h1>
            <p className="text-gray-500 font-medium">Complete historical record of all transactions across all branches</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="bg-gray-50 px-8 py-4 border-b border-gray-100 flex justify-between items-center">
            <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
              <ShoppingBag size={20} className="text-blue-600" />
              Transaction History
            </h2>
            <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest">
              {sales.length} Total Records
            </span>
          </div>
          
          <div className="overflow-x-auto">
            {loading ? (
              <div className="p-20 text-center text-gray-400 font-bold uppercase tracking-widest animate-pulse">Retrieving sales data...</div>
            ) : (
              <table className="w-full">
                <thead className="bg-gray-50/50">
                  <tr>
                    <th className="px-8 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-widest">Date & Time</th>
                    <th className="px-8 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-widest">Shop / Attendant</th>
                    <th className="px-8 py-4 text-right text-xs font-bold text-gray-500 uppercase tracking-widest">Amount</th>
                    <th className="px-8 py-4 text-center text-xs font-bold text-gray-500 uppercase tracking-widest">Receipt</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50 bg-white">
                  {sales.map((sale) => (
                    <tr key={sale.id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-8 py-4">
                        <div className="font-bold text-gray-900">{formatDate(sale.created_at)}</div>
                        <div className="text-[10px] text-gray-400 font-black uppercase tracking-widest">{new Date(sale.created_at).toLocaleTimeString()}</div>
                      </td>
                      <td className="px-8 py-4">
                        <div className="flex items-center gap-1 font-black text-xs text-blue-600 uppercase tracking-tight mb-1">
                          <Store size={14} /> {sale.shop_name}
                        </div>
                        <div className="flex items-center gap-1 text-gray-500 text-sm">
                          <User size={14} /> {sale.attendant_name}
                        </div>
                      </td>
                      <td className="px-8 py-4 text-right">
                        <div className="font-black text-gray-900 text-lg">{formatCurrency(sale.total_amount)}</div>
                        <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{sale.payment_type}</div>
                      </td>
                      <td className="px-8 py-4 text-center">
                        {sale.receipt_uuid && (
                          <a
                            href={`${API_BASE}/receipts/${sale.receipt_uuid}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="bg-blue-50 text-blue-600 p-2 rounded-lg hover:bg-blue-600 hover:text-white transition-all inline-flex items-center gap-1 font-bold text-xs"
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
      </main>
    </div>
  );
}
