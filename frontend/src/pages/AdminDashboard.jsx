import React, { useContext, useEffect, useState } from 'react'
import Card from '../components/Card'
import api from '../api/api'
import { AuthContext } from '../context/AuthContext'
import { useNavigate, Link } from 'react-router-dom'
import { UserCheck, UserX, MapPin, Mail, ShieldCheck, UserCircle, Store, ChevronDown, ChevronUp } from 'lucide-react'
import TransferHistory from '../components/TransferHistory'

export default function AdminDashboard(){
  const { user } = useContext(AuthContext)
  const [shops, setShops] = useState([])
  const [pendingAttendants, setPendingAttendants] = useState([])
  const [allAttendants, setAllAttendants] = useState([])
  const [salesSummary, setSalesSummary] = useState(null)
  const [depositsSummary, setDepositsSummary] = useState(null)
  const [financialOverview, setFinancialOverview] = useState(null)
  const [stockSummary, setStockSummary] = useState(null)
  const [isStockSummaryOpen, setIsStockSummaryOpen] = useState(false)
  const navigate = useNavigate()

  useEffect(()=> {
    api.get('/shops').then(res=>setShops(res.data)).catch(()=>{})
    fetchPendingAttendants()
    fetchAllAttendants()
    api.get('/reports/sales-summary').then(res=>setSalesSummary(res.data)).catch(()=>{})
    api.get('/reports/deposits-summary').then(res=>setDepositsSummary(res.data)).catch(()=>{})
    api.get('/reports/financial-overview').then(res=>setFinancialOverview(res.data)).catch(()=>{})
    api.get('/reports/stock-summary').then(res=>setStockSummary(res.data)).catch(()=>{})
  },[])

  const fetchPendingAttendants = async () => {
    try {
      const response = await api.get('/admin/attendants/pending')
      setPendingAttendants(response.data)
    } catch (err) {
      console.error('Error fetching pending attendants')
    }
  }

  const fetchAllAttendants = async () => {
    try {
      const res = await api.get('/admin/attendants/all')
      setAllAttendants(res.data)
    } catch (err) {
      console.error('Error fetching all attendants')
    }
  }

  const handleVerifyAttendant = async (userId, shopId) => {
    if(!shopId) return;
    try {
      await api.patch(`/admin/attendants/${userId}/verify`, { is_verified: true, shop_id: shopId })
      alert('Attendant verified successfully!')
      fetchPendingAttendants()
      fetchAllAttendants()
    } catch (err) {
      alert(`Error verifying attendant: ${err.response?.data?.msg || err.message}`)
    }
  }

  const handleRemoveAttendant = async (userId) => {
    if(!window.confirm("Are you sure you want to remove this attendant?")) return;
    try {
      await api.delete(`/admin/attendants/${userId}`)
      alert('Attendant removed successfully!')
      fetchAllAttendants()
    } catch (err) {
      alert(`Error removing attendant: ${err.response?.data?.msg || err.message}`)
    }
  }

  const handleShopClick = (shopId) => {
    navigate(`/admin/shops/${shopId}`);
  };

  const formatCurrency = (val) => {
    return new Intl.NumberFormat('en-KE', { style: 'currency', currency: 'KES', minimumFractionDigits: 0 }).format(val || 0);
  };

  return (
    <>
        {/* OVERVIEW SECTION */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 md:gap-6 mb-10">
          <Card title="Total Sales" interactive={true} onClick={() => navigate('/admin/all-sales')}>
            {financialOverview ? formatCurrency(financialOverview.total_sales) : '...'}
          </Card>
          <Card title="Total Deposits" interactive={true} onClick={() => navigate('/admin/all-deposits')}>
            {financialOverview ? formatCurrency(financialOverview.total_deposit_collections) : '...'}
          </Card>
          <Card title="Total Outstanding" interactive={true} onClick={() => navigate('/admin/outstanding-deposits')}>
            {financialOverview ? financialOverview.customers_with_balances : '...'}
          </Card>
        </div>

        {/* SALES SUMMARY */}
        <div className="mb-10">
          <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-4 tracking-tight border-l-4 border-l-blue-600 pl-3 transition-colors text-sm uppercase tracking-widest text-gray-400 dark:text-gray-500">Sales Summary</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
            <Link to="/attendant/sales" className="no-underline"><Card title="Today's Sales" interactive={true} className="!p-4 sm:!p-6">{salesSummary ? formatCurrency(salesSummary.today) : '...'}</Card></Link>
            <Link to="/attendant/sales/week" className="no-underline"><Card title="This Week's" interactive={true} className="!p-4 sm:!p-6">{salesSummary ? formatCurrency(salesSummary.week) : '...'}</Card></Link>
            <Link to="/attendant/sales/month" className="no-underline"><Card title="This Month's" interactive={true} className="!p-4 sm:!p-6">{salesSummary ? formatCurrency(salesSummary.month) : '...'}</Card></Link>
            <Link to="/attendant/sales/year" className="no-underline"><Card title="This Year's" interactive={true} className="!p-4 sm:!p-6">{salesSummary ? formatCurrency(salesSummary.year) : '...'}</Card></Link>
          </div>
        </div>

        {/* DEPOSITS SUMMARY */}
        <div className="mb-10">
          <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-4 tracking-tight border-l-4 border-l-indigo-600 pl-3 transition-colors text-sm uppercase tracking-widest text-gray-400 dark:text-gray-500">Deposits Summary</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
            <Link to="/attendant/deposits/today" className="no-underline"><Card title="Today's" interactive={true} className="!p-4 sm:!p-6">{depositsSummary ? formatCurrency(depositsSummary.today) : '...'}</Card></Link>
            <Link to="/attendant/deposits/week" className="no-underline"><Card title="This Week's" interactive={true} className="!p-4 sm:!p-6">{depositsSummary ? formatCurrency(depositsSummary.week) : '...'}</Card></Link>
            <Link to="/attendant/deposits/month" className="no-underline"><Card title="This Month's" interactive={true} className="!p-4 sm:!p-6">{depositsSummary ? formatCurrency(depositsSummary.month) : '...'}</Card></Link>
            <Link to="/attendant/deposits/year" className="no-underline"><Card title="This Year's" interactive={true} className="!p-4 sm:!p-6">{depositsSummary ? formatCurrency(depositsSummary.year) : '...'}</Card></Link>
          </div>
        </div>

        {/* SHOPS SECTION */}
        <div className="mb-10">
          <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-4 tracking-tight transition-colors text-sm uppercase tracking-widest text-gray-400 dark:text-gray-500 border-l-4 border-l-blue-600 pl-3">Shops Management</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {shops.map(s => (
              <div key={s.id} onClick={() => handleShopClick(s.id)} className="bg-white dark:bg-gray-800 p-5 sm:p-6 rounded-2xl shadow-sm border border-blue-100 dark:border-gray-700 bg-gradient-to-br from-white to-blue-50/30 dark:from-gray-800 dark:to-green-900/10 hover:border-blue-400 dark:hover:border-blue-500 hover:shadow-xl hover:-translate-y-1.5 transition-all cursor-pointer group relative">
                <div className="absolute top-4 right-4 bg-blue-100 dark:bg-blue-900/50 p-1 rounded-lg text-blue-600 dark:text-blue-400"><Store size={14} strokeWidth={3} /></div>
                <h4 className="text-lg font-bold text-gray-900 dark:text-white mb-1 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">{s.name}</h4>
                <div className="flex items-start gap-2 text-gray-500 dark:text-gray-400 text-sm transition-colors"><MapPin size={16} className="mt-0.5 shrink-0" /><span>{s.address}</span></div>
              </div>
            ))}
          </div>
        </div>

        {/* STOCK SUMMARY BY CATEGORY */}
        <div className="mb-10">
          <div 
            className="flex items-center justify-between mb-4 cursor-pointer"
            onClick={() => setIsStockSummaryOpen(!isStockSummaryOpen)}
          >
            <h3 className="text-xl font-bold text-gray-800 dark:text-white tracking-tight border-l-4 border-l-green-600 pl-3 transition-colors text-sm uppercase tracking-widest text-gray-400 dark:text-gray-500">
              Stock Summary by Category
            </h3>
            <button className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors">
              {isStockSummaryOpen ? <ChevronUp size={20} className="text-gray-500" /> : <ChevronDown size={20} className="text-gray-500" />}
            </button>
          </div>
          
          {isStockSummaryOpen && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-in fade-in duration-300">
              {stockSummary && Object.entries(stockSummary).map(([shopName, categories]) => (
                <div key={shopName} className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-green-100 dark:border-gray-700 bg-gradient-to-br from-white to-green-50/30 dark:from-gray-800 dark:to-green-900/10 transition-all">
                  <h4 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                    <Store size={18} className="text-green-600 dark:text-green-400" />
                    {shopName}
                  </h4>
                  <div className="space-y-3">
                    {Object.entries(categories).map(([category, quantity]) => (
                      <div key={category} className="flex justify-between items-center p-3 bg-white/50 dark:bg-gray-900/50 rounded-xl border border-gray-50 dark:border-gray-700">
                        <span className="text-gray-600 dark:text-gray-400 font-medium">{category}</span>
                        <span className="text-lg font-bold text-gray-900 dark:text-white bg-green-100 dark:bg-green-900/50 px-3 py-1 rounded-lg text-green-700 dark:text-green-400">{quantity}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* TRANSFER HISTORY */}
        <TransferHistory />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 pb-20 mt-10">
          {/* PENDING ATTENDANTS */}
          <div>
            <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-4 tracking-tight transition-colors text-sm uppercase tracking-widest text-gray-400 dark:text-gray-500 border-l-4 border-l-orange-600 pl-3">Pending Attendants</h3>
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden transition-colors">
              {pendingAttendants.length === 0 ? (<div className="p-8 text-center text-gray-400 dark:text-gray-500 italic">No pending attendants.</div>) : (
                <div className="divide-y divide-gray-50 dark:divide-gray-700">
                  {pendingAttendants.map(attendant => (
                    <div key={attendant.id} className="p-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center text-gray-400 dark:text-gray-500"><UserCircle size={32} /></div>
                        <div><p className="font-bold text-gray-900 dark:text-white">{attendant.name}</p><div className="flex items-center gap-2 text-gray-500 dark:text-gray-400 text-sm"><Mail size={14} /><span>{attendant.email}</span></div></div>
                      </div>
                      <div className="flex items-center gap-2 w-full sm:w-auto">
                        <select className="flex-1 sm:flex-none p-2 border border-gray-200 dark:border-gray-700 rounded-lg text-sm bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all" onChange={(e) => handleVerifyAttendant(attendant.id, e.target.value)}>
                          <option value="">Assign Shop</option>
                          {shops.map(shop => (<option key={shop.id} value={shop.id}>{shop.name}</option>))}
                        </select>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* ALL ATTENDANTS */}
          <div>
            <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-4 tracking-tight transition-colors text-sm uppercase tracking-widest text-gray-400 dark:text-gray-500 border-l-4 border-l-blue-600 pl-3">All Attendants</h3>
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden transition-colors">
              {allAttendants.length === 0 ? (<div className="p-8 text-center text-gray-400 dark:text-gray-500 italic">No attendants registered.</div>) : (
                <div className="divide-y divide-gray-50 dark:divide-gray-700">
                  {allAttendants.map(attendant => (
                    <div key={attendant.id} className="p-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                      <div className="flex items-center gap-4">
                        <div className="relative"><div className="w-12 h-12 bg-blue-50 dark:bg-blue-900/30 rounded-full flex items-center justify-center text-blue-600 dark:text-blue-400"><UserCircle size={32} /></div>{attendant.is_verified && (<div className="absolute -top-1 -right-1 bg-white dark:bg-gray-800 rounded-full p-0.5 transition-colors"><ShieldCheck size={16} className="text-green-500" fill="currentColor" /></div>)}</div>
                        <div><div className="flex items-center gap-2"><p className="font-bold text-gray-900 dark:text-white">{attendant.name}</p>{attendant.is_verified && <span className="text-[10px] bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">Verified</span>}</div><div className="flex items-center gap-3 text-gray-500 dark:text-gray-400 text-xs transition-colors"><span className="flex items-center gap-1"><Mail size={12} /> {attendant.email}</span><span className="flex items-center gap-1"><Store size={12} /> {attendant.shop_name || "Unassigned"}</span></div></div>
                      </div>
                      <button onClick={() => handleRemoveAttendant(attendant.id)} className="w-full sm:w-auto bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 px-4 py-2 rounded-xl text-sm font-bold hover:bg-red-600 hover:text-white transition-all flex items-center justify-center gap-2"><UserX size={16} /> Remove</button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
    </>
  )
}
