import { useState, useEffect } from "react";
import api from "../api/api";
import Sidebar from "../components/Sidebar";
import Header from "../components/Header";
import { Package, Plus, Edit, Trash2, Tag, Info, DollarSign } from "lucide-react";

export default function AdminItems() {
  const [items, setItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [formData, setFormData] = useState({
    sku: "",
    name: "",
    category_id: "",
    brand: "",
    buy_price: "",
    sell_price: "",
    description: "",
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
      sku: item.sku || "",
      name: item.name,
      category_id: item.category_id,
      brand: item.brand || "",
      buy_price: item.buy_price,
      sell_price: item.sell_price,
      description: item.description || "",
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
    setFormData({ sku: "", name: "", category_id: "", brand: "", buy_price: "", sell_price: "", description: "" });
    setEditingId(null);
  };

  return (
    <div className="flex bg-[#f1f5f9] min-h-screen">
      <Sidebar role="admin" />
      <main className="flex-1 p-8 max-w-7xl mx-auto w-full">
        <Header />

        <div className="grid grid-cols-1 gap-8">
          {/* ITEM FORM */}
          <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
            <h2 className="text-xl font-bold text-gray-800 mb-8 flex items-center gap-2">
              {editingId ? <Edit className="text-blue-600" /> : <Plus className="text-blue-600" />}
              {editingId ? "Edit Product Details" : "Register New Product"}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="lg:col-span-2">
                <label className="block text-sm font-bold text-gray-700 uppercase mb-1">Product Name</label>
                <input name="name" className="w-full p-3 border border-gray-200 rounded-xl bg-gray-50 focus:ring-2 focus:ring-blue-500 outline-none font-bold" value={formData.name} onChange={handleInputChange} placeholder="e.g. Super Soft Mattress" />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 uppercase mb-1">SKU / Code</label>
                <input name="sku" className="w-full p-3 border border-gray-200 rounded-xl bg-gray-50 focus:ring-2 focus:ring-blue-500 outline-none" value={formData.sku} onChange={handleInputChange} placeholder="Unique code" />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 uppercase mb-1">Category</label>
                <select name="category_id" className="w-full p-3 border border-gray-200 rounded-xl bg-gray-50 focus:ring-2 focus:ring-blue-500 outline-none" value={formData.category_id} onChange={handleInputChange}>
                  <option value="">Select Category</option>
                  {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 uppercase mb-1">Brand</label>
                <input name="brand" className="w-full p-3 border border-gray-200 rounded-xl bg-gray-50 focus:ring-2 focus:ring-blue-500 outline-none" value={formData.brand} onChange={handleInputChange} />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 uppercase mb-1">Buy Price</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 font-bold">KES</span>
                  <input name="buy_price" type="number" className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl bg-gray-50 focus:ring-2 focus:ring-blue-500 outline-none font-black" value={formData.buy_price} onChange={handleInputChange} />
                </div>
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 uppercase mb-1">Sell Price</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-blue-400 font-bold">KES</span>
                  <input name="sell_price" type="number" className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl bg-blue-50/30 border-blue-100 focus:ring-2 focus:ring-blue-500 outline-none font-black text-blue-700" value={formData.sell_price} onChange={handleInputChange} />
                </div>
              </div>
              <div className="md:col-span-2 lg:col-span-4">
                <label className="block text-sm font-bold text-gray-700 uppercase mb-1">Description</label>
                <textarea name="description" className="w-full p-3 border border-gray-200 rounded-xl bg-gray-50 focus:ring-2 focus:ring-blue-500 outline-none h-20" value={formData.description} onChange={handleInputChange} />
              </div>
            </div>
            <div className="flex gap-4 mt-8">
              <button onClick={handleSave} className="flex-1 lg:flex-none lg:px-12 bg-blue-600 text-white py-4 rounded-xl font-bold shadow-lg shadow-blue-100 hover:bg-blue-700 transition-all">
                {editingId ? "Update Product" : "Create Product"}
              </button>
              {editingId && (
                <button onClick={resetForm} className="px-8 bg-gray-100 text-gray-600 rounded-xl font-bold hover:bg-gray-200">
                  Cancel
                </button>
              )}
            </div>
          </div>

          {/* ITEMS LIST */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="bg-gray-50 px-8 py-4 border-b border-gray-100">
              <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                <Package size={20} className="text-blue-600" />
                Product Catalog
              </h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50/50">
                  <tr>
                    <th className="px-8 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-widest">SKU</th>
                    <th className="px-8 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-widest">Product Info</th>
                    <th className="px-8 py-4 text-right text-xs font-bold text-gray-500 uppercase tracking-widest">Pricing</th>
                    <th className="px-8 py-4 text-center text-xs font-bold text-gray-500 uppercase tracking-widest">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50 bg-white">
                  {items.map((item) => (
                    <tr key={item.id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-8 py-4 font-mono text-xs text-gray-400">{item.sku || "NO SKU"}</td>
                      <td className="px-8 py-4">
                        <div className="font-bold text-gray-900">{item.name}</div>
                        <div className="flex items-center gap-2 text-xs mt-1">
                          <span className="bg-gray-100 text-gray-600 px-2 py-0.5 rounded font-bold uppercase">{categories.find(c => c.id === item.category_id)?.name}</span>
                          <span className="text-gray-400">{item.brand}</span>
                        </div>
                      </td>
                      <td className="px-8 py-4 text-right">
                        <div className="text-xs text-gray-400 line-through">KES {parseFloat(item.buy_price || 0).toLocaleString()}</div>
                        <div className="font-black text-blue-600 text-lg">KES {parseFloat(item.sell_price || 0).toLocaleString()}</div>
                      </td>
                      <td className="px-8 py-4">
                        <div className="flex items-center justify-center gap-2">
                          <button onClick={() => handleEdit(item)} className="bg-blue-50 text-blue-600 p-2 rounded-lg hover:bg-blue-600 hover:text-white transition-all">
                            <Edit size={16} />
                          </button>
                          <button onClick={() => handleDelete(item.id)} className="bg-red-50 text-red-600 p-2 rounded-lg hover:bg-red-600 hover:text-white transition-all">
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
      </main>
    </div>
  );
}
