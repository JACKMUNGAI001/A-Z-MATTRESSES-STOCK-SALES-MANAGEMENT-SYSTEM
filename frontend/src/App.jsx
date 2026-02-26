import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Dashboard from "./pages/Dashboard";
import POS from "./pages/POS";
import Deposits from "./pages/Deposits";
import Transfers from "./pages/Transfers";
import Expenses from "./pages/Expenses";
import Profile from "./pages/Profile";
import Login from "./pages/Login";
import TodaysSales from "./pages/TodaysSales";
import MonthsSales from "./pages/MonthsSales";
import YearsSales from "./pages/YearsSales";
import LowStockItems from "./pages/LowStockItems";
import DepositCustomers from "./pages/DepositCustomers";
import AdminDashboard from "./pages/AdminDashboard";
import AdminShopStock from "./pages/AdminShopStock";
import AdminSalesSummary from "./pages/AdminSalesSummary";
import SalesSummary from "./pages/SalesSummary";
import AllSales from "./pages/AllSales";
import AllDeposits from "./pages/AllDeposits";
import OutstandingDeposits from "./pages/OutstandingDeposits";

import ProtectedRoute from "./components/ProtectedRoute";
import AttendantLayout from "./components/AttendantLayout";

function App() {
  return (
    <Router>
      <Routes>
        {/* Public Route */}
        <Route path="/login" element={<Login />} />

        {/* Protected Routes */}
        <Route path="/" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        <Route path="/pos" element={<ProtectedRoute><POS /></ProtectedRoute>} />
        <Route path="/deposits" element={<ProtectedRoute><Deposits /></ProtectedRoute>} />
        <Route path="/transfers" element={<ProtectedRoute><Transfers /></ProtectedRoute>} />
        <Route path="/expenses" element={<ProtectedRoute><Expenses /></ProtectedRoute>} />
        <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
        <Route path="/attendant/sales" element={<ProtectedRoute><AttendantLayout><TodaysSales /></AttendantLayout></ProtectedRoute>} />
        <Route path="/attendant/sales/month" element={<ProtectedRoute><AttendantLayout><MonthsSales /></AttendantLayout></ProtectedRoute>} />
        <Route path="/attendant/sales/year" element={<ProtectedRoute><AttendantLayout><YearsSales /></AttendantLayout></ProtectedRoute>} />
        <Route path="/attendant/low-stock" element={<ProtectedRoute><AttendantLayout><LowStockItems /></AttendantLayout></ProtectedRoute>} />
        <Route path="/attendant/deposits" element={<ProtectedRoute><AttendantLayout><DepositCustomers /></AttendantLayout></ProtectedRoute>} />
        
        {/* Admin Routes */}
        <Route path="/admin/dashboard" element={<ProtectedRoute role="admin"><AdminDashboard /></ProtectedRoute>} />
        <Route path="/admin/shops/:shopId/stock" element={<ProtectedRoute role="admin"><AdminShopStock /></ProtectedRoute>} />
        <Route path="/admin/sales-summary" element={<ProtectedRoute role="admin"><AdminSalesSummary /></ProtectedRoute>} />
        <Route path="/admin/all-sales" element={<ProtectedRoute role="admin"><AllSales /></ProtectedRoute>} />
        <Route path="/admin/all-deposits" element={<ProtectedRoute role="admin"><AllDeposits /></ProtectedRoute>} />
        <Route path="/admin/outstanding-deposits" element={<ProtectedRoute role="admin"><OutstandingDeposits /></ProtectedRoute>} />
      </Routes>
    </Router>
  );
}

export default App;