import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import api, { API_BASE } from '../api/api'
import { formatDate } from '../utils/helpers'
import { CheckCircle } from 'lucide-react'
import Pagination from '../components/Pagination'

export default function ShopSales(){
  const { shopId } = useParams()
  const [sales, setSales] = useState([])
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState('')
  const [pagination, setPagination] = useState(null)
  const [page, setPage] = useState(1)

  const fetchSales = async (pageToLoad = page) => {
    setLoading(true)
    setLoadError('')
    try {
      const res = await api.get(`/sales/shop/${shopId}`, {
        params: { page: pageToLoad, per_page: 25 },
      })
      if (Array.isArray(res.data)) {
        const perPage = 25
        const totalPages = Math.max(Math.ceil(res.data.length / perPage), 1)
        const safePage = Math.min(pageToLoad, totalPages)
        setSales(res.data.slice((safePage - 1) * perPage, safePage * perPage))
        setPagination({
          page: safePage,
          per_page: perPage,
          total: res.data.length,
          total_pages: totalPages,
        })
        setPage(safePage)
      } else if (
        Array.isArray(res.data?.items) &&
        res.data.pagination &&
        !Array.isArray(res.data.pagination)
      ) {
        setSales(res.data.items)
        setPagination(res.data.pagination)
        setPage(res.data.pagination.page)
      } else {
        throw new Error('The shop sales API returned an unsupported response format.')
      }
    } catch (err) {
      console.error('Error fetching shop sales', err)
      setSales([])
      setPagination(null)
      setLoadError(err.response?.data?.msg || err.message || 'Unable to load shop sales. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchSales()
  }, [shopId, page])

  return (
    <div className="p-6">
      <h1 className="text-2xl font-black mb-4">Shop Sales History</h1>
      {loading ? <div className="p-6">Loading...</div> : (
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border p-4 overflow-auto">
          {loadError ? (
            <div className="p-10 text-center">
              <p className="mb-4 text-red-600 dark:text-red-400">{loadError}</p>
              <button
                type="button"
                onClick={() => fetchSales(page)}
                className="rounded-lg bg-blue-600 px-4 py-2 font-bold text-white hover:bg-blue-700"
              >
                Retry
              </button>
            </div>
          ) : sales.length === 0 ? <div className="p-10 text-center text-gray-400">No sales recorded.</div> : (
            <table className="w-full text-left">
              <thead className="text-xs text-gray-500 uppercase font-black">
                <tr><th className="px-4 py-2">ID</th><th className="px-4 py-2">Items</th><th className="px-4 py-2">Amount</th><th className="px-4 py-2">Date</th><th className="px-4 py-2">Receipt</th></tr>
              </thead>
              <tbody>
                {sales.map(s => (
                  <tr key={s.id} className="border-t border-gray-100 dark:border-gray-700">
                    <td className="px-4 py-2 font-bold">{s.id}</td>
                    <td className="px-4 py-2"><div className="flex flex-wrap gap-1">{s.items?.map((it, i) => <span key={i} className="px-2 py-0.5 bg-gray-100 dark:bg-gray-700 rounded text-xs">{it.item_name} x{it.qty}</span>)}</div></td>
                    <td className="px-4 py-2 font-black">{s.total_amount}</td>
                    <td className="px-4 py-2">{formatDate(s.created_at)}</td>
                    <td className="px-4 py-2">{s.receipt_uuid ? <a href={`${API_BASE}/receipts/${s.receipt_uuid}`} target="_blank" rel="noreferrer" className="text-blue-600"><CheckCircle size={14}/> View</a> : 'N/A'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
          <Pagination pagination={pagination} onPageChange={setPage} />
        </div>
      )}
    </div>
  )
}
