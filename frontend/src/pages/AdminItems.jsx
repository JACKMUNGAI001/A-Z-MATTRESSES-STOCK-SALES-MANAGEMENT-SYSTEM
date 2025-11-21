import { useState, useEffect } from "react";
import api from "../api/api";

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
      alert("Error fetching items");
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await api.get("/items/categories"); // Assuming an endpoint for categories
      setCategories(response.data);
    } catch (err) {
      alert("Error fetching categories");
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSave = async () => {
    try {
      if (editingId) {
        await api.put(`/items/${editingId}`, formData); // Assuming a PUT endpoint for updating items
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
      sku: item.sku,
      name: item.name,
      category_id: item.category_id,
      brand: item.brand,
      buy_price: item.buy_price,
      sell_price: item.sell_price,
      description: item.description,
    });
    setEditingId(item.id);
  };

  const handleDelete = async (id) => {
    try {
      await api.delete(`/items/${id}`); // Assuming a DELETE endpoint for deleting items
      alert("Item deleted!");
      fetchItems();
    } catch (err) {
      alert(`Error deleting item: ${err.response?.data?.msg || err.message}`);
    }
  };

  const resetForm = () => {
    setFormData({
      sku: "",
      name: "",
      category_id: "",
      brand: "",
      buy_price: "",
      sell_price: "",
      description: "",
    });
    setEditingId(null);
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold mb-6">Admin Items Management</h1>

      <div className="bg-white p-6 rounded-xl shadow mb-6">
        <h2 className="text-xl font-semibold mb-4">{editingId ? "Edit Item" : "Add New Item"}</h2>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label>SKU</label>
            <input
              name="sku"
              className="w-full p-2 border rounded mt-1"
              value={formData.sku}
              onChange={handleInputChange}
            />
          </div>
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
            <label>Category</label>
            <select
              name="category_id"
              className="w-full p-2 border rounded mt-1"
              value={formData.category_id}
              onChange={handleInputChange}
            >
              <option value="">Select Category</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label>Brand</label>
            <input
              name="brand"
              className="w-full p-2 border rounded mt-1"
              value={formData.brand}
              onChange={handleInputChange}
            />
          </div>
          <div>
            <label>Buy Price</label>
            <input
              name="buy_price"
              type="number"
              className="w-full p-2 border rounded mt-1"
              value={formData.buy_price}
              onChange={handleInputChange}
            />
          </div>
          <div>
            <label>Sell Price</label>
            <input
              name="sell_price"
              type="number"
              className="w-full p-2 border rounded mt-1"
              value={formData.sell_price}
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
        <h2 className="text-xl font-semibold mb-4">Existing Items</h2>
        <table className="w-full">
          <thead>
            <tr>
              <th className="text-left">SKU</th>
              <th className="text-left">Name</th>
              <th className="text-left">Category</th>
              <th className="text-left">Brand</th>
              <th className="text-left">Buy Price</th>
              <th className="text-left">Sell Price</th>
              <th className="text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item) => (
              <tr key={item.id}>
                <td>{item.sku}</td>
                <td>{item.name}</td>
                <td>{categories.find((c) => c.id === item.category_id)?.name}</td>
                <td>{item.brand}</td>
                <td>{item.buy_price}</td>
                <td>{item.sell_price}</td>
                <td>
                  <button onClick={() => handleEdit(item)} className="text-blue-600 mr-2">
                    Edit
                  </button>
                  <button onClick={() => handleDelete(item.id)} className="text-red-600">
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
