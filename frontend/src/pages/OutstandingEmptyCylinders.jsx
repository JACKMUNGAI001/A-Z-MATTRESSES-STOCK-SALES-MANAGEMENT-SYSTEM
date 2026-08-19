import { useEffect, useState } from 'react'
import api from '../api/api'
import { Cylinder, CheckCircle2 } from 'lucide-react'

function MobileOutstandingCylinderCard({ row, quantities, setQuantities, onReceive }) {
  return (
    <article className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-800">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="font-black text-red-600 dark:text-red-400">{row.item_name}</h3>
          <p className="mt-0.5 text-sm font-medium text-gray-500 dark:text-gray-400">
            <span className="font-bold">Shop:</span> {row.shop_name}
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            <span className="font-bold">Customer:</span> {row.customer_name}
          </p>
          {row.customer_phone && (
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {row.customer_phone}
            </p>
          )}
        </div>
        <div className="shrink-0 text-right">
          <span className="inline-flex rounded-md border border-red-200 bg-red-50 px-2.5 py-1 text-xs font-black text-red-700 dark:border-red-700 dark:bg-red-900/40 dark:text-red-300">
            Outstanding: {row.outstanding_qty}
          </span>
          <p className="text-[10px] font-bold text-gray-500 dark:text-gray-400 mt-1">
            {new Date(row.created_at).toLocaleDateString()}
          </p>
        </div>
      </div>

      <div className="mt-4 space-y-3">
        <div>
          <label className="block text-[10px] font-black text-gray-400 uppercase mb-1 tracking-widest">Qty to Receive</label>
          <input
            className="w-full rounded border p-2 text-center text-sm font-bold"
            type="number"
            min="1"
            max={row.outstanding_qty}
            value={quantities[row.id] || ''}
            onChange={e => setQuantities({ ...quantities, [row.id]: e.target.value })}
          />
        </div>
        <button
          onClick={() => onReceive(row)}
          className="w-full inline-flex items-center justify-center gap-1 rounded-lg bg-green-600 px-3 py-2 text-xs font-bold text-white"
        >
          <CheckCircle2 size={14} /> Receive Return
        </button>
      </div>
    </article>
  )
}

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
      {loading ? <div className="p-10 text-center text-gray-400">Loading outstanding cylinders...</div> : error ? <div className="p-10 text-center text-red-600">{error}</div> : rows.length === 0 ? <div className="p-10 text-center text-gray-400">All recorded gas-cylinder exchanges are complete.</div> : <>
        <div className="md:hidden space-y-3 p-3">
          {rows.map(row => (
            <MobileOutstandingCylinderCard
              key={row.id}
              row={row}
              quantities={quantities}
              setQuantities={setQuantities}
              onReceive={receive}
            />
          ))}
        </div>
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full min-w-[850px]">
            <thead className="bg-gray-50 dark:bg-gray-900">
              <tr>
                <th className="p-4 text-left text-xs uppercase text-gray-500">Date</th>
                <th className="p-4 text-left text-xs uppercase text-gray-500">Shop</th>
                <th className="p-4 text-left text-xs uppercase text-gray-500">Customer</th>
                <th className="p-4 text-left text-xs uppercase text-gray-500">Cylinder</th>
                <th className="p-4 text-center text-xs uppercase text-gray-500">Outstanding</th>
                <th className="p-4 text-center text-xs uppercase text-gray-500">Receive return</th>
              </tr>
            </thead>
            <tbody>
              {rows.map(row => (
                <tr key={row.id} className="border-t dark:border-gray-700">
                  <td className="p-4 text-sm">{new Date(row.created_at).toLocaleDateString()}</td>
                  <td className="p-4 font-semibold">{row.shop_name}</td>
                  <td className="p-4">
                    <div>{row.customer_name}</div>
                    {row.customer_phone && <div className="text-xs text-gray-500">{row.customer_phone}</div>}
                  </td>
                  <td className="p-4">{row.item_name}</td>
                  <td className="p-4 text-center font-black text-red-600">{row.outstanding_qty}</td>
                  <td className="p-4">
                    <div className="flex justify-center gap-2">
                      <input type="number" min="1" max={row.outstanding_qty} value={quantities[row.id] || ''} onChange={e=>setQuantities({...quantities,[row.id]:e.target.value})} className="w-20 rounded border p-2 text-center"/>
                      <button onClick={()=>receive(row)} className="inline-flex items-center gap-1 rounded-lg bg-green-600 px-3 py-2 text-xs font-bold text-white"><CheckCircle2 size={14}/> Receive</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </>}
    </div>
  </div>
}
