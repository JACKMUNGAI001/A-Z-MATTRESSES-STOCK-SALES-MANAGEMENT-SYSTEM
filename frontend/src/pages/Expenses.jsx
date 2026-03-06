import React, { useState, useEffect, useContext } from "react";
import api from "../api/api";
import { Receipt, Plus, Trash2, Calendar, CalendarX } from "lucide-react";
import { formatDate } from "../utils/helpers";
import { SearchContext } from "../context/SearchContext";
import SearchableSelect from "../components/SearchableSelect";

export default function Expenses() {
  const [expenses, setExpenses] = useState([]);
  const [formData, setFormData] = useState({
    title: "",
    amount: "",
    description: "",
    shop_id: "",
    recurring: false,
    frequency: "",
  });
  const [shops, setShops] = useState([]);
  const { searchDate } = useContext(SearchContext);

  const frequencies = [
    { id: "monthly", name: "Monthly" },
    { id: "yearly", name: "Yearly" }
  ];

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
    const { name, value, type, checked } = e.target;
    setFormData({ ...formData, [name]: type === 'checkbox' ? checked : value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.shop_id) {
      alert("Please select a shop");
      return;
    }
    if (formData.recurring && !formData.frequency) {
      alert("Please select a frequency for recurring expense");
      return;
    }
    try {
      await api.post("/expenses", formData);
      alert("Expense recorded successfully!");
      setFormData({ title: "", amount: "", description: "", shop_id: "", recurring: false, frequency: "" });
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

  const filteredExpenses = searchDate 
    ? expenses.filter(exp => exp.created_at.startsWith(searchDate))
    : expenses;

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
                  <SearchableSelect
                    options={shops}
                    value={formData.shop_id}
                    onChange={(e) => setFormData({ ...formData, shop_id: e.target.value })}
                    placeholder="Select Shop..."
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 dark:text-gray-400 uppercase mb-1 px-1 transition-colors">Description</label>
                  <textarea name="description" value={formData.description} onChange={handleInputChange} className="w-full p-3 border border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none h-24 transition-all" />
                </div>

                <div className="flex items-center gap-2 px-1">
                  <input
                    type="checkbox"
                    id="recurring"
                    name="recurring"
                    checked={formData.recurring}
                    onChange={handleInputChange}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <label htmlFor="recurring" className="text-sm font-bold text-gray-700 dark:text-gray-400 uppercase cursor-pointer">Recurring Expense</label>
                </div>

                {formData.recurring && (
                  <div>
                    <label className="block text-sm font-bold text-gray-700 dark:text-gray-400 uppercase mb-1 px-1">Frequency</label>
                    <SearchableSelect
                      options={frequencies}
                      value={formData.frequency}
                      onChange={(e) => setFormData({ ...formData, frequency: e.target.value })}
                      placeholder="Select Frequency..."
                    />
                  </div>
                )}

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
                  Recent Operating Expenses {searchDate && <span className="text-xs font-medium text-blue-500 bg-blue-50 dark:bg-blue-900/30 px-2 py-0.5 rounded-full ml-2 transition-all">Date: {searchDate}</span>}
                </h2>
                <span className="bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-400 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest transition-all">
                  {filteredExpenses.length} Records
                </span>
              </div>
              <div className="overflow-x-auto max-h-[calc(100vh-300px)] overflow-y-auto custom-scrollbar">
                {filteredExpenses.length === 0 ? (
                  <div className="p-20 text-center border-t border-gray-100 dark:border-gray-700 transition-colors">
                    <CalendarX size={48} className="mx-auto text-gray-300 dark:text-gray-600 mb-4 transition-colors" />
                    <p className="text-gray-500 dark:text-gray-400 font-bold uppercase tracking-widest text-sm transition-colors">No expenses found for this date</p>
                    {searchDate && <p className="text-xs text-gray-400 mt-2 transition-colors">Try another date or clear search</p>}
                  </div>
                ) : (
                  <table className="w-full relative border-collapse">
                    <thead className="bg-gray-50/50 dark:bg-gray-900/50 transition-colors sticky top-0 z-10 backdrop-blur-sm">
                      <tr>
                        <th className="px-8 py-4 text-left text-xs font-bold text-gray-500 dark:text-gray-400 uppercase">Title/Shop</th>
                        <th className="px-8 py-4 text-right text-xs font-bold text-gray-500 dark:text-gray-400 uppercase">Amount</th>
                        <th className="px-8 py-4 text-center text-xs font-bold text-gray-500 dark:text-gray-400 uppercase">Date</th>
                        <th className="px-8 py-4 text-center text-xs font-bold text-gray-500 dark:text-gray-400 uppercase">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50 dark:divide-gray-700 bg-white dark:bg-gray-800 transition-colors">
                      {filteredExpenses.map((exp) => (
                        <tr key={exp.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-900/50 transition-colors">
                          <td className="px-8 py-4">
                            <div className="font-bold text-gray-900 dark:text-white transition-colors">{exp.title}</div>
                            <div className="text-xs text-gray-500 dark:text-gray-400 transition-colors">{exp.shop_name}</div>
                            {exp.recurring && (
                              <span className="text-[10px] font-bold text-blue-600 bg-blue-50 dark:bg-blue-900/30 px-1.5 py-0.5 rounded-md mt-1 inline-block uppercase tracking-wider">
                                Recurring: {exp.frequency}
                              </span>
                            )}
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
                )}
              </div>
            </div>
          </div>
        </div>
    </>
  );
}
