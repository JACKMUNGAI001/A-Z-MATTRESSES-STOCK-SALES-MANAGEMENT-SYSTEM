import React, { useEffect, useState } from 'react'
import api from '../api/api'
import { Store, SearchX, TrendingUp } from 'lucide-react'

export default function GlobalInventory(){
  const [globalStock, setGlobalStock] = useState([])
  const [shops, setShops] = useState([])
  const [loading, setLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState(null)

  useEffect(() => {
    const fetchData = async () => {
      setErrorMessage(null)
      try {
        const shopsRes = await api.get('/shops')
        const shopsData = shopsRes.data || []
        setShops(shopsData)

        // Fetch stocks per shop to avoid relying on single heavy endpoint
        const allStocks = []
        await Promise.all(shopsData.map(async (s) => {
          try {
            const res = await api.get(`/stocks/${s.id}`)
            // Match stock to its shop by ID, not its display name. Shop names can
            // be edited or formatted differently, while IDs remain stable.
            allStocks.push(...(res.data || []).map(item => ({ ...item, shop_id: s.id })))
          } catch (err) {
            console.warn('Failed to fetch stocks for shop', s.id, err)
          }
        }))

        setGlobalStock(allStocks)
      } catch (err) {
        console.error('Error fetching shops or stock', err)
        setErrorMessage('Failed to load inventory. Please check your connection or permissions.')
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  const filteredStockForShop = (shopId) => globalStock.filter(stock => String(stock.shop_id) === String(shopId))

  return (
    <div className="p-6">
      <div className="mb-6 flex items-center gap-3">
        <TrendingUp size={28} className="text-blue-600" />
        <h1 className="text-2xl font-black">Global Stock Overview</h1>
      </div>

      {loading ? (
        <div className="p-10 text-center text-gray-400">Loading inventory...</div>
      ) : errorMessage ? (
        <div className="p-10 text-center text-red-600 dark:text-red-400">{errorMessage}</div>
      ) : shops.length === 0 ? (
        <div className="p-10 text-center text-gray-400">No shops found.</div>
      ) : (
        <div className="flex flex-col gap-6">
          {shops.map((shop) => {
            const shopStock = filteredStockForShop(shop.id)
            return (
              <div key={shop.id} className="w-full bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm overflow-hidden flex flex-col group hover:border-blue-200 dark:hover:border-blue-900/50 transition-all">
                <div className="p-4 bg-gray-50/50 dark:bg-gray-900/50 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center group-hover:bg-blue-50/30 dark:group-hover:bg-blue-900/10 transition-colors">
                   <h4 className="font-bold text-gray-800 dark:text-white flex items-center gap-2 uppercase tracking-tighter">
                     <Store size={16} className="text-blue-600 dark:text-blue-400" />
                     {shop.name}
                   </h4>
                   <span className="bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-400 px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-widest">{shopStock.length} items</span>
                </div>
                <div className="flex-1 overflow-y-auto max-h-[350px] custom-scrollbar">
                   {shopStock.length === 0 ? (
                     <div className="p-10 text-center flex flex-col items-center gap-2">
                       <SearchX size={24} className="text-gray-200 dark:text-gray-700" />
                       <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">No matching items</p>
                     </div>
                   ) : (
                     <table className="min-w-full divide-y divide-gray-100 dark:divide-gray-700 border-separate border-spacing-0">
                       <thead className="bg-gray-50/80 dark:bg-gray-900/80 sticky top-0 z-10 backdrop-blur-md">
                         <tr>
                            <th className="px-4 py-3 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest border-b border-gray-100 dark:border-gray-700">Item</th>
                            <th className="px-4 py-3 text-center text-[10px] font-black text-gray-400 uppercase tracking-widest border-b border-gray-100 dark:border-gray-700">Qty</th>
                         </tr>
                       </thead>
                       <tbody className="divide-y divide-gray-50 dark:divide-gray-700">
                          {shopStock.map((stock, idx) => (
                            <tr key={idx} className="hover:bg-blue-50/20 dark:hover:bg-blue-900/5 transition-colors group/row">
                              <td className="px-4 py-3 text-xs font-bold text-gray-900 dark:text-white group-hover/row:text-blue-600 dark:group-hover/row:text-blue-400 transition-colors">{stock.item_name}</td>
                              <td className="px-4 py-3 text-center"><span className={`px-2 py-0.5 rounded text-[10px] font-black tracking-tighter ${stock.qty <= 5 ? 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400' : 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'}`}>{stock.qty}</span></td>
                            </tr>
                          ))}
                       </tbody>
                     </table>
                   )}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
