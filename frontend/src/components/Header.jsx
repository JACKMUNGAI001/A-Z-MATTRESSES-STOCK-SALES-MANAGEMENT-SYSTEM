import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

export default function Header() {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <header className="bg-white shadow p-4 flex justify-between items-center">
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate(-1)}
          className="bg-gray-200 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-300 flex items-center gap-1"
        >
          <span>←</span> Back
        </button>
        <div>
          <h2 className="text-xl font-semibold line-clamp-1">Welcome, {user?.name}!</h2>
          <p className="text-gray-600 capitalize text-sm">{user?.role} Dashboard</p>
        </div>
      </div>
      <button
        onClick={handleLogout}
        className="bg-red-500 text-white py-2 px-4 rounded-lg hover:bg-red-600"
      >
        Logout
      </button>
    </header>
  );
}
