import { useState, useEffect } from "react";
import api from "../api/api";
import { ArrowLeftRight, Store, Box, FileText, Send, Plus, Trash2 } from "lucide-react";
import SearchableSelect from "../components/SearchableSelect";

export default function Transfers() {
  const [fromShop, setFromShop] = useState("");
  const [toShop, setToShop] = useState("");
  const [itemId, setItemId] = useState("");
  const [quantity, setQuantity] = useState(0);
  const [notes, setNotes] = useState("");
  const [shops, setShops] = useState([]);
  const [items, setItems] = useState([]);
  const [itemsList, setItemsList] = useState([]);

  useEffect(() => {
    const fetchShopsAndItems = async () => {
      try {
        const [shopsRes, itemsRes] = await Promise.all([
          api.get("/shops"),
          api.get("/items")
        ]);
        setShops(shopsRes.data);
        setItems(itemsRes.data);
      } catch (err) {
        console.error("Error fetching shops or items");
      }
    };
    fetchShopsAndItems();
  }, []);

  const handleAddItem = () => {
    if (!itemId || !quantity || quantity <= 0) {
      alert("Please select an item and a valid quantity.");
      return;
    }

    const itemToAdd = items.find(i => i.id === parseInt(itemId));
    if (!itemToAdd) return;

    const existingIndex = itemsList.findIndex(i => i.item_id === itemToAdd.id);
    if (existingIndex > -1) {
      const newList = [...itemsList];
      newList[existingIndex].qty += parseInt(quantity);
      setItemsList(newList);
    } else {
      setItemsList([...itemsList, {
        item_id: itemToAdd.id,
        item_name: itemToAdd.name,
        qty: parseInt(quantity)
      }]);
    }

    setItemId("");
    setQuantity(0);
  };

  const handleRemoveItem = (index) => {
    setItemsList(itemsList.filter((_, i) => i !== index));
  };

  const handleTransfer = async () => {
    if(!fromShop || !toShop) {
      alert("Please select source and destination shops.");
      return;
    }
    if(fromShop === toShop) {
      alert("Source and destination shops cannot be the same.");
      return;
    }
    if(itemsList.length === 0) {
      alert("Please add at least one item to transfer.");
      return;
    }

    try {
      await api.post("/transfers", {
        from_shop_id: fromShop,
        to_shop_id: toShop,
        items: itemsList.map(i => ({ item_id: i.item_id, qty: i.qty })),
        notes: notes,
      });

      alert("Transfer completed successfully!");
      setFromShop(""); 
      setToShop(""); 
      setItemsList([]); 
      setNotes("");
    } catch (err) {
      alert(`Error creating transfer: ${err.response?.data?.msg || err.message}`);
    }
  };

  return (
    <>
        <div className="mb-8 flex items-center gap-3 transition-colors">
          <div className="bg-blue-600 p-2 sm:p-3 rounded-2xl text-white shadow-lg shadow-blue-200 dark:shadow-none transition-colors">
            <ArrowLeftRight size={24} className="sm:w-8 sm:h-8" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-gray-900 dark:text-white tracking-tight transition-colors">Inter-Shop Transfers</h1>
            <p className="text-sm sm:text-base text-gray-500 dark:text-gray-400 font-medium transition-colors">Relocate inventory between branch locations securely</p>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden max-w-5xl transition-colors">
          <div className="bg-gray-50 dark:bg-gray-900/50 px-5 sm:px-8 py-4 sm:py-6 border-b border-gray-100 dark:border-gray-700 flex items-center gap-3 transition-colors">
            <Send size={24} className="text-blue-600 dark:text-blue-400" />
            <h2 className="text-lg sm:text-xl font-bold text-gray-800 dark:text-white tracking-tight transition-colors">Create New Transfer</h2>
          </div>
          
          <div className="p-5 sm:p-8 space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-8">
              {/* FROM */}
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-xs font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest px-1 transition-colors">
                  <Store size={14} className="text-red-400" />
                  Originating Shop
                </label>
                <SearchableSelect
                  options={shops}
                  value={fromShop}
                  onChange={(e) => setFromShop(e.target.value)}
                  placeholder="Select Source..."
                />
              </div>

              {/* TO */}
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-xs font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest px-1 transition-colors">
                  <Store size={14} className="text-green-400" />
                  Destination Shop
                </label>
                <SearchableSelect
                  options={shops}
                  value={toShop}
                  onChange={(e) => setToShop(e.target.value)}
                  placeholder="Select Destination..."
                />
              </div>
            </div>

            {/* ITEM SELECTION */}
            <div className="bg-gray-50 dark:bg-gray-900/30 p-4 sm:p-6 rounded-2xl border border-gray-100 dark:border-gray-700 space-y-4">
              <h3 className="text-sm font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest px-1">Add Products to Transfer</h3>
              <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
                <div className="md:col-span-7 space-y-2">
                  <label className="flex items-center gap-2 text-xs font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest px-1 transition-colors">
                    <Box size={14} className="text-blue-400" />
                    Product to Move
                  </label>
                  <SearchableSelect
                    options={items}
                    value={itemId}
                    onChange={(e) => setItemId(e.target.value)}
                    placeholder="Choose Item..."
                  />
                </div>

                <div className="md:col-span-3 space-y-2">
                  <label className="flex items-center gap-2 text-xs font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest px-1 transition-colors">
                    Quantity
                  </label>
                  <input
                    className="w-full p-3 border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-900 focus:ring-2 focus:ring-blue-500 outline-none font-bold text-gray-800 dark:text-white transition-all"
                    type="number"
                    value={quantity}
                    min="0"
                    onChange={(e) => setQuantity(e.target.value)}
                  />
                </div>

                <div className="md:col-span-2">
                  <button
                    onClick={handleAddItem}
                    className="w-full bg-blue-600 text-white py-3 rounded-xl font-bold hover:bg-blue-700 transition-all flex items-center justify-center gap-2 shadow-lg shadow-blue-100 dark:shadow-none"
                  >
                    <Plus size={20} /> Add
                  </button>
                </div>
              </div>

              {/* ITEMS LIST TABLE */}
              {itemsList.length > 0 && (
                <div className="mt-6 border border-gray-100 dark:border-gray-700 rounded-xl overflow-hidden bg-white dark:bg-gray-800">
                  <table className="w-full text-left">
                    <thead className="bg-gray-50 dark:bg-gray-900/50">
                      <tr>
                        <th className="px-4 py-3 text-[10px] font-black text-gray-400 uppercase tracking-widest">Product</th>
                        <th className="px-4 py-3 text-[10px] font-black text-gray-400 uppercase tracking-widest text-center">Qty</th>
                        <th className="px-4 py-3 text-[10px] font-black text-gray-400 uppercase tracking-widest text-center">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                      {itemsList.map((item, index) => (
                        <tr key={index} className="hover:bg-gray-50 dark:hover:bg-gray-900/30 transition-colors">
                          <td className="px-4 py-3 text-sm font-bold text-gray-700 dark:text-gray-300">{item.item_name}</td>
                          <td className="px-4 py-3 text-sm font-black text-blue-600 dark:text-blue-400 text-center">{item.qty}</td>
                          <td className="px-4 py-3 text-center">
                            <button
                              onClick={() => handleRemoveItem(index)}
                              className="text-red-400 hover:text-red-600 transition-colors p-1"
                            >
                              <Trash2 size={18} />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* NOTES */}
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-xs font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest px-1 transition-colors">
                <FileText size={14} />
                Transfer Notes / Reason
              </label>
              <textarea
                className="w-full p-3 sm:p-4 border border-gray-200 dark:border-gray-700 rounded-2xl bg-gray-50 dark:bg-gray-900 focus:ring-2 focus:ring-blue-500 outline-none font-medium text-gray-700 dark:text-gray-300 h-24 transition-all"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Briefly explain why this stock is being moved..."
              ></textarea>
            </div>

            <button
              onClick={handleTransfer}
              disabled={itemsList.length === 0}
              className="w-full bg-blue-600 text-white py-4 sm:py-5 rounded-2xl font-black text-base sm:text-lg shadow-xl shadow-blue-100 dark:shadow-none hover:bg-blue-700 hover:-translate-y-0.5 transition-all flex items-center justify-center gap-3 mt-4 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0"
            >
              <ArrowLeftRight size={20} className="sm:w-6 sm:h-6" /> Execute Transfer
            </button>
          </div>
        </div>
    </>
  );
}
