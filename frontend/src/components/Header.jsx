import React, { useContext } from 'react'
import { AuthContext } from '../context/AuthContext'

export default function Header(){
  const { user, logout } = useContext(AuthContext)
  return (
    <header className="flex justify-between items-center p-4 bg-white rounded shadow mb-6">
      <div>
        <div className="text-sm text-gray-500">Role: <strong>{user?.role}</strong></div>
        <div className="text-lg font-semibold">{user?.name}</div>
      </div>
      <div>
        <button onClick={logout} className="bg-red-500 text-white px-3 py-1 rounded">Log Out</button>
      </div>
    </header>
  )
}
