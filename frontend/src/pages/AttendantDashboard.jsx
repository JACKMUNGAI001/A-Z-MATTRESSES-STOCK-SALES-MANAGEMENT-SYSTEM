import React from 'react'
import Sidebar from '../components/Sidebar'
import Header from '../components/Header'
import Card from '../components/Card'

export default function AttendantDashboard(){
  const user = JSON.parse(localStorage.getItem('user')||'{}')
  return (
    <div className="flex">
      <Sidebar role="attendant" />
      <main className="flex-1 p-6">
        <Header />
        <div className="grid grid-cols-3 gap-4">
          <Card title="Today's Sales">KES 0</Card>
          <Card title="Low Stock Items">0</Card>
          <Card title="Deposit Customers">0</Card>
        </div>
      </main>
    </div>
  )
}
