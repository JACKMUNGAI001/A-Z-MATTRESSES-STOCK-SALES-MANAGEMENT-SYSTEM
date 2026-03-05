import React, { useState, useEffect, useContext } from 'react'
import { fetchSupplierInvoices, fetchSuppliers, createSupplierInvoice, fetchSupplierInvoiceDetails, updateSupplierInvoiceStatus } from '../api/api'
import api from '../api/api'
import Card from '../components/Card'
import { Plus, Eye, FileText, Calendar, DollarSign, Truck, Package, Search, CheckCircle, SearchX } from 'lucide-react'
import { SearchContext } from '../context/SearchContext'

export default function AdminSupplierInvoices() {
  const [invoices, setInvoices] = useState([])
  const [suppliers, setSuppliers] = useState([])
  const [items, setItems] = useState([])
  const [shops, setShops] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [showDetails, setShowDetails] = useState(null)
  const [activeTab, setActiveTab] = useState('Pending')
  const { searchQuery } = useContext(SearchContext)
  
  const [formData, setFormData] = useState({
    supplier_id: '',
    invoice_number: '',
    shop_id: 1,
    received_date: new Date().toISOString().split('T')[0],
    due_date: '',
    notes: '',
    items: [{ item_id: '', quantity: 0, unit_cost: 0 }]
  })

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      const [invRes, supRes, itemRes, shopRes] = await Promise.all([
        fetchSupplierInvoices(),
        fetchSuppliers(),
        api.get('/items/'),
        api.get('/shops/')
      ])
      setInvoices(invRes.data)
      setSuppliers(supRes.data)
      setItems(itemRes.data)
      setShops(shopRes.data)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleSettle = async (id) => {
    if (!window.confirm("Mark this invoice as Settled?")) return
    try {
      await updateSupplierInvoiceStatus(id, 'Paid')
      loadData()
    } catch (err) {
      alert("Error updating status")
    }
  }

  const handleAddItem = () => {
    setFormData({
      ...formData,
      items: [...formData.items, { item_id: '', quantity: 0, unit_cost: 0 }]
    })
  }

  const handleRemoveItem = (index) => {
    const newItems = formData.items.filter((_, i) => i !== index)
    setFormData({ ...formData, items: newItems })
  }

  const handleItemChange = (index, field, value) => {
    const newItems = [...formData.items]
    newItems[index][field] = value
    setFormData({ ...formData, items: newItems })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!formData.supplier_id || !formData.invoice_number || formData.items.some(it => !it.item_id)) {
      alert("Please fill all required fields")
      return
    }
    if (formData.items.some(it => parseInt(it.quantity) <= 0)) {
      alert("Please enter a valid quantity for all items")
      return
    }
    try {
      await createSupplierInvoice(formData)
      setShowModal(false)
      setFormData({
        supplier_id: '',
        invoice_number: '',
        shop_id: 1,
        received_date: new Date().toISOString().split('T')[0],
        due_date: '',
        notes: '',
        items: [{ item_id: '', quantity: 0, unit_cost: 0 }]
      })
      loadData()
    } catch (err) {
      alert(err.response?.data?.msg || "Error creating invoice")
    }
  }

  const viewDetails = async (id) => {
    try {
      const res = await fetchSupplierInvoiceDetails(id)
      setShowDetails(res.data)
    } catch (err) {
      alert("Error fetching details")
    }
  }

  const filteredInvoices = invoices.filter(inv => {
    const statusMatch = inv.status === activeTab || (activeTab === 'Pending' && inv.status === 'Partial');
    const searchMatch = searchQuery ? (
      inv.invoice_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
      inv.supplier_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      inv.items?.some(item => item.item_name.toLowerCase().includes(searchQuery.toLowerCase()))
    ) : true;
    return statusMatch && searchMatch;
  });

  return (
    <>
      <div className="flex justify-between items-center mb-6">
        <div>
            <h2 className="text-xl font-semibold dark:text-white transition-colors">Track Product Supplies</h2>
            {searchQuery && <p className="text-sm text-blue-500 font-medium transition-all">Searching for: "{searchQuery}"</p>}
        </div>
        <button 
          onClick={() => setShowModal(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700 transition-colors shadow-sm"
        >
          <Plus size={20} />
          Record New Supply
        </button>
      </div>

      <div className="flex gap-4 mb-6 border-b border-gray-200 dark:border-gray-700">
        <button 
          onClick={() => setActiveTab('Pending')}
          className={`pb-2 px-4 font-bold transition-all ${activeTab === 'Pending' ? 'border-b-4 border-blue-600 text-blue-600' : 'text-gray-500 hover:text-gray-700 dark:text-gray-400'}`}
        >
          Pending Invoices
        </button>
        <button 
          onClick={() => setActiveTab('Paid')}
          className={`pb-2 px-4 font-bold transition-all ${activeTab === 'Paid' ? 'border-b-4 border-blue-600 text-blue-600' : 'text-gray-500 hover:text-gray-700 dark:text-gray-400'}`}
        >
          Settled Invoices
        </button>
      </div>

      {loading ? (
        <p className="dark:text-white">Loading...</p>
      ) : (
        <Card className="overflow-hidden dark:bg-gray-800 dark:border-gray-700 transition-colors">
          <div className="overflow-x-auto">
            {filteredInvoices.length === 0 ? (
                <div className="px-6 py-12 text-center transition-colors">
                    <SearchX size={48} className="mx-auto text-gray-300 dark:text-gray-600 mb-4" />
                    <p className="text-gray-500 dark:text-gray-400 font-bold uppercase tracking-widest text-sm">No {activeTab.toLowerCase()} invoices matches "{searchQuery}".</p>
                </div>
            ) : (
                <table className="w-full text-left">
                <thead className="bg-gray-50 dark:bg-gray-900/50 border-b dark:border-gray-700 transition-colors">
                  <tr>
                    <th className="px-6 py-4 font-semibold text-gray-700 dark:text-gray-300">Invoice #</th>
                    <th className="px-6 py-4 font-semibold text-gray-700 dark:text-gray-300">Supplier</th>
                    <th className="px-6 py-4 font-semibold text-gray-700 dark:text-gray-300">Date</th>
                    <th className="px-6 py-4 font-semibold text-gray-700 dark:text-gray-300">Amount</th>
                    <th className="px-6 py-4 font-semibold text-gray-700 dark:text-gray-300">Status</th>
                    <th className="px-6 py-4 font-semibold text-gray-700 dark:text-gray-300">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-700 transition-colors">
                  {filteredInvoices.map(inv => (
                    <tr key={inv.id} className="hover:bg-gray-50 dark:hover:bg-gray-900/30 transition-colors">
                      <td className={`px-6 py-4 font-medium transition-colors ${searchQuery && inv.invoice_number.toLowerCase().includes(searchQuery.toLowerCase()) ? 'text-green-600 dark:text-green-400' : 'text-blue-600 dark:text-blue-400'}`}>{inv.invoice_number}</td>
                      <td className={`px-6 py-4 transition-colors ${searchQuery && inv.supplier_name.toLowerCase().includes(searchQuery.toLowerCase()) ? 'text-blue-600 dark:text-blue-400 font-bold' : 'text-gray-700 dark:text-gray-300'}`}>{inv.supplier_name}</td>
                      <td className="px-6 py-4 text-gray-600 dark:text-gray-400">
                          <div className="flex flex-col">
                              <span>{new Date(inv.received_date).toLocaleDateString()}</span>
                              {inv.due_date && <span className="text-xs text-red-500 font-medium">Due: {new Date(inv.due_date).toLocaleDateString()}</span>}
                          </div>
                      </td>
                      <td className="px-6 py-4 font-bold text-gray-900 dark:text-white transition-colors">KES {inv.total_amount.toLocaleString()}</td>
                      <td className="px-6 py-4">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                          inv.status === 'Paid' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 
                          inv.status === 'Partial' ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400' : 
                          'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                        }`}>
                          {inv.status}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex gap-2">
                          <button 
                            onClick={() => viewDetails(inv.id)}
                            className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 p-2 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-full transition-colors flex items-center gap-1 text-sm font-medium"
                            title="View Details"
                          >
                            <Eye size={18} />
                          </button>
                          {inv.status !== 'Paid' && (
                            <button 
                              onClick={() => handleSettle(inv.id)}
                              className="text-green-600 dark:text-green-400 hover:text-green-800 dark:hover:text-blue-300 p-2 hover:bg-green-50 dark:hover:bg-blue-900/30 rounded-full transition-colors flex items-center gap-1 text-sm font-medium"
                              title="Mark as Settled"
                            >
                              <CheckCircle size={18} />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </Card>
      )}

      {/* CREATE MODAL */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in duration-200 transition-colors">
            <div className="bg-blue-600 p-6 text-white sticky top-0 z-10">
              <h3 className="text-xl font-bold">Record New Supply</h3>
              <p className="text-blue-100 text-sm mt-1">Add items received from a supplier</p>
            </div>
            
            <form onSubmit={handleSubmit} className="p-8 space-y-8">
              {/* Header Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div>
                  <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2 transition-colors">
                      <Truck size={16} className="text-blue-500" />
                      Supplier *
                  </label>
                  <select 
                    required
                    className="w-full border-gray-300 dark:border-gray-600 dark:bg-gray-900 dark:text-white rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                    value={formData.supplier_id}
                    onChange={e => setFormData({...formData, supplier_id: e.target.value})}
                  >
                    <option value="">Select Supplier</option>
                    {suppliers.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 dark:text-gray-400 uppercase mb-2 flex items-center gap-2 transition-colors">
                      <FileText size={16} className="text-blue-500" />
                      Invoice Number *
                  </label>
                  <input 
                    required
                    type="text" 
                    className="w-full border-gray-300 dark:border-gray-600 dark:bg-gray-900 dark:text-white rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                    value={formData.invoice_number}
                    onChange={e => setFormData({...formData, invoice_number: e.target.value})}
                    placeholder="INV-2024-001"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2 transition-colors">
                      <Calendar size={16} className="text-blue-500" />
                      Received Date *
                  </label>
                  <input 
                    required
                    type="date" 
                    className="w-full border-gray-300 dark:border-gray-600 dark:bg-gray-900 dark:text-white rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                    value={formData.received_date}
                    onChange={e => setFormData({...formData, received_date: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2 transition-colors">
                      <Package size={16} className="text-blue-500" />
                      Destination Shop
                  </label>
                  <select 
                    className="w-full border-gray-300 dark:border-gray-600 dark:bg-gray-900 dark:text-white rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                    value={formData.shop_id}
                    onChange={e => setFormData({...formData, shop_id: e.target.value})}
                  >
                    {shops.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                  </select>
                </div>
              </div>

              {/* Items Table */}
              <div className="space-y-4">
                <div className="flex justify-between items-center border-b dark:border-gray-700 pb-2 transition-colors">
                    <h4 className="text-lg font-bold text-gray-800 dark:text-white flex items-center gap-2 transition-colors">
                        <Package size={20} className="text-blue-500" />
                        Supply Items
                    </h4>
                    <button 
                        type="button" 
                        onClick={handleAddItem}
                        className="text-sm bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 px-3 py-1.5 rounded-lg font-bold hover:bg-blue-100 dark:hover:bg-blue-900/50 transition-colors flex items-center gap-1"
                    >
                        <Plus size={16} /> Add Item
                    </button>
                </div>
                
                <div className="space-y-4">
                  {formData.items.map((item, idx) => (
                    <div key={idx} className="flex flex-wrap md:flex-nowrap gap-4 items-end bg-gray-50 dark:bg-gray-900/30 p-4 rounded-xl relative border border-gray-100 dark:border-gray-700 transition-colors">
                      <div className="flex-1 min-w-[200px]">
                        <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 mb-1">Select Product</label>
                        <select 
                          required
                          className="w-full border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-white rounded-lg p-2 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                          value={item.item_id}
                          onChange={e => handleItemChange(idx, 'item_id', e.target.value)}
                        >
                          <option value="">Select Item</option>
                          {items.map(it => <option key={it.id} value={it.id}>{it.name}</option>)}
                        </select>
                      </div>
                      <div className="w-24">
                        <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 mb-1">Qty</label>
                        <input 
                          required
                          type="number" 
                          min="0"
                          className="w-full border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-white rounded-lg p-2 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                          value={item.quantity}
                          onChange={e => handleItemChange(idx, 'quantity', e.target.value)}
                        />
                      </div>
                      <div className="w-40">
                        <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 mb-1">Unit Cost (KES)</label>
                        <input 
                          required
                          type="number" 
                          step="0.01"
                          className="w-full border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-white rounded-lg p-2 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                          value={item.unit_cost}
                          onChange={e => handleItemChange(idx, 'unit_cost', e.target.value)}
                        />
                      </div>
                      <div className="w-40">
                        <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 mb-1">Subtotal</label>
                        <div className="p-2 bg-gray-100 dark:bg-gray-800 rounded-lg text-gray-600 dark:text-gray-300 font-bold border border-gray-200 dark:border-gray-700 transition-colors">
                          {(item.quantity * item.unit_cost).toLocaleString()}
                        </div>
                      </div>
                      {formData.items.length > 1 && (
                        <button 
                          type="button" 
                          onClick={() => handleRemoveItem(idx)}
                          className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors"
                        >
                          <Plus size={20} style={{ transform: 'rotate(45deg)' }} />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex justify-between items-start pt-6 border-t dark:border-gray-700 transition-colors">
                <div className="w-1/2">
                    <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2 transition-colors">Notes</label>
                    <textarea 
                        className="w-full border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-white rounded-lg p-3 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                        rows="3"
                        value={formData.notes}
                        onChange={e => setFormData({...formData, notes: e.target.value})}
                        placeholder="Additional details about this supply..."
                    ></textarea>
                </div>
                <div className="text-right">
                    <p className="text-gray-500 dark:text-gray-400 text-sm mb-1 uppercase tracking-wider font-bold transition-colors">Total Supply Value</p>
                    <p className="text-4xl font-black text-blue-600 dark:text-blue-400 transition-colors">
                        KES {formData.items.reduce((sum, it) => sum + (it.quantity * it.unit_cost), 0).toLocaleString()}
                    </p>
                </div>
              </div>

              <div className="flex gap-4 pt-4">
                <button 
                  type="button" 
                  onClick={() => setShowModal(false)}
                  className="flex-1 px-6 py-3 border-2 border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 rounded-xl font-bold hover:bg-gray-50 dark:hover:bg-gray-700 transition-all"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-all shadow-xl shadow-blue-200 dark:shadow-none"
                >
                  Confirm & Save Supply
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DETAILS MODAL */}
      {showDetails && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden animate-in fade-in zoom-in duration-200 transition-colors">
            <div className="bg-blue-600 p-6 text-white flex justify-between items-center">
              <div>
                <h3 className="text-xl font-bold">Invoice Details</h3>
                <p className="text-blue-100"># {showDetails.invoice_number}</p>
              </div>
              <button onClick={() => setShowDetails(null)} className="text-white/80 hover:text-white">
                 <Plus size={24} style={{ transform: 'rotate(45deg)' }} />
              </button>
            </div>
            
            <div className="p-8 space-y-8">
                <div className="grid grid-cols-2 gap-8">
                    <div>
                        <p className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-1 transition-colors">Supplier</p>
                        <p className="text-lg font-bold text-gray-800 dark:text-white transition-colors">{showDetails.supplier_name}</p>
                    </div>
                    <div>
                        <p className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-1 transition-colors">Received Date</p>
                        <p className="text-lg font-bold text-gray-800 dark:text-white transition-colors">{new Date(showDetails.received_date).toLocaleDateString()}</p>
                    </div>
                </div>

                <div>
                    <p className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-4 transition-colors">Items Supplied</p>
                    <div className="bg-gray-50 dark:bg-gray-900 rounded-xl overflow-hidden border border-gray-100 dark:border-gray-700 transition-colors">
                        <table className="w-full text-left">
                            <thead className="bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 text-xs font-bold uppercase transition-colors">
                                <tr>
                                    <th className="px-4 py-3">Item</th>
                                    <th className="px-4 py-3 text-center">Qty</th>
                                    <th className="px-4 py-3 text-right">Cost</th>
                                    <th className="px-4 py-3 text-right">Total</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200 dark:divide-gray-700 transition-colors">
                                {showDetails.items.map(it => {
                                    const isMatch = searchQuery && it.item_name.toLowerCase().includes(searchQuery.toLowerCase());
                                    return (
                                        <tr key={it.id} className={isMatch ? 'bg-blue-50 dark:bg-blue-900/20' : ''}>
                                            <td className={`px-4 py-3 font-medium transition-colors ${isMatch ? 'text-blue-600 dark:text-blue-400 font-bold' : 'text-gray-700 dark:text-gray-300'}`}>{it.item_name}</td>
                                            <td className="px-4 py-3 text-center text-gray-600 dark:text-gray-400">{it.quantity}</td>
                                            <td className="px-4 py-3 text-right text-gray-600 dark:text-gray-400">{it.unit_cost.toLocaleString()}</td>
                                            <td className="px-4 py-3 text-right font-bold text-gray-900 dark:text-white">{it.total_cost.toLocaleString()}</td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                            <tfoot className="bg-gray-100 dark:bg-gray-800 font-black transition-colors">
                                <tr>
                                    <td colSpan="3" className="px-4 py-3 text-right text-gray-600 dark:text-gray-400 uppercase text-xs">Grand Total</td>
                                    <td className="px-4 py-3 text-right text-blue-600 dark:text-blue-400 text-lg">KES {showDetails.total_amount.toLocaleString()}</td>
                                </tr>
                            </tfoot>
                        </table>
                    </div>
                </div>

                {showDetails.notes && (
                    <div>
                        <p className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-1 transition-colors">Notes</p>
                        <p className="text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-900 p-4 rounded-lg border border-gray-100 dark:border-gray-700 transition-colors">{showDetails.notes}</p>
                    </div>
                )}

                <button 
                    onClick={() => setShowDetails(null)}
                    className="w-full py-3 bg-gray-800 dark:bg-gray-700 text-white rounded-xl font-bold hover:bg-gray-900 dark:hover:bg-gray-600 transition-colors"
                >
                    Close
                </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
