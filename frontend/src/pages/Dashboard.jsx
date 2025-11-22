import React, { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import AdminDashboard from './AdminDashboard';
import AttendantDashboard from './AttendantDashboard';

export default function Dashboard() {
  const { user } = useContext(AuthContext);

  if (user?.role === 'admin') {
    return <AdminDashboard />;
  }

  return <AttendantDashboard />;
}
