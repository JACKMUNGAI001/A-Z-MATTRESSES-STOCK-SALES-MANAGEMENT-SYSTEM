import { useState, useEffect } from "react";
import api from "../api/api";
import { User, ShieldCheck, Eye, EyeOff, Save, Phone, Mail, Lock } from "lucide-react";

export default function Profile() {
  const [profileData, setProfileData] = useState({ name: "", email: "", phone_number: "" });
  const [passwordData, setPasswordData] = useState({ new_password: "", confirm_password: "" });
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const res = await api.get("/auth/me");
        setProfileData({ ...res.data, phone_number: res.data.phone_number ?? "" });
      } catch (err) {
        console.error("Error loading profile");
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
    <>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-10">
          {/* UPDATE PROFILE */}
          <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 transition-colors">
            <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-8 flex items-center gap-2 underline decoration-blue-500 underline-offset-8">
              <User size={24} className="text-blue-600 dark:text-blue-400" />
              Manage Your Information
            </h2>
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-bold text-gray-700 dark:text-gray-400 uppercase tracking-widest mb-2 px-1">Full Name</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500" size={18} />
                  <input name="name" className="w-full pl-10 pr-4 py-3 border border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none font-medium transition-all" value={profileData.name} onChange={handleProfileChange} />
                </div>
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 dark:text-gray-400 uppercase tracking-widest mb-2 px-1">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500" size={18} />
                  <input name="email" type="email" className="w-full pl-10 pr-4 py-3 border border-gray-200 dark:border-gray-700 rounded-xl bg-gray-100 dark:bg-gray-800 cursor-not-allowed font-medium text-gray-500 dark:text-gray-400" value={profileData.email} disabled />
                </div>
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 dark:text-gray-400 uppercase tracking-widest mb-2 px-1">Phone Number</label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500" size={18} />
                  <input name="phone_number" className="w-full pl-10 pr-4 py-3 border border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none font-medium transition-all" value={profileData.phone_number} onChange={handleProfileChange} />
                </div>
              </div>
              <button onClick={updateProfile} className="w-full bg-blue-600 text-white py-4 rounded-xl font-bold shadow-lg shadow-blue-100 dark:shadow-none hover:bg-blue-700 transition-all flex items-center justify-center gap-2">
                <Save size={20} /> Update Profile
              </button>
            </div>
          </div>

          {/* CHANGE PASSWORD */}
          <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 transition-colors">
            <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-8 flex items-center gap-2 underline decoration-red-500 underline-offset-8">
              <ShieldCheck size={24} className="text-red-600 dark:text-red-400" />
              Security Settings
            </h2>
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-bold text-gray-700 dark:text-gray-400 uppercase tracking-widest mb-2 px-1">New Password</label>
                <div className="relative">
                  <input
                    name="new_password"
                    type={showNewPassword ? "text" : "password"}
                    className="w-full pl-4 pr-12 py-3 border border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-red-500 outline-none font-medium transition-all"
                    value={passwordData.new_password}
                    onChange={handlePasswordChange}
                  />
                  <button type="button" className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 transition-colors" onClick={() => setShowNewPassword(!showNewPassword)}>
                    {showNewPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 dark:text-gray-400 uppercase tracking-widest mb-2 px-1">Confirm Password</label>
                <div className="relative">
                  <input
                    name="confirm_password"
                    type={showConfirmPassword ? "text" : "password"}
                    className="w-full pl-4 pr-12 py-3 border border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-red-500 outline-none font-medium transition-all"
                    value={passwordData.confirm_password}
                    onChange={handlePasswordChange}
                  />
                  <button type="button" className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 transition-colors" onClick={() => setShowConfirmPassword(!showConfirmPassword)}>
                    {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </div>
              <button onClick={changePassword} className="w-full bg-red-600 text-white py-4 rounded-xl font-bold shadow-lg shadow-red-100 dark:shadow-none hover:bg-red-700 transition-all flex items-center justify-center gap-2 mt-4">
                <Lock size={20} /> Change Password
              </button>
            </div>
          </div>
        </div>
      </>
  );
}
