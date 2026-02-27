import React, { useContext, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import Card from '../components/Card'
import { AuthContext } from '../context/AuthContext'
import api from '../api/api'
import { Store, Package, TrendingUp, Users, Wallet } from 'lucide-react'

export default function AttendantDashboard(){
  const { user } = useContext(AuthContext)
  const [shopStock, setShopStock] = useState([]);
  const [availableItems, setAvailableItems] = useState([]);
  const [salesSummary, setSalesSummary] = useState(null);
  const [depositsSummary, setDepositsSummary] = useState(null);
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
            const salesRes = await api.get('/reports/sales-summary');
            setSalesSummary(salesRes.data);

            // Fetch Deposits Summary
            const depositsRes = await api.get('/reports/deposits-summary');
            setDepositsSummary(depositsRes.data);

            // Fetch Low Stock Count
            const lowStockResponse = await api.get('/stocks/low_stock_count');
            setLowStockCount(lowStockResponse.data.count);

            // Fetch Deposit Customers Count
            const depositCustomersResponse = await api.get('/deposits/customers_count');
            setDepositCustomersCount(depositCustomersResponse.data.count);

        } catch (err) {
            console.error('Error fetching dashboard data:', err);
        }
    };

    fetchDashboardData();
  }, [user?.shop_id]);

  const fetchShopStock = async (shopId) => {
    try {
      const response = await api.get(`/stocks/${shopId}`);
      setShopStock(response.data);
    } catch (err) {
      console.error('Error fetching shop stock');
    }
  };

  const fetchAvailableItems = async () => {
    try {
      const response = await api.get("/items");
      setAvailableItems(response.data);
    } catch (err) {
      console.error("Error fetching available items");
    }
  };

  const formatCurrency = (val) => {
    return new Intl.NumberFormat('en-KE', { style: 'currency', currency: 'KES', minimumFractionDigits: 0 }).format(val || 0);
  };

  return (
    <>
        {user?.shop_name && (
          <div className="mb-6 flex items-center gap-2 text-blue-700 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30 px-4 py-2 rounded-lg border border-blue-100 dark:border-blue-800 w-fit transition-colors">
            <Store size={20} />
            <span className="font-bold">Your Location: {user.shop_name}</span>
          </div>
        )}

        {/* SALES SUMMARY */}
        <div className="mb-10">
          <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-4 tracking-tight border-l-4 border-l-blue-600 pl-3 text-sm uppercase tracking-widest text-gray-400 dark:text-gray-500 transition-colors">Sales Summary</h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Link to="/attendant/sales" className="no-underline group">
                <Card title="Today's Sales" interactive={true}>
                  {salesSummary ? formatCurrency(salesSummary.today) : '...'}
                </Card>
            </Link>
            <Link to="/attendant/sales/week" className="no-underline group">
                <Card title="This Week's" interactive={true}>
                  {salesSummary ? formatCurrency(salesSummary.week) : '...'}
                </Card>
            </Link>
            <Link to="/attendant/sales/month" className="no-underline group">
                <Card title="This Month's" interactive={true}>
                  {salesSummary ? formatCurrency(salesSummary.month) : '...'}
                </Card>
            </Link>
            <Link to="/attendant/sales/year" className="no-underline group">
                <Card title="This Year's" interactive={true}>
                  {salesSummary ? formatCurrency(salesSummary.year) : '...'}
                </Card>
            </Link>
          </div>
        </div>

        {/* DEPOSITS SUMMARY */}
        <div className="mb-10">
          <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-4 tracking-tight border-l-4 border-l-indigo-600 pl-3 text-sm uppercase tracking-widest text-gray-400 dark:text-gray-500 transition-colors">Deposit Collections</h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Link to="/attendant/deposits/today" className="no-underline group">
                <Card title="Today's" interactive={true}>
                  {depositsSummary ? formatCurrency(depositsSummary.today) : '...'}
                </Card>
            </Link>
            <Link to="/attendant/deposits/week" className="no-underline group">
                <Card title="This Week's" interactive={true}>
                  {depositsSummary ? formatCurrency(depositsSummary.week) : '...'}
                </Card>
            </Link>
            <Link to="/attendant/deposits/month" className="no-underline group">
                <Card title="This Month's" interactive={true}>
                  {depositsSummary ? formatCurrency(depositsSummary.month) : '...'}
                </Card>
            </Link>
            <Link to="/attendant/deposits/year" className="no-underline group">
                <Card title="This Year's" interactive={true}>
                  {depositsSummary ? formatCurrency(depositsSummary.year) : '...'}
                </Card>
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
          <Link to="/attendant/low-stock" className="no-underline group">
              <Card title="Low Stock Items" interactive={true} className="border-l-4 border-l-orange-500 flex justify-between items-center">
                <span>{lowStockCount}</span>
                <Package className="text-orange-200 dark:text-orange-900/30 group-hover:text-orange-400 dark:group-hover:text-orange-500 transition-colors" size={40} />
              </Card>
          </Link>
          <Link to="/deposits" className="no-underline group">
              <Card title="Manage Deposits" interactive={true} className="border-l-4 border-l-indigo-500 flex justify-between items-center">
                <span>{depositCustomersCount} Accounts</span>
                <Users className="text-indigo-200 dark:text-indigo-900/30 group-hover:text-indigo-400 dark:group-hover:text-indigo-500 transition-colors" size={40} />
              </Card>
          </Link>
        </div>

        <div className="mt-10">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-gray-800 dark:text-white tracking-tight flex items-center gap-2 transition-colors">
              <TrendingUp size={24} className="text-blue-600 dark:text-blue-400" />
              Current Inventory
            </h2>
          </div>
          
          {shopStock.length === 0 ? (
            <div className="bg-white dark:bg-gray-800 p-10 rounded-2xl shadow-sm border border-dashed border-gray-300 dark:border-gray-700 text-center text-gray-400 dark:text-gray-500 transition-colors">
              No stock items recorded for your shop yet.
            </div>
          ) : (
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden transition-colors">
              <table className="min-w-full divide-y divide-gray-100 dark:divide-gray-700">
                <thead>
                  <tr className="bg-gray-50/50 dark:bg-gray-900/50 transition-colors">
                    <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest">Item Name</th>
                    <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest">Quantity</th>
                    <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest">Sell Price</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50 dark:divide-gray-700 bg-white dark:bg-gray-800 transition-colors">
                  {shopStock.map((stock) => (
                    <tr key={stock.item_id} className="hover:bg-gray-50/50 dark:hover:bg-gray-900/50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap font-bold text-gray-900 dark:text-white">{stock.item_name}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-3 py-1 rounded-full text-sm font-bold ${stock.qty <= 2 ? 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400' : 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'}`}>
                          {stock.qty}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap font-mono text-gray-600 dark:text-gray-300 transition-colors">{formatCurrency(stock.sell_price)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </>
  )
}
