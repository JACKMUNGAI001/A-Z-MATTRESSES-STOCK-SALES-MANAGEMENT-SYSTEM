import React, { useState, useEffect } from "react";
import api from "../api/api";
import { X, Save, User, Phone, Package, DollarSign } from "lucide-react";
import SearchableSelect from "./SearchableSelect";

export default function EditDepositModal({ deposit, onClose, onUpdate }) {
  const [apiItems, setApiItems] = useState([]);
  const [buyerName, setBuyerName] = useState(deposit.buyer_name || "");
  const [buyerPhone, setBuyerPhone] = useState(deposit.buyer_phone || "");
  const [sellingPrice, setSellingPrice] = useState(deposit.selling_price || "");
  const [selectedItem, setSelectedItem] = useState(deposit.item_id?.toString() || "");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchItems();
  }, [deposit]);

  const fetchItems = async () => {
    try {
      const response = await api.get("/items");
      setApiItems(response.data);
    } catch (err) {
      console.error("Error fetching items");
    }
  };

  const handleUpdate = async () => {
    if (!buyerName || !sellingPrice || !selectedItem) {
      alert("Please fill in all required fields.");
      return;
    }
    setLoading(true);
    try {
      await api.put(`/deposits/${deposit.id}`, {
        buyer_name: buyerName,
        buyer_phone: buyerPhone,
        selling_price: parseFloat(sellingPrice),
        item_id: parseInt(selectedItem)
      });
      alert("Deposit updated successfully!");
      onUpdate();
      onClose();
    } catch (err) {
      alert(`Error updating deposit: ${err.response?.data?.msg || err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in duration-200 transition-colors">
        <div className="bg-indigo-600 p-6 text-white flex justify-between items-center transition-colors">
          <div>
            <h3 className="text-xl font-bold flex items-center gap-2">
              <Package size={24} /> Edit Deposit Account
            </h3>
            <p className="text-indigo-100 text-sm mt-1 font-medium">Record ID: {deposit.id} | Shop: {deposit.shop_name}</p>
          </div>
          <button onClick={onClose} className="text-white/80 hover:text-white transition-colors">
            <X size={28} />
          </button>
        </div>

        <div className="p-8 space-y-6">
          <div className="space-y-4">
            <div>
              <label className="block text-[10px] font-black text-gray-400 uppercase mb-1 tracking-widest flex items-center gap-1">
                <User size={12} /> Customer Name
              </label>
              <input
                type="text"
                className="w-full p-3 border border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none transition-all font-bold"
                value={buyerName}
                onChange={(e) => setBuyerName(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-[10px] font-black text-gray-400 uppercase mb-1 tracking-widest flex items-center gap-1">
                <Phone size={12} /> Phone Number
              </label>
              <input
                type="text"
                className="w-full p-3 border border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none transition-all font-bold"
                value={buyerPhone}
                onChange={(e) => setBuyerPhone(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-[10px] font-black text-gray-400 uppercase mb-1 tracking-widest flex items-center gap-1">
                <Package size={12} /> Selected Item
              </label>
              <SearchableSelect
                options={apiItems}
                value={selectedItem}
                onChange={(e) => setSelectedItem(e.target.value)}
                placeholder="Choose Item..."
              />
            </div>

            <div>
              <label className="block text-[10px] font-black text-gray-400 uppercase mb-1 tracking-widest flex items-center gap-1">
                <DollarSign size={12} /> Total Selling Price
              </label>
              <input
                type="number"
                className="w-full p-3 border border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none transition-all font-black text-lg"
                value={sellingPrice}
                onChange={(e) => setSellingPrice(e.target.value)}
              />
              <p className="mt-1 text-[10px] text-gray-400 italic font-medium">Original amount: KES {deposit.selling_price?.toLocaleString()}</p>
            </div>
          </div>

          <div className="pt-6 border-t border-gray-100 dark:border-gray-700 flex flex-col gap-3">
            <button
              onClick={handleUpdate}
              disabled={loading}
              className="w-full bg-indigo-600 text-white py-4 rounded-xl font-black text-sm uppercase tracking-widest shadow-lg shadow-indigo-100 dark:shadow-none hover:bg-indigo-700 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <Save size={20} /> {loading ? "SAVING..." : "UPDATE RECORD"}
            </button>
            <button
              onClick={onClose}
              className="w-full bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 py-3 rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-gray-200 dark:hover:bg-gray-600 transition-all"
            >
              CANCEL
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
