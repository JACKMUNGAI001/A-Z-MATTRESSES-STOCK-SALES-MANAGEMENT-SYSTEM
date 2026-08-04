import React, { useEffect, useState } from 'react'
import api, { API_BASE } from '../api/api'
import { Wallet, FileText } from 'lucide-react'

export default function CreditSales(){
  const [sales, setSales] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => { fetchSales() }, [])

  const fetchSales = async () => {
    setLoading(true)
    try{
      const res = await api.get('/reports/credit-sales')
      setSales(res.data)
    }catch(err){ console.error('Error fetching credit sales', err) }
    finally{ setLoading(false) }
  }

  const handlePay = async (sale) => {
    const remaining = (sale.total_amount || 0) - (sale.paid_amount || 0)
    const input = window.prompt(`Enter payment amount (remaining KES ${remaining}):`, remaining)
    if (!input) return
    const amount = parseFloat(input)
    if (isNaN(amount) || amount <= 0) { alert('Please enter a valid amount'); return }
    try{
      await api.post(`/sales/${sale.id}/payments`, { amount })
      alert('Payment recorded')
      fetchSales()
    }catch(err){ alert(`Error recording payment: ${err.response?.data?.msg || err.message}`) }
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-black">Credit Sales</h1>
      </div>
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border p-4">
        {loading ? (
          <div className="p-8 text-center">Loading...</div>
        ) : sales.length === 0 ? (
          <div className="p-8 text-center">No credit sales found.</div>
        ) : (
          <table className="w-full text-sm">
            <thead className="text-xs text-gray-500 uppercase">
              <tr>
                <th className="px-4 py-2 text-left">ID</th>
                <th className="px-4 py-2 text-left">Shop</th>
                <th className="px-4 py-2 text-left">Attendant</th>
                <th className="px-4 py-2 text-right">Total</th>
                <th className="px-4 py-2 text-right">Paid</th>
                <th className="px-4 py-2 text-right">Remaining</th>
                <th className="px-4 py-2 text-left">Status</th>
                <th className="px-4 py-2 text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {sales.map(c => (
                <tr key={c.id} className="border-t">
                  <td className="px-4 py-3">#{c.id}</td>
                  <td className="px-4 py-3">{c.shop_name}</td>
                  <td className="px-4 py-3">{c.attendant_name}</td>
                  <td className="px-4 py-3 text-right">KES {Number(c.total_amount).toLocaleString()}</td>
                  <td className="px-4 py-3 text-right">KES {Number(c.paid_amount).toLocaleString()}</td>
                  <td className="px-4 py-3 text-right font-bold">KES {Number(c.remaining).toLocaleString()}</td>
                  <td className="px-4 py-3">{c.status?.toUpperCase()}</td>
                  <td className="px-4 py-3 text-center">
                    {c.status !== 'paid' && (
                      <button onClick={() => handlePay(c)} className="bg-green-50 text-green-600 px-3 py-1 rounded-lg inline-flex items-center gap-2">
                        <Wallet size={14} /> PAY
                      </button>
                    )}
                    {c.receipt_uuid && (
                      <a href={`${API_BASE}/receipts/${c.receipt_uuid}`} target="_blank" rel="noreferrer" className="ml-2 text-blue-600"> <FileText size={14} /> </a>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
