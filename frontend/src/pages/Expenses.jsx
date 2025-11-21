import { useState } from "react";
import api from "../api/api";

export default function Expenses() {
  const [shop, setShop] = useState("");
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");

  const handleExpense = async () => {
    try {
      await api.post("/expenses", {
        shop_id: shop,
        description,
        amount,
      });

      alert("Expense recorded!");
    } catch (err) {
      alert("Error recording expense");
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold mb-6">Expenses</h1>

      <div className="bg-white p-6 rounded-xl shadow grid grid-cols-2 gap-4">
        <div>
          <label>Shop</label>
          <input
            className="w-full p-2 border rounded mt-1"
            value={shop}
            onChange={(e) => setShop(e.target.value)}
          />
        </div>

        <div>
          <label>Amount</label>
          <input
            type="number"
            className="w-full p-2 border rounded mt-1"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
          />
        </div>

        <div className="col-span-2">
          <label>Description</label>
          <textarea
            className="w-full p-2 border rounded mt-1"
            rows="3"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>

        <button
          onClick={handleExpense}
          className="col-span-2 bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 mt-4"
        >
          Save Expense
        </button>
      </div>
    </div>
  );
}
