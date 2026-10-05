import React, { useContext, useEffect, useState } from 'react'
import api, { API_BASE } from '../api/api'
import { Wallet, FileText, Edit, Trash2 } from 'lucide-react'
import { AuthContext } from '../context/AuthContext'
import EditSaleModal from '../components/EditSaleModal'
import MobileSaleCard from '../components/MobileSaleCard'
import Pagination from '../components/Pagination'

export default function CreditSales(){
  const [sales, setSales] = useState([])
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState('')
  const [editingSale, setEditingSale] = useState(null)
  const [activeSection, setActiveSection] = useState('unpaid')
  const [pagination, setPagination] = useState(null)
  const [page, setPage] = useState(1)
  const { user } = useContext(AuthContext)

  useEffect(() => {
    setPage(1)
    fetchSales(1)
  }, [activeSection])

  const fetchSales = async (pageToLoad = page) => {
    setLoading(true)
    setLoadError('')
    try{
      const res = await api.get('/reports/credit-sales', {
        params: { page: pageToLoad, per_page: 25, status: activeSection },
      })
      const responseItems = Array.isArray(res.data) ? res.data : res.data?.items
      const responsePagination = res.data?.pagination
      if (!Array.isArray(responseItems)) {
        throw new Error('The credit sales API returned an unsupported response format.')
      }

      if (
        responsePagination &&
        !Array.isArray(responsePagination) &&
        Number.isInteger(responsePagination.page) &&
        Number.isInteger(responsePagination.total_pages)
      ) {
        setSales(responseItems)
        setPagination(responsePagination)
        setPage(responsePagination.page)
      } else {
        const matchingSales = responseItems.filter((sale) =>
          activeSection === 'paid' ? sale.status === 'paid' : sale.status !== 'paid'
        )
        const perPage = 25
        const totalPages = Math.max(Math.ceil(matchingSales.length / perPage), 1)
        const safePage = Math.min(pageToLoad, totalPages)
        setSales(matchingSales.slice((safePage - 1) * perPage, safePage * perPage))
        setPagination({
          page: safePage,
          per_page: perPage,
          total: matchingSales.length,
          total_pages: totalPages,
        })
        setPage(safePage)
      }
    }catch(err){
      console.error('Error fetching credit sales', err)
      setSales([])
      setPagination(null)
      setLoadError(err.response?.data?.msg || err.message || 'Unable to load credit sales. Please try again.')
    }
    finally{ setLoading(false) }
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
      fetchSales()
    }catch(err){ alert(`Error recording payment: ${err.response?.data?.msg || err.message}`) }
  }

  const handleDelete = async (sale) => {
    const confirmed = window.confirm(
      `Delete credit sale #${sale.id}? This will restore its items to stock and remove the sale from totals.`
    )
    if (!confirmed) return

    try {
      await api.delete(`/sales/${sale.id}`)
      alert('Credit sale deleted and stock restored successfully.')
      fetchSales()
    } catch (err) {
      alert(`Error deleting sale: ${err.response?.data?.msg || err.message}`)
    }
  }

  const displayedSales = sales

  const productSummary = (sale) => {
    const products = sale.products || sale.items || []
    if (products.length === 0) return '—'
    return products.map((product, index) => (
      <div key={`${product.item_id}-${index}`} className="whitespace-nowrap">
        {product.item_name || 'N/A'} <span className="text-gray-500">× {product.qty}</span>
      </div>
    ))
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-black">Credit Sales</h1>
      </div>
      <div className="mb-4 flex gap-3 border-b border-gray-200 dark:border-gray-700">
        <button
          onClick={() => setActiveSection('unpaid')}
          className={`px-5 py-3 font-bold text-sm border-b-2 transition-colors ${activeSection === 'unpaid' ? 'border-amber-500 text-amber-600 dark:text-amber-400' : 'border-transparent text-gray-500 hover:text-gray-900 dark:hover:text-white'}`}
        >
          Unpaid Sales
        </button>
        <button
          onClick={() => setActiveSection('paid')}
          className={`px-5 py-3 font-bold text-sm border-b-2 transition-colors ${activeSection === 'paid' ? 'border-green-500 text-green-600 dark:text-green-400' : 'border-transparent text-gray-500 hover:text-gray-900 dark:hover:text-white'}`}
        >
          Paid Sales
        </button>
      </div>
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border p-4 overflow-x-auto">
        {loading ? (
          <div className="p-8 text-center">Loading...</div>
        ) : loadError ? (
          <div className="p-8 text-center">
            <p className="mb-4 text-red-600 dark:text-red-400">{loadError}</p>
            <button
              type="button"
              onClick={() => fetchSales(page)}
              className="rounded-lg bg-blue-600 px-4 py-2 font-bold text-white hover:bg-blue-700"
            >
              Retry
            </button>
          </div>
        ) : displayedSales.length === 0 ? (
          <div className="p-8 text-center">No {activeSection} credit sales found.</div>
        ) : (
          <>
          <div className="space-y-3 md:hidden">
            {displayedSales.map((sale) => (
              <MobileSaleCard
                key={sale.id}
                sale={sale}
                additionalDetails={<>
                  <div className="grid grid-cols-[auto_1fr] gap-x-3"><span className="font-medium text-gray-500 dark:text-gray-400">Customer:</span><span className="text-right font-semibold text-gray-800 dark:text-gray-100">{sale.customer_name || '—'}</span></div>
                  <div className="grid grid-cols-[auto_1fr] gap-x-3"><span className="font-medium text-gray-500 dark:text-gray-400">Contact:</span><span className="text-right font-semibold text-gray-800 dark:text-gray-100">{sale.customer_phone || '—'}</span></div>
                  <div className="grid grid-cols-[auto_1fr] gap-x-3"><span className="font-medium text-gray-500 dark:text-gray-400">Status:</span><span className="text-right font-bold uppercase text-gray-800 dark:text-gray-100">{sale.status || '—'}</span></div>
                </>}
                actions={<>
                  {sale.status !== 'paid' && <button onClick={() => handlePay(sale)} className="flex flex-1 items-center justify-center gap-1 rounded-lg border border-green-300 px-3 py-2 text-xs font-bold text-green-600"><Wallet size={14} /> PAY</button>}
                  {user?.role === 'admin' && <><button onClick={() => setEditingSale(sale)} className="rounded-lg border border-amber-300 p-2 text-amber-600" title="Edit credit sale"><Edit size={16} /></button><button onClick={() => handleDelete(sale)} className="rounded-lg border border-red-300 p-2 text-red-600" title="Delete credit sale"><Trash2 size={16} /></button></>}
                  {sale.receipt_uuid && <a href={`${API_BASE}/receipts/${sale.receipt_uuid}`} target="_blank" rel="noreferrer" className="rounded-lg border border-blue-300 p-2 text-blue-600" title="View receipt"><FileText size={16} /></a>}
                </>}
              />
            ))}
          </div>
          <table className="hidden w-full text-sm md:table">
            <thead className="text-xs text-gray-500 uppercase">
              <tr>
                <th className="px-4 py-2 text-left">ID</th>
                <th className="px-4 py-2 text-left">Shop</th>
                <th className="px-4 py-2 text-left">Attendant</th>
                <th className="px-4 py-2 text-left">Customer</th>
                <th className="px-4 py-2 text-left">Contact</th>
                <th className="px-4 py-2 text-left">Product(s)</th>
                <th className="px-4 py-2 text-right">Total</th>
                <th className="px-4 py-2 text-right">Paid</th>
                <th className="px-4 py-2 text-right">Remaining</th>
                <th className="px-4 py-2 text-left">Status</th>
                <th className="px-4 py-2 text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {displayedSales.map(c => (
                <tr key={c.id} className="border-t">
                  <td className="px-4 py-3">#{c.id}</td>
                  <td className="px-4 py-3">{c.shop_name}</td>
                  <td className="px-4 py-3">{c.attendant_name}</td>
                  <td className="px-4 py-3 font-medium">{c.customer_name || '—'}</td>
                  <td className="px-4 py-3">{c.customer_phone || '—'}</td>
                  <td className="px-4 py-3">{productSummary(c)}</td>
                  <td className="px-4 py-3 text-right">KES {Number(c.total_amount).toLocaleString()}</td>
                  <td className="px-4 py-3 text-right">KES {Number(c.paid_amount).toLocaleString()}</td>
                  <td className="px-4 py-3 text-right font-bold">KES {Number(c.remaining).toLocaleString()}</td>
                  <td className="px-4 py-3">{c.status?.toUpperCase()}</td>
                  <td className="px-4 py-3 text-center">
                    <div className="flex items-center justify-center gap-2">
                      {c.status !== 'paid' && (
                        <button onClick={() => handlePay(c)} className="bg-green-50 text-green-600 px-3 py-1 rounded-lg inline-flex items-center gap-2" title="Record payment">
                          <Wallet size={14} /> PAY
                        </button>
                      )}
                      {user?.role === 'admin' && (
                        <>
                          <button
                            onClick={() => setEditingSale(c)}
                            className="bg-amber-50 text-amber-600 p-2 rounded-lg hover:bg-amber-600 hover:text-white transition-all"
                            title="Edit credit sale"
                          >
                            <Edit size={16} />
                          </button>
                          <button
                            onClick={() => handleDelete(c)}
                            className="bg-red-50 text-red-600 p-2 rounded-lg hover:bg-red-600 hover:text-white transition-all"
                            title="Delete credit sale and restore stock"
                          >
                            <Trash2 size={16} />
                          </button>
                        </>
                      )}
                      {c.receipt_uuid && (
                        <a href={`${API_BASE}/receipts/${c.receipt_uuid}`} target="_blank" rel="noreferrer" className="text-blue-600" title="View receipt">
                          <FileText size={14} />
                        </a>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          </>
        )}
      </div>
      <Pagination pagination={pagination} onPageChange={(nextPage) => fetchSales(nextPage)} />
      {editingSale && (
        <EditSaleModal
          sale={editingSale}
          onClose={() => setEditingSale(null)}
          onUpdate={fetchSales}
        />
      )}
    </div>
  )
}
