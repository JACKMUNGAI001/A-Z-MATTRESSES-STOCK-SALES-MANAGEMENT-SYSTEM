import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import api from "../../api/api";
import AttendantLayout from "../../components/AttendantLayout"; // Import AttendantLayout

export default function AdminShopStock() {
  const { shopId } = useParams();
  const [shopName, setShopName] = useState("");
  const [shopStock, setShopStock] = useState([]);
  const [availableItems, setAvailableItems] = useState([]);

  useEffect(() => {
    fetchShopDetails();
    fetchShopStock();
    fetchAvailableItems();
  }, [shopId]);

  const fetchShopDetails = async () => {
    try {
      const response = await api.get(`/shops/${shopId}`);
      setShopName(response.data.name);
    } catch (err) {
      alert("Error fetching shop details");
    }
  };

  const fetchShopStock = async () => {
    try {
      const response = await api.get(`/stocks/${shopId}`);
      setShopStock(response.data);
    } catch (err) {
      alert("Error fetching shop stock");
    }
  };

  const fetchAvailableItems = async () => {
    try {
      const response = await api.get("/items");
      setAvailableItems(response.data);
    } catch (err) {
      alert("Error fetching available items");
    }
  };

  const handleDeleteStock = async (itemId) => {
    if (window.confirm("Are you sure you want to delete this stock item?")) {
      try {
        await api.delete(`/stocks/${shopId}/${itemId}`);
        alert("Stock item deleted successfully!");
        fetchShopStock(); // Refresh stock list
      } catch (err) {
        alert(`Error deleting stock item: ${err.response?.data?.msg || err.message}`);
      }
    }
  };

  return (
    <AttendantLayout>
      <div className="p-6">
        <h1 className="text-2xl font-semibold mb-4">Stock for {shopName}</h1>

        <div className="bg-white p-6 rounded-xl shadow">
          <h2 className="text-xl font-semibold mb-4">Current Stock</h2>
          {shopStock.length === 0 ? (
            <p>No stock recorded for this shop.</p>
          ) : (
            <table className="w-full">
              <thead>
                <tr>
                  <th className="text-left">Item Name</th>
                  <th className="text-left">Quantity</th>
                  <th className="text-left">Buy Price</th>
                  <th className="text-left">Sell Price</th>
                  <th className="text-left">Actions</th>
                </tr>
              </thead>
              <tbody>
                {shopStock.map((stock) => (
                  <tr key={stock.item_id}>
                    <td>{availableItems.find(item => item.id === parseInt(stock.item_id))?.name}</td>
                    <td>{stock.qty}</td>
                    <td>KES {stock.buy_price.toFixed(2)}</td>
                    <td>KES {stock.sell_price.toFixed(2)}</td>
                    <td>
                      <button onClick={() => handleDeleteStock(stock.item_id)} className="bg-red-500 text-white py-1 px-2 rounded-lg">
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </AttendantLayout>
  );
}
