import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Dashboard from "./pages/Dashboard";
import POS from "./pages/POS";
import Deposits from "./pages/Deposits";
import Transfers from "./pages/Transfers";
import Expenses from "./pages/Expenses";
import Profile from "./pages/Profile";
import Login from "./pages/Login";

import SidebarLayout from "./components/SidebarLayout";

function App() {
  return (
    <Router>
      <Routes>
        {/* Public Route */}
        <Route path="/login" element={<Login />} />

        {/* Protected Routes */}
        <Route element={<SidebarLayout />}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/pos" element={<POS />} />
          <Route path="/deposits" element={<Deposits />} />
          <Route path="/transfers" element={<Transfers />} />
          <Route path="/expenses" element={<Expenses />} />
          <Route path="/profile" element={<Profile />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
