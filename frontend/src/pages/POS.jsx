import { useState } from "react";
import api from "../utils/api";

export default function POS() {
  const [items, setItems] = useState([]);
  const [selectedItem, setSelectedItem] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [paymentType, setPaymentType] = useState("cash");
  const [buyer, setBuyer] = useState("");

  const handleSale = async () => {
    try {
      await api.post("/sales", {
        item_id: selectedItem,
        quantity,
        payment_type: paymentType,
        buyer_name: buyer,
      });

      alert("Sale recorded successfully!");
    } catch (err) {
      alert("Error recording sale");
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold mb-4">Point of Sale (POS)</h1>

      <div className="bg-white p-6 rounded-xl shadow">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="font-medium">Select Item</label>
            <select
              className="w-full mt-1 p-2 border rounded"
              value={selectedItem}
              onChange={(e) => setSelectedItem(e.target.value)}
            >
              <option value="">-- Select Item --</option>
              {/* Dynamically load items */}

              {items.map((it) => (
                <option key={it.id} value={it.id}>
                  {it.name} ({it.stock})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="font-medium">Quantity</label>
            <input
              type="number"
              className="w-full mt-1 p-2 border rounded"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
            />
          </div>

          <div>
            <label className="font-medium">Buyer Name (Optional)</label>
            <input
              type="text"
              className="w-full mt-1 p-2 border rounded"
              value={buyer}
              onChange={(e) => setBuyer(e.target.value)}
            />
          </div>

          <div>
            <label className="font-medium">Payment Type</label>
            <select
              className="w-full mt-1 p-2 border rounded"
              value={paymentType}
              onChange={(e) => setPaymentType(e.target.value)}
            >
              <option value="cash">Cash</option>
              <option value="mobile_money">Mobile Money</option>
            </select>
          </div>
        </div>

        <button
          onClick={handleSale}
          className="mt-6 w-full bg-blue-600 text-white p-3 rounded-lg hover:bg-blue-700"
        >
          Complete Sale
        </button>
      </div>
    </div>
  );
}
