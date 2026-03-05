import { useState, useEffect } from "react";
import api from "../api/api";
import { Calendar, Filter, TrendingUp, TrendingDown, Store, Clock } from "lucide-react";

export default function PNLReport() {
  const [year, setYear] = useState(new Date().getFullYear());
  const [period, setPeriod] = useState("today"); // today, this_week, yearly, or month number (1-12)
  const [shopId, setShopId] = useState("");
  const [shops, setShops] = useState([]);
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(false);

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: currentYear - 2024 + 2 }, (_, i) => 2024 + i);

  useEffect(() => {
    fetchShops();
  }, []);

  useEffect(() => {
    fetchReport();
  }, [year, period, shopId]);

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

      const response = await api.get("/reports/pnl", { params });
      setReport(response.data);
    } catch (err) {
      alert("Error fetching P&L report");
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

  const getPeriodLabel = () => {
    const opt = periodOptions.find(o => String(o.value) === String(period));
    if (period === "today" || period === "this_week") return opt.label;
    if (period === "yearly") return `Year ${year}`;
    return `${opt.label} ${year}`;
  };

  return (
    <>
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 transition-colors">
          <div>
            <h1 className="text-3xl font-black text-gray-900 dark:text-white tracking-tight flex items-center gap-3 transition-colors">
              <TrendingUp className="text-blue-600" size={32} />
              Profit & Loss Analysis
            </h1>
            <p className="text-gray-500 dark:text-gray-400 font-medium mt-1">Review your business financial health and performance</p>
          </div>
        </div>

        {/* FILTERS */}
        <div className="bg-white dark:bg-gray-800 p-8 rounded-3xl shadow-sm mt-8 border border-gray-100 dark:border-gray-700 transition-colors">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <label className="flex items-center gap-2 text-xs font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-3 px-1">
                <Clock size={14} />
                Reporting Period
              </label>
              <select
                className="w-full border-2 border-gray-100 dark:border-gray-700 p-4 rounded-2xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none dark:bg-gray-900 dark:text-white font-bold transition-all"
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
                <label className="flex items-center gap-2 text-xs font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-3 px-1">
                  <Calendar size={14} />
                  Select Year
                </label>
                <select
                  className="w-full border-2 border-gray-100 dark:border-gray-700 p-4 rounded-2xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none dark:bg-gray-900 dark:text-white font-bold transition-all"
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
              <label className="flex items-center gap-2 text-xs font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-3 px-1">
                <Store size={14} />
                Shop Scope
              </label>
              <select
                className="w-full border-2 border-gray-100 dark:border-gray-700 p-4 rounded-2xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none dark:bg-gray-900 dark:text-white font-bold transition-all"
                value={shopId}
                onChange={(e) => setShopId(e.target.value)}
              >
                <option value="">Aggregate (Consolidated View)</option>
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
          <div className="mt-20 text-center">
            <div className="inline-block w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-4"></div>
            <p className="text-gray-500 dark:text-gray-400 font-bold uppercase tracking-widest text-sm animate-pulse">Calculating financial data...</p>
          </div>
        ) : report && (
          <div className="mt-8 space-y-8 transition-colors max-w-5xl">
            <div className="bg-white dark:bg-gray-800 rounded-[2.5rem] shadow-2xl shadow-blue-100/50 dark:shadow-none overflow-hidden border border-gray-100 dark:border-gray-700 transition-colors">
              <div className="bg-gradient-to-r from-blue-600 to-indigo-700 px-10 py-8 transition-colors">
                <h2 className="text-white text-2xl font-black uppercase tracking-tight">
                  Financial Statement: {getPeriodLabel()}
                </h2>
                <p className="text-blue-100 font-medium mt-1 opacity-80 flex items-center gap-2">
                  <Filter size={16} />
                  {report.shop_id ? `Location: ${shops.find(s => s.id === parseInt(report.shop_id))?.name}` : "Aggregate Performance (All Shops)"}
                </p>
              </div>

              <div className="p-10 transition-colors">
                <div className="space-y-6 max-w-3xl mx-auto">
                  
                  {/* REVENUE */}
                  <div className="flex justify-between items-center pb-4 border-b border-gray-50 dark:border-gray-700 transition-colors">
                    <span className="text-gray-500 dark:text-gray-400 font-bold uppercase tracking-widest text-xs">Total Revenue (Net Sales)</span>
                    <span className="text-2xl font-black text-gray-900 dark:text-white">{formatCurrency(report.total_sales)}</span>
                  </div>

                  {/* COGS */}
                  <div className="flex justify-between items-center pb-4 border-b border-gray-50 dark:border-gray-700 transition-colors">
                    <span className="text-gray-500 dark:text-gray-400 font-bold uppercase tracking-widest text-xs">Cost of Goods Sold (COGS)</span>
                    <span className="text-xl font-bold text-red-500 dark:text-red-400">({formatCurrency(report.total_cogs)})</span>
                  </div>

                  {/* GROSS PROFIT */}
                  <div className="flex justify-between items-center py-6 bg-gray-50 dark:bg-gray-900/50 px-8 rounded-3xl transition-colors border border-gray-100 dark:border-gray-700">
                    <span className="text-gray-900 dark:text-white font-black uppercase text-sm tracking-widest">Gross Profit Margin</span>
                    <span className={`text-3xl font-black ${report.gross_profit >= 0 ? 'text-blue-600 dark:text-blue-400' : 'text-red-600 dark:text-red-400'}`}>
                      {formatCurrency(report.gross_profit)}
                    </span>
                  </div>

                  {/* EXPENSES */}
                  <div className="flex justify-between items-center pb-4 border-b border-gray-50 dark:border-gray-700 mt-10 transition-colors">
                    <span className="text-gray-500 dark:text-gray-400 font-bold uppercase tracking-widest text-xs">Operating Expenses</span>
                    <span className="text-xl font-bold text-red-500 dark:text-red-400">({formatCurrency(report.total_expenses)})</span>
                  </div>

                  {/* NET PROFIT */}
                  <div className={`flex flex-col md:flex-row justify-between items-center py-10 px-10 rounded-[2rem] mt-12 transition-all shadow-xl ${report.net_profit >= 0 ? 'bg-green-600 text-white shadow-green-100 dark:shadow-none' : 'bg-red-600 text-white shadow-red-100 dark:shadow-none'}`}>
                    <div className="text-center md:text-left mb-6 md:mb-0">
                      <span className="block text-white/70 font-black uppercase tracking-[0.2em] text-xs transition-colors mb-2">Final Net Position</span>
                      <div className="flex items-center gap-3">
                        {report.net_profit >= 0 ? <TrendingUp size={40} /> : <TrendingDown size={40} />}
                        <span className="text-5xl font-black transition-colors tracking-tighter">
                          {report.net_profit >= 0 ? "PROFIT" : "LOSS"}
                        </span>
                      </div>
                    </div>
                    <div className="text-center md:text-right">
                        <span className="block text-white/70 font-bold text-sm mb-1 uppercase">Total {report.net_profit >= 0 ? "Surplus" : "Deficit"}</span>
                        <span className="text-5xl font-black transition-colors tabular-nums">
                        {formatCurrency(report.net_profit)}
                        </span>
                    </div>
                  </div>

                </div>
              </div>
              
              <div className="bg-gray-50 dark:bg-gray-900/50 px-10 py-6 text-sm text-gray-400 dark:text-gray-500 italic text-center transition-colors border-t border-gray-100 dark:border-gray-700">
                This dynamic statement reflects all confirmed revenue and realized operating costs for the selected window.
              </div>
            </div>
          </div>
        )}
    </>
  );
}
