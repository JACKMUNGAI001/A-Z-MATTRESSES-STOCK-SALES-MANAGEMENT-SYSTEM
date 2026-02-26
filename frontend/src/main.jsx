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
import AdminShops from './pages/AdminShops'
import AdminItems from './pages/AdminItems'
import ShopDetails from './pages/ShopDetails'
import AdminShopStock from './pages/AdminShopStock'
import ProtectedRoute from './components/ProtectedRoute'
import AllSales from './pages/AllSales'
import AllDeposits from './pages/AllDeposits'
import OutstandingDeposits from './pages/OutstandingDeposits'
import TodaysSales from './pages/TodaysSales'
import WeeksSales from './pages/WeeksSales'
import MonthsSales from './pages/MonthsSales'
import YearsSales from './pages/YearsSales'
import LowStockItems from './pages/LowStockItems'
import DepositCustomers from './pages/DepositCustomers'
import TodaysDeposits from './pages/TodaysDeposits'
import WeeksDeposits from './pages/WeeksDeposits'
import MonthsDeposits from './pages/MonthsDeposits'
import YearsDeposits from './pages/YearsDeposits'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <AuthProvider>
      <BrowserRouter>
        <Routes>

          {/* Public pages */}
          <Route path="/" element={<Landing/>} />
          <Route path="/login" element={<Login/>} />
          <Route path="/register" element={<Register/>} />

          {/* Common Protected */}
          <Route path="/profile" element={<ProtectedRoute><Profile/></ProtectedRoute>} />

          {/* Admin Protected */}
          <Route path="/admin" element={<ProtectedRoute role="admin"><AdminDashboard/></ProtectedRoute>} />
          <Route path="/admin/shops" element={<ProtectedRoute role="admin"><AdminShops/></ProtectedRoute>} />
          <Route path="/admin/items" element={<ProtectedRoute role="admin"><AdminItems/></ProtectedRoute>} />
          <Route path="/admin/shops/:shopId" element={<ProtectedRoute role="admin"><ShopDetails/></ProtectedRoute>} />
          <Route path="/admin/shops/:shopId/stock" element={<ProtectedRoute role="admin"><AdminShopStock/></ProtectedRoute>} />
          <Route path="/admin/all-sales" element={<ProtectedRoute role="admin"><AllSales/></ProtectedRoute>} />
          <Route path="/admin/all-deposits" element={<ProtectedRoute role="admin"><AllDeposits/></ProtectedRoute>} />
          <Route path="/admin/outstanding-deposits" element={<ProtectedRoute role="admin"><OutstandingDeposits/></ProtectedRoute>} />
          <Route path="/admin/pnl" element={<ProtectedRoute role="admin"><PNLReport/></ProtectedRoute>} />
          <Route path="/admin/expenses" element={<ProtectedRoute role="admin"><Expenses/></ProtectedRoute>} />
          <Route path="/transfers" element={<ProtectedRoute role="admin"><Transfers/></ProtectedRoute>} />

          {/* Attendant Protected */}
          <Route path="/attendant" element={<ProtectedRoute role="attendant"><AttendantDashboard/></ProtectedRoute>} />
          <Route path="/pos" element={<ProtectedRoute role="attendant"><POS/></ProtectedRoute>} />
          <Route path="/deposits" element={<ProtectedRoute role="attendant"><Deposits/></ProtectedRoute>} />
          <Route path="/attendant/low-stock" element={<ProtectedRoute role="attendant"><LowStockItems /></ProtectedRoute>} />
          
          {/* Filtered Detail Views (Shared) */}
          <Route path="/attendant/sales" element={<ProtectedRoute><TodaysSales /></ProtectedRoute>} />
          <Route path="/attendant/sales/week" element={<ProtectedRoute><WeeksSales /></ProtectedRoute>} />
          <Route path="/attendant/sales/month" element={<ProtectedRoute><MonthsSales /></ProtectedRoute>} />
          <Route path="/attendant/sales/year" element={<ProtectedRoute><YearsSales /></ProtectedRoute>} />
          
          <Route path="/attendant/deposits/list" element={<ProtectedRoute><DepositCustomers /></ProtectedRoute>} />
          <Route path="/attendant/deposits/today" element={<ProtectedRoute><TodaysDeposits /></ProtectedRoute>} />
          <Route path="/attendant/deposits/week" element={<ProtectedRoute><WeeksDeposits /></ProtectedRoute>} />
          <Route path="/attendant/deposits/month" element={<ProtectedRoute><MonthsDeposits /></ProtectedRoute>} />
          <Route path="/attendant/deposits/year" element={<ProtectedRoute><YearsDeposits /></ProtectedRoute>} />

        </Routes>
      </BrowserRouter>
    </AuthProvider>
  </React.StrictMode>
)
