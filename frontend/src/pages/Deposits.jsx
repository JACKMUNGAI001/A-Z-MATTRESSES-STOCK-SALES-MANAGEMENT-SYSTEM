import { useState, useEffect, useContext } from "react";
import api, { API_BASE } from "../api/api";
import { AuthContext } from "../context/AuthContext";
import { UserPlus, History, Wallet, CheckCircle, Store } from "lucide-react";
import SearchableSelect from "../components/SearchableSelect";

export default function Deposits() {
  const { user } = useContext(AuthContext);
  const [apiItems, setApiItems] = useState([]);
  const [formData, setFormData] = useState({
    buyer_name: "",
    buyer_phone: "",
    item_id: "",
    selling_price: "",
    amount: "",
    shop_id: user?.shop_id || "",
  });
  const [shops, setShops] = useState([]);
  const [lastReceipt, setLastReceipt] = useState(null);

  useEffect(() => {
    const fetchItems = async () => {
      try {
        const response = await api.get("/items");
        setApiItems(response.data);
      } catch (err) {
        console.error("Error fetching items");
      }
    };
    fetchItems();

    if (user?.role === 'manager' || user?.role === 'admin') {
      const fetchShops = async () => {
        try {
          const response = await api.get("/shops");
          setShops(response.data);
          if (!formData.shop_id && response.data.length > 0) {
            setFormData(prev => ({ ...prev, shop_id: response.data[0].id }));
          }
        } catch (err) {
          console.error("Error fetching shops");
        }
      };
      fetchShops();
    }
  }, [user]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleCreateDeposit = async (e) => {
    e.preventDefault();
    if (!formData.shop_id) {
      alert("Please select a shop.");
      return;
    }
    try {
      const res = await api.post("/deposits", formData);
      const deposit_id = res.data.deposit_id;
      // Record initial payment
      const payRes = await api.post(`/deposits/${deposit_id}/payments`, {
        amount: formData.amount,
        payment_method: "mobile_money",
      });
      setLastReceipt(payRes.data.receipt_uuid);
      alert("Deposit account created successfully!");
      setFormData({
        buyer_name: "",
        buyer_phone: "",
        item_id: "",
        selling_price: "",
        amount: "",
        shop_id: user?.shop_id || "",
      });
    } catch (err) {
      alert(`Error: ${err.response?.data?.msg || err.message}`);
    }
  };

  return (
    <>
        <div className="max-w-4xl">
          {(user?.role === 'manager' || user?.role === 'admin') && (
            <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 mb-8 transition-colors">
              <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-6 flex items-center gap-2">
                <Store size={24} className="text-purple-600 dark:text-purple-400" />
                Select Shop
              </h2>
              <div>
                <label className="block text-sm font-bold text-gray-700 dark:text-gray-400 uppercase tracking-wider mb-2">Acting For Shop</label>
                <SearchableSelect
                  options={shops}
                  value={formData.shop_id}
                  onChange={(e) => setFormData({ ...formData, shop_id: e.target.value })}
                  placeholder="Choose Shop..."
                />
              </div>
            </div>
          )}

          <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 transition-colors">
            <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-8 flex items-center gap-3">
              <UserPlus className="text-blue-600 dark:text-blue-400" size={28} />
              Open New Deposit Account
            </h2>
            
            <form onSubmit={handleCreateDeposit} className="space-y-8">
              {/* CUSTOMER INFO */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-bold text-gray-700 dark:text-gray-400 uppercase tracking-wider mb-2 px-1">Customer Full Name</label>
                  <input
                    required
                    name="buyer_name"
                    className="w-full p-3 border border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none font-bold transition-all"
                    value={formData.buyer_name}
                    onChange={handleInputChange}
                    placeholder="e.g. Jane Doe"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 dark:text-gray-400 uppercase tracking-wider mb-2 px-1">Phone Number</label>
                  <input
                    required
                    name="buyer_phone"
                    className="w-full p-3 border border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none font-bold transition-all"
                    value={formData.buyer_phone}
                    onChange={handleInputChange}
                    placeholder="07..."
                  />
                </div>
              </div>

              {/* ITEM & PRICE */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-bold text-gray-700 dark:text-gray-400 uppercase tracking-wider mb-2 px-1">Select Product</label>
                  <SearchableSelect
                    options={apiItems}
                    value={formData.item_id}
                    onChange={(e) => setFormData({ ...formData, item_id: e.target.value })}
                    placeholder="Choose Product..."
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 dark:text-gray-400 uppercase tracking-wider mb-2 px-1">Agreed Selling Price</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 font-bold">KES</span>
                    <input
                      required
                      type="number"
                      name="selling_price"
                      className="w-full pl-12 pr-4 py-3 border border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none font-black transition-all"
                      value={formData.selling_price}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>
              </div>

              {/* INITIAL PAYMENT */}
              <div className="bg-blue-50 dark:bg-blue-900/20 p-6 rounded-2xl border border-blue-100 dark:border-blue-800">
                <div className="flex items-center gap-2 mb-4 text-blue-700 dark:text-blue-400 font-bold uppercase text-xs tracking-widest">
                  <Wallet size={16} /> Initial Down-payment
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-end">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 dark:text-gray-400 uppercase tracking-wider mb-2">Amount Paid Now</label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-blue-400 font-bold">KES</span>
                      <input
                        required
                        type="number"
                        name="amount"
                        className="w-full pl-12 pr-4 py-3 border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-900 text-blue-600 dark:text-blue-400 focus:ring-2 focus:ring-blue-500 outline-none font-black text-xl transition-all"
                        value={formData.amount}
                        onChange={handleInputChange}
                      />
                    </div>
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-widest px-1">Payment Method</label>
                    <div className="p-3 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-700 dark:text-gray-300 font-bold flex items-center gap-2">
                      <CheckCircle className="text-green-500" size={18} />
                      Mobile Money (M-PESA)
                    </div>
                  </div>
                </div>
              </div>

              <button
                type="submit"
                className="w-full bg-blue-600 text-white py-4 rounded-xl font-black text-lg shadow-xl shadow-blue-100 dark:shadow-none hover:bg-blue-700 hover:-translate-y-0.5 transition-all"
              >
                Confirm & Create Account
              </button>
            </form>
          </div>

          {lastReceipt && (
            <div className="mt-6 text-center animate-bounce">
              <a
                href={`${API_BASE}/receipts/${lastReceipt}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-blue-600 dark:text-blue-400 font-bold hover:underline decoration-2 transition-colors"
              >
                <Wallet size={20} /> Click here to View last transaction receipt
              </a>
            </div>
          )}
        </div>
      </>
  );
}
