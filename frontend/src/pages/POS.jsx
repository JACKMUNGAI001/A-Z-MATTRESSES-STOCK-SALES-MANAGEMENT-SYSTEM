import { useState, useEffect, useContext } from "react";
import api, { API_BASE } from "../api/api";
import { AuthContext } from "../context/AuthContext";
import { ShoppingCart, Plus, Trash2, CreditCard, Store } from "lucide-react";

export default function POS() {
  const { user } = useContext(AuthContext);
  const [apiItems, setApiItems] = useState([]);
  const [cartItems, setCartItems] = useState([]);
  const [selectedItem, setSelectedItem] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [unitPrice, setUnitPrice] = useState("");
  const [paymentType, setPaymentType] = useState("cash");
  const [receiptUuid, setReceiptUuid] = useState(null);
  const [shops, setShops] = useState([]);
  const [selectedShop, setSelectedShop] = useState(user?.shop_id || "");

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

  const handleAddItem = () => {
    const itemToAdd = apiItems.find((i) => i.id === parseInt(selectedItem));
    if (!itemToAdd || !quantity || !unitPrice) {
      alert("Please select item, quantity and enter price.");
      return;
    }

    const price = parseFloat(unitPrice);
    if (isNaN(price) || price <= 0) {
      alert("Please enter a valid price.");
      return;
    }

    const existingCartItemIndex = cartItems.findIndex((i) => i.item_id === itemToAdd.id && i.unit_price === price);

    if (existingCartItemIndex > -1) {
      setCartItems(cartItems.map((item, index) =>
        index === existingCartItemIndex ? { ...item, qty: item.qty + quantity } : item
      ));
    } else {
      setCartItems([...cartItems, {
        item_id: itemToAdd.id,
        name: itemToAdd.name,
        qty: quantity,
        unit_price: price,
      }]);
    }
    setQuantity(1);
    setUnitPrice("");
    setSelectedItem("");
  };

  const handleRemoveFromCart = (indexToRemove) => {
    setCartItems(cartItems.filter((_, index) => index !== indexToRemove));
  };

  const handleSale = async () => {
    if (cartItems.length === 0) {
      alert("Cart is empty.");
      return;
    }
    if (!selectedShop) {
      alert("Please select a shop.");
      return;
    }
    try {
      const response = await api.post("/sales", {
        shop_id: selectedShop,
        items: cartItems.map(({ item_id, qty, unit_price }) => ({ item_id, qty, unit_price })),
        payment_type: paymentType,
      });
      setReceiptUuid(response.data.receipt_uuid);
      alert("Sale recorded successfully!");
      setCartItems([]);
    } catch (err) {
      alert(`Error recording sale: ${err.response?.data?.msg || err.message}`);
    }
  };

  return (
    <>
        <div className="flex flex-col lg:flex-row gap-8">
          {/* SELECT ITEMS */}
          <div className="flex-1 space-y-6">
            {(user?.role === 'manager' || user?.role === 'admin') && (
              <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 transition-colors">
                <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-6 flex items-center gap-2">
                  <Store size={24} className="text-purple-600 dark:text-purple-400" />
                  Select Shop
                </h2>
                <div>
                  <label className="block text-sm font-bold text-gray-700 dark:text-gray-400 uppercase tracking-wider mb-2">Acting For Shop</label>
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
            <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 transition-colors">
              <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-6 flex items-center gap-2">
                <Plus size={24} className="text-blue-600 dark:text-blue-400" />
                Add Items to Cart
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-bold text-gray-700 dark:text-gray-400 uppercase tracking-wider mb-2">Select Item</label>
                  <select
                    className="w-full p-3 border border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                    value={selectedItem}
                    onChange={(e) => setSelectedItem(e.target.value)}
                  >
                    <option value="">-- Choose Product --</option>
                    {apiItems.map((it) => (
                      <option key={it.id} value={it.id}>
                        {it.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 dark:text-gray-400 uppercase tracking-wider mb-2">Quantity</label>
                  <input
                    type="number"
                    className="w-full p-3 border border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                    value={quantity}
                    onChange={(e) => setQuantity(parseInt(e.target.value))}
                    min="1"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 dark:text-gray-400 uppercase tracking-wider mb-2">Unit Price</label>
                  <input
                    type="number"
                    className="w-full p-3 border border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none font-bold transition-all"
                    value={unitPrice}
                    onChange={(e) => setUnitPrice(e.target.value)}
                    placeholder="KES"
                  />
                </div>
              </div>
              <button
                onClick={handleAddItem}
                className="mt-6 bg-blue-600 text-white py-3 px-8 rounded-xl font-bold shadow-lg shadow-blue-100 dark:shadow-none hover:bg-blue-700 transition-all flex items-center gap-2"
              >
                <Plus size={20} /> Add to Cart
              </button>
            </div>

            {/* CART DISPLAY */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden transition-colors">
              <div className="bg-gray-50 dark:bg-gray-900/50 px-8 py-4 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center transition-colors">
                <h2 className="text-lg font-bold text-gray-800 dark:text-white flex items-center gap-2">
                  <ShoppingCart size={20} className="text-blue-600 dark:text-blue-400" />
                  Current Cart
                </h2>
                <span className="bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-400 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
                  {cartItems.length} Items
                </span>
              </div>
              <div className="p-0">
                {cartItems.length === 0 ? (
                  <div className="p-10 text-center text-gray-400 dark:text-gray-500 italic">Your cart is empty</div>
                ) : (
                  <table className="w-full">
                    <thead className="bg-gray-50/50 dark:bg-gray-900/50">
                      <tr>
                        <th className="px-8 py-4 text-left text-xs font-bold text-gray-500 dark:text-gray-400 uppercase">Item</th>
                        <th className="px-8 py-4 text-center text-xs font-bold text-gray-500 dark:text-gray-400 uppercase">Qty</th>
                        <th className="px-8 py-4 text-right text-xs font-bold text-gray-500 dark:text-gray-400 uppercase">Unit Price</th>
                        <th className="px-8 py-4 text-right text-xs font-bold text-gray-500 dark:text-gray-400 uppercase">Total</th>
                        <th className="px-8 py-4 text-center text-xs font-bold text-gray-500 dark:text-gray-400 uppercase">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50 dark:divide-gray-700">
                      {cartItems.map((item, index) => (
                        <tr key={index} className="hover:bg-gray-50/50 dark:hover:bg-gray-900/50 transition-colors">
                          <td className="px-8 py-4 font-bold text-gray-900 dark:text-white">{item.name}</td>
                          <td className="px-8 py-4 text-center text-gray-600 dark:text-gray-400 font-medium">{item.qty}</td>
                          <td className="px-8 py-4 text-right font-medium text-gray-600 dark:text-gray-400">
                            KES {item.unit_price.toLocaleString()}
                          </td>
                          <td className="px-8 py-4 text-right font-bold text-blue-600 dark:text-blue-400">
                            KES {(item.qty * item.unit_price).toLocaleString()}
                          </td>
                          <td className="px-8 py-4 text-center">
                            <button onClick={() => handleRemoveFromCart(index)} className="text-red-400 hover:text-red-600 transition-colors">
                              <Trash2 size={18} />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          </div>

          {/* CHECKOUT SIDEBAR */}
          <div className="w-full lg:w-80">
            <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-md border border-gray-100 dark:border-gray-700 sticky top-24 transition-colors">
              <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-6 flex items-center gap-2">
                <CreditCard size={24} className="text-blue-600 dark:text-blue-400" />
                Checkout
              </h2>
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-bold text-gray-700 dark:text-gray-400 uppercase tracking-wider mb-2">Payment Method</label>
                  <select
                    className="w-full p-3 border border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                    value={paymentType}
                    onChange={(e) => setPaymentType(e.target.value)}
                  >
                    <option value="cash">💵 Cash Payment</option>
                    <option value="mobile_money">📱 Mobile Money</option>
                  </select>
                </div>
                
                <div className="pt-6 border-t border-gray-100 dark:border-gray-700">
                  <div className="flex justify-between items-center mb-2 text-gray-500 dark:text-gray-400 font-medium uppercase text-xs tracking-widest">Subtotal</div>
                  <div className="flex justify-between items-center">
                    <span className="text-3xl font-black text-gray-900 dark:text-white">
                      KES {cartItems.reduce((sum, item) => sum + (item.qty * item.unit_price), 0).toLocaleString()}
                    </span>
                  </div>
                </div>

                <button
                  onClick={handleSale}
                  disabled={cartItems.length === 0}
                  className="w-full bg-blue-600 text-white py-4 rounded-xl font-bold shadow-lg shadow-blue-200 dark:shadow-none hover:bg-blue-700 hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                >
                  Complete Sale
                </button>

                {receiptUuid && (
                  <div className="pt-4 text-center">
                    <a
                      href={`${API_BASE}/receipts/${receiptUuid}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-block w-full border-2 border-blue-600 dark:border-blue-400 text-blue-600 dark:text-blue-400 py-3 rounded-xl font-bold hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all"
                    >
                      View Receipt
                    </a>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </>
  );
}
