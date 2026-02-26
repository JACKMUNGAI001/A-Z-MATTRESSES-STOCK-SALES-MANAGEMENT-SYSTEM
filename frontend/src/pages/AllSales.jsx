import React, { useState, useEffect } from "react";
import api, { API_BASE } from "../api/api";
import AttendantLayout from "../components/AttendantLayout";

export default function AllSales() {
  const [sales, setSales] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchSales();
  }, []);

  const fetchSales = async () => {
    setLoading(true);
    try {
      const response = await api.get("/sales/all");
      setSales(response.data);
    } catch (err) {
      alert("Error fetching sales");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AttendantLayout>
      <div className="p-6">
        <h1 className="text-2xl font-semibold mb-4">All Sales</h1>
        {loading ? (
          <p>Loading...</p>
        ) : (
          <div className="bg-white p-6 rounded-xl shadow">
            <table className="w-full">
              <thead>
                <tr>
                  <th className="text-left">Date</th>
                  <th className="text-left">Shop</th>
                  <th className="text-left">Attendant</th>
                  <th className="text-left">Total Amount</th>
                  <th className="text-left">Payment Type</th>
                  <th className="text-left">Receipt</th>
                </tr>
              </thead>
              <tbody>
                {sales.map((sale) => (
                  <tr key={sale.id}>
                    <td>{new Date(sale.created_at).toLocaleString()}</td>
                    <td>{sale.shop_name}</td>
                    <td>{sale.attendant_name}</td>
                    <td>KES {sale.total_amount.toLocaleString()}</td>
                    <td>{sale.payment_type}</td>
                    <td>
                      {sale.receipt_uuid && (
                        <a
                          href={`${API_BASE}/receipts/${sale.receipt_uuid}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:underline"
                        >
                          View Receipt
                        </a>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </AttendantLayout>
  );
}