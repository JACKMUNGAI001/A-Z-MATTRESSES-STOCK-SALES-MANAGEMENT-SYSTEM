import React, { useContext, useEffect, useState } from 'react'
import Sidebar from '../components/Sidebar'
import Header from '../components/Header'
import Card from '../components/Card'
import api from '../api/api'
import { AuthContext } from '../context/AuthContext'
import { useNavigate } from 'react-router-dom'

export default function AdminDashboard(){
  const { user } = useContext(AuthContext)
  const [shops, setShops] = useState([])
  const [pendingAttendants, setPendingAttendants] = useState([])
  const [allAttendants, setAllAttendants] = useState([])
  const [salesSummary, setSalesSummary] = useState(null)
  const [depositsSummary, setDepositsSummary] = useState(null)
  const [financialOverview, setFinancialOverview] = useState(null)
  const navigate = useNavigate()

  useEffect(()=> {
    api.get('/shops').then(res=>setShops(res.data)).catch(()=>{})
    fetchPendingAttendants()
    fetchAllAttendants()
    api.get('/reports/sales-summary').then(res=>setSalesSummary(res.data)).catch(()=>{})
    api.get('/reports/deposits-summary').then(res=>setDepositsSummary(res.data)).catch(()=>{})
    api.get('/reports/financial-overview').then(res=>setFinancialOverview(res.data)).catch(()=>{})
  },[])

  const fetchPendingAttendants = async () => {
    try {
      const response = await api.get('/admin/attendants/pending')
      setPendingAttendants(response.data)
    } catch (err) {
      alert('Error fetching pending attendants')
    }
  }

  const fetchAllAttendants = async () => {
    try {
      await api.get('/admin/attendants/all').then(res => setAllAttendants(res.data))
    } catch (err) {
      alert('Error fetching all attendants')
    }
  }

  const handleVerifyAttendant = async (userId, shopId) => {
    try {
      await api.patch(`/admin/attendants/${userId}/verify`, { is_verified: true, shop_id: shopId })
      alert('Attendant verified successfully!')
      fetchPendingAttendants() // Refresh the list
      fetchAllAttendants() // Refresh all attendants list
    } catch (err) {
      alert(`Error verifying attendant: ${err.response?.data?.msg || err.message}`)
    }
  }

  const handleRemoveAttendant = async (userId) => {
    try {
      await api.delete(`/admin/attendants/${userId}`)
      alert('Attendant removed successfully!')
      fetchAllAttendants() // Refresh all attendants list
    } catch (err) {
      alert(`Error removing attendant: ${err.response?.data?.msg || err.message}`)
    }
  }

  const handleShopClick = (shopId) => {
    navigate(`/admin/shops/${shopId}`);
  };

  return (
    <div className="flex">
      <Sidebar role="admin" />
      <main className="flex-1 p-6">
        <Header />
        <div className="grid grid-cols-3 gap-4">
          <div onClick={() => navigate('/admin/all-sales')} className="cursor-pointer">
            <Card title="Total Sales">
              KES {financialOverview ? financialOverview.total_sales.toLocaleString() : '...'}
            </Card>
          </div>
          <div onClick={() => navigate('/admin/all-deposits')} className="cursor-pointer">
            <Card title="Total Deposits">
              KES {financialOverview ? financialOverview.total_deposit_collections.toLocaleString() : '...'}
            </Card>
          </div>
          <div onClick={() => navigate('/admin/outstanding-deposits')} className="cursor-pointer">
            <Card title="Total Outstanding">
              {financialOverview ? financialOverview.customers_with_balances : '...'}
            </Card>
          </div>
        </div>

        {salesSummary && (
          <div className="mt-6">
            <h3 className="text-lg font-semibold mb-2">Sales Summary</h3>
            <div className="grid grid-cols-4 gap-4">
              <Card title="Today's Sales">KES {salesSummary.today}</Card>
              <Card title="This Week's Sales">KES {salesSummary.week}</Card>
              <Card title="This Month's Sales">KES {salesSummary.month}</Card>
              <Card title="This Year's Sales">KES {salesSummary.year}</Card>
            </div>
          </div>
        )}

        {depositsSummary && (
          <div className="mt-6">
            <h3 className="text-lg font-semibold mb-2">Deposits Summary</h3>
            <div className="grid grid-cols-4 gap-4">
              <Card title="Today's Deposits">KES {depositsSummary.today}</Card>
              <Card title="This Week's Deposits">KES {depositsSummary.week}</Card>
              <Card title="This Month's Deposits">KES {depositsSummary.month}</Card>
              <Card title="This Year's Deposits">KES {depositsSummary.year}</Card>
            </div>
          </div>
        )}

        <div className="mt-6">
          <h3 className="text-lg font-semibold mb-2">Shops</h3>
          <div className="grid grid-cols-3 gap-4">
            {shops.map(s => (
              <Card key={s.id} title={s.name} onClick={() => handleShopClick(s.id)}>
                <div>Address: {s.address}</div>
              </Card>
            ))}
          </div>
        </div>

        <div className="mt-6">
          <h3 className="text-lg font-semibold mb-2">Pending Attendants</h3>
          {pendingAttendants.length === 0 ? (
            <p>No pending attendants.</p>
          ) : (
            <div className="bg-white p-4 rounded-xl shadow">
              {pendingAttendants.map(attendant => (
                <div key={attendant.id} className="flex justify-between items-center py-2 border-b last:border-b-0">
                  <div>
                    <p className="font-medium">{attendant.name}</p>
                    <p className="text-sm text-gray-500">{attendant.email}</p>
                  </div>
                  <select
                    className="p-1 border rounded mr-2"
                    onChange={(e) => handleVerifyAttendant(attendant.id, e.target.value)}
                  >
                    <option value="">Assign Shop</option>
                    {shops.map(shop => (
                      <option key={shop.id} value={shop.id}>{shop.name}</option>
                    ))}
                  </select>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="mt-6">
          <h3 className="text-lg font-semibold mb-2">All Attendants</h3>
          {allAttendants.length === 0 ? (
            <p>No attendants registered.</p>
          ) : (
            <div className="bg-white p-4 rounded-xl shadow">
              {allAttendants.map(attendant => (
                <div key={attendant.id} className="flex justify-between items-center py-2 border-b last:border-b-0">
                  <div>
                    <p className="font-medium">{attendant.name} ({attendant.is_verified ? "Verified" : "Pending"})</p>
                    <p className="text-sm text-gray-500">{attendant.email} - {attendant.shop_name || "No Shop Assigned"}</p>
                  </div>
                  <button
                    onClick={() => handleRemoveAttendant(attendant.id)}
                    className="bg-red-500 text-white px-3 py-1 rounded-lg hover:bg-red-600"
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
