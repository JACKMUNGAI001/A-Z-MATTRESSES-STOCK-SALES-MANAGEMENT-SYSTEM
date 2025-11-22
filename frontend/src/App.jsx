import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Dashboard from "./pages/Dashboard";
import POS from "./pages/POS";
import Deposits from "./pages/Deposits";
import Transfers from "./pages/Transfers";
import Expenses from "./pages/Expenses";
import Profile from "./pages/Profile";
import Login from "./pages/Login";
import TodaysSales from "./pages/TodaysSales";
import LowStockItems from "./pages/LowStockItems";
import DepositCustomers from "./pages/DepositCustomers";
import AdminShopStock from "./pages/AdminShopStock"; // Import AdminShopStock
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
        <Route path="/attendant/low-stock" element={<ProtectedRoute><AttendantLayout><LowStockItems /></AttendantLayout></ProtectedRoute>} />
        <Route path="/attendant/deposits" element={<ProtectedRoute><AttendantLayout><DepositCustomers /></AttendantLayout></ProtectedRoute>} />
        <Route path="/admin/shops/:shopId/stock" element={<ProtectedRoute role="admin"><AdminShopStock /></ProtectedRoute>} /> {/* New route */}
      </Routes>
    </Router>
  );
}

export default App;
