import React, { useContext, useEffect, useState } from 'react'
import Sidebar from '../components/Sidebar'
import Header from '../components/Header'
import Card from '../components/Card'
import { AuthContext } from '../context/AuthContext'
import api from '../api/api'

export default function AttendantDashboard(){
  const { user } = useContext(AuthContext)
  const [shopStock, setShopStock] = useState([]);
  const [availableItems, setAvailableItems] = useState([]);

  useEffect(() => {
    if (user?.shop_id) {
      fetchShopStock(user.shop_id);
    }
    fetchAvailableItems();
  }, [user?.shop_id]);

  const fetchShopStock = async (shopId) => {
    try {
      const response = await api.get(`/stocks/${shopId}`);
      setShopStock(response.data);
    } catch (err) {
      alert('Error fetching shop stock');
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

  return (
    <div className="flex">
      <Sidebar role="attendant" />
      <main className="flex-1 p-6">
        <Header />
        {user?.shop_name && (
          <div className="mb-4 text-lg font-semibold">
            Your Shop: {user.shop_name}
          </div>
        )}
        <div className="grid grid-cols-3 gap-4">
          <Card title="Today's Sales">KES 0</Card>
          <Card title="Low Stock Items">0</Card>
          <Card title="Deposit Customers">0</Card>
        </div>

        <div className="mt-6">
          <h2 className="text-xl font-semibold mb-4">Current Stock</h2>
          {shopStock.length === 0 ? (
            <p>No stock recorded for your shop.</p>
          ) : (
            <div className="bg-white p-4 rounded-xl shadow">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Item Name</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Quantity</th>
                    {user?.role !== "attendant" && (
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Buy Price</th>
                    )}
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Sell Price</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {shopStock.map((stock) => (
                    <tr key={stock.id}>
                      <td className="px-6 py-4 whitespace-nowrap">{availableItems.find(item => item.id === stock.item_id)?.name}</td>
                      <td className="px-6 py-4 whitespace-nowrap">{stock.qty}</td>
                      {user?.role !== "attendant" && (
                        <td className="px-6 py-4 whitespace-nowrap">KES {stock.buy_price.toFixed(2)}</td>
                      )}
                      <td className="px-6 py-4 whitespace-nowrap">KES {stock.sell_price.toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
