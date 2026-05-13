import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import api from '../api/api'
import { formatCurrency } from '../utils/helpers'

export default function ShopLowStock(){
  const { shopId } = useParams()
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await api.get(`/stocks/${shopId}`)
        const low = res.data.filter(s => s.qty <= 2)
        setItems(low)
      } catch (err){
        console.error('Error fetching low stock items', err)
      } finally { setLoading(false) }
    }
    fetch()
  }, [shopId])

  return (
    <div className="p-6">
      <h1 className="text-2xl font-black mb-4">Low Stock Alerts</h1>
      {loading ? <div className="p-6">Loading...</div> : (
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border p-4 overflow-auto">
          {items.length === 0 ? <div className="p-10 text-center text-gray-400">No low stock items.</div> : (
            <table className="w-full text-left">
              <thead className="text-xs text-gray-500 uppercase font-black">
                <tr><th className="px-4 py-2">Item</th><th className="px-4 py-2">Qty</th><th className="px-4 py-2">Cost</th></tr>
              </thead>
              <tbody>
                {items.map(s => (
                  <tr key={s.item_id} className="border-t border-gray-100 dark:border-gray-700">
                    <td className="px-4 py-2 font-bold">{s.item_name || s.item_id}</td>
                    <td className="px-4 py-2 font-black">{s.qty}</td>
                    <td className="px-4 py-2">{formatCurrency(s.buy_price)}</td>
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
