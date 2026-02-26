import React, { useState, useEffect } from "react";
import api from "../api/api";
import Sidebar from "../components/Sidebar";
import Header from "../components/Header";
import { Receipt, Plus, Trash2, Calendar } from "lucide-react";
import { formatDate } from "../utils/helpers";

export default function Expenses() {
  const [expenses, setExpenses] = useState([]);
  const [formData, setFormData] = useState({
    title: "",
    amount: "",
    description: "",
    shop_id: "",
  });
  const [shops, setShops] = useState([]);

  useEffect(() => {
    fetchExpenses();
    fetchShops();
  }, []);

  const fetchExpenses = async () => {
    try {
      const response = await api.get("/expenses");
      setExpenses(response.data);
    } catch (err) {
      console.error("Error fetching expenses");
    }
  };

  const fetchShops = async () => {
    try {
      const response = await api.get("/shops");
      setShops(response.data);
    } catch (err) {
      console.error("Error fetching shops");
    }
  };

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post("/expenses", formData);
      alert("Expense recorded successfully!");
      setFormData({ title: "", amount: "", description: "", shop_id: "" });
      fetchExpenses();
    } catch (err) {
      alert(`Error recording expense: ${err.response?.data?.msg || err.message}`);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this expense?")) return;
    try {
      await api.delete(`/expenses/${id}`);
      fetchExpenses();
    } catch (err) {
      alert("Error deleting expense");
    }
  };

  return (
    <div className="flex bg-[#f1f5f9] min-h-screen">
      <Sidebar role="admin" />
      <main className="flex-1 p-8 max-w-7xl mx-auto w-full">
        <Header />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* RECORD EXPENSE */}
          <div className="lg:col-span-1">
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 sticky top-24">
              <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                <Plus size={24} className="text-blue-600" />
                Record Expense
              </h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 uppercase mb-1">Title</label>
                  <input name="title" value={formData.title} onChange={handleInputChange} className="w-full p-3 border border-gray-200 rounded-xl bg-gray-50 focus:ring-2 focus:ring-blue-500 outline-none" required />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 uppercase mb-1">Amount</label>
                  <input name="amount" type="number" value={formData.amount} onChange={handleInputChange} className="w-full p-3 border border-gray-200 rounded-xl bg-gray-50 focus:ring-2 focus:ring-blue-500 outline-none font-bold text-blue-600" required />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 uppercase mb-1">Shop</label>
                  <select name="shop_id" value={formData.shop_id} onChange={handleInputChange} className="w-full p-3 border border-gray-200 rounded-xl bg-gray-50 focus:ring-2 focus:ring-blue-500 outline-none" required>
                    <option value="">Select Shop</option>
                    {shops.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 uppercase mb-1">Description</label>
                  <textarea name="description" value={formData.description} onChange={handleInputChange} className="w-full p-3 border border-gray-200 rounded-xl bg-gray-50 focus:ring-2 focus:ring-blue-500 outline-none h-24" />
                </div>
                <button type="submit" className="w-full bg-blue-600 text-white py-3 rounded-xl font-bold shadow-lg shadow-blue-100 hover:bg-blue-700 transition-all">
                  Save Expense
                </button>
              </form>
            </div>
          </div>

          {/* EXPENSE LIST */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="bg-gray-50 px-8 py-4 border-b border-gray-100 flex justify-between items-center">
                <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                  <Receipt size={20} className="text-blue-600" />
                  Recent Operating Expenses
                </h2>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50/50">
                    <tr>
                      <th className="px-8 py-4 text-left text-xs font-bold text-gray-500 uppercase">Title/Shop</th>
                      <th className="px-8 py-4 text-right text-xs font-bold text-gray-500 uppercase">Amount</th>
                      <th className="px-8 py-4 text-center text-xs font-bold text-gray-500 uppercase">Date</th>
                      <th className="px-8 py-4 text-center text-xs font-bold text-gray-500 uppercase">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50 bg-white">
                    {expenses.map((exp) => (
                      <tr key={exp.id} className="hover:bg-gray-50/50 transition-colors">
                        <td className="px-8 py-4">
                          <div className="font-bold text-gray-900">{exp.title}</div>
                          <div className="text-xs text-gray-500">{exp.shop_name}</div>
                        </td>
                        <td className="px-8 py-4 text-right font-black text-gray-900">KES {(exp.amount || 0).toLocaleString()}</td>
                        <td className="px-8 py-4 text-center text-gray-500 text-sm">
                          <div className="flex items-center justify-center gap-1">
                            <Calendar size={14} />
                            {formatDate(exp.created_at)}
                          </div>
                        </td>
                        <td className="px-8 py-4 text-center">
                          <button onClick={() => handleDelete(exp.id)} className="text-red-400 hover:text-red-600 transition-colors">
                            <Trash2 size={18} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
