import { useState, useEffect, useContext } from "react";
import api from "../api/api";
import { AuthContext } from "../context/AuthContext";

export default function Deposits() {
  const { user } = useContext(AuthContext);
  const [deposits, setDeposits] = useState([]);
  const [items, setItems] = useState([]);
  const [formData, setFormData] = useState({
    buyer_name: "",
    buyer_phone: "",
    item_id: "",
    selling_price: "",
    amount: "",
  });
  const [paymentAmounts, setPaymentAmounts] = useState({});
  const [receiptUuid, setReceiptUuid] = useState(null);

  useEffect(() => {
    fetchDeposits();
    fetchItems();
  }, []);

  const fetchDeposits = async () => {
    try {
      const response = await api.get("/deposits");
      setDeposits(response.data);
    } catch (err) {
      alert("Error fetching deposits");
    }
  };

  const fetchItems = async () => {
    try {
      const response = await api.get("/items");
      setItems(response.data);
    } catch (err) {
      alert("Error fetching items");
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const createDepositSale = async () => {
    try {
      const data = { ...formData, shop_id: user.shop_id };
      await api.post("/deposits", data);
      alert("DEPOSIT SALE CREATED!");
      fetchDeposits();
      setFormData({
        buyer_name: "",
        buyer_phone: "",
        item_id: "",
        selling_price: "",
        amount: "",
      });
    } catch (err) {
      alert(`Error creating deposit sale: ${err.response?.data?.msg || err.message}`);
    }
  };

  const handlePayment = async (depositId) => {
    const amount = paymentAmounts[depositId];
    if (!amount || parseFloat(amount) <= 0) {
      alert("Please enter a valid amount");
      return;
    }
    try {
      const response = await api.post(`/deposits/${depositId}/payments`, {
        amount: amount,
        payment_method: "cash",
      });
      setReceiptUuid(response.data.receipt_uuid);
      alert("PAYMENT SUCCESSFUL");
      fetchDeposits();
      setPaymentAmounts(prevAmounts => {
        const newAmounts = { ...prevAmounts };
        delete newAmounts[depositId];
        return newAmounts;
      });
    } catch (err) {
      alert(`Error making payment: ${err.response?.data?.msg || err.message}`);
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold mb-4">Deposit Sales</h1>

      <div className="bg-white p-6 rounded-xl shadow mb-6">
        <h2 className="text-xl font-semibold mb-4">Create Deposit Sale</h2>
        <div className="grid grid-cols-2 gap-4">
          <input name="buyer_name" placeholder="Buyer Name" value={formData.buyer_name} onChange={handleInputChange} className="w-full p-2 border rounded" />
          <input name="buyer_phone" placeholder="Buyer Phone" value={formData.buyer_phone} onChange={handleInputChange} className="w-full p-2 border rounded" />
          <select name="item_id" value={formData.item_id} onChange={handleInputChange} className="w-full p-2 border rounded">
            <option value="">Select Item</option>
            {items.map((item) => (
              <option key={item.id} value={item.id}>{item.name}</option>
            ))}
          </select>
          <input name="selling_price" placeholder="Selling Price" value={formData.selling_price} onChange={handleInputChange} className="w-full p-2 border rounded" />
          <input name="amount" placeholder="Initial Payment" value={formData.amount} onChange={handleInputChange} className="w-full p-2 border rounded" />
        </div>
        <button onClick={createDepositSale} className="mt-4 bg-blue-600 text-white p-3 rounded-lg hover:bg-blue-700">
          Create Deposit Sale
        </button>
      </div>

      <div className="bg-white p-6 rounded-xl shadow">
        <h2 className="text-xl font-semibold mb-4">Active Deposits</h2>
        <table className="w-full">
          <thead>
            <tr>
              <th className="text-left">Buyer</th>
              <th className="text-left">Buyer Phone</th>
              <th className="text-left">Item</th>
              <th className="text-left">Total Paid</th>
              <th className="text-left">Balance</th>
              <th className="text-left">Make Payment</th>
            </tr>
          </thead>
          <tbody>
            {deposits.filter(d => d.status === 'active').map((deposit) => (
              <tr key={deposit.id}>
                <td>{deposit.buyer_name}</td>
                <td>{deposit.buyer_phone}</td>
                <td>{items.find(i => i.id === deposit.item_id)?.name}</td>
                <td>{deposit.total_paid || 0}</td>
                <td>{deposit.balance || 0}</td>
                <td>
                  <input
                    type="number"
                    value={paymentAmounts[deposit.id] || ""}
                    onChange={(e) => setPaymentAmounts(prev => ({ ...prev, [deposit.id]: e.target.value }))}
                    className="p-1 border rounded"
                  />
                  <button onClick={() => handlePayment(deposit.id)} className="bg-green-600 text-white p-1 rounded ml-2">Pay</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {receiptUuid && (
          <div className="mt-4 text-center">
            <a href={`/receipts/${receiptUuid}`} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
              View Receipt
            </a>
          </div>
        )}
      </div>
    </div>
  );
}
