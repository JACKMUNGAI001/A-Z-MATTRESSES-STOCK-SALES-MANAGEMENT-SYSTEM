import { useState, useEffect } from "react";
import api from "../api/api";

export default function Profile() {
  const [profileData, setProfileData] = useState({
    name: "",
    email: "",
    phone_number: "",
  });
  const [passwordData, setPasswordData] = useState({
    new_password: "",
    confirm_password: "",
  });
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const res = await api.get("/auth/me");
        setProfileData({
          ...res.data,
          phone_number: res.data.phone_number ?? "",
        });
      } catch (err) {
        alert("Error loading profile");
      }
    };
    loadProfile();
  }, []);

  const handleProfileChange = (e) => {
    setProfileData({ ...profileData, [e.target.name]: e.target.value });
  };

  const handlePasswordChange = (e) => {
    setPasswordData({ ...passwordData, [e.target.name]: e.target.value });
  };

  const updateProfile = async () => {
    try {
      await api.put("/user/profile", profileData);
      alert("Profile updated successfully!");
    } catch (err) {
      alert(`Error updating profile: ${err.response?.data?.msg || err.message}`);
    }
  };

  const changePassword = async () => {
    if (passwordData.new_password !== passwordData.confirm_password) {
      alert("Passwords do not match!");
      return;
    }
    try {
      await api.put("/user/change-password", { new_password: passwordData.new_password });
      alert("Password changed successfully!");
      setPasswordData({ new_password: "", confirm_password: "" });
    } catch (err) {
      alert(`Error changing password: ${err.response?.data?.msg || err.message}`);
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold mb-6">Your Profile</h1>

      <div className="bg-white p-6 rounded-xl shadow mb-6">
        <h2 className="text-xl font-semibold mb-4">Update Profile</h2>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label>Name</label>
            <input
              name="name"
              className="w-full border p-2 rounded mt-1"
              value={profileData.name}
              onChange={handleProfileChange}
            />
          </div>
          <div>
            <label>Email</label>
            <input
              name="email"
              type="email"
              className="w-full border p-2 rounded mt-1"
              value={profileData.email}
              disabled
            />
          </div>
          <div>
            <label>Phone</label>
            <input
              name="phone_number"
              className="w-full border p-2 rounded mt-1"
              value={profileData.phone_number}
              onChange={handleProfileChange}
            />
          </div>
        </div>
        <button
          onClick={updateProfile}
          className="bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 mt-4"
        >
          Update Profile
        </button>
      </div>

      <div className="bg-white p-6 rounded-xl shadow">
        <h2 className="text-xl font-semibold mb-4">Change Password</h2>
        <div className="grid grid-cols-2 gap-4">
          <div className="relative">
            <label>New Password</label>
            <div className="relative">
              <input
                name="new_password"
                type={showNewPassword ? "text" : "password"}
                className="w-full border p-2 rounded mt-1 pr-12"
                value={passwordData.new_password}
                onChange={handlePasswordChange}
              />
              <button
                type="button"
                className="absolute right-2 top-1/2 -translate-y-1/2 mt-0.5 text-gray-500 hover:text-gray-700 text-sm font-medium"
                onClick={() => setShowNewPassword(!showNewPassword)}
              >
                {showNewPassword ? "Hide" : "Show"}
              </button>
            </div>
          </div>
          <div className="relative">
            <label>Confirm New Password</label>
            <div className="relative">
              <input
                name="confirm_password"
                type={showConfirmPassword ? "text" : "password"}
                className="w-full border p-2 rounded mt-1 pr-12"
                value={passwordData.confirm_password}
                onChange={handlePasswordChange}
              />
              <button
                type="button"
                className="absolute right-2 top-1/2 -translate-y-1/2 mt-0.5 text-gray-500 hover:text-gray-700 text-sm font-medium"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              >
                {showConfirmPassword ? "Hide" : "Show"}
              </button>
            </div>
          </div>
        </div>
        <button
          onClick={changePassword}
          className="bg-blue-600 text-white p-3 rounded-lg hover:bg-blue-700 mt-4 w-full md:w-auto px-6"
        >
          Change Password
        </button>
      </div>
    </div>
  );
}
