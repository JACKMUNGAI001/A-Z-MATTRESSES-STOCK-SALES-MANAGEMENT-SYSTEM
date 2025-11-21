import React from 'react'
import { Link } from 'react-router-dom'

export default function Sidebar({ role }){
  return (
    <aside className="w-64 bg-white rounded-r p-4 shadow h-screen">
      <div className="mb-6 text-center">
        <h2 className="text-xl font-bold text-pastel-500">A - Z Mattresses</h2>
      </div>
      <nav>
        {role === 'admin' && <>
          <Link to="/admin" className="block py-2">Dashboard</Link>
          <Link to="/admin/shops" className="block py-2">Shops</Link>
          <Link to="/admin/items" className="block py-2">Products</Link>
          <Link to="/admin/expenses" className="block py-2">Expenses</Link>
          <Link to="/transfers" className="block py-2">Transfers</Link>
        </>}
        {role !== 'admin' && <>
          <Link to="/attendant" className="block py-2">Dashboard</Link>
          <Link to="/pos" className="block py-2">Record Sale</Link>
          <Link to="/deposits" className="block py-2">Deposits</Link>
        </>}
        <Link to="/profile" className="block py-2 mt-6">Your Profile</Link>
      </nav>
    </aside>
  )
}
