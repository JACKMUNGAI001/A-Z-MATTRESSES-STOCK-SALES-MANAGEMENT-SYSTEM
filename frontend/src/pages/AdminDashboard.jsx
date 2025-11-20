import React, { useContext, useEffect, useState } from 'react'
import Sidebar from '../components/Sidebar'
import Header from '../components/Header'
import Card from '../components/Card'
import api from '../api/api'
import { AuthContext } from '../context/AuthContext'

export default function AdminDashboard(){
  const { user } = useContext(AuthContext)
  const [shops, setShops] = useState([])
  useEffect(()=> {
    api.get('/shops').then(res=>setShops(res.data)).catch(()=>{})
  },[])
  return (
    <div className="flex">
      <Sidebar role="admin" />
      <main className="flex-1 p-6">
        <Header />
        <div className="grid grid-cols-3 gap-4">
          <Card title="Total Sales">KES 0</Card>
          <Card title="Total Deposits">KES 0</Card>
          <Card title="Total Outstanding">KES 0</Card>
        </div>
        <div className="mt-6">
          <h3 className="text-lg font-semibold mb-2">Shops</h3>
          <div className="grid grid-cols-3 gap-4">
            {shops.map(s => <Card key={s.id} title={s.name}><div>Address: {s.address}</div></Card>)}
          </div>
        </div>
      </main>
    </div>
  )
}
