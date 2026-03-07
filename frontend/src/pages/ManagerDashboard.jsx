import React, { useContext, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import Card from '../components/Card'
import { AuthContext } from '../context/AuthContext'
import { SearchContext } from '../context/SearchContext'
import api from '../api/api'
import { Store, Package, TrendingUp, Users, SearchX, MapPin, ChevronDown, ChevronUp } from 'lucide-react'
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
  const [isInventoryExpanded, setIsInventoryExpanded] = useState(false);

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

        {/* GLOBAL INVENTORY OVERVIEW */}
        <div className="mt-10">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden transition-colors">
            {/* COLLAPSIBLE HEADER (DROPDOWN BUTTON) */}
            <button 
              onClick={() => setIsInventoryExpanded(!isInventoryExpanded)}
              className={`w-full flex justify-between items-center p-6 transition-all ${
                isInventoryExpanded ? 'bg-blue-50 dark:bg-blue-900/20 border-b border-gray-100 dark:border-gray-700' : 'hover:bg-gray-50 dark:hover:bg-gray-900/50'
              }`}
            >
              <div className="flex items-center gap-3">
                <TrendingUp size={24} className="text-blue-600 dark:text-blue-400" />
                <div className="text-left">
                  <h2 className="text-xl font-bold text-gray-800 dark:text-white tracking-tight">Global Inventory Overview</h2>
                  <p className="text-xs text-gray-500 dark:text-gray-400 font-medium italic">Stock distribution across all shop locations</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                {searchQuery && <span className="text-sm font-medium text-blue-500 bg-blue-50 dark:bg-blue-900/30 px-2 py-0.5 rounded-full ml-2">Searching: "{searchQuery}"</span>}
                {isInventoryExpanded ? <ChevronUp className="text-gray-400" /> : <ChevronDown className="text-gray-400" />}
              </div>
            </button>

            {/* EXPANDABLE CONTENT */}
            {isInventoryExpanded && (
              <div className="p-6 bg-gray-50/30 dark:bg-gray-900/10 animate-in slide-in-from-top-2 duration-300">
                {globalStock.length === 0 ? (
                  <div className="p-10 text-center text-gray-400 dark:text-gray-500 transition-colors">
                    No stock items found across any shops.
                  </div>
                ) : (
                  <div className="flex flex-row-reverse gap-6 overflow-x-auto pb-4 custom-scrollbar">
                    {shops.map((shop) => {
                      const shopStock = filteredStock.filter(s => s.shop_name === shop.name);
                      return (
                        <div key={shop.id} className="min-w-[320px] flex-1 bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm overflow-hidden flex flex-col group hover:border-blue-200 dark:hover:border-blue-900/50 transition-all">
                          <div className="p-4 bg-gray-50/50 dark:bg-gray-900/50 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center group-hover:bg-blue-50/30 dark:group-hover:bg-blue-900/10 transition-colors">
                             <h4 className="font-bold text-gray-800 dark:text-white flex items-center gap-2 uppercase tracking-tighter">
                               <Store size={16} className="text-blue-600 dark:text-blue-400" />
                               {shop.name}
                             </h4>
                             <span className="bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-400 px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-widest">{shopStock.length} items</span>
                          </div>
                          <div className="flex-1 overflow-y-auto max-h-[350px] custom-scrollbar">
                             {shopStock.length === 0 ? (
                               <div className="p-10 text-center flex flex-col items-center gap-2">
                                 <SearchX size={24} className="text-gray-200 dark:text-gray-700" />
                                 <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">No matching items</p>
                               </div>
                             ) : (
                               <table className="min-w-full divide-y divide-gray-100 dark:divide-gray-700 border-separate border-spacing-0">
                                 <thead className="bg-gray-50/80 dark:bg-gray-900/80 sticky top-0 z-10 backdrop-blur-md">
                                   <tr>
                                      <th className="px-4 py-3 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest border-b border-gray-100 dark:border-gray-700">Item</th>
                                      <th className="px-4 py-3 text-center text-[10px] font-black text-gray-400 uppercase tracking-widest border-b border-gray-100 dark:border-gray-700">Qty</th>
                                   </tr>
                                 </thead>
                                 <tbody className="divide-y divide-gray-50 dark:divide-gray-700">
                                    {shopStock.map((stock, idx) => (
                                      <tr key={idx} className="hover:bg-blue-50/20 dark:hover:bg-blue-900/5 transition-colors group/row">
                                        <td className="px-4 py-3 text-xs font-bold text-gray-900 dark:text-white group-hover/row:text-blue-600 dark:group-hover/row:text-blue-400 transition-colors">
                                          {stock.item_name}
                                        </td>
                                        <td className="px-4 py-3 text-center">
                                           <span className={`px-2 py-0.5 rounded text-[10px] font-black tracking-tighter ${stock.qty <= 5 ? 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400' : 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'}`}>
                                              {stock.qty}
                                           </span>
                                        </td>
                                      </tr>
                                    ))}
                                 </tbody>
                               </table>
                             )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </>
  )
}
