import { useState, useEffect } from "react";
import api from "../api/api";
import Header from "../components/Header";
import Sidebar from "../components/Sidebar";

export default function PNLReport() {
  const [year, setYear] = useState(new Date().getFullYear());
  const [month, setMonth] = useState(new Date().getMonth() + 1); // 0 for Yearly
  const [shopId, setShopId] = useState("");
  const [shops, setShops] = useState([]);
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchShops();
  }, []);

  useEffect(() => {
    fetchReport();
  }, [year, month, shopId]);

  const fetchShops = async () => {
    try {
      const response = await api.get("/shops");
      setShops(response.data);
    } catch (err) {
      console.error("Error fetching shops", err);
    }
  };

  const fetchReport = async () => {
    setLoading(true);
    try {
      const params = { year };
      if (month !== 0) params.month = month;
      if (shopId) params.shop_id = shopId;

      const response = await api.get("/reports/pnl", { params });
      setReport(response.data);
    } catch (err) {
      alert("Error fetching P&L report");
    } finally {
      setLoading(false);
    }
  };

  const months = [
    { value: 0, label: "Full Year (Jan - Dec)" },
    { value: 1, label: "January" },
    { value: 2, label: "February" },
    { value: 3, label: "March" },
    { value: 4, label: "April" },
    { value: 5, label: "May" },
    { value: 6, label: "June" },
    { value: 7, label: "July" },
    { value: 8, label: "August" },
    { value: 9, label: "September" },
    { value: 10, label: "October" },
    { value: 11, label: "November" },
    { value: 12, label: "December" },
  ];

  const formatCurrency = (val) => {
    return new Intl.NumberFormat('en-KE', { style: 'currency', currency: 'KES' }).format(val || 0);
  };

  return (
    <div className="flex">
      <Sidebar role="admin" />
      <main className="flex-1 p-6 bg-gray-50 min-h-screen">
        <Header />
        
        <div className="mt-6 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-800">Profit & Loss Analysis</h1>
        </div>

        {/* FILTERS */}
        <div className="bg-white p-6 rounded-xl shadow-sm mt-6 border border-gray-100">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700">Reporting Year</label>
              <select
                className="w-full border p-3 rounded-lg mt-1 focus:ring-blue-500 focus:border-blue-500"
                value={year}
                onChange={(e) => setYear(parseInt(e.target.value))}
              >
                {[2024, 2025, 2026, 2027].map(y => (
                  <option key={y} value={y}>{y}</option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700">Period</label>
              <select
                className="w-full border p-3 rounded-lg mt-1 focus:ring-blue-500 focus:border-blue-500"
                value={month}
                onChange={(e) => setMonth(parseInt(e.target.value))}
              >
                {months.map(m => (
                  <option key={m.value} value={m.value}>{m.label}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Shop Scope</label>
              <select
                className="w-full border p-3 rounded-lg mt-1 focus:ring-blue-500 focus:border-blue-500"
                value={shopId}
                onChange={(e) => setShopId(e.target.value)}
              >
                <option value="">Consolidated (All Shops)</option>
                {shops.map((shop) => (
                  <option key={shop.id} value={shop.id}>
                    {shop.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* REPORT DISPLAY */}
        {loading ? (
          <div className="mt-10 text-center text-gray-500">Calculating financial data...</div>
        ) : report && (
          <div className="mt-8 space-y-6">
            <div className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-200">
              <div className="bg-blue-600 px-6 py-4">
                <h2 className="text-white text-lg font-semibold uppercase tracking-wider">
                  {month === 0 ? "Yearly" : "Monthly"} Statement: {month !== 0 ? months.find(m => m.value === month).label : ""} {year}
                </h2>
                <p className="text-blue-100 text-sm">
                  {report.shop_id ? `Shop: ${shops.find(s => s.id === parseInt(report.shop_id))?.name}` : "Aggregate Performance (All Shops)"}
                </p>
              </div>

              <div className="p-8">
                <div className="space-y-4 max-w-2xl mx-auto">
                  
                  {/* REVENUE */}
                  <div className="flex justify-between items-center pb-2 border-b">
                    <span className="text-gray-600 font-medium">Total Revenue (Sales)</span>
                    <span className="text-gray-900 font-bold">{formatCurrency(report.total_sales)}</span>
                  </div>

                  {/* COGS */}
                  <div className="flex justify-between items-center pb-2 border-b">
                    <span className="text-gray-600 font-medium">Cost of Goods Sold (COGS)</span>
                    <span className="text-red-500 font-semibold">({formatCurrency(report.total_cogs)})</span>
                  </div>

                  {/* GROSS PROFIT */}
                  <div className="flex justify-between items-center py-4 bg-gray-50 px-4 rounded-lg">
                    <span className="text-gray-800 font-bold uppercase text-sm">Gross Profit</span>
                    <span className={`font-black text-lg ${report.gross_profit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {formatCurrency(report.gross_profit)}
                    </span>
                  </div>

                  {/* EXPENSES */}
                  <div className="flex justify-between items-center pb-2 border-b mt-6">
                    <span className="text-gray-600 font-medium">Operating Expenses</span>
                    <span className="text-red-500 font-semibold">({formatCurrency(report.total_expenses)})</span>
                  </div>

                  {/* NET PROFIT */}
                  <div className={`flex justify-between items-center py-6 px-6 rounded-xl mt-8 ${report.net_profit >= 0 ? 'bg-green-50 border-2 border-green-200' : 'bg-red-50 border-2 border-red-200'}`}>
                    <div>
                      <span className="block text-gray-700 font-bold uppercase tracking-widest text-xs">Final Net Position</span>
                      <span className="text-2xl font-black text-gray-900">
                        {report.net_profit >= 0 ? "PROFIT" : "LOSS"}
                      </span>
                    </div>
                    <span className={`text-3xl font-black ${report.net_profit >= 0 ? 'text-green-700' : 'text-red-700'}`}>
                      {formatCurrency(report.net_profit)}
                    </span>
                  </div>

                </div>
              </div>
              
              <div className="bg-gray-50 px-8 py-4 text-xs text-gray-400 italic text-center">
                This report considers all confirmed sales and recorded expenses within the selected period.
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
