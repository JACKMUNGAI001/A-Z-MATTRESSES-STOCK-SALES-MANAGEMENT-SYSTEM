import { useEffect, useState } from 'react'
import api from '../api/api'
import { Cylinder, CheckCircle2 } from 'lucide-react'

export default function OutstandingEmptyCylinders() {
  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(true)
  const [quantities, setQuantities] = useState({})
  const [error, setError] = useState('')
  const load = async () => { setLoading(true); setError(''); try { const response = await api.get('/stocks/empty-cylinders/outstanding'); setRows(response.data) } catch (e) { setError(e.response?.data?.msg || 'Unable to load outstanding cylinders.') } finally { setLoading(false) } }
  useEffect(() => { load() }, [])
  const receive = async (row) => {
    const qty = Number(quantities[row.id] || 0)
    if (!Number.isInteger(qty) || qty <= 0 || qty > row.outstanding_qty) return alert('Enter a whole quantity that is still outstanding.')
    try { await api.post(`/stocks/empty-cylinders/outstanding/${row.id}/return`, { qty }); await load() } catch (e) { alert(e.response?.data?.msg || 'Unable to receive the returned cylinders.') }
  }
  return <div>
    <div className="mb-6 flex items-center gap-3"><Cylinder className="text-red-600" size={30}/><div><h1 className="text-2xl font-black">Empty Cylinders Not Returned</h1><p className="text-sm text-gray-500">Gas cylinders sold without an empty cylinder being returned.</p></div></div>
    <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800">
      {loading ? <div className="p-10 text-center text-gray-400">Loading outstanding cylinders...</div> : error ? <div className="p-10 text-center text-red-600">{error}</div> : rows.length === 0 ? <div className="p-10 text-center text-gray-400">All recorded gas-cylinder exchanges are complete.</div> : <div className="overflow-x-auto"><table className="w-full min-w-[850px]"><thead className="bg-gray-50 dark:bg-gray-900"><tr><th className="p-4 text-left text-xs uppercase text-gray-500">Date</th><th className="p-4 text-left text-xs uppercase text-gray-500">Shop</th><th className="p-4 text-left text-xs uppercase text-gray-500">Customer</th><th className="p-4 text-left text-xs uppercase text-gray-500">Cylinder</th><th className="p-4 text-center text-xs uppercase text-gray-500">Outstanding</th><th className="p-4 text-center text-xs uppercase text-gray-500">Receive return</th></tr></thead><tbody>{rows.map(row => <tr key={row.id} className="border-t dark:border-gray-700"><td className="p-4 text-sm">{new Date(row.created_at).toLocaleDateString()}</td><td className="p-4 font-semibold">{row.shop_name}</td><td className="p-4"><div>{row.customer_name}</div>{row.customer_phone && <div className="text-xs text-gray-500">{row.customer_phone}</div>}</td><td className="p-4">{row.item_name}</td><td className="p-4 text-center font-black text-red-600">{row.outstanding_qty}</td><td className="p-4"><div className="flex justify-center gap-2"><input type="number" min="1" max={row.outstanding_qty} value={quantities[row.id] || ''} onChange={e=>setQuantities({...quantities,[row.id]:e.target.value})} className="w-20 rounded border p-2 text-center"/><button onClick={()=>receive(row)} className="inline-flex items-center gap-1 rounded-lg bg-green-600 px-3 py-2 text-xs font-bold text-white"><CheckCircle2 size={14}/> Receive</button></div></td></tr>)}</tbody></table></div>}
    </div>
  </div>
}
