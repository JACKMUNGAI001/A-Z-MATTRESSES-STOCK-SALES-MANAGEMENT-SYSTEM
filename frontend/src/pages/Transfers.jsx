import { useState, useEffect } from "react";
import api from "../api/api";

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
        alert("Error fetching shops or items");
      }
    };
    fetchShopsAndItems();
  }, []);

  const handleTransfer = async () => {
    try {
      await api.post("/transfers", {
        from_shop_id: fromShop,
        to_shop_id: toShop,
        items: [{ item_id: itemId, qty: quantity }],
        notes: notes,
      });

      alert("Transfer completed successfully!");
    } catch (err) {
      alert(`Error creating transfer: ${err.response?.data?.msg || err.message}`);
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold mb-4">Stock Transfer</h1>

      <div className="bg-white rounded-xl shadow p-6 grid grid-cols-2 gap-4">
        <div>
          <label>From Shop</label>
          <select
            className="w-full border p-2 rounded mt-1"
            value={fromShop}
            onChange={(e) => setFromShop(e.target.value)}
          >
            <option value="">Select a shop</option>
            {shops.map((shop) => (
              <option key={shop.id} value={shop.id}>
                {shop.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label>To Shop</label>
          <select
            className="w-full border p-2 rounded mt-1"
            value={toShop}
            onChange={(e) => setToShop(e.target.value)}
          >
            <option value="">Select a shop</option>
            {shops.map((shop) => (
              <option key={shop.id} value={shop.id}>
                {shop.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label>Item</label>
          <select
            className="w-full border p-2 rounded mt-1"
            value={itemId}
            onChange={(e) => setItemId(e.target.value)}
          >
            <option value="">Select an item</option>
            {items.map((item) => (
              <option key={item.id} value={item.id}>
                {item.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label>Quantity</label>
          <input
            className="w-full border p-2 rounded mt-1"
            type="number"
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
          />
        </div>

        <div className="col-span-2">
          <label>Notes</label>
          <textarea
            className="w-full border p-2 rounded mt-1"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          ></textarea>
        </div>

        <button
          onClick={handleTransfer}
          className="col-span-2 bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 mt-4"
        >
          Transfer Stock
        </button>
      </div>
    </div>
  );
}
