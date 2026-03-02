import React, { useEffect, useState, useContext } from 'react';
import api from '../api/api';
import { Users, Phone, Package, Wallet, ArrowRight, SearchX } from "lucide-react";
import { SearchContext } from '../context/SearchContext';

export default function DepositCustomers() {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const { searchQuery } = useContext(SearchContext);

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

  const filteredCustomers = searchQuery 
    ? customers.filter(customer => 
        customer.buyer_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        customer.item_name.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : customers;

  return (
    <>
        <div className="mb-8 flex items-center gap-3 transition-colors">
          <div className="bg-indigo-600 p-3 rounded-2xl text-white shadow-lg shadow-indigo-200 dark:shadow-none transition-colors">
            <Users size={32} />
          </div>
          <div>
            <h1 className="text-3xl font-black text-gray-900 dark:text-white tracking-tight transition-colors">Lay-by Customers</h1>
            <p className="text-gray-500 dark:text-gray-400 font-medium transition-colors">Tracking clients with active deposit balances</p>
            {searchQuery && <p className="text-sm text-indigo-600 font-bold mt-1 transition-all">Searching for: "{searchQuery}"</p>}
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden transition-colors">
          <div className="bg-indigo-50 dark:bg-indigo-900/30 px-8 py-4 border-b border-indigo-100 dark:border-indigo-900/50 flex justify-between items-center transition-colors">
            <h2 className="text-lg font-bold text-indigo-800 dark:text-indigo-400 flex items-center gap-2 transition-colors">
              <Wallet size={20} />
              Active Balances
            </h2>
            <span className="bg-indigo-200 dark:bg-indigo-900/50 text-indigo-900 dark:text-indigo-400 px-3 py-1 rounded-full text-xs font-black uppercase tracking-widest transition-colors">
              {filteredCustomers.length} {searchQuery ? 'Matching' : ''} Accounts
            </span>
          </div>
          
          <div className="overflow-x-auto">
            {loading ? (
              <div className="p-20 text-center text-gray-400 dark:text-gray-500 font-bold uppercase tracking-widest animate-pulse transition-colors">Loading accounts...</div>
            ) : filteredCustomers.length === 0 ? (
              <div className="p-20 text-center transition-colors">
                <SearchX size={48} className="mx-auto text-gray-300 dark:text-gray-600 mb-4 transition-colors" />
                <p className="text-gray-500 dark:text-gray-400 font-bold uppercase tracking-widest text-sm transition-colors">{searchQuery ? `No active accounts match "${searchQuery}"` : 'No active deposit customers found.'}</p>
              </div>
            ) : (
              <table className="w-full">
                <thead className="bg-gray-50/50 dark:bg-gray-900/50 transition-colors">
                  <tr>
                    <th className="px-8 py-4 text-left text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest">Customer</th>
                    <th className="px-8 py-4 text-left text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest">Item Reserved</th>
                    <th className="px-8 py-4 text-right text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest">Paid to Date</th>
                    <th className="px-8 py-4 text-right text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest">Balance Due</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50 dark:divide-gray-700 bg-white dark:bg-gray-800 transition-colors">
                  {filteredCustomers.map((customer) => {
                    const isBuyerMatch = searchQuery && customer.buyer_name.toLowerCase().includes(searchQuery.toLowerCase());
                    const isItemMatch = searchQuery && customer.item_name.toLowerCase().includes(searchQuery.toLowerCase());
                    return (
                      <tr key={customer.id} className="hover:bg-indigo-50/10 dark:hover:bg-indigo-900/10 transition-colors">
                        <td className="px-8 py-4">
                          <div className={`font-black transition-colors ${isBuyerMatch ? 'text-indigo-600 dark:text-indigo-400' : 'text-gray-900 dark:text-white'}`}>{customer.buyer_name}</div>
                          <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400 mt-1 font-medium transition-colors">
                            <Phone size={12} className="text-indigo-400 dark:text-indigo-500" /> {customer.buyer_phone}
                          </div>
                        </td>
                        <td className="px-8 py-4">
                          <div className={`flex items-center gap-2 font-bold transition-colors ${isItemMatch ? 'text-indigo-600 dark:text-indigo-400' : 'text-gray-700 dark:text-gray-300'}`}>
                            <Package size={16} className={isItemMatch ? 'text-indigo-400' : 'text-gray-300 dark:text-gray-600'} />
                            {customer.item_name}
                          </div>
                        </td>
                        <td className="px-8 py-4 text-right font-bold text-green-600 dark:text-green-400 transition-colors">
                          {formatCurrency(customer.total_paid)}
                        </td>
                        <td className="px-8 py-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <span className="font-black text-red-600 dark:text-red-400 text-lg transition-colors">{formatCurrency(customer.balance)}</span>
                            <ArrowRight size={16} className="text-gray-200 dark:text-gray-700" />
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        </div>
    </>
  );
}
