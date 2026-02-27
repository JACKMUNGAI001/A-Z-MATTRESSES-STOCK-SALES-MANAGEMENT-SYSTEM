import React, { useState, useEffect } from "react";
import api from "../api/api";
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
    <>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* RECORD EXPENSE */}
          <div className="lg:col-span-1">
            <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 sticky top-24 transition-colors">
              <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-6 flex items-center gap-2 transition-colors">
                <Plus size={24} className="text-blue-600 dark:text-blue-400" />
                Record Expense
              </h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 dark:text-gray-400 uppercase mb-1 px-1 transition-colors">Title</label>
                  <input name="title" value={formData.title} onChange={handleInputChange} className="w-full p-3 border border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all" required />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 dark:text-gray-400 uppercase mb-1 px-1 transition-colors">Amount</label>
                  <input name="amount" type="number" value={formData.amount} onChange={handleInputChange} className="w-full p-3 border border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-900 text-blue-600 dark:text-blue-400 focus:ring-2 focus:ring-blue-500 outline-none font-bold transition-all" required />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 dark:text-gray-400 uppercase mb-1 px-1 transition-colors">Shop</label>
                  <select name="shop_id" value={formData.shop_id} onChange={handleInputChange} className="w-full p-3 border border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all" required>
                    <option value="">Select Shop</option>
                    {shops.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 dark:text-gray-400 uppercase mb-1 px-1 transition-colors">Description</label>
                  <textarea name="description" value={formData.description} onChange={handleInputChange} className="w-full p-3 border border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none h-24 transition-all" />
                </div>
                <button type="submit" className="w-full bg-blue-600 text-white py-3 rounded-xl font-bold shadow-lg shadow-blue-100 dark:shadow-none hover:bg-blue-700 transition-all">
                  Save Expense
                </button>
              </form>
            </div>
          </div>

          {/* EXPENSE LIST */}
          <div className="lg:col-span-2">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden transition-colors">
              <div className="bg-gray-50 dark:bg-gray-900/50 px-8 py-4 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center transition-colors">
                <h2 className="text-lg font-bold text-gray-800 dark:text-white flex items-center gap-2 transition-colors">
                  <Receipt size={20} className="text-blue-600 dark:text-blue-400" />
                  Recent Operating Expenses
                </h2>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50/50 dark:bg-gray-900/50 transition-colors">
                    <tr>
                      <th className="px-8 py-4 text-left text-xs font-bold text-gray-500 dark:text-gray-400 uppercase">Title/Shop</th>
                      <th className="px-8 py-4 text-right text-xs font-bold text-gray-500 dark:text-gray-400 uppercase">Amount</th>
                      <th className="px-8 py-4 text-center text-xs font-bold text-gray-500 dark:text-gray-400 uppercase">Date</th>
                      <th className="px-8 py-4 text-center text-xs font-bold text-gray-500 dark:text-gray-400 uppercase">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50 dark:divide-gray-700 bg-white dark:bg-gray-800 transition-colors">
                    {expenses.map((exp) => (
                      <tr key={exp.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-900/50 transition-colors">
                        <td className="px-8 py-4">
                          <div className="font-bold text-gray-900 dark:text-white transition-colors">{exp.title}</div>
                          <div className="text-xs text-gray-500 dark:text-gray-400 transition-colors">{exp.shop_name}</div>
                        </td>
                        <td className="px-8 py-4 text-right font-black text-gray-900 dark:text-white transition-colors">KES {(exp.amount || 0).toLocaleString()}</td>
                        <td className="px-8 py-4 text-center text-gray-500 dark:text-gray-400 text-sm transition-colors">
                          <div className="flex items-center justify-center gap-1">
                            <Calendar size={14} />
                            {formatDate(exp.created_at)}
                          </div>
                        </td>
                        <td className="px-8 py-4 text-center transition-colors">
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
    </>
  );
}
