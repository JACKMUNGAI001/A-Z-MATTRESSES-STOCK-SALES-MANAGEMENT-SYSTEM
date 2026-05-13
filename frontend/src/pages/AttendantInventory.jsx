import React, { useContext, useEffect, useState } from 'react'
import { AuthContext } from '../context/AuthContext'
import api from '../api/api'
import { SearchX, TrendingUp } from 'lucide-react'

export default function AttendantInventory(){
  const { user } = useContext(AuthContext)
  const [shopStock, setShopStock] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetch = async () => {
      try {
        if (!user?.shop_id) return
        const res = await api.get(`/stocks/${user.shop_id}`)
        setShopStock(res.data)
      } catch (err) {
        console.error('Error fetching shop stock', err)
      } finally { setLoading(false) }
    }
    fetch()
  }, [user?.shop_id])

  return (
    <div className="p-6">
      <div className="mb-6 flex items-center gap-3">
        <TrendingUp size={28} className="text-blue-600" />
        <h1 className="text-2xl font-black">Current Inventory</h1>
      </div>

      {loading ? (
        <div className="p-10 text-center text-gray-400">Loading inventory...</div>
      ) : shopStock.length === 0 ? (
        <div className="bg-white dark:bg-gray-800 p-10 rounded-2xl shadow-sm border border-dashed border-gray-300 dark:border-gray-700 text-center text-gray-400 dark:text-gray-500">No stock items recorded for your shop yet.</div>
      ) : (
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden transition-colors">
          <table className="min-w-full divide-y divide-gray-100 dark:divide-gray-700">
            <thead>
              <tr className="bg-gray-50/50 dark:bg-gray-900/50">
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest">Item Name</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest">Quantity</th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800">
              {shopStock.map((stock) => (
                <tr key={stock.item_id} className="hover:bg-gray-50/50 dark:hover:bg-gray-900/50">
                  <td className="px-6 py-4 font-bold text-gray-900 dark:text-white">{stock.item_name}</td>
                  <td className="px-6 py-4"><span className={`px-3 py-1 rounded-full text-sm font-bold ${stock.qty <= 2 ? 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400' : 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'}`}>{stock.qty}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
