import { useState, useEffect, useContext } from "react";
import api, { API_BASE } from "../api/api";
import { AuthContext } from "../context/AuthContext";
import Sidebar from "../components/Sidebar";
import Header from "../components/Header";
import { UserPlus, History, Wallet, CheckCircle } from "lucide-react";

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
      console.error("Error fetching deposits");
    }
  };

  const fetchItems = async () => {
    try {
      const response = await api.get("/items");
      setItems(response.data);
    } catch (err) {
      console.error("Error fetching items");
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
      setFormData({ buyer_name: "", buyer_phone: "", item_id: "", selling_price: "", amount: "" });
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

    const deposit = deposits.find(d => d.id === depositId);
    if (deposit && parseFloat(amount) > parseFloat(deposit.balance)) {
      alert(`Payment amount (KES ${amount}) exceeds the remaining balance (KES ${deposit.balance})`);
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
      setPaymentAmounts(prev => {
        const next = { ...prev };
        delete next[depositId];
        return next;
      });
    } catch (err) {
      alert(`Error making payment: ${err.response?.data?.msg || err.message}`);
    }
  };

  return (
    <div className="flex bg-[#f1f5f9] min-h-screen">
      <Sidebar role="attendant" />
      <main className="flex-1 p-8 max-w-7xl mx-auto w-full">
        <Header />

        {/* CREATE DEPOSIT */}
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 mb-10">
          <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
            <UserPlus size={24} className="text-blue-600" />
            New Deposit Sale
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-bold text-gray-700 uppercase tracking-wider mb-2">Buyer Name</label>
              <input name="buyer_name" placeholder="Full Name" value={formData.buyer_name} onChange={handleInputChange} className="w-full p-3 border border-gray-200 rounded-xl bg-gray-50 focus:ring-2 focus:ring-blue-500 outline-none" />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 uppercase tracking-wider mb-2">Phone Number</label>
              <input name="buyer_phone" placeholder="07..." value={formData.buyer_phone} onChange={handleInputChange} className="w-full p-3 border border-gray-200 rounded-xl bg-gray-50 focus:ring-2 focus:ring-blue-500 outline-none" />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 uppercase tracking-wider mb-2">Select Item</label>
              <select name="item_id" value={formData.item_id} onChange={handleInputChange} className="w-full p-3 border border-gray-200 rounded-xl bg-gray-50 focus:ring-2 focus:ring-blue-500 outline-none">
                <option value="">-- Choose Product --</option>
                {items.map((item) => (
                  <option key={item.id} value={item.id}>{item.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 uppercase tracking-wider mb-2">Selling Price</label>
              <input name="selling_price" type="number" placeholder="KES" value={formData.selling_price} onChange={handleInputChange} className="w-full p-3 border border-gray-200 rounded-xl bg-gray-50 focus:ring-2 focus:ring-blue-500 outline-none font-bold" />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 uppercase tracking-wider mb-2">Initial Payment</label>
              <input name="amount" type="number" placeholder="KES" value={formData.amount} onChange={handleInputChange} className="w-full p-3 border border-gray-200 rounded-xl bg-gray-50 focus:ring-2 focus:ring-blue-500 outline-none font-bold text-blue-600" />
            </div>
          </div>
          <button onClick={createDepositSale} className="mt-8 bg-blue-600 text-white py-3 px-10 rounded-xl font-bold shadow-lg shadow-blue-100 hover:bg-blue-700 transition-all">
            Create Deposit Sale
          </button>
        </div>

        {/* ACTIVE DEPOSITS */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="bg-gray-50 px-8 py-4 border-b border-gray-100 flex justify-between items-center">
            <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
              <History size={20} className="text-blue-600" />
              Active Installment Sales
            </h2>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50/50">
                <tr>
                  <th className="px-8 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-widest">Buyer</th>
                  <th className="px-8 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-widest">Item</th>
                  <th className="px-8 py-4 text-right text-xs font-bold text-gray-500 uppercase tracking-widest">Total Paid</th>
                  <th className="px-8 py-4 text-right text-xs font-bold text-gray-500 uppercase tracking-widest">Balance</th>
                  <th className="px-8 py-4 text-center text-xs font-bold text-gray-500 uppercase tracking-widest">Make Payment</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 bg-white">
                {deposits.filter(d => d.status === 'active').map((deposit) => (
                  <tr key={deposit.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-8 py-4">
                      <div className="font-bold text-gray-900">{deposit.buyer_name}</div>
                      <div className="text-xs text-gray-500">{deposit.buyer_phone}</div>
                    </td>
                    <td className="px-8 py-4 font-medium text-gray-700">{deposit.item_name}</td>
                    <td className="px-8 py-4 text-right font-bold text-gray-900">KES {(deposit.total_paid || 0).toLocaleString()}</td>
                    <td className="px-8 py-4 text-right font-bold text-red-600">KES {(deposit.balance || 0).toLocaleString()}</td>
                    <td className="px-8 py-4">
                      <div className="flex items-center justify-center gap-2">
                        <input
                          type="number"
                          placeholder="Amount"
                          value={paymentAmounts[deposit.id] || ""}
                          onChange={(e) => setPaymentAmounts(prev => ({ ...prev, [deposit.id]: e.target.value }))}
                          className="w-24 p-2 border border-gray-200 rounded-lg text-sm bg-gray-50 focus:ring-2 focus:ring-blue-500 outline-none font-bold"
                        />
                        <button onClick={() => handlePayment(deposit.id)} className="bg-green-600 text-white p-2 rounded-lg hover:bg-green-700 transition-all">
                          <CheckCircle size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {receiptUuid && (
            <div className="p-8 bg-blue-50 border-t border-blue-100 text-center">
              <a href={`${API_BASE}/receipts/${receiptUuid}`} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 text-blue-700 font-bold hover:underline decoration-2">
                <Wallet size={20} /> Click here to View last transaction receipt
              </a>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
