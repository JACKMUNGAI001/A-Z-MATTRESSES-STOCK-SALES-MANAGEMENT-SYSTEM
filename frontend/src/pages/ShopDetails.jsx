import React, { useState, useEffect, useContext } from 'react';
import { useParams } from 'react-router-dom';
import api from '../api/api';
import Card from '../components/Card';
import Sidebar from "../components/Sidebar";
import Header from "../components/Header";
import { AuthContext } from '../context/AuthContext';
import { Store, Plus, ChevronDown, ChevronUp, AlertTriangle, TrendingUp, History, Package } from 'lucide-react';
import { formatDate } from '../utils/helpers';

export default function ShopDetails() {
  const { shopId } = useParams();
  const { user } = useContext(AuthContext);
  const [shop, setShop] = useState(null);
  const [shopSales, setShopSales] = useState([]);
  const [shopDeposits, setShopDeposits] = useState([]);
  const [shopStock, setShopStock] = useState([]);
  const [availableItems, setAvailableItems] = useState([]);
  const [stockFormData, setStockFormData] = useState({
    itemId: "", quantity: 1, buyPrice: "", sellPrice: "",
  });

  const [expandedSection, setExpandedSection] = useState(null);
  const lowStockItems = shopStock.filter(s => s.qty <= 2);

  useEffect(() => {
    fetchShopDetails();
    fetchShopSales();
    fetchShopDeposits();
    fetchShopStock();
    fetchAvailableItems();
  }, [shopId]);

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
      const response = await api.get(`/sales/${shopId}`);
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

  const handleAddStock = async () => {
    try {
      await api.post("/stocks/adjust", {
        shop_id: shopId,
        item_id: stockFormData.itemId,
        qty: parseInt(stockFormData.quantity),
        movement_type: "purchase_in",
        buy_price: parseFloat(stockFormData.buyPrice),
        sell_price: parseFloat(stockFormData.sellPrice),
      });
      alert("Stock added successfully!");
      fetchShopStock();
      setStockFormData({ itemId: "", quantity: 1, buyPrice: "", sellPrice: "" });
    } catch (err) {
      alert(`Error adding stock: ${err.response?.data?.msg || err.message}`);
    }
  };

  const formatCurrency = (val) => {
    return new Intl.NumberFormat('en-KE', { style: 'currency', currency: 'KES', minimumFractionDigits: 0 }).format(val || 0);
  };

  if (!shop) {
    return <div className="flex bg-[#f1f5f9] min-h-screen items-center justify-center text-gray-500 font-bold uppercase tracking-widest">Loading shop data...</div>;
  }

  return (
    <div className="flex bg-[#f1f5f9] min-h-screen">
      <Sidebar role="admin" />
      <main className="flex-1 p-8 max-w-7xl mx-auto w-full">
        <Header />

        <div className="mb-8 flex items-center gap-3">
          <div className="bg-blue-600 p-3 rounded-2xl text-white shadow-lg shadow-blue-200">
            <Store size={32} />
          </div>
          <div>
            <h1 className="text-3xl font-black text-gray-900 tracking-tight">{shop.name}</h1>
            <p className="text-gray-500 font-medium">{shop.address}</p>
          </div>
        </div>

        {/* SHOP METRICS */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          <Card title="Revenue (Total Sales)" className="border-l-4 border-l-green-500">
            {formatCurrency(shopSales.reduce((acc, sale) => acc + (sale.total_amount || 0), 0))}
          </Card>
          <Card title="Collections (Deposits)" className="border-l-4 border-l-blue-500">
            {formatCurrency(shopDeposits.reduce((acc, dep) => acc + (dep.total_paid || 0), 0))}
          </Card>
          <Card title="Stock Asset Value" className="border-l-4 border-l-purple-500">
            {formatCurrency(shopStock.reduce((acc, s) => acc + ((s.buy_price || 0) * (s.qty || 0)), 0))}
          </Card>
        </div>

        {/* ADD STOCK FORM */}
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 mb-10">
          <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
            <Plus size={24} className="text-blue-600" />
            Replenish Inventory
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div>
              <label className="block text-sm font-bold text-gray-700 uppercase mb-1">Product</label>
              <select
                name="itemId"
                className="w-full p-3 border border-gray-200 rounded-xl bg-gray-50 focus:ring-2 focus:ring-blue-500 outline-none"
                value={stockFormData.itemId}
                onChange={(e) => {
                  const id = e.target.value;
                  const item = availableItems.find(i => i.id === parseInt(id));
                  setStockFormData({
                    ...stockFormData,
                    itemId: id,
                    buyPrice: item ? item.buy_price : "",
                    sellPrice: item ? item.sell_price : ""
                  });
                }}
              >
                <option value="">Select Item</option>
                {availableItems.map((item) => (
                  <option key={item.id} value={item.id}>{item.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 uppercase mb-1">Quantity</label>
              <input name="quantity" type="number" className="w-full p-3 border border-gray-200 rounded-xl bg-gray-50 focus:ring-2 focus:ring-blue-500 outline-none font-bold text-blue-600" value={stockFormData.quantity} onChange={handleStockInputChange} />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 uppercase mb-1">Buy Price</label>
              <input name="buyPrice" type="number" className="w-full p-3 border border-gray-200 rounded-xl bg-gray-50 focus:ring-2 focus:ring-blue-500 outline-none" value={stockFormData.buyPrice} onChange={handleStockInputChange} />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 uppercase mb-1">Sell Price</label>
              <input name="sellPrice" type="number" className="w-full p-3 border border-gray-200 rounded-xl bg-gray-50 focus:ring-2 focus:ring-blue-500 outline-none" value={stockFormData.sellPrice} onChange={handleStockInputChange} />
            </div>
          </div>
          <button onClick={handleAddStock} className="mt-6 bg-blue-600 text-white py-3 px-10 rounded-xl font-bold shadow-lg shadow-blue-100 hover:bg-blue-700 transition-all">
            Confirm Restock
          </button>
        </div>

        {/* COLLAPSIBLE SECTIONS */}
        <div className="space-y-4">
          <Section 
            title="Sales History" 
            count={shopSales.length} 
            icon={TrendingUp} 
            color="blue"
            isExpanded={expandedSection === 'sales'} 
            onToggle={() => setExpandedSection(expandedSection === 'sales' ? null : 'sales')}
          >
            <table className="w-full">
              <thead className="bg-gray-50/50 text-xs font-bold text-gray-500 uppercase">
                <tr><th className="px-6 py-4 text-left">ID</th><th className="px-6 py-4 text-right">Amount</th><th className="px-6 py-4 text-left">Type</th><th className="px-6 py-4 text-left">Date</th></tr>
              </thead>
                              <tbody className="divide-y divide-gray-50">
                                {shopSales.map(s => (
                                  <tr key={s.id} className="hover:bg-gray-50/50"><td className="px-6 py-4 font-bold">{s.id}</td><td className="px-6 py-4 text-right font-black text-gray-900">{formatCurrency(s.total_amount)}</td><td className="px-6 py-4 text-gray-500 uppercase text-xs font-bold tracking-widest">{s.payment_type}</td><td className="px-6 py-4 text-gray-500">{formatDate(s.created_at)}</td></tr>
                                ))}
                              </tbody>            </table>
          </Section>

          <Section 
            title="Customer Deposits" 
            count={shopDeposits.length} 
            icon={History} 
            color="indigo"
            isExpanded={expandedSection === 'deposits'} 
            onToggle={() => setExpandedSection(expandedSection === 'deposits' ? null : 'deposits')}
          >
            <table className="w-full">
              <thead className="bg-gray-50/50 text-xs font-bold text-gray-500 uppercase">
                <tr><th className="px-6 py-4 text-left">Buyer</th><th className="px-6 py-4 text-right">Price</th><th className="px-6 py-4 text-left">Status</th></tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {shopDeposits.map(d => (
                  <tr key={d.id} className="hover:bg-gray-50/50"><td className="px-6 py-4 font-bold text-gray-900">{d.buyer_name}</td><td className="px-6 py-4 text-right font-black">{formatCurrency(d.selling_price)}</td><td className="px-6 py-4 italic text-sm text-gray-500 uppercase tracking-widest font-bold">{d.status}</td></tr>
                ))}
              </tbody>
            </table>
          </Section>

          <Section 
            title="Full Inventory List" 
            count={shopStock.length} 
            icon={Package} 
            color="purple"
            isExpanded={expandedSection === 'stock'} 
            onToggle={() => setExpandedSection(expandedSection === 'stock' ? null : 'stock')}
          >
            <table className="w-full">
              <thead className="bg-gray-50/50 text-xs font-bold text-gray-500 uppercase">
                <tr><th className="px-6 py-4 text-left">Item Name</th><th className="px-6 py-4 text-center">Qty</th><th className="px-6 py-4 text-right">Buy</th><th className="px-6 py-4 text-right">Sell</th></tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {shopStock.map(s => (
                  <tr key={s.id} className="hover:bg-gray-50/50"><td className="px-6 py-4 font-bold text-gray-900">{availableItems.find(i => i.id === s.item_id)?.name}</td><td className="px-6 py-4 text-center"><span className={`px-2 py-1 rounded-full text-xs font-black ${s.qty <= 2 ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>{s.qty}</span></td><td className="px-6 py-4 text-right font-mono text-xs text-gray-400">{formatCurrency(s.buy_price)}</td><td className="px-6 py-4 text-right font-black text-blue-600">{formatCurrency(s.sell_price)}</td></tr>
                ))}
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
            <table className="w-full">
              <thead className="bg-orange-50/50 text-xs font-bold text-orange-800 uppercase">
                <tr><th className="px-6 py-4 text-left">Item Name</th><th className="px-6 py-4 text-center">Qty</th></tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {lowStockItems.map(s => (
                  <tr key={s.id} className="hover:bg-orange-50/20"><td className="px-6 py-4 font-bold text-gray-900">{availableItems.find(i => i.id === s.item_id)?.name}</td><td className="px-6 py-4 text-center font-black text-red-600">{s.qty}</td></tr>
                ))}
              </tbody>
            </table>
          </Section>
        </div>
      </main>
    </div>
  );
}

function Section({ title, count, icon: Icon, color, isExpanded, onToggle, children }) {
  const colors = {
    blue: 'bg-blue-50 text-blue-700 hover:bg-blue-100 border-blue-100',
    indigo: 'bg-indigo-50 text-indigo-700 hover:bg-indigo-100 border-indigo-100',
    purple: 'bg-purple-50 text-purple-700 hover:bg-purple-100 border-purple-100',
    orange: 'bg-orange-50 text-orange-700 hover:bg-orange-100 border-orange-100',
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      <button 
        onClick={onToggle}
        className={`w-full flex justify-between items-center p-6 transition-all border-b border-transparent ${isExpanded ? 'border-gray-100 shadow-sm' : ''} ${colors[color]}`}
      >
        <div className="flex items-center gap-3">
          <Icon size={24} className={isExpanded ? 'animate-pulse' : ''} />
          <h2 className="text-xl font-bold tracking-tight">{title} <span className="ml-2 text-sm opacity-60">({count})</span></h2>
        </div>
        {isExpanded ? <ChevronUp size={24} /> : <ChevronDown size={24} />}
      </button>
      {isExpanded && (
        <div className="p-0 overflow-x-auto max-h-96 overflow-y-auto custom-scrollbar">
          {count === 0 ? (
            <div className="p-10 text-center text-gray-400 italic font-medium tracking-widest uppercase text-xs">No records available in this category</div>
          ) : children}
        </div>
      )}
    </div>
  )
}
