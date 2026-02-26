import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import api from "../api/api";
import Sidebar from "../components/Sidebar";
import Header from "../components/Header";
import { Package, Trash2, Store, AlertCircle } from "lucide-react";

export default function AdminShopStock() {
  const { shopId } = useParams();
  const [shopName, setShopName] = useState("");
  const [shopStock, setShopStock] = useState([]);
  const [availableItems, setAvailableItems] = useState([]);

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
    <div className="flex bg-[#f1f5f9] min-h-screen">
      <Sidebar role="admin" />
      <main className="flex-1 p-8 max-w-7xl mx-auto w-full">
        <Header />

        <div className="mb-8 flex items-center gap-3">
          <div className="bg-green-600 p-3 rounded-2xl text-white shadow-lg shadow-green-200">
            <Package size={32} />
          </div>
          <div>
            <h1 className="text-3xl font-black text-gray-900 tracking-tight">Stock Management</h1>
            <p className="text-gray-500 font-medium flex items-center gap-1">
              <Store size={16} /> Location: {shopName}
            </p>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="bg-gray-50 px-8 py-4 border-b border-gray-100 flex justify-between items-center">
            <h2 className="text-lg font-bold text-gray-800">Current Inventory</h2>
            <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest">
              {shopStock.length} Products
            </span>
          </div>
          
          <div className="overflow-x-auto">
            {shopStock.length === 0 ? (
              <div className="p-20 text-center text-gray-400">
                <AlertCircle className="mx-auto mb-4 opacity-20" size={48} />
                <p className="italic font-medium">No stock records found for this location.</p>
              </div>
            ) : (
              <table className="w-full">
                <thead className="bg-gray-50/50">
                  <tr>
                    <th className="px-8 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-widest">Product Name</th>
                    <th className="px-8 py-4 text-center text-xs font-bold text-gray-500 uppercase tracking-widest">Quantity</th>
                    <th className="px-8 py-4 text-right text-xs font-bold text-gray-500 uppercase tracking-widest">Buy Price</th>
                    <th className="px-8 py-4 text-right text-xs font-bold text-gray-500 uppercase tracking-widest">Sell Price</th>
                    <th className="px-8 py-4 text-center text-xs font-bold text-gray-500 uppercase tracking-widest">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50 bg-white">
                  {shopStock.map((stock) => (
                    <tr key={stock.item_id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-8 py-4 font-bold text-gray-900">
                        {availableItems.find(item => item.id === parseInt(stock.item_id))?.name || "Unknown Item"}
                      </td>
                      <td className="px-8 py-4 text-center">
                        <span className={`px-3 py-1 rounded-full text-sm font-black ${stock.qty <= 2 ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
                          {stock.qty}
                        </span>
                      </td>
                      <td className="px-8 py-4 text-right font-mono text-xs text-gray-400">
                        {formatCurrency(stock.buy_price)}
                      </td>
                      <td className="px-8 py-4 text-right font-black text-blue-600">
                        {formatCurrency(stock.sell_price)}
                      </td>
                      <td className="px-8 py-4">
                        <div className="flex justify-center">
                          <button 
                            onClick={() => handleDeleteStock(stock.item_id)} 
                            className="bg-red-50 text-red-600 p-2 rounded-lg hover:bg-red-600 hover:text-white transition-all flex items-center gap-1 font-bold text-xs"
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
      </main>
    </div>
  );
}
