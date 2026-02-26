import { useState, useEffect } from "react";
import api from "../api/api";
import { useNavigate } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import Header from "../components/Header";
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
    <div className="flex bg-[#f1f5f9] min-h-screen">
      <Sidebar role="admin" />
      <main className="flex-1 p-8 max-w-7xl mx-auto w-full">
        <Header />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* SHOP FORM */}
          <div className="lg:col-span-1">
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 sticky top-24">
              <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                {editingId ? <Edit className="text-blue-600" /> : <Plus className="text-blue-600" />}
                {editingId ? "Update Shop" : "Register New Shop"}
              </h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 uppercase mb-1">Shop Name</label>
                  <input name="name" className="w-full p-3 border border-gray-200 rounded-xl bg-gray-50 focus:ring-2 focus:ring-blue-500 outline-none font-bold text-gray-900" value={formData.name} onChange={handleInputChange} placeholder="e.g. Umoja Branch" />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 uppercase mb-1">Physical Address</label>
                  <textarea name="address" className="w-full p-3 border border-gray-200 rounded-xl bg-gray-50 focus:ring-2 focus:ring-blue-500 outline-none h-24" value={formData.address} onChange={handleInputChange} placeholder="Street, Building, Town..." />
                </div>
                <div className="flex gap-3 pt-2">
                  <button onClick={handleSave} className="flex-1 bg-blue-600 text-white py-3 rounded-xl font-bold shadow-lg shadow-blue-100 hover:bg-blue-700 transition-all">
                    {editingId ? "Update Shop" : "Save Shop"}
                  </button>
                  {editingId && (
                    <button onClick={resetForm} className="px-4 bg-gray-100 text-gray-600 rounded-xl font-bold hover:bg-gray-200">
                      Cancel
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* SHOPS LIST */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="bg-gray-50 px-8 py-4 border-b border-gray-100">
                <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                  <Store size={20} className="text-blue-600" />
                  Active Locations
                </h2>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50/50">
                    <tr>
                      <th className="px-8 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-widest">Shop Details</th>
                      <th className="px-8 py-4 text-center text-xs font-bold text-gray-500 uppercase tracking-widest">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50 bg-white">
                    {shops.map((shop) => (
                      <tr key={shop.id} className="hover:bg-gray-50/50 transition-colors">
                        <td className="px-8 py-4">
                          <div className="font-bold text-gray-900 text-lg">{shop.name}</div>
                          <div className="flex items-center gap-1 text-gray-500 text-sm mt-1">
                            <MapPin size={14} />
                            {shop.address}
                          </div>
                        </td>
                        <td className="px-8 py-4">
                          <div className="flex items-center justify-center gap-2">
                            <button onClick={() => navigate(`/admin/shops/${shop.id}/stock`)} className="bg-green-50 text-green-600 p-2 rounded-lg hover:bg-green-600 hover:text-white transition-all flex items-center gap-1 font-bold text-sm">
                              <Box size={16} /> Stock
                            </button>
                            <button onClick={() => handleEdit(shop)} className="bg-blue-50 text-blue-600 p-2 rounded-lg hover:bg-blue-600 hover:text-white transition-all">
                              <Edit size={16} />
                            </button>
                            <button onClick={() => handleDelete(shop.id)} className="bg-red-50 text-red-600 p-2 rounded-lg hover:bg-red-600 hover:text-white transition-all">
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
      </main>
    </div>
  );
}
