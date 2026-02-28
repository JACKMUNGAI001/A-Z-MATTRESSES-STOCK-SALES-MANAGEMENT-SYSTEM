import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import './index.css'
import { AuthProvider } from './context/AuthContext'
import { ThemeProvider } from './context/ThemeContext'
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
import PageLayout from './components/PageLayout'
import AllSales from './pages/AllSales'
import AllDeposits from './pages/AllDeposits'
import OutstandingDeposits from './pages/OutstandingDeposits'
import AdminSuppliers from './pages/AdminSuppliers'
import AdminSupplierInvoices from './pages/AdminSupplierInvoices'
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
      <ThemeProvider>
        <BrowserRouter>
          <Routes>

            {/* Public pages */}
            <Route path="/" element={<Landing/>} />
            <Route path="/login" element={<Login/>} />
            <Route path="/register" element={<Register/>} />

            {/* Common Protected */}
            <Route path="/profile" element={<ProtectedRoute><PageLayout><Profile/></PageLayout></ProtectedRoute>} />

            {/* Admin Protected */}
            <Route path="/admin" element={<ProtectedRoute role="admin"><PageLayout role="admin"><AdminDashboard/></PageLayout></ProtectedRoute>} />
            <Route path="/admin/shops" element={<ProtectedRoute role="admin"><PageLayout role="admin"><AdminShops/></PageLayout></ProtectedRoute>} />
            <Route path="/admin/items" element={<ProtectedRoute role="admin"><PageLayout role="admin"><AdminItems/></PageLayout></ProtectedRoute>} />
            <Route path="/admin/suppliers" element={<ProtectedRoute role="admin"><PageLayout role="admin" title="Suppliers Management"><AdminSuppliers/></PageLayout></ProtectedRoute>} />
            <Route path="/admin/supplier-invoices" element={<ProtectedRoute role="admin"><PageLayout role="admin" title="Supplier Invoices"><AdminSupplierInvoices/></PageLayout></ProtectedRoute>} />
            <Route path="/admin/shops/:shopId" element={<ProtectedRoute role="admin"><PageLayout role="admin"><ShopDetails/></PageLayout></ProtectedRoute>} />
            <Route path="/admin/shops/:shopId/stock" element={<ProtectedRoute role="admin"><PageLayout role="admin"><AdminShopStock/></PageLayout></ProtectedRoute>} />
            <Route path="/admin/all-sales" element={<ProtectedRoute role="admin"><PageLayout role="admin"><AllSales/></PageLayout></ProtectedRoute>} />
            <Route path="/admin/all-deposits" element={<ProtectedRoute role="admin"><PageLayout role="admin"><AllDeposits/></PageLayout></ProtectedRoute>} />
            <Route path="/admin/outstanding-deposits" element={<ProtectedRoute role="admin"><PageLayout role="admin"><OutstandingDeposits/></PageLayout></ProtectedRoute>} />
            <Route path="/admin/pnl" element={<ProtectedRoute role="admin"><PageLayout role="admin"><PNLReport/></PageLayout></ProtectedRoute>} />
            <Route path="/admin/expenses" element={<ProtectedRoute role="admin"><PageLayout role="admin"><Expenses/></PageLayout></ProtectedRoute>} />
            <Route path="/transfers" element={<ProtectedRoute role="admin"><PageLayout role="admin"><Transfers/></PageLayout></ProtectedRoute>} />

            {/* Attendant Protected */}
            <Route path="/attendant" element={<ProtectedRoute role="attendant"><PageLayout role="attendant"><AttendantDashboard/></PageLayout></ProtectedRoute>} />
            <Route path="/pos" element={<ProtectedRoute role="attendant"><PageLayout role="attendant"><POS/></PageLayout></ProtectedRoute>} />
            <Route path="/deposits" element={<ProtectedRoute role="attendant"><PageLayout role="attendant"><Deposits/></PageLayout></ProtectedRoute>} />
            <Route path="/attendant/low-stock" element={<ProtectedRoute role="attendant"><PageLayout role="attendant"><LowStockItems /></PageLayout></ProtectedRoute>} />
            
            {/* Filtered Detail Views (Shared) */}
            <Route path="/attendant/sales" element={<ProtectedRoute><PageLayout><TodaysSales /></PageLayout></ProtectedRoute>} />
            <Route path="/attendant/sales/week" element={<ProtectedRoute><PageLayout><WeeksSales /></PageLayout></ProtectedRoute>} />
            <Route path="/attendant/sales/month" element={<ProtectedRoute><PageLayout><MonthsSales /></PageLayout></ProtectedRoute>} />
            <Route path="/attendant/sales/year" element={<ProtectedRoute><PageLayout><YearsSales /></PageLayout></ProtectedRoute>} />
            
            <Route path="/attendant/deposits/list" element={<ProtectedRoute><PageLayout><DepositCustomers /></PageLayout></ProtectedRoute>} />
            <Route path="/attendant/deposits/today" element={<ProtectedRoute><PageLayout><TodaysDeposits /></PageLayout></ProtectedRoute>} />
            <Route path="/attendant/deposits/week" element={<ProtectedRoute><PageLayout><WeeksDeposits /></PageLayout></ProtectedRoute>} />
            <Route path="/attendant/deposits/month" element={<ProtectedRoute><PageLayout><MonthsDeposits /></PageLayout></ProtectedRoute>} />
            <Route path="/attendant/deposits/year" element={<ProtectedRoute><PageLayout><YearsDeposits /></PageLayout></ProtectedRoute>} />

          </Routes>
        </BrowserRouter>
      </ThemeProvider>
    </AuthProvider>
  </React.StrictMode>
)
