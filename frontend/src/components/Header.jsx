import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { ThemeContext } from "../context/ThemeContext";
import { useNavigate } from "react-router-dom";
import { LogOut, ArrowLeft, Bell, Settings, Search, Sun, Moon } from "lucide-react";

export default function Header() {
  const { user, logout } = useContext(AuthContext);
  const { isDarkMode, toggleDarkMode } = useContext(ThemeContext);
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
          className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 py-2 px-4 rounded-lg shadow-sm hover:bg-gray-50 dark:hover:bg-gray-700 transition-all flex items-center gap-2 font-medium"
        >
          <ArrowLeft size={18} /> Back
        </button>
        <div>
          <h2 className="text-3xl font-bold text-gray-800 dark:text-white tracking-tight transition-colors">
            Welcome, {user?.name ? user.name.split(' ')[0] : 'User'}!
          </h2>
          <p className="text-gray-500 dark:text-gray-400 font-medium capitalize mt-1 transition-colors">
            {user?.role} Dashboard
          </p>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 mr-2 transition-colors">
          <button 
            onClick={toggleDarkMode}
            className="p-2 text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
          >
            {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
          </button>
          <button className="p-2 text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"><Search size={20}/></button>
          <button className="p-2 text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"><Bell size={20}/></button>
          <button className="p-2 text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"><Settings size={20}/></button>
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

