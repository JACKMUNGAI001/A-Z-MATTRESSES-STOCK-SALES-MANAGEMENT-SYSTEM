import React, { useContext } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { AuthContext } from '../context/AuthContext'
import { 
  LayoutDashboard, 
  Store, 
  Package, 
  TrendingUp, 
  Receipt, 
  ArrowLeftRight, 
  UserCircle,
  FileText
} from 'lucide-react'

export default function Sidebar({ role: propRole }){
  const location = useLocation();
  const { user } = useContext(AuthContext);
  const role = propRole || user?.role;

  const isActive = (path) => location.pathname === path;

  const NavLink = ({ to, icon: Icon, children }) => (
    <Link 
      to={to} 
      className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
        isActive(to) 
          ? 'bg-blue-600 text-white shadow-lg' 
          : 'text-gray-400 hover:bg-gray-800 hover:text-white'
      }`}
    >
      <Icon size={20} />
      <span className="font-medium">{children}</span>
    </Link>
  );

  return (
    <aside className="w-64 bg-[#1e293b] text-white flex flex-col h-screen sticky top-0 shadow-2xl overflow-y-auto">
      <div className="p-6 border-b border-gray-700 mb-4">
        <h2 className="text-xl font-bold tracking-tight">A-Z Mattresses</h2>
      </div>
      
      <nav className="flex-1 px-4 space-y-2 pb-10">
        {role === 'admin' ? (
          <>
            <NavLink to="/admin" icon={LayoutDashboard}>Dashboard</NavLink>
            <NavLink to="/admin/shops" icon={Store}>Shops</NavLink>
            <NavLink to="/admin/items" icon={Package}>Products</NavLink>
            <NavLink to="/admin/pnl" icon={TrendingUp}>Profit & Loss</NavLink>
            <NavLink to="/admin/expenses" icon={Receipt}>Expenses</NavLink>
            <NavLink to="/transfers" icon={ArrowLeftRight}>Transfers</NavLink>
          </>
        ) : (
          <>
            <NavLink to="/attendant" icon={LayoutDashboard}>Dashboard</NavLink>
            <NavLink to="/pos" icon={Receipt}>Record Sale</NavLink>
            <NavLink to="/deposits" icon={Store}>Deposits</NavLink>
          </>
        )}
        
        <div className="pt-6 mt-6 border-t border-gray-700">
          <NavLink to="/profile" icon={UserCircle}>Your Profile</NavLink>
        </div>
      </nav>
    </aside>
  )
}
