import React, { useState, useEffect } from "react";
import api, { API_BASE } from "../api/api";
import AttendantLayout from "../components/AttendantLayout";

export default function AllDeposits() {
  const [deposits, setDeposits] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchDeposits();
  }, []);

  const fetchDeposits = async () => {
    setLoading(true);
    try {
      const response = await api.get("/deposits");
      setDeposits(response.data);
    } catch (err) {
      alert("Error fetching deposits");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AttendantLayout>
      <div className="p-6">
        <h1 className="text-2xl font-semibold mb-4">All Deposits</h1>
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
                  <th className="text-left">Buyer Name</th>
                  <th className="text-left">Buyer Phone</th>
                  <th className="text-left">Item</th>
                  <th className="text-left">Selling Price</th>
                  <th className="text-left">Total Paid</th>
                  <th className="text-left">Balance</th>
                  <th className="text-left">Status</th>
                  <th className="text-left">Receipts</th>
                </tr>
              </thead>
              <tbody>
                {deposits.map((deposit) => (
                  <tr key={deposit.id}>
                    <td>{new Date(deposit.created_at).toLocaleString()}</td>
                    <td>{deposit.shop_name}</td>
                    <td>{deposit.attendant_name}</td>
                    <td>{deposit.buyer_name}</td>
                    <td>{deposit.buyer_phone}</td>
                    <td>{deposit.item_name}</td>
                    <td>KES {deposit.selling_price.toLocaleString()}</td>
                    <td>KES {deposit.total_paid.toLocaleString()}</td>
                    <td>KES {deposit.balance.toLocaleString()}</td>
                    <td>{deposit.status}</td>
                    <td>
                      <a
                        href={`${API_BASE}/receipts/deposit/${deposit.id}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline text-xs font-semibold"
                      >
                        VIEW RECEIPTS
                      </a>
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