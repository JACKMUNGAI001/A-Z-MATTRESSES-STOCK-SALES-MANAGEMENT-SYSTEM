import { useState, useEffect } from "react";
import api from "../api/api";
import { useNavigate } from "react-router-dom";
import { Store, Plus, Edit, Trash2, Box, MapPin } from "lucide-react";

export default function AdminShops() {
  const [shops, setShops] = useState([]);
  const [formData, setFormData] = useState({ name: "", address: "" });
  const [editingId, setEditingId] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchShops();
  }, []);

  const fetchShops = async () => {
    try {
      const response = await api.get("/shops");
      setShops(response.data);
    } catch (err) {
      console.error("Error fetching shops");
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSave = async () => {
    try {
      if (editingId) {
        await api.put(`/shops/${editingId}`, formData);
        alert("Shop updated!");
      } else {
        await api.post("/shops", formData);
        alert("Shop created!");
      }
      fetchShops();
      resetForm();
    } catch (err) {
      alert(`Error saving shop: ${err.response?.data?.msg || err.message}`);
    }
  };

  const handleEdit = (shop) => {
    setFormData({ name: shop.name, address: shop.address });
    setEditingId(shop.id);
  };

  const handleDelete = async (id) => {
    if(!window.confirm("Delete this shop?")) return;
    try {
      await api.delete(`/shops/${id}`);
      alert("Shop deleted!");
      fetchShops();
    } catch (err) {
      alert(`Error deleting shop: ${err.response?.data?.msg || err.message}`);
    }
  };

  const resetForm = () => {
    setFormData({ name: "", address: "" });
    setEditingId(null);
  };

  return (
    <>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* SHOP FORM */}
          <div className="lg:col-span-1">
            <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 sticky top-24 transition-colors">
              <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-6 flex items-center gap-2 transition-colors">
                {editingId ? <Edit className="text-blue-600 dark:text-blue-400" /> : <Plus className="text-blue-600 dark:text-blue-400" />}
                {editingId ? "Update Shop" : "Register New Shop"}
              </h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 dark:text-gray-400 uppercase mb-1 px-1">Shop Name</label>
                  <input name="name" className="w-full p-3 border border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-900 focus:ring-2 focus:ring-blue-500 outline-none font-bold text-gray-900 dark:text-white transition-all" value={formData.name} onChange={handleInputChange} placeholder="e.g. Umoja Branch" />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 dark:text-gray-400 uppercase mb-1 px-1">Physical Address</label>
                  <textarea name="address" className="w-full p-3 border border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-900 focus:ring-2 focus:ring-blue-500 outline-none h-24 text-gray-900 dark:text-white transition-all" value={formData.address} onChange={handleInputChange} placeholder="Street, Building, Town..." />
                </div>
                <div className="flex gap-3 pt-2">
                  <button onClick={handleSave} className="flex-1 bg-blue-600 text-white py-3 rounded-xl font-bold shadow-lg shadow-blue-100 dark:shadow-none hover:bg-blue-700 transition-all">
                    {editingId ? "Update Shop" : "Save Shop"}
                  </button>
                  {editingId && (
                    <button onClick={resetForm} className="px-4 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-xl font-bold hover:bg-gray-200 dark:hover:bg-gray-600 transition-all">
                      Cancel
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* SHOPS LIST */}
          <div className="lg:col-span-2">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden transition-colors">
              <div className="bg-gray-50 dark:bg-gray-900/50 px-8 py-4 border-b border-gray-100 dark:border-gray-700 transition-colors">
                <h2 className="text-lg font-bold text-gray-800 dark:text-white flex items-center gap-2 transition-colors">
                  <Store size={20} className="text-blue-600 dark:text-blue-400" />
                  Active Locations
                </h2>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50/50 dark:bg-gray-900/50 transition-colors">
                    <tr>
                      <th className="px-8 py-4 text-left text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest">Shop Details</th>
                      <th className="px-8 py-4 text-center text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50 dark:divide-gray-700 bg-white dark:bg-gray-800 transition-colors">
                    {shops.map((shop) => (
                      <tr key={shop.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-900/50 transition-colors">
                        <td className="px-8 py-4">
                          <div className="font-bold text-gray-900 dark:text-white text-lg transition-colors">{shop.name}</div>
                          <div className="flex items-center gap-1 text-gray-500 dark:text-gray-400 text-sm mt-1 transition-colors">
                            <MapPin size={14} />
                            {shop.address}
                          </div>
                        </td>
                        <td className="px-8 py-4">
                          <div className="flex items-center justify-center gap-2">
                            <button onClick={() => navigate(`/admin/shops/${shop.id}/stock`)} className="bg-green-50 dark:bg-green-900/30 text-green-600 dark:text-green-400 p-2 rounded-lg hover:bg-green-600 hover:text-white transition-all flex items-center gap-1 font-bold text-sm">
                              <Box size={16} /> Stock
                            </button>
                            <button onClick={() => handleEdit(shop)} className="bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 p-2 rounded-lg hover:bg-blue-600 hover:text-white transition-all">
                              <Edit size={16} />
                            </button>
                            <button onClick={() => handleDelete(shop.id)} className="bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 p-2 rounded-lg hover:bg-red-600 hover:text-white transition-all">
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
        </div>
      </>
  );
}
