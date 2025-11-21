import { useState, useEffect } from "react";
import api from "../api/api";

export default function Expenses() {
  const [expenses, setExpenses] = useState([]);
  const [shops, setShops] = useState([]);
  const [formData, setFormData] = useState({
    title: "",
    amount: "",
    description: "",
    shop_id: "",
    recurring: false,
    frequency: "",
  });
  const [editingId, setEditingId] = useState(null);

  useEffect(() => {
    fetchExpenses();
    fetchShops();
  }, []);

  const fetchExpenses = async () => {
    try {
      const response = await api.get("/expenses");
      setExpenses(response.data);
    } catch (err) {
      alert("Error fetching expenses");
    }
  };

  const fetchShops = async () => {
    try {
      const response = await api.get("/shops");
      setShops(response.data);
    } catch (err) {
      alert("Error fetching shops");
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  const handleSave = async () => {
    try {
      if (editingId) {
        await api.put(`/expenses/${editingId}`, formData);
        alert("Expense updated!");
      } else {
        await api.post("/expenses", formData);
        alert("Expense created!");
      }
      fetchExpenses();
      resetForm();
    } catch (err) {
      alert(`Error saving expense: ${err.response?.data?.msg || err.message}`);
    }
  };

  const handleEdit = (expense) => {
    setFormData({
      title: expense.title,
      amount: expense.amount,
      description: expense.description,
      shop_id: expense.shop_id,
      recurring: expense.recurring,
      frequency: expense.frequency,
    });
    setEditingId(expense.id);
  };

  const handleDelete = async (id) => {
    try {
      await api.delete(`/expenses/${id}`);
      alert("Expense deleted!");
      fetchExpenses();
    } catch (err) {
      alert(`Error deleting expense: ${err.response?.data?.msg || err.message}`);
    }
  };

  const resetForm = () => {
    setFormData({
      title: "",
      amount: "",
      description: "",
      shop_id: "",
      recurring: false,
      frequency: "",
    });
    setEditingId(null);
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold mb-6">Expenses</h1>

      <div className="bg-white p-6 rounded-xl shadow mb-6">
        <h2 className="text-xl font-semibold mb-4">{editingId ? "Edit Expense" : "Add Expense"}</h2>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label>Title</label>
            <input
              name="title"
              className="w-full p-2 border rounded mt-1"
              value={formData.title}
              onChange={handleInputChange}
            />
          </div>
          <div>
            <label>Amount</label>
            <input
              name="amount"
              type="number"
              className="w-full p-2 border rounded mt-1"
              value={formData.amount}
              onChange={handleInputChange}
            />
          </div>
          <div className="col-span-2">
            <label>Description</label>
            <textarea
              name="description"
              className="w-full p-2 border rounded mt-1"
              rows="3"
              value={formData.description}
              onChange={handleInputChange}
            />
          </div>
          <div>
            <label>Shop</label>
            <select
              name="shop_id"
              className="w-full p-2 border rounded mt-1"
              value={formData.shop_id}
              onChange={handleInputChange}
            >
              <option value="">All Shops</option>
              {shops.map((shop) => (
                <option key={shop.id} value={shop.id}>
                  {shop.name}
                </option>
              ))}
            </select>
          </div>
          <div className="flex items-center">
            <input
              name="recurring"
              type="checkbox"
              className="mr-2"
              checked={formData.recurring}
              onChange={handleInputChange}
            />
            <label>Recurring</label>
          </div>
          {formData.recurring && (
            <div>
              <label>Frequency</label>
              <select
                name="frequency"
                className="w-full p-2 border rounded mt-1"
                value={formData.frequency}
                onChange={handleInputChange}
              >
                <option value="">Select frequency</option>
                <option value="monthly">Monthly</option>
              </select>
            </div>
          )}
        </div>
        <div className="flex justify-end mt-4">
          <button
            onClick={resetForm}
            className="bg-gray-300 text-gray-800 py-2 px-4 rounded-lg mr-2"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700"
          >
            {editingId ? "Update" : "Save"}
          </button>
        </div>
      </div>

      <div className="bg-white p-6 rounded-xl shadow">
        <h2 className="text-xl font-semibold mb-4">Existing Expenses</h2>
        <table className="w-full">
          <thead>
            <tr>
              <th className="text-left">Title</th>
              <th className="text-left">Amount</th>
              <th className="text-left">Shop</th>
              <th className="text-left">Recurring</th>
              <th className="text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {expenses.map((expense) => (
              <tr key={expense.id}>
                <td>{expense.title}</td>
                <td>{expense.amount}</td>
                <td>{shops.find((s) => s.id === expense.shop_id)?.name || "All Shops"}</td>
                <td>{expense.recurring ? "Yes" : "No"}</td>
                <td>
                  <button onClick={() => handleEdit(expense)} className="text-blue-600 mr-2">
                    Edit
                  </button>
                  <button onClick={() => handleDelete(expense.id)} className="text-red-600">
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
