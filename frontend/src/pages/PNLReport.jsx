import { useState, useEffect } from "react";
import api from "../api/api";
import { useNavigate } from "react-router-dom";

export default function PNLReport() {
  const [year, setYear] = useState(new Date().getFullYear());
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [shopId, setShopId] = useState("");
  const [shops, setShops] = useState([]);
  const [report, setReport] = useState(null);

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
      alert("Error fetching shops");
    }
  };

  const fetchReport = async () => {
    try {
      const response = await api.get("/reports/pnl", {
        params: { year, month, shop_id: shopId || undefined },
      });
      setReport(response.data);
    } catch (err) {
      alert("Error fetching P&L report");
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold mb-4">Profit & Loss Report</h1>

      <div className="bg-white p-6 rounded-xl shadow mb-6">
        <div className="grid grid-cols-3 gap-4">
          <div>
            <label>Year</label>
            <input
              type="number"
              className="w-full border p-2 rounded mt-1"
              value={year}
              onChange={(e) => setYear(parseInt(e.target.value))}
            />
          </div>
          <div>
            <label>Month</label>
            <input
              type="number"
              className="w-full border p-2 rounded mt-1"
              value={month}
              onChange={(e) => setMonth(parseInt(e.target.value))}
            />
          </div>
          <div>
            <label>Shop</label>
            <select
              className="w-full border p-2 rounded mt-1"
              value={shopId}
              onChange={(e) => setShopId(e.target.value)}
            >
              <option value="">All Shops</option>
              {shops.map((shop) => (
                <option key={shop.id} value={shop.id}>
                  {shop.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {report && (
        <div className="bg-white p-6 rounded-xl shadow">
          <h2 className="text-xl font-semibold mb-4">Report for {report.month}/{report.year} {report.shop_id ? `(Shop ID: ${report.shop_id})` : "(All Shops)"}</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p><strong>Total Sales:</strong> {report.total_sales}</p>
              <p><strong>Total COGS:</strong> {report.total_cogs}</p>
              <p><strong>Gross Profit:</strong> {report.gross_profit}</p>
              <p><strong>Total Expenses:</strong> {report.total_expenses}</p>
              <p><strong>Net Profit:</strong> {report.net_profit}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
