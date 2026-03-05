import React, { useEffect, useState, useContext } from 'react';
import api, { API_BASE } from '../api/api';
import { Users, Phone, Package, Wallet, ArrowRight, SearchX, Store, CheckCircle, X } from "lucide-react";
import { SearchContext } from '../context/SearchContext';
import { AuthContext } from '../context/AuthContext';

export default function DepositCustomers() {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState(null);
  const [paymentAmount, setPaymentAmount] = useState("");
  const [lastReceipt, setLastReceipt] = useState(null);
  
  const { searchQuery } = useContext(SearchContext);
  const { user } = useContext(AuthContext);

  useEffect(() => {
    fetchCustomers();
  }, []);

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

  const handleRecordPayment = async (e) => {
    e.preventDefault();
    if (!paymentAmount || parseFloat(paymentAmount) <= 0) {
      alert("Please enter a valid payment amount");
      return;
    }
    try {
      const response = await api.post(`/deposits/${selectedAccount.id}/payments`, {
        amount: parseFloat(paymentAmount),
        payment_method: "mobile_money",
      });
      setLastReceipt(response.data.receipt_uuid);
      alert("Payment recorded successfully!");
      setShowPaymentModal(false);
      setPaymentAmount("");
      fetchCustomers(); // Refresh list
    } catch (err) {
      alert(`Error recording payment: ${err.response?.data?.msg || err.message}`);
    }
  };

  const formatCurrency = (val) => {
    return new Intl.NumberFormat('en-KE', { style: 'currency', currency: 'KES', minimumFractionDigits: 0 }).format(val || 0);
  };

  const filteredCustomers = searchQuery 
    ? customers.filter(customer => 
        customer.buyer_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        customer.item_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (customer.shop_name && customer.shop_name.toLowerCase().includes(searchQuery.toLowerCase()))
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
                    {(user?.role === 'manager' || user?.role === 'admin') && (
                      <th className="px-8 py-4 text-left text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest">Shop</th>
                    )}
                    <th className="px-8 py-4 text-left text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest">Customer</th>
                    <th className="px-8 py-4 text-left text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest">Item Reserved</th>
                    <th className="px-8 py-4 text-right text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest">Paid to Date</th>
                    <th className="px-8 py-4 text-right text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest">Balance Due</th>
                    <th className="px-8 py-4 text-center text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50 dark:divide-gray-700 bg-white dark:bg-gray-800 transition-colors">
                  {filteredCustomers.map((customer) => {
                    const isBuyerMatch = searchQuery && customer.buyer_name.toLowerCase().includes(searchQuery.toLowerCase());
                    const isItemMatch = searchQuery && customer.item_name.toLowerCase().includes(searchQuery.toLowerCase());
                    const isShopMatch = searchQuery && customer.shop_name && customer.shop_name.toLowerCase().includes(searchQuery.toLowerCase());
                    return (
                      <tr key={customer.id} className="hover:bg-indigo-50/10 dark:hover:bg-indigo-900/10 transition-colors">
                        {(user?.role === 'manager' || user?.role === 'admin') && (
                          <td className="px-8 py-4">
                            <div className={`flex items-center gap-1 text-sm font-bold transition-colors ${isShopMatch ? 'text-blue-600 dark:text-blue-400 font-black' : 'text-gray-500 dark:text-gray-400'}`}>
                              <Store size={14} className="text-gray-400" />
                              {customer.shop_name}
                            </div>
                          </td>
                        )}
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
                          </div>
                        </td>
                        <td className="px-8 py-4 text-center">
                            <button 
                                onClick={() => {
                                    setSelectedAccount(customer);
                                    setShowPaymentModal(true);
                                }}
                                className="bg-green-600 text-white px-4 py-2 rounded-lg font-bold text-xs hover:bg-green-700 transition-all flex items-center gap-2 mx-auto"
                            >
                                <Wallet size={14} /> PAY
                            </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* PAYMENT MODAL */}
        {showPaymentModal && selectedAccount && (
            <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-md animate-in fade-in zoom-in duration-200 transition-colors">
                    <div className="bg-green-600 p-6 text-white rounded-t-2xl flex justify-between items-center">
                        <div>
                            <h3 className="text-xl font-bold">Record Installment</h3>
                            <p className="text-green-100 text-sm mt-1">{selectedAccount.buyer_name} - {selectedAccount.item_name}</p>
                        </div>
                        <button onClick={() => setShowPaymentModal(false)} className="text-white/80 hover:text-white">
                            <X size={24} />
                        </button>
                    </div>
                    <form onSubmit={handleRecordPayment} className="p-8 space-y-6">
                        <div>
                            <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-4">
                                Outstanding Balance: <span className="font-bold text-red-500">{formatCurrency(selectedAccount.balance)}</span>
                            </p>
                            <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2 uppercase tracking-widest">Installment Amount (KES)</label>
                            <input 
                                required
                                autoFocus
                                type="number" 
                                step="0.01"
                                max={selectedAccount.balance}
                                className="w-full border-gray-300 dark:border-gray-600 dark:bg-gray-900 dark:text-white rounded-xl p-4 text-2xl font-black focus:ring-2 focus:ring-green-500 outline-none transition-all"
                                value={paymentAmount}
                                onChange={e => setPaymentAmount(e.target.value)}
                                placeholder="0.00"
                            />
                        </div>
                        <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-xl text-blue-700 dark:text-blue-400 font-bold flex items-center gap-2">
                            <span>📱 Payment via M-PESA</span>
                        </div>
                        <div className="flex gap-4 pt-4">
                            <button 
                                type="button" 
                                onClick={() => setShowPaymentModal(false)}
                                className="flex-1 px-6 py-3 border-2 border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 rounded-xl font-bold hover:bg-gray-50 dark:hover:bg-gray-700 transition-all"
                            >
                                Cancel
                            </button>
                            <button 
                                type="submit" 
                                className="flex-1 px-6 py-3 bg-green-600 text-white rounded-xl font-bold hover:bg-green-700 transition-all shadow-xl shadow-green-200 dark:shadow-none"
                            >
                                Confirm Payment
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        )}

        {lastReceipt && (
            <div className="mt-8 text-center bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
                <p className="text-gray-500 dark:text-gray-400 font-bold uppercase tracking-widest text-xs mb-4">Transaction Successful</p>
                <a
                    href={`${API_BASE}/receipts/${lastReceipt}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-3 bg-blue-600 text-white px-8 py-4 rounded-xl font-black shadow-lg shadow-blue-100 dark:shadow-none hover:bg-blue-700 transition-all"
                >
                    <CheckCircle size={20} /> VIEW PAYMENT RECEIPT
                </a>
            </div>
        )}
    </>
  );
}
