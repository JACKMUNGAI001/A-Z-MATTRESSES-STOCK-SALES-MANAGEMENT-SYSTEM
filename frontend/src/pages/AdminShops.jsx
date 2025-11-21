import { useState, useEffect } from "react";
import api from "../api/api";

export default function AdminShops() {
  const [shops, setShops] = useState([]);
  const [formData, setFormData] = useState({
    name: "",
    address: "",
  });
  const [editingId, setEditingId] = useState(null);

  useEffect(() => {
    fetchShops();
  }, []);

  const fetchShops = async () => {
    try {
      const response = await api.get("/shops");
      setShops(response.data);
    } catch (err) {
      alert("Error fetching shops");
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSave = async () => {
    try {
      if (editingId) {
        await api.put(`/shops/${editingId}`, formData); // Assuming a PUT endpoint for updating shops
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
    setFormData({
      name: shop.name,
      address: shop.address,
    });
    setEditingId(shop.id);
  };

  const handleDelete = async (id) => {
    try {
      await api.delete(`/shops/${id}`); // Assuming a DELETE endpoint for deleting shops
      alert("Shop deleted!");
      fetchShops();
    } catch (err) {
      alert(`Error deleting shop: ${err.response?.data?.msg || err.message}`);
    }
  };

  const resetForm = () => {
    setFormData({
      name: "",
      address: "",
    });
    setEditingId(null);
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold mb-6">Admin Shops Management</h1>

      <div className="bg-white p-6 rounded-xl shadow mb-6">
        <h2 className="text-xl font-semibold mb-4">{editingId ? "Edit Shop" : "Add New Shop"}</h2>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label>Name</label>
            <input
              name="name"
              className="w-full p-2 border rounded mt-1"
              value={formData.name}
              onChange={handleInputChange}
            />
          </div>
          <div>
            <label>Address</label>
            <input
              name="address"
              className="w-full p-2 border rounded mt-1"
              value={formData.address}
              onChange={handleInputChange}
            />
          </div>
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
        <h2 className="text-xl font-semibold mb-4">Existing Shops</h2>
        <table className="w-full">
          <thead>
            <tr>
              <th className="text-left">Name</th>
              <th className="text-left">Address</th>
              <th className="text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {shops.map((shop) => (
              <tr key={shop.id}>
                <td>{shop.name}</td>
                <td>{shop.address}</td>
                <td>
                  <button onClick={() => handleEdit(shop)} className="text-blue-600 mr-2">
                    Edit
                  </button>
                  <button onClick={() => handleDelete(shop.id)} className="text-red-600">
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
