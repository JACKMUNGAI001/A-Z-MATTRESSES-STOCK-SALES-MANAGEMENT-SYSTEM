import React, { useState, useEffect, useContext } from 'react';
import { useParams } from 'react-router-dom';
import api, { API_BASE } from '../api/api';
import Card from '../components/Card';
import { AuthContext } from '../context/AuthContext';
import { SearchContext } from '../context/SearchContext';
import { Store, Plus, ChevronDown, ChevronUp, AlertTriangle, TrendingUp, History, Package, SearchX, Edit, X, Save, History as HistoryIcon, Clock, CheckCircle } from 'lucide-react';
import { formatDate, formatPaymentMethod } from '../utils/helpers';
import SearchableSelect from '../components/SearchableSelect';

export default function ShopDetails() {
  const { shopId } = useParams();
  const { user } = useContext(AuthContext);
  const { searchQuery, searchType } = useContext(SearchContext);
  const [shop, setShop] = useState(null);
  const [shopSales, setShopSales] = useState([]);
  const [shopDeposits, setShopDeposits] = useState([]);
  const [shopStock, setShopStock] = useState([]);
  const [availableItems, setAvailableItems] = useState([]);
  const [stockFormData, setStockFormData] = useState({
    itemId: "", quantity: "", buyPrice: "",
  });
  const [itemsToRestock, setItemsToRestock] = useState([]);
  const [editingStock, setEditingStock] = useState(null);
  const [editFormData, setEditFormData] = useState({ qty: 0, buy_price: 0 });
  const [selectedDeposit, setSelectedDeposit] = useState(null);
  const [showHistory, setShowHistory] = useState(false);

  const [expandedSection, setExpandedSection] = useState('stock');
  const [salesSummary, setSalesSummary] = useState(null);
  const [pnlSummary, setPnlSummary] = useState({
    today: null,
    week: null,
    month: null,
    year: null,
  });
  const lowStockItems = shopStock.filter(s => s.qty <= 2);

  useEffect(() => {
    fetchShopDetails();
    fetchShopSales();
    fetchShopDeposits();
    fetchShopStock();
    fetchAvailableItems();
    fetchShopSummaries();
  }, [shopId]);

  const fetchShopSummaries = async () => {
    try {
      // Fetch sales summary for the shop
      const salesRes = await api.get(`/reports/sales-summary?shop_id=${shopId}`);
      setSalesSummary(salesRes.data);

      // Fetch PNL for different periods
      const [todayPnl, weekPnl, monthPnl, yearPnl] = await Promise.all([
        api.get(`/reports/pnl?shop_id=${shopId}&period=today`),
        api.get(`/reports/pnl?shop_id=${shopId}&period=this_week`),
        api.get(`/reports/pnl?shop_id=${shopId}&month=${new Date().getMonth() + 1}`),
        api.get(`/reports/pnl?shop_id=${shopId}&year=${new Date().getFullYear()}`),
      ]);

      setPnlSummary({
        today: todayPnl.data,
        week: weekPnl.data,
        month: monthPnl.data,
        year: yearPnl.data,
      });
    } catch (err) {
      console.error('Error fetching shop summaries:', err);
    }
  };

  const fetchShopDetails = async () => {
    try {
      const response = await api.get(`/shops/${shopId}`);
      setShop(response.data);
    } catch (err) {
      console.error('Error fetching shop details');
    }
  };

  const fetchShopSales = async () => {
    try {
      const response = await api.get(`/sales/shop/${shopId}`);
      setShopSales(response.data);
    } catch (err) {
      console.error('Error fetching shop sales');
    }
  };

  const fetchShopDeposits = async () => {
    try {
      const response = await api.get(`/deposits/shop/${shopId}`);
      setShopDeposits(response.data);
    } catch (err) {
      console.error('Error fetching shop deposits');
    }
  };

  const fetchShopStock = async () => {
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

  const handleStockInputChange = (e) => {
    const { name, value } = e.target;
    setStockFormData({ ...stockFormData, [name]: value });
  };

  const addItemToRestockList = () => {
    if (!stockFormData.itemId) {
      alert("Please select a product.");
      return;
    }
    if (parseInt(stockFormData.quantity) <= 0 || !stockFormData.quantity) {
      alert("Please enter a valid quantity.");
      return;
    }
    
    const selectedItem = availableItems.find(i => i.id === parseInt(stockFormData.itemId));
    const quantity = parseInt(stockFormData.quantity);
    const buyPrice = stockFormData.buyPrice ? parseFloat(stockFormData.buyPrice) : null;

    // Check if item already exists in the restock list
    const existingIndex = itemsToRestock.findIndex(item => item.itemId === stockFormData.itemId);
    
    if (existingIndex !== -1) {
      const updatedList = [...itemsToRestock];
      updatedList[existingIndex] = {
        ...updatedList[existingIndex],
        quantity: updatedList[existingIndex].quantity + quantity,
        // Update buy price if provided
        buyPrice: buyPrice !== null ? buyPrice : updatedList[existingIndex].buyPrice
      };
      setItemsToRestock(updatedList);
    } else {
      const newItem = {
        itemId: stockFormData.itemId,
        itemName: selectedItem?.name,
        quantity: quantity,
        buyPrice: buyPrice,
      };
      setItemsToRestock([...itemsToRestock, newItem]);
    }
    
    setStockFormData({ itemId: "", quantity: "", buyPrice: "" });
  };

  const removeItemFromRestockList = (index) => {
    setItemsToRestock(itemsToRestock.filter((_, i) => i !== index));
  };

  const handleConfirmRestock = async () => {
    if (itemsToRestock.length === 0) {
      alert("Please add at least one item to restock.");
      return;
    }

    try {
      await api.post("/stocks/adjust-bulk", {
        shop_id: shopId,
        items: itemsToRestock.map(item => ({
          item_id: item.itemId,
          qty: item.quantity,
          buy_price: item.buyPrice,
          movement_type: "purchase_in",
        })),
      });
      alert("Stock replenished successfully!");
      await fetchShopStock();
      setItemsToRestock([]);
      // Expand the inventory list section so user can see the updated stock
      setExpandedSection('stock');
    } catch (err) {
      alert(`Error adding stock: ${err.response?.data?.msg || err.message}`);
    }
  };

  const handleEditStock = (stock) => {
    const item = availableItems.find(i => i.id === stock.item_id);
    setEditingStock({ ...stock, item_name: item?.name });
    setEditFormData({ qty: stock.qty, buy_price: stock.buy_price || 0 });
  };

  const handleUpdateStock = async (e) => {
    e.preventDefault();
    try {
      await api.post("/stocks/adjust", {
        shop_id: parseInt(shopId),
        item_id: editingStock.item_id,
        qty: parseInt(editFormData.qty),
        buy_price: user?.role === 'admin' ? parseFloat(editFormData.buy_price) : undefined,
        movement_type: "manual_edit",
        override: true
      });
      alert("Stock updated successfully!");
      setEditingStock(null);
      fetchShopStock();
    } catch (err) {
      alert(`Error updating stock: ${err.response?.data?.msg || err.message}`);
    }
  };

  const formatCurrency = (val) => {
    return new Intl.NumberFormat('en-KE', { style: 'currency', currency: 'KES', minimumFractionDigits: 0 }).format(val || 0);
  };

  const filteredSales = searchQuery 
    ? shopSales.filter(s => {
        if (searchType === 'date') return new Date(s.created_at).toISOString().split('T')[0] === searchQuery;
        return s.items?.some(item => item.item_name.toLowerCase().includes(searchQuery.toLowerCase()));
      })
    : shopSales;

  const filteredDeposits = searchQuery
    ? shopDeposits.filter(d => {
        if (searchType === 'date') return new Date(d.created_at).toISOString().split('T')[0] === searchQuery;
        return d.item_name.toLowerCase().includes(searchQuery.toLowerCase()) || d.buyer_name.toLowerCase().includes(searchQuery.toLowerCase());
      })
    : shopDeposits;

  const filteredStock = searchQuery
    ? shopStock.filter(s => {
        const item = availableItems.find(i => i.id === s.item_id);
        return item?.name.toLowerCase().includes(searchQuery.toLowerCase());
      })
    : shopStock;

  if (!shop) {
    return <div className="flex bg-[#f1f5f9] dark:bg-[#0f172a] min-h-screen items-center justify-center text-gray-500 dark:text-gray-400 font-bold uppercase tracking-widest transition-colors">Loading shop data...</div>;
  }

  return (
    <>
        <div className="mb-8 flex items-center gap-3 transition-colors">
          <div className="bg-blue-600 p-3 rounded-2xl text-white shadow-lg shadow-blue-200 dark:shadow-none transition-colors">
            <Store size={32} />
          </div>
          <div>
            <h1 className="text-3xl font-black text-gray-900 dark:text-white tracking-tight transition-colors">{shop.name}</h1>
            <p className="text-gray-500 dark:text-gray-400 font-medium transition-colors">{shop.address}</p>
            {searchQuery && <p className="text-sm text-blue-500 font-bold mt-1">Searching for: "{searchQuery}"</p>}
          </div>
        </div>

        {/* SHOP METRICS */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10 transition-colors">
          <Card title="Revenue (Filtered)" className="border-l-4 border-l-green-500">
            {formatCurrency(filteredSales.reduce((acc, sale) => acc + (sale.total_amount || 0), 0))}
          </Card>
          <Card title="Collections (Filtered)" className="border-l-4 border-l-blue-500">
            {formatCurrency(filteredDeposits.reduce((acc, dep) => acc + (dep.total_paid || 0), 0))}
          </Card>
          {user?.role === 'admin' && (
            <Card title="Stock Asset Value" className="border-l-4 border-l-purple-500">
              {formatCurrency(filteredStock.reduce((acc, s) => acc + ((s.buy_price || 0) * (s.qty || 0)), 0))}
            </Card>
          )}
        </div>

        {/* ADD STOCK FORM */}
        <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 mb-10 transition-colors">
          <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-6 flex items-center gap-2 transition-colors">
            <Plus size={24} className="text-blue-600 dark:text-blue-400" />
            Replenish Inventory
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-bold text-gray-700 dark:text-gray-400 uppercase mb-1 px-1 transition-colors">Product</label>
              <SearchableSelect
                options={availableItems}
                value={stockFormData.itemId}
                onChange={(e) => {
                  const id = e.target.value;
                  setStockFormData({
                    ...stockFormData,
                    itemId: id,
                  });
                }}
                placeholder="Choose Product..."
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 dark:text-gray-400 uppercase mb-1 px-1 transition-colors">Quantity</label>
              <input name="quantity" type="number" className="w-full p-3 border border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-900 text-blue-600 dark:text-blue-400 focus:ring-2 focus:ring-blue-500 outline-none font-bold transition-all" value={stockFormData.quantity} onChange={handleStockInputChange} min="0" placeholder="0" />
            </div>
            {user?.role === 'admin' && (
              <div>
                <label className="block text-sm font-bold text-gray-700 dark:text-gray-400 uppercase mb-1 px-1 transition-colors">Buy Price (Optional)</label>
                <input name="buyPrice" type="number" className="w-full p-3 border border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all" value={stockFormData.buyPrice} onChange={handleStockInputChange} placeholder="Current buy price" />
              </div>
            )}
          </div>
          
          <button onClick={addItemToRestockList} className="mt-6 bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-white py-3 px-10 rounded-xl font-bold hover:bg-gray-200 dark:hover:bg-gray-600 transition-all flex items-center gap-2">
            <Plus size={18} /> Add Product to List
          </button>

          {itemsToRestock.length > 0 && (
            <div className="mt-8 border-t border-gray-100 dark:border-gray-700 pt-8">
              <h3 className="text-sm font-black text-gray-400 uppercase tracking-widest mb-4">Items to be Restocked</h3>
              <div className="space-y-3">
                {itemsToRestock.map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between bg-gray-50 dark:bg-gray-900/50 p-4 rounded-xl border border-gray-100 dark:border-gray-700">
                    <div className="flex items-center gap-4">
                      <div className="bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 w-10 h-10 rounded-lg flex items-center justify-center font-bold">
                        {idx + 1}
                      </div>
                      <div>
                        <p className="font-bold text-gray-900 dark:text-white">{item.itemName}</p>
                        <p className="text-xs text-gray-500 font-medium">Qty: <span className="text-blue-600 dark:text-blue-400 font-bold">{item.quantity}</span> {item.buyPrice && `| Buy Price: ${formatCurrency(item.buyPrice)}`}</p>
                      </div>
                    </div>
                    <button onClick={() => removeItemFromRestockList(idx)} className="text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 p-2 rounded-lg transition-all">
                      <X size={20} />
                    </button>
                  </div>
                ))}
              </div>
              <button onClick={handleConfirmRestock} className="mt-6 bg-blue-600 text-white py-4 px-12 rounded-xl font-black shadow-lg shadow-blue-100 dark:shadow-none hover:bg-blue-700 transition-all w-full md:w-auto uppercase tracking-widest">
                Confirm All & Restock
              </button>
            </div>
          )}
        </div>

        {/* SHOP SUMMARIES */}
        <div className="mb-10">
          <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-6 tracking-tight border-l-4 border-l-blue-600 pl-3 text-sm uppercase tracking-widest text-gray-400 dark:text-gray-500 transition-colors">Performance Overview</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Today */}
            <div className="space-y-4">
              <Card title="Today's Sales" className="border-l-4 border-l-blue-500 !p-5">
                <span className="text-xl font-black">{salesSummary ? formatCurrency(salesSummary.today) : '...'}</span>
              </Card>
              <Card title="Today's Gross Profit" className={`border-l-4 !p-5 border-l-green-500`}>
                <div className="flex flex-col">
                  <span className="text-xl font-black text-green-600 dark:text-green-400">
                    {pnlSummary.today ? formatCurrency(pnlSummary.today.gross_profit) : '...'}
                  </span>
                  {pnlSummary.today && pnlSummary.today.total_sales > 0 && (
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">
                      Margin: {((pnlSummary.today.gross_profit / pnlSummary.today.total_sales) * 100).toFixed(1)}%
                    </span>
                  )}
                </div>
              </Card>
            </div>

            {/* Week */}
            <div className="space-y-4">
              <Card title="This Week's Sales" className="border-l-4 border-l-blue-500 !p-5">
                <span className="text-xl font-black">{salesSummary ? formatCurrency(salesSummary.week) : '...'}</span>
              </Card>
              <Card title="This Week's Gross Profit" className={`border-l-4 !p-5 border-l-green-500`}>
                <div className="flex flex-col">
                  <span className="text-xl font-black text-green-600 dark:text-green-400">
                    {pnlSummary.week ? formatCurrency(pnlSummary.week.gross_profit) : '...'}
                  </span>
                  {pnlSummary.week && pnlSummary.week.total_sales > 0 && (
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">
                      Margin: {((pnlSummary.week.gross_profit / pnlSummary.week.total_sales) * 100).toFixed(1)}%
                    </span>
                  )}
                </div>
              </Card>
            </div>

            {/* Month */}
            <div className="space-y-4">
              <Card title="This Month's Sales" className="border-l-4 border-l-blue-500 !p-5">
                <span className="text-xl font-black">{salesSummary ? formatCurrency(salesSummary.month) : '...'}</span>
              </Card>
              <Card title="This Month's Gross Profit" className={`border-l-4 !p-5 border-l-green-500`}>
                <div className="flex flex-col">
                  <span className="text-xl font-black text-green-600 dark:text-green-400">
                    {pnlSummary.month ? formatCurrency(pnlSummary.month.gross_profit) : '...'}
                  </span>
                  {pnlSummary.month && pnlSummary.month.total_sales > 0 && (
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">
                      Margin: {((pnlSummary.month.gross_profit / pnlSummary.month.total_sales) * 100).toFixed(1)}%
                    </span>
                  )}
                </div>
              </Card>
            </div>

            {/* Year */}
            <div className="space-y-4">
              <Card title="This Year's Sales" className="border-l-4 border-l-blue-500 !p-5">
                <span className="text-xl font-black">{salesSummary ? formatCurrency(salesSummary.year) : '...'}</span>
              </Card>
              <Card title="This Year's Gross Profit" className={`border-l-4 !p-5 border-l-green-500`}>
                <div className="flex flex-col">
                  <span className="text-xl font-black text-green-600 dark:text-green-400">
                    {pnlSummary.year ? formatCurrency(pnlSummary.year.gross_profit) : '...'}
                  </span>
                  {pnlSummary.year && pnlSummary.year.total_sales > 0 && (
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">
                      Margin: {((pnlSummary.year.gross_profit / pnlSummary.year.total_sales) * 100).toFixed(1)}%
                    </span>
                  )}
                </div>
              </Card>
            </div>
          </div>
        </div>

        {/* COLLAPSIBLE SECTIONS */}
        <div className="space-y-4 transition-colors">
          <Section 
            title="Sales History" 
            count={filteredSales.length} 
            icon={TrendingUp} 
            color="blue"
            isExpanded={expandedSection === 'sales'} 
            onToggle={() => setExpandedSection(expandedSection === 'sales' ? null : 'sales')}
          >
            <table className="w-full relative border-collapse">
              <thead className="bg-gray-50/90 dark:bg-gray-900/90 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase transition-colors sticky top-0 z-10 backdrop-blur-sm">
                <tr>
                  <th className="px-6 py-4 text-left border-b border-gray-100 dark:border-gray-700">ID</th>
                  <th className="px-6 py-4 text-left border-b border-gray-100 dark:border-gray-700">Items Sold</th>
                  <th className="px-6 py-4 text-right border-b border-gray-100 dark:border-gray-700">Amount</th>
                  <th className="px-6 py-4 text-left border-b border-gray-100 dark:border-gray-700">Type</th>
                  <th className="px-6 py-4 text-left border-b border-gray-100 dark:border-gray-700">Date</th>
                  <th className="px-6 py-4 text-center border-b border-gray-100 dark:border-gray-700">Receipt</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 dark:divide-gray-700 transition-colors">
                {filteredSales.map(s => (
                  <tr key={s.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-900/50 transition-colors">
                    <td className="px-6 py-4 font-bold text-gray-900 dark:text-white">{s.id}</td>
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-1 max-w-xs">
                        {s.items?.map((item, idx) => {
                          const isMatch = searchQuery && item.item_name.toLowerCase().includes(searchQuery.toLowerCase());
                          return (
                            <span key={idx} className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-tight ${isMatch ? 'bg-blue-600 text-white shadow-sm' : 'bg-gray-100 dark:bg-gray-700/50 text-gray-700 dark:text-gray-300'}`}>
                              {item.item_name} (x{item.qty})
                            </span>
                          );
                        })}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right font-black text-gray-900 dark:text-white">{formatCurrency(s.total_amount)}</td>
                    <td className="px-6 py-4 text-blue-600 dark:text-blue-400 uppercase text-xs font-bold tracking-widest">{formatPaymentMethod(s.payment_type)}</td>
                    <td className="px-6 py-4 text-gray-500 dark:text-gray-400">{formatDate(s.created_at)}</td>
                    <td className="px-6 py-4 text-center">
                      {s.receipt_uuid ? (
                        <a
                          href={`${API_BASE}/receipts/${s.receipt_uuid}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 px-3 py-1.5 rounded-lg hover:bg-blue-600 hover:text-white transition-all font-black text-[10px] uppercase tracking-widest border border-blue-100 dark:border-blue-800 flex items-center justify-center gap-1 mx-auto w-fit"
                        >
                          <CheckCircle size={14} /> VIEW
                        </a>
                      ) : (
                        <span className="text-gray-400 italic text-[10px]">N/A</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Section>

          <Section 
            title="Customer Deposits" 
            count={filteredDeposits.length} 
            icon={History} 
            color="indigo"
            isExpanded={expandedSection === 'deposits'} 
            onToggle={() => setExpandedSection(expandedSection === 'deposits' ? null : 'deposits')}
          >
            <table className="w-full relative border-collapse">
              <thead className="bg-gray-50/90 dark:bg-gray-900/90 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase transition-colors sticky top-0 z-10 backdrop-blur-sm">
                <tr>
                    <th className="px-6 py-4 text-left border-b border-gray-100 dark:border-gray-700">Buyer</th>
                    <th className="px-6 py-4 text-left border-b border-gray-100 dark:border-gray-700">Item Info</th>
                    <th className="px-6 py-4 text-right border-b border-gray-100 dark:border-gray-700">Paid/Balance</th>
                    <th className="px-6 py-4 text-center border-b border-gray-100 dark:border-gray-700">Status</th>
                    <th className="px-6 py-4 text-center border-b border-gray-100 dark:border-gray-700">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 dark:divide-gray-700 transition-colors">
                {filteredDeposits.map(d => (
                  <tr key={d.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-900/50 transition-colors">
                    <td className="px-6 py-4">
                        <div className={`font-bold transition-colors ${searchQuery && d.buyer_name.toLowerCase().includes(searchQuery.toLowerCase()) ? 'text-blue-600 dark:text-blue-400' : 'text-gray-900 dark:text-white'}`}>{d.buyer_name}</div>
                        <div className="text-[10px] text-gray-400 font-bold uppercase">{d.buyer_phone}</div>
                    </td>
                    <td className={`px-6 py-4 text-xs font-bold transition-colors uppercase tracking-tight ${searchQuery && d.item_name.toLowerCase().includes(searchQuery.toLowerCase()) ? 'text-blue-600 dark:text-blue-400' : 'text-gray-700 dark:text-gray-300'}`}>{d.item_name}</td>
                    <td className="px-6 py-4 text-right">
                        <div className="font-black text-gray-900 dark:text-white">{formatCurrency(d.total_paid)}</div>
                        <div className="text-[10px] font-black text-red-500 uppercase tracking-tight">Due: {formatCurrency(d.balance)}</div>
                    </td>
                    <td className="px-6 py-4 italic text-sm text-gray-500 dark:text-gray-400 uppercase tracking-widest font-bold text-center">{d.status}</td>
                    <td className="px-6 py-4 text-center">
                        <button
                            onClick={() => {
                                setSelectedDeposit(d);
                                setShowHistory(true);
                            }}
                            className="bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 px-3 py-1.5 rounded-lg hover:bg-indigo-600 hover:text-white transition-all font-black text-[10px] uppercase tracking-widest border border-indigo-100 dark:border-indigo-800"
                        >
                            HISTORY
                        </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Section>

          <Section 
            title="Full Inventory List" 
            count={filteredStock.length} 
            icon={Package} 
            color="purple"
            isExpanded={expandedSection === 'stock'} 
            onToggle={() => setExpandedSection(expandedSection === 'stock' ? null : 'stock')}
          >
            <table className="w-full relative border-collapse">
              <thead className="bg-gray-50/90 dark:bg-gray-900/90 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase transition-colors sticky top-0 z-10 backdrop-blur-sm">
                <tr>
                    <th className="px-6 py-4 text-left border-b border-gray-100 dark:border-gray-700">Item Name</th>
                    <th className="px-6 py-4 text-center border-b border-gray-100 dark:border-gray-700">Qty</th>
                    {user?.role === 'admin' && <th className="px-6 py-4 text-right border-b border-gray-100 dark:border-gray-700">Cost Price</th>}
                    {(user?.role === 'admin' || user?.role === 'manager') && <th className="px-6 py-4 text-center border-b border-gray-100 dark:border-gray-700">Actions</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 dark:divide-gray-700 transition-colors">
                {filteredStock.map(s => {
                  const item = availableItems.find(i => i.id === s.item_id);
                  const isMatch = searchQuery && item?.name.toLowerCase().includes(searchQuery.toLowerCase());
                  return (
                    <tr key={s.item_id} className="hover:bg-gray-50/50 dark:hover:bg-gray-900/50 transition-colors">
                      <td className={`px-6 py-4 font-bold transition-colors ${isMatch ? 'text-blue-600 dark:text-blue-400 font-black' : 'text-gray-900 dark:text-white'}`}>{item?.name}</td>
                      <td className="px-6 py-4 text-center"><span className={`px-2 py-1 rounded-full text-xs font-black transition-colors ${s.qty <= 2 ? 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400' : 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'}`}>{s.qty}</span></td>
                      {user?.role === 'admin' && <td className="px-6 py-4 text-right font-mono text-xs text-gray-400 dark:text-gray-500 transition-colors">{formatCurrency(s.buy_price)}</td>}
                      {(user?.role === 'admin' || user?.role === 'manager') && (
                        <td className="px-6 py-4 text-center">
                            <button 
                                onClick={() => handleEditStock(s)} 
                                className="text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/30 p-2 rounded-lg transition-all"
                                title="Edit Stock"
                            >
                                <Edit size={16} />
                            </button>
                        </td>
                      )}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </Section>

          <Section 
            title="Low Stock Alerts" 
            count={lowStockItems.length} 
            icon={AlertTriangle} 
            color="orange"
            isExpanded={expandedSection === 'low_stock'} 
            onToggle={() => setExpandedSection(expandedSection === 'low_stock' ? null : 'low_stock')}
          >
            <table className="w-full relative border-collapse">
              <thead className="bg-orange-50/90 dark:bg-orange-900/90 text-xs font-bold text-orange-800 dark:text-orange-400 uppercase transition-colors sticky top-0 z-10 backdrop-blur-sm">
                <tr><th className="px-6 py-4 text-left border-b border-orange-100 dark:border-orange-800">Item Name</th><th className="px-6 py-4 text-center border-b border-orange-100 dark:border-orange-800">Qty</th></tr>
              </thead>
              <tbody className="divide-y divide-gray-50 dark:divide-gray-700 transition-colors">
                {lowStockItems.map(s => (
                  <tr key={s.item_id} className="hover:bg-orange-50/20 dark:hover:bg-orange-900/10 transition-colors"><td className="px-6 py-4 font-bold text-gray-900 dark:text-white">{availableItems.find(i => i.id === s.item_id)?.name}</td><td className="px-6 py-4 text-center font-black text-red-600 dark:text-red-400">{s.qty}</td></tr>
                ))}
              </tbody>
            </table>
          </Section>
        </div>

        {/* EDIT MODAL */}
        {editingStock && (
            <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
                    <div className="bg-blue-600 p-6 text-white flex justify-between items-center transition-colors">
                        <div>
                            <h3 className="text-xl font-bold">Edit Stock Quantity</h3>
                            <p className="text-blue-100 text-sm mt-1">{editingStock.item_name}</p>
                        </div>
                        <button onClick={() => setEditingStock(null)} className="text-white/80 hover:text-white transition-colors">
                            <X size={24} />
                        </button>
                    </div>
                    
                    <form onSubmit={handleUpdateStock} className="p-6 space-y-6">
                        <div>
                            <label className="block text-sm font-bold text-gray-700 dark:text-gray-400 uppercase tracking-widest mb-2 transition-colors">Current Quantity</label>
                            <input 
                                type="number" 
                                required
                                className="w-full border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg p-3 focus:ring-2 focus:ring-blue-500 outline-none transition-all font-bold text-lg"
                                value={editFormData.qty}
                                onChange={e => setEditFormData({...editFormData, qty: e.target.value})}
                                min="0"
                            />
                        </div>

                        {user?.role === 'admin' && (
                            <div>
                                <label className="block text-sm font-bold text-gray-700 dark:text-gray-400 uppercase tracking-widest mb-2 transition-colors">Buy Price (KES)</label>
                                <input 
                                    type="number" 
                                    step="0.01"
                                    className="w-full border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg p-3 focus:ring-2 focus:ring-blue-500 outline-none transition-all font-mono"
                                    value={editFormData.buy_price}
                                    onChange={e => setEditFormData({...editFormData, buy_price: e.target.value})}
                                />
                            </div>
                        )}

                        <div className="flex gap-3 pt-4 transition-colors">
                            <button 
                                type="button" 
                                onClick={() => setEditingStock(null)}
                                className="flex-1 px-4 py-3 border-2 border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 rounded-xl font-bold hover:bg-gray-50 dark:hover:bg-gray-900/50 transition-all"
                            >
                                Cancel
                            </button>
                            <button 
                                type="submit" 
                                className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-all shadow-xl shadow-blue-200 dark:shadow-none flex items-center justify-center gap-2"
                            >
                                <Save size={18} /> Update Stock
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        )}

        {/* HISTORY MODAL */}
        {showHistory && selectedDeposit && (
            <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden animate-in fade-in zoom-in duration-200 transition-colors">
                    <div className="bg-indigo-600 p-6 text-white flex justify-between items-center transition-colors">
                        <div>
                            <h3 className="text-xl font-bold flex items-center gap-2 uppercase tracking-tighter">
                                <HistoryIcon size={24} /> Payment History
                            </h3>
                            <p className="text-indigo-100 text-sm mt-1 font-medium">{selectedDeposit.buyer_name} — {selectedDeposit.item_name}</p>
                        </div>
                        <button onClick={() => {setShowHistory(false); setSelectedDeposit(null);}} className="text-white/80 hover:text-white transition-colors">
                            <X size={28} />
                        </button>
                    </div>

                    <div className="p-0 overflow-x-auto max-h-[60vh] overflow-y-auto custom-scrollbar">
                        <table className="w-full relative border-collapse">
                            <thead className="bg-gray-50/90 dark:bg-gray-900/90 text-xs font-black text-gray-400 dark:text-gray-500 uppercase transition-colors sticky top-0 z-10 backdrop-blur-sm">
                                <tr>
                                    <th className="px-6 py-4 text-left border-b border-gray-100 dark:border-gray-800">Date Paid</th>
                                    <th className="px-6 py-4 text-right border-b border-gray-100 dark:border-gray-800">Amount</th>
                                    <th className="px-6 py-4 text-center border-b border-gray-100 dark:border-gray-800">Receipt</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50 dark:divide-gray-800 transition-colors">
                                {selectedDeposit.payments && selectedDeposit.payments.length > 0 ? (
                                    selectedDeposit.payments.map((p, idx) => (
                                        <tr key={idx} className="hover:bg-indigo-50/10 dark:hover:bg-indigo-900/10 transition-colors">
                                            <td className="px-6 py-4 text-sm font-medium text-gray-700 dark:text-gray-300">{formatDate(p.paid_on)}</td>
                                            <td className="px-6 py-4 text-right font-black text-gray-900 dark:text-white">{formatCurrency(p.amount)}</td>
                                            <td className="px-6 py-4 text-center">
                                                <a
                                                    href={`${API_BASE}/receipts/${p.receipt_uuid}`}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="inline-flex items-center gap-1.5 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 px-3 py-1 rounded-lg hover:bg-blue-600 hover:text-white transition-all text-[10px] font-black uppercase tracking-widest border border-blue-100 dark:border-blue-800"
                                                >
                                                    <CheckCircle size={14} /> View
                                                </a>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="3" className="px-6 py-10 text-center text-gray-400 dark:text-gray-500 italic font-bold uppercase tracking-widest text-xs">No payments recorded yet.</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    <div className="p-8 bg-gray-50/50 dark:bg-gray-900/50 border-t border-gray-100 dark:border-gray-800 flex justify-between items-center transition-colors">
                        <div className="space-y-1">
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Total Collected</p>
                            <p className="text-2xl font-black text-green-600 dark:text-green-400">{formatCurrency(selectedDeposit.total_paid)}</p>
                        </div>
                        <div className="text-right space-y-1">
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Outstanding Balance</p>
                            <p className={`text-2xl font-black ${selectedDeposit.balance > 0 ? 'text-red-500' : 'text-blue-600 dark:text-blue-400'}`}>{formatCurrency(selectedDeposit.balance)}</p>
                        </div>
                    </div>
                    <div className="px-8 pb-8 bg-gray-50/50 dark:bg-gray-900/50">
                        <button 
                            onClick={() => {setShowHistory(false); setSelectedDeposit(null);}}
                            className="w-full bg-indigo-600 text-white py-4 rounded-xl font-black text-sm uppercase tracking-widest shadow-lg shadow-indigo-100 dark:shadow-none hover:bg-indigo-700 transition-all"
                        >
                            CLOSE HISTORY
                        </button>
                    </div>
                </div>
            </div>
        )}
    </>
  );
}

function Section({ title, count, icon: Icon, color, isExpanded, onToggle, children }) {
  const colors = {
    blue: 'bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/50 border-blue-100 dark:border-blue-800',
    indigo: 'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400 hover:bg-indigo-100 dark:hover:bg-indigo-900/50 border-indigo-100 dark:border-indigo-800',
    purple: 'bg-purple-50 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400 hover:bg-purple-100 dark:hover:bg-purple-900/50 border-purple-100 dark:border-purple-800',
    orange: 'bg-orange-50 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400 hover:bg-orange-100 dark:hover:bg-orange-900/50 border-orange-100 dark:border-orange-800',
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden transition-colors">
      <button 
        onClick={onToggle}
        className={`w-full flex justify-between items-center p-6 transition-all border-b border-transparent ${isExpanded ? 'border-gray-100 dark:border-gray-700 shadow-sm' : ''} ${colors[color]}`}
      >
        <div className="flex items-center gap-3">
          <Icon size={24} className={isExpanded ? 'animate-pulse' : ''} />
          <h2 className="text-xl font-bold tracking-tight">{title} <span className="ml-2 text-sm opacity-60">({count})</span></h2>
        </div>
        {isExpanded ? <ChevronUp size={24} /> : <ChevronDown size={24} />}
      </button>
      {isExpanded && (
        <div className="p-0 overflow-x-auto max-h-96 overflow-y-auto custom-scrollbar transition-colors">
          {count === 0 ? (
            <div className="p-10 text-center text-gray-400 dark:text-gray-500 italic font-medium tracking-widest uppercase text-xs transition-colors">
                <SearchX size={32} className="mx-auto mb-2 opacity-20" />
                No records match your search
            </div>
          ) : children}
        </div>
      )}
    </div>
  )
}
