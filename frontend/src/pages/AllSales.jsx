import React, { useState, useEffect } from "react";
import api from "../api/api";
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