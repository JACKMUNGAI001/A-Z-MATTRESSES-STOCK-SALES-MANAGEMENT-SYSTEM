import { useState, useEffect, useContext } from "react";
import api from "../api/api";
import { useNavigate } from "react-router-dom";
import { Store, Plus, Edit, Trash2, Box, MapPin, Search, CalendarX } from "lucide-react";
import { SearchContext } from "../context/SearchContext";

export default function AdminShops() {
  const [shops, setShops] = useState([]);
  const [formData, setFormData] = useState({ name: "", address: "" });
  const [editingId, setEditingId] = useState(null);
  const navigate = useNavigate();
  const { searchQuery, searchType } = useContext(SearchContext);

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

  const filteredShops = searchQuery
    ? shops.filter(shop => {
        if (searchType === 'date' && shop.created_at) {
            return shop.created_at.startsWith(searchQuery);
        }
        const searchLower = searchQuery.toLowerCase();
        return shop.name.toLowerCase().includes(searchLower) || (shop.address && shop.address.toLowerCase().includes(searchLower));
      })
    : shops;

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
              <div className="bg-gray-50 dark:bg-gray-900/50 px-8 py-4 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center transition-colors">
                <h2 className="text-lg font-bold text-gray-800 dark:text-white flex items-center gap-2 transition-colors">
                  <Store size={20} className="text-blue-600 dark:text-blue-400" />
                  Active Locations {searchQuery && <span className="text-xs font-medium text-blue-500 bg-blue-50 dark:bg-blue-900/30 px-2 py-0.5 rounded-full ml-2 transition-all">{searchType === 'date' ? `Date: ${searchQuery}` : `Searching: "${searchQuery}"`}</span>}
                </h2>
                <span className="bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-400 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest transition-all">
                    {filteredShops.length} Locations
                </span>
              </div>
              <div className="overflow-x-auto max-h-[calc(100vh-300px)] overflow-y-auto custom-scrollbar">
                {filteredShops.length === 0 ? (
                    <div className="p-20 text-center border-t border-gray-100 dark:border-gray-700 transition-colors">
                        <CalendarX size={48} className="mx-auto text-gray-300 dark:text-gray-600 mb-4 transition-colors" />
                        <p className="text-gray-500 dark:text-gray-400 font-bold uppercase tracking-widest text-sm transition-colors">{searchQuery ? 'No matching locations found' : 'No locations found'}</p>
                        {searchQuery && <p className="text-xs text-gray-400 mt-2 transition-colors">Try another {searchType === 'date' ? 'date' : 'search term'} or clear search</p>}
                    </div>
                ) : (
                    <table className="w-full relative border-collapse">
                    <thead className="bg-gray-50/90 dark:bg-gray-900/90 transition-colors sticky top-0 z-10 backdrop-blur-sm">
                        <tr>
                        <th className="px-8 py-4 text-left text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest border-b border-gray-100 dark:border-gray-700">Shop Details</th>
                        <th className="px-8 py-4 text-center text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest border-b border-gray-100 dark:border-gray-700">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50 dark:divide-gray-700 bg-white dark:bg-gray-800 transition-colors">
                        {filteredShops.map((shop) => (
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
                )}
              </div>
            </div>
          </div>
        </div>
      </>
  );
}
