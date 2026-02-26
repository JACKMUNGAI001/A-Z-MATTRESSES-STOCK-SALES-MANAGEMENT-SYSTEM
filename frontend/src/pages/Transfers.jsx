import { useState, useEffect } from "react";
import api from "../api/api";
import Sidebar from "../components/Sidebar";
import Header from "../components/Header";
import { ArrowLeftRight, Store, Box, FileText, Send } from "lucide-react";

export default function Transfers() {
  const [fromShop, setFromShop] = useState("");
  const [toShop, setToShop] = useState("");
  const [itemId, setItemId] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [notes, setNotes] = useState("");
  const [shops, setShops] = useState([]);
  const [items, setItems] = useState([]);

  useEffect(() => {
    const fetchShopsAndItems = async () => {
      try {
        const shopsResponse = await api.get("/shops");
        setShops(shopsResponse.data);
        const itemsResponse = await api.get("/items");
        setItems(itemsResponse.data);
      } catch (err) {
        console.error("Error fetching shops or items");
      }
    };
    fetchShopsAndItems();
  }, []);

  const handleTransfer = async () => {
    if(!fromShop || !toShop || !itemId) {
      alert("Please fill in all required fields.");
      return;
    }
    if(fromShop === toShop) {
      alert("Source and destination shops cannot be the same.");
      return;
    }
    try {
      await api.post("/transfers", {
        from_shop_id: fromShop,
        to_shop_id: toShop,
        items: [{ item_id: itemId, qty: quantity }],
        notes: notes,
      });

      alert("Transfer completed successfully!");
      setFromShop(""); setToShop(""); setItemId(""); setQuantity(1); setNotes("");
    } catch (err) {
      alert(`Error creating transfer: ${err.response?.data?.msg || err.message}`);
    }
  };

  return (
    <div className="flex bg-[#f1f5f9] min-h-screen">
      <Sidebar role="admin" />
      <main className="flex-1 p-8 max-w-7xl mx-auto w-full">
        <Header />

        <div className="mb-8 flex items-center gap-3">
          <div className="bg-blue-600 p-3 rounded-2xl text-white shadow-lg shadow-blue-200">
            <ArrowLeftRight size={32} />
          </div>
          <div>
            <h1 className="text-3xl font-black text-gray-900 tracking-tight">Inter-Shop Transfers</h1>
            <p className="text-gray-500 font-medium">Relocate inventory between branch locations securely</p>
          </div>
        </div>

        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden max-w-4xl">
          <div className="bg-gray-50 px-8 py-6 border-b border-gray-100 flex items-center gap-3">
            <Send size={24} className="text-blue-600" />
            <h2 className="text-xl font-bold text-gray-800 tracking-tight">Create New Transfer</h2>
          </div>
          
          <div className="p-8 space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* FROM */}
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-xs font-black text-gray-400 uppercase tracking-widest px-1">
                  <Store size={14} className="text-red-400" />
                  Originating Shop
                </label>
                <select
                  className="w-full p-4 border border-gray-200 rounded-2xl bg-gray-50 focus:ring-2 focus:ring-red-500 outline-none font-bold text-gray-900 transition-all"
                  value={fromShop}
                  onChange={(e) => setFromShop(e.target.value)}
                >
                  <option value="">-- Select Source --</option>
                  {shops.map((shop) => (
                    <option key={shop.id} value={shop.id}>{shop.name}</option>
                  ))}
                </select>
              </div>

              {/* TO */}
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-xs font-black text-gray-400 uppercase tracking-widest px-1">
                  <Store size={14} className="text-green-400" />
                  Destination Shop
                </label>
                <select
                  className="w-full p-4 border border-gray-200 rounded-2xl bg-gray-50 focus:ring-2 focus:ring-green-500 outline-none font-bold text-gray-900 transition-all"
                  value={toShop}
                  onChange={(e) => setToShop(e.target.value)}
                >
                  <option value="">-- Select Destination --</option>
                  {shops.map((shop) => (
                    <option key={shop.id} value={shop.id}>{shop.name}</option>
                  ))}
                </select>
              </div>

              {/* ITEM */}
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-xs font-black text-gray-400 uppercase tracking-widest px-1">
                  <Box size={14} className="text-blue-400" />
                  Product to Move
                </label>
                <select
                  className="w-full p-4 border border-gray-200 rounded-2xl bg-gray-50 focus:ring-2 focus:ring-blue-500 outline-none font-bold text-gray-900 transition-all"
                  value={itemId}
                  onChange={(e) => setItemId(e.target.value)}
                >
                  <option value="">-- Choose Item --</option>
                  {items.map((item) => (
                    <option key={item.id} value={item.id}>{item.name}</option>
                  ))}
                </select>
              </div>

              {/* QTY */}
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-xs font-black text-gray-400 uppercase tracking-widest px-1">
                  Quantity
                </label>
                <input
                  className="w-full p-4 border border-gray-200 rounded-2xl bg-gray-50 focus:ring-2 focus:ring-blue-500 outline-none font-black text-blue-600 text-lg transition-all"
                  type="number"
                  value={quantity}
                  min="1"
                  onChange={(e) => setQuantity(e.target.value)}
                />
              </div>
            </div>

            {/* NOTES */}
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-xs font-black text-gray-400 uppercase tracking-widest px-1">
                <FileText size={14} />
                Transfer Notes / Reason
              </label>
              <textarea
                className="w-full p-4 border border-gray-200 rounded-2xl bg-gray-50 focus:ring-2 focus:ring-blue-500 outline-none font-medium text-gray-700 h-24 transition-all"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Briefly explain why this stock is being moved..."
              ></textarea>
            </div>

            <button
              onClick={handleTransfer}
              className="w-full bg-blue-600 text-white py-5 rounded-2xl font-black text-lg shadow-xl shadow-blue-100 hover:bg-blue-700 hover:-translate-y-0.5 transition-all flex items-center justify-center gap-3 mt-4"
            >
              <ArrowLeftRight size={24} /> Execute Transfer
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
