import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import './index.css'
import { AuthProvider } from './context/AuthContext'
import Login from './pages/Login'
import Register from './pages/Register'
import Landing from './pages/Landing'
import AdminDashboard from './pages/AdminDashboard'
import AttendantDashboard from './pages/AttendantDashboard'
import POS from './pages/POS'
import Deposits from './pages/Deposits'
import Transfers from './pages/Transfers'
import Expenses from './pages/Expenses'
import Profile from './pages/Profile'
import PNLReport from './pages/PNLReport'
import AdminShops from './pages/AdminShops' // New import
import AdminItems from './pages/AdminItems' // New import
import ShopDetails from './pages/ShopDetails' // New import
import ProtectedRoute from './components/ProtectedRoute'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <AuthProvider>
      <BrowserRouter>
        <Routes>

          {/* Public pages */}
          <Route path="/" element={<Landing/>} />
          <Route path="/login" element={<Login/>} />
          <Route path="/register" element={<Register/>} />

          {/* Protected */}
          <Route path="/admin" element={<ProtectedRoute role="admin"><AdminDashboard/></ProtectedRoute>} />
          <Route path="/attendant" element={<ProtectedRoute role="attendant"><AttendantDashboard/></ProtectedRoute>} />
          <Route path="/pos" element={<ProtectedRoute role="attendant"><POS/></ProtectedRoute>} />
          <Route path="/deposits" element={<ProtectedRoute role="attendant"><Deposits/></ProtectedRoute>} />
          <Route path="/transfers" element={<ProtectedRoute role="admin"><Transfers/></ProtectedRoute>} />
          <Route path="/admin/expenses" element={<ProtectedRoute role="admin"><Expenses/></ProtectedRoute>} />
          <Route path="/profile" element={<ProtectedRoute><Profile/></ProtectedRoute>} />
          <Route path="/admin/pnl-report" element={<ProtectedRoute role="admin"><PNLReport/></ProtectedRoute>} />
          <Route path="/admin/shops" element={<ProtectedRoute role="admin"><AdminShops/></ProtectedRoute>} /> {/* New route */}
          <Route path="/admin/items" element={<ProtectedRoute role="admin"><AdminItems/></ProtectedRoute>} /> {/* New route */}
          <Route path="/admin/shops/:shopId" element={<ProtectedRoute role="admin"><ShopDetails/></ProtectedRoute>} /> {/* New route */}

        </Routes>
      </BrowserRouter>
    </AuthProvider>
  </React.StrictMode>
)
