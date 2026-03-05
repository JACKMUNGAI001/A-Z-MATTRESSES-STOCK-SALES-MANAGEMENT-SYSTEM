import { useState, useEffect } from "react";
import api from "../api/api";
import { Package, Plus, Edit, Trash2 } from "lucide-react";

export default function AdminItems() {
  const [items, setItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [formData, setFormData] = useState({
    name: "",
    category_id: "",
    buy_price: "",
  });
  const [editingId, setEditingId] = useState(null);

  useEffect(() => {
    fetchItems();
    fetchCategories();
  }, []);

  const fetchItems = async () => {
    try {
      const response = await api.get("/items");
      setItems(response.data);
    } catch (err) {
      console.error("Error fetching items");
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await api.get("/items/categories");
      setCategories(response.data);
    } catch (err) {
      console.error("Error fetching categories");
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSave = async () => {
    try {
      if (editingId) {
        await api.put(`/items/${editingId}`, formData);
        alert("Item updated!");
      } else {
        await api.post("/items", formData);
        alert("Item created!");
      }
      fetchItems();
      resetForm();
    } catch (err) {
      alert(`Error saving item: ${err.response?.data?.msg || err.message}`);
    }
  };

  const handleEdit = (item) => {
    setFormData({
      name: item.name,
      category_id: item.category_id,
      buy_price: item.buy_price,
    });
    setEditingId(item.id);
  };

  const handleDelete = async (id) => {
    if(!window.confirm("Delete this item?")) return;
    try {
      await api.delete(`/items/${id}`);
      alert("Item deleted!");
      fetchItems();
    } catch (err) {
      alert(`Error deleting item: ${err.response?.data?.msg || err.message}`);
    }
  };

  const resetForm = () => {
    setFormData({ name: "", category_id: "", buy_price: "" });
    setEditingId(null);
  };

  return (
    <>
        <div className="grid grid-cols-1 gap-8">
          {/* ITEM FORM */}
          <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 transition-colors">
            <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-8 flex items-center gap-2 transition-colors">
              {editingId ? <Edit className="text-blue-600 dark:text-blue-400" /> : <Plus className="text-blue-600 dark:text-blue-400" />}
              {editingId ? "Edit Product Details" : "Register New Product"}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-1">
                <label className="block text-sm font-bold text-gray-700 dark:text-gray-400 uppercase mb-1 px-1 transition-colors">Product Name</label>
                <input name="name" className="w-full p-3 border border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none font-bold transition-all" value={formData.name} onChange={handleInputChange} placeholder="e.g. Super Soft Mattress" />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 dark:text-gray-400 uppercase mb-1 px-1 transition-colors">Category</label>
                <select name="category_id" className="w-full p-3 border border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all" value={formData.category_id} onChange={handleInputChange}>
                  <option value="">Select Category</option>
                  {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 dark:text-gray-400 uppercase mb-1 px-1 transition-colors">Buy Price</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500 font-bold transition-colors">KES</span>
                  <input name="buy_price" type="number" className="w-full pl-12 pr-4 py-3 border border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none font-black transition-all" value={formData.buy_price} onChange={handleInputChange} />
                </div>
              </div>
            </div>
            <div className="flex gap-4 mt-8">
              <button onClick={handleSave} className="flex-1 lg:flex-none lg:px-12 bg-blue-600 text-white py-4 rounded-xl font-bold shadow-lg shadow-blue-100 dark:shadow-none hover:bg-blue-700 transition-all">
                {editingId ? "Update Product" : "Create Product"}
              </button>
              {editingId && (
                <button onClick={resetForm} className="px-8 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-xl font-bold hover:bg-gray-200 dark:hover:bg-gray-600 transition-all">
                  Cancel
                </button>
              )}
            </div>
          </div>

          {/* ITEMS LIST */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden transition-colors">
            <div className="bg-gray-50 dark:bg-gray-900/50 px-8 py-4 border-b border-gray-100 dark:border-gray-700 transition-colors">
              <h2 className="text-lg font-bold text-gray-800 dark:text-white flex items-center gap-2 transition-colors">
                <Package size={20} className="text-blue-600 dark:text-blue-400" />
                Product Catalog
              </h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50/50 dark:bg-gray-900/50 transition-colors">
                  <tr>
                    <th className="px-8 py-4 text-left text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest">Product Info</th>
                    <th className="px-8 py-4 text-right text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest">Buy Price</th>
                    <th className="px-8 py-4 text-center text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50 dark:divide-gray-700 bg-white dark:bg-gray-800 transition-colors">
                  {items.map((item) => (
                    <tr key={item.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-900/50 transition-colors">
                      <td className="px-8 py-4">
                        <div className="font-bold text-gray-900 dark:text-white transition-colors">{item.name}</div>
                        <div className="flex items-center gap-2 text-xs mt-1 transition-colors">
                          <span className="bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 px-2 py-0.5 rounded font-bold uppercase transition-colors">{categories.find(c => c.id === item.category_id)?.name}</span>
                        </div>
                      </td>
                      <td className="px-8 py-4 text-right font-black text-gray-600 dark:text-gray-400">
                        KES {parseFloat(item.buy_price || 0).toLocaleString()}
                      </td>
                      <td className="px-8 py-4">
                        <div className="flex items-center justify-center gap-2">
                          <button onClick={() => handleEdit(item)} className="bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 p-2 rounded-lg hover:bg-blue-600 hover:text-white transition-all">
                            <Edit size={16} />
                          </button>
                          <button onClick={() => handleDelete(item.id)} className="bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 p-2 rounded-lg hover:bg-red-600 hover:text-white transition-all">
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
    </>
  );
}
