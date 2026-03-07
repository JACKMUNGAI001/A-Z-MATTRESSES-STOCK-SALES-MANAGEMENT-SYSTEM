import React, { useState, useEffect, useContext } from "react";
import { useParams } from "react-router-dom";
import api from "../api/api";
import { Package, Trash2, Store, AlertCircle, Edit, X, Save, Search, CalendarX } from "lucide-react";
import { AuthContext } from "../context/AuthContext";
import { SearchContext } from "../context/SearchContext";

export default function AdminShopStock() {
  const { shopId } = useParams();
  const { user } = useContext(AuthContext);
  const { searchQuery, searchType } = useContext(SearchContext);
  const [shopName, setShopName] = useState("");
  const [shopStock, setShopStock] = useState([]);
  const [availableItems, setAvailableItems] = useState([]);
  const [editingStock, setEditingStock] = useState(null);
  const [editFormData, setEditFormData] = useState({ qty: 0, buy_price: 0 });

  useEffect(() => {
    fetchShopDetails();
    fetchShopStock();
    fetchAvailableItems();
  }, [shopId]);

  const fetchShopDetails = async () => {
    try {
      const response = await api.get(`/shops/${shopId}`);
      setShopName(response.data.name);
    } catch (err) {
      console.error("Error fetching shop details");
    }
  };

  const fetchShopStock = async () => {
    try {
      const response = await api.get(`/stocks/${shopId}`);
      setShopStock(response.data);
    } catch (err) {
      console.error("Error fetching shop stock");
    }
  };

  const fetchAvailableItems = async () => {
    try {
      const response = await api.get("/items");
      setAvailableItems(response.data);
    } catch (err) {
      console.error("Error fetching available items");
    }
  };

  const filteredStock = searchQuery
    ? shopStock.filter(stock => {
        if (searchType === 'date' && stock.created_at) {
            return stock.created_at.startsWith(searchQuery);
        }
        const itemName = availableItems.find(item => item.id === parseInt(stock.item_id))?.name || stock.item_name || "";
        return itemName.toLowerCase().includes(searchQuery.toLowerCase());
      })
    : shopStock;

  const handleEditStock = (stock) => {
    setEditingStock(stock);
    setEditFormData({ qty: stock.qty, buy_price: stock.buy_price || 0 });
  };

  const handleUpdateStock = async (e) => {
    e.preventDefault();
    try {
      await api.post("/stocks/adjust", {
        shop_id: parseInt(shopId),
        item_id: editingStock.item_id,
        qty: parseInt(editFormData.qty),
        buy_price: user?.role === 'admin' ? parseFloat(editFormData.buy_price) : undefined,
        movement_type: "manual_edit",
        override: true
      });
      alert("Stock updated successfully!");
      setEditingStock(null);
      fetchShopStock();
    } catch (err) {
      alert(`Error updating stock: ${err.response?.data?.msg || err.message}`);
    }
  };

  const handleDeleteStock = async (itemId) => {
    if (window.confirm("Are you sure you want to delete this stock item? This cannot be undone.")) {
      try {
        await api.delete(`/stocks/${shopId}/${itemId}`);
        alert("Stock item deleted successfully!");
        fetchShopStock();
      } catch (err) {
        alert(`Error deleting stock item: ${err.response?.data?.msg || err.message}`);
      }
    }
  };

  const formatCurrency = (val) => {
    return new Intl.NumberFormat('en-KE', { style: 'currency', currency: 'KES', minimumFractionDigits: 0 }).format(val || 0);
  };

  return (
    <>
        <div className="mb-8 flex items-center gap-3 transition-colors">
          <div className="bg-green-600 p-3 rounded-2xl text-white shadow-lg shadow-green-200 dark:shadow-none transition-colors">
            <Package size={32} />
          </div>
          <div>
            <h1 className="text-3xl font-black text-gray-900 dark:text-white tracking-tight transition-colors">Stock Management</h1>
            <p className="text-gray-500 dark:text-gray-400 font-medium flex items-center gap-1 transition-colors">
              <Store size={16} /> Location: {shopName}
            </p>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden transition-colors">
          <div className="bg-gray-50 dark:bg-gray-900/50 px-8 py-4 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center transition-colors">
            <h2 className="text-lg font-bold text-gray-800 dark:text-white transition-colors flex items-center gap-2">
                Current Inventory {searchQuery && <span className="text-xs font-medium text-blue-500 bg-blue-50 dark:bg-blue-900/30 px-2 py-0.5 rounded-full ml-2 transition-all">{searchType === 'date' ? `Date: ${searchQuery}` : `Searching: "${searchQuery}"`}</span>}
            </h2>
            <span className="bg-green-100 dark:bg-green-900/50 text-green-700 dark:text-green-400 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest transition-colors">
              {filteredStock.length} Products
            </span>
          </div>
          
          <div className="overflow-x-auto max-h-[calc(100vh-300px)] overflow-y-auto custom-scrollbar">
            {filteredStock.length === 0 ? (
              <div className="p-20 text-center text-gray-400 dark:text-gray-500 transition-colors">
                {searchQuery ? <CalendarX className="mx-auto mb-4 opacity-20" size={48} /> : <AlertCircle className="mx-auto mb-4 opacity-20" size={48} />}
                <p className="italic font-medium">{searchQuery ? 'No matching products found' : 'No stock records found for this location.'}</p>
                {searchQuery && <p className="text-xs text-gray-400 mt-2 transition-colors">Try another {searchType === 'date' ? 'date' : 'search term'} or clear search</p>}
              </div>
            ) : (
              <table className="w-full relative border-collapse">
                <thead className="bg-gray-50/90 dark:bg-gray-900/90 transition-colors sticky top-0 z-10 backdrop-blur-sm">
                  <tr>
                    <th className="px-8 py-4 text-left text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest border-b border-gray-100 dark:border-gray-700">Product Name</th>
                    <th className="px-8 py-4 text-center text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest border-b border-gray-100 dark:border-gray-700">Quantity</th>
                    {user?.role === 'admin' && <th className="px-8 py-4 text-right text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest border-b border-gray-100 dark:border-gray-700">Buy Price</th>}
                    <th className="px-8 py-4 text-center text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest border-b border-gray-100 dark:border-gray-700">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50 dark:divide-gray-700 bg-white dark:bg-gray-800 transition-colors">
                  {filteredStock.map((stock) => (
                    <tr key={stock.item_id} className="hover:bg-gray-50/50 dark:hover:bg-gray-900/50 transition-colors">
                      <td className="px-8 py-4 font-bold text-gray-900 dark:text-white transition-colors">
                        {availableItems.find(item => item.id === parseInt(stock.item_id))?.name || stock.item_name || "Unknown Item"}
                      </td>
                      <td className="px-8 py-4 text-center transition-colors">
                        <span className={`px-3 py-1 rounded-full text-sm font-black transition-colors ${stock.qty <= 2 ? 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400' : 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'}`}>
                          {stock.qty}
                        </span>
                      </td>
                      {user?.role === 'admin' && (
                        <td className="px-8 py-4 text-right font-mono text-xs text-gray-400 dark:text-gray-500 transition-colors">
                          {formatCurrency(stock.buy_price)}
                        </td>
                      )}
                      <td className="px-8 py-4">
                        <div className="flex justify-center items-center gap-2 transition-colors">
                          {(user?.role === 'admin' || user?.role === 'manager') && (
                            <button 
                                onClick={() => handleEditStock(stock)} 
                                className="bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 p-2 rounded-lg hover:bg-blue-600 hover:text-white transition-all flex items-center gap-1 font-bold text-xs"
                                title="Edit Stock"
                            >
                                <Edit size={16} /> Edit
                            </button>
                          )}
                          <button 
                            onClick={() => handleDeleteStock(stock.item_id)} 
                            className="bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 p-2 rounded-lg hover:bg-red-600 hover:text-white transition-all flex items-center gap-1 font-bold text-xs"
                            title="Delete Record"
                          >
                            <Trash2 size={16} /> Delete Record
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* EDIT MODAL */}
        {editingStock && (
            <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
                    <div className="bg-blue-600 p-6 text-white flex justify-between items-center">
                        <div>
                            <h3 className="text-xl font-bold">Edit Stock Quantity</h3>
                            <p className="text-blue-100 text-sm mt-1">{editingStock.item_name || availableItems.find(i => i.id === editingStock.item_id)?.name}</p>
                        </div>
                        <button onClick={() => setEditingStock(null)} className="text-white/80 hover:text-white transition-colors">
                            <X size={24} />
                        </button>
                    </div>
                    
                    <form onSubmit={handleUpdateStock} className="p-6 space-y-6">
                        <div>
                            <label className="block text-sm font-bold text-gray-700 dark:text-gray-400 uppercase tracking-widest mb-2">Current Quantity</label>
                            <input 
                                type="number" 
                                required
                                className="w-full border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg p-3 focus:ring-2 focus:ring-blue-500 outline-none transition-all font-bold text-lg"
                                value={editFormData.qty}
                                onChange={e => setEditFormData({...editFormData, qty: e.target.value})}
                                min="0"
                            />
                        </div>

                        {user?.role === 'admin' && (
                            <div>
                                <label className="block text-sm font-bold text-gray-700 dark:text-gray-400 uppercase tracking-widest mb-2">Buy Price (KES)</label>
                                <input 
                                    type="number" 
                                    step="0.01"
                                    className="w-full border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg p-3 focus:ring-2 focus:ring-blue-500 outline-none transition-all font-mono"
                                    value={editFormData.buy_price}
                                    onChange={e => setEditFormData({...editFormData, buy_price: e.target.value})}
                                />
                            </div>
                        )}

                        <div className="flex gap-3 pt-4">
                            <button 
                                type="button" 
                                onClick={() => setEditingStock(null)}
                                className="flex-1 px-4 py-3 border-2 border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 rounded-xl font-bold hover:bg-gray-50 dark:hover:bg-gray-900/50 transition-all"
                            >
                                Cancel
                            </button>
                            <button 
                                type="submit" 
                                className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-all shadow-xl shadow-blue-200 dark:shadow-none flex items-center justify-center gap-2"
                            >
                                <Save size={18} /> Update Stock
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        )}
    </>
  );
}
