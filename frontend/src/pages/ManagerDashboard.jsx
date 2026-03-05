import React, { useContext, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import Card from '../components/Card'
import { AuthContext } from '../context/AuthContext'
import { SearchContext } from '../context/SearchContext'
import api from '../api/api'
import { Store, Package, TrendingUp, Users, SearchX, MapPin } from 'lucide-react'
import TransferHistory from '../components/TransferHistory'

export default function ManagerDashboard(){
  const { user } = useContext(AuthContext)
  const { searchQuery } = useContext(SearchContext)
  const [globalStock, setGlobalStock] = useState([]);
  const [salesSummary, setSalesSummary] = useState(null);
  const [depositsSummary, setDepositsSummary] = useState(null);
  const [lowStockCount, setLowStockCount] = useState(0);
  const [depositCustomersCount, setDepositCustomersCount] = useState(0);
  const [shops, setShops] = useState([]);
  const [stockSummary, setStockSummary] = useState(null);

  useEffect(() => {
    fetchGlobalStock();
    fetchShops();

    const fetchDashboardData = async () => {
        try {
            // Fetch Sales Summary (Global for Manager)
            const salesRes = await api.get('/reports/sales-summary');
            setSalesSummary(salesRes.data);

            // Fetch Deposits Summary (Global for Manager)
            const depositsRes = await api.get('/reports/deposits-summary');
            setDepositsSummary(depositsRes.data);

            // Fetch Low Stock Count (Global for Manager)
            const lowStockResponse = await api.get('/stocks/low_stock_count');
            setLowStockCount(lowStockResponse.data.count);

            // Fetch Deposit Customers Count (Global for Manager)
            const depositCustomersResponse = await api.get('/deposits/customers_count');
            setDepositCustomersCount(depositCustomersResponse.data.count);

            // Fetch Stock Summary
            const stockSummaryRes = await api.get('/reports/stock-summary');
            setStockSummary(stockSummaryRes.data);

        } catch (err) {
            console.error('Error fetching dashboard data:', err);
        }
    };

    fetchDashboardData();
  }, []);

  const fetchGlobalStock = async () => {
    try {
      // For manager, we want to see stock across all shops
      const response = await api.get(`/stocks/low_stock_items?threshold=1000000`);
      setGlobalStock(response.data);
    } catch (err) {
      console.error('Error fetching global stock');
    }
  };

  const fetchShops = async () => {
    try {
        const res = await api.get('/shops');
        setShops(res.data);
    } catch (err) {
        console.error('Error fetching shops');
    }
  };

  const formatCurrency = (val) => {
    return new Intl.NumberFormat('en-KE', { style: 'currency', currency: 'KES', minimumFractionDigits: 0 }).format(val || 0);
  };

  const filteredStock = searchQuery 
    ? globalStock.filter(stock => 
        stock.item_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        stock.shop_name.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : globalStock;

  return (
    <>
        <div className="mb-6 flex items-center gap-2 text-purple-700 dark:text-purple-400 bg-purple-50 dark:bg-purple-900/30 px-4 py-2 rounded-lg border border-purple-100 dark:border-purple-800 w-fit transition-colors">
          <MapPin size={20} />
          <span className="font-bold">Manager View: All Locations</span>
        </div>

        {/* SALES SUMMARY */}
        <div className="mb-10">
          <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-4 tracking-tight border-l-4 border-l-blue-600 pl-3 text-sm uppercase tracking-widest text-gray-400 dark:text-gray-500 transition-colors">Global Sales Summary</h3>
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
          <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-4 tracking-tight border-l-4 border-l-indigo-600 pl-3 text-sm uppercase tracking-widest text-gray-400 dark:text-gray-500 transition-colors">Global Deposit Collections</h3>
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
              <Card title="Low Stock Alerts" interactive={true} className="border-l-4 border-l-orange-500 flex justify-between items-center">
                <span>{lowStockCount} Items Low</span>
                <Package className="text-orange-200 dark:text-orange-900/30 group-hover:text-orange-400 dark:group-hover:text-orange-500 transition-colors" size={40} />
              </Card>
          </Link>
          <Link to="/attendant/deposits" className="no-underline group">
              <Card title="Global Active Accounts" interactive={true} className="border-l-4 border-l-indigo-500 flex justify-between items-center">
                <span>{depositCustomersCount} Active Accounts</span>
                <Users className="text-indigo-200 dark:text-indigo-900/30 group-hover:text-indigo-400 dark:group-hover:text-indigo-500 transition-colors" size={40} />
              </Card>
          </Link>
        </div>

        {/* STOCK SUMMARY BY CATEGORY */}
        <div className="mb-10">
          <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-4 tracking-tight border-l-4 border-l-green-600 pl-3 text-sm uppercase tracking-widest text-gray-400 dark:text-gray-500 transition-colors">Stock Summary by Category</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {stockSummary && Object.entries(stockSummary).map(([shopName, categories]) => (
              <div key={shopName} className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-green-100 dark:border-gray-700 bg-gradient-to-br from-white to-green-50/30 dark:from-gray-800 dark:to-green-900/10 transition-all">
                <h4 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                  <Store size={18} className="text-green-600 dark:text-green-400" />
                  {shopName}
                </h4>
                <div className="space-y-3">
                  {Object.entries(categories).map(([category, quantity]) => (
                    <div key={category} className="flex justify-between items-center p-3 bg-white/50 dark:bg-gray-900/50 rounded-xl border border-gray-50 dark:border-gray-700 group hover:border-green-300 dark:hover:border-green-800 transition-all cursor-default">
                      <span className="text-gray-600 dark:text-gray-400 font-bold tracking-tight">{category}s</span>
                      <span className="text-lg font-black text-gray-900 dark:text-white bg-green-100 dark:bg-green-900/50 px-3 py-1 rounded-lg text-green-700 dark:text-green-400 group-hover:scale-110 transition-transform">{quantity}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* TRANSFER HISTORY */}
        <TransferHistory />

        <div className="mt-10">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-gray-800 dark:text-white tracking-tight flex items-center gap-2 transition-colors">
              <TrendingUp size={24} className="text-blue-600 dark:text-blue-400" />
              Global Inventory Overview {searchQuery && <span className="text-sm font-medium text-blue-500 bg-blue-50 dark:bg-blue-900/30 px-2 py-0.5 rounded-full ml-2">Searching: "{searchQuery}"</span>}
            </h2>
          </div>
          
          {globalStock.length === 0 ? (
            <div className="bg-white dark:bg-gray-800 p-10 rounded-2xl shadow-sm border border-dashed border-gray-300 dark:border-gray-700 text-center text-gray-400 dark:text-gray-500 transition-colors">
              No stock items found across any shops.
            </div>
          ) : filteredStock.length === 0 ? (
            <div className="bg-white dark:bg-gray-800 p-20 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 text-center transition-colors">
              <SearchX size={48} className="mx-auto text-gray-300 dark:text-gray-600 mb-4 transition-colors" />
              <p className="text-gray-500 dark:text-gray-400 font-bold uppercase tracking-widest text-sm transition-colors">No matches found</p>
              <p className="text-xs text-gray-400 mt-2">Try searching by item name or shop name</p>
            </div>
          ) : (
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden transition-colors">
              <table className="min-w-full divide-y divide-gray-100 dark:divide-gray-700">
                <thead>
                  <tr className="bg-gray-50/50 dark:bg-gray-900/50 transition-colors">
                    <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest">Shop</th>
                    <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest">Item Name</th>
                    <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest">Quantity</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-700 bg-white dark:bg-gray-800 transition-colors">
                  {filteredStock.map((stock, idx) => {
                    const isMatch = searchQuery && (stock.item_name.toLowerCase().includes(searchQuery.toLowerCase()) || stock.shop_name.toLowerCase().includes(searchQuery.toLowerCase()));
                    return (
                      <tr key={idx} className="hover:bg-gray-50/50 dark:hover:bg-gray-900/50 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap text-gray-500 dark:text-gray-400 text-sm font-medium">
                          {stock.shop_name}
                        </td>
                        <td className={`px-6 py-4 whitespace-nowrap font-bold transition-colors ${isMatch ? 'text-blue-600 dark:text-blue-400 font-black' : 'text-gray-900 dark:text-white'}`}>
                          {stock.item_name}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-3 py-1 rounded-full text-sm font-bold ${stock.qty <= 2 ? 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400' : 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'}`}>
                            {stock.qty}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </>
  )
}
