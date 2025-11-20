import { useState } from "react";
import api from "../utils/api";

export default function Deposits() {
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [itemId, setItemId] = useState("");
  const [depositAmount, setDepositAmount] = useState("");

  const createDepositSale = async () => {
    try {
      await api.post("/deposits", {
        customer_name: customerName,
        customer_phone: customerPhone,
        item_id: itemId,
        amount: depositAmount,
      });

      alert("Deposit sale created!");
    } catch (err) {
      alert("Error creating deposit sale");
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold mb-4">Deposit Sales</h1>

      <div className="bg-white p-6 rounded-xl shadow grid grid-cols-2 gap-4">
        <div>
          <label className="font-medium">Buyer Name</label>
          <input
            className="w-full mt-1 p-2 border rounded"
            value={customerName}
            onChange={(e) => setCustomerName(e.target.value)}
          />
        </div>

        <div>
          <label className="font-medium">Phone Number</label>
          <input
            className="w-full mt-1 p-2 border rounded"
            value={customerPhone}
            onChange={(e) => setCustomerPhone(e.target.value)}
          />
        </div>

        <div>
          <label className="font-medium">Item</label>
          <input
            type="text"
            className="w-full mt-1 p-2 border rounded"
            placeholder="Item ID"
            value={itemId}
            onChange={(e) => setItemId(e.target.value)}
          />
        </div>

        <div>
          <label className="font-medium">Deposit Amount</label>
          <input
            className="w-full mt-1 p-2 border rounded"
            type="number"
            value={depositAmount}
            onChange={(e) => setDepositAmount(e.target.value)}
          />
        </div>

        <button
          onClick={createDepositSale}
          className="mt-6 col-span-2 bg-blue-600 p-3 rounded-lg text-white hover:bg-blue-700"
        >
          Create Deposit Sale
        </button>
      </div>
    </div>
  );
}
