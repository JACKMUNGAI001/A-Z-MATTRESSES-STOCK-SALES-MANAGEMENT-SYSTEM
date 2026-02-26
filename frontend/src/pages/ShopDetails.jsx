import React, { useState, useEffect, useContext } from 'react';
import { useParams } from 'react-router-dom';
import api from '../api/api';
import Card from '../components/Card';
import { AuthContext } from '../context/AuthContext';

export default function ShopDetails() {
  const { shopId } = useParams();
  const { user } = useContext(AuthContext);
  const [shop, setShop] = useState(null);
  const [shopSales, setShopSales] = useState([]);
  const [shopDeposits, setShopDeposits] = useState([]);
  const [shopStock, setShopStock] = useState([]);
  const [availableItems, setAvailableItems] = useState([]);
  const [stockFormData, setStockFormData] = useState({
    itemId: "",
    quantity: 1,
    buyPrice: "",
    sellPrice: "",
  });

  const [expandedSection, setExpandedSection] = useState(null); // 'sales', 'deposits', 'stock', or 'low_stock'

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
      alert('Error fetching shop details');
    }
  };

  const fetchShopSales = async () => {
    try {
      const response = await api.get(`/sales/${shopId}`);
      setShopSales(response.data);
    } catch (err) {
      alert('Error fetching shop sales');
    }
  };

  const fetchShopDeposits = async () => {
    try {
      const response = await api.get(`/deposits/shop/${shopId}`);
      setShopDeposits(response.data);
    } catch (err) {
      alert('Error fetching shop deposits');
    }
  };

  const fetchShopStock = async () => {
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
      fetchShopStock(); // Refresh stock data
      setStockFormData({
        itemId: "",
        quantity: 1,
        buyPrice: "",
        sellPrice: "",
      });
    } catch (err) {
      alert(`Error adding stock: ${err.response?.data?.msg || err.message}`);
    }
  };

  const selectedItem = availableItems.find(
    (item) => item.id === parseInt(stockFormData.itemId)
  );

  if (!shop) {
    return <div className="p-6">Loading shop details...</div>;
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold mb-4">Shop: {shop.name}</h1>
      <p className="text-gray-600 mb-6">Address: {shop.address}</p>

      <div className="grid grid-cols-3 gap-4 mb-6">
        <Card title="Total Sales">KES {shopSales.reduce((acc, sale) => acc + (sale.total_amount || 0), 0).toFixed(2)}</Card>
        <Card title="Total Deposits">KES {shopDeposits.reduce((acc, dep) => acc + (dep.total_paid || 0), 0).toFixed(2)}</Card>
        <Card title="Current Stock Value">KES {shopStock.reduce((acc, stock) => acc + ((stock.buy_price || 0) * (stock.qty || 0)), 0).toFixed(2)}</Card>
      </div>

      <div className="bg-white p-6 rounded-xl shadow mb-6">
        <h2 className="text-xl font-semibold mb-4">Add Stock</h2>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label>Item</label>
            <select
              name="itemId"
              className="w-full p-2 border rounded mt-1"
              value={stockFormData.itemId}
              onChange={(e) => {
                const selectedItemId = e.target.value;
                const item = availableItems.find(i => i.id === parseInt(selectedItemId));
                setStockFormData({
                  ...stockFormData,
                  itemId: selectedItemId,
                  buyPrice: item ? item.buy_price : "",
                  sellPrice: item ? item.sell_price : "",
                });
              }}
            >
              <option value="">Select Item</option>
              {availableItems.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label>Quantity</label>
            <input
              name="quantity"
              type="number"
              className="w-full p-2 border rounded mt-1"
              value={stockFormData.quantity}
              onChange={handleStockInputChange}
            />
          </div>
          <div>
            <label>Buy Price</label>
            <input
              name="buyPrice"
              type="number"
              className="w-full p-2 border rounded mt-1"
              value={stockFormData.buyPrice}
              onChange={handleStockInputChange}
            />
          </div>
          <div>
            <label>Sell Price</label>
            <input
              name="sellPrice"
              type="number"
              className="w-full p-2 border rounded mt-1"
              value={stockFormData.sellPrice}
              onChange={handleStockInputChange}
            />
          </div>
        </div>
        <button
          onClick={handleAddStock}
          className="bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 mt-4"
        >
          Add Stock
        </button>
      </div>

      <div className="mt-6">
        <button
          onClick={() => setExpandedSection(expandedSection === 'sales' ? null : 'sales')}
          className="w-full flex justify-between items-center bg-gray-100 p-4 rounded-xl shadow-sm hover:bg-gray-200 transition-colors"
        >
          <h2 className="text-xl font-semibold">Sales ({shopSales.length})</h2>
          <span className="text-2xl">{expandedSection === 'sales' ? '−' : '+'}</span>
        </button>
        {expandedSection === 'sales' && (
          <div className="mt-2 bg-white p-4 rounded-xl shadow overflow-x-auto">
            {shopSales.length === 0 ? (
              <p>No sales recorded for this shop.</p>
            ) : (
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Sale ID</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Amount</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Payment Type</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {shopSales.map((sale) => (
                    <tr key={sale.id}>
                      <td className="px-6 py-4 whitespace-nowrap">{sale.id}</td>
                      <td className="px-6 py-4 whitespace-nowrap">KES {sale.total_amount.toFixed(2)}</td>
                      <td className="px-6 py-4 whitespace-nowrap">{sale.payment_type}</td>
                      <td className="px-6 py-4 whitespace-nowrap">{new Date(sale.created_at).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}
      </div>

      <div className="mt-4">
        <button
          onClick={() => setExpandedSection(expandedSection === 'deposits' ? null : 'deposits')}
          className="w-full flex justify-between items-center bg-gray-100 p-4 rounded-xl shadow-sm hover:bg-gray-200 transition-colors"
        >
          <h2 className="text-xl font-semibold">Deposits ({shopDeposits.length})</h2>
          <span className="text-2xl">{expandedSection === 'deposits' ? '−' : '+'}</span>
        </button>
        {expandedSection === 'deposits' && (
          <div className="mt-2 bg-white p-4 rounded-xl shadow overflow-x-auto">
            {shopDeposits.length === 0 ? (
              <p>No deposits recorded for this shop.</p>
            ) : (
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Deposit ID</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Buyer Name</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Selling Price</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {shopDeposits.map((deposit) => (
                    <tr key={deposit.id}>
                      <td className="px-6 py-4 whitespace-nowrap">{deposit.id}</td>
                      <td className="px-6 py-4 whitespace-nowrap">{deposit.buyer_name}</td>
                      <td className="px-6 py-4 whitespace-nowrap">KES {(deposit.selling_price || 0).toFixed(2)}</td>
                      <td className="px-6 py-4 whitespace-nowrap">{deposit.status}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}
      </div>

      <div className="mt-4">
        <button
          onClick={() => setExpandedSection(expandedSection === 'stock' ? null : 'stock')}
          className="w-full flex justify-between items-center bg-gray-100 p-4 rounded-xl shadow-sm hover:bg-gray-200 transition-colors"
        >
          <h2 className="text-xl font-semibold">Stock ({shopStock.length})</h2>
          <span className="text-2xl">{expandedSection === 'stock' ? '−' : '+'}</span>
        </button>
        {expandedSection === 'stock' && (
          <div className="mt-2 bg-white p-4 rounded-xl shadow overflow-x-auto">
            {shopStock.length === 0 ? (
              <p>No stock recorded for this shop.</p>
            ) : (
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Item Name</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Quantity</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Buy Price</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Sell Price</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {shopStock.map((stock) => (
                    <tr key={stock.id}>
                      <td className="px-6 py-4 whitespace-nowrap">{availableItems.find(item => item.id === stock.item_id)?.name}</td>
                      <td className="px-6 py-4 whitespace-nowrap">{stock.qty}</td>
                      <td className="px-6 py-4 whitespace-nowrap">KES {stock.buy_price.toFixed(2)}</td>
                      <td className="px-6 py-4 whitespace-nowrap">KES {stock.sell_price.toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}
      </div>

      <div className="mt-4 mb-10">
        <button
          onClick={() => setExpandedSection(expandedSection === 'low_stock' ? null : 'low_stock')}
          className={`w-full flex justify-between items-center p-4 rounded-xl shadow-sm transition-colors ${lowStockItems.length > 0 ? 'bg-orange-100 hover:bg-orange-200' : 'bg-gray-100 hover:bg-gray-200'}`}
        >
          <h2 className={`text-xl font-semibold ${lowStockItems.length > 0 ? 'text-orange-700' : ''}`}>
            Low Stock Items ({lowStockItems.length})
          </h2>
          <span className="text-2xl">{expandedSection === 'low_stock' ? '−' : '+'}</span>
        </button>
        {expandedSection === 'low_stock' && (
          <div className="mt-2 bg-white p-4 rounded-xl shadow overflow-x-auto border-2 border-orange-100">
            {lowStockItems.length === 0 ? (
              <p className="text-green-600 font-medium">All items are sufficiently stocked.</p>
            ) : (
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-orange-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-orange-800 uppercase tracking-wider">Item Name</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-orange-800 uppercase tracking-wider">Quantity</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-orange-800 uppercase tracking-wider">Buy Price</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-orange-800 uppercase tracking-wider">Sell Price</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {lowStockItems.map((stock) => (
                    <tr key={stock.id}>
                      <td className="px-6 py-4 whitespace-nowrap font-medium">{availableItems.find(item => item.id === stock.item_id)?.name}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-red-600 font-bold">{stock.qty}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-gray-500 text-sm">KES {stock.buy_price.toFixed(2)}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-gray-500 text-sm">KES {stock.sell_price.toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
