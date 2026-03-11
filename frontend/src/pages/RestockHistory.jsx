import React, { useState, useEffect, useContext } from 'react';
import api from '../api/api';
import { Truck, Store, Calendar, Package, User, SearchX, ChevronDown, ChevronUp, Trash2 } from 'lucide-react';
import { AuthContext } from '../context/AuthContext';
import { formatDate } from '../utils/helpers';

export default function RestockHistory() {
  const { user } = useContext(AuthContext);
  const [history, setHistory] = useState([]);
  const [shops, setShops] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedShops, setExpandedShops] = useState({});

  useEffect(() => {
    fetchShops();
    fetchHistory();
  }, []);

  const fetchShops = async () => {
    try {
      const response = await api.get('/shops');
      setShops(response.data);
      // Initialize all shops as expanded
      const initialExpanded = {};
      response.data.forEach(shop => {
        initialExpanded[shop.name] = true;
      });
      setExpandedShops(initialExpanded);
    } catch (err) {
      console.error('Error fetching shops');
    }
  };

  const fetchHistory = async () => {
    try {
      const response = await api.get('/stocks/history');
      setHistory(response.data);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching restock history');
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this restock record? Stock will be reversed.')) return;
    try {
      await api.delete(`/stocks/history/${id}`);
      fetchHistory();
    } catch (err) {
      alert(err.response?.data?.msg || 'Error deleting restock record');
    }
  };

  const toggleShop = (shopName) => {
    setExpandedShops(prev => ({
      ...prev,
      [shopName]: !prev[shopName]
    }));
  };

  // Group history by shop
  const groupedHistory = history.reduce((acc, curr) => {
    if (!acc[curr.shop_name]) acc[curr.shop_name] = [];
    acc[curr.shop_name].push(curr);
    return acc;
  }, {});

  const formatCurrency = (val) => {
    return new Intl.NumberFormat('en-KE', { style: 'currency', currency: 'KES', minimumFractionDigits: 0 }).format(val || 0);
  };

  if (loading) {
    return <div className="flex bg-[#f1f5f9] dark:bg-[#0f172a] min-h-screen items-center justify-center text-gray-500 dark:text-gray-400 font-bold uppercase tracking-widest transition-colors">Loading history...</div>;
  }

  return (
    <div className="p-4 md:p-8">
      <div className="mb-8 flex items-center gap-3 transition-colors">
        <div className="bg-orange-600 p-3 rounded-2xl text-white shadow-lg shadow-orange-200 dark:shadow-none transition-colors">
          <Truck size={32} />
        </div>
        <div>
          <h1 className="text-3xl font-black text-gray-900 dark:text-white tracking-tight transition-colors">Restock History</h1>
          <p className="text-gray-500 dark:text-gray-400 font-medium transition-colors">Detailed logs of stock replenishments across all shops</p>
        </div>
      </div>

      {Object.keys(groupedHistory).length === 0 ? (
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-12 text-center border border-gray-100 dark:border-gray-700 shadow-sm transition-colors">
          <SearchX size={48} className="mx-auto text-gray-300 dark:text-gray-600 mb-4" />
          <p className="text-gray-500 dark:text-gray-400 font-bold uppercase tracking-widest text-sm">No restock records found</p>
        </div>
      ) : (
        <div className="space-y-6">
          {Object.entries(groupedHistory).map(([shopName, movements]) => (
            <div key={shopName} className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden transition-colors">
              <button 
                onClick={() => toggleShop(shopName)}
                className="w-full flex justify-between items-center p-6 bg-orange-50/50 dark:bg-orange-900/10 hover:bg-orange-50 dark:hover:bg-orange-900/20 transition-all border-b border-gray-100 dark:border-gray-700"
              >
                <div className="flex items-center gap-3">
                  <Store size={24} className="text-orange-600 dark:text-orange-400" />
                  <h2 className="text-xl font-bold text-gray-800 dark:text-white tracking-tight">{shopName} <span className="ml-2 text-sm text-gray-400 font-medium">({movements.length} Records)</span></h2>
                </div>
                {expandedShops[shopName] ? <ChevronUp size={24} className="text-gray-400" /> : <ChevronDown size={24} className="text-gray-400" />}
              </button>
              
              {expandedShops[shopName] && (
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead className="bg-gray-50/50 dark:bg-gray-900/50 text-xs font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest transition-colors">
                      <tr>
                        <th className="px-6 py-4 text-left border-b border-gray-100 dark:border-gray-700">Product</th>
                        <th className="px-6 py-4 text-center border-b border-gray-100 dark:border-gray-700">Quantity</th>
                        <th className="px-6 py-4 text-right border-b border-gray-100 dark:border-gray-700">Cost Price</th>
                        <th className="px-6 py-4 text-left border-b border-gray-100 dark:border-gray-700">Restocked By</th>
                        <th className="px-6 py-4 text-left border-b border-gray-100 dark:border-gray-700">Date & Time</th>
                        <th className="px-6 py-4 text-left border-b border-gray-100 dark:border-gray-700">Type</th>
                        {user?.role === 'admin' && <th className="px-6 py-4 text-right border-b border-gray-100 dark:border-gray-700">Action</th>}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50 dark:divide-gray-700 transition-colors">
                      {movements.map((m) => (
                        <tr key={m.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-900/50 transition-colors">
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-2">
                              <Package size={16} className="text-blue-500" />
                              <span className="font-bold text-gray-900 dark:text-white">{m.item_name}</span>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-center">
                            <span className="bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 px-3 py-1 rounded-lg font-black text-sm">
                              +{m.qty}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-right font-mono font-bold text-gray-600 dark:text-gray-400">
                            {formatCurrency(m.buy_price)}
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                              <User size={14} className="text-gray-400" />
                              {m.user_name}
                            </div>
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                            <div className="flex items-center gap-2">
                              <Calendar size={14} />
                              {formatDate(m.created_at)}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-1 rounded-md border ${
                              m.movement_type === 'purchase_in' ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 border-blue-100 dark:border-blue-800' :
                              m.movement_type === 'transfer_in' ? 'bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400 border-purple-100 dark:border-purple-800' :
                              'bg-gray-50 dark:bg-gray-900/20 text-gray-600 dark:text-gray-400 border-gray-100 dark:border-gray-800'
                            }`}>
                              {m.movement_type.replace('_', ' ')}
                            </span>
                          </td>
                          {user?.role === 'admin' && (
                            <td className="px-6 py-4 text-right">
                              <button 
                                onClick={() => handleDelete(m.id)}
                                className="text-red-500 hover:text-red-700 transition-colors p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20"
                                title="Delete Restock"
                              >
                                <Trash2 size={18} />
                              </button>
                            </td>
                          )}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
