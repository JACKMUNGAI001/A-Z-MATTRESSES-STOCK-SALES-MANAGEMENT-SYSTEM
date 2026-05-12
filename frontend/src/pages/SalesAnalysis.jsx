import { useState, useEffect } from "react";
import api, { fetchProductAnalysis } from "../api/api";
import { BarChart3, Store, Calendar, Clock, Package } from "lucide-react";
import PageLayout from "../components/PageLayout";

export default function SalesAnalysis() {
  const [year, setYear] = useState(new Date().getFullYear());
  const [period, setPeriod] = useState("this_week"); 
  const [shopId, setShopId] = useState("");
  const [shops, setShops] = useState([]);
  const [analysis, setAnalysis] = useState({ by_shop: [], overall: [] });
  const [loading, setLoading] = useState(false);

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: currentYear - 2024 + 2 }, (_, i) => 2024 + i);

  useEffect(() => {
    fetchShops();
  }, []);

  useEffect(() => {
    loadAnalysis();
  }, [year, period, shopId]);

  const fetchShops = async () => {
    try {
      const response = await api.get("/shops");
      setShops(response.data);
    } catch (err) {
      console.error("Error fetching shops", err);
    }
  };

  const loadAnalysis = async () => {
    setLoading(true);
    try {
      const params = {};
      if (shopId) params.shop_id = shopId;

      if (period === "today" || period === "this_week") {
        params.period = period;
      } else if (period === "yearly") {
        params.year = year;
      } else {
        params.year = year;
        params.month = parseInt(period);
      }

      const response = await fetchProductAnalysis(params);
      setAnalysis(response.data);
    } catch (err) {
      console.error("Error fetching analysis", err);
    } finally {
      setLoading(false);
    }
  };

  const periodOptions = [
    { value: "today", label: "Today" },
    { value: "this_week", label: "This Week" },
    { value: "yearly", label: "Full Year" },
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
    return new Intl.NumberFormat('en-KE', { style: 'currency', currency: 'KES', minimumFractionDigits: 0 }).format(val || 0);
  };

  return (
    <PageLayout role="admin">
      <div className="space-y-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-black text-gray-900 dark:text-white tracking-tight flex items-center gap-3">
              <BarChart3 className="text-blue-600" size={32} />
              Sales Analysis
            </h1>
            <p className="text-gray-500 dark:text-gray-400 font-medium mt-1">Identify top-performing products and shop trends</p>
          </div>
        </div>

        {/* FILTERS */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="flex items-center gap-2 text-xs font-black text-gray-400 uppercase tracking-widest mb-3 px-1">
                <Clock size={14} />
                Period
              </label>
              <select
                className="w-full border-2 border-gray-100 dark:border-gray-700 p-3 rounded-2xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none dark:bg-gray-900 dark:text-white font-bold transition-all"
                value={period}
                onChange={(e) => setPeriod(e.target.value)}
              >
                {periodOptions.map(m => (
                  <option key={m.value} value={m.value}>{m.label}</option>
                ))}
              </select>
            </div>

            {(period !== "today" && period !== "this_week") && (
              <div>
                <label className="flex items-center gap-2 text-xs font-black text-gray-400 uppercase tracking-widest mb-3 px-1">
                  <Calendar size={14} />
                  Year
                </label>
                <select
                  className="w-full border-2 border-gray-100 dark:border-gray-700 p-3 rounded-2xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none dark:bg-gray-900 dark:text-white font-bold transition-all"
                  value={year}
                  onChange={(e) => setYear(parseInt(e.target.value))}
                >
                  {years.map(y => (
                    <option key={y} value={y}>{y}</option>
                  ))}
                </select>
              </div>
            )}

            <div className={period === "today" || period === "this_week" ? "md:col-span-2" : ""}>
              <label className="flex items-center gap-2 text-xs font-black text-gray-400 uppercase tracking-widest mb-3 px-1">
                <Store size={14} />
                Filter by Shop
              </label>
              <select
                className="w-full border-2 border-gray-100 dark:border-gray-700 p-3 rounded-2xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none dark:bg-gray-900 dark:text-white font-bold transition-all"
                value={shopId}
                onChange={(e) => setShopId(e.target.value)}
              >
                <option value="">All Shops Combined</option>
                {shops.map((shop) => (
                  <option key={shop.id} value={shop.id}>
                    {shop.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="mt-20 text-center">
            <div className="inline-block w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-4"></div>
            <p className="text-gray-500 dark:text-gray-400 font-bold uppercase tracking-widest text-sm animate-pulse">Analyzing sales data...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
            {/* OVERALL ANALYSIS */}
            <div className="bg-white dark:bg-gray-800 rounded-[2rem] shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
              <div className="bg-gray-50 dark:bg-gray-900/50 px-8 py-6 border-b border-gray-100 dark:border-gray-700 flex items-center justify-between">
                <h2 className="text-xl font-black text-gray-900 dark:text-white uppercase tracking-tight flex items-center gap-2">
                  <Package className="text-blue-600" size={20} />
                  Top Products (Overall)
                </h2>
                <span className="bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 text-[10px] font-black px-3 py-1 rounded-full uppercase">Global Ranking</span>
              </div>
              <div className="p-4 overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="text-left text-xs font-black text-gray-400 uppercase tracking-widest">
                      <th className="px-4 py-4">Product</th>
                      <th className="px-4 py-4 text-center">Qty Sold</th>
                      <th className="px-4 py-4 text-right">Revenue</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50 dark:divide-gray-700">
                    {analysis.overall.length > 0 ? (
                      analysis.overall.map((item, idx) => (
                        <tr key={idx} className="hover:bg-gray-50/50 dark:hover:bg-gray-900/50 transition-colors group">
                          <td className="px-4 py-4">
                            <span className="font-bold text-gray-900 dark:text-white group-hover:text-blue-600 transition-colors">{item.product_name}</span>
                          </td>
                          <td className="px-4 py-4 text-center">
                            <span className="inline-flex items-center justify-center bg-gray-100 dark:bg-gray-900 text-gray-700 dark:text-gray-300 font-black px-3 py-1 rounded-lg text-sm">
                              {item.total_qty}
                            </span>
                          </td>
                          <td className="px-4 py-4 text-right font-black text-gray-900 dark:text-white">
                            {formatCurrency(item.total_revenue)}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="3" className="px-4 py-10 text-center text-gray-400 font-medium">No sales data available for this period</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* SHOP ANALYSIS */}
            <div className="bg-white dark:bg-gray-800 rounded-[2rem] shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
              <div className="bg-gray-50 dark:bg-gray-900/50 px-8 py-6 border-b border-gray-100 dark:border-gray-700 flex items-center justify-between">
                <h2 className="text-xl font-black text-gray-900 dark:text-white uppercase tracking-tight flex items-center gap-2">
                  <Store className="text-indigo-600" size={20} />
                  Sales by Shop & Product
                </h2>
                <span className="bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400 text-[10px] font-black px-3 py-1 rounded-full uppercase">Location Breakdown</span>
              </div>
              <div className="p-4 overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="text-left text-xs font-black text-gray-400 uppercase tracking-widest">
                      <th className="px-4 py-4">Shop</th>
                      <th className="px-4 py-4">Product</th>
                      <th className="px-4 py-4 text-center">Qty</th>
                      <th className="px-4 py-4 text-right">Revenue</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50 dark:divide-gray-700">
                    {analysis.by_shop.length > 0 ? (
                      analysis.by_shop.map((item, idx) => (
                        <tr key={idx} className="hover:bg-gray-50/50 dark:hover:bg-gray-900/50 transition-colors group">
                          <td className="px-4 py-4 font-medium text-gray-500 dark:text-gray-400">{item.shop_name}</td>
                          <td className="px-4 py-4 font-bold text-gray-900 dark:text-white">{item.product_name}</td>
                          <td className="px-4 py-4 text-center">
                            <span className="font-bold text-gray-700 dark:text-gray-300">{item.total_qty}</span>
                          </td>
                          <td className="px-4 py-4 text-right font-black text-gray-900 dark:text-white">
                            {formatCurrency(item.total_revenue)}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="4" className="px-4 py-10 text-center text-gray-400 font-medium">No sales data available</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>
    </PageLayout>
  );
}
