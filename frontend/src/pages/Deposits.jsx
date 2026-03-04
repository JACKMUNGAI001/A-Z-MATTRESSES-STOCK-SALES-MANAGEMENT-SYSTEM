import { useState, useEffect, useContext } from "react";
import api, { API_BASE } from "../api/api";
import { AuthContext } from "../context/AuthContext";
import { UserPlus, History, Wallet, CheckCircle, Store } from "lucide-react";

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
  const [shops, setShops] = useState([]);
  const [selectedShop, setSelectedShop] = useState(user?.shop_id || "");

  useEffect(() => {
    fetchDeposits();
    fetchItems();

    if (user?.role === 'manager' || user?.role === 'admin') {
      const fetchShops = async () => {
        try {
          const response = await api.get("/shops");
          setShops(response.data);
          if (!selectedShop && response.data.length > 0) {
            setSelectedShop(response.data[0].id);
          }
        } catch (err) {
          console.error("Error fetching shops");
        }
      };
      fetchShops();
    }
  }, [user]);

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
      if (!selectedShop) {
        alert("Please select a shop first.");
        return;
      }
      const data = { ...formData, shop_id: selectedShop };
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
        payment_method: "mobile_money",
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
    <>
        {(user?.role === 'manager' || user?.role === 'admin') && (
          <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 mb-10 transition-colors">
            <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-6 flex items-center gap-2 transition-colors">
              <Store size={24} className="text-purple-600 dark:text-purple-400" />
              Acting For Shop
            </h2>
            <div className="max-w-xs">
              <label className="block text-sm font-bold text-gray-700 dark:text-gray-400 uppercase tracking-wider mb-2 px-1">Select Shop</label>
              <select
                className="w-full p-3 border border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                value={selectedShop}
                onChange={(e) => setSelectedShop(e.target.value)}
              >
                <option value="">-- Choose Shop --</option>
                {shops.map((s) => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </select>
            </div>
          </div>
        )}
        {/* CREATE DEPOSIT */}
        <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 mb-10 transition-colors">
          <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-6 flex items-center gap-2 transition-colors">
            <UserPlus size={24} className="text-blue-600 dark:text-blue-400" />
            New Deposit Sale
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-bold text-gray-700 dark:text-gray-400 uppercase tracking-wider mb-2 px-1">Buyer Name</label>
              <input name="buyer_name" placeholder="Full Name" value={formData.buyer_name} onChange={handleInputChange} className="w-full p-3 border border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all" />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 dark:text-gray-400 uppercase tracking-wider mb-2 px-1">Phone Number</label>
              <input name="buyer_phone" placeholder="07..." value={formData.buyer_phone} onChange={handleInputChange} className="w-full p-3 border border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all" />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 dark:text-gray-400 uppercase tracking-wider mb-2 px-1">Select Item</label>
              <select name="item_id" value={formData.item_id} onChange={handleInputChange} className="w-full p-3 border border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all">
                <option value="">-- Choose Product --</option>
                {items.map((item) => (
                  <option key={item.id} value={item.id}>{item.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 dark:text-gray-400 uppercase tracking-wider mb-2 px-1">Selling Price</label>
              <input name="selling_price" type="number" placeholder="KES" value={formData.selling_price} onChange={handleInputChange} className="w-full p-3 border border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none font-bold transition-all" />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 dark:text-gray-400 uppercase tracking-wider mb-2 px-1">Initial Payment</label>
              <input name="amount" type="number" placeholder="KES" value={formData.amount} onChange={handleInputChange} className="w-full p-3 border border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none font-bold text-blue-600 dark:text-blue-400 transition-all" />
            </div>
          </div>
          <button onClick={createDepositSale} className="mt-8 bg-blue-600 text-white py-3 px-10 rounded-xl font-bold shadow-lg shadow-blue-100 dark:shadow-none hover:bg-blue-700 transition-all">
            Create Deposit Sale
          </button>
        </div>

        {/* ACTIVE DEPOSITS */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden transition-colors">
          <div className="bg-gray-50 dark:bg-gray-900/50 px-8 py-4 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center transition-colors">
            <h2 className="text-lg font-bold text-gray-800 dark:text-white flex items-center gap-2 transition-colors">
              <History size={20} className="text-blue-600 dark:text-blue-400" />
              Active Installment Sales
            </h2>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50/50 dark:bg-gray-900/50 transition-colors">
                <tr>
                  {(user?.role === 'manager' || user?.role === 'admin') && (
                    <th className="px-8 py-4 text-left text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest">Shop</th>
                  )}
                  <th className="px-8 py-4 text-left text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest">Buyer</th>
                  <th className="px-8 py-4 text-left text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest">Item</th>
                  <th className="px-8 py-4 text-right text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest">Total Paid</th>
                  <th className="px-8 py-4 text-right text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest">Balance</th>
                  <th className="px-8 py-4 text-center text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest">Make Payment</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 dark:divide-gray-700 bg-white dark:bg-gray-800 transition-colors">
                {deposits.filter(d => d.status === 'active').map((deposit) => (
                  <tr key={deposit.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-900/50 transition-colors">
                    {(user?.role === 'manager' || user?.role === 'admin') && (
                      <td className="px-8 py-4">
                        <div className="flex items-center gap-1 text-sm font-bold text-gray-500 dark:text-gray-400">
                          <Store size={14} className="text-gray-400" />
                          {deposit.shop_name}
                        </div>
                      </td>
                    )}
                    <td className="px-8 py-4">
                      <div className="font-bold text-gray-900 dark:text-white transition-colors">{deposit.buyer_name}</div>
                      <div className="text-xs text-gray-500 dark:text-gray-400 transition-colors">{deposit.buyer_phone}</div>
                    </td>
                    <td className="px-8 py-4 font-medium text-gray-700 dark:text-gray-300 transition-colors">{deposit.item_name}</td>
                    <td className="px-8 py-4 text-right font-bold text-gray-900 dark:text-white transition-colors">KES {(deposit.total_paid || 0).toLocaleString()}</td>
                    <td className="px-8 py-4 text-right font-bold text-red-600 dark:text-red-400 transition-colors">KES {(deposit.balance || 0).toLocaleString()}</td>
                    <td className="px-8 py-4">
                      <div className="flex items-center justify-center gap-2">
                        <input
                          type="number"
                          placeholder="Amount"
                          value={paymentAmounts[deposit.id] || ""}
                          onChange={(e) => setPaymentAmounts(prev => ({ ...prev, [deposit.id]: e.target.value }))}
                          className="w-24 p-2 border border-gray-200 dark:border-gray-700 rounded-lg text-sm bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none font-bold transition-all"
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
            <div className="p-8 bg-blue-50 dark:bg-blue-900/30 border-t border-blue-100 dark:border-blue-700 text-center transition-colors">
              <a href={`${API_BASE}/receipts/${receiptUuid}`} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 text-blue-700 dark:text-blue-400 font-bold hover:underline decoration-2 transition-colors">
                <Wallet size={20} /> Click here to View last transaction receipt
              </a>
            </div>
          )}
        </div>
      </>
  );
}
