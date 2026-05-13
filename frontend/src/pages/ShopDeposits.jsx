import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import api from '../api/api'
import { formatCurrency, formatDate } from '../utils/helpers'

export default function ShopDeposits(){
  const { shopId } = useParams()
  const [deposits, setDeposits] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await api.get(`/deposits/shop/${shopId}`)
        setDeposits(res.data)
      } catch (err){
        console.error('Error fetching deposits', err)
      } finally { setLoading(false) }
    }
    fetch()
  }, [shopId])

  return (
    <div className="p-6">
      <h1 className="text-2xl font-black mb-4">Customer Deposits</h1>
      {loading ? <div className="p-6">Loading...</div> : (
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border p-4 overflow-auto">
          {deposits.length === 0 ? <div className="p-10 text-center text-gray-400">No deposits yet.</div> : (
            <table className="w-full text-left">
              <thead className="text-xs text-gray-500 uppercase font-black">
                <tr><th className="px-4 py-2">ID</th><th className="px-4 py-2">Buyer</th><th className="px-4 py-2">Item</th><th className="px-4 py-2">Amount</th><th className="px-4 py-2">Paid On</th></tr>
              </thead>
              <tbody>
                {deposits.map(d => (
                  <tr key={d.id} className="border-t border-gray-100 dark:border-gray-700">
                    <td className="px-4 py-2 font-bold">{d.id}</td>
                    <td className="px-4 py-2">{d.buyer_name}</td>
                    <td className="px-4 py-2">{d.item_name}</td>
                    <td className="px-4 py-2 font-black">{formatCurrency(d.total_paid)}</td>
                    <td className="px-4 py-2">{formatDate(d.created_at)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}
    </div>
  )
}
