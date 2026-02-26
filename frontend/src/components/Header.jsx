import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { LogOut, ArrowLeft, Bell, Settings, Search } from "lucide-react";

export default function Header() {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <header className="bg-transparent mb-8 flex justify-between items-center">
      <div className="flex items-center gap-6">
        <button
          onClick={() => navigate(-1)}
          className="bg-white border border-gray-200 text-gray-600 py-2 px-4 rounded-lg shadow-sm hover:bg-gray-50 transition-all flex items-center gap-2 font-medium"
        >
          <ArrowLeft size={18} /> Back
        </button>
        <div>
          <h2 className="text-3xl font-bold text-gray-800 tracking-tight">
            Welcome, {user?.name ? user.name.split(' ')[0] : 'User'}!
          </h2>
          <p className="text-gray-500 font-medium capitalize mt-1">
            {user?.role} Dashboard
          </p>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2 px-4 py-2 bg-white rounded-xl shadow-sm border border-gray-100 mr-2">
          <button className="p-2 text-gray-400 hover:text-blue-600 transition-colors"><Search size={20}/></button>
          <button className="p-2 text-gray-400 hover:text-blue-600 transition-colors"><Bell size={20}/></button>
          <button className="p-2 text-gray-400 hover:text-blue-600 transition-colors"><Settings size={20}/></button>
        </div>
        <button
          onClick={handleLogout}
          className="bg-[#ef4444] text-white py-3 px-6 rounded-xl font-bold shadow-lg shadow-red-200 hover:bg-red-600 transition-all flex items-center gap-2"
        >
          <LogOut size={20} /> Logout
        </button>
      </div>
    </header>
  );
}
