import React, { useContext, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import Sidebar from '../components/Sidebar'
import Header from '../components/Header'
import Card from '../components/Card'
import { AuthContext } from '../context/AuthContext'
import api from '../api/api'

export default function AttendantDashboard(){
  const { user } = useContext(AuthContext)
  const [shopStock, setShopStock] = useState([]);
  const [availableItems, setAvailableItems] = useState([]);
  const [todaysSales, setTodaysSales] = useState(0);
  const [monthsSales, setMonthsSales] = useState(0);
  const [yearsSales, setYearsSales] = useState(0);
  const [lowStockCount, setLowStockCount] = useState(0);
  const [depositCustomersCount, setDepositCustomersCount] = useState(0);

  useEffect(() => {
    if (user?.shop_id) {
      fetchShopStock(user.shop_id);
    }
    fetchAvailableItems();

    const fetchDashboardData = async () => {
        try {
            // Fetch Sales Summary
            const salesResponse = await api.get('/reports/sales-summary');
            setTodaysSales(salesResponse.data.today);
            setMonthsSales(salesResponse.data.month);
            setYearsSales(salesResponse.data.year);

            // Fetch Low Stock Count
            const lowStockResponse = await api.get('/stocks/low_stock_count');
            setLowStockCount(lowStockResponse.data.count);

            // Fetch Deposit Customers Count
            const depositCustomersResponse = await api.get('/deposits/customers_count');
            setDepositCustomersCount(depositCustomersResponse.data.count);

        } catch (err) {
            console.error('Error fetching dashboard data:', err);
            alert('Error fetching dashboard data');
        }
    };

    fetchDashboardData();
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
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link to="/attendant/sales" className="no-underline">
              <Card title="Today's Sales">KES {todaysSales.toFixed(2)}</Card>
          </Link>
          <Link to="/attendant/sales/month" className="no-underline">
              <Card title="This Month's Sales">KES {monthsSales.toFixed(2)}</Card>
          </Link>
          <Link to="/attendant/sales/year" className="no-underline">
              <Card title="This Year's Sales">KES {yearsSales.toFixed(2)}</Card>
          </Link>
          <Link to="/attendant/low-stock" className="no-underline">
              <Card title="Low Stock Items">{lowStockCount}</Card>
          </Link>
          <Link to="/attendant/deposits" className="no-underline">
              <Card title="Deposit Customers">{depositCustomersCount}</Card>
          </Link>
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
                      <td className="px-6 py-4 whitespace-nowrap">{stock.item_name}</td>
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
