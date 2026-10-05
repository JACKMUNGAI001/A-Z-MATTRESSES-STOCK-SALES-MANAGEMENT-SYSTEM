import React, { useEffect, useState } from 'react'
import api, { API_BASE } from '../api/api'
import { FileText, Store, Wallet } from 'lucide-react'
import Pagination from '../components/Pagination'

export default function OutstandingCredits(){
  const [credits, setCredits] = useState([])
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState('')
  const [pagination, setPagination] = useState(null)
  const [page, setPage] = useState(1)

  useEffect(() => { fetchCredits(page) }, [page])

  const fetchCredits = async (pageToLoad = page) => {
    setLoading(true)
    setLoadError('')
    try{
      const res = await api.get('/reports/outstanding-credits', {
        params: { page: pageToLoad, per_page: 25 },
      })
      const items = Array.isArray(res.data) ? res.data : res.data?.items
      if (!Array.isArray(items)) {
        throw new Error('The outstanding credits API returned an unsupported response format.')
      }

      const responsePagination = res.data?.pagination
      if (
        responsePagination &&
        !Array.isArray(responsePagination) &&
        Number.isInteger(responsePagination.page) &&
        Number.isInteger(responsePagination.total_pages)
      ) {
        setCredits(items)
        setPagination(responsePagination)
        setPage(responsePagination.page)
      } else {
        const perPage = 25
        const totalPages = Math.max(Math.ceil(items.length / perPage), 1)
        const safePage = Math.min(pageToLoad, totalPages)
        setCredits(items.slice((safePage - 1) * perPage, safePage * perPage))
        setPagination({
          page: safePage,
          per_page: perPage,
          total: items.length,
          total_pages: totalPages,
        })
        setPage(safePage)
      }
    }catch(err){
      console.error('Error fetching outstanding credits', err)
      setCredits([])
      setPagination(null)
      setLoadError(err.response?.data?.msg || err.message || 'Unable to load outstanding credits. Please try again.')
    }finally{ setLoading(false) }
  }

  const handlePay = async (sale) => {
    const remaining = (sale.total_amount || 0) - (sale.paid_amount || 0)
    const input = window.prompt(`Enter payment amount (remaining KES ${remaining}):`, "")
    if (!input) return
    const amount = parseFloat(input)
    if (isNaN(amount) || amount <= 0) { alert('Please enter a valid amount'); return }
    try{
      await api.post(`/sales/${sale.id}/payments`, { amount })
      alert('Payment recorded')
      fetchCredits()
    }catch(err){ alert(`Error recording payment: ${err.response?.data?.msg || err.message}`) }
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-black">Outstanding Credit Sales</h1>
      </div>
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border p-4">
        {loading ? (
          <div className="p-8 text-center">Loading...</div>
        ) : loadError ? (
          <div className="p-8 text-center">
            <p className="mb-4 text-red-600 dark:text-red-400">{loadError}</p>
            <button
              type="button"
              onClick={() => fetchCredits(page)}
              className="rounded-lg bg-blue-600 px-4 py-2 font-bold text-white hover:bg-blue-700"
            >
              Retry
            </button>
          </div>
        ) : credits.length === 0 ? (
          <div className="p-8 text-center">No outstanding credits.</div>
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
                <th className="px-4 py-2 text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {credits.map(c => (
                <tr key={c.id} className="border-t">
                  <td className="px-4 py-3">#{c.id}</td>
                  <td className="px-4 py-3">{c.shop_name}</td>
                  <td className="px-4 py-3">{c.attendant_name}</td>
                  <td className="px-4 py-3 text-right">KES {Number(c.total_amount).toLocaleString()}</td>
                  <td className="px-4 py-3 text-right">KES {Number(c.paid_amount).toLocaleString()}</td>
                  <td className="px-4 py-3 text-right font-bold">KES {Number(c.remaining).toLocaleString()}</td>
                  <td className="px-4 py-3 text-center">
                    <button onClick={() => handlePay(c)} className="bg-green-50 text-green-600 px-3 py-1 rounded-lg inline-flex items-center gap-2">
                      <Wallet size={14} /> PAY
                    </button>
                    {c.receipt_uuid && (
                      <a href={`${API_BASE}/receipts/${c.receipt_uuid}`} target="_blank" rel="noreferrer" className="ml-2 text-blue-600"> <FileText size={14} /> </a>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
        <Pagination pagination={pagination} onPageChange={setPage} />
      </div>
    </div>
  )
}
