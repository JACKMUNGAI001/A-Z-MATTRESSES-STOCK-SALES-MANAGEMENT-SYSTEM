import React, { useEffect, useState } from 'react';
import api from '../api/api';
import Sidebar from "../components/Sidebar";
import Header from "../components/Header";
import { Users, Phone, Package, Wallet, ArrowRight } from "lucide-react";

export default function DepositCustomers() {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        const response = await api.get('/deposits/customers');
        setCustomers(response.data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching deposit customers:', error);
        setLoading(false);
      }
    };
    fetchCustomers();
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
            <Users size={32} />
          </div>
          <div>
            <h1 className="text-3xl font-black text-gray-900 tracking-tight">Lay-by Customers</h1>
            <p className="text-gray-500 font-medium">Tracking clients with active deposit balances</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="bg-indigo-50 px-8 py-4 border-b border-indigo-100 flex justify-between items-center">
            <h2 className="text-lg font-bold text-indigo-800 flex items-center gap-2">
              <Wallet size={20} />
              Active Balances
            </h2>
            <span className="bg-indigo-200 text-indigo-900 px-3 py-1 rounded-full text-xs font-black uppercase tracking-widest">
              {customers.length} Accounts
            </span>
          </div>
          
          <div className="overflow-x-auto">
            {loading ? (
              <div className="p-20 text-center text-gray-400 font-bold uppercase tracking-widest animate-pulse">Loading accounts...</div>
            ) : customers.length === 0 ? (
              <div className="p-20 text-center text-gray-400 italic font-medium">No active deposit customers found.</div>
            ) : (
              <table className="w-full">
                <thead className="bg-gray-50/50">
                  <tr>
                    <th className="px-8 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-widest">Customer</th>
                    <th className="px-8 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-widest">Item Reserved</th>
                    <th className="px-8 py-4 text-right text-xs font-bold text-gray-500 uppercase tracking-widest">Paid to Date</th>
                    <th className="px-8 py-4 text-right text-xs font-bold text-gray-500 uppercase tracking-widest">Balance Due</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50 bg-white">
                  {customers.map((customer) => (
                    <tr key={customer.id} className="hover:bg-indigo-50/10 transition-colors">
                      <td className="px-8 py-4">
                        <div className="font-black text-gray-900">{customer.buyer_name}</div>
                        <div className="flex items-center gap-1 text-xs text-gray-500 mt-1 font-medium">
                          <Phone size={12} className="text-indigo-400" /> {customer.buyer_phone}
                        </div>
                      </td>
                      <td className="px-8 py-4">
                        <div className="flex items-center gap-2 font-bold text-gray-700">
                          <Package size={16} className="text-gray-300" />
                          {customer.item_name}
                        </div>
                      </td>
                      <td className="px-8 py-4 text-right font-bold text-green-600">
                        {formatCurrency(customer.total_paid)}
                      </td>
                      <td className="px-8 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <span className="font-black text-red-600 text-lg">{formatCurrency(customer.balance)}</span>
                          <ArrowRight size={16} className="text-gray-200" />
                        </div>
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
