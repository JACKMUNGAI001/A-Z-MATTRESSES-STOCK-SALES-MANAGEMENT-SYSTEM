import React, { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import AdminDashboard from './AdminDashboard';
import AttendantDashboard from './AttendantDashboard';
import ManagerDashboard from './ManagerDashboard';

export default function Dashboard() {
  const { user } = useContext(AuthContext);

  if (user?.role === 'admin') {
    return <AdminDashboard />;
  }
  
  if (user?.role === 'manager') {
    return <ManagerDashboard />;
  }

  return <AttendantDashboard />;
}
