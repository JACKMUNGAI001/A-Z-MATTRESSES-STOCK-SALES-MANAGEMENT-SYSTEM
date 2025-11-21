import { useState, useEffect } from "react";
import api from "../api/api";

export default function Profile() {
  const [data, setData] = useState({
    name: "",
    email: "",
    phone: "",
  });

  useEffect(() => {
    const loadProfile = async () => {
      const res = await api.get("/auth/me");
      setData(res.data);
    };

    loadProfile();
  }, []);

  const updateProfile = async () => {
    try {
      await api.put("/auth/update", data);
      alert("Profile updated!");
    } catch (err) {
      alert("Error updating profile");
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold mb-6">Your Profile</h1>

      <div className="bg-white p-6 rounded-xl shadow grid grid-cols-2 gap-4">
        <div>
          <label>Name</label>
          <input
            className="w-full border p-2 rounded mt-1"
            value={data.name}
            onChange={(e) => setData({ ...data, name: e.target.value })}
          />
        </div>

        <div>
          <label>Email</label>
          <input
            className="w-full border p-2 rounded mt-1"
            value={data.email}
            onChange={(e) => setData({ ...data, email: e.target.value })}
          />
        </div>

        <div>
          <label>Phone</label>
          <input
            className="w-full border p-2 rounded mt-1"
            value={data.phone}
            onChange={(e) => setData({ ...data, phone: e.target.value })}
          />
        </div>

        <button
          onClick={updateProfile}
          className="col-span-2 bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 mt-4"
        >
          Update Profile
        </button>
      </div>
    </div>
  );
}
