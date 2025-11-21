import { useState } from "react";
import api from "../api/api";

export default function Transfers() {
  const [fromShop, setFromShop] = useState("");
  const [toShop, setToShop] = useState("");
  const [itemId, setItemId] = useState("");
  const [quantity, setQuantity] = useState(1);

  const handleTransfer = async () => {
    try {
      await api.post("/transfers", {
        from_shop_id: fromShop,
        to_shop_id: toShop,
        item_id: itemId,
        quantity,
      });

      alert("Transfer completed!");
    } catch (err) {
      alert("Error creating transfer");
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold mb-4">Stock Transfer</h1>

      <div className="bg-white rounded-xl shadow p-6 grid grid-cols-2 gap-4">
        <div>
          <label>From Shop</label>
          <input
            className="w-full border p-2 rounded mt-1"
            value={fromShop}
            onChange={(e) => setFromShop(e.target.value)}
          />
        </div>

        <div>
          <label>To Shop</label>
          <input
            className="w-full border p-2 rounded mt-1"
            value={toShop}
            onChange={(e) => setToShop(e.target.value)}
          />
        </div>

        <div>
          <label>Item</label>
          <input
            className="w-full border p-2 rounded mt-1"
            value={itemId}
            onChange={(e) => setItemId(e.target.value)}
          />
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
