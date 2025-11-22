import React, { useEffect, useState } from 'react';
import api from '../api/api';

export default function DepositCustomers() {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        const response = await api.get('/deposits/customers');
        setCustomers(response.data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching deposit customers:', error);
        setLoading(false);
      }
    };
    fetchCustomers();
  }, []);

  return (
    <>
      <h1 className="text-2xl font-bold mb-4">Deposit Customers</h1>
              {loading ? (
                <p>Loading...</p>
              ) : customers.length === 0 ? (
                <p>No deposit customers found.</p>
              ) : (        <div className="bg-white p-4 rounded-xl shadow">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer Name</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Phone Number</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Item Name</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Paid</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Balance</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {customers.map((customer) => (
                <tr key={customer.id}>
                  <td className="px-6 py-4 whitespace-nowrap">{customer.buyer_name}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{customer.buyer_phone}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{customer.item_name}</td>
                  <td className="px-6 py-4 whitespace-nowrap">KES {customer.total_paid.toFixed(2)}</td>
                  <td className="px-6 py-4 whitespace-nowrap">KES {customer.balance.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}