import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import './index.css'
import { AuthProvider } from './context/AuthContext'
import Login from './pages/Login'
import Register from './pages/Register'
import AdminDashboard from './pages/AdminDashboard'
import AttendantDashboard from './pages/AttendantDashboard'
import POS from './pages/POS'
import Deposits from './pages/Deposits'
import Transfers from './pages/Transfers'
import Expenses from './pages/Expenses'
import Profile from './pages/Profile'
import ProtectedRoute from './components/ProtectedRoute'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <AuthProvider>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login/>} />
        <Route path="/login" element={<Login/>} />
        <Route path="/register" element={<Register/>} />

        <Route path="/admin" element={<ProtectedRoute role="admin"><AdminDashboard/></ProtectedRoute>} />
        <Route path="/attendant" element={<ProtectedRoute role="attendant"><AttendantDashboard/></ProtectedRoute>} />

        <Route path="/pos" element={<ProtectedRoute role="attendant"><POS/></ProtectedRoute>} />
        <Route path="/deposits" element={<ProtectedRoute role="attendant"><Deposits/></ProtectedRoute>} />
        <Route path="/transfers" element={<ProtectedRoute role="admin"><Transfers/></ProtectedRoute>} />
        <Route path="/admin/expenses" element={<ProtectedRoute role="admin"><Expenses/></ProtectedRoute>} />
        <Route path="/profile" element={<ProtectedRoute><Profile/></ProtectedRoute>} />
      </Routes>
    </BrowserRouter>
    </AuthProvider>
  </React.StrictMode>
)
