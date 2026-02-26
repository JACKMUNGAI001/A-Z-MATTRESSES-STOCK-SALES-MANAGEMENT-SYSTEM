import React, { useEffect, useState } from 'react';
import api, { API_BASE } from '../api/api';
import Sidebar from "../components/Sidebar";
import Header from "../components/Header";
import { FileText, Wallet, Clock, History } from "lucide-react";
import { formatDate } from "../utils/helpers";

export default function WeeksDeposits() {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPayments = async () => {
      try {
        const response = await api.get('/deposits/week');
        setPayments(response.data);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching week's deposits:", error);
        setLoading(false);
      }
    };
    fetchPayments();
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
          <div className="bg-indigo-600 p-3 rounded-2xl text-white shadow-lg shadow-indigo-200">
            <Wallet size={32} />
          </div>
          <div>
            <h1 className="text-3xl font-black text-gray-900 tracking-tight">Weekly Deposit Collections</h1>
            <p className="text-gray-500 font-medium">Tracking all installment payments received this week</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="bg-indigo-50 px-8 py-4 border-b border-indigo-100 flex justify-between items-center">
            <h2 className="text-lg font-bold text-indigo-800 flex items-center gap-2">
              <History size={20} className="text-indigo-600" />
              Weekly Collection Log
            </h2>
            <span className="bg-indigo-100 text-indigo-700 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest">
              {payments.length} Payments
            </span>
          </div>
          
          <div className="overflow-x-auto">
            {loading ? (
              <div className="p-20 text-center text-gray-400 font-bold uppercase tracking-widest animate-pulse">Loading data...</div>
            ) : payments.length === 0 ? (
              <div className="p-20 text-center text-gray-400 italic">No deposit payments recorded for this week.</div>
            ) : (
              <table className="w-full">
                <thead className="bg-gray-50/50">
                  <tr>
                    <th className="px-8 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-widest">Customer / Item</th>
                    <th className="px-8 py-4 text-right text-xs font-bold text-gray-500 uppercase tracking-widest">Amount Paid</th>
                    <th className="px-8 py-4 text-center text-xs font-bold text-gray-500 uppercase tracking-widest">Date</th>
                    <th className="px-8 py-4 text-center text-xs font-bold text-gray-500 uppercase tracking-widest">Receipt</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50 bg-white">
                  {payments.map((p) => (
                    <tr key={p.id} className="hover:bg-indigo-50/50 transition-colors">
                      <td className="px-8 py-4">
                        <div className="font-bold text-gray-900">{p.buyer_name}</div>
                        <div className="text-xs text-gray-400 uppercase font-black">{p.item_name}</div>
                      </td>
                      <td className="px-8 py-4 text-right font-black text-indigo-600 text-lg">{formatCurrency(p.amount)}</td>
                      <td className="px-8 py-4 text-center text-gray-500 font-medium">
                        <div className="font-bold">{formatDate(p.paid_on)}</div>
                        <div className="text-[10px] uppercase font-black">{new Date(p.paid_on).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                      </td>
                      <td className="px-8 py-4 text-center">
                        {p.receipt_uuid && (
                          <a
                            href={`${API_BASE}/receipts/${p.receipt_uuid}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="bg-indigo-50 text-indigo-600 p-2 rounded-lg hover:bg-indigo-600 hover:text-white transition-all inline-flex items-center gap-1 font-bold text-xs"
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
