import { useState, useEffect, useContext } from "react";
import api from "../api/api";
import { AuthContext } from "../context/AuthContext";

export default function POS() {
  const { user } = useContext(AuthContext);
  const [apiItems, setApiItems] = useState([]);
  const [cartItems, setCartItems] = useState([]);
  const [selectedItem, setSelectedItem] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [paymentType, setPaymentType] = useState("cash");
  const [receiptUuid, setReceiptUuid] = useState(null);

  useEffect(() => {
    const fetchItems = async () => {
      try {
        const response = await api.get("/items");
        setApiItems(response.data);
      } catch (err) {
        alert("Error fetching items");
      }
    };
    fetchItems();
  }, []);

  const handleAddItem = () => {
    const itemToAdd = apiItems.find((i) => i.id === parseInt(selectedItem));

    if (!itemToAdd || !quantity) {
      alert("Please select an item and quantity.");
      return;
    }

    const existingCartItemIndex = cartItems.findIndex(
      (i) => i.item_id === itemToAdd.id
    );

    if (existingCartItemIndex > -1) {
      setCartItems(
        cartItems.map((item, index) =>
          index === existingCartItemIndex
            ? { ...item, qty: item.qty + quantity }
            : item
        )
      );
    } else {
      setCartItems([
        ...cartItems,
        {
          item_id: itemToAdd.id,
          name: itemToAdd.name,
          qty: quantity,
          unit_price: itemToAdd.sell_price,
        },
      ]);
    }
    setQuantity(1); // Reset quantity after adding to cart
  };

  const handleRemoveFromCart = (indexToRemove) => {
    setCartItems(cartItems.filter((_, index) => index !== indexToRemove));
  };

  const handleSale = async () => {
    if (cartItems.length === 0) {
      alert("Cart is empty. Please add items before completing the sale.");
      return;
    }

    try {
      const response = await api.post("/sales", {
        shop_id: user.shop_id, // Assuming user has shop_id
        items: cartItems.map(({ item_id, qty, unit_price }) => ({
          item_id,
          qty,
          unit_price,
        })),
        payment_type: paymentType,
      });
      setReceiptUuid(response.data.receipt_uuid);
      alert("Sale recorded successfully!");
      setCartItems([]);
    } catch (err) {
      alert(`Error recording sale: ${err.response?.data?.msg || err.message}`);
    }
  };

  const currentSelectedItem = apiItems.find(
    (item) => item.id === parseInt(selectedItem)
  );

  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold mb-4">Point of Sale (POS)</h1>

      <div className="bg-white p-6 rounded-xl shadow">
        <div className="grid grid-cols-3 gap-4">
          <div className="col-span-2">
            <label className="font-medium">Select Item</label>
            <select
              className="w-full mt-1 p-2 border rounded"
              value={selectedItem}
              onChange={(e) => {
                setSelectedItem(e.target.value);
              }}
            >
              <option value="">-- Select Item --</option>
              {apiItems.map((it) => (
                <option key={it.id} value={it.id}>
                  {it.name} (KES {it.sell_price.toFixed(2)})
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
              onChange={(e) => setQuantity(parseInt(e.target.value))}
              min="1"
            />
          </div>
        </div>

        <button
          onClick={handleAddItem}
          className="mt-4 bg-green-600 text-white p-2 rounded-lg hover:bg-green-700"
        >
          Add to Cart
        </button>

        <div className="mt-6">
          <h2 className="text-xl font-semibold mb-2">Cart</h2>
          <ul>
            {cartItems.map((item, index) => (
              <li key={index} className="flex justify-between items-center py-1">
                <span>
                  {item.name} - {item.qty} x KES {item.unit_price.toFixed(2)}
                </span>
                <button
                  onClick={() => handleRemoveFromCart(index)}
                  className="ml-4 bg-red-500 text-white px-2 py-1 rounded-lg text-sm hover:bg-red-600"
                >
                  Remove
                </button>
              </li>
            ))}
          </ul>
        </div>

        <div className="grid grid-cols-2 gap-4 mt-6">
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

        {receiptUuid && (
          <div className="mt-4 text-center">
            <a
              href={`/receipts/${receiptUuid}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:underline"
            >
              View Receipt
            </a>
          </div>
        )}
      </div>
    </div>
  );
}
