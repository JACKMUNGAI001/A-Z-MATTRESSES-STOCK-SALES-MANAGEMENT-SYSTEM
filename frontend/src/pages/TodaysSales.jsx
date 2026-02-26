import React, { useEffect, useState } from 'react';
import api, { API_BASE } from '../api/api';
import Sidebar from "../components/Sidebar";
import Header from "../components/Header";
import { FileText, Calendar, Clock, CreditCard, Receipt } from "lucide-react";

export default function TodaysSales() {
  const [sales, setSales] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSales = async () => {
      try {
        const response = await api.get('/sales/today');
        setSales(response.data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching today\'s sales:', error);
        setLoading(false);
      }
    };
    fetchSales();
  }, []);

  const formatCurrency = (val) => {
    return new Intl.NumberFormat('en-KE', { style: 'currency', currency: 'KES', minimumFractionDigits: 0 }).format(val || 0);
  };

  return (
    <div className="flex bg-[#f1f5f9] min-h-screen">
      <Sidebar />
      <main className="flex-1 p-8 max-w-7xl mx-auto w-full">
        <Header />

        <div className="mb-8 flex items-center gap-3">
          <div className="bg-blue-600 p-3 rounded-2xl text-white shadow-lg shadow-blue-200">
            <Calendar size={32} />
          </div>
          <div>
            <h1 className="text-3xl font-black text-gray-900 tracking-tight">Today's Transactions</h1>
            <p className="text-gray-500 font-medium">Overview of all sales recorded today</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="bg-gray-50 px-8 py-4 border-b border-gray-100 flex justify-between items-center">
            <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
              <Receipt size={20} className="text-blue-600" />
              Sales Record
            </h2>
            <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest">
              {sales.length} Transactions
            </span>
          </div>
          
          <div className="overflow-x-auto">
            {loading ? (
              <div className="p-20 text-center text-gray-400 font-bold uppercase tracking-widest animate-pulse">Loading data...</div>
            ) : sales.length === 0 ? (
              <div className="p-20 text-center text-gray-400 italic">No sales have been recorded yet today.</div>
            ) : (
              <table className="w-full">
                <thead className="bg-gray-50/50">
                  <tr>
                    <th className="px-8 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-widest">ID</th>
                    <th className="px-8 py-4 text-right text-xs font-bold text-gray-500 uppercase tracking-widest">Total Amount</th>
                    <th className="px-8 py-4 text-center text-xs font-bold text-gray-500 uppercase tracking-widest">Payment</th>
                    <th className="px-8 py-4 text-center text-xs font-bold text-gray-500 uppercase tracking-widest">Time</th>
                    <th className="px-8 py-4 text-center text-xs font-bold text-gray-500 uppercase tracking-widest">Receipt</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50 bg-white">
                  {sales.map((sale) => (
                    <tr key={sale.id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-8 py-4 font-bold text-gray-400">#{sale.id}</td>
                      <td className="px-8 py-4 text-right font-black text-gray-900 text-lg">{formatCurrency(sale.total_amount)}</td>
                      <td className="px-8 py-4 text-center">
                        <span className="bg-gray-100 text-gray-600 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border border-gray-200">
                          {sale.payment_type}
                        </span>
                      </td>
                      <td className="px-8 py-4 text-center text-gray-500 font-medium">
                        <div className="flex items-center justify-center gap-1">
                          <Clock size={14} />
                          {new Date(sale.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </div>
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
