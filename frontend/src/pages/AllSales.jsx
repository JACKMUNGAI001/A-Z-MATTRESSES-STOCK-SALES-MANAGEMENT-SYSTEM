import React, { useState, useEffect, useContext } from "react";
import api, { API_BASE } from "../api/api";
import { History, ShoppingBag, Store, User, FileText, Trash2 } from "lucide-react";
import { formatDate } from "../utils/helpers";
import { AuthContext } from "../context/AuthContext";

export default function AllSales() {
  const [sales, setSales] = useState([]);
  const [loading, setLoading] = useState(false);
  const { user } = useContext(AuthContext);

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

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this sale record? Inventory levels for the items in this sale will be reverted.")) return;
    try {
      await api.delete(`/sales/${id}`);
      alert("Sale record deleted and stock reverted successfully");
      fetchSales();
    } catch (err) {
      alert(`Error deleting record: ${err.response?.data?.msg || err.message}`);
    }
  };

  const formatCurrency = (val) => {
    return new Intl.NumberFormat('en-KE', { style: 'currency', currency: 'KES', minimumFractionDigits: 0 }).format(val || 0);
  };

  return (
    <>
        <div className="mb-8 flex items-center gap-3">
          <div className="bg-blue-600 p-3 rounded-2xl text-white shadow-lg shadow-blue-200">
            <History size={32} />
          </div>
          <div>
            <h1 className="text-3xl font-black text-gray-900 dark:text-white tracking-tight transition-colors">Sales Ledger</h1>
            <p className="text-gray-500 dark:text-gray-400 font-medium transition-colors">Complete historical record of all transactions across all branches</p>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden transition-colors">
          <div className="bg-gray-50 dark:bg-gray-900/50 px-8 py-4 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center transition-colors">
            <h2 className="text-lg font-bold text-gray-800 dark:text-white flex items-center gap-2">
              <ShoppingBag size={20} className="text-blue-600 dark:text-blue-400" />
              Transaction History
            </h2>
            <span className="bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-400 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest">
              {sales.length} Total Records
            </span>
          </div>
          
          <div className="overflow-x-auto">
            {loading ? (
              <div className="p-20 text-center text-gray-400 dark:text-gray-500 font-bold uppercase tracking-widest animate-pulse">Retrieving sales data...</div>
            ) : (
              <table className="w-full">
                <thead className="bg-gray-50/50 dark:bg-gray-900/50">
                  <tr>
                    <th className="px-8 py-4 text-left text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest">Date & Time</th>
                    <th className="px-8 py-4 text-left text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest">Shop / Attendant</th>
                    <th className="px-8 py-4 text-left text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest">Items Sold</th>
                    <th className="px-8 py-4 text-right text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest">Amount</th>
                    <th className="px-8 py-4 text-center text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50 dark:divide-gray-700 bg-white dark:bg-gray-800">
                  {sales.map((sale) => (
                    <tr key={sale.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-900/50 transition-colors">
                      <td className="px-8 py-4">
                        <div className="font-bold text-gray-900 dark:text-white transition-colors">{formatDate(sale.created_at)}</div>
                        <div className="text-[10px] text-gray-400 dark:text-gray-500 font-black uppercase tracking-widest">{new Date(sale.created_at).toLocaleTimeString()}</div>
                      </td>
                      <td className="px-8 py-4">
                        <div className="flex items-center gap-1 font-black text-xs text-blue-600 dark:text-blue-400 uppercase tracking-tight mb-1">
                          <Store size={14} /> {sale.shop_name}
                        </div>
                        <div className="flex items-center gap-1 text-gray-500 dark:text-gray-400 text-sm">
                          <User size={14} /> {sale.attendant_name}
                        </div>
                      </td>
                      <td className="px-8 py-4">
                        <div className="flex flex-wrap gap-1 max-w-md">
                          {sale.items?.map((item, idx) => (
                            <span key={idx} className="bg-gray-100 dark:bg-gray-700/50 text-gray-700 dark:text-gray-300 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-tight">
                              {item.item_name} (x{item.qty})
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="px-8 py-4 text-right">
                        <div className="font-black text-gray-900 dark:text-white text-lg transition-colors">{formatCurrency(sale.total_amount)}</div>
                        <div className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest">{sale.payment_type}</div>
                      </td>
                      <td className="px-8 py-4 text-center transition-colors">
                        <div className="flex items-center justify-center gap-2">
                          {sale.receipt_uuid && (
                            <a
                              href={`${API_BASE}/receipts/${sale.receipt_uuid}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 p-2 rounded-lg hover:bg-blue-600 hover:text-white transition-all inline-flex items-center gap-1 font-bold text-xs"
                            >
                              <FileText size={16} /> VIEW
                            </a>
                          )}
                          {user?.role === 'admin' && (
                            <button
                              onClick={() => handleDelete(sale.id)}
                              className="bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 p-2 rounded-lg hover:bg-red-600 hover:text-white transition-all"
                              title="Delete Sale"
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
